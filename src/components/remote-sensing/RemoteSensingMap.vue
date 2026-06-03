<template>
  <div
    ref="mapRef"
    class="remote-sensing-map"
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
import type { Alert } from '@/stores/data'
import type { RasterBounds } from '@/types/remoteSensing'

const props = defineProps<{
  mode: 'ndvi' | 'moisture'
  imageUrl: string
  bounds: RasterBounds
  opacity?: number
  showMonitorPoints?: boolean
  monitorPoints?: MonitorPointRecord[]
  monitorAlerts?: Alert[]
}>()

const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let rasterOverlay: L.ImageOverlay | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null

const viewByMode: Record<
  typeof props.mode,
  { center: L.LatLngExpression; zoom: number }
> = {
  ndvi: { center: [38.44, 115.95], zoom: 9 },
  moisture: { center: [37.9, 114.65], zoom: 10 }
}

function syncRasterOverlay() {
  if (!map || !props.imageUrl) return

  rasterOverlay?.remove()
  rasterOverlay = L.imageOverlay(props.imageUrl, props.bounds, {
    opacity: props.opacity ?? 0.92,
    interactive: false
  }).addTo(map)

  map.fitBounds(props.bounds, { padding: [24, 24], maxZoom: 14 })
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

async function initMap() {
  if (!mapRef.value || map) return
  const { center, zoom } = viewByMode[props.mode]
  map = createLeafletBaseMap(mapRef.value, {
    center,
    zoom,
    tile: 'gaodeSatellite',
    zoomControl: true
  })
  syncRasterOverlay()
  syncMonitorPoints()
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
  () => [props.imageUrl, props.bounds, props.opacity] as const,
  () => {
    if (map) syncRasterOverlay()
  },
  { deep: true }
)

watch(
  () => [props.showMonitorPoints, props.monitorPoints, props.monitorAlerts] as const,
  () => {
    if (map) syncMonitorPoints()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  monitorLayer?.detach()
  monitorLayer = null
  rasterOverlay = null
  removeLeafletMap(map)
  map = null
})

defineExpose({ invalidate })
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
</style>
