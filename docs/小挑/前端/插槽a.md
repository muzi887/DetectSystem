---
title: slots
tags:
  - 原理卡
  - Vue
created: 2025-10-20
---

# 🌱原理卡：slots

> [!NOTE] **定义**：  
> 

---

## 关键点
### **具名插槽**语法：

- `#extra` 是 `v-slot:extra` 的简写
    
- `#renderItem="{ item }"` 是作用域插槽，可以接收子组件传递的数据
    
- `#actions` 是另一个具名插槽
### 在 Ant Design Vue 中的常见插槽

|插槽名|适用组件|作用|
|---|---|---|
|`#extra`|`a-card`|卡片右上角额外内容|
|`#renderItem`|`a-list`|自定义列表项渲染|
|`#actions`|`a-list-item`|列表项操作按钮|
|`#title`|`a-list-item-meta`|列表项标题区域|
|`#empty`|`a-list`|空状态显示|

---

## 代码示例
### ts

```ts
// src/stores/data.ts
// 统一管理监测点和预警数据。
import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'

export const useDataStore = defineStore('data', () => {
  const monitorPoints = ref<Array<any>>([])
  const alerts = ref<Array<any>>([])
  const loadingPoints = ref(false)
  const loadingAlerts = ref(false)

  // 获取数据
  async function fetchMonitorPoints() {
    loadingPoints.value = true
    try {
      const res = await http.get('/monitorPoints')
      monitorPoints.value = res.data|| []
    } catch (e) {
      console.error('fetchMonitorPoints error', e)
      throw e
    } finally {
      loadingPoints.value = false
    }
  }
  
  // force 参数（兼容外部调用）
  async function fetchAlerts(force:false) {
    // 目前没有本地缓存策略；force 参数为了兼容调用方
    loadingAlerts.value = true
    try {
      const res = await http.get('/alerts?_sort=time&_order=desc')
      alerts.value = res.data|| []
    } catch (e) {
      console.error('fetchAlerts error', e)
      throw e
    }finally {
      loadingAlerts.value = false // 关闭加载状态
    }
  }

  // 创建预警 - 核心功能！
  async function createAlert(alertData: Partial<Alert>) {
    console.log(' 创建预警请求:', alertData)

    const payload: Alert = {
      time: Date.now(),
      handled: false,
      // 强制保证 pointId/level/message 等字段存在（调用者应传好）
      pointId: Number(alertData.pointId || 0),
      level: (alertData.level || 'medium') as AlertLevel,
      message: String(alertData.message || ''),
      ...alertData
    }

    if (!payload.pointId || !payload.message.trim()) {
      throw new Error('pointId 和 message 为必填项')
    }

    const res = await http.post('/alerts', payload)


    console.log(' 创建预警响应:', res.data)

    //  刷新列表（也可以改为乐观更新）
    await fetchAlerts()
    return res.data
  }

  // 更新预警状态
  async function updateAlert(
    id: number,
    updates:  Partial<Pick<Alert, 'level' | 'message' | 'handled'>>
  ) {
     const res = await http.patch(`/alerts/${id}`, updates)
    // 刷新列表
    await fetchAlerts()
    return res.data
  }

  // 删除预警
  async function deleteAlert(id: number) {
    await http.delete(`/alerts/${id}`)
    // 本地删除（避免额外请求）
    alerts.value = alerts.value.filter((a) => a.id !== id)
  }

  return {
    monitorPoints,
    alerts,
    loadingPoints,
    loadingAlerts,
    fetchMonitorPoints,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert
  }
})
```
### dashboard

