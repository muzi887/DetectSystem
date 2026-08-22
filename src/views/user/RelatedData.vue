<template>
  <AppLayout>
    <div class="data-page-content">
      <div class="chart-panel glass-panel glass-panel--chart">
        <div class="panel-header">
          <div class="header-left">
            <span class="title">{{ currentTitle }}</span>
            <span class="sub-title">{{ currentSubtitle }}</span>
          </div>

          <div class="header-actions">
            <a-select
              v-if="currentTab === 'weather'"
              :key="`weather-point-${weatherPointOptionKey}`"
              v-model:value="selectedWeatherPointId"
              class="weather-point-select"
              popup-class-name="weather-point-select-dropdown"
              placeholder="选择监测站">
              <a-select-option
                v-for="point in dataStore.filteredMonitorPoints"
                :key="point.id"
                :value="Number(point.id)">
                {{ point.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-if="currentTab === 'sensor'"
              v-model:value="selectedSensorPointIds"
              mode="multiple"
              class="weather-point-select weather-point-select--multi"
              popup-class-name="weather-point-select-dropdown"
              :options="weatherPointOptions"
              :max-tag-count="2"
              placeholder="对比监测站（最多 3 个）"
              @change="onSensorPointsChange" />
            <a-button
              type="primary"
              shape="round"
              @click="handleGenerateReport">
              <template #icon><FilePdfOutlined /></template>
              生成{{ currentTabName }}简报
            </a-button>
            <a-button
              size="small"
              ghost
              style="margin-left: 10px">
              查看详情
            </a-button>
          </div>
        </div>

        <div
          class="chart-wrapper"
          :class="{ 'chart-wrapper--weather': currentTab === 'weather' }">
          <div
            v-if="loading"
            class="glass-loading-mask">
            <div class="loading-content">
              <a-spin size="large" />
              <p>正在加载数据...</p>
            </div>
          </div>

          <div
            v-show="currentTab === 'sensor'"
            ref="sensorChartRef"
            class="full-content sensor-chart"></div>

          <div
            v-if="currentTab === 'drone' || currentTab === 'gis'"
            class="full-content map-visual">
            <NdviLayerControls v-if="currentTab === 'drone'" />
            <a-alert
              v-if="currentTab === 'drone' && remoteStore.selectedFieldHighRisk"
              class="high-risk-banner"
              type="warning"
              show-icon
              message="建议地面复核"
              :description="`${selectedFieldName} 虫情风险为高，请结合 NDVI 与预警草稿安排踏查。`" />
            <RemoteSensingMap
              ref="remoteMapRef"
              :key="currentTab"
              :mode="currentTab === 'drone' ? 'ndvi' : 'moisture'"
              :image-url="remoteRasterLayer.imageUrl"
              :bounds="remoteRasterLayer.bounds"
              :compare-image-url="ndviCompareImageUrl"
              :compare-opacity="remoteStore.compareOpacity"
              :high-risk-bounds="droneHighRiskBounds"
              :flight-path="droneFlightPath"
              :show-monitor-points="currentTab === 'gis'"
              :enable-moisture-query="currentTab === 'gis'"
              :monitor-points="dataStore.filteredMonitorPoints"
              :monitor-alerts="dataStore.filteredAlerts"
              @moisture-query="onMoistureQuery" />
            <div class="map-caption">
              <h3 class="font-heading">
                {{ currentTab === 'drone' ? 'NDVI 植被指数' : '土壤墒情分布' }}
              </h3>
              <p class="map-source">
                来源：{{ mapDataSource }}
              </p>
              <p
                v-if="currentTab === 'drone' && remoteStore.selectedNdviDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedNdviDate }}
                <template v-if="remoteStore.compareEnabled && remoteStore.compareNdviDate">
                  · 对比 {{ remoteStore.compareNdviDate }}
                  · 历史透明度 {{ Math.round(remoteStore.compareOpacity * 100) }}%
                </template>
              </p>
              <p
                v-if="currentTab === 'gis' && remoteStore.selectedMoistureDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedMoistureDate }} · 监测点为地面传感器
              </p>
              <p
                v-if="currentTab === 'gis'"
                class="map-meta map-meta--hint">
                点击地图可查询该位置墒情（演示：最近监测点）
              </p>
              <p
                v-if="currentTab === 'gis' && lastMoistureQuery"
                class="map-meta">
                最近查值：{{ lastMoistureQuery.moisture }}% · {{ lastMoistureQuery.pointName }}
              </p>
            </div>
            <div
              class="map-legend"
              :aria-label="currentTab === 'drone' ? 'NDVI 色标' : '土壤湿度色标'">
              <span class="legend-title">
                {{ currentTab === 'drone' ? 'NDVI' : '墒情 (%)' }}
              </span>
              <div class="legend-bar">
                <span
                  v-for="step in legendSteps"
                  :key="step.label"
                  class="legend-step"
                  :style="{ background: step.color }"
                  :title="step.label" />
              </div>
              <div class="legend-labels">
                <span>{{ legendSteps[0]?.label }}</span>
                <span>{{ legendSteps[legendSteps.length - 1]?.label }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="currentTab === 'weather'"
            class="weather-layout">
            <div
              v-if="activeExtremeTitles.length"
              class="weather-extreme-tags">
              <a-tag
                v-for="title in activeExtremeTitles"
                :key="title"
                color="orange"
                style="cursor: pointer"
                @click="router.push('/warnings')">
                {{ title }}
              </a-tag>
            </div>
            <div class="weather-body">
              <div class="weather-metrics">
                <template v-if="weatherMetrics.length">
                  <a-card
                    v-for="item in weatherMetrics"
                    :key="item.label"
                    class="weather-card"
                    :title="item.label">
                    {{ item.value }}
                  </a-card>
                </template>
                <div
                  v-else
                  class="weather-empty">
                  暂无该监测站气象读数
                </div>
              </div>
              <aside class="weather-side">
                <section class="weather-forecast-block">
                  <h4 class="weather-side-title">7 日预报</h4>
                  <a-table
                    v-if="forecastDays.length"
                    class="forecast-table"
                    size="small"
                    :pagination="false"
                    :data-source="forecastDays"
                    :columns="forecastColumns"
                    row-key="date" />
                  <div
                    v-else
                    class="forecast-empty">
                    暂无该站 7 日预报
                  </div>
                </section>
                <section class="threshold-settings">
                  <h4 class="threshold-title">阈值配置</h4>
                  <a-form
                    layout="vertical"
                    class="threshold-form">
                    <div class="threshold-grid">
                      <a-form-item label="墒情提示">
                        <a-input-number
                          v-model:value="thresholdForm.waterStressHint"
                          :min="1"
                          :max="50" />
                      </a-form-item>
                      <a-form-item label="墒情告警">
                        <a-input-number
                          v-model:value="thresholdForm.waterStressAlert"
                          :min="1"
                          :max="50" />
                      </a-form-item>
                      <a-form-item label="气温提示">
                        <a-input-number
                          v-model:value="thresholdForm.heatHint"
                          :min="20"
                          :max="50" />
                      </a-form-item>
                      <a-form-item label="气温告警">
                        <a-input-number
                          v-model:value="thresholdForm.heatAlert"
                          :min="20"
                          :max="50" />
                      </a-form-item>
                    </div>
                    <a-button
                      type="primary"
                      class="threshold-save-btn"
                      @click="savePointThresholds">
                      保存阈值
                    </a-button>
                  </a-form>
                </section>
              </aside>
            </div>
          </div>
        </div>

        <div class="ai-analysis-box">
          <span class="ai-tag">AI 智能分析</span>
          <span class="ai-text">
            {{ aiConclusion }}
          </span>
        </div>
      </div>

      <div class="nav-buttons">
        <a-button
          v-for="tab in tabs"
          :key="tab.key"
          size="large"
          block
          class="nav-btn"
          :class="{ 'active-btn': currentTab === tab.key }"
          @click="switchTab(tab.key)">
          {{ tab.label }}
        </a-button>
      </div>
    </div>

    <a-modal
      v-model:visible="reportModalVisible"
      wrap-class-name="glass-report-modal-wrap"
      root-class-name="glass-report-modal-root"
      title="生成监测日报"
      ok-text="下载 txt"
      :confirm-loading="reportLoading"
      @ok="handleDownload">
      <p v-if="reportLoading">正在生成监测日报...</p>
      <pre
        v-else-if="reportMarkdown"
        class="report-preview">{{ reportPreview }}</pre>
      <p v-else>暂无日报内容</p>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import RemoteSensingMap from '@/components/remote-sensing/RemoteSensingMap.vue'
import NdviLayerControls from '@/components/remote-sensing/NdviLayerControls.vue'
import { NDVI_DEMO_LAYER, MOISTURE_DEMO_LAYER } from '@/constants/remoteSensingLayers'
import { useDataStore, type WeatherReading } from '@/stores/data.ts'
import { useRemoteSensingStore } from '@/stores/remoteSensing'
import type { MoistureQueryResult } from '@/types/remoteSensing'
import * as echarts from 'echarts'
import { FilePdfOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { fetchDailyReport, fetchExtremeEvents, fetchForecast, fetchSensorReadings, fetchThresholds, saveThresholds } from '@/api/rules'
import { DEFAULT_THRESHOLD_PROFILE } from '@/utils/alertRules'
import { daysForPoint, type ForecastRow } from '@/utils/forecastView'
import { last7DayRange, type SensorReading } from '@/utils/sensorReadings'

const dataStore = useDataStore()
const remoteStore = useRemoteSensingStore()
const router = useRouter()
const loading = ref(false)

const currentTab = ref('sensor')
const selectedWeatherPointId = ref<number>(1)
const selectedSensorPointIds = ref<number[]>([1, 2])
const sensorByStation = ref<
  Array<{ pointId: number; name: string; rows: SensorReading[] }>
>([])
const extremeEvents = ref<Array<{ pointId: number; title: string; startAt: string }>>([])
const forecastDays = ref<ForecastRow[]>([])
const thresholdForm = reactive({ ...DEFAULT_THRESHOLD_PROFILE, pointId: 1 })

function mdLabel(iso: string) {
  const day = String(iso).slice(0, 10)
  return `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`
}

const weatherPointOptions = computed(() =>
  dataStore.filteredMonitorPoints.map((point) => ({
    value: Number(point.id),
    label: point.name
  }))
)

const weatherPointOptionKey = computed(() =>
  weatherPointOptions.value.map((item) => item.value).join(',')
)

function formatWeatherMetrics(reading: WeatherReading) {
  const rainLabel =
    reading.hourlyRain <= 0
      ? '0.0 mm（无降水）'
      : `${reading.hourlyRain.toFixed(1)} mm`

  return [
    { label: '土壤体积含水率', value: `${reading.soilVwc.toFixed(1)} %vol` },
    { label: '10cm土壤温度', value: `${reading.soilTemp10cm.toFixed(1)} ℃` },
    { label: '土壤EC电导率', value: `${reading.soilEc.toFixed(0)} μS/cm` },
    { label: '空气温度', value: `${reading.airTemp.toFixed(1)} ℃` },
    { label: '空气相对湿度', value: `${reading.airRh.toFixed(1)} %RH` },
    { label: '瞬时风速', value: `${reading.windSpeed.toFixed(1)} m/s` },
    {
      label: '风向',
      value: `${reading.windDirection}°（${reading.windDirectionText}）`
    },
    { label: '大气气压', value: `${reading.pressure.toFixed(1)} hPa` },
    { label: '小时降雨量', value: rainLabel }
  ]
}

const selectedWeatherReading = computed(() =>
  dataStore.getWeatherReadingByPointId(selectedWeatherPointId.value)
)

const weatherMetrics = computed(() => {
  const reading = selectedWeatherReading.value
  return reading ? formatWeatherMetrics(reading) : []
})

const activeExtremeTitles = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const titles: string[] = []
  for (const event of extremeEvents.value) {
    if (event.pointId !== selectedWeatherPointId.value) continue
    if (String(event.startAt) < today) continue
    if (!titles.includes(event.title)) titles.push(event.title)
  }
  return titles
})

async function loadThresholds(pointId: number) {
  try {
    const res = await fetchThresholds(pointId)
    Object.assign(thresholdForm, { ...DEFAULT_THRESHOLD_PROFILE, ...(res.data || {}), pointId })
  } catch {
    Object.assign(thresholdForm, { ...DEFAULT_THRESHOLD_PROFILE, pointId })
  }
}

async function loadForecast(pointId: number) {
  try {
    const res = await fetchForecast(pointId)
    forecastDays.value = daysForPoint(res.data || [], pointId, 7)
  } catch {
    forecastDays.value = []
  }
}

const forecastColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '最高温 ℃', dataIndex: 'tempMax', key: 'tempMax' },
  { title: '最低温 ℃', dataIndex: 'tempMin', key: 'tempMin' },
  { title: '降水 mm', dataIndex: 'precipMm', key: 'precipMm' },
  { title: '风速 m/s', dataIndex: 'windMax', key: 'windMax' }
]

