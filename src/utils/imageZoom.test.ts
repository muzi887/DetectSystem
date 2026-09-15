import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clampScale, panBy, resetView, zoomAt } from './imageZoom.ts'

test('clampScale stays between 1 and 6', () => {
  assert.equal(clampScale(0.5), 1)
  assert.equal(clampScale(8), 6)
  assert.equal(clampScale(2.4), 2.4)
})

test('zoomAt keeps the cursor point stable', () => {
  const next = zoomAt({ scale: 1, x: 0, y: 0 }, 2, 100, 50)
  assert.equal(next.scale, 2)
  assert.equal(next.x, -100)
  assert.equal(next.y, -50)
})

test('panBy moves the view only when zoomed in', () => {
  assert.deepEqual(panBy({ scale: 1, x: 0, y: 0 }, 10, 20), { scale: 1, x: 0, y: 0 })
  assert.deepEqual(panBy({ scale: 2, x: -10, y: -20 }, 4, 6), { scale: 2, x: -6, y: -14 })
})

test('resetView returns identity transform', () => {
  assert.deepEqual(resetView(), { scale: 1, x: 0, y: 0 })
})

test('zoomAt returns identity when scale goes back to 1', () => {
  const next = zoomAt({ scale: 2, x: -100, y: -50 }, 1, 80, 40)
  assert.deepEqual(next, { scale: 1, x: 0, y: 0 })
})
