好的，这个问题很常见。`Unexpected unknown pseudo-class selector ":global"` 是 Stylelint（一个 CSS 代码检查工具）报的错误，因为它默认不认识 Vue 单文件组件（SFC）中特有的 `:global()` 伪类选择器。

这个问题的最佳解决方案不是去禁用 Stylelint 规则，而是采用一种更清晰、更符合 Vue SFC 规范的方式来组织样式：**将全局样式和组件局部样式分离到不同的 `<style>` 块中**。

一个 Vue 文件可以包含多个 `<style>` 块。

- **`<style scoped>`**: 这里的样式是局部的，只作用于当前组件。
- **`<style>`** (没有 `scoped`): 这里的样式是全局的，会影响整个应用程序，就像写在普通的 CSS 文件里一样。

我们将把所有使用了 `:global()` 的规则移动到一个不带 `scoped` 的 `<style>` 块中，并移除 `:global()` 包装器。

同时，为了让全局 `<style>` 块也能访问到您定义的 CSS 变量（如 `--dark-green`），我们需要将这些变量的定义从 `.app-layout-container` 移到 `:root` 选择器中，使其成为真正的全局变量。

## 数据不匹配的问题

问题根源在于：您的数据源 (`db.json`) 中 `alerts` 数组里的 `level` 字段包含了一些前端代码没有准备好处理的值。

### 问题分析

1. **数据源中的值**：
    
    - 对于 **监测点 4**，其预警 `level` 是 `critical`。
    - 对于 **监测点 6**，其预警 `level` 是 `warning`。
2. **前端Vue组件中的处理逻辑** (`WarningSystem.vue`)：  
    您的组件里用于显示级别文本和颜色的 `levelText` 和 `levelColors` 对象只定义了 `low`、`medium` 和 `high` 这三种情况。
    
    ```typescript
    // 在 WarningSystem.vue 中
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
    ```
    
3. **导致的结果**：
    
    - 当 `item.level` 的值是 `critical` 或 `warning` 时，`getLevelText(item.level)` 和 `getLevelColor(item.level)` 会在这两个对象中找不到对应的键，因此返回 `undefined`。
    - 一个没有内容的 `a-tag` 标签就会被渲染出来，看起来就像一个灰色的、没有文字的小方块，这正是您在网页上看到的效果。

### 如何修复

为了让页面正确显示所有预警级别，我们需要在两个地方进行同步修改：Pinia store (`data.ts`) 和 Vue 组件 (`WarningSystem.vue`)。

---

#### 步骤 1: 更新 Pinia Store (`data.ts`)

您的 `AlertLevel` 类型定义中已经包含了 `critical`，但缺少 `warning`。同时，为了更强的类型安全，建议将 `alerts` 的类型从 `Array<any>` 改为 `Alert[]`。

---

#### 步骤 2: 更新 Vue 组件 (`WarningSystem.vue`)

在 `script` 部分，我们需要扩展 `levelColors` 和 `levelText` 对象，让它们能够处理 `critical` 和 `warning` 这两种新的级别。


好的，将这个页面重构为使用一个通用的 `AppLayout.vue` 组件是一个非常好的实践，这能有效提高代码的复用性和可维护性。

下面是具体步骤和代码实现：

1. **创建 `AppLayout.vue` 文件**: 我们首先创建一个布局文件，它将包含所有页面共享的头部（Header）和导航栏（Nav）。页面的主体内容将通过一个 `<slot>` 标签被动态插入。
2. **修改 `WarningSystem.vue` 文件**: 我们将从这个文件中移除头部和导航栏的 HTML 和 CSS，然后用 `<AppLayout>` 组件包裹住剩余的页面专属内容。

---

好的，将页面转换为使用 `AppLayout.vue` 布局组件是一个常见的重构步骤，可以有效减少代码重复。以下是修改后的 `WarningSystem.vue` 代码。

主要改动点如下：

1. **模板 (Template)**:
    
    - 移除了 `WarningSystem.vue` 文件中原有的 `<header>` 和 `<nav>` 部分，因为它们现在由 `AppLayout.vue` 提供。
    - 使用 `<AppLayout>` 组件作为新的根元素，将页面的主体内容（`<main>`）和弹窗（`<a-modal>`）放置在其默认插槽中。
