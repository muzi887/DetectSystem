<!-- src/views/RelatedData.vue -->
<template>
  <AppLayout>
    <div class="data-page-content">
      <!-- 左侧图表面板 -->
      <div class="chart-panel glass-panel">
        <div class="panel-header">
          <div class="header-left">
            <span class="title">{{ currentTitle }}</span>
            <span class="sub-title">{{ currentSubtitle }}</span>
          </div>

          <div class="header-actions">
            <!-- 新增：生成简报按钮 -->
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

        <!-- 内容区域：根据当前 Tab 动态展示不同内容 -->
        <div class="chart-wrapper">
          <!-- 加载遮罩 -->
          <div
            v-if="loading"
            class="loading-mask">
            <div class="loading-content">
              <a-spin size="large" />
              <p>正在接入异构数据流...</p>
            </div>
          </div>

          <!-- 情况1：传感器数据 (折线图) -->
          <div
            v-show="currentTab === 'sensor'"
            ref="sensorChartRef"
            class="full-content"></div>

          <!-- 情况2：无人机/GIS (模拟热力图/影像) -->
          <div
            v-if="currentTab === 'drone' || currentTab === 'gis'"
            class="full-content map-placeholder">
            <!-- 这里用 CSS 模拟一个热力图效果，实际项目中应替换为真实图片或地图组件 -->
            <div class="heatmap-mock">
              <div class="heat-point p1"></div>
              <div class="heat-point p2"></div>
              <div class="heat-point p3"></div>
            </div>
            <div class="overlay-info">
              <h3>{{ currentTab === 'drone' ? 'NDVI 植被指数分析' : '土壤湿度空间分布热力图' }}</h3>
              <p>
                数据来源：{{ currentTab === 'drone' ? 'DJI-Mavic-3M' : 'Sentinel-2 Satellite' }}
              </p>
            </div>
          </div>

          <!-- 情况3：气象数据 (仪表盘布局) -->
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

        <!-- 新增：智能分析结论区域 -->
        <div class="ai-analysis-box">
          <span class="ai-tag">AI 智能分析</span>
          <span class="ai-text">
            {{ aiConclusion }}
          </span>
        </div>
      </div>

      <!-- 右侧导航按钮 (Tab 切换) -->
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

    <!-- 简报生成弹窗 -->
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
import { useDataStore } from '@/stores/data.ts'
import * as echarts from 'echarts'
import { FilePdfOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const dataStore = useDataStore()
const loading = ref(false)

// --- Tab 逻辑 ---
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
const currentSubtitle = computed(() => tabs.find((t) => t.key === currentTab.value)?.subtitle)
const currentTabName = computed(() => tabs.find((t) => t.key === currentTab.value)?.label)

// --- 核心修改：基于真实数据的 AI 分析 ---
const aiConclusion = computed(() => {
  if (currentTab.value === 'sensor') {
    // 1. 统计高风险预警
    const alerts = dataStore.alerts || []
    const criticalCount = alerts.filter(
      (a: any) => a.level === 'critical' || a.level === 'high'
    ).length

    // 2. 获取最新一条未处理的消息
    const latestAlert = alerts.find((a: any) => !a.handled)
    const latestMsg = latestAlert ? latestAlert.message : '目前设备运行平稳'

    // 3. 动态生成文案
    if (criticalCount > 0) {
      return `系统分析检测到 ${criticalCount} 次高风险异常！最新问题为："${latestMsg}"，建议立即派人排查 pointId-${latestAlert?.pointId}。`
    } else {
      return `过去 7 天传感器网络运行平稳，偶发 ${alerts.length} 次轻微波动，建议维持当前灌溉策略。`
    }
  }

  // 其他 Tab 暂时保持模拟（因为你还没给我那些数据）
  const otherConclusions: Record<string, string> = {
    drone: '区域 A3 出现轻微缺氮光谱特征，建议针对该地块进行无人机变量施肥。',
    weather: '未来 3 天无明显降雨，蒸腾作用强烈，请注意保墒。',
    gis: '土壤水分热力图显示田块西北角长期处于低湿状态，建议检查滴灌管道。'
  }
  return otherConclusions[currentTab.value] || '数据分析中...'
})

// --- ECharts 逻辑 (仅 Sensor 使用) ---
const sensorChartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 核心修改：真实数据构建函数
function buildTrendSeries() {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const labels: string[] = []
  const counts: number[] = []
  const alerts = dataStore.alerts || []

  // 循环过去 7 天
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now - i * dayMs)
    const label = `${start.getMonth() + 1}/${start.getDate()}` // 生成如 "11/20"
    labels.push(label)

    // 计算当天的其实和结束时间戳
    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const dayEnd = dayStart + dayMs

    // 真实统计：筛选出这24小时内的报警数量
    const c = alerts.filter((a: any) => a.time >= dayStart && a.time < dayEnd).length
    counts.push(c)
  }
  return { labels, counts }
}