async function savePointThresholds() {
  try {
    await saveThresholds(selectedWeatherPointId.value, {
      ...thresholdForm,
      pointId: selectedWeatherPointId.value
    })
    message.success('阈值已保存')
  } catch {
    message.error('阈值保存失败')
  }
}

function getWeatherPointName(pointId: number) {
  const id = Number(pointId)
  return (
    dataStore.filteredMonitorPoints.find((point) => Number(point.id) === id)?.name ??
    `监测站 #${id}`
  )
}

function syncSelectedWeatherPoint(preferredId?: number) {
  const points = dataStore.filteredMonitorPoints
  if (!points.length) return
  const preferred =
    preferredId != null ? Number(preferredId) : Number(selectedWeatherPointId.value)
  const match = points.find((point) => Number(point.id) === preferred)
  selectedWeatherPointId.value = Number(match?.id ?? points[0].id)
}

function buildWeatherAiConclusion(reading: WeatherReading, pointName: string) {
  const rainPart =
    reading.hourlyRain <= 0
      ? '当前无降水'
      : `近 1 小时降雨 ${reading.hourlyRain.toFixed(1)} mm`
  const humidityPart =
    reading.airRh < 40
      ? '，空气偏干'
      : reading.airRh > 60
        ? '，空气湿度较高'
        : ''
  const soilPart =
    reading.soilVwc < 20
      ? '，土壤墒情偏低，建议适时补灌'
      : reading.soilVwc > 35
        ? '，土壤墒情充足'
        : '，蒸腾作用较强，建议关注墒情'

  return `${pointName}：${rainPart}（相对湿度 ${reading.airRh.toFixed(1)}%RH），土壤体积含水率 ${reading.soilVwc.toFixed(1)}%vol${humidityPart}${soilPart}。`
}

