<template>
  <AppLayout>
    <main class="main-content page-main-shell page-main-shell--scroll">
      <div class="content-wrapper glass-page">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智能分析</div>
          </template>

          <div class="analysis-body-container">
            <div class="form-section">
              <div class="upload-wrapper">
                <a-upload
                  v-model:file-list="fileList"
                  name="file"
                  list-type="picture-card"
                  class="avatar-uploader"
                  :show-upload-list="false"
                  :before-upload="beforeUpload"
                  :customRequest="customUpload"
                  @change="handleChange">
                  <img
                    v-if="imageUrl"
                    :src="imageUrl"
                    alt="uploaded-image"
                    class="uploaded-image" />
                  <div v-else>
                    <loading-outlined v-if="loading"></loading-outlined>
                    <plus-outlined v-else></plus-outlined>
                    <div class="ant-upload-text">上传图片</div>
                  </div>
                </a-upload>
                <div
                  v-if="uploading"
                  class="upload-progress-overlay">
                  <a-progress
                    type="circle"
                    :percent="uploadProgress"
                    :width="80">
                    <template #format="percent">{{ percent }}%</template>
                  </a-progress>
                </div>
              </div>

              <a-form
                class="analysis-form"
                layout="vertical">
                <a-form-item>
                  <div class="form-inline-group">
                    <a-select
                      v-model:value="formState.cropType"
                      style="flex-grow: 1">
                      <a-select-option value="wheat">小麦</a-select-option>
                      <a-select-option value="corn">玉米</a-select-option>
                      <a-select-option value="tomato">番茄</a-select-option>
                      <a-select-option value="rice">水稻</a-select-option>
                    </a-select>
                    <a-button @click="handleIdentify">识别</a-button>
                  </div>
                </a-form-item>
                <a-form-item label="其他补充信息：">
                  <a-textarea
                    v-model:value="formState.additionalInfo"
                    placeholder="请输入..."
                    :rows="2" />
                </a-form-item>
              </a-form>
              <a-button
                type="primary"
                block
                size="large"
                @click="handleConfirm">
                确定
              </a-button>
              <div class="batch-row">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  @change="onBatchFiles" />
                <a-button
                  :loading="analyzing"
                  @click="handleBatch">
                  批量识别
                </a-button>
              </div>
            </div>

            <div class="category-section">
              <a-button
                v-for="category in categories"
                :key="category.key"
                :class="{ active: selectedCategory === category.key }"
                class="category-btn"
                @click="selectedCategory = category.key">
                {{ category.name }}
              </a-button>
            </div>
          </div>

          <div class="result-section">
            <div
              v-if="analyzing"
              class="result-panel result-loading">
              <a-spin size="large" />
              <p>正在智能分析中，请稍候…</p>
            </div>
            <div
              v-else-if="analysisResult"
              class="result-panel">
              <div class="result-header">
                <h3 class="result-title">分析结果</h3>
                <a-tag :color="analysisResult.isHealthy ? 'success' : 'error'">
                  {{ analysisResult.isHealthy ? '健康' : '需关注' }}
                </a-tag>
              </div>
              <div class="result-meta">
                <span>作物：{{ cropLabel }}</span>
                <span>识别类型：{{ categoryLabel }}</span>
                <span>分析时间：{{ formatAnalyzedAt(analysisResult.analyzedAt) }}</span>
              </div>
              <p class="result-text">{{ analysisResult.result }}</p>
              <div class="confidence-block">
                <div class="confidence-label">
                  <span>模型置信度</span>
                  <strong>{{ confidencePercent }}%</strong>
                </div>
                <a-progress
                  :percent="confidencePercent"
                  :stroke-color="confidenceStrokeColor"
                  :show-info="false" />
              </div>
              <p
                v-if="needsManualReview"
                class="result-review-hint">
                置信度偏低，建议人工复核后再生成高等级预警。
              </p>
              <div
                v-if="needsManualReview && analysisResult && fileList[0]?.originFileObj"
                class="feedback-box">
                <a-input
                  v-model:value="correctedLabel"
                  placeholder="实际病名（须与 23 类一致）" />
                <a-button
                  type="primary"
                  :loading="feedbackSubmitting"
                  @click="handleFeedback">
                  提交纠错
                </a-button>
              </div>
              <TreatmentGuidePanel
                v-if="treatmentItem"
                :item="treatmentItem"
                :disclaimer="treatmentDisclaimer"
                :manual-review="needsManualReview" />
              <template v-if="!analysisResult.isHealthy">
                <p class="result-hint">结果已同步写入预警列表，可在灾害预警页查看与处理。</p>
                <a-button
                  type="link"
                  class="goto-warnings-btn"
                  @click="router.push('/warnings')">
                  前往预警列表 →
                </a-button>
              </template>
            </div>
            <div
              v-else
              class="result-panel result-empty">
              <ExperimentOutlined class="result-empty-icon" />
              <p>上传图片并点击「确定」或「识别」后，分析结果将显示在这里</p>
            </div>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { PlusOutlined, LoadingOutlined, ExperimentOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps, UploadFile } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import TreatmentGuidePanel from '@/components/TreatmentGuidePanel.vue'
