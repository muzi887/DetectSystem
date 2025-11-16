<!-- src/views/user/WarningSystem.vue -->
<template>
  <div class="app-layout-container">
    <!-- Header 和 Nav 保持不变 -->
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
        class="nav-item active">
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

    <!-- 主体内容 -->
    <main class="main-content">
      <div class="content-wrapper">
        <a-card>
          <template #title>
            <div class="card-title">预警管理</div>
          </template>
          <template #extra>
            <a-button
              type="primary"
              size="small"
              @click="showCreateModal">
              新建预警
            </a-button>
            <a-button
              class="refresh-btn"
              size="small"
              style="margin-left: 8px"
              @click="fetchAlerts">
              刷新
            </a-button>
          </template>

          <!-- ***** 修改：dataSource 使用处理后的 enrichedAlerts ***** -->
          <a-list
            class="alert-list"
            :dataSource="enrichedAlerts"
            :loading="dataStore.loadingAlerts"
            :pagination="{ pageSize: 5, showSizeChanger: false, showQuickJumper: false }">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <div class="alert-title-wrapper">
                      <div class="alert-info">
                        <a-tag :color="getLevelColor(item.level)">
                          {{ getLevelText(item.level) }}
                        </a-tag>
                        <!-- ***** 修改：显示监测点名称而不是 ID ***** -->
                        <span class="point-name">{{ item.pointName }}</span>
                        <a-tag :color="item.handled ? 'green' : 'red'">
                          {{ item.handled ? '已处理' : '待处理' }}
                        </a-tag>
                      </div>
                      <span class="alert-time">{{ formatTime(item.time) }}</span>
                    </div>
                  </template>
                  <template #description>
                    <div class="alert-message">{{ item.message }}</div>
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
                    class="delete-action"
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

    <!-- Modal 弹窗 -->
    <a-modal
      v-model:open="createModalVisible"
      title="新建预警"
      wrapClassName="warning-modal"
      @ok="handleCreateModalOk"
      @cancel="createModalVisible = false">
      <a-form
        :model="createFormModal"
        layout="vertical">
        <!-- ***** 修改：将输入框改为下拉选择框 ***** -->
        <a-form-item
          label="监测点"
          required>
          <a-select
            v-model:value="createFormModal.pointId"
            placeholder="请选择监测点"
            show-search
            :filter-option="filterOption">
            <a-select-option
              v-for="point in dataStore.monitorPoints"
              :key="point.id"
              :value="point.id">
              {{ point.name }}
            </a-select-option>
          </a-select>
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
// ***** 修改：引入 computed *****
import { reactive, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

// ***** 修改：将 computed 属性用于关联数据 *****
const enrichedAlerts = computed(() => {
  // 创建一个监测点ID到名称的快速查找映射，提高性能
  const pointsMap = new Map(dataStore.monitorPoints.map((p) => [p.id, p.name]))
  return dataStore.alerts.map((alert) => ({
    ...alert,
    // 从映射中获取名称，如果找不到则提供一个回退显示
    pointName: pointsMap.get(alert.pointId) || `未知监测点 #${alert.pointId}`
  }))
})

const createFormModal = reactive({
  pointId: null as number | null, // 初始值设为 null
  level: 'medium' as 'low' | 'medium' | 'high',
  message: ''
})
const createModalVisible = ref(false)

const levelColors: Record<string, string> = {
  low: 'blue',
  medium: 'orange',
  high: 'red',
  warning: 'gold',
  critical: '#a70000'
}
const levelText: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  warning: '警告',
  critical: '危急'
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
  }
}

const showCreateModal = () => {
  createFormModal.pointId =
    dataStore.monitorPoints.length > 0 ? dataStore.monitorPoints[0].id : null // 默认选中第一个
  createFormModal.level = 'medium'
  createFormModal.message = ''
  createModalVisible.value = true
}

const handleCreateModalOk = async () => {
  if (!createFormModal.pointId) {
    message.warning('请选择一个监测点')
    return
  }
  if (!createFormModal.message.trim()) {
    message.warning('请输入预警信息')
    return
  }
  try {
    await dataStore.createAlert({
      pointId: createFormModal.pointId,
      level: createFormModal.level,
      message: createFormModal.message.trim()
    })
    message.success('创建成功')
    createModalVisible.value = false
    await fetchAlerts()
  } catch (e) {
    message.error('创建失败')
  }
}

