<!-- src/views/user/Home.vue-->
<template>
  <!-- 1. 直接使用布局组件，无需重复编写 Header 和 Nav -->
  <AppLayout>
    <!-- 内容区域：不需要再写 main 标签，直接用 div -->
    <div class="dashboard-container">
      <!-- 欢迎面板 -->
      <div class="dashboard-panel welcome">
        <h2>欢迎！</h2>
        <p>AI作物灾害智慧监测预警系统为您提供最新、最准确的农情数据和预警信息。</p>
        <div class="quick-links">
          <router-link
            to="/map"
            class="quick-btn">
            实时监测
          </router-link>
          <router-link
            to="/warnings"
            class="quick-btn">
            处理预警
          </router-link>
          <router-link
            to="/analysis"
            class="quick-btn">
            智能分析
          </router-link>
        </div>
      </div>

      <!-- 核心指标面板 -->
      <div class="dashboard-panel stats">
        <h3>核心指标概览</h3>
        <div class="stat-grid">
          <div class="stat-card">
            <h4>监测点总数</h4>
            <!-- 动态数据：监测点数量 -->
            <p class="value">{{ monitorPointsCount }} 个</p>
          </div>
          <div class="stat-card">
            <h4>当前待处理</h4>
            <!-- 动态数据：未处理的预警数量 -->
            <p class="value alert">{{ unhandledAlertsCount }} 条</p>
          </div>
          <div class="stat-card">
            <h4>系统状态</h4>
            <p
              class="value"
              style="color: #4caf50">
              正常
            </p>
          </div>
        </div>
      </div>

      <!-- 最新预警面板 -->
      <div class="dashboard-panel recent-alerts">
        <h3>最新预警动态</h3>
        <a-list
          item-layout="horizontal"
          :data-source="recentAlerts"
          :loading="dataStore.loadingAlerts">
          <template #renderItem="{ item }">
            <a-list-item>
              <!-- 使用真实数据的时间戳 -->
              <a-list-item-meta :description="formatTime(item.time)">
                <template #title>
                  <!-- 使用真实数据的级别和消息 -->
                  <a :class="getLevelClass(item.level)">
                    监测点 #{{ item.pointId }}: {{ item.message }}
                  </a>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
          <template #empty>
            <a-empty
              description="暂无预警信息"
              style="color: white; padding-top: 20px" />
          </template>
        </a-list>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDataStore, type AlertLevel } from '@/stores/data'
import AppLayout from '@/layouts/AppLayout.vue'

// 初始化 Pinia store
const dataStore = useDataStore()

// --- 计算属性，用于动态展示数据---
// 计算未处理的预警数量
const unhandledAlertsCount = computed(() => {
  return dataStore.alerts.filter((alert) => !alert.handled).length
})

// 获取监测点总数
const monitorPointsCount = computed(() => dataStore.monitorPoints.length)

// 获取最新的3条预警信息
const recentAlerts = computed(() => {
  // store中已按时间排序，直接取前几个即可
  return dataStore.alerts.slice(0, 3)
})

// --- 方法 ---
// 格式化时间戳
const formatTime = (t?: number) => {
  if (!t) return '-'
  const d = new Date(t)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}

// 根据预警级别返回对应的 CSS class
const getLevelClass = (level: AlertLevel) => {
  return `level-${level}`
}

// --- 生命周期钩子  ---
// 组件加载时，从服务器获取最新数据
onMounted(() => {
  dataStore.fetchAlerts()
  dataStore.fetchMonitorPoints()
})
</script>

<style scoped>
/* 定义本地变量，确保颜色正确 (因为父组件 styles 是 scoped 的) */
.dashboard-container {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);

  /* 布局控制 */
  width: 100%;
  max-width: 1300px;
  margin: 0 auto; /* 水平居中 */

  /* 使用 Grid 布局 */
  display: grid;
  grid-template-columns: 2fr 1fr; /* 左边宽，右边窄 */
  grid-template-rows: auto 1fr; /* 第一行自适应，第二行撑满 */
  gap: 24px;

  /* 确保高度撑满视口剩余空间，看起来更饱满 */
  min-height: 100%;
}

/* 玻璃感面板通用样式 */
.dashboard-panel {
  background-color: var(--glass-bg);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 20%);
  color: #fff;
  display: flex;
  flex-direction: column;
}

/* 欢迎面板 (跨两列) */
.welcome {
  grid-column: 1 / 3;
  padding: 40px;
  text-align: center;
  background-color: rgb(74 92 67 / 40%); /* 稍微加深一点背景 */
  align-items: center;
  justify-content: center;
}

.welcome h2 {
  color: var(--light-green);
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: bold;
}

.welcome p {
  margin-bottom: 30px;
  font-size: 18px;
  color: rgb(255 255 255 / 90%);
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.quick-btn {
  padding: 12px 30px;
  background-color: var(--dark-green);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.quick-btn:hover {
  background-color: #5d7454;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

/* 统计面板 (左下) */
.stats {
  grid-column: 1 / 2;
}

.stats h3,
.recent-alerts h3 {
  padding-bottom: 15px;
  border-bottom: 1px solid rgb(255 255 255 / 20%);
  margin-bottom: 20px;
  font-size: 18px;
  color: var(--light-green);
  font-weight: bold;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  flex-grow: 1; /* 让 grid 填满剩余高度 */
  align-content: center; /* 内容垂直居中 */
}

.stat-card {
  padding: 25px 15px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 12px;
  text-align: center;
  background-color: rgb(255 255 255 / 5%);
  transition: transform 0.3s;
}

.stat-card:hover {
  background-color: rgb(255 255 255 / 8%);
}

.stat-card h4 {
  color: rgb(255 255 255 / 80%);
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-card .value {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: #fff;
}

.stat-card .alert {
  color: #ff9800;
}

/* 最新预警面板 (右下) */
.recent-alerts {
  grid-column: 2 / 3;

  /* 确保列表过长时只在卡片内部滚动，不撑破布局 (可选) */
  overflow: hidden;
}

.recent-alerts :deep(.ant-list) {
  color: white;
  flex-grow: 1;
  overflow-y: auto; /* 允许列表内部滚动 */
}

.recent-alerts :deep(.ant-list-item) {
  border-block-end: 1px solid rgb(255 255 255 / 15%) !important;
  padding: 16px 0;
}

.recent-alerts :deep(.ant-list-item-meta-title a) {
  color: rgb(255 255 255 / 95%);
  font-weight: normal;
  transition: color 0.3s;
  font-size: 14px;
}

.recent-alerts :deep(.ant-list-item-meta-title a:hover) {
  color: var(--light-green);
  text-decoration: underline;
}

.recent-alerts :deep(.ant-list-item-meta-description) {
  color: rgb(255 255 255 / 60%);
  font-size: 12px;
  margin-top: 4px;
}

/* --- 预警级别样式 --- */
.level-critical {
  color: #cf1322 !important;
  font-weight: bold !important;
}

.level-high {
  color: #ff4d4f !important;
  font-weight: bold !important;
}

.level-warning {
  color: #faad14 !important;
}

.level-medium {
  color: #faad14 !important;
}

.level-low {
  color: #52c41a !important;
}
</style>
