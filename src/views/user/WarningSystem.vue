<!-- src/views/user/WarningSystem.vue -->
<template>
  <AppLayout>
    <!-- 主体内容由 AppLayout 包裹 -->
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
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { reactive, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const enrichedAlerts = computed(() => {
  const pointsMap = new Map(dataStore.monitorPoints.map((p) => [p.id, p.name]))
  return dataStore.alerts.map((alert) => ({
    ...alert,
    pointName: pointsMap.get(alert.pointId) || `未知监测点 #${alert.pointId}`
  }))
})

const createFormModal = reactive({
  pointId: null as number | null,
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
    dataStore.monitorPoints.length > 0 ? dataStore.monitorPoints[0].id : null
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

const filterOption = (input: string, option: any) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

onMounted(() => {
  dataStore.fetchMonitorPoints()
  fetchAlerts()
})
</script>

<style>
:root {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);
}

/* ... (warning-modal 和 ant-select-dropdown 的样式保持不变) */
</style>

<style scoped>
/* ***** 修改：移除了 app-layout-container, header, nav-bar 等相关的所有样式 ***** */

/* ***** 修改：调整 main-content 样式，移除内边距和拉伸属性，只负责居中 ***** */
.main-content {
  display: flex;
  justify-content: center;
  width: 100%;
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

/* ... (其余所有 .alert-list, .point-name, .alert-time 等样式均保持不变) ... */
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
