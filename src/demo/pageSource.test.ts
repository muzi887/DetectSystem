import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('warning page states that alerts are precomputed', () => {
  const src = readFileSync(new URL('../views/user/WarningSystem.vue', import.meta.url), 'utf8')
  assert.equal(src.includes('RULE_CHAIN_NOTE'), true)
})

test('analysis page plays the demo video and hides upload in the static build', () => {
  const src = readFileSync(new URL('../views/user/DataAnalysis.vue', import.meta.url), 'utf8')
  assert.equal(src.includes('ANALYSIS_DEMO_NOTE'), true)
  assert.equal(src.includes('MODEL_METRICS_LINE'), true)
  assert.match(src, /\/demo\/analysis\.mp4/)
  assert.match(src, /<video[^>]*controls/)
  assert.equal(src.includes('在线体验'), false)
  const uploads = src.match(/<a-upload/g) || []
  assert.equal(uploads.length >= 2, true)
  assert.equal((src.match(/v-if="!staticDemo"/g) || []).length >= 2, true)
})

test('nav still exposes the rule-chain pages', () => {
  const src = readFileSync(new URL('../layouts/AppLayout.vue', import.meta.url), 'utf8')
  for (const label of ['相关数据', '灾害实时监测', '智能分析', '灾害预警', '智慧决策']) {
    assert.equal(src.includes(label), true, label)
  }
})
