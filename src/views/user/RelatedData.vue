<!-- src/views/RelatedData.vue -->
<template>
  <AppLayout>
    <div class="data-page-content">
      <!-- 左侧图表面板 -->
      <div class="chart-panel glass-panel">
        <div class="panel-header">
          <div class="header-left">
            <span class="title">传感器数据监控</span>
            <span class="sub-title">最近 7 天预警趋势</span>
          </div>
          <a-button
            size="small"
            ghost>
            查看详情
          </a-button>
        </div>

        <!-- ECharts 图表容器 -->
        <div class="chart-wrapper">
          <!-- 增加加载状态遮罩 -->
          <div
            v-if="loadingAlerts"
            class="loading-mask">
            <a-spin />
          </div>
          <div
            ref="chartRef"
            class="echarts-dom"></div>
        </div>
      </div>

      <!-- 右侧导航按钮 -->
      <div class="nav-buttons">
        <a-button
          type="primary"
          size="large"
          block
          class="nav-btn">
          传感器数据
        </a-button>
        <a-button
          size="large"
          block
          class="nav-btn">
          无人机遥感数据
        </a-button>
        <a-button
          size="large"
          block
          class="nav-btn">
          气象数据
        </a-button>
        <a-button
          size="large"
          block
          class="nav-btn">
          GIS数据
        </a-button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDataStore } from '@/stores/data.ts'
import * as echarts from 'echarts'

const dataStore = useDataStore()
const chartRef = ref<HTMLDivElement | null>(null)
const chartInstance = ref<echarts.ECharts | null>(null)
const loadingAlerts = ref(false)

// 构建最近 7 天数据（返回 reactive-friendly 值）//
function buildTrendSeries() {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const labels: string[] = []
  const counts: number[] = []

  // 【修复】防止 alerts 为空时报错，加一个 || []
  const alerts = dataStore.alerts || []

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now - i * dayMs)
    const label = `${start.getMonth() + 1}/${start.getDate()}`
    labels.push(label)
    const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const dayEnd = dayStart + dayMs

    // 使用安全的 alerts 数组
    const c = alerts.filter((a: any) => a.time >= dayStart && a.time < dayEnd).length
    counts.push(c)
  }
  return { labels, counts }
}

// 渲染图表
async function renderChart() {
  // 【修复】等待 DOM 更新完成后再初始化图表
  await nextTick()

  if (!chartRef.value) return

  // 避免重复 init
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }

  const { labels, counts } = buildTrendSeries() // 这里调用了，编辑器不应该报错

  chartInstance.value.setOption({
    // 移除背景色，使其透明
    backgroundColor: 'transparent',
    title: {
      // 如果需要在图表内显示标题，可以在这里加，但通常放在 HTML 更灵活
      show: false
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.7)', // 深色提示框
      borderColor: '#777',
      textStyle: { color: '#fff' },
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' }
      }
    },
    grid: {
      // 核心修改：让图表撑满容器，解决“窄”的问题
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false, // 让折线从最左侧开始
      data: labels,
      axisLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.3)' } }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.1)', // 虚淡的网格线
          type: 'dashed'
        }
      },
      axisLabel: { color: 'rgba(255,255,255,0.8)' }
    },
    series: [
      {
        name: '预警数量',
        type: 'line',
        stack: 'Total',
        smooth: true, // 平滑曲线
        lineStyle: {
          width: 3,
          color: '#5470C6' // 你的主色调
        },
        showSymbol: false, // 鼠标悬浮时才显示点，视觉更干净
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(84, 112, 198, 0.6)' }, // 渐变上
            { offset: 1, color: 'rgba(84, 112, 198, 0.05)' } // 渐变下
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: counts
      }
    ],

    // 建议加一行 resize 逻辑，确保初次渲染大小正确
    resize: true
  })
  // 强制调整一次大小
  chartInstance.value.resize()
}
// 拉取所有数据（force 可用于强制刷新）
const fetchAll = async (force = false) => {
  loadingAlerts.value = true
  try {
    await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts(force)])
    renderChart()
  } finally {
    loadingAlerts.value = false
  }
}

// ResizeObserver 用于监听容器大小变化（比 window.resize 更准）
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  fetchAll()

  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance.value?.resize()
    })
    resizeObserver.observe(chartRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chartInstance.value?.dispose()
})

// alerts 变化时自动刷新图表
watch(
  () => dataStore.alerts,
  () => {
    renderChart()
  },
  { deep: true }
)
</script>

<style scoped>
.data-page-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  height: 100%;
  padding: 40px; /* 增加外边距，避免贴边 */
  box-sizing: border-box;

  /* 如果 AppLayout 是 flex-col，加 flex: 1 确保它能撑开 */
  flex: 1;
  min-height: 0; /* 配合 flex 布局防止溢出 */
}

.glass-panel {
  background: rgb(255 255 255 / 5%); /* 更淡的背景 */
  border-radius: 24px; /* 更大的圆角 */
  padding: 24px;
  box-shadow: 0 8px 32px 0 rgb(0 0 0 / 30%);
  backdrop-filter: blur(20px);
  border: 1px solid rgb(255 255 255 / 10%);
}

.chart-panel {
  flex: 1; /* 占据剩余空间，不再写死 70% */
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 500px; /* 防止过小 */
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 对齐调整 */
  margin-bottom: 20px;
  color: #fff;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  padding-bottom: 10px;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
}

.sub-title {
  font-size: 14px;
  color: rgb(255 255 255 / 60%);
  margin-top: 4px;
}

/* 核心：图表包裹器 */
.chart-wrapper {
  flex: 1; /* 自动填满 chart-panel 的剩余高度 */
  width: 100%;
  position: relative; /* 【关键】作为定位基准 */
  min-height: 0; /* 防止 flex 子项溢出问题 */
  overflow: hidden; /* 确保内容不溢出 */
}

.echarts-dom {
  position: absolute; /* 【关键】绝对定位 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%; /* 撑满 chart-wrapper */
}

.loading-mask {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgb(0 0 0 / 20%);
  z-index: 10;
}

.nav-buttons {
  width: 240px; /* 稍微宽一点 */
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-btn {
  height: 64px !important;
  font-size: 18px !important;
  border-radius: 16px !important;
  background-color: rgb(255 255 255 / 5%) !important;
  border: 1px solid rgb(255 255 255 / 10%) !important;
  backdrop-filter: blur(10px);
  color: rgb(255 255 255 / 80%) !important;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgb(255 255 255 / 15%) !important;
  transform: translateX(-5px); /* 悬浮左移特效 */
}

/* 激活状态样式，或者 Antd 的 Primary 覆盖 */
.nav-btn.ant-btn-primary,
.active-btn {
  background: linear-gradient(135deg, #4a5c43 0%, #2c3a26 100%) !important;
  border-color: transparent !important;
  box-shadow: 0 4px 15px rgb(74 92 67 / 40%);
  color: #fff !important;
  font-weight: bold;
}
</style>
