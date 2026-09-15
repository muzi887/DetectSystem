export type DailyReportInput = {
  generatedAt: string
  points: Array<{ name: string; online?: boolean; soilMoisture?: number; temp?: number }>
  alerts: Array<{ level: string; handled: boolean; message: string }>
  extremeEvents: Array<{ title: string; startAt: string }>
}

export function buildDailyReport(input: DailyReportInput): string {
  const pending = input.alerts.filter((row) => !row.handled).length
  const pointLines = input.points.map((point) => {
    const status = point.online === false ? '离线' : '在线'
    return `- ${point.name}（${status}，气温 ${point.temp ?? '—'}℃，墒情 ${point.soilMoisture ?? '—'}%）`
  })
  const extremeLines = input.extremeEvents.length
    ? input.extremeEvents.map((event) => `- ${event.title}（${event.startAt}）`)
    : ['- 无']

  return [
    '# 监测日报',
    `生成时间：${input.generatedAt}`,
    '',
    '## 监测点',
    ...(pointLines.length ? pointLines : ['- 无监测点']),
    '',
    '## 预警统计',
    `- 总数: ${input.alerts.length}`,
    `- 待处理: ${pending}`,
    '',
    '## 极端天气',
    ...extremeLines,
    ''
  ].join('\n')
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function htmlTable(headers: string[], rows: string[][]): string {
  const head = headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')
  const body = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('')
  return `<table class="daily-report-kv-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function parsePointItem(text: string): string[] | null {
  const match = text.match(/^(.+?)（([^，]+)，气温 (.+?)℃，墒情 (.+?)%）$/)
  if (!match) return null
  return [match[1], match[2], `${match[3]}℃`, `${match[4]}%`]
}

function parseKvItem(text: string): string[] | null {
  const match = text.match(/^([^:：]+)[:：]\s*(.+)$/)
  if (!match) return null
  return [match[1].trim(), match[2].trim()]
}

function parseEventItem(text: string): string[] | null {
  const match = text.match(/^(.+?)（([^）]+)）$/)
  if (!match) return null
  return [match[1], match[2]]
}

function renderListHtml(items: string[]): string {
  if (items.length === 1 && (items[0] === '无' || items[0] === '无监测点')) {
    const message = items[0] === '无监测点' ? '暂无监测点' : '暂无极端天气'
    return `<p class="daily-report-empty">${escapeHtml(message)}</p>`
  }
  const points = items.map(parsePointItem)
  if (points.every((row) => row)) {
    return htmlTable(['监测站', '状态', '气温', '墒情'], points as string[][])
  }
  const kv = items.map(parseKvItem)
  if (kv.every((row) => row)) {
    return htmlTable(['项目', '数值'], kv as string[][])
  }
  const events = items.map(parseEventItem)
  if (events.every((row) => row)) {
    return htmlTable(['事件', '时间'], events as string[][])
  }
  const lis = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  return `<ul>${lis}</ul>`
}

export function markdownToSimpleHtml(markdown: string): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  const out: string[] = []
  let listItems: string[] | null = null

  const closeList = () => {
    if (!listItems) return
    out.push(renderListHtml(listItems))
    listItems = null
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (!line.trim()) {
      closeList()
      continue
    }
    if (line.startsWith('## ')) {
      closeList()
      out.push(`<h2>${escapeHtml(line.slice(3).trim())}</h2>`)
      continue
    }
    if (line.startsWith('# ')) {
      closeList()
      out.push(`<h1>${escapeHtml(line.slice(2).trim())}</h1>`)
      continue
    }
    if (line.startsWith('- ')) {
      if (!listItems) listItems = []
      listItems.push(line.slice(2).trim())
      continue
    }
    if (/^生成时间/.test(line.trim())) {
      closeList()
      out.push(`<p class="daily-report-meta">${escapeHtml(line.trim())}</p>`)
      continue
    }
    closeList()
    out.push(`<p>${escapeHtml(line.trim())}</p>`)
  }
  closeList()
  return out.join('')
}

export type ForecastTableRow = {
  date: string
  tempMax: number
  tempMin: number
  precipMm: number
  windMax: number
}

export function buildForecastMarkdownTable(rows: ForecastTableRow[]): string {
  if (!rows.length) return ''
  const body = rows.map(
    (row) =>
      `| ${row.date} | ${row.tempMax} | ${row.tempMin} | ${row.precipMm} | ${row.windMax} |`
  )
  return [
    '## 7 日预报',
    '',
    '| 日期 | 最高温 | 最低温 | 降水 mm | 风 |',
    '|------|--------|--------|---------|----|',
    ...body,
    ''
  ].join('\n')
}