2. **脚本 (Script)**:
    
    - 在 `<script setup>` 中导入了 `AppLayout` 组件。
3. **样式 (Style)**:
    
    - **移除冗余样式**: 在 `<style scoped>` 中，删除了所有与已移除的 `header` 和 `nav` 相关的样式，包括 `.app-layout-container`, `.header`, `.logo-area`, `.nav-bar` 等。
    - **调整冲突样式**: `AppLayout.vue` 的插槽容器 `.content-slot` 已经提供了 `padding` 和 `flex-grow` 等布局属性。为了避免样式冲突和双重内边距，修改了 `.main-content` 的样式，**移除了 `padding`, `flex-grow`, 和 `overflow-y`**。现在，`.main-content` 只负责水平居中其子元素 `.content-wrapper`。

### 修改后的 `WarningSystem.vue`

```vue
<!-- src/views/user/WarningSystem.vue -->
<template>
  <AppLayout>
    <!-- 主体内容现在由 AppLayout 包裹 -->
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
              @click="showCreateModal"
            >
              新建预警
            </a-button>
            <a-button
              class="refresh-btn"
              size="small"
              style="margin-left: 8px"
              @click="fetchAlerts"
            >
              刷新
            </a-button>
          </template>

          <a-list
            class="alert-list"
            :dataSource="enrichedAlerts"
            :loading="dataStore.loadingAlerts"
            :pagination="{ pageSize: 5, showSizeChanger: false, showQuickJumper: false }"
          >
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
                  <a v-if="!item.handled" @click="handleToggle(item)">标记解决</a>
                  <a v-else @click="handleToggle(item)">标记未处理</a>
                  <a class="delete-action" @click="handleDelete(item.id)">删除</a>
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

    <!-- Modal 弹窗逻辑保持不变 -->
    <a-modal
      v-model:open="createModalVisible"
      title="新建预警"
      wrapClassName="warning-modal"
      @ok="handleCreateModalOk"
      @cancel="createModalVisible = false"
    >
      <a-form :model="createFormModal" layout="vertical">
        <a-form-item label="监测点" required>
          <a-select
            v-model:value="createFormModal.pointId"
            placeholder="请选择监测点"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option
              v-for="point in dataStore.monitorPoints"
              :key="point.id"
              :value="point.id"
            >
              {{ point.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="预警级别" required>
          <a-select v-model:value="createFormModal.level" placeholder="请选择级别">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="预警信息" required>
          <a-textarea
            v-model:value="createFormModal.message"
            :rows="4"
            placeholder="请输入详细的预警内容..."
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
// ***** 新增：导入 AppLayout 组件 *****
import AppLayout from '@/layouts/AppLayout.vue'
import { reactive, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'

// ----- 以下脚本内容与之前完全相同，保持不变 -----

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

<!-- 全局样式保持不变 -->
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

/* ----- 以下为页面自身的内容样式，保持不变 ----- */
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
```
### 工作原理与优势

1. **关注点分离 (Separation of Concerns)**:
    
    - `AppLayout.vue` 专门负责整个应用的通用结构、品牌标识和主导航。
    - `WarningSystem.vue` (以及其他视图组件) 现在只需关注其自身的核心功能和内容展示。
2. **代码复用**:
    
    - 当需要创建新页面时，只需引入 `AppLayout` 并将新页面的内容放入其中即可，无需重复编写头部和导航栏的代码。
3. **动态高亮导航**:
    
    - 在 `AppLayout.vue` 中，我们将导航项的 `active` 类的判断逻辑交给了 Vue Router。我们删除了硬编码的 `class="nav-item active"`，并修改 CSS 使用 `.router-link-exact-active` 选择器。当路由切换时，Vue Router 会自动为当前匹配的 `<router-link>` 添加这个类，从而实现导航项的自动高亮。
4. **易于维护**:
    
    - 如果需要修改 logo、导航链接或者页头样式，你只需要在 `AppLayout.vue` 这一个文件中修改，所有使用该布局的页面都会自动更新。