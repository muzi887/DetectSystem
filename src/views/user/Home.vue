<template>
  <AppLayout>
    <div class="dashboard-container">
      <div class="glass-panel welcome">
        <h2>欢迎！</h2>
        <p>AI技术赋能下的作物灾害智慧监测预警系统：查看监测点、处理预警、上传图片分析（演示环境）。</p>
        <div class="quick-links">
          <router-link
            to="/map"
            class="quick-btn">
            实时监测
          </router-link>
          <router-link
            to="/warnings"
            class="quick-btn">
            处理预警
          </router-link>
          <router-link
            to="/analysis"
            class="quick-btn">
            智能分析
          </router-link>
        </div>
      </div>

      <div class="glass-panel stats">
        <h3>核心指标概览</h3>
        <div class="stat-grid">
          <div class="stat-card">
            <h4>监测点总数</h4>
            <p class="value">{{ monitorPointsCount }} 个</p>
          </div>
          <div class="stat-card">
            <h4>当前待处理</h4>
            <p class="value alert">{{ unhandledAlertsCount }} 条</p>
          </div>
          <div class="stat-card">
            <h4>系统状态</h4>
            <p
              class="value"
              :class="systemStatus.class">
              {{ systemStatus.label }}
            </p>
          </div>
        </div>
      </div>

      <div class="glass-panel recent-analyses">
        <div class="recent-analyses-head">
          <h3>近期识别</h3>
          <router-link
            to="/analysis"
            class="recent-analyses-more">
            去智能分析
          </router-link>
        </div>
        <div
          v-if="pagedAnalyses.length"
          class="analysis-card-grid">
          <router-link
            v-for="item in pagedAnalyses"
            :key="item.id ?? item.createdAt"
            to="/analysis"
            class="analysis-card">
            <span class="analysis-card-label">{{ item.label }}</span>
            <span class="analysis-card-meta">
              {{ cropLabel(item.cropType) }} · {{ formatConfidence(item.confidence) }}
            </span>
            <span class="analysis-card-time">{{ formatAnalysisTime(item.createdAt) }}</span>
          </router-link>
        </div>
        <div
          v-else
          class="analysis-empty">
          <GlassEmpty
            description="暂无识别记录。启动识病服务并在智能分析页上传叶片后，最近结果会显示在这里。" />
          <router-link
            to="/analysis"
            class="quick-btn">
            去智能分析
          </router-link>
        </div>
        <a-pagination
          v-if="showAnalysisPagination"
          v-model:current="analysisPage"
          class="home-list-pagination"
          :total="recentAnalyses.length"
          :page-size="HOME_ANALYSIS_PAGE_SIZE"
          size="small"
          :show-size-changer="false" />
      </div>

      <div class="glass-panel recent-alerts">
        <h3>最新预警动态</h3>
        <a-list
          class="home-list"
          item-layout="horizontal"
          :data-source="pagedAlerts"
          :pagination="false"
          :loading="dataStore.loadingAlerts">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :description="formatTime(item.time)">
                <template #title>
                  <router-link
                    to="/warnings"
                    :class="getLevelClass(item.level)">
                    监测点 #{{ item.pointId }}: {{ item.message }}
                  </router-link>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
          <template #empty>
            <GlassEmpty
              description="暂无预警信息"
              style="padding-top: 20px" />
          </template>
        </a-list>
        <a-pagination
          v-if="showAlertPagination"
          v-model:current="alertPage"
          class="home-list-pagination"
          :total="sortedAlerts.length"
          :page-size="HOME_ALERT_PAGE_SIZE"
          size="small"
          :show-size-changer="false" />
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDataStore } from '@/stores/data'
import AppLayout from '@/layouts/AppLayout.vue'
import GlassEmpty from '@/components/GlassEmpty.vue'
import { getAlertLevelClass } from '@/utils/alertLevel'
import { formatTime } from '@/utils/formatTime'
import { fetchAnalysisRecent } from '@/api/analysis.ts'
import { BJJ_CROP_LABELS } from '@/constants/crops.ts'

interface RecentAnalysisItem {
  id?: number
  label: string
  confidence: number
  cropType?: string
  createdAt?: string
}

const HOME_ALERT_PAGE_SIZE = 3
const HOME_ANALYSIS_PAGE_SIZE = 3

const dataStore = useDataStore()
const recentAnalyses = ref<RecentAnalysisItem[]>([])
const alertPage = ref(1)
const analysisPage = ref(1)

const unhandledAlertsCount = computed(() => dataStore.unhandledAlerts.length)

