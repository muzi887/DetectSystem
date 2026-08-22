<template>
  <AppLayout>
    <main class="main-content page-main-shell page-main-shell--fill analysis-page-root">
      <div class="content-wrapper glass-page page-card-fill page-card-body-stack-md analysis-page-fill">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智能分析</div>
          </template>

          <div class="analysis-dashboard page-grid-stack-md">
            <div class="col-input">
              <a-card
                size="small"
                class="widget-card glass-widget-card input-panel"
                title="分析参数">
                <div class="input-main">
                  <div class="preview-box">
                    <a-upload
                      v-if="!imageUrl"
                      v-model:file-list="fileList"
                      name="file"
                      class="preview-upload"
                      accept="image/jpeg,image/png"
                      :show-upload-list="false"
                      :before-upload="beforeUpload"
                      :customRequest="customUpload"
                      @change="handleChange">
                      <div class="preview-empty">
                        <loading-outlined v-if="loading" />
                        <plus-outlined v-else />
                        <p>上传叶片</p>
                        <span>JPG / PNG，不超过 2MB</span>
                      </div>
                    </a-upload>
                    <button
                      v-else
                      type="button"
                      class="preview-open-btn"
                      aria-label="查看图像预览"
                      @click="previewOpen = true">
                      <img
                        :src="imageUrl"
                        alt=""
                        class="preview-image" />
                      <div
                        v-if="uploading || analyzing"
                        class="preview-overlay">
                        <a-progress
                          v-if="uploading"
                          type="circle"
                          :percent="uploadProgress"
                          :width="72" />
                        <a-spin
                          v-else
                          size="large" />
                      </div>
                    </button>
                  </div>

                  <div class="input-fields">
                    <div
                      class="category-row"
                      role="tablist"
                      aria-label="识别类别">
                      <button
                        v-for="category in categories"
                        :key="category.key"
                        type="button"
                        role="tab"
                        class="category-btn"
                        :class="{ active: selectedCategory === category.key }"
                        :aria-selected="selectedCategory === category.key"
                        @click="selectedCategory = category.key">
                        {{ category.short }}
                      </button>
                    </div>
                    <p
                      v-if="selectedCategory !== 'pest'"
                      class="category-hint">
                      当前模型为病虫害分类，其他类别仅供参考
                    </p>

                    <a-select
                      v-model:value="formState.cropType"
                      class="crop-select"
                      popup-class-name="glass-select-dropdown"
                      placeholder="作物">
                      <a-select-option
                        v-for="crop in bjjCropOptions"
                        :key="crop.value"
                        :value="crop.value">
                        {{ crop.label }}
                      </a-select-option>
                    </a-select>

                    <a-textarea
                      v-model:value="formState.additionalInfo"
                      class="note-input"
                      placeholder="补充信息（选填）"
                      :rows="2" />

                    <a-button
                      type="primary"
                      block
                      class="start-btn"
                      :loading="analyzing"
                      @click="handleConfirm">
                      开始分析
                    </a-button>
                  </div>
                </div>

                <div class="batch-row">
                  <input
                    ref="batchInputRef"
                    class="batch-file-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    @change="onBatchFiles" />
                  <button
                    type="button"
                    class="batch-file-picker"
                    @click="openBatchPicker">
                    <span class="batch-file-btn">批量</span>
                    <span class="batch-file-label">{{ batchFileLabel }}</span>
                  </button>
                  <a-button
                    class="batch-submit-btn"
                    :loading="analyzing"
                    @click="handleBatch">
                    识别
                  </a-button>
                </div>
              </a-card>
            </div>

            <div class="col-output">
              <a-card
                size="small"
                class="widget-card glass-widget-card output-panel"
                title="分析结果">
                <div
                  v-if="analyzing"
                  class="output-state">
                  <a-spin />
                  <p>推理中，请稍候</p>
                </div>
                <div
                  v-else-if="analysisResult"
                  class="output-result">
                  <div class="result-header">
                    <h3 class="result-title">{{ analysisResult.result }}</h3>
                    <a-tag :color="analysisResult.isHealthy ? 'success' : 'error'">
                      {{ analysisResult.isHealthy ? '健康' : '需关注' }}
                    </a-tag>
                  </div>
                  <p class="result-meta">
                    {{ cropLabel }} · {{ categoryLabel }} · {{ formatAnalyzedAt(analysisResult.analyzedAt) }}
                  </p>
                  <div class="confidence-block">
                    <div class="confidence-label">
                      <span>置信度</span>
                      <strong>{{ confidencePercent }}%</strong>
                    </div>
                    <a-progress
                      :percent="confidencePercent"
                      :stroke-color="confidenceStrokeColor"
                      :show-info="false"
                      size="small" />
                  </div>
                  <p
                    v-if="needsManualReview"
                    class="result-review-hint">
                    置信度偏低，建议人工复核后再生成高等级预警。
                  </p>
                  <div
                    v-if="needsManualReview && fileList[0]?.originFileObj"
                    class="feedback-box">
                    <a-input
                      v-model:value="correctedLabel"
                      placeholder="实际病名（23 类）"
                      size="small" />
                    <a-button
                      type="primary"
                      size="small"
                      :loading="feedbackSubmitting"
                      @click="handleFeedback">
                      纠错
                    </a-button>
                  </div>
                  <a-collapse
                    v-if="treatmentPanels.length"
                    v-model:activeKey="activeCollapseKeys"
                    class="suggestion-collapse"
                    :bordered="false">
                    <a-collapse-panel
                      v-for="panel in treatmentPanels"
                      :key="panel.key"
                      :header="panel.title">
                      <ul class="suggestion-panel-list">
                        <li
                          v-for="(line, idx) in panel.lines"
                          :key="idx">
                          {{ line }}
                        </li>
                      </ul>
                    </a-collapse-panel>
                  </a-collapse>
                  <p
                    v-if="treatmentDisclaimer && treatmentPanels.length"
                    class="treatment-disclaimer">
                    {{ treatmentDisclaimer }}
                  </p>
                  <div
                    v-if="!analysisResult.isHealthy"
                    class="result-links">
                    <a-button
                      type="link"
                      class="goto-link"
                      @click="router.push('/warnings')">
                      预警中心
                    </a-button>
                    <a-button
                      type="link"
                      class="goto-link"
                      @click="router.push('/decision')">
                      智慧决策
                    </a-button>
                  </div>
                </div>
                <div
                  v-else
                  class="output-state">
                  <ExperimentOutlined class="output-empty-icon" />
                  <p>开始分析后，病名、置信度与防治建议会显示在这里</p>
                </div>
              </a-card>
            </div>
          </div>
        </a-card>
      </div>
    </main>

    <a-modal
      v-model:open="previewOpen"
      title="图像预览"
      wrap-class-name="glass-preview-modal-wrap"
      :width="720"
      centered
      :footer="null"
      @cancel="previewOpen = false">
      <div class="preview-modal-stage">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="预览"
          class="preview-modal-image" />
        <div
          v-if="uploading || analyzing"
          class="preview-modal-overlay">
          <a-progress
            v-if="uploading"
            type="circle"
            :percent="uploadProgress"
            :width="88" />
          <a-spin
            v-else
            size="large" />
          <p>{{ uploading ? '正在上传…' : '正在智能分析…' }}</p>
        </div>
      </div>
      <div class="preview-modal-footer">
        <a-upload
          v-model:file-list="fileList"
          name="file"
          accept="image/jpeg,image/png"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          :customRequest="customUpload"
          @change="handleChange">
          <a-button>更换图片</a-button>
        </a-upload>
        <a-button
          type="primary"
          @click="previewOpen = false">
          关闭
        </a-button>
      </div>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { PlusOutlined, LoadingOutlined, ExperimentOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps, UploadFile } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { analyzeImage, analyzeBatch, submitAnalysisFeedback } from '@/api/analysis.ts'