const handleToggle = async (alert: any) => {
  try {
    await dataStore.updateAlert(alert.id, { handled: !alert.handled })
    message.success('状态已更新')
    // 无需手动刷新，Pinia 的状态更新会自动触发 computed 属性重新计算
  } catch (e) {
    message.error('更新失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await dataStore.deleteAlert(id)
    message.success('已删除')
  } catch (e) {
    message.error('删除失败')
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

// ***** 新增：为 Select 组件提供搜索功能 *****
const filterOption = (input: string, option: any) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

// ***** 修改：页面加载时同时获取监测点数据 *****
onMounted(() => {
  dataStore.fetchMonitorPoints()
  fetchAlerts()
})
</script>

<!-- 全局样式与 Scoped 样式保持不变 -->
<style>
:root {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);
}

.warning-modal .ant-modal-content {
  background-color: rgb(40 50 38 / 85%) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 20%);
  color: var(--light-green);
}

.warning-modal .ant-modal-header {
  background-color: transparent !important;
  border-bottom: 1px solid rgb(255 255 255 / 20%) !important;
}

.warning-modal .ant-modal-title {
  color: white !important;
}

.warning-modal .ant-modal-close-x {
  color: rgb(255 255 255 / 70%);
}

.warning-modal .ant-form-item-label > label {
  color: var(--light-green) !important;
}

.warning-modal .ant-input,
.warning-modal .ant-input-number,
.warning-modal .ant-select-selector {
  background-color: rgb(255 255 255 / 10%) !important;
  border: 1px solid rgb(255 255 255 / 30%) !important;
  color: white !important;
}

.warning-modal .ant-input-number-handler-wrap {
  background-color: rgb(255 255 255 / 10%) !important;
}

.warning-modal .ant-input-number-handler-down-inner,
.warning-modal .ant-input-number-handler-up-inner {
  color: white !important;
}

.warning-modal .ant-modal-footer {
  border-top: 1px solid rgb(255 255 255 / 20%) !important;
}

.warning-modal .ant-btn-primary {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.warning-modal .ant-btn-default {
  background-color: rgb(255 255 255 / 15%) !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white !important;
}

.ant-select-dropdown {
  background-color: rgb(40 50 38 / 95%) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgb(255 255 255 / 20%);
}

.ant-select-dropdown .ant-select-item {
  color: var(--light-green) !important;
}

.ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-selected) {
  background-color: var(--dark-green) !important;
}

.ant-select-dropdown .ant-select-item-option-selected {
  background-color: var(--primary-green) !important;
  color: white !important;
}
</style>
<style scoped>
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: rgb(103 118 98 / 80%);
  backdrop-filter: blur(5px);
  border-bottom: 1px solid rgb(255 255 255 / 20%);
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
  color: #333 !important;
}

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
  background-color: var(--dark-green);
  font-weight: bold;
}

.main-content {
  flex-grow: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
}

.content-wrapper {
  width: 100%;
  max-width: 900px;
}

.content-wrapper :deep(.ant-card) {
  background-color: var(--glass-bg);
  border-radius: 12px;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
}

.content-wrapper :deep(.ant-card-head) {
  border-bottom: 1px solid rgb(255 255 255 / 20%);
  padding: 0 24px;
}

.card-title {
  color: var(--light-green);
  font-size: 20px;
  font-weight: bold;
}

.content-wrapper :deep(.ant-card-extra .ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.refresh-btn {
  background-color: rgb(255 255 255 / 15%) !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white !important;
}

.content-wrapper :deep(.ant-card-body) {
  padding: 12px 24px 24px;
}

.alert-list {
  color: white;
}

.alert-list :deep(.ant-list-item) {
  padding: 16px 0;
  border-block-end: 1px solid rgb(255 255 255 / 20%) !important;
}

.alert-title-wrapper {
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

/* ***** 修改：样式类名从 point-id 改为 point-name ***** */
.point-name {
  color: var(--light-green);
  font-size: 15px;
  font-weight: 500;
}

.alert-time {
  color: rgb(255 255 255 / 70%);
  font-size: 13px;
  flex-shrink: 0;
  margin-left: 16px;
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

.delete-action,
.delete-action:hover {
  color: #ff7875 !important;
}

.alert-list :deep(.ant-pagination) {
  text-align: right;
  margin-top: 20px;
}

.alert-list :deep(.ant-pagination-item a) {
  color: var(--light-green);
}

.alert-list :deep(.ant-pagination-item),
.alert-list :deep(.ant-pagination-prev .ant-pagination-item-link),
.alert-list :deep(.ant-pagination-next .ant-pagination-item-link) {
  background-color: transparent !important;
  border-color: rgb(255 255 255 / 30%) !important;
  color: white;
}

.alert-list :deep(.ant-pagination-item-active) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.alert-list :deep(.ant-pagination-item-active a) {
  color: white !important;
}

.alert-list :deep(.ant-empty-description) {
  color: rgb(255 255 255 / 70%);
}
</style>
