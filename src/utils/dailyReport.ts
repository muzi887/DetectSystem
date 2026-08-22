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