import {
  useTreatmentGuide,
  buildTreatmentPanels,
  type TreatmentPanel
} from '@/composables/useTreatmentGuide'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'
import { BJJ_CROP_LABELS, BJJ_CROP_OPTIONS } from '@/constants/crops.ts'
import { canonicalizeDiseaseLabel } from '@/utils/diseaseLabels.ts'

const store = useDataStore()
const router = useRouter()
const { getTreatment, disclaimer: treatmentDisclaimer } = useTreatmentGuide()
const bjjCropOptions = BJJ_CROP_OPTIONS

const formState = reactive({
  cropType: 'wheat' as keyof typeof BJJ_CROP_LABELS,
  additionalInfo: ''
})

const cropLabels = BJJ_CROP_LABELS

const categories = [
  { key: 'disaster', name: '灾害识别', short: '灾害' },
  { key: 'pest', name: '病虫害识别', short: '病虫害' },
  { key: 'climate', name: '气候灾害识别', short: '气候' },
  { key: 'other', name: '其他', short: '其他' }
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
const batchInputRef = ref<HTMLInputElement | null>(null)

const batchFileLabel = computed(() => {
  const count = batchFiles.value.length
  if (count === 0) return '未选择任何文件'
  if (count === 1) return batchFiles.value[0].name
  return `已选择 ${count} 个文件`
})
const loading = ref<boolean>(false)
const uploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const imageUrl = ref<string>('')
const previewOpen = ref(false)
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

const treatmentPanels = computed((): TreatmentPanel[] => {
  if (!treatmentItem.value) return []
  return buildTreatmentPanels(treatmentItem.value)
})

const activeCollapseKeys = ref<string[]>([])

function resolveDefaultCollapseKeys(panels: TreatmentPanel[]): string[] {
  if (panels.some((p) => p.key === 'chemical')) return ['chemical']
  if (panels.some((p) => p.key === 'summary')) return ['summary']
  return panels.slice(0, 1).map((p) => p.key)
}

watch(
  treatmentPanels,
  (panels) => {
    activeCollapseKeys.value = resolveDefaultCollapseKeys(panels)
  },
  { immediate: true }
)

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

    const aiResult = canonicalizeDiseaseLabel(String(response.data.result ?? ''))
    if (!aiResult) {
      message.warning('京津冀版不展示桃/苹果病害，请改选小麦、玉米、番茄或水稻。')
      return
    }
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

    message.success('分析完成！请查看右侧结果。')
  } catch (error) {
    message.error('分析或保存失败，请重试。')
    console.error('Error:', error)
  } finally {
    analyzing.value = false
  }
}