function renderSensorChart() {
  if (!sensorChartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(sensorChartRef.value)

  // 调用上面的真实数据函数
  const { labels, counts } = buildTrendSeries()

  chartInstance.setOption({
    backgroundColor: 'transparent',
    grid: { top: '15%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
    tooltip: { trigger: 'axis', formatter: '{b} <br/> 报警数量: {c} 次' }, // 优化 Tooltip 显示
    xAxis: { type: 'category', boundaryGap: false, data: labels, axisLabel: { color: '#fff' } },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#fff' },
      minInterval: 1 // 保证y轴不出现小数（报警次数只能是整数）
    },
    series: [
      {
        name: '异常预警',
        type: 'line',
        smooth: true,
        data: counts,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 80, 80, 0.5)' }, // 换个红色系，代表警报，更有冲击力
            { offset: 1, color: 'rgba(84,112,198,0.05)' }
          ])
        },
        lineStyle: { width: 3, color: '#ff7875' }, // 红色线条
        itemStyle: { color: '#ff4d4f' }
      }
    ]
  })
}

// --- 切换 Tab ---
const switchTab = async (key: string) => {
  loading.value = true
  currentTab.value = key

  // 模拟异构数据加载延迟
  setTimeout(async () => {
    loading.value = false
    if (key === 'sensor') {
      await nextTick()
      chartInstance?.resize() // 重新渲染图表
      renderSensorChart()
    }
  }, 500)
}

// --- 生成简报逻辑 ---
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

// --- 生命周期 & 监听 ---
// 初始化时一定要拉取数据，否则图表是空的
const initData = async () => {
  loading.value = true
  try {
    // 确保数据存在
    if (dataStore.alerts.length === 0) {
      await dataStore.fetchAlerts()
    }
    renderSensorChart()
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  renderSensorChart()
  window.addEventListener('resize', () => chartInstance?.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => chartInstance?.resize())
})

// 监听数据变化，如果有新报警推送过来，图表和AI结论会自动更新
watch(
  () => dataStore.alerts,
  () => {
    if (currentTab.value === 'sensor') {
      renderSensorChart()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.data-page-content {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 30px;
  gap: 30px;
  box-sizing: border-box;
  overflow: hidden;
}

.glass-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgb(20 30 20 / 60%); /* 深色半透明 */
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(15px);
  border: 1px solid rgb(255 255 255 / 15%);
  box-shadow: 0 8px 32px rgb(0 0 0 / 30%);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  font-family: 'Noto Serif SC', serif;
}

.sub-title {
  font-size: 14px;
  color: rgb(255 255 255 / 60%);
  margin-top: 5px;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 0;
  background: rgb(0 0 0 / 10%); /* 内容区底色 */
  border-radius: 12px;
  overflow: hidden;
}

.full-content {
  width: 100%;
  height: 100%;
}

/* 模拟热力图样式 */
.map-placeholder {
  background: linear-gradient(135deg, #1a2a1a 0%, #2f4f2f 100%);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.heatmap-mock {
  width: 80%;
  height: 80%;
  background: url('https://assets.codepen.io/t-1/shape.svg') no-repeat center; /* 仅作占位示意 */
  opacity: 0.5;
  filter: blur(30px);
  position: absolute;
}

.heat-point {
  position: absolute;
  border-radius: 50%;
  filter: blur(20px);
}

.p1 {
  width: 100px;
  height: 100px;
  background: red;
  top: 30%;
  left: 30%;
}

.p2 {
  width: 150px;
  height: 150px;
  background: yellow;
  top: 60%;
  right: 30%;
}

.p3 {
  width: 80px;
  height: 80px;
  background: orange;
  bottom: 20%;
  left: 40%;
}

.overlay-info {
  z-index: 2;
  text-align: center;
  color: #fff;
  background: rgb(0 0 0 / 50%);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(5px);
}

/* 气象卡片样式 */
.weather-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 40px;
}

.weather-card {
  background: rgb(255 255 255 / 10%) !important;
  border: none !important;
  color: white !important;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
}

:deep(.ant-card-head-title) {
  color: rgb(255 255 255 / 80%) !important;
}

/* AI 分析栏 */
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
  font-family: monospace;
}

.nav-buttons {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-btn {
  height: 60px !important;
  background: rgb(255 255 255 / 5%) !important;
  border: 1px solid rgb(255 255 255 / 10%) !important;
  color: rgb(255 255 255 / 70%) !important;
  font-size: 16px !important;
}

.active-btn {
  background: linear-gradient(90deg, #4a5c43 0%, #2c3a26 100%) !important;
  color: #fff !important;
  border-color: #73d13d !important;
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

.loading-mask {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 60%);
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.loading-content {
  text-align: center;
}
</style>