const systemStatus = computed(() => {
  const pending = dataStore.unhandledAlerts
  if (pending.length === 0) {
    return { label: '正常', class: 'status-normal' }
  }
  if (pending.some((a) => a.level === 'critical')) {
    return { label: '严重告警', class: 'status-critical' }
  }
  if (pending.some((a) => a.level === 'high')) {
    return { label: '高风险', class: 'status-high' }
  }
  if (pending.some((a) => a.level === 'warning' || a.level === 'medium')) {
    return { label: '需关注', class: 'status-warning' }
  }
  return { label: '轻微波动', class: 'status-low' }
})

const monitorPointsCount = computed(() => dataStore.monitorPoints.length)

const sortedAlerts = computed(() =>
  [...dataStore.filteredAlerts].sort((a, b) => b.time - a.time)
)

const showAlertPagination = computed(() => sortedAlerts.value.length > HOME_ALERT_PAGE_SIZE)

const pagedAlerts = computed(() => {
  const start = (alertPage.value - 1) * HOME_ALERT_PAGE_SIZE
  return sortedAlerts.value.slice(start, start + HOME_ALERT_PAGE_SIZE)
})

const showAnalysisPagination = computed(
  () => recentAnalyses.value.length > HOME_ANALYSIS_PAGE_SIZE
)

const pagedAnalyses = computed(() => {
  const start = (analysisPage.value - 1) * HOME_ANALYSIS_PAGE_SIZE
  return recentAnalyses.value.slice(start, start + HOME_ANALYSIS_PAGE_SIZE)
})

watch(sortedAlerts, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / HOME_ALERT_PAGE_SIZE))
  if (alertPage.value > maxPage) alertPage.value = maxPage
})

watch(recentAnalyses, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / HOME_ANALYSIS_PAGE_SIZE))
  if (analysisPage.value > maxPage) analysisPage.value = maxPage
})

const getLevelClass = getAlertLevelClass

function cropLabel(cropType?: string) {
  if (!cropType) return '作物未标注'
  return (BJJ_CROP_LABELS as Record<string, string>)[cropType] ?? '作物未标注'
}

function formatConfidence(value: number) {
  const pct = value <= 1 ? value * 100 : value
  return `${Math.round(pct)}%`
}

function formatAnalysisTime(iso?: string) {
  if (!iso) return ''
  const parsed = Date.parse(iso)
  if (Number.isNaN(parsed)) return iso
  return formatTime(parsed)
}

onMounted(() => {
  dataStore.fetchAlerts()
  dataStore.fetchMonitorPoints()
  fetchAnalysisRecent(6)
    .then((res) => {
      recentAnalyses.value = Array.isArray(res.data?.records) ? res.data.records : []
    })
    .catch(() => {
      recentAnalyses.value = []
    })
})
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  max-width: var(--page-max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 24px;
  min-height: 100%;
}

.welcome {
  grid-column: 1 / 3;
  grid-row: 1;
  padding: 40px;
  text-align: center;
  background-color: var(--glass-bg-welcome);
  align-items: center;
  justify-content: center;
}

.welcome h2 {
  color: var(--light-green);
  font-size: 32px;
  margin-bottom: 15px;
  font-weight: bold;
  text-shadow: var(--glass-title-shadow);
}

.welcome p {
  margin-bottom: 30px;
  font-size: 18px;
  color: var(--glass-text-secondary);
  text-shadow: var(--glass-text-shadow);
}

