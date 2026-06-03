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
}

export interface MonitorPointLayerOptions {
  readonly?: boolean
  onTriggerAlert?: (point: MonitorPointRecord) => Promise<void>
  onResolveAlert?: (point: MonitorPointRecord) => Promise<boolean>
}

export function createMonitorPointLayer(map: L.Map, options: MonitorPointLayerOptions = {}) {
  const cluster = L.markerClusterGroup()
  cluster.addTo(map)
  const markersById = new Map<number, L.Marker>()

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

  function render(points: MonitorPointRecord[], alerts: Alert[]) {
    cluster.clearLayers()
    markersById.clear()

    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], { icon: createMonitorDivIcon(p) })
      marker.bindPopup(popupHtml(p, alerts))
      bindPopupActions(marker, p, alerts)
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
    map.removeLayer(cluster)
    markersById.clear()
  }

  return { render, updatePopups, detach, cluster }
}
