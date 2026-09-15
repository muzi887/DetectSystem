# Satellite-Layout Task 1：卫星页改为左图右栏模板

> 对应方案：[卫星遥感-简单版方案.md](../页面/卫星遥感-简单版方案.md) 布局修订（方案 A）  
> 状态：✅ 已完成

## 子任务解释

竖版出图放在横向拉满的主卡里会左右留白。本任务只改结构：卫星 Tab 拆成 **左主图 + 右信息栏**。类型、日期、有图天数、预警跳转、AI 进右栏；顶栏只留「全屏看图」和原来的简报/详情。地面站、无人机的底栏 AI 仍在主卡下方。

不改清单解析、不改出图 URL。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 卫星 Tab 模板改为 `satellite-layout` |

## 代码内容

顶栏卫星控件只留全屏：

```vue
<button
  v-if="currentTab === 'satellite'"
  type="button"
  class="detail-btn"
  :disabled="!currentSatelliteItem"
  @click="satelliteViewerOpen = true">
  全屏看图
</button>
```

主区左右分栏；右栏承接原顶栏类型/日期和原底栏统计、AI：

```vue
<div
  v-if="currentTab === 'satellite'"
  class="full-content satellite-layout">
  <div class="satellite-stage">
    <img
      v-if="currentSatelliteItem && !satelliteImageError"
      class="satellite-stage-img"
      :src="currentSatelliteItem.url"
      :alt="satelliteViewerTitle"
      @error="satelliteImageError = true" />
  </div>
  <aside class="satellite-side">
    <div class="satellite-type-switch">…干旱/高温/暴雨/大风…</div>
    <a-select v-model:value="selectedSatelliteId" class="weather-point-select satellite-date-select" />
    <div class="satellite-footer">有图天数 · 极端天气预警</div>
    <div class="ai-analysis-box">{{ aiConclusion }}</div>
  </aside>
</div>
```

其它 Tab 仍用卡片底部 AI：

```vue
<div
  v-if="currentTab !== 'satellite'"
  class="ai-analysis-box">
```

`chart-wrapper` 在卫星 Tab 增加 `chart-wrapper--satellite`，给下一任务写分栏高度用。

## 验证

相关数据 → 卫星遥感：类型按钮和日期下拉应出现在图的右侧，不再挤在标题行；底部不再单独一条「有图天数」。
