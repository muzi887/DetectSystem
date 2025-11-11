<!-- src/views/Alerts.vue -->
<template>
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
                    <a-tag :color="getLevelColor(item.level)">{{ getLevelText(item.level) }}</a-tag>
                    <span style="margin-left: 8px; margin-right: 8px">
                      监测点 #{{ item.pointId }}
                    </span>
                    <a-tag :color="item.handled ? 'green' : 'red'">
                      {{ item.handled ? '已处理' : '待处理' }}
                    </a-tag>
                  </div>
                  <span style="color: #909399; font-size: 12px; flex-shrink: 0; margin-left: 16px">
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

    <a-modal
      v-model:open="createModalVisible"
      title="新建预警"
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
          <a-select v-model:value="createFormModal.level">
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
            :rows="4" />
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