const tabs = [
  {
    key: 'sensor',
    label: '传感器数据 (地)',
    title: '物联网传感器监控',
    subtitle: '最近 7 天环境参数趋势'
  },
  {
    key: 'drone',
    label: '无人机遥感 (空)',
    title: '无人机多光谱监测',
    subtitle: '作物长势 NDVI 指数分析'
  },
  {
    key: 'weather',
    label: '气象数据 (天)',
    title: '气象站实时数据',
    subtitle: '土壤墒情与局地小气候实时监测'
  },
  { key: 'gis', label: 'GIS 数据 (图)', title: '地理信息可视化', subtitle: '土壤墒情热力分布图' }
]

const currentTitle = computed(() => tabs.find((t) => t.key === currentTab.value)?.title)
const currentSubtitle = computed(() => {
  const base = tabs.find((t) => t.key === currentTab.value)?.subtitle ?? ''
  if (currentTab.value === 'weather') {
    const pointName = getWeatherPointName(selectedWeatherPointId.value)
    const forecastHint = forecastDays.value.length ? ' · 含 7 日预报' : ''
    return `${pointName} · 土壤墒情与局地小气候实时监测${forecastHint}`
  }
  if (currentTab.value === 'drone' && remoteStore.selectedNdviDate) {
    const fieldName =
      remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ??
      remoteStore.selectedFieldId
    const datePart = `${fieldName} · ${remoteStore.selectedNdviDate}`
    if (remoteStore.compareEnabled && remoteStore.compareNdviDate) {
      return `${base} · ${datePart} · 对比 ${remoteStore.compareNdviDate}`
    }
    return `${base} · ${datePart}`
  }
  return base
})
const currentTabName = computed(() => tabs.find((t) => t.key === currentTab.value)?.label)

