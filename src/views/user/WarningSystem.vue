<!-- src/views/user/WarningSystem.vue -->
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
      <div style="max-width: 900px; margin: 24px auto">
        <a-card title="预警管理">
          <template #extra>
            <a-button
              type="primary"
              size="small"
              @click="showCreateModal">
              新建预警
            </a-button>
            <a-button
              size="small"
              style="margin-left: 8px"
              @click="fetchAlerts">
              刷新
            </a-button>
          </template>

          <a-list
            :dataSource="dataStore.alerts"
            :loading="dataStore.loadingAlerts"
            :pagination="{ pageSize: 5, showSizeChanger: false, showQuickJumper: false }"
            bordered
            style="margin-top: 12px">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <div
                      style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                      ">
                      <div>
                        <a-tag :color="getLevelColor(item.level)">
                          {{ getLevelText(item.level) }}
                        </a-tag>
                        <span style="margin-left: 8px; margin-right: 8px">
                          监测点 #{{ item.pointId }}
                        </span>
                        <a-tag :color="item.handled ? 'green' : 'red'">
                          {{ item.handled ? '已处理' : '待处理' }}
                        </a-tag>
                      </div>
                      <span
                        style="color: #909399; font-size: 12px; flex-shrink: 0; margin-left: 16px">
                        {{ formatTime(item.time) }}
                      </span>
                    </div>
                  </template>

                  <template #description>
                    <div style="white-space: pre-wrap; word-break: break-word; margin-top: 4px">
                      {{ item.message }}
                    </div>
                  </template>
                </a-list-item-meta>

                <template #actions>
                  <a
                    v-if="!item.handled"
                    @click="handleToggle(item)">
                    标记解决
                  </a>
                  <a
                    v-else
                    @click="handleToggle(item)">
                    标记未处理
                  </a>
                  <a
                    style="color: #ff4d4f"
                    @click="handleDelete(item.id)">
                    删除
                  </a>
                </template>
              </a-list-item>
            </template>

            <template #empty>
              <a-empty description="暂无预警信息" />
            </template>
          </a-list>
        </a-card>
      </div>
    </main>
    <a-modal
      v-model:open="createModalVisible"
      title="新建预警"
      wrapClassName="warning-modal"
      @ok="handleCreateModalOk"
      @cancel="createModalVisible = false">
      <a-form
        :model="createFormModal"
        layout="vertical">
        <a-form-item
          label="监测点ID"
          required>
          <a-input-number
            v-model:value="createFormModal.pointId"
            :min="1"
            style="width: 100%" />
        </a-form-item>
        <a-form-item
          label="预警级别"
          required>
          <a-select
            v-model:value="createFormModal.level"
            placeholder="请选择级别">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="预警信息"
          required>
          <a-textarea
            v-model:value="createFormModal.message"
            :rows="4"
            placeholder="请输入详细的预警内容..." />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data' // 假设 store 路径

const dataStore = useDataStore()

const createFormModal = reactive({
  pointId: 1,
  level: 'medium' as 'low' | 'medium' | 'high',
  message: ''
})
const createModalVisible = ref(false)

const levelColors: Record<string, string> = {
  low: 'blue',
  medium: 'orange',
  high: 'red'
}
const levelText: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高'
}

function getLevelColor(level: string | undefined) {
  return levelColors[level || 'medium']
}
function getLevelText(level: string | undefined) {
  return levelText[level || 'medium']
}

const fetchAlerts = async () => {
  try {
    await dataStore.fetchAlerts()
  } catch (e) {
    message.error('获取预警失败')
    console.error(e)
  }
}

const showCreateModal = () => {
  createFormModal.pointId = 1
  createFormModal.level = 'medium'
  createFormModal.message = ''
  createModalVisible.value = true
}

const handleCreateModalOk = async () => {
  if (!createFormModal.message.trim()) {
    message.warning('请输入预警信息')
    return
  }
  try {
    await dataStore.createAlert({
      pointId: Number(createFormModal.pointId),
      level: createFormModal.level,
      message: createFormModal.message.trim()
    })
    message.success('创建成功')
    createModalVisible.value = false
    await fetchAlerts()
  } catch (e) {
    message.error('创建失败')
    console.error(e)
  }
}

const handleToggle = async (alert: any) => {
  try {
    await dataStore.updateAlert(alert.id, { handled: !alert.handled })
    message.success('状态已更新')
    await fetchAlerts()
  } catch (e) {
    message.error('更新失败')
    console.error(e)
  }
}

const handleDelete = async (id: number) => {
  try {
    await dataStore.deleteAlert(id)
    message.success('已删除')
    await fetchAlerts()
  } catch (e) {
    message.error('删除失败')
    console.error(e)
  }
}

