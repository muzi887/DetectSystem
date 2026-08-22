import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildDailyReport } from './dailyReport.ts'

test('daily report includes points, pending alerts, and extreme title', () => {
  const markdown = buildDailyReport({
    generatedAt: '2026-08-21T08:00:00+08:00',
    points: [{ name: '监测站 · 黑龙江建三江', online: false, soilMoisture: 42, temp: 22 }],
    alerts: [
      { level: 'high', handled: false, message: '[自动预警] 墒情偏低' },
      { level: 'low', handled: true, message: '[AI识别] 健康' }
    ],
    extremeEvents: [{ title: '极端高温', startAt: '2026-08-22' }]
  })
  assert.match(markdown, /## 监测点/)
  assert.match(markdown, /## 预警统计/)
  assert.match(markdown, /## 极端天气/)
  assert.match(markdown, /黑龙江建三江/)
  assert.match(markdown, /待处理: 1/)
  assert.match(markdown, /极端高温/)
})