const remoteMapRef = ref<InstanceType<typeof RemoteSensingMap> | null>(null)
const lastMoistureQuery = ref<MoistureQueryResult | null>(null)

function onMoistureQuery(result: MoistureQueryResult) {
  lastMoistureQuery.value = result
}

const remoteRasterLayer = computed(() => {
  if (currentTab.value === 'drone') {
    return remoteStore.currentNdviRaster ?? NDVI_DEMO_LAYER
  }
  if (currentTab.value === 'gis') {
    return remoteStore.currentMoistureRaster ?? MOISTURE_DEMO_LAYER
  }
  return NDVI_DEMO_LAYER
})

const selectedFieldName = computed(() => {
  return (
    remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)?.name ??
    remoteStore.selectedFieldId ??
    '当前地块'
  )
})

const droneHighRiskBounds = computed(() => {
  if (currentTab.value !== 'drone' || !remoteStore.selectedFieldHighRisk) return null
  const field = remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)
  return field?.bounds ?? null
})

const droneFlightPath = computed(() => {
  if (currentTab.value !== 'drone') return null
  return remoteStore.currentDronePath
})

const ndviCompareImageUrl = computed(() => {
  if (currentTab.value !== 'drone' || !remoteStore.compareEnabled) return undefined
  return remoteStore.compareNdviRaster?.imageUrl
})

const mapDataSource = computed(() => remoteRasterLayer.value.source)

const ndviLegend = [
  { label: '低 (裸地/胁迫)', color: '#8b4513' },
  { label: '偏低', color: '#d4a574' },
  { label: '中等', color: '#f4e87c' },
  { label: '良好', color: '#7cb342' },
  { label: '高 (茂盛)', color: '#1b5e20' }
]

const soilLegend = [
  { label: '干旱', color: '#c62828' },
  { label: '偏干', color: '#ef6c00' },
  { label: '适中', color: '#fdd835' },
  { label: '湿润', color: '#42a5f5' },
  { label: '饱和', color: '#1565c0' }
]

const legendSteps = computed(() =>
  currentTab.value === 'drone' ? ndviLegend : soilLegend
)

const GIS_DEFAULT_AI =
  '土壤水分热力图显示栾城区一带墒情偏高，河间—雄县段偏干，建议分区灌溉。'

function formatMoistureSourceLabel(source: string) {
  return source === 'nearest-point' ? '最近监测点' : source
}

function moistureLevelHint(moisture: number) {
  if (moisture <= 20) return '墒情偏低，与参考站传感器读数一致，建议关注灌溉'
  if (moisture >= 60) return '墒情偏高，与参考站传感器读数一致，建议留意排水'
  return '墒情适中，与参考站传感器读数一致'
}

function buildGisAiConclusion(query: MoistureQueryResult) {
  const sourceLabel = formatMoistureSourceLabel(query.source)
  const levelHint = moistureLevelHint(query.moisture)
  return `${query.pointName} 附近墒情约 ${query.moisture}%（${sourceLabel}），${levelHint}。已定位至 ${query.pointName} 传感器。`
}

function buildDroneAiConclusion() {
  const fieldName =
    remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ?? '当前地块'
  if (
    remoteStore.compareEnabled &&
    remoteStore.compareNdviDate &&
    remoteStore.selectedNdviDate
  ) {
    return `${fieldName} 当前期 ${remoteStore.selectedNdviDate} 与对比期 ${remoteStore.compareNdviDate} 的 NDVI 影像叠加显示植被指数变化，长势较好区域可从画面上绿色加深区域辨识，建议结合田间踏查确认变量施肥范围。`
  }
  return `${fieldName} 出现轻微缺氮光谱特征，建议针对该区域进行无人机变量施肥。`
}

const aiConclusion = computed(() => {
  if (currentTab.value === 'sensor') {
    const alerts = dataStore.filteredAlerts || []
    const criticalCount = alerts.filter(
      (a: any) => a.level === 'critical' || a.level === 'high'
    ).length

    const latestAlert = alerts.find((a: any) => !a.handled)
    const latestMsg = latestAlert ? latestAlert.message : '目前设备运行平稳'

    if (criticalCount > 0) {
      return `系统分析检测到 ${criticalCount} 次高风险异常！最新问题为："${latestMsg}"，建议立即派人排查 pointId-${latestAlert?.pointId}。`
    } else {
      return `过去 7 天传感器网络运行平稳，偶发 ${alerts.length} 次轻微波动，建议维持当前灌溉策略。`
    }
  }

  if (currentTab.value === 'drone') {
    return buildDroneAiConclusion()
  }

  if (currentTab.value === 'gis') {
    return lastMoistureQuery.value
      ? buildGisAiConclusion(lastMoistureQuery.value)
      : GIS_DEFAULT_AI
  }

  if (currentTab.value === 'weather') {
    const reading = selectedWeatherReading.value
    if (!reading) {
      return '气象读数加载中或暂无数据，请切换监测站或稍后重试。'
    }
    return buildWeatherAiConclusion(reading, getWeatherPointName(selectedWeatherPointId.value))
  }

  return '数据分析中...'
})

const sensorChartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function shortPointName(pointId: number) {
  return getWeatherPointName(pointId).replace(/^监测站\s*·\s*/, '')
}

function defaultSensorPointIds(points = dataStore.filteredMonitorPoints) {
  return points.slice(0, 2).map((point) => point.id)
}

function onSensorPointsChange(ids: number[]) {
  if (ids.length > 3) {
    selectedSensorPointIds.value = ids.slice(0, 3)
    message.info('最多同时对比 3 个监测站')
  }
}