import { analyzeImage, analyzeBatch, submitAnalysisFeedback } from '@/api/analysis.ts'
import { useTreatmentGuide } from '@/composables/useTreatmentGuide'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'

const store = useDataStore()
const router = useRouter()
const { getTreatment, disclaimer: treatmentDisclaimer } = useTreatmentGuide()

const formState = reactive({
  cropType: 'wheat',
  additionalInfo: ''
})

const cropLabels: Record<string, string> = {
  wheat: '小麦',
  corn: '玉米',
  tomato: '番茄',
  rice: '水稻'
}

const categories = [
  { key: 'disaster', name: '灾害识别' },
  { key: 'pest', name: '病虫害识别' },
  { key: 'climate', name: '气候灾害识别' },
  { key: 'other', name: '其他' }
]
const selectedCategory = ref('pest')

interface AnalysisResultView {
  result: string
  confidence: number
  isHealthy: boolean
  cropType: string
  category: string
  analyzedAt: number
}

const fileList = ref<UploadFile[]>([])
const batchFiles = ref<File[]>([])
const loading = ref<boolean>(false)
const uploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const imageUrl = ref<string>('')
const analyzing = ref(false)
const analysisResult = ref<AnalysisResultView | null>(null)
const recordId = ref<number | null>(null)
const correctedLabel = ref('')
const feedbackSubmitting = ref(false)

const cropLabel = computed(
  () => cropLabels[analysisResult.value?.cropType ?? formState.cropType] ?? formState.cropType
)

const categoryLabel = computed(() => {
  const key = analysisResult.value?.category ?? selectedCategory.value
  return categories.find((c) => c.key === key)?.name ?? key
})

const confidencePercent = computed(() => {
  if (!analysisResult.value) return 0
  const raw = analysisResult.value.confidence
  const pct = raw <= 1 ? raw * 100 : raw
  return Math.min(100, Math.max(0, Math.round(pct)))
})

const confidenceStrokeColor = computed(() => {
  const p = confidencePercent.value
  if (p >= 80) return '#73d13d'
  if (p >= 60) return '#faad14'
  return '#ff4d4f'
})

const needsManualReview = computed(() => {
  if (!analysisResult.value) return false
  return confidencePercent.value < 70 && !analysisResult.value.isHealthy
})

const treatmentItem = computed(() => {
  if (!analysisResult.value) return null
  return getTreatment(analysisResult.value.result)
})

