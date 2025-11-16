<!-- src/views/user/Home.vue-->
<template>
  <!-- 1. 直接使用布局组件，无需重复编写 Header 和 Nav -->
  <AppLayout>
    <!-- 主体内容 (首页仪表盘内容) -->
    <main class="main-content">
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
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDataStore, type AlertLevel } from '@/stores/data'
// 2. 引入 AppLayout 组件
import AppLayout from '@/layouts/AppLayout.vue'

// 初始化 Pinia store
const dataStore = useDataStore()

// --- 计算属性，用于动态展示数据 (保持不变) ---

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

// --- 方法 (保持不变) ---

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

// --- 生命周期钩子 (保持不变) ---

// 组件加载时，从服务器获取最新数据
onMounted(() => {
  dataStore.fetchAlerts()
  dataStore.fetchMonitorPoints()
})
</script>

<style scoped>
/* 3. 移除所有布局（.app-layout-container, .header, .nav-bar, etc.）相关的 CSS */

/* 由于 AppLayout.vue 没有定义 --glass-bg，我们需要在这里定义所有 dashboard 需要的变量 */
:root {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);
}

/* ---------------------------------------------------- */

/* Home 页面（仪表盘）内容样式 */

/* ---------------------------------------------------- */
.main-content {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 24px;

  /* 4. 调整 padding 和 margin，因为 AppLayout 的 content-slot 已经提供了外层 padding */
  padding: 0;
  max-width: 1300px;
  width: 100%;
  margin: 0 auto; /* 仅用于居中 */
}

/* 玻璃感面板通用样式 (保留) */
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

/* 欢迎面板 (保留) */
.welcome {
  grid-column: 1 / 3;
  padding: 30px;
  text-align: center;
  background-color: rgb(74 92 67 / 50%);
}

.welcome h2 {
  color: var(--light-green);
  font-size: 28px;
  margin-bottom: 10px;
}

.welcome p {
  margin-bottom: 20px;
  font-size: 16px;
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.quick-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--dark-green);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.quick-btn:hover {
  background-color: #5d7454;
}

/* 统计面板 (保留) */
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
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: auto;
  margin-bottom: auto;
}

.stat-card {
  padding: 20px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 8px;
  text-align: center;
  background-color: rgb(255 255 255 / 5%);
}

.stat-card h4 {
  color: var(--light-green);
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: normal;
}

.stat-card .value {
  font-size: 28px;
  font-weight: bold;
}

.stat-card .alert {
  color: #ff9800;
} /* 橙色高亮 */

/* 最新预警面板 (保留) */
.recent-alerts {
  grid-column: 2 / 3;
}

.recent-alerts :deep(.ant-list) {
  color: white;
  flex-grow: 1;
}

.recent-alerts :deep(.ant-list-item) {
  border-block-end: 1px solid rgb(255 255 255 / 20%) !important;
  padding-block: 12px;
}

.recent-alerts :deep(.ant-list-item-meta-title a) {
  color: white;
  font-weight: normal;
  transition: color 0.3s;
  font-size: 14px;
}

.recent-alerts :deep(.ant-list-item-meta-title a:hover) {
  color: var(--light-green);
}

.recent-alerts :deep(.ant-list-item-meta-description) {
  color: rgb(255 255 255 / 70%);
  font-size: 12px;
}

.recent-alerts :deep(.ant-empty-description) {
  color: rgb(255 255 255 / 60%) !important;
}

/* --- 预警级别样式 (保留) --- */
.level-critical {
  color: #a70000 !important;
  font-weight: bold !important;
}

.level-high {
  color: #ff4d4f !important;
  font-weight: bold !important;
}

.level-warning {
  color: #ffc53d !important;
}

.level-medium {
  color: #faad14 !important;
}

.level-low {
  color: #1890ff !important;
}
</style>

Evaluate Compare 9,230 个 token 自动清除