const SENSOR_LINE_PALETTE = [
  { temp: '#ff7875', vwc: '#69c0ff' },
  { temp: '#ffc53d', vwc: '#95de64' },
  { temp: '#b37feb', vwc: '#5cdbd3' }
]

function buildTrendSeries(
  stations: Array<{ pointId: number; name: string; rows: SensorReading[] }>
) {
  const dateSet = new Set<string>()
  for (const station of stations) {
    for (const row of station.rows) dateSet.add(String(row.recordedAt).slice(0, 10))
  }
  const dates = [...dateSet].sort()
  const labels = dates.map((d) => mdLabel(d))
  const series = stations.flatMap((station, index) => {
    const colors = SENSOR_LINE_PALETTE[index % SENSOR_LINE_PALETTE.length]
    const byDay = new Map(
      station.rows.map((row) => [String(row.recordedAt).slice(0, 10), row])
    )
    return [
      {
        name: `${station.name}-气温`,
        type: 'line' as const,
        smooth: true,
        yAxisIndex: 0,
        data: dates.map((d) => byDay.get(d)?.airTemp ?? null),
        lineStyle: { width: 3, color: colors.temp },
        itemStyle: { color: colors.temp }
      },
      {
        name: `${station.name}-墒情`,
        type: 'line' as const,
        smooth: true,
        yAxisIndex: 1,
        data: dates.map((d) => byDay.get(d)?.soilVwc ?? null),
        lineStyle: { width: 3, color: colors.vwc },
        itemStyle: { color: colors.vwc }
      }
    ]
  })
  return { labels, series, legend: series.map((item) => item.name) }
}

async function loadSensorReadings(pointIds: number[]) {
  const ids = pointIds.slice(0, 3)
  const { from, to } = last7DayRange()
  try {
    const results = await Promise.all(
      ids.map(async (pointId) => {
        const res = await fetchSensorReadings(pointId, from, to)
        return {
          pointId,
          name: shortPointName(pointId),
          rows: (res.data || []) as SensorReading[]
        }
      })
    )
    sensorByStation.value = results
  } catch {
    sensorByStation.value = []
    message.warning('传感器历史加载失败，请检查 Mock 服务')
  }
  await nextTick()
  renderSensorChart()
}

