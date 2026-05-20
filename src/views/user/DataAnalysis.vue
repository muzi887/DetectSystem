<template>
  <AppLayout>
    <main class="main-content">
      <div class="content-wrapper">
        <a-card :bordered="false">
          <template #title>
            <div class="card-title">智能分析</div>
          </template>

          <!-- 卡片内容区域 -->
          <div class="analysis-body-container">
            <!-- 左侧：表单和上传区域 -->
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
                <!-- 上传进度遮罩层 (模拟截图效果) -->
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

              <!-- 表单控件 -->
              <a-form
                class="analysis-form"
                layout="vertical">
                <a-form-item>
                  <div class="form-inline-group">
                    <a-select
                      v-model:value="formState.cropType"
                      style="flex-grow: 1">
                      <a-select-option value="peach">桃</a-select-option>
                      <a-select-option value="apple">苹果</a-select-option>
                      <a-select-option value="wheat">小麦</a-select-option>
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
            </div>

            <!-- 右侧：分类选择区域 -->
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
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps, UploadFile } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { analyzeImage } from '@/api/analysis.ts'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router' // <--- 可选：如果你想跳转去查看

const store = useDataStore()
const router = useRouter()

const formState = reactive({
  cropType: 'peach',
  additionalInfo: ''
})
const categories = [
  { key: 'disaster', name: '灾害识别' },
  { key: 'pest', name: '病虫害识别' },
  { key: 'climate', name: '气候灾害识别' },
  { key: 'other', name: '其他' }
]
const selectedCategory = ref('disaster')

const fileList = ref<UploadFile[]>([])
const loading = ref<boolean>(false)
const uploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const imageUrl = ref<string>('')

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

/** 仅本地预览，不实际上传；真正分析在 handleConfirm 调 Flask */
const customUpload = (options: any) => {
  const { onSuccess, file } = options
  setTimeout(() => onSuccess('Ok', file), 100)
}

const handleChange = (info: UploadChangeParam) => {
  fileList.value = info.fileList

  if (info.file.status === 'uploading') {
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
  message.loading({ content: '正在智能分析中...', key: 'analyzing' })

  try {
    const response = await analyzeImage({
      file: fileList.value[0].originFileObj,
      cropType: formState.cropType,
      category: selectedCategory.value,
      additionalInfo: formState.additionalInfo
    })

    const aiResult = response.data.result
    const aiConfidence = response.data.confidence
    const isHealthy = aiResult.includes('健康')
    const alertLevel = isHealthy ? 'low' : 'high'

    await store.createAlert({
      pointId: 1,
      level: alertLevel,
      message: `[AI识别] 监测到 ${formState.cropType} - ${aiResult} (置信度: ${(aiConfidence * 100).toFixed(1)}%)`,
      handled: false
    })

    message.success({
      content: `分析完成！结果已自动存入预警列表。`,
      key: 'analyzing',
      duration: 3
    })
  } catch (error) {
    message.error({ content: '分析或保存失败，请重试。', key: 'analyzing', duration: 3 })
    console.error('Error:', error)
  }
}

const handleIdentify = () => handleConfirm()
</script>

<style scoped>
.main-content {
  /* 主题变量 */
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
  --glass-bg: rgb(255 255 255 / 10%);

  /* 核心布局样式 */
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

/* 5. 完善卡片样式，使其与 MapVisualization.vue 的玻璃质感完全一致 */
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

.content-wrapper :deep(.ant-card-body) {
  padding: 24px 32px; /* 稍微增加左右内边距 */
}

/* 6. 定义卡片内部的两栏布局 */
.analysis-body-container {
  display: flex;
  gap: 40px;
}

/* 左侧：表单区域 */
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
  background-color: rgb(255 255 255 / 5%) !important;
  border: 1px dashed rgb(255 255 255 / 40%) !important;
  border-radius: 8px;
}

.avatar-uploader :deep(.ant-upload-text),
.avatar-uploader :deep(.anticon) {
  color: rgb(255 255 255 / 70%);
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

/* 统一表单所有控件的视觉样式 */
.analysis-form :deep(.ant-form-item-label > label) {
  color: var(--light-green);
}

.analysis-form :deep(.ant-input),
.analysis-form :deep(.ant-select-selector),
.analysis-form :deep(.ant-input-affix-wrapper) {
  background-color: rgb(255 255 255 / 10%) !important;
  border: 1px solid rgb(255 255 255 / 30%) !important;
  color: white !important;
}

.analysis-form :deep(.ant-select-selection-item) {
  color: white !important;
}

.analysis-form :deep(.ant-select-arrow) {
  color: rgb(255 255 255 / 70%);
}

/* 统一表单区域的按钮样式 */
.form-inline-group .ant-btn {
  background-color: var(--primary-green);
  border-color: var(--primary-green);
  color: white;
}

.form-section > .ant-btn-primary {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
}

/* 右侧：分类按钮区域 */
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
  background-color: rgb(255 255 255 / 15%);
  border-color: rgb(255 255 255 / 30%);
  color: white;
  transition: all 0.3s;
}

.category-btn:hover {
  background-color: rgb(255 255 255 / 25%);
  border-color: rgb(255 255 255 / 40%);
}

.category-btn.active {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
  font-weight: bold;
}
</style>
