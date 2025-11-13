<!-- src/views/user/Home.vue-->
<template>
  <div class="app-layout-container">
    <!-- 顶部 Header -->
    <header class="header">
      <div class="logo-area">
        <img
          src="@/assets/logo.jpg"
          alt="Logo"
          class="logo-img" />
        <span class="title">AI技术赋能下的作物灾害智慧监测预警系统</span>
      </div>
      <div class="search-area">
        <a-input-search
          placeholder="输入关键字..."
          style="width: 250px"
          enter-button="搜索" />
      </div>
    </header>

    <!-- 导航栏  -->
    <nav class="nav-bar">
      <!-- 注意：在真正的 Home 页面，可以将当前页面设为 active -->
      <router-link
        to="/home"
        class="nav-item active">
        首页
      </router-link>

      <router-link
        to="/related-data"
        class="nav-item">
        相关数据
      </router-link>
      <router-link
        to="/map"
        class="nav-item">
        灾害实时监测
      </router-link>
      <router-link
        to="/analysis"
        class="nav-item">
        智能分析
      </router-link>
      <router-link
        to="/warnings"
        class="nav-item">
        灾害预警
      </router-link>
      <router-link
        to="/decision"
        class="nav-item">
        智慧决策
      </router-link>
      <router-link
        to="/about"
        class="nav-item">
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
            class="quick-btn">
            实时监测
          </router-link>
          <router-link
            to="/warnings"
            class="quick-btn">
            最新预警
          </router-link>
          <router-link
            to="/analysis"
            class="quick-btn">
            查看报告
          </router-link>
        </div>
      </div>

      <div class="dashboard-panel stats">
        <h3>核心指标概览</h3>
        <div class="stat-grid">
          <div class="stat-card">
            <h4>监测区域</h4>
            <p class="value">230,000 亩</p>
          </div>
          <div class="stat-card">
            <h4>当前预警</h4>
            <p class="value alert">5 条</p>
          </div>
          <div class="stat-card">
            <h4>数据更新</h4>
            <p class="value">10 分钟前</p>
          </div>
        </div>
      </div>

      <div class="dashboard-panel recent-alerts">
        <h3>最新预警动态</h3>
        <a-list
          item-layout="horizontal"
          :data-source="recentAlerts">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :description="item.time">
                <template #title>
                  <a :class="item.type">{{ item.title }}</a>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </div>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    // 模拟最新预警数据
    const recentAlerts = ref([
      {
        title: '霜冻预警：黄淮平原小麦区有低温风险',
        time: '2024-05-15 09:30',
        type: 'level-high'
      },
      {
        title: '病虫害监测：部分玉米出现蚜虫侵染',
        time: '2024-05-14 16:45',
        type: 'level-medium'
      },
      {
        title: '干旱趋势：华北地区未来一周降水不足',
        time: '2024-05-14 10:00',
        type: 'level-low'
      }
    ])

    return {
      recentAlerts
    }
  }
})
</script>

<style scoped>
/* ---------------------------------------------------- */

/* 基础布局和颜色变量 */

/* ---------------------------------------------------- */
.app-layout-container {
  width: 100vw;
  min-height: 100vh; /* 允许内容撑开 */
  background-image: url('@/assets/bg.webp'); /* 统一背景 */
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;

  /* 颜色变量 */
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%); /* 玻璃背景色 */
}

/* 顶部 Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: rgb(103 118 98 / 80%);
  backdrop-filter: blur(5px);
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  margin-right: 15px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.search-area :deep(.ant-input-search-button) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
}

.search-area :deep(.ant-input) {
  background-color: var(--light-green) !important;
}

/* 导航栏 */
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

.nav-item:hover {
  background-color: rgb(0 0 0 / 10%);
}

.nav-item.active {
  background-color: var(--dark-green); /* 当前页面的激活状态 */
  font-weight: bold;
}

/* ---------------------------------------------------- */

/*  Home 页面（仪表盘）内容样式 */

/* ---------------------------------------------------- */
.main-content {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 2fr 1fr; /* 两栏布局 */
  grid-template-rows: auto 1fr;
  gap: 20px;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
  margin: 20px auto; /* 居中显示 */
}

/* 玻璃感面板通用样式  */
.dashboard-panel {
  background-color: var(--glass-bg);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 20%);
  color: #fff;
}

/* 欢迎面板 */
.welcome {
  grid-column: 1 / 3; /* 跨越两列 */
  padding: 30px;
  text-align: center;
  background-color: rgb(74 92 67 / 50%); /* 更浓的背景色 */
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

/* 统计面板 */
.stats {
  grid-column: 1 / 2;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.stat-card {
  padding: 15px;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 8px;
  text-align: center;
  background-color: rgb(255 255 255 / 5%);
}

.stat-card h4 {
  color: var(--light-green);
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-card .value {
  font-size: 28px;
  font-weight: bold;
}

.stat-card .alert {
  color: #f90; /* 预警数字高亮 */
}

/* 最新预警面板 */
.recent-alerts {
  grid-column: 2 / 3;
}

.recent-alerts :deep(.ant-list) {
  color: white;
}

.recent-alerts :deep(.ant-list-item) {
  border-block-end: 1px solid rgb(255 255 255 / 20%);
  padding-block: 10px;
}

.recent-alerts :deep(.ant-list-item-meta-title a) {
  color: white;
  font-weight: normal;
  transition: color 0.3s;
}

.recent-alerts :deep(.ant-list-item-meta-title a:hover) {
  color: var(--light-green);
}

.recent-alerts :deep(.ant-list-item-meta-description) {
  color: rgb(255 255 255 / 70%);
  font-size: 12px;
}

.level-high {
  color: #ff4d4f !important; /* 红色警告 */
  font-weight: bold !important;
}

.level-medium {
  color: #faad14 !important; /* 黄色中等警告 */
}

.level-low {
  color: #1890ff !important; /* 蓝色低等警告 */
}
</style>