function renderSensorChart() {
  if (!sensorChartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(sensorChartRef.value)

  const { labels, series, legend } = buildTrendSeries(sensorByStation.value)

  chartInstance.setOption({
    backgroundColor: 'transparent',
    legend: {
      data: legend,
      textStyle: { color: '#fff' },
      top: 0
    },
    grid: { top: '18%', left: '3%', right: '6%', bottom: 40, containLabel: true },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: { color: '#fff', margin: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '℃',
        nameTextStyle: { color: '#fff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: '#fff' }
      },
      {
        type: 'value',
        name: '%',
        nameTextStyle: { color: '#fff' },
        splitLine: { show: false },
        axisLabel: { color: '#fff' }
      }
    ],
    series
  }, true)
  chartInstance.resize()
}

const switchTab = async (key: string) => {
  if (key === currentTab.value) return
  if (currentTab.value === 'gis' && key !== 'gis') {
    lastMoistureQuery.value = null
  }
  currentTab.value = key
  if (key === 'sensor') {
    await loadSensorReadings(selectedSensorPointIds.value)
  } else if (key === 'drone' || key === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
}

const reportModalVisible = ref(false)
const reportLoading = ref(false)
const reportMarkdown = ref('')
const reportPreview = computed(() =>
  reportMarkdown.value.split('\n').slice(0, 20).join('\n')
)

const handleGenerateReport = async () => {
  reportModalVisible.value = true
  reportLoading.value = true
  reportMarkdown.value = ''
  try {
    const res = await fetchDailyReport()
    reportMarkdown.value = res.data?.markdown || ''
    if (!reportMarkdown.value) throw new Error('empty report')
  } catch {
    reportModalVisible.value = false
    message.error('日报生成失败，请检查 Mock 服务')
  } finally {
    reportLoading.value = false
  }
}

const handleDownload = () => {
  if (!reportMarkdown.value) {
    message.error('暂无日报内容')
    return
  }
  const blob = new Blob([reportMarkdown.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const today = new Date()
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  link.href = url
  link.download = `监测日报-${stamp}.txt`
  link.click()
  URL.revokeObjectURL(url)
  reportModalVisible.value = false
}

function onWindowResize() {
  chartInstance?.resize()
  if (currentTab.value === 'drone' || currentTab.value === 'gis') {
    remoteMapRef.value?.invalidate()
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const tasks: Promise<unknown>[] = [
      remoteStore.fetchAll().catch(() => {
        message.warning('遥感图层加载失败，已使用本地演示数据')
      })
    ]
    if (dataStore.alerts.length === 0) {
      tasks.push(dataStore.fetchAlerts())
    }
    if (dataStore.monitorPoints.length === 0) {
      tasks.push(dataStore.fetchMonitorPoints())
    }
    if (dataStore.weatherReadings.length === 0) {
      tasks.push(
        dataStore.fetchWeatherReadings().catch(() => {
          message.warning('气象读数加载失败，请检查 Mock 服务')
        })
      )
    }
    tasks.push(
      fetchExtremeEvents()
        .then((res) => {
          extremeEvents.value = res.data || []
        })
        .catch(() => {
          extremeEvents.value = []
        })
    )
    tasks.push(loadForecast(selectedWeatherPointId.value))
    tasks.push(loadSensorReadings(selectedSensorPointIds.value))
    await Promise.all(tasks)
    syncSelectedWeatherPoint()
    if (currentTab.value === 'weather') {
      await Promise.all([
        loadThresholds(selectedWeatherPointId.value),
        loadForecast(selectedWeatherPointId.value)
      ])
    }
    await nextTick()
    renderSensorChart()
  } finally {
    loading.value = false
  }
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  selectedSensorPointIds,
  (pointIds) => {
    if (currentTab.value === 'sensor') {
      void loadSensorReadings(pointIds)
    }
  },
  { deep: true }
)

watch(remoteRasterLayer, async () => {
  if (currentTab.value === 'drone' || currentTab.value === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
})

watch(currentTab, (tab) => {
  if (tab !== 'weather') return
  const field = remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)
  syncSelectedWeatherPoint(field?.monitorPointId)
  void loadThresholds(selectedWeatherPointId.value)
  void loadForecast(selectedWeatherPointId.value)
})

watch(selectedWeatherPointId, (pointId) => {
  void loadThresholds(pointId)
  void loadForecast(pointId)
})

watch(
  () => dataStore.filteredMonitorPoints,
  () => {
    syncSelectedWeatherPoint()
    const points = dataStore.filteredMonitorPoints
    if (!points.length) return
    const selectedStillInRegion = selectedSensorPointIds.value.every((id) =>
      points.some((point) => Number(point.id) === Number(id))
    )
    if (!selectedStillInRegion || selectedSensorPointIds.value.length === 0) {
      selectedSensorPointIds.value = defaultSensorPointIds(points)
    }
  },
  { immediate: true }
)

watch(
  () => dataStore.selectedRegion,
  () => {
    syncSelectedWeatherPoint()
    const points = dataStore.filteredMonitorPoints
    if (points.length) {
      selectedSensorPointIds.value = defaultSensorPointIds(points)
    }
    if (currentTab.value === 'sensor') {
      void loadSensorReadings(selectedSensorPointIds.value)
    }
    if (currentTab.value === 'weather') {
      void loadThresholds(selectedWeatherPointId.value)
      void loadForecast(selectedWeatherPointId.value)
    }
  }
)
</script>

<style scoped>
.data-page-content {
  display: flex;
  height: 100%;
  width: 100%;
  max-width: var(--page-max-width);
  margin-inline: auto;
  padding: 30px;
  gap: 30px;
  box-sizing: border-box;
  overflow: hidden;
}

.chart-panel {
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--glass-border);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: var(--glass-text-primary);
}

.sub-title {
  font-size: 14px;
  color: var(--glass-text-muted);
  margin-top: 5px;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 0;
  background: rgb(0 0 0 / 10%);
  border-radius: 12px;
  overflow: hidden;
}

.full-content {
  width: 100%;
  height: 100%;
}

.sensor-chart {
  box-sizing: border-box;
  padding-bottom: 8px;
}

.map-visual {
  position: relative;
  overflow: hidden;
}

.high-risk-banner {
  position: absolute;
  top: 74px;
  left: 12px;
  right: auto;
  max-width: min(420px, calc(100% - 24px));
  z-index: 4;
}

.map-caption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  z-index: 4;
  pointer-events: none;
  max-width: min(280px, 55%);
  padding: 10px 14px;
  border-radius: 8px;
  background: rgb(0 0 0 / 55%);
  border: 1px solid rgb(255 255 255 / 15%);
  backdrop-filter: blur(8px);
  color: var(--glass-text-primary);
}

.map-caption h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.map-source {
  margin: 0;
  font-size: 12px;
  color: var(--glass-text-muted);
}

.map-meta {
  margin: 4px 0 0;
  font-size: 11px;
  color: rgb(255 255 255 / 55%);
}

.map-meta--hint {
  color: rgb(255 255 255 / 45%);
  font-style: italic;
}

.map-legend {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 4;
  pointer-events: none;
  min-width: 140px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgb(0 0 0 / 55%);
  border: 1px solid rgb(255 255 255 / 15%);
  backdrop-filter: blur(8px);
  color: var(--glass-text-primary);
}

.legend-title {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--glass-text-secondary);
}

.legend-bar {
  display: flex;
  height: 10px;
  border-radius: 4px;
  overflow: hidden;
}

.legend-step {
  flex: 1;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 10px;
  color: var(--glass-text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-actions :deep(.ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.header-actions :deep(.ant-btn-default),
.header-actions :deep(.ant-btn-background-ghost) {
  background-color: var(--glass-bg-subtle) !important;
  border-color: var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.weather-point-select {
  min-width: 240px;
  max-width: 360px;
}

.weather-point-select--multi {
  min-width: 260px;
}

.weather-point-select :deep(.ant-select-selector) {
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border-strong) !important;
  border-radius: 8px !important;
  color: var(--glass-text-primary) !important;
  box-shadow: none !important;
}

.weather-point-select.ant-select-focused :deep(.ant-select-selector),
.weather-point-select :deep(.ant-select-selector:hover) {
  border-color: var(--glass-border-strong) !important;
  box-shadow: none !important;
}

.weather-point-select :deep(.ant-select-selection-item),
.weather-point-select :deep(.ant-select-selection-placeholder) {
  color: var(--glass-text-primary) !important;
  overflow: hidden;
  text-overflow: ellipsis;
}

.weather-point-select :deep(.ant-select-arrow),
.weather-point-select :deep(.ant-select-clear) {
  color: var(--glass-text-muted) !important;
}

.weather-point-select :deep(.ant-select-selection-search-input) {
  color: var(--glass-text-primary) !important;
}

.weather-point-select--multi :deep(.ant-select-selection-item) {
  background-color: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border-strong) !important;
  border-radius: 6px !important;
  color: var(--glass-text-primary) !important;
}

.weather-point-select--multi :deep(.ant-select-selection-item-content) {
  color: var(--glass-text-primary) !important;
}

.weather-point-select--multi :deep(.ant-select-selection-item-remove) {
  color: var(--glass-text-muted) !important;
}

.weather-point-select--multi :deep(.ant-select-selection-item-remove:hover) {
  color: var(--glass-text-primary) !important;
}

.weather-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: var(--glass-text-muted);
  font-size: 14px;
}

.weather-extreme-tags {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.forecast-table {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 12px;
  scrollbar-width: thin;
  scrollbar-color: var(--dark-green) rgb(0 0 0 / 25%);
  --ant-color-bg-container: transparent;
  --ant-table-header-bg: transparent;
  --ant-table-row-hover-bg: var(--glass-bg-item-hover);
  --ant-table-border-color: var(--glass-border);
  --ant-color-text: var(--glass-text-primary);
  --ant-color-text-heading: var(--glass-text-secondary);
}

.forecast-table::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.forecast-table::-webkit-scrollbar-track {
  background: rgb(0 0 0 / 22%);
  border-radius: 8px;
}

.forecast-table::-webkit-scrollbar-thumb {
  background: var(--dark-green);
  border: 1px solid var(--glass-border-strong);
  border-radius: 8px;
}

.forecast-table :deep(.ant-table),
.forecast-table :deep(.ant-table-container),
.forecast-table :deep(.ant-table-content),
.forecast-table :deep(.ant-table-thead > tr > th),
.forecast-table :deep(.ant-table-tbody > tr > td) {
  background: transparent !important;
}

.forecast-table :deep(.ant-table) {
  color: var(--glass-text-primary);
}

.forecast-table :deep(.ant-table-thead > tr > th) {
  color: var(--glass-text-secondary) !important;
  font-weight: 600;
  text-shadow: var(--glass-text-shadow);
  border-bottom: 1px solid var(--glass-border) !important;
  padding: 8px 10px !important;
}

.forecast-table :deep(.ant-table-tbody > tr > td) {
  color: var(--glass-text-primary) !important;
  text-shadow: var(--glass-text-shadow);
  border-bottom: 1px solid var(--glass-border) !important;
  padding: 7px 10px !important;
}

.forecast-table :deep(.ant-table-tbody > tr:last-child > td) {
  border-bottom: none !important;
}

.forecast-table :deep(.ant-table-tbody > tr.ant-table-row:hover > td) {
  background: var(--glass-bg-item-hover) !important;
}

.forecast-table :deep(.ant-table-cell) {
  border-color: var(--glass-border) !important;
}

.forecast-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--glass-text-muted);
  font-size: 14px;
  padding: 12px;
  background: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

.report-preview {
  max-height: 320px;
  overflow: auto;
  margin: 0;
  padding: 12px;
  white-space: pre-wrap;
  font-size: 13px;
  line-height: 1.5;
  color: var(--glass-text-primary);
  background-color: var(--glass-bg-input);
  border: 1px solid var(--glass-border-strong);
  border-radius: 8px;
  scrollbar-width: thin;
  scrollbar-color: var(--dark-green) rgb(0 0 0 / 25%);
}

.report-preview::-webkit-scrollbar {
  width: 8px;
}

.report-preview::-webkit-scrollbar-track {
  background: rgb(0 0 0 / 22%);
  border-radius: 8px;
}

.report-preview::-webkit-scrollbar-thumb {
  background: var(--dark-green);
  border: 1px solid var(--glass-border-strong);
  border-radius: 8px;
}

.threshold-settings {
  flex-shrink: 0;
  padding: 12px;
  background: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
}

.weather-side-title,
.threshold-title {
  margin: 0 0 8px;
  color: var(--light-green);
  font-size: 14px;
  font-weight: 600;
  text-shadow: var(--glass-title-shadow);
}

.threshold-form {
  margin: 0;
}

.threshold-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
}

.threshold-form :deep(.ant-form-item) {
  margin-bottom: 8px;
}

.threshold-form :deep(.ant-form-item-label) {
  padding: 0 0 2px;
}

.threshold-form :deep(.ant-form-item-label > label) {
  color: var(--glass-text-secondary) !important;
  text-shadow: var(--glass-text-shadow);
}

.threshold-form :deep(.ant-input-number) {
  width: 100%;
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.threshold-form :deep(.ant-input-number-input) {
  color: var(--glass-text-primary) !important;
}

.threshold-form :deep(.ant-input-number-handler-wrap) {
  background: transparent;
  border-inline-start-color: var(--glass-border) !important;
}

.threshold-save-btn.ant-btn-primary {
  width: 100%;
  margin-top: 4px;
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.chart-wrapper--weather {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.weather-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.weather-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr);
  gap: 16px;
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
}

.weather-side {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.weather-forecast-block {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.weather-card {
  min-width: 0;
  width: 100%;
  min-height: 0;
  height: 100%;
  background: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--glass-text-primary) !important;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  text-shadow: var(--glass-text-shadow);
}

:deep(.weather-card.ant-card) {
  min-width: 0;
  width: 100%;
  min-height: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.weather-card .ant-card-head) {
  min-height: auto;
  padding: 0 10px;
}

:deep(.weather-card .ant-card-head-title) {
  white-space: normal;
  font-size: 13px;
  line-height: 1.35;
  padding: 8px 0;
}

:deep(.weather-card .ant-card-body) {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 8px 12px;
  line-height: 1.35;
  word-break: break-word;
}

:deep(.ant-card-head-title) {
  color: var(--glass-text-secondary) !important;
  text-shadow: var(--glass-text-shadow);
}

.ai-analysis-box {
  margin-top: 20px;
  background: rgb(74 92 67 / 30%);
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #73d13d;
  display: flex;
  align-items: center;
  gap: 15px;
}

.ai-tag {
  background: #73d13d;
  color: #1a2a1a;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 12px;
}

.ai-text {
  color: #eef1ea;
  font-size: 14px;
  line-height: 1.6;
}

.nav-buttons {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-btn {
  height: 60px !important;
  background: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--glass-text-secondary) !important;
  font-size: 16px !important;
  text-shadow: var(--glass-text-shadow);
}

.active-btn {
  background: linear-gradient(90deg, #4a5c43 0%, #2c3a26 100%) !important;
  color: #fff !important;
  border-color: #73d13d !important;
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

@media (width <= 992px) {
  .data-page-content {
    flex-direction: column;
    height: auto;
    min-height: 0;
    padding: 16px;
    gap: 16px;
    overflow: visible;
  }

  .chart-wrapper {
    min-height: 320px;
  }

  .nav-buttons {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    order: 1;
  }

  .chart-panel {
    order: 0;
    min-height: 480px;
  }

  .nav-btn {
    flex: 1 1 calc(50% - 4px);
    height: 48px !important;
    font-size: 14px !important;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .weather-layout {
    padding: 12px 16px;
  }

  .weather-body {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    overflow: auto;
  }

  .weather-side {
    overflow: visible;
  }

  .weather-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: minmax(110px, auto);
  }

  .weather-forecast-block {
    flex: 0 0 auto;
    min-height: 220px;
  }

  .ai-analysis-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (width <= 576px) {
  .data-page-content {
    padding: 12px;
    gap: 12px;
  }

  .title {
    font-size: 20px;
  }

  .nav-btn {
    flex: 1 1 100%;
    height: 44px !important;
    font-size: 13px !important;
  }

  .chart-wrapper {
    min-height: 260px;
  }

  .chart-panel {
    min-height: 420px;
  }

  .weather-layout {
    padding: 12px;
  }

  .weather-metrics {
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: minmax(100px, auto);
  }

  .weather-card {
    font-size: 24px !important;
  }

  .map-caption {
    max-width: calc(100% - 24px);
    left: 8px;
    bottom: 8px;
    padding: 8px 10px;
  }

  .map-legend {
    right: 8px;
    bottom: 8px;
    min-width: 120px;
    padding: 8px;
  }
}
</style>

<style>
.weather-point-select-dropdown.ant-select-dropdown {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-strong);
  border-radius: 8px;
  box-shadow: var(--glass-shadow);
  padding: 4px;
}

.weather-point-select-dropdown .ant-select-item {
  color: var(--glass-text-primary);
  border-radius: 6px;
}

.weather-point-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background: var(--glass-bg-item-hover) !important;
}

.weather-point-select-dropdown .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
  background: var(--glass-bg-active) !important;
  color: var(--glass-text-primary) !important;
  font-weight: 600;
}

.weather-point-select-dropdown .ant-select-item-option-state {
  color: var(--light-green);
}

.weather-point-select-dropdown .rc-virtual-list-holder {
  scrollbar-width: thin;
  scrollbar-color: var(--dark-green) rgb(0 0 0 / 25%);
}

.weather-point-select-dropdown .rc-virtual-list-holder::-webkit-scrollbar {
  width: 8px;
}

.weather-point-select-dropdown .rc-virtual-list-holder::-webkit-scrollbar-track {
  background: rgb(0 0 0 / 22%);
  border-radius: 8px;
}

.weather-point-select-dropdown .rc-virtual-list-holder::-webkit-scrollbar-thumb {
  background: var(--dark-green);
  border: 1px solid var(--glass-border-strong);
  border-radius: 8px;
}

.glass-report-modal-wrap .ant-modal-content,
.glass-report-modal-root .ant-modal-content {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-strong);
  border-radius: 12px;
  box-shadow: var(--glass-shadow);
}

.glass-report-modal-wrap .ant-modal-header,
.glass-report-modal-root .ant-modal-header {
  background: transparent !important;
  border-bottom: 1px solid var(--glass-border) !important;
}

.glass-report-modal-wrap .ant-modal-title,
.glass-report-modal-root .ant-modal-title {
  color: var(--light-green) !important;
  text-shadow: var(--glass-title-shadow);
}

.glass-report-modal-wrap .ant-modal-close,
.glass-report-modal-root .ant-modal-close {
  color: var(--glass-text-muted) !important;
}

.glass-report-modal-wrap .ant-modal-close:hover,
.glass-report-modal-root .ant-modal-close:hover {
  color: var(--glass-text-primary) !important;
}

.glass-report-modal-wrap .ant-modal-body,
.glass-report-modal-wrap .ant-modal-body p,
.glass-report-modal-root .ant-modal-body,
.glass-report-modal-root .ant-modal-body p {
  color: var(--glass-text-primary);
}

.glass-report-modal-wrap .ant-modal-footer,
.glass-report-modal-root .ant-modal-footer {
  border-top: 1px solid var(--glass-border) !important;
}

.glass-report-modal-wrap .ant-btn-default,
.glass-report-modal-root .ant-btn-default {
  background: var(--glass-bg-subtle) !important;
  border-color: var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.glass-report-modal-wrap .ant-btn-primary,
.glass-report-modal-root .ant-btn-primary {
  background: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}
</style>
