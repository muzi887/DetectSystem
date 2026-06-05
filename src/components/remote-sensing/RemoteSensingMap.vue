<template>
  <div
    ref="mapRef"
    class="remote-sensing-map"
    :class="{ 'remote-sensing-map--queryable': enableMoistureQuery }"
    role="application"
    :aria-label="mode === 'ndvi' ? 'NDVI 遥感地图' : '土壤墒情地图'" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  createLeafletBaseMap,
  invalidateLeafletSize,
  removeLeafletMap
} from '@/composables/useLeafletBase'
import {
  createMonitorPointLayer,
  type MonitorPointRecord
} from '@/composables/useMonitorPointLayer'
import { queryMoistureValue } from '@/api/remoteSensing'
import type { Alert } from '@/stores/data'
import type { MoistureQueryResult, RasterBounds } from '@/types/remoteSensing'

const props = defineProps<{
  mode: 'ndvi' | 'moisture'
  imageUrl: string
  bounds: RasterBounds
  opacity?: number
  compareImageUrl?: string
  compareOpacity?: number
  showMonitorPoints?: boolean
  enableMoistureQuery?: boolean
  monitorPoints?: MonitorPointRecord[]
  monitorAlerts?: Alert[]
}>()

const emit = defineEmits<{
  moistureQuery: [result: MoistureQueryResult]
}>()

const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let rasterOverlay: L.ImageOverlay | null = null
let compareOverlay: L.ImageOverlay | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null
let moisturePopup: L.Popup | null = null
let moisturePointerDown: L.Point | null = null
let moistureDownHandler: ((e: L.LeafletMouseEvent) => void) | null = null
let moistureClickHandler: ((e: L.LeafletMouseEvent) => void) | null = null

const DRAG_CLICK_THRESHOLD_PX = 5

/** 用 addTo 而非 openOn，避免与监测站 Popup 互斥（Leaflet 默认同时只能 openOn 一个） */
const MOISTURE_POPUP_OPTIONS: L.PopupOptions = {
  maxWidth: 300,
  autoPan: false,
  autoClose: false,
  closeOnClick: false
}

const viewByMode: Record<
  typeof props.mode,
  { center: L.LatLngExpression; zoom: number }
> = {
  ndvi: { center: [38.44, 115.95], zoom: 9 },
  moisture: { center: [37.9, 114.65], zoom: 10 }
}

function currentRasterOpacity() {
  return props.compareImageUrl ? 1 : (props.opacity ?? 0.92)
}

function compareRasterOpacity() {
  return props.compareOpacity ?? 0.5
}

function syncRasterOverlays(options: { fitView?: boolean } = {}) {
  if (!map || !props.imageUrl) return

  const hasCompare = Boolean(props.compareImageUrl)
  const { fitView = false } = options

  compareOverlay?.remove()
  compareOverlay = null

  rasterOverlay?.remove()
  rasterOverlay = L.imageOverlay(props.imageUrl, props.bounds, {
    opacity: currentRasterOpacity(),
    interactive: false
  }).addTo(map)

  if (hasCompare && props.compareImageUrl) {
    compareOverlay = L.imageOverlay(props.compareImageUrl, props.bounds, {
      opacity: compareRasterOpacity(),
      interactive: false
    }).addTo(map)
  }

  if (fitView) {
    map.fitBounds(props.bounds, { padding: [24, 24], maxZoom: 14 })
  }
}

function syncCompareOpacity() {
  compareOverlay?.setOpacity(compareRasterOpacity())
}

function syncMonitorPoints() {
  if (!map) return

  if (!props.showMonitorPoints) {
    monitorLayer?.detach()
    monitorLayer = null
    return
  }

  const points = props.monitorPoints ?? []
  const alerts = props.monitorAlerts ?? []

  if (!monitorLayer) {
    monitorLayer = createMonitorPointLayer(map, { readonly: true })
  }
  monitorLayer.render(points, alerts)
}

function formatMoistureSource(source: string) {
  return source === 'nearest-point' ? '最近监测点（演示）' : source
}

function buildMoisturePopupHtml(result: MoistureQueryResult) {
  return `
    <div class="leaflet-popup-content-themed">
      <div class="popup-title">墒情查询</div>
      <div class="popup-info">墒情: <strong>${result.moisture}%</strong></div>
      <div class="popup-info">来源: ${formatMoistureSource(result.source)}</div>
      <div class="popup-info">参考站: ${result.pointName}</div>
      <div class="popup-info">距离: ${result.distanceKm} km</div>
    </div>
  `
}