function openBatchPicker() {
  batchInputRef.value?.click()
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
      const aiResult = canonicalizeDiseaseLabel(String(first.result ?? ''))
      if (!aiResult) {
        message.warning('京津冀版不展示桃/苹果病害，请改选小麦、玉米、番茄或水稻。')
        return
      }
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

</script>

<style scoped>
.analysis-page-root {
  width: 100%;
}

.analysis-dashboard {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.col-input,
.col-output {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.widget-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.input-panel,
.output-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.input-panel :deep(.ant-card-body),
.output-panel :deep(.ant-card-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px;
}

.input-panel :deep(.ant-card-body) {
  gap: 10px;
}

.input-main {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.preview-box {
  position: relative;
  min-height: 220px;
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.preview-upload {
  width: 100%;
  height: 100%;
}

.preview-upload :deep(.ant-upload) {
  display: flex;
  width: 100%;
  height: 100%;
  margin: 0;
  background: transparent;
  border: none;
}

.preview-upload :deep(.ant-upload-select) {
  width: 100%;
  height: 100%;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  min-height: 220px;
  padding: 16px;
  background-color: var(--glass-bg-subtle);
  border: 1px dashed var(--glass-border-strong);
  border-radius: 8px;
  color: var(--glass-text-muted);
  text-align: center;
  cursor: pointer;
}

.preview-empty :deep(.anticon),
.preview-empty .anticon {
  font-size: 36px;
}

.preview-empty p {
  margin: 0;
  font-size: 14px;
  color: var(--glass-text-secondary);
}

.preview-empty span {
  font-size: 12px;
}

.preview-open-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 220px;
  padding: 8px;
  border: 1px solid var(--glass-border-strong);
  border-radius: 8px;
  overflow: hidden;
  cursor: zoom-in;
  background: rgb(0 0 0 / 22%);
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
}

.input-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  min-height: 0;
}

.category-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex-shrink: 0;
}

.category-btn {
  height: 28px;
  padding: 0 12px;
  width: auto;
  flex: 0 0 auto;
  border: 1px solid var(--glass-border-strong);
  border-radius: 14px;
  background-color: var(--glass-bg-subtle);
  color: var(--glass-text-primary);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  text-shadow: var(--glass-text-shadow);
}

.category-btn:hover {
  background-color: var(--glass-bg-item-hover);
}

.category-btn.active {
  background-color: var(--dark-green);
  border-color: var(--dark-green);
  color: white;
  font-weight: 600;
}

.category-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--glass-text-muted);
}

.crop-select {
  width: 100%;
}

.crop-select :deep(.ant-select-selector),
.note-input.ant-input,
.feedback-box :deep(.ant-input) {
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.crop-select :deep(.ant-select-selection-item),
.crop-select :deep(.ant-select-arrow) {
  color: var(--glass-text-primary);
}

.note-input {
  resize: none;
}

.start-btn {
  flex-shrink: 0;
  margin-top: auto;
}

.batch-row {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: stretch;
  width: 100%;
}

.batch-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.batch-file-picker {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 3px 8px 3px 3px;
  background-color: var(--glass-bg-input);
  border: 1px solid var(--glass-border-strong);
  border-radius: 6px;
  cursor: pointer;
  color: inherit;
  font: inherit;
  text-align: left;
}

.batch-file-picker:hover {
  background-color: var(--glass-bg-item-hover);
}

.batch-file-picker:focus-visible {
  outline: 1px solid var(--glass-border-strong);
  outline-offset: 2px;
}

.batch-file-btn {
  flex-shrink: 0;
  padding: 2px 10px;
  background-color: var(--primary-green);
  border: 1px solid var(--primary-green);
  border-radius: 4px;
  color: var(--glass-text-primary);
  font-size: 13px;
  line-height: 22px;
  text-shadow: var(--glass-text-shadow);
}

.batch-file-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--glass-text-muted);
  font-size: 12px;
  text-shadow: var(--glass-text-shadow);
}