```vue
<!-- src/views/Dashboard.vue -->
<template>
  <BasicLayout>
    <div style="display: flex; gap: 16px; flex-wrap: wrap">
      <!-- 系统概览（统计） -->
      <a-card
        title="系统概览"
        style="flex: 1 1 600px; min-width: 360px">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-statistic
              title="监测点数量"
              :value="pointsCount" />
          </a-col>
          <a-col :span="6">
            <a-statistic
              title="未处理预警"
              :value="unhandledCount" />
          </a-col>
          <a-col :span="6">
            <a-statistic
              title="高危预警"
              :value="highRiskCount" />
          </a-col>
          <a-col :span="6">
            <a-statistic
              title="系统状态"
              value="正常" />
          </a-col>
        </a-row>

        <div style="margin-top: 12px; text-align: right">
          <a-button
            type="primary"
            size="small"
            @click="showCreateModal">
            新建预警
          </a-button>
          <a-button
            style="margin-left: 8px"
            size="small"
            @click="fetchAll(true)">
            刷新
          </a-button>
        </div>
      </a-card>

      <!-- 简洁卡片：总点数 / 未处理 / 趋势图 -->
      <a-card
        title="最近 7 天预警趋势"
        :loading="loadingAlerts"
        style="flex: 1 1 400px; min-width: 320px">
        <div
          ref="chart"
          style="height: 220px; width: 100%"></div>
      </a-card>
    </div>

    <!-- 监测点列表 -->
    <div style="margin-top: 16px">
      <a-card
        title="监测点列表"
        :loading="loadingPoints">
        <a-list
          :dataSource="dataStore.monitorPoints"
          bordered>
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :title="item.name"
                :description="`状态: ${item.status} · 温度: ${item.temp}°C · 湿度: ${item.soilMoisture}%`" />
              <div>
                <a-tag v-if="item.status === 'warning'">告警</a-tag>
                <a-tag v-else>正常</a-tag>
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>

    <!-- 新建预警模态 -->
    <a-modal
      v-model:visible="createModalVisible"
      title="新建预警"
      @ok="handleCreate"
      @cancel="createModalVisible = false">
      <a-form
        :model="createForm"
        layout="vertical">
        <a-form-item
          label="监测点ID"
          required>
          <a-input-number
            v-model:value="createForm.pointId"
            :min="1"
            style="width: 100%" />
        </a-form-item>
        <a-form-item
          label="预警级别"
          required>
          <a-select v-model:value="createForm.level">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="预警信息"
          required>
          <a-textarea
            v-model:value="createForm.message"
            placeholder="请输入预警描述"
            :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </BasicLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useDataStore } from '@/stores/data'
import * as echarts from 'echarts'
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'Dashboard',
  components: { BasicLayout },

  setup() {
    const dataStore = useDataStore()
    const chart = ref<HTMLDivElement | null>(null)
    const chartInstance = ref<any>(null)

    const createModalVisible = ref(false)
    const createForm = ref({
      pointId: 1,
      level: 'medium' as 'low' | 'medium' | 'high',
      message: ''
    })
    const pointsCount = computed(() => dataStore.monitorPoints.length)
    const unhandledCount = computed(() => dataStore.alerts.filter((a) => !a.handled).length)
    const highRiskCount = computed(
      () => dataStore.alerts.filter((a) => a.level === 'high' && !a.handled).length
    )
    const loadingPoints = computed(() => dataStore.loadingPoints)
    const loadingAlerts = computed(() => dataStore.loadingAlerts)

    function buildTrendSeries() {
      const now = Date.now()
      const dayMs = 24 * 60 * 60 * 1000
      const labels: string[] = []
      const counts: number[] = []
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now - i * dayMs)
        const label = `${start.getMonth() + 1}/${start.getDate()}`
        labels.push(label)
        const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
        const dayEnd = dayStart + dayMs
        const c = dataStore.alerts.filter((a) => a.time >= dayStart && a.time < dayEnd).length
        counts.push(c)
      }
      return { labels, counts }
    }

    function renderChart() {
      if (!chart.value) return
      if (!chartInstance.value) chartInstance.value = echarts.init(chart.value)
      const { labels, counts } = buildTrendSeries()
      chartInstance.value.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: labels },
        yAxis: { type: 'value' },
        series: [{ data: counts, type: 'line', smooth: true }]
      })
    }

    // 拉取所有需要的数据（支持强制刷新）
    const fetchAll = async (force = false) => {
      await Promise.all([dataStore.fetchMonitorPoints(), dataStore.fetchAlerts(force)])
      renderChart()
    }

    const showCreateModal = () => {
      createForm.value = { pointId: 1, level: 'medium', message: '' }
      createModalVisible.value = true
    }

    const handleCreate = async () => {
      if (!createForm.value.message.trim()) {
        message.warning('请输入预警信息')
        return
      }
      try {
        await dataStore.createAlert({
          pointId: createForm.value.pointId,
          level: createForm.value.level,
          message: createForm.value.message
        })
        message.success('预警创建成功！')
        createModalVisible.value = false
        await fetchAll(true)
      } catch (e) {
        message.error('创建预警失败')
      }
    }

    const handleToggle = async (alert: any) => {
      // 如果你希望 Dashboard 上也能快速切换处理状态，可以实现类似的动作并刷新
      await dataStore.updateAlert(alert.id, { handled: !alert.handled })
    }

    // 初始加载
    onMounted(() => {
      fetchAll()
    })

    // alerts 变化时刷新图表
    watch(
      () => dataStore.alerts,
      () => {
        renderChart()
      },
      { deep: true }
    )

    return {
      dataStore,
      chart,
      pointsCount,
      unhandledCount,
      highRiskCount,
      loadingPoints,
      loadingAlerts,
      createModalVisible,
      createForm,
      showCreateModal,
      fetchAll,
      handleCreate,
      handleToggle
    }
  }
})
</script> 

```
### alerts