async function handleMoistureMapClick(e: L.LeafletMouseEvent) {
  if (!map || !props.enableMoistureQuery) return

  const { lat, lng } = e.latlng
  try {
    const { data } = await queryMoistureValue(lat, lng)
    moisturePopup?.remove()
    monitorLayer?.dismissHighlight()
    moisturePopup = L.popup(MOISTURE_POPUP_OPTIONS)
      .setLatLng(e.latlng)
      .setContent(buildMoisturePopupHtml(data))
      .addTo(map)
    if (data.nearestPointId != null) {
      monitorLayer?.highlightPoint(data.nearestPointId, { queryLatLng: e.latlng })
    }
    emit('moistureQuery', data)
  } catch {
    moisturePopup?.remove()
    monitorLayer?.dismissHighlight()
    moisturePopup = L.popup({ ...MOISTURE_POPUP_OPTIONS, maxWidth: 260 })
      .setLatLng(e.latlng)
      .setContent(`
        <div class="leaflet-popup-content-themed">
          <div class="popup-title">墒情查询</div>
          <div class="popup-info">查询失败，请确认 Mock 服务已启动。</div>
        </div>
      `)
      .addTo(map)
  }
}

function unbindMoistureQuery() {
  if (!map) return
  if (moistureDownHandler) {
    map.off('mousedown', moistureDownHandler)
    moistureDownHandler = null
  }
  if (moistureClickHandler) {
    map.off('click', moistureClickHandler)
    moistureClickHandler = null
  }
  moisturePointerDown = null
  moisturePopup?.remove()
  moisturePopup = null
  monitorLayer?.dismissHighlight()
}

function bindMoistureQuery() {
  if (!map) return
  unbindMoistureQuery()
  if (!props.enableMoistureQuery) return

  moistureDownHandler = (e) => {
    moisturePointerDown = map!.mouseEventToContainerPoint(e.originalEvent)
  }
  moistureClickHandler = (e) => {
    if (moisturePointerDown) {
      const up = map!.mouseEventToContainerPoint(e.originalEvent)
      if (moisturePointerDown.distanceTo(up) > DRAG_CLICK_THRESHOLD_PX) return
    }
    void handleMoistureMapClick(e)
  }
  map.on('mousedown', moistureDownHandler)
  map.on('click', moistureClickHandler)
}

async function initMap() {
  if (!mapRef.value || map) return
  const { center, zoom } = viewByMode[props.mode]
  map = createLeafletBaseMap(mapRef.value, {
    center,
    zoom,
    tile: 'gaodeSatellite',
    zoomControl: true
  })
  syncRasterOverlays({ fitView: true })
  syncMonitorPoints()
  bindMoistureQuery()
  invalidateLeafletSize(map, 150)
}

function invalidate() {
  invalidateLeafletSize(map)
}

onMounted(async () => {
  await nextTick()
  await initMap()
})

watch(
  () => [props.imageUrl, props.bounds, props.compareImageUrl] as const,
  () => {
    if (map) syncRasterOverlays({ fitView: true })
  },
  { deep: true }
)

watch(
  () => props.compareOpacity,
  () => {
    if (map) syncCompareOpacity()
  }
)

watch(
  () => [props.showMonitorPoints, props.monitorPoints, props.monitorAlerts] as const,
  () => {
    if (map) syncMonitorPoints()
  },
  { deep: true }
)

watch(
  () => props.enableMoistureQuery,
  () => {
    if (map) bindMoistureQuery()
  }
)

onBeforeUnmount(() => {
  unbindMoistureQuery()
  monitorLayer?.detach()
  monitorLayer = null
  compareOverlay = null
  rasterOverlay = null
  removeLeafletMap(map)
  map = null
})

function highlightMonitorPoint(pointId: number, zoom?: number) {
  monitorLayer?.highlightPoint(pointId, { maxZoom: zoom })
}

defineExpose({ invalidate, highlightMonitorPoint })
</script>

<style scoped>
.remote-sensing-map {
  width: 100%;
  height: 100%;
  min-height: 280px;
  z-index: 1;
  border-radius: inherit;
}

.remote-sensing-map :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  font-family: inherit;
}

.remote-sensing-map :deep(.custom-marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.remote-sensing-map :deep(.marker-dot) {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgb(255 255 255 / 60%);
  box-shadow: 0 0 8px rgb(0 0 0 / 50%);
}

.remote-sensing-map :deep(.marker-label) {
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 2px black;
  white-space: nowrap;
}

.remote-sensing-map--queryable :deep(.leaflet-container) {
  cursor: crosshair;
}
</style>
