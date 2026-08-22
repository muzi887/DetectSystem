import assert from 'node:assert/strict'
import { test } from 'node:test'
import { factorsFromAlert } from './pestFactors.ts'

test('uses prediction factors when present', () => {
  const out = factorsFromAlert('[虫情风险] x', { factors: ['连续 3 日湿度 > 80%', 'NDVI 低于田间均值 15%'] })
  assert.equal(out.length, 2)
})

test('parses message parentheses', () => {
  const msg = '[虫情风险] 地块 河间 - 风险等级：high（连续 3 日湿度 > 80%；NDVI 低于田间均值 15%）'
  const out = factorsFromAlert(msg)
  assert.equal(out.length, 2)
  assert.equal(out[0], '连续 3 日湿度 > 80%')
})
