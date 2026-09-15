import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildSensorChartOption } from './sensorChartOption.ts'

const option = buildSensorChartOption({
  labels: ['8/16', '8/17'],
  legend: ['河间-气温', '河间-墒情'],
  series: []
})

test('shows light x/y axis lines so they read on the glass background', () => {
  const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis
  const yAxes = Array.isArray(option.yAxis) ? option.yAxis : [option.yAxis]
  assert.equal(xAxis?.axisLine?.show, true)
  assert.match(String(xAxis?.axisLine?.lineStyle?.color), /238|eef1ea|255/i)
  for (const axis of yAxes) {
    assert.equal(axis?.axisLine?.show, true)
    assert.match(String(axis?.axisLine?.lineStyle?.color), /238|eef1ea|255/i)
  }
})

test('legend text has no stroke or shadow', () => {
  const text = option.legend && !Array.isArray(option.legend) ? option.legend.textStyle : undefined
  assert.equal(text?.textBorderWidth, 0)
  assert.equal(text?.textShadowBlur, 0)
})
