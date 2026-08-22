import assert from 'node:assert/strict'
import { test } from 'node:test'
import { presetFor } from './thresholdPresets.ts'

test('wheat jointing matches current default bands', () => {
  const out = presetFor('小麦', '拔节')
  assert.deepEqual(out, {
    waterStressHint: 25,
    waterStressAlert: 15,
    heatHint: 32,
    heatAlert: 38
  })
})

test('rice filling uses wetter soil bands', () => {
  const out = presetFor('水稻', '灌浆')
  assert.equal(out.waterStressHint, 40)
  assert.equal(out.waterStressAlert, 30)
})

test('listed corn heading is hotter; missing combo falls back', () => {
  assert.equal(presetFor('玉米', '抽穗').heatHint, 34)
  assert.equal(presetFor('小麦', '抽穗').waterStressHint, 25)
  assert.equal(presetFor('玉米', '拔节').heatHint, 32)
})