.quick-links {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.quick-btn {
  padding: 12px 30px;
  background-color: var(--dark-green);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.quick-btn:hover {
  background-color: #5d7454;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 20%);
}

.stats {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  min-height: 0;
}

.stats h3,
.recent-alerts h3,
.recent-analyses h3 {
  padding-bottom: 15px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 20px;
  font-size: 18px;
  color: var(--light-green);
  font-weight: bold;
  text-shadow: var(--glass-title-shadow);
}

.recent-analyses-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 16px;
}

.recent-analyses-head h3 {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
}

.recent-analyses-more {
  color: var(--light-green);
  font-size: 13px;
  text-decoration: none;
  text-shadow: var(--glass-text-shadow);
  white-space: nowrap;
}

.recent-analyses-more:hover {
  text-decoration: underline;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  flex-grow: 1;
  align-content: center;
}

.stat-card {
  padding: 25px 15px;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  text-align: center;
  background-color: var(--glass-bg-subtle);
  transition: transform 0.3s;
}

.stat-card:hover {
  background-color: var(--glass-bg-item-hover);
}

.stat-card h4 {
  color: var(--glass-text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 500;
  text-shadow: var(--glass-text-shadow);
}

.stat-card .value {
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  color: var(--glass-text-primary);
  text-shadow: var(--glass-text-shadow);
}

.stat-card .alert {
  color: #ff9800;
}

.stat-card .status-normal {
  color: #4caf50;
}

.stat-card .status-critical {
  color: #cf1322;
}

.stat-card .status-high {
  color: #ff4d4f;
}

.stat-card .status-warning {
  color: #faad14;
}

.stat-card .status-low {
  color: #95de64;
}

.recent-alerts {
  grid-column: 2;
  grid-row: 2 / 4;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.recent-analyses {
  grid-column: 1;
  grid-row: 3;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.analysis-card-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.analysis-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  background-color: var(--glass-bg-subtle);
  color: var(--glass-text-primary);
  text-decoration: none;
  text-shadow: var(--glass-text-shadow);
}

.analysis-card:hover {
  background-color: var(--glass-bg-item-hover);
}

.analysis-card-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--light-green);
}

.analysis-card-meta,
.analysis-card-time {
  font-size: 13px;
  color: var(--glass-text-muted);
}

.analysis-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0 4px;
  min-width: 0;
}

.analysis-empty :deep(.ant-empty-description) {
  white-space: normal;
  word-break: break-word;
}

.home-list {
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.home-list-pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding-top: 4px;
  margin-top: 8px;
}

.home-list-pagination :deep(.ant-pagination-item a) {
  color: var(--light-green);
}

.home-list-pagination :deep(.ant-pagination-item),
.home-list-pagination :deep(.ant-pagination-prev .ant-pagination-item-link),
.home-list-pagination :deep(.ant-pagination-next .ant-pagination-item-link) {
  background-color: transparent !important;
  border-color: var(--glass-border-strong, var(--glass-border)) !important;
  color: var(--glass-text-primary);
}

.home-list-pagination :deep(.ant-pagination-item-active) {
  background-color: var(--dark-green, #4a5c43) !important;
  border-color: var(--dark-green, #4a5c43) !important;
}

.home-list-pagination :deep(.ant-pagination-item-active a) {
  color: white !important;
}

.home-list-pagination :deep(.ant-pagination-disabled .ant-pagination-item-link),
.home-list-pagination :deep(.ant-pagination-disabled) {
  color: var(--glass-text-muted) !important;
  border-color: var(--glass-border) !important;
  background-color: transparent !important;
}

.recent-alerts :deep(.ant-list) {
  color: white;
}

.recent-alerts :deep(.ant-list-item-meta-title) {
  color: var(--glass-text-secondary);
  font-weight: 500;
  font-size: 14px;
  text-shadow: var(--glass-text-shadow);
}

.recent-alerts :deep(.ant-list-item) {
  border-block-end: 1px solid var(--glass-border) !important;
  padding: 16px 0;
  background-color: var(--glass-bg-item);
  margin-bottom: 4px;
  border-radius: 4px;
  padding-inline: 8px;
}

.recent-alerts :deep(.ant-list-item-meta-title a) {
  color: var(--glass-text-secondary);
  font-weight: 500;
  transition: color 0.3s;
  font-size: 14px;
  text-shadow: var(--glass-text-shadow);
  white-space: normal;
  word-break: break-word;
}

.recent-alerts :deep(.ant-list-item-meta-title a:hover) {
  color: var(--light-green);
  text-decoration: underline;
}

.recent-alerts :deep(.ant-list-item-meta-description) {
  color: var(--glass-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.level-critical {
  color: #cf1322 !important;
  font-weight: bold !important;
}

.level-high {
  color: #ff4d4f !important;
  font-weight: bold !important;
}

.level-warning {
  color: #faad14 !important;
}

.level-medium {
  color: #faad14 !important;
}

.level-low {
  color: #95de64 !important;
}

@media (width <= 992px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    gap: 16px;
  }

  .welcome,
  .stats,
  .recent-alerts,
  .recent-analyses {
    grid-column: 1;
    grid-row: auto;
  }

  .welcome {
    padding: 28px 20px;
  }

  .stat-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (width <= 576px) {
  .welcome h2 {
    font-size: 24px;
  }

  .welcome p {
    font-size: 15px;
    margin-bottom: 20px;
  }

  .quick-links {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .quick-btn {
    text-align: center;
    padding: 10px 16px;
    font-size: 15px;
  }

  .stat-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 16px 12px;
  }

  .stat-card .value {
    font-size: 22px;
  }

  .analysis-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