function formatAnalyzedAt(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const customUpload = (options: any) => {
  const { onSuccess, file } = options
  setTimeout(() => onSuccess('Ok', file), 100)
}

const handleChange = (info: UploadChangeParam) => {
  fileList.value = info.fileList

  if (info.file.status === 'uploading') {
    analysisResult.value = null
    loading.value = true
    uploading.value = true
    uploadProgress.value = 0
    const interval = setInterval(() => {
      uploadProgress.value += Math.floor(Math.random() * 10) + 5
      if (uploadProgress.value >= 84) {
        uploadProgress.value = 84
        clearInterval(interval)
      }
    }, 200)
    return
  }
  if (info.file.status === 'done') {
    uploadProgress.value = 100
    setTimeout(() => {
      uploading.value = false
      loading.value = false
      getBase64(info.file.originFileObj as Blob, (base64Url: string) => {
        imageUrl.value = base64Url
      })
    }, 500)
  }
  if (info.file.status === 'error') {
    uploading.value = false
    loading.value = false
    message.error('上传失败')
  }
}

const handleConfirm = async () => {
  if (!imageUrl.value || !fileList.value[0]?.originFileObj) {
    message.warning('请先上传一张图片！')
    return
  }

  analyzing.value = true
  analysisResult.value = null
  recordId.value = null
  correctedLabel.value = ''

  try {
    const response = await analyzeImage({
      file: fileList.value[0].originFileObj,
      cropType: formState.cropType,
      category: selectedCategory.value,
      additionalInfo: formState.additionalInfo,
      pointId: store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id
    })

    const aiResult = response.data.result as string
    const aiConfidence = response.data.confidence as number
    const rawLevel = response.data.level as string
    const level =
      rawLevel === 'low' || rawLevel === 'medium' || rawLevel === 'high' ? rawLevel : 'medium'
    const isHealthy = aiResult.includes('健康')
    const cropName = cropLabels[formState.cropType] ?? formState.cropType

    const rawRecordId = response.data.recordId
    recordId.value = typeof rawRecordId === 'number' ? rawRecordId : null

    analysisResult.value = {
      result: aiResult,
      confidence: aiConfidence,
      isHealthy,
      cropType: formState.cropType,
      category: selectedCategory.value,
      analyzedAt: Date.now()
    }

    if (!isHealthy) {
      const defaultPointId = store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id ?? 1
      const pct = (aiConfidence <= 1 ? aiConfidence * 100 : aiConfidence).toFixed(1)
      await store.createAlert({
        pointId: defaultPointId,
        level,
        message: `[AI识别] 监测到 ${cropName} - ${aiResult} (置信度: ${pct}%)`,
        handled: false
      })
    }

    message.success('分析完成！请查看下方结果卡片。')
  } catch (error) {
    message.error('分析或保存失败，请重试。')
    console.error('Error:', error)
  } finally {
    analyzing.value = false
  }
}

const onBatchFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  batchFiles.value = input.files ? Array.from(input.files) : []
}

const handleBatch = async () => {
  if (!batchFiles.value.length) {
    message.warning('请先选择多张图片')
    return
  }
  analyzing.value = true
  analysisResult.value = null
  recordId.value = null
  correctedLabel.value = ''
  try {
    const response = await analyzeBatch({
      files: batchFiles.value,
      cropType: formState.cropType,
      category: selectedCategory.value,
      additionalInfo: formState.additionalInfo,
      pointId: store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id
    })
    const results = Array.isArray(response.data?.results) ? response.data.results : []
    message.info(`完成 ${results.length} 张`)
    const first = results.find((item: { result?: string }) => item?.result)
    if (first) {
      const aiResult = first.result as string
      const aiConfidence = Number(first.confidence)
      recordId.value = typeof first.recordId === 'number' ? first.recordId : null
      analysisResult.value = {
        result: aiResult,
        confidence: aiConfidence,
        isHealthy: aiResult.includes('健康'),
        cropType: formState.cropType,
        category: selectedCategory.value,
        analyzedAt: Date.now()
      }
      const firstFile = batchFiles.value[0]
      if (firstFile) {
        getBase64(firstFile, (base64Url: string) => {
          imageUrl.value = base64Url
        })
      }
    }
  } catch (error) {
    message.error('批量识别失败，请重试。')
    console.error('Batch error:', error)
  } finally {
    analyzing.value = false
  }
}

const handleFeedback = async () => {
  const file = fileList.value[0]?.originFileObj
  const label = correctedLabel.value.trim()
  if (!file || !label) {
    message.warning('请填写实际病名')
    return
  }
  feedbackSubmitting.value = true
  try {
    await submitAnalysisFeedback({
      file,
      correctedLabel: label,
      recordId: recordId.value ?? undefined
    })
    message.success('已写入难例队列')
  } catch (error) {
    message.error('纠错提交失败，请核对病名是否属于 23 类。')
    console.error('Feedback error:', error)
  } finally {
    feedbackSubmitting.value = false
  }
}

