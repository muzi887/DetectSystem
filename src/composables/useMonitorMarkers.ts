import * as L from 'leaflet'
import {
  getMonitorStatusColor,
  getMonitorStatusLabel
} from '@/utils/monitorStatus'
import type { Alert } from '@/stores/data'

interface MonitorPointLike {
  id: number
  name: string
  lat: number
  lng: number
  temp: string | number
  soilMoisture: string | number
  status: string
}

export function createMonitorDivIcon(point: MonitorPointLike) {
  const color = getMonitorStatusColor(point.status)
  return L.divIcon({
    html: `
      <div class="custom-marker">
        <div class="marker-dot" style="background:${color};"></div>
        <div class="marker-label">${point.name}</div>
      </div>
    `,
    className: 'leaflet-custom-icon',
    iconSize: [80, 40],
    iconAnchor: [40, 20],
    popupAnchor: [0, -20]
  })
}

export function buildMonitorPopupHtml(point: MonitorPointLike, alerts: Alert[]) {
  const unhandled = alerts.find((a) => a.pointId === point.id && !a.handled)
  const alertInfo = unhandled
    ? `<div class="popup-alert-info">未处理预警: ${unhandled.message}</div>`
    : ''

  return `
    <div class="leaflet-popup-content-themed">
      <div class="popup-title">${point.name}</div>
      <div class="popup-info">温度: <strong>${point.temp}°C</strong></div>
      <div class="popup-info">土壤湿度: <strong>${point.soilMoisture}%</strong></div>
      <div class="popup-info">状态: <strong style="color:${getMonitorStatusColor(point.status)}">${getMonitorStatusLabel(point.status)}</strong></div>
      ${alertInfo}
      <div class="popup-actions">
        <button data-action="trigger" data-id="${point.id}" class="popup-btn trigger">手动触发</button>
        <button data-action="close" data-id="${point.id}" class="popup-btn close">标记解决</button>
      </div>
    </div>
  `
}
