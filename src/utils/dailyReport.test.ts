import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildDailyReport, buildForecastMarkdownTable, markdownToSimpleHtml } from './dailyReport.ts'

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

test('markdownToSimpleHtml renders headings and list items', () => {
  const html = markdownToSimpleHtml('# 监测日报\n## 备注\n- 站 A\n\n生成时间：今天')
  assert.match(html, /<h1>监测日报<\/h1>/)
  assert.match(html, /<h2>备注<\/h2>/)
  assert.match(html, /<li>站 A<\/li>/)
  assert.match(html, /<p class="daily-report-meta">生成时间：今天<\/p>/)
})

test('markdownToSimpleHtml turns 监测点 list into a table', () => {
  const html = markdownToSimpleHtml(
    '## 监测点\n- 监测站 · 黑龙江建三江（离线，气温 22℃，墒情 42%）'
  )
  assert.match(html, /<table/)
  assert.match(html, /<th>监测站<\/th>/)
  assert.match(html, /<td>监测站 · 黑龙江建三江<\/td>/)
  assert.match(html, /<td>离线<\/td>/)
  assert.match(html, /<td>22℃<\/td>/)
  assert.match(html, /<td>42%<\/td>/)
  assert.doesNotMatch(html, /<li>/)
})

test('markdownToSimpleHtml turns 预警统计 list into a table', () => {
  const html = markdownToSimpleHtml('## 预警统计\n- 总数: 2\n- 待处理: 1')
  assert.match(html, /<th>项目<\/th>/)
  assert.match(html, /<td>总数<\/td>/)
  assert.match(html, /<td>2<\/td>/)
  assert.match(html, /<td>待处理<\/td>/)
  assert.doesNotMatch(html, /<ul>/)
})

test('markdownToSimpleHtml turns 极端天气 list into a table', () => {
  const html = markdownToSimpleHtml('## 极端天气\n- 极端高温（2026-08-22）')
  assert.match(html, /<th>事件<\/th>/)
  assert.match(html, /<td>极端高温<\/td>/)
  assert.match(html, /<td>2026-08-22<\/td>/)
})

test('markdownToSimpleHtml escapes HTML in text', () => {
  const html = markdownToSimpleHtml('- <script>x</script>')
  assert.match(html, /&lt;script&gt;/)
  assert.doesNotMatch(html, /<script>/)
})

test('buildForecastMarkdownTable writes header and a day row', () => {
  const table = buildForecastMarkdownTable([
    { date: '2026-09-16', tempMax: 28, tempMin: 16, precipMm: 0, windMax: 4 }
  ])
  assert.match(table, /## 7 日预报/)
  assert.match(table, /\| 日期 \| 最高温 \| 最低温 \| 降水 mm \| 风 \|/)
  assert.match(table, /2026-09-16/)
  assert.match(table, /28/)
})

test('buildForecastMarkdownTable is empty when no rows', () => {
  assert.equal(buildForecastMarkdownTable([]), '')
})