.batch-submit-btn.ant-btn {
  height: 32px;
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: var(--glass-text-primary) !important;
  text-shadow: var(--glass-text-shadow);
}

.batch-submit-btn.ant-btn:hover {
  background-color: var(--primary-green) !important;
  border-color: var(--primary-green) !important;
}

.output-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 0;
  color: var(--glass-text-muted);
  text-align: center;
  padding: 16px;
}

.output-state p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.output-empty-icon {
  font-size: 36px;
}

.output-result {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.result-title {
  margin: 0;
  font-size: 18px;
  color: var(--light-green);
  font-weight: 600;
  text-shadow: var(--glass-title-shadow);
}

.result-meta {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--glass-text-muted);
  flex-shrink: 0;
}

.confidence-block {
  margin-bottom: 12px;
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.feedback-box {
  display: flex;
  gap: 8px;
  margin: 0 0 12px;
  flex-shrink: 0;
}

.feedback-box :deep(.ant-input) {
  flex: 1;
}

.result-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  flex-shrink: 0;
  margin-top: 4px;
}

.goto-link {
  padding-left: 0 !important;
  color: #95de64 !important;
}

.goto-link:hover {
  color: #b7eb8f !important;
}

.suggestion-collapse {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: transparent;
}

.suggestion-collapse :deep(.ant-collapse-item) {
  border-color: var(--glass-border) !important;
  margin-bottom: 6px;
}

.suggestion-collapse :deep(.ant-collapse-header) {
  color: var(--light-green, #eef1ea) !important;
  font-weight: 600;
  padding: 6px 10px !important;
  background: rgb(0 0 0 / 15%);
  border-radius: 4px;
}

.suggestion-collapse :deep(.ant-collapse-content) {
  background: transparent;
  border-top: 1px solid var(--glass-border);
}

.suggestion-collapse :deep(.ant-collapse-content-box) {
  padding: 8px 10px !important;
}

.suggestion-panel-list {
  margin: 0;
  padding-left: 18px;
  color: var(--glass-text-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.suggestion-panel-list li {
  margin-bottom: 4px;
}

.treatment-disclaimer {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--glass-text-muted);
  flex-shrink: 0;
}

@media (width <= 992px) {
  .analysis-page-root.page-main-shell--fill {
    overflow-y: auto;
    flex: none;
    height: auto;
  }

  .analysis-dashboard {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    height: auto;
    overflow: visible;
  }

  .col-input,
  .col-output {
    min-height: auto;
    overflow: visible;
  }

  .output-panel :deep(.ant-card-body),
  .input-panel :deep(.ant-card-body) {
    overflow: visible;
  }

  .input-main {
    grid-template-columns: 1fr;
    flex: none;
  }

  .preview-box,
  .preview-empty,
  .preview-open-btn {
    min-height: 200px;
  }
}

@media (width <= 576px) {
  .preview-box,
  .preview-empty,
  .preview-open-btn {
    min-height: 180px;
  }
}
</style>

<style>
.glass-preview-modal-wrap .ant-modal {
  max-width: min(900px, 70vw);
}

.glass-preview-modal-wrap .ant-modal-content {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-strong);
  border-radius: 12px;
  box-shadow: var(--glass-shadow);
}

.glass-preview-modal-wrap .ant-modal-header {
  background: transparent !important;
  border-bottom: 1px solid var(--glass-border) !important;
}

.glass-preview-modal-wrap .ant-modal-title {
  color: var(--light-green) !important;
  text-shadow: var(--glass-title-shadow);
}

.glass-preview-modal-wrap .ant-modal-close {
  color: var(--glass-text-muted) !important;
}

.glass-preview-modal-wrap .ant-modal-close:hover {
  color: var(--glass-text-primary) !important;
}

.glass-preview-modal-wrap .ant-modal-body {
  padding: 16px 24px 20px;
}

.preview-modal-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  background: rgb(0 0 0 / 28%);
  border-radius: 8px;
  overflow: hidden;
}

.preview-modal-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.preview-modal-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgb(0 0 0 / 50%);
  color: var(--glass-text-primary);
}

.preview-modal-overlay p {
  margin: 0;
}

.preview-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.glass-preview-modal-wrap .ant-btn-default {
  background: var(--glass-bg-subtle) !important;
  border-color: var(--glass-border-strong) !important;
  color: var(--glass-text-primary) !important;
}

.glass-preview-modal-wrap .ant-btn-primary {
  background: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

@media (width <= 576px) {
  .glass-preview-modal-wrap .ant-modal {
    width: calc(100vw - 24px) !important;
    max-width: calc(100vw - 24px);
    margin: 12px auto;
  }

  .preview-modal-image {
    max-height: 60vh;
  }
}
</style>