const handleIdentify = () => handleConfirm()
</script>

<style scoped>
.glass-page :deep(.ant-card-body) {
  padding: 24px 32px;
}

.analysis-body-container {
  display: flex;
  gap: 40px;
}

.form-section {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-wrapper {
  position: relative;
  margin-bottom: 24px;
}

.avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card) {
  width: 250px;
  height: 250px;
  background-color: var(--glass-bg-subtle) !important;
  border: 1px dashed var(--glass-border-strong) !important;
  border-radius: 8px;
}

.avatar-uploader :deep(.ant-upload-text),
.avatar-uploader :deep(.anticon) {
  color: var(--glass-text-muted);
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0 0 0 / 50%);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
}

.upload-progress-overlay :deep(.ant-progress-text) {
  color: white !important;
}

.analysis-form {
  width: 100%;
  margin-bottom: 16px;
}

.form-inline-group {
  display: flex;
  gap: 12px;
}

.batch-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 12px;
}

.batch-row input[type='file'] {
  flex: 1;
  min-width: 0;
  color: var(--glass-text-secondary);
}

.analysis-form :deep(.ant-form-item-label > label) {
  color: var(--light-green);
}

.analysis-form :deep(.ant-input),
.analysis-form :deep(.ant-select-selector),
.analysis-form :deep(.ant-input-affix-wrapper) {
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.analysis-form :deep(.ant-select-selection-item) {
  color: var(--glass-text-primary) !important;
}

.analysis-form :deep(.ant-select-arrow) {
  color: var(--glass-text-muted);
}

.form-inline-group .ant-btn {
  background-color: var(--primary-green);
  border-color: var(--primary-green);
  color: white;
}

.form-section > .ant-btn-primary {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

.category-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  background-color: var(--glass-bg-subtle);
  border-color: var(--glass-border-strong);
  color: var(--glass-text-primary);
  transition: all 0.3s;
  text-shadow: var(--glass-text-shadow);
}

.category-btn:hover {
  background-color: var(--glass-bg-item-hover);
  border-color: var(--glass-border-strong);
}

.category-btn.active {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
  font-weight: bold;
}

.result-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--glass-border);
}

.result-panel {
  background-color: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 24px;
}

.result-loading,
.result-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 120px;
  color: var(--glass-text-muted);
  text-align: center;
}

.result-empty-icon {
  font-size: 36px;
  color: var(--glass-text-muted);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.result-title {
  margin: 0;
  font-size: 18px;
  color: var(--light-green);
  font-weight: 600;
  text-shadow: var(--glass-title-shadow);
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--glass-text-muted);
}

.result-text {
  margin: 0 0 20px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--glass-text-primary);
  text-shadow: var(--glass-text-shadow);
}

.confidence-block {
  margin-bottom: 12px;
}

.confidence-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--glass-text-secondary);
}

.confidence-label strong {
  color: var(--glass-text-primary);
  font-size: 18px;
}

.result-review-hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: #faad14;
}

.feedback-box {
  display: flex;
  gap: 8px;
  margin: 0 0 16px;
}

.feedback-box :deep(.ant-input) {
  flex: 1;
}

.result-hint {
  margin: 16px 0 4px;
  font-size: 13px;
  color: var(--glass-text-muted);
}

.goto-warnings-btn {
  padding-left: 0 !important;
  color: #95de64 !important;
}

.goto-warnings-btn:hover {
  color: #b7eb8f !important;
}

@media (width <= 992px) {
  .analysis-body-container {
    flex-direction: column;
    gap: 24px;
  }

  .glass-page :deep(.ant-card-body) {
    padding: 16px;
  }
}

@media (width <= 576px) {
  .avatar-uploader :deep(.ant-upload.ant-upload-select-picture-card) {
    width: 200px;
    height: 200px;
  }
}
</style>
