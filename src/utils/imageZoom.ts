export type ZoomView = {
  scale: number
  x: number
  y: number
}

export const MIN_SCALE = 1
export const MAX_SCALE = 6
export const SCALE_STEP = 1.25

export function clampScale(scale: number, min = MIN_SCALE, max = MAX_SCALE): number {
  return Math.min(max, Math.max(min, scale))
}

export function resetView(): ZoomView {
  return { scale: 1, x: 0, y: 0 }
}

/** Zoom so the point under (originX, originY) stays put. */
export function zoomAt(
  view: ZoomView,
  nextScale: number,
  originX: number,
  originY: number
): ZoomView {
  const scale = clampScale(nextScale)
  if (scale === 1) return resetView()
  const ratio = scale / view.scale
  return {
    scale,
    x: originX - (originX - view.x) * ratio,
    y: originY - (originY - view.y) * ratio
  }
}

export function panBy(view: ZoomView, dx: number, dy: number): ZoomView {
  if (view.scale <= 1) return resetView()
  return { scale: view.scale, x: view.x + dx, y: view.y + dy }
}

export function nextScaleFromWheel(scale: number, deltaY: number): number {
  const factor = deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP
  return clampScale(scale * factor)
}
