import ndviHeatmap from '@/assets/ndvi-heatmap.webp'
import soilMoistureHeatmap from '@/assets/soil-moisture-heatmap.webp'
import type { RasterBounds, RasterLayerView } from '@/types/remoteSensing'

export type { RasterBounds, RasterLayerView }

export const REMOTE_SENSING_ASSETS: Record<string, string> = {
  'ndvi-heatmap': ndviHeatmap,
  'soil-moisture-heatmap': soilMoistureHeatmap
}

export function resolveImageAsset(imageAsset: string): string {
  const resolved = REMOTE_SENSING_ASSETS[imageAsset]
  if (resolved) return resolved
  if (imageAsset.includes('moisture') || imageAsset.includes('soil')) {
    return soilMoistureHeatmap
  }
  return ndviHeatmap
}

/** Mock 请求失败时的兜底图层 */
export const NDVI_DEMO_LAYER: RasterLayerView = {
  imageUrl: ndviHeatmap,
  bounds: [
    [38.42, 116.04],
    [38.48, 116.12]
  ],
  date: '',
  source: 'DJI Mavic 3M'
}

export const MOISTURE_DEMO_LAYER: RasterLayerView = {
  imageUrl: soilMoistureHeatmap,
  bounds: [
    [37.88, 114.6],
    [37.92, 114.7]
  ],
  date: '',
  source: 'Sentinel-2'
}
