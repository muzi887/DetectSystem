/** Leaflet bounds: [[south, west], [north, east]] */
export type RasterBounds = [[number, number], [number, number]]

export interface Field {
  id: string
  name: string
  bounds: RasterBounds
  /** 关联监测点，便于 GIS/无人机与监测站联动（P0-5） */
  monitorPointId?: number
}

export interface NdviLayer {
  id: number
  fieldId: string
  date: string
  imageAsset: string
  bounds: RasterBounds
  source: string
  ndviMin?: number
  ndviMax?: number
}

export interface MoistureLayer {
  id: number
  date: string
  imageAsset: string
  bounds: RasterBounds
  source: string
}

export interface RasterLayerView {
  imageUrl: string
  bounds: RasterBounds
  date: string
  source: string
}

/** GET /moisture/value 点击查墒情（P1-4 Mock 方案 A） */
export interface MoistureQueryResult {
  moisture: number
  source: 'nearest-point' | string
  nearestPointId: number
  pointName: string
  distanceKm: number
}
