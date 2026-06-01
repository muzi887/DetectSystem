import * as L from 'leaflet'

type BaseTile = 'gaodeSatellite' | 'cartoDark'

const tileLayers: Record<BaseTile, () => L.TileLayer> = {
  gaodeSatellite: () =>
    L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18
    }),
  cartoDark: () =>
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    })
}

interface CreateLeafletBaseOptions {
  center: L.LatLngExpression
  zoom: number
  tile?: BaseTile
  zoomControl?: boolean
}

export function createLeafletBaseMap(container: HTMLElement, options: CreateLeafletBaseOptions) {
  const layer = tileLayers[options.tile || 'cartoDark']()
  return L.map(container, {
    layers: [layer],
    zoomControl: options.zoomControl
  }).setView(options.center, options.zoom)
}

export function invalidateLeafletSize(map: L.Map | null, delay = 100) {
  setTimeout(() => {
    map?.invalidateSize()
  }, delay)
}

export function removeLeafletMap(map: L.Map | null) {
  if (map) {
    map.remove()
  }
}
