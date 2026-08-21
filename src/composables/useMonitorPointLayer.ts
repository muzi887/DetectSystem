import * as L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import {
  buildMonitorPopupHtml,
  createMonitorDivIcon
} from '@/composables/useMonitorMarkers'
import type { Alert } from '@/stores/data'

export interface MonitorPointRecord {
  id: number
  name: string
  lat: number
  lng: number
  temp: string | number
  soilMoisture: string | number
  status: string
  online?: boolean
  lastSeenAt?: string
}

export interface MonitorPointLayerOptions {
  readonly?: boolean
  onTriggerAlert?: (point: MonitorPointRecord) => Promise<void>
  onResolveAlert?: (point: MonitorPointRecord) => Promise<boolean>
  onSelectPoint?: (point: MonitorPointRecord) => void
}

export interface HighlightPointOptions {
  /** 查墒情点击位置；传入时用 fitBounds 同时框住点击处与监测站 */
  queryLatLng?: L.LatLng
  maxZoom?: number
}

const FIT_BOTH_POPUPS_PADDING: L.PointExpression = [100, 100]

const LAYER_POPUP_OPTIONS: L.PopupOptions = {
  autoPan: false,
  autoClose: false,
  closeOnClick: false
}

export function createMonitorPointLayer(map: L.Map, options: MonitorPointLayerOptions = {}) {
  const cluster = L.markerClusterGroup()
  cluster.addTo(map)
  const markersById = new Map<number, L.Marker>()
  let highlightPopup: L.Popup | null = null

  function popupHtml(point: MonitorPointRecord, alerts: Alert[]) {
    return buildMonitorPopupHtml(point, alerts, { readonly: options.readonly })
  }

  function bindPopupActions(marker: L.Marker, point: MonitorPointRecord, alerts: Alert[]) {
    if (options.readonly) return

    marker.on('popupopen', (e) => {
      const container = e.popup?.getElement()
      if (!container) return

      const triggerBtn = container.querySelector('.trigger') as HTMLButtonElement | null
      const closeBtn = container.querySelector('.close') as HTMLButtonElement | null

      if (triggerBtn && options.onTriggerAlert) {
        triggerBtn.onclick = async () => {
          triggerBtn.disabled = true
          try {
            await options.onTriggerAlert!(point)
            marker.setPopupContent(popupHtml(point, alerts))
          } finally {
            triggerBtn.disabled = false
          }
        }
      }

      if (closeBtn && options.onResolveAlert) {
        closeBtn.onclick = async () => {
          closeBtn.disabled = true
          try {
            const ok = await options.onResolveAlert!(point)
            if (ok) marker.setPopupContent(popupHtml(point, alerts))
          } finally {
            closeBtn.disabled = false
          }
        }
      }
    })
  }

  function dismissHighlight() {
    highlightPopup?.remove()
    highlightPopup = null
  }

  function openMarkerPopupLayer(marker: L.Marker) {
    const popup = marker.getPopup()
    if (!popup) return

    dismissHighlight()
    popup.options.autoPan = LAYER_POPUP_OPTIONS.autoPan
    popup.options.autoClose = LAYER_POPUP_OPTIONS.autoClose
    popup.options.closeOnClick = LAYER_POPUP_OPTIONS.closeOnClick
    popup.setLatLng(marker.getLatLng())
    popup.addTo(map)
    highlightPopup = popup
  }

  function render(points: MonitorPointRecord[], alerts: Alert[]) {
    dismissHighlight()
    cluster.clearLayers()
    markersById.clear()

    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], { icon: createMonitorDivIcon(p, alerts) })
      marker.bindPopup(popupHtml(p, alerts))
      bindPopupActions(marker, p, alerts)
      marker.on('click', () => {
        options.onSelectPoint?.(p)
      })
      markersById.set(p.id, marker)
      cluster.addLayer(marker)
    }
  }

  function updatePopups(points: MonitorPointRecord[], alerts: Alert[]) {
    for (const p of points) {
      const marker = markersById.get(p.id)
      if (marker) marker.setPopupContent(popupHtml(p, alerts))
    }
  }

  function detach() {
    dismissHighlight()
    map.removeLayer(cluster)
    markersById.clear()
  }

  function highlightPoint(pointId: number, options: HighlightPointOptions = {}) {
    const marker = markersById.get(pointId)
    if (!marker) return

    const maxZoom = options.maxZoom ?? 14
    const markerLatLng = marker.getLatLng()

    cluster.zoomToShowLayer(marker, () => {
      if (options.queryLatLng) {
        const bounds = L.latLngBounds(options.queryLatLng, markerLatLng)
        map.fitBounds(bounds, {
          padding: FIT_BOTH_POPUPS_PADDING,
          maxZoom,
          animate: true,
          duration: 0.8
        })
      } else {
        map.flyTo(markerLatLng, maxZoom, { duration: 0.8 })
      }
      map.once('moveend', () => {
        openMarkerPopupLayer(marker)
      })
    })
  }

  return { render, updatePopups, detach, dismissHighlight, highlightPoint, cluster }
}
