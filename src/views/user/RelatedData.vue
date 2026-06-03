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

        <div class="chart-wrapper">
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
            class="full-content"></div>

          <div
            v-if="currentTab === 'drone' || currentTab === 'gis'"
            class="full-content map-visual">
            <NdviLayerControls v-if="currentTab === 'drone'" />
            <RemoteSensingMap
              ref="remoteMapRef"
              :key="currentTab"
              :mode="currentTab === 'drone' ? 'ndvi' : 'moisture'"
              :image-url="remoteRasterLayer.imageUrl"
              :bounds="remoteRasterLayer.bounds"
              :show-monitor-points="currentTab === 'gis'"
              :monitor-points="dataStore.monitorPoints"
              :monitor-alerts="dataStore.alerts" />
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
              </p>
              <p
                v-if="currentTab === 'gis' && remoteStore.selectedMoistureDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedMoistureDate }} · 监测点为地面传感器
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
            class="weather-grid">
            <a-card
              class="weather-card"
              title="实时温度">
              32°C
            </a-card>
            <a-card
              class="weather-card"
              title="相对湿度">
              65%
            </a-card>
            <a-card
              class="weather-card"
              title="降水概率">
              15%
            </a-card>
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
      title="生成月度数据简报"
      @ok="handleDownload">
      <p>正在聚合分析最近 30 天的{{ currentTabName }}...</p>
      <a-progress
        :percent="reportProgress"
        status="active" />
      <div
        v-if="reportProgress === 100"
        style="margin-top: 10px; color: green">
        <CheckCircleOutlined />
        简报生成完毕，可下载。
      </div>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import RemoteSensingMap from '@/components/remote-sensing/RemoteSensingMap.vue'
import NdviLayerControls from '@/components/remote-sensing/NdviLayerControls.vue'
import { NDVI_DEMO_LAYER, MOISTURE_DEMO_LAYER } from '@/constants/remoteSensingLayers'
import { useDataStore } from '@/stores/data.ts'
import { useRemoteSensingStore } from '@/stores/remoteSensing'
import * as echarts from 'echarts'
import { FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const dataStore = useDataStore()
const remoteStore = useRemoteSensingStore()
const loading = ref(false)

const currentTab = ref('sensor')
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
    subtitle: '局地小气候实时监测'
  },
  { key: 'gis', label: 'GIS 数据 (图)', title: '地理信息可视化', subtitle: '土壤墒情热力分布图' }
]

const currentTitle = computed(() => tabs.find((t) => t.key === currentTab.value)?.title)
const currentSubtitle = computed(() => {
  const base = tabs.find((t) => t.key === currentTab.value)?.subtitle ?? ''
  if (currentTab.value === 'drone' && remoteStore.selectedNdviDate) {
    const fieldName =
      remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ??
      remoteStore.selectedFieldId
    return `${base} · ${fieldName} · ${remoteStore.selectedNdviDate}`
  }
  return base
})
const currentTabName = computed(() => tabs.find((t) => t.key === currentTab.value)?.label)

const remoteMapRef = ref<InstanceType<typeof RemoteSensingMap> | null>(null)

const remoteRasterLayer = computed(() => {
  if (currentTab.value === 'drone') {
    return remoteStore.currentNdviRaster ?? NDVI_DEMO_LAYER
  }
  if (currentTab.value === 'gis') {
    return remoteStore.currentMoistureRaster ?? MOISTURE_DEMO_LAYER
  }
  return NDVI_DEMO_LAYER
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

const aiConclusion = computed(() => {
  if (currentTab.value === 'sensor') {
    const alerts = dataStore.alerts || []
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
    const fieldName =
      remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ?? '当前地块'
    return `${fieldName} 出现轻微缺氮光谱特征，建议针对该区域进行无人机变量施肥。`
  }

  const otherConclusions: Record<string, string> = {
    weather: '未来 3 天无明显降雨，蒸腾作用强烈，请注意保墒。',
    gis: '土壤水分热力图显示栾城区一带墒情偏高，河间—雄县段偏干，建议分区灌溉。'
  }
  return otherConclusions[currentTab.value] || '数据分析中...'
})

const sensorChartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function buildTrendSeries() {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const labels: string[] = []
  const counts: number[] = []
  const alerts = dataStore.alerts || []

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now - i * dayMs)
    const label = `${start.getMonth() + 1}/${start.getDate()}`
    labels.push(label)

    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const dayEnd = dayStart + dayMs
    const c = alerts.filter((a: any) => a.time >= dayStart && a.time < dayEnd).length
    counts.push(c)
  }
  return { labels, counts }
}

function renderSensorChart() {
  if (!sensorChartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(sensorChartRef.value)

  const { labels, counts } = buildTrendSeries()

  chartInstance.setOption({
    backgroundColor: 'transparent',
    grid: { top: '15%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 报警数量: {c} 次' },
    xAxis: { type: 'category', boundaryGap: false, data: labels, axisLabel: { color: '#fff' } },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#fff' },
      minInterval: 1
    },
    series: [
      {
        name: '异常预警',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 80, 80, 0.5)' },
            { offset: 1, color: 'rgba(84,112,198,0.05)' }
          ])
        },
        lineStyle: { width: 3, color: '#ff7875' },
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  })
}

const switchTab = async (key: string) => {
  if (key === currentTab.value) return
  currentTab.value = key
  if (key === 'sensor') {
    await nextTick()
    chartInstance?.resize()
    renderSensorChart()
  } else if (key === 'drone' || key === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
}

const reportModalVisible = ref(false)
const reportProgress = ref(0)
let timer: any = null

const handleGenerateReport = () => {
  reportModalVisible.value = true
  reportProgress.value = 0
  timer = setInterval(() => {
    if (reportProgress.value >= 100) {
      clearInterval(timer)
    } else {
      reportProgress.value += 10
    }
  }, 200)
}

const handleDownload = () => {
  reportModalVisible.value = false
  message.success(`已下载《${currentTabName.value}分析简报.pdf》`)
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
    await Promise.all(tasks)
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
  () => dataStore.alerts,
  () => {
    if (currentTab.value === 'sensor') {
      renderSensorChart()
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

.map-visual {
  position: relative;
  overflow: hidden;
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

.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 40px;
}

.weather-card {
  background: var(--glass-bg-subtle) !important;
  border: 1px solid var(--glass-border) !important;
  color: var(--glass-text-primary) !important;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  text-shadow: var(--glass-text-shadow);
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

  .weather-grid {
    grid-template-columns: repeat(2, 1fr);
    padding: 20px;
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

  .weather-grid {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
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
