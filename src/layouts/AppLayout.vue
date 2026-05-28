<template>
  <div class="app-layout-container">
    <header class="header">
      <div class="header-left">
        <button
          type="button"
          class="menu-toggle"
          aria-label="打开导航菜单"
          @click="drawerOpen = true">
          <MenuOutlined />
        </button>
        <div
          class="logo-area"
          @click="goHome">
          <img
            src="@/assets/logo.jpg"
            alt="Logo"
            class="logo-img" />
          <span class="title">
            <span class="title-full">青禾智匠 · 作物灾害监测预警系统</span>
            <span class="title-short">青禾智匠</span>
          </span>
        </div>
      </div>

      <div class="header-right">
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

        <div class="user-profile">
          <a-dropdown placement="bottomRight">
            <div class="user-info-trigger">
              <a-avatar
                style="background-color: #87d068"
                :size="32">
                <template #icon><UserOutlined /></template>
              </a-avatar>
              <span class="username">{{ userStore.userInfo?.name || '管理员' }}</span>
              <DownOutlined class="arrow-icon" />
            </div>

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

    <nav class="nav-bar desktop-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item">
        {{ item.label }}
      </router-link>
    </nav>

    <a-drawer
      v-model:open="drawerOpen"
      placement="left"
      title="功能导航"
      :width="280"
      class="nav-drawer"
      :body-style="{ padding: 0 }">
      <nav class="drawer-nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="drawer-nav-item"
          @click="drawerOpen = false">
          {{ item.label }}
        </router-link>
      </nav>
    </a-drawer>

    <main class="content-slot">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message, Modal } from 'ant-design-vue'
import {
  UserOutlined,
  DownOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
  MenuOutlined
} from '@ant-design/icons-vue'
import { useGlobalSearch } from '@/composables/useGlobalSearch'

const navItems = [
  { to: '/home', label: '首页' },
  { to: '/related-data', label: '相关数据' },
  { to: '/map', label: '灾害实时监测' },
  { to: '/analysis', label: '智能分析' },
  { to: '/warnings', label: '灾害预警' },
  { to: '/decision', label: '智慧决策' },
  { to: '/about', label: '关于我们' }
]

const router = useRouter()
const userStore = useUserStore()
const drawerOpen = ref(false)
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

watch(
  () => router.currentRoute.value.path,
  () => {
    drawerOpen.value = false
  }
)

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const goHome = () => {
  router.push('/home')
}

const handleLogout = () => {
  Modal.confirm({
    title: '确认退出',
    content: '您确定要退出当前账号吗？',
    okText: '确认',
    cancelText: '取消',
    onOk: () => {
      userStore.logout()
      message.success('已安全退出')
      router.push('/login')
    }
  })
}
</script>

<style scoped>
.app-layout-container {
  width: 100%;
  height: 100vh;
  background-image: image-set(
    url('@/assets/bg.webp') type('image/webp'),
    url('@/assets/bg.jpg') type('image/jpeg')
  );
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  color: #fff;
  box-sizing: border-box;
  overflow: hidden;

}

.content-slot {
  flex-grow: 1;
  box-sizing: border-box;
  padding: 20px 40px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  position: relative;
}

.content-slot::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgb(20 35 20 / 25%);
  pointer-events: none;
  z-index: 0;
}

.content-slot > * {
  position: relative;
  z-index: 1;
}

/* Header 置于内容之上，避免被遮挡 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  position: relative;
  z-index: 100;
  background-color: rgb(50 70 50 / 85%);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
  min-height: 64px;
  border-bottom: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgb(0 0 0 / 20%);
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 8px;
  background: rgb(255 255 255 / 10%);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}

.menu-toggle:hover {
  background: rgb(255 255 255 / 18%);
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
  font-family: var(--font-serif);
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgb(0 0 0 / 50%);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title-short {
  display: none;
}

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

.user-info-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
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
  font-family: var(--font-sans);
}

.nav-bar {
  display: flex;
  justify-content: center;
  background-color: rgb(90 110 90 / 85%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 10px rgb(0 0 0 / 10%);
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}

.nav-item {
  padding: 14px 30px;
  color: rgb(255 255 255 / 90%);
  text-decoration: none;
  font-size: 17px;
  transition: all 0.3s;
  white-space: nowrap;
  position: relative;
  font-family: var(--font-serif);
  font-weight: bold;
  letter-spacing: 1px;
}

.nav-item:hover {
  background-color: rgb(0 0 0 / 10%);
  color: #fff;
}

.router-link-active.router-link-exact-active,
.nav-item.active {
  background-color: rgb(0 0 0 / 20%);
  color: #fff;
  text-shadow: 0 0 10px rgb(255 255 255 / 50%);
}

@media (width <= 992px) {
  .header {
    padding: 10px 16px;
  }

  .menu-toggle {
    display: flex;
  }

  .desktop-nav {
    display: none;
  }

  .content-slot {
    padding: 16px;
  }

  .search-input-wrap {
    width: 180px;
  }

  .title-full {
    display: none;
  }

  .title-short {
    display: inline;
    letter-spacing: 1px;
  }

  .title {
    font-size: 18px;
  }
}

@media (width <= 576px) {
  .header {
    padding: 8px 12px;
  }

  .content-slot {
    padding: 12px;
  }

  .logo-img {
    height: 32px;
    margin-right: 8px;
  }

  .search-area {
    display: none;
  }

  .username {
    display: none;
  }

  .user-info-trigger {
    padding: 4px 8px;
  }

  .header-right {
    gap: 8px;
  }
}

/* Teleport 到 body 的下拉样式 */
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

<style>
/* Drawer 挂载 body */
.nav-drawer .ant-drawer-header {
  background: rgb(50 70 50 / 98%);
  border-bottom: 1px solid rgb(255 255 255 / 15%);
}

.nav-drawer .ant-drawer-title {
  color: #eef1ea;
  font-family: var(--font-serif);
  font-weight: 600;
}

.nav-drawer .ant-drawer-close {
  color: rgb(255 255 255 / 75%);
}

.nav-drawer .ant-drawer-body {
  background: rgb(40 55 40 / 98%);
  padding: 0;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
}

.drawer-nav-item {
  display: block;
  padding: 16px 24px;
  color: rgb(255 255 255 / 90%);
  text-decoration: none;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid rgb(255 255 255 / 10%);
  transition: background 0.2s;
}

.drawer-nav-item:hover {
  background: rgb(255 255 255 / 8%);
  color: #fff;
}

.drawer-nav-item.router-link-active {
  background: rgb(0 0 0 / 25%);
  color: #fff;
  border-left: 3px solid #73d13d;
  padding-left: 21px;
}
</style>
