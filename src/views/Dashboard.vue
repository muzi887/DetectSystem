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
      <!-- <a-card
        title="最近 7 天预警趋势"
        :loading="loadingAlerts"
        style="flex: 1 1 400px; min-width: 320px">
        <div
          ref="chart"
          style="height: 220px; width: 100%"></div>
      </a-card> -->
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
      v-model:open="createModalVisible"
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
import { defineComponent, ref, computed, onMounted, watch } from 'vue' //
import BasicLayout from '@/layouts/BasicLayout.vue'
import { useDataStore } from '@/stores/data.ts'
import * as echarts from 'echarts' //
import { message } from 'ant-design-vue'

export default defineComponent({
  name: 'Dashboard',
  components: { BasicLayout },

  setup() {
    const dataStore = useDataStore()

    // chart DOM & instance
    const chart = ref<HTMLDivElement | null>(null) //
    const chartInstance = ref<any>(null) //

    // modal / form
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

    // 构建最近 7 天数据（返回 reactive-friendly 值）//
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
        const c = dataStore.alerts.filter((a: any) => a.time >= dayStart && a.time < dayEnd).length
        counts.push(c)
      }
      return { labels, counts }
    }

    // 渲染图表
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

    // 拉取所有数据（force 可用于强制刷新）
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
