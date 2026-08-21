<template>
  <AppLayout>
    <main class="main-content page-main-shell">
      <div class="content-wrapper glass-page">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">预警管理</div>
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
            <a-switch
              v-model:checked="showDrafts"
              class="draft-switch"
              checked-children="含草稿"
              un-checked-children="待办"
              style="margin-left: 8px" />
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
                        <a-tag v-if="item.source === 'auto'">自动</a-tag>
                        <a-tag v-else>手动</a-tag>
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
                    v-if="item.draft"
                    @click="handlePublish(item)">
                    确认发布
                  </a>
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
              <GlassEmpty description="暂无预警信息" />
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
          label="监测点"
          required>
          <a-select
            v-model:value="createFormModal.pointId"
            placeholder="请选择监测点"
            show-search
            :filter-option="filterOption">
            <a-select-option
              v-for="point in dataStore.filteredMonitorPoints"
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
import GlassEmpty from '@/components/GlassEmpty.vue'
import { reactive, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import { getAlertLevelColor, getAlertLevelText } from '@/utils/alertLevel'
import { formatTime } from '@/utils/formatTime'
import { publishAlert } from '@/api/rules'

const dataStore = useDataStore()
const showDrafts = ref(false)

const enrichedAlerts = computed(() => {
  const pointsMap = new Map(dataStore.filteredMonitorPoints.map((p) => [p.id, p.name]))
  const regionIds = new Set(dataStore.filteredMonitorPoints.map((p) => p.id))
  return dataStore.alerts
    .filter(
      (alert) => regionIds.has(alert.pointId) && (showDrafts.value || alert.draft !== true)
    )
    .map((alert) => ({
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

const getLevelColor = getAlertLevelColor
const getLevelText = getAlertLevelText

const fetchAlerts = async () => {
  try {
    await dataStore.fetchAlerts()
  } catch (e) {
    message.error('获取预警失败')
  }
}

const showCreateModal = () => {
  createFormModal.pointId =
    dataStore.filteredMonitorPoints.length > 0
      ? dataStore.filteredMonitorPoints[0].id
      : null
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

const handlePublish = async (alert: { id: number }) => {
  try {
    await publishAlert(alert.id)
    await fetchAlerts()
    message.success('已确认发布')
  } catch (e) {
    message.error('发布失败')
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

const filterOption = (input: string, option: any) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

onMounted(() => {
  dataStore.fetchMonitorPoints()
  fetchAlerts()
})
</script>

<style scoped>
.refresh-btn {
  background-color: var(--glass-bg-subtle) !important;
  border-color: var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.glass-page :deep(.ant-card-body) {
  padding: 12px 24px 24px;
}

.alert-list {
  color: white;
}

.alert-list :deep(.ant-list-item) {
  padding: 16px 0;
  border-block-end: 1px solid var(--glass-border) !important;
  background-color: var(--glass-bg-item);
  margin-bottom: 4px;
  border-radius: 4px;
  padding-inline: 8px;
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
  text-shadow: var(--glass-text-shadow);
}

.alert-time {
  color: var(--glass-text-muted);
  font-size: 13px;
  flex-shrink: 0;
  margin-left: 16px;
}

.alert-message {
  color: var(--glass-text-secondary);
  margin-top: 8px;
  white-space: pre-wrap;
  word-break: break-word;
  text-shadow: var(--glass-text-shadow);
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
  border-color: var(--glass-border-strong) !important;
  color: var(--glass-text-primary);
}

.alert-list :deep(.ant-pagination-item-active) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.alert-list :deep(.ant-pagination-item-active a) {
  color: white !important;
}

.alert-list :deep(.ant-empty-description) {
  color: var(--glass-text-muted);
}

@media (width <= 992px) {
  .alert-title-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .alert-time {
    margin-left: 0;
  }

  .alert-info {
    flex-wrap: wrap;
  }
}

@media (width <= 576px) {
  .glass-page :deep(.ant-card-body) {
    padding: 12px 16px 16px;
  }

  .alert-list :deep(.ant-list-item-action) {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