```vue
<!-- src/views/Alerts.vue -->
<template>
  <div style="max-width: 800px; margin: 24px auto">
    <a-card title="预警管理">
      <template #extra>
        <a-button type="primary" size="small" @click="showCreateModal">新建预警</a-button>
        <a-button size="small" style="margin-left: 8px" @click="fetchAlerts">刷新</a-button>
      </template>
    
      <!-- 创建预警表单（inline） -->
      <a-form
        :model="createForm"
        layout="inline"
        style="margin-bottom: 24px">
        <a-form-item label="监测点ID">
          <a-input-number
            v-model:value="createForm.pointId"
            :min="1" />
        </a-form-item>
        <a-form-item label="预警级别">
          <a-select
            v-model:value="createForm.level"
            style="width: 120px">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
         <a-form-item label="预警信息">
          <a-input v-model:value="createForm.message" placeholder="预警描述" style="width: 240px" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleCreate">创建</a-button>
        </a-form-item>
      </a-form>

      <!-- 预警表格 -->
      <a-table
        :dataSource="dataStore.alerts"
        :loading="dataStore.loadingAlerts"
        :columns="columns"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="levelColors[(record.level as string) || 'medium']">
              {{ levelText[(record.level as string) || 'medium'] }}
            </a-tag>
          </template>
        
          <template v-else-if="column.key === 'time'">
            {{ formatTime(record.time) }}
          </template>
            
          <template v-else-if="column.key === 'handled'">
            <a-tag :color="record.handled ? 'green' : 'red'">
              {{ record.handled ? '已处理' : '未处理' }}
            </a-tag>
          </template>
          
          <template v-else-if="column.key === 'action'">
            <a-button size="small" style="margin-right: 8px" @click="handleToggle(record)">
              {{ record.handled ? '标记未处理' : '标记已处理' }}
            </a-button>
            <a-button size="small" danger @click="handleDelete(record.id)">删除</a-button>
          </template>
          
          <template v-else>
            {{ record[column.dataIndex] }}
          </template>

        <template #empty>
          <a-empty description="暂无预警信息" />
        </template>
      </a-table>
    </a-card>
        
	 <!-- 新建预警模态（次要） -->
    <a-modal v-model:visible="createModalVisible" title="新建预警" @ok="handleCreateModalOk" @cancel="createModalVisible = false">
      <a-form :model="createFormModal" layout="vertical">
        <a-form-item label="监测点ID" required>
          <a-input-number v-model:value="createFormModal.pointId" :min="1" style="width:100%" />
        </a-form-item>
        <a-form-item label="预警级别" required>
          <a-select v-model:value="createFormModal.level">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="预警信息" required>
          <a-textarea v-model:value="createFormModal.message" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'

const dataStore = useDataStore()

const createForm = reactive({
  pointId: 1,
  level: 'medium' as 'low' | 'medium' | 'high',
  message: ''
})

// modal 专用表单（可与 inline 表单分开）
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

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '监测点', dataIndex: 'pointId', key: 'pointId' },
  { title: '级别', dataIndex: 'level', key: 'level' },
  { title: '信息', dataIndex: 'message', key: 'message' },
  { title: '时间', dataIndex: 'time', key: 'time' },
  { title: '状态', dataIndex: 'handled', key: 'handled' },
  { title: '操作', key: 'action' }
]

// 直接使用 store 的方法
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

const handleCreate = async () => {
  // inline 表单创建
  if (!createForm.message.trim()) {
    message.warning('请输入预警信息')
    return
  }
  try {
    await dataStore.createAlert({
      pointId: Number(createForm.pointId),
      level: createForm.level,
      message: createForm.message.trim()
    })
    message.success('预警创建成功！')
    createForm.message = ''
    await fetchAlerts()
  } catch (e) {
    message.error('创建预警失败')
    console.error(e)
  }
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
    message.success('预警创建成功！')
    createModalVisible.value = false
    await fetchAlerts()
  } catch (e) {
    message.error('创建预警失败')
    console.error(e)
  }
}

// 切换处理状态
const handleToggle = async (alert: any) => {
  try {
    await dataStore.updateAlert(alert.id, { handled: !alert.handled })
    message.success('状态更新成功')
    await fetchAlerts()
  } catch (e) {
    message.error('更新失败')
    console.error(e)
  }
}

// 删除
const handleDelete = async (id: number) => {
  try {
    await dataStore.deleteAlert(id)
    message.success('预警删除成功')
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
```

---

## ❗ 易错点
- 

