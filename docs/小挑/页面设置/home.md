核心改动如下：

1. **迁移到 `<script setup>`**：为了与 `WarningSystem.vue` 保持一致并使用更现代的 Vue 3 语法，我将把组件的 `<script>` 部分转换为 `<script setup lang="ts">`。
2. **动态加载真实数据**：页面将不再使用硬编码的模拟数据。它会在加载时从 Pinia store (`useDataStore`) 中获取真实的**预警列表**和**监测点**数据。
3. **更新核心指标**：
    - “当前预警”将动态显示**未处理**的预警数量。
    - “监测区域”将更新为显示**监测点总数**，这更符合我们拥有的数据。
4. **更新最新预警列表**：列表将显示从服务器获取的、按时间倒序排列的最新几条预警信息，并根据真实的预警级别 (`low`, `medium`, `high`, `critical`, `warning`) 应用不同的颜色样式。
5. **同步样式**：添加 `critical` 和 `warning` 级别的样式，确保所有预警类型都能正确显示。

这是修改后的 `Home.vue` 文件：

```vue
<!-- src/views/user/Home.vue-->
<template>
  <div class="app-layout-container">
    <!-- 顶部 Header -->
    <header class="header">
      <div class="logo-area">
        <img
          src="@/assets/logo.jpg"
          alt="Logo"
          class="logo-img"
        />
        <span class="title">AI技术赋能下的作物灾害智慧监测预警系统</span>
      </div>
      <div class="search-area">
        <a-input-search
          placeholder="输入关键字..."
          style="width: 250px"
          enter-button="搜索"
        />
      </div>
    </header>

    <!-- 导航栏  -->
    <nav class="nav-bar">
      <!-- 当前页面设为 active -->
      <router-link
        to="/home"
        class="nav-item active"
      >
        首页
      </router-link>

      <router-link
        to="/related-data"
        class="nav-item"
      >
        相关数据
      </router-link>
      <router-link
        to="/map"
        class="nav-item"
      >
        灾害实时监测
      </router-link>
      <router-link
        to="/analysis"
        class="nav-item"
      >
        智能分析
      </router-link>
      <router-link
        to="/warnings"
        class="nav-item"
      >
        灾害预警
      </router-link>
      <router-link
        to="/decision"
        class="nav-item"
      >
        智慧决策
      </router-link>
      <router-link
        to="/about"
        class="nav-item"
      >
        关于我们
      </router-link>
    </nav>

    <!-- 主体内容 (首页仪表盘内容) -->
    <main class="main-content">
      <div class="dashboard-panel welcome">
        <h2>欢迎！</h2>
        <p>AI作物灾害智慧监测预警系统为您提供最新、最准确的农情数据和预警信息。</p>
        <div class="quick-links">
          <router-link
            to="/map"
            class="quick-btn"
          >
            实时监测
          </router-link>
          <router-link
            to="/warnings"
            class="quick-btn"
          >
            处理预警
          </router-link>
          <router-link
            to="/analysis"
            class="quick-btn"
          >
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
            <p class="value" style="color: #4caf50;">正常</p>
          </div>
        </div>
      </div>

      <div class="dashboard-panel recent-alerts">
        <h3>最新预警动态</h3>
        <a-list
          item-layout="horizontal"
          :data-source="recentAlerts"
          :loading="dataStore.loadingAlerts"
        >
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
            <a-empty description="暂无预警信息" style="color: white; padding-top: 20px" />
          </template>
        </a-list>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDataStore, type AlertLevel } from '@/stores/data'

// 初始化 Pinia store
const dataStore = useDataStore()

// --- 计算属性，用于动态展示数据 ---

// 计算未处理的预警数量
const unhandledAlertsCount = computed(() => {
  return dataStore.alerts.filter(alert => !alert.handled).length
})

// 获取监测点总数
const monitorPointsCount = computed(() => dataStore.monitorPoints.length)

// 获取最新的3条预警信息
const recentAlerts = computed(() => {
  // store中已按时间排序，直接取前几个即可
  return dataStore.alerts.slice(0, 3)
})


// --- 方法 ---

// 格式化时间戳 (与 WarningSystem.vue 中一致)
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

// --- 生命周期钩子 ---

// 组件加载时，从服务器获取最新数据
onMounted(() => {
  dataStore.fetchAlerts()
  dataStore.fetchMonitorPoints()
})
</script>

<style scoped>
/* ---------------------------------------------------- */
/* 基础布局和颜色变量 (保持不变) */
/* ---------------------------------------------------- */
.app-layout-container {
  width: 100vw;
  min-height: 100vh;
  background-image: url('@/assets/bg.webp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;

  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);
}

/* 顶部 Header (保持不变) */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: rgb(103 118 98 / 80%);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}
.logo-area { display: flex; align-items: center; }
.logo-img { height: 40px; margin-right: 15px; }
.title { font-size: 20px; font-weight: bold; }
.search-area :deep(.ant-input-search-button) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
}
.search-area :deep(.ant-input) {
  background-color: var(--light-green) !important;
  color: #333 !important;
}

/* 导航栏 (保持不变) */
.nav-bar {
  display: flex;
  justify-content: center;
  background-color: rgb(135 149 128 / 90%);
  box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
}
.nav-item {
  padding: 12px 25px;
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s;
}
.nav-item:hover { background-color: rgb(0 0 0 / 10%); }
.nav-item.active { background-color: var(--dark-green); font-weight: bold; }

/* ---------------------------------------------------- */
/*  Home 页面（仪表盘）内容样式 (部分保持不变, 部分修改) */
/* ---------------------------------------------------- */
.main-content {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 24px; /* 增加间距 */
  padding: 24px;
  max-width: 1300px; /* 稍微加宽 */
  width: 100%;
  margin: 20px auto;
}

/* 玻璃感面板通用样式 (保持不变) */
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

/* 欢迎面板 (保持不变) */
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
.welcome p { margin-bottom: 20px; font-size: 16px; }
.quick-links { display: flex; justify-content: center; gap: 20px; }
.quick-btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--dark-green);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: background-color 0.3s;
}
.quick-btn:hover { background-color: #5d7454; }

/* 统计面板 (保持不变) */
.stats { grid-column: 1 / 2; }
.stats h3, .recent-alerts h3 {
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
  margin-top: auto; /* 使其在 flex 容器中底部对齐 */
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
.stat-card .alert { color: #ff9800; } /* 橙色高亮 */

/* 最新预警面板 (样式修改) */
.recent-alerts { grid-column: 2 / 3; }
.recent-alerts :deep(.ant-list) { color: white; flex-grow: 1; }
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
.recent-alerts :deep(.ant-list-item-meta-title a:hover) { color: var(--light-green); }
.recent-alerts :deep(.ant-list-item-meta-description) {
  color: rgb(255 255 255 / 70%);
  font-size: 12px;
}
.recent-alerts :deep(.ant-empty-description) {
  color: rgb(255 255 255 / 60%) !important;
}


/* --- 【核心修改】添加与 WarningSystem.vue 同步的级别样式 --- */
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
```