import type { EChartsOption, LineSeriesOption } from 'echarts'

const AXIS_LINE = 'rgba(238, 241, 234, 0.55)'
const AXIS_TICK = 'rgba(238, 241, 234, 0.45)'
const SPLIT_LINE = 'rgba(238, 241, 234, 0.18)'
const LABEL = '#eef1ea'

const labelStyle = {
  color: LABEL,
  textBorderWidth: 0,
  textBorderColor: 'transparent',
  textShadowBlur: 0,
  textShadowColor: 'transparent'
}

export function buildSensorChartOption(input: {
  labels: string[]
  legend: string[]
  series: LineSeriesOption[]
}): EChartsOption {
  return {
    backgroundColor: 'transparent',
    legend: {
      data: input.legend,
      top: 0,
      textStyle: {
        ...labelStyle,
        fontSize: 13,
        fontWeight: 500
      }
    },
    grid: { top: '18%', left: 16, right: 16, bottom: 40, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 50, 30, 0.88)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      extraCssText:
        'backdrop-filter: blur(16px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); border-radius: 8px;'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: input.labels,
      axisLine: { show: true, lineStyle: { color: AXIS_LINE, width: 1 } },
      axisTick: { show: true, lineStyle: { color: AXIS_TICK } },
      axisLabel: { ...labelStyle, margin: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '℃',
        nameTextStyle: labelStyle,
        axisLine: { show: true, lineStyle: { color: AXIS_LINE, width: 1 } },
        axisTick: { show: true, lineStyle: { color: AXIS_TICK } },
        splitLine: { show: true, lineStyle: { color: SPLIT_LINE, type: 'dashed' } },
        axisLabel: labelStyle
      },
      {
        type: 'value',
        name: '%',
        nameTextStyle: labelStyle,
        axisLine: { show: true, lineStyle: { color: AXIS_LINE, width: 1 } },
        axisTick: { show: true, lineStyle: { color: AXIS_TICK } },
        splitLine: { show: false },
        axisLabel: labelStyle
      }
    ],
    series: input.series
  }
}
