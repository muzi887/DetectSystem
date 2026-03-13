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
        <!-- 2. 搜索框 + 全局搜索下拉 -->
        <div class="search-area" ref="searchAreaRef">
          <div class="search-input-wrap">
            <input
              ref="searchInputRef"
              v-model="searchKeyword"
              type="text"
              class="search-input"
              placeholder="全局搜索..."
              @input="onSearchInput(($event.target as HTMLInputElement)?.value ?? '')"
              @keydown.enter="onSearch(searchKeyword)" />
            <button
              type="button"
              class="search-btn"
              @click="onSearch(searchKeyword)"
              aria-label="搜索">
              <SearchOutlined />
            </button>
          </div>
          <Teleport to="body">
            <div
              ref="searchDropdownRef"
              v-show="searchVisible && searchKeyword.trim()"
              class="global-search-dropdown"
              :style="searchDropdownStyle"
              @click.stop>
              <div v-if="searchLoading" class="search-dropdown-loading">
                <a-spin size="small" /> 搜索中...
              </div>
              <template v-else>
                <div
                  v-if="searchResults.length === 0"
                  class="search-dropdown-empty">
                  未找到与「{{ searchKeyword }}」相关的内容
                </div>
                <div v-else class="search-dropdown-list">
                  <div
                    v-for="r in searchResults"
                    :key="r.id"
                    class="search-dropdown-item"
                    @click="selectSearchResult(r)">
                    <span class="search-item-type" :class="r.type">
                      {{ r.type === 'menu' ? '页面' : r.type === 'monitor' ? '监测点' : '预警' }}
                    </span>
                    <div class="search-item-content">
                      <span class="search-item-title">{{ r.title }}</span>
                      <span v-if="r.subtitle" class="search-item-subtitle">{{ r.subtitle }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </Teleport>
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

    <!-- 导航栏 -->
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
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message, Modal } from 'ant-design-vue'
import { UserOutlined, DownOutlined, LogoutOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const router = useRouter()
const userStore = useUserStore()
const searchAreaRef = ref<HTMLElement | null>(null)
const searchDropdownRef = ref<HTMLElement | null>(null)

const {
  keyword: searchKeyword,
  visible: searchVisible,
  results: searchResults,
  search,
  selectResult: selectSearchResult,
  close: closeSearch,
  ensureData
} = useGlobalSearch()

const searchLoading = ref(false)
const searchDropdownStyle = ref<Record<string, string>>({})

async function onSearchInput(value: string) {
  search(value)
  if (value.trim()) {
    searchLoading.value = true
    await ensureData()
    searchLoading.value = false
  }
}

function onSearch(value: string) {
  search(value)
}

function updateDropdownPosition() {
  if (searchAreaRef.value) {
    const rect = searchAreaRef.value.getBoundingClientRect()
    searchDropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${Math.max(rect.width, 320)}px`,
      zIndex: '1050'
    }
  }
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  const inSearch = searchAreaRef.value?.contains(target)
  const inDropdown = searchDropdownRef.value?.contains(target)
  if (!inSearch && !inDropdown) {
    closeSearch()
  }
}

watch([searchVisible, searchKeyword], () => {
  if (searchVisible && searchKeyword.value.trim()) {
    nextTick(updateDropdownPosition)
  }
})

// 仅在搜索下拉展开时监听点击外部，避免在未展开时拦截输入框的点击/焦点
watch(
  searchVisible,
  (visible) => {
    if (visible) {
      nextTick(() => document.addEventListener('click', handleClickOutside))
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

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

/* Header 样式：高 z-index 确保始终浮在页面内容之上，防止被覆盖 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  position: relative;
  z-index: 100;

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
  min-width: 0;
  overflow: hidden;
  flex-shrink: 1;
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

/* Header 右侧区域：确保不被 logo 覆盖，始终可点击 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.search-area {
  position: relative;
  z-index: 1;
  pointer-events: auto;
}

/* 原生搜索框样式（替代 Ant Design 避免点击/输入被拦截） */
.search-input-wrap {
  display: inline-flex;
  width: 260px;
  border-radius: 4px;
  overflow: hidden;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 30%);
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  font-size: 14px;
  color: #fff;
  background: transparent;
  border: none;
  outline: none;
}

.search-input::placeholder {
  color: rgb(255 255 255 / 60%);
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  background: var(--dark-green);
  border: 1px solid rgb(255 255 255 / 30%);
  border-left: none;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #3d5a3d;
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

/* 全局搜索下拉框（Teleport 到 body，需保证样式生效） */
:deep(.global-search-dropdown) {
  background: rgb(50 70 50 / 98%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
  max-height: 360px;
  overflow-y: auto;
  padding: 8px 0;
}

:deep(.search-dropdown-loading),
:deep(.search-dropdown-empty) {
  padding: 16px 20px;
  color: rgb(255 255 255 / 80%);
  font-size: 14px;
  text-align: center;
}

:deep(.search-dropdown-list) {
  display: flex;
  flex-direction: column;
}

:deep(.search-dropdown-item) {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

:deep(.search-dropdown-item:hover) {
  background: rgb(255 255 255 / 12%);
}

:deep(.search-item-type) {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgb(255 255 255 / 15%);
  color: rgb(255 255 255 / 90%);
}

:deep(.search-item-type.menu) {
  background: #677662;
}

:deep(.search-item-type.monitor) {
  background: #1890ff;
}

:deep(.search-item-type.alert) {
  background: #fa8c16;
}

:deep(.search-item-content) {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.search-item-title) {
  color: #fff;
  font-size: 14px;
}

:deep(.search-item-subtitle) {
  color: rgb(255 255 255 / 65%);
  font-size: 12px;
}
</style>
