import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  buildSatelliteAiConclusion,
  daysForType,
  imageDayCount,
  itemById,
  parseThematicName,
  typeFromRelPath,
  type SatelliteCatalog
} from './satelliteThematic.ts'

test('parses M.D filename as 2025 date', () => {
  const out = parseThematicName('1.5.jpg', 2025)
  assert.deepEqual(out, { kind: 'day', date: '2025-01-05' })
})

test('parses 高温M.D filename', () => {
  const out = parseThematicName('高温7.08.jpg', 2025)
  assert.deepEqual(out, { kind: 'day', date: '2025-07-08' })
})

test('parses ISO date in filename', () => {
  const out = parseThematicName('2025-06-03 高温.jpg', 2025)
  assert.deepEqual(out, { kind: 'day', date: '2025-06-03' })
})

test('parses summary xindafeng as summary', () => {
  const out = parseThematicName('xindafeng.jpg', 2025)
  assert.deepEqual(out, { kind: 'summary' })
})

test('skips wechat export names', () => {
  assert.equal(parseThematicName('mmexport1785344239886.jpg', 2025), null)
})

test('typeFromRelPath maps Chinese folders', () => {
  assert.equal(typeFromRelPath('大风/1月(1)/1.5.jpg'), 'wind')
  assert.equal(typeFromRelPath('干旱/4.3.jpg'), 'drought')
  assert.equal(typeFromRelPath('暴雨/7月/7.24.jpg'), 'rain')
  assert.equal(typeFromRelPath('高温/6/2025-06-03 高温.jpg'), 'heat')
  assert.equal(typeFromRelPath('总/xindafeng.jpg'), 'wind')
  assert.equal(typeFromRelPath('总/xinganhan.jpg'), 'drought')
})

const sample: SatelliteCatalog = {
  wind: {
    summary: { id: 'summary', label: '1–8 月汇总', url: '/satellite/wind/summary.jpg' },
    days: [
      { date: '2025-01-05', url: '/satellite/wind/2025-01-05.jpg' },
      { date: '2025-08-16', url: '/satellite/wind/2025-08-16.jpg' }
    ]
  },
  heat: { summary: null, days: [] },
  rain: { summary: null, days: [] },
  drought: { summary: null, days: [] }
}

test('daysForType returns only days with images', () => {
  assert.deepEqual(daysForType(sample, 'wind'), ['2025-01-05', '2025-08-16'])
  assert.deepEqual(daysForType(sample, 'heat'), [])
})

test('itemById finds day or summary', () => {
  assert.equal(itemById(sample, 'wind', '2025-01-05')?.url, '/satellite/wind/2025-01-05.jpg')
  assert.equal(itemById(sample, 'wind', 'summary')?.url, '/satellite/wind/summary.jpg')
  assert.equal(itemById(sample, 'wind', '2025-02-01'), null)
})

test('imageDayCount ignores summary', () => {
  assert.equal(imageDayCount(sample, 'wind'), 2)
  assert.equal(imageDayCount(sample, 'heat'), 0)
})

test('buildSatelliteAiConclusion is empty when no map is selected', () => {
  assert.equal(
    buildSatelliteAiConclusion({
      type: 'drought',
      typeLabel: '干旱',
      selectedLabel: null,
      selectedId: '',
      dayCount: 0,
      latestDay: null
    }),
    '当前未选中干旱专题图，请切换灾害类型或日期。'
  )
})

test('buildSatelliteAiConclusion reads the selected day and catalog window', () => {
  const text = buildSatelliteAiConclusion({
    type: 'wind',
    typeLabel: '大风',
    selectedLabel: '2025-08-16',
    selectedId: '2025-08-16',
    dayCount: 2,
    latestDay: '2025-08-16',
    events: [{ title: '极端高温', startAt: '2026-08-22' }]
  })
  assert.match(text, /大风（2025-08-16）/)
  assert.match(text, /收录 2 期/)
  assert.match(text, /最新一期 2025-08-16/)
  assert.match(text, /当日暂无对应的大风站点记录/)
  assert.match(text, /防倒伏/)
  assert.doesNotMatch(text, /京津冀/)
  assert.doesNotMatch(text, /pointId/)
})

test('buildSatelliteAiConclusion counts matching events on that day', () => {
  const text = buildSatelliteAiConclusion({
    type: 'heat',
    typeLabel: '高温',
    selectedLabel: '2026-08-22',
    selectedId: '2026-08-22',
    dayCount: 40,
    latestDay: '2026-08-22',
    events: [
      { title: '极端高温', startAt: '2026-08-22' },
      { title: '暴雨', startAt: '2026-08-22' }
    ]
  })
  assert.match(text, /当日站点有 1 条高温记录/)
  assert.match(text, /灌溉降温/)
})

test('buildSatelliteAiConclusion summary does not invent a single-day event count', () => {
  const text = buildSatelliteAiConclusion({
    type: 'wind',
    typeLabel: '大风',
    selectedLabel: '1–8 月汇总',
    selectedId: 'summary',
    dayCount: 2,
    latestDay: '2025-08-16',
    events: [{ title: '大风', startAt: '2025-08-16' }]
  })
  assert.match(text, /大风（1–8 月汇总）/)
  assert.doesNotMatch(text, /当日/)
  assert.match(text, /防倒伏/)
})
