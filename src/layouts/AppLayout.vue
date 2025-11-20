<!-- src/layouts/AppLayout.vue -->
<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="app-layout-container">
    <!-- 顶部 Header -->
    <header class="header">
      <!-- 1. 左侧 Logo -->
      <div
        class="logo-area"
        @click="goHome">
        <img
          src="@/assets/logo.jpg"
          alt="Logo"
          class="logo-img" />
        <span class="title">AI技术赋能下的作物灾害智慧监测预警系统</span>
      </div>

      <!-- 中间/右侧功能区 -->
      <div class="header-right">
        <!-- 2. 搜索框 -->
        <div class="search-area">
          <a-input-search
            placeholder="全局搜索..."
            style="width: 200px"
            class="custom-search" />
        </div>

        <!-- 3. 用户个人中心 -->
        <div class="user-profile">
          <!-- 使用 Ant Design 的下拉菜单 -->
          <a-dropdown placement="bottomRight">
            <div class="user-info-trigger">
              <!-- 头像 -->
              <a-avatar
                style="background-color: #87d068"
                :size="32">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <!-- 用户名 (如果没有则显示默认) -->
              <span class="username">{{ userStore.userInfo?.name || '管理员' }}</span>
              <DownOutlined class="arrow-icon" />
            </div>

            <!-- 下拉菜单内容 -->
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="settings">
                  <SettingOutlined />
                  系统设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item
                  key="logout"
                  style="color: #ff4d4f"
                  @click="handleLogout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <!-- 导航栏 (保持不变) -->
    <nav class="nav-bar">
      <router-link
        to="/home"
        class="nav-item">
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

    <!-- 内容插槽 -->
    <main class="content-slot">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message, Modal } from 'ant-design-vue'
import { UserOutlined, DownOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 点击 Logo 回到首页
const goHome = () => {
  router.push('/home')
}

// 处理退出登录
const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '您确定要退出当前账号吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      // 1. 调用 store 的 logout 方法 (清除 token 等)
      userStore.logout()

      message.success('已安全退出')

      // 2. 跳转回登录页
      router.push('/login')
    }
  })
}
</script>

<style scoped>
/* 1. @import 必须放在样式表的最第一行 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* 容器基础样式 */
.app-layout-container {
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/bg.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  color: #fff;
  box-sizing: border-box;
  overflow: hidden;

  /* 深沉色调 */
  --primary-green: #677662;
  --dark-green: #344e31; /* 深森林绿 */
  --light-green: #eef1ea;
  --glass-border: rgb(255 255 255 / 20%);
}

.content-slot {
  flex-grow: 1;
  box-sizing: border-box;
  padding: 20px 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Header 样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;

  /* 背景稍微深一点，增加质感 */
  background-color: rgb(50 70 50 / 85%);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  height: 64px;
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgb(0 0 0 / 20%);
}

.logo-area {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo-img {
  height: 40px;
  margin-right: 15px;
}

.title {
  font-size: 22px;

  /* 3. 字体应用：衬线体 */
  font-family: 'Noto Serif SC', 'Songti SC', SimSun, serif;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgb(0 0 0 / 50%);
}

/* Header 右侧区域 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 4. 搜索框深度美化：变成半透明深绿风格 */
.header-right :deep(.ant-input-wrapper) {
  background: transparent;
}

.header-right :deep(.ant-input) {
  background-color: rgb(255 255 255 / 10%) !important; /* 半透明背景 */
  border: 1px solid rgb(255 255 255 / 30%) !important;
  color: white !important;
  border-radius: 4px 0 0 4px;
}

.header-right :deep(.ant-input::placeholder) {
  color: rgb(255 255 255 / 60%);
}

.header-right :deep(.ant-input-search-button) {
  background-color: var(--dark-green) !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white !important;
  border-radius: 0 4px 4px 0;
}

/* 用户信息区域 */
.user-info-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;

  /* 增加一点边框感 */
  border: 1px solid transparent;
}

.user-info-trigger:hover {
  background-color: rgb(255 255 255 / 10%);
  border-color: rgb(255 255 255 / 20%);
}

.username {
  margin: 0 8px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;

  /* 用户名也稍微带点衬线感，或者保持无衬线清晰易读 */
  font-family: 'Helvetica Neue', sans-serif;
}

/* 导航栏样式 */
.nav-bar {
  display: flex;
  justify-content: center;

  /* 颜色调整：与Header呼应但稍浅 */
  background-color: rgb(90 110 90 / 85%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.nav-item {
  padding: 14px 30px; /* 增加一点点击区域 */
  color: rgb(255 255 255 / 90%);
  text-decoration: none;
  font-size: 17px;
  transition: all 0.3s;
  white-space: nowrap;
  position: relative;

  /* 5. 导航栏字体同步：使用衬线体 */
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-weight: bold;
  letter-spacing: 1px;
}

.nav-item:hover {
  background-color: rgb(0 0 0 / 10%);
  color: #fff;
}

/* 激活状态：底部加一个高亮条，而不是整个背景变色，更高级 */
.router-link-active.router-link-exact-active,
.nav-item.active {
  background-color: rgb(0 0 0 / 20%);
  color: #fff;
  text-shadow: 0 0 10px rgb(255 255 255 / 50%);
}
</style>