const formatTime = (t?: number) => {
  if (!t) return '-'
  const d = new Date(t)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`
}

onMounted(() => {
  fetchAlerts()
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

/* WarningSystem 页面专属样式 */

/* ---------------------------------------------------- */

.main-content {
  flex-grow: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  overflow-y: auto; /* 允许内容区滚动 */
}

/* 预警面板 */
.warning-panel {
  width: 100%;
  max-width: 900px;
  background-color: var(--glass-bg);
  border-radius: 16px;
  padding: 25px 30px;
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 20%);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgb(255 255 255 / 20%);
}

.panel-title {
  color: var(--light-green);
  font-size: 22px;
  font-weight: bold;
}

.panel-actions {
  display: flex;
  gap: 12px;
}

.panel-actions :deep(.ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.refresh-btn {
  background-color: rgb(255 255 255 / 15%) !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white !important;
}

/* 预警列表 */
.alert-list {
  color: white;
}

.alert-list :deep(.ant-list-item) {
  padding: 16px 8px;
  border-block-end: 1px solid rgb(255 255 255 / 20%) !important;
}

.alert-list :deep(.ant-list-item-meta) {
  align-items: center;
}

.alert-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.alert-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.point-id {
  color: var(--light-green);
  font-size: 15px;
}

.alert-time {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
  flex-shrink: 0;
}

.alert-message {
  color: rgb(255 255 255 / 85%);
  margin-top: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}

.alert-list :deep(.ant-list-item-action) {
  gap: 12px;
  margin-left: 24px;
}

.alert-list :deep(.ant-list-item-action > li > a) {
  color: var(--light-green);
  transition: color 0.3s;
}

.alert-list :deep(.ant-list-item-action > li > a:hover) {
  color: white;
}

.delete-action {
  color: #ff7875 !important;
}

.delete-action:hover {
  color: #ff4d4f !important;
}

/* 列表分页器样式 */
.alert-list :deep(.ant-pagination) {
  text-align: right;
  margin-top: 20px;
}

.alert-list :deep(.ant-pagination-item),
.alert-list :deep(.ant-pagination-prev .ant-pagination-item-link),
.alert-list :deep(.ant-pagination-next .ant-pagination-item-link) {
  background-color: transparent !important;
  border-color: rgb(255 255 255 / 30%) !important;
}

.alert-list :deep(.ant-pagination-item a) {
  color: var(--light-green);
}

.alert-list :deep(.ant-pagination-item-active) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.alert-list :deep(.ant-pagination-item-active a) {
  color: white !important;
}

.alert-list
  :deep(.ant-pagination-jump-prev .ant-pagination-item-container .ant-pagination-item-ellipsis),
.alert-list
  :deep(.ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-ellipsis) {
  color: rgb(255 255 255 / 50%) !important;
}

/* 空状态 */
.alert-list :deep(.ant-empty-description) {
  color: rgb(255 255 255 / 70%);
}

/* ---------------------------------------------------- */

/* Modal 弹窗样式穿透 */

/* ---------------------------------------------------- */
:global(.warning-modal .ant-modal-content) {
  background-color: rgb(40 50 38 / 80%) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 20%);
  color: var(--light-green);
}

:global(.warning-modal .ant-modal-header) {
  background-color: transparent !important;
  border-bottom: 1px solid rgb(255 255 255 / 20%) !important;
}

:global(.warning-modal .ant-modal-title) {
  color: white !important;
}

:global(.warning-modal .ant-modal-close-x) {
  color: rgb(255 255 255 / 70%);
}

:global(.warning-modal .ant-modal-body) {
  padding-top: 20px;
}

:global(.warning-modal .ant-form-item-label > label) {
  color: var(--light-green) !important;
}

:global(.warning-modal .ant-input),
:global(.warning-modal .ant-input-number),
:global(.warning-modal .ant-select-selector) {
  background-color: rgb(255 255 255 / 10%) !important;
  border: 1px solid rgb(255 255 255 / 30%) !important;
  color: white !important;
}

:global(.warning-modal .ant-input-number-handler-wrap) {
  background-color: rgb(255 255 255 / 10%) !important;
}

:global(.warning-modal .ant-input-number-handler-down-inner),
:global(.warning-modal .ant-input-number-handler-up-inner) {
  color: white !important;
}

:global(.warning-modal .ant-modal-footer) {
  border-top: 1px solid rgb(255 255 255 / 20%) !important;
}

:global(.warning-modal .ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

:global(.warning-modal .ant-btn-default) {
  background-color: rgb(255 255 255 / 15%) !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white !important;
}

/* 解决 Select 下拉菜单的样式问题 */
:global(.ant-select-dropdown) {
  background-color: rgb(40 50 38 / 95%) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 20%);
}

:global(.ant-select-dropdown .ant-select-item) {
  color: var(--light-green) !important;
}

:global(.ant-select-dropdown .ant-select-item-option-active) {
  background-color: var(--dark-green) !important;
}

:global(.ant-select-dropdown .ant-select-item-option-selected) {
  background-color: var(--primary-green) !important;
  color: white !important;
}
</style>
