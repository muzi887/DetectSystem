# Satellite-Layout Task 2：左图右栏样式

> 对应方案：[卫星遥感-简单版方案.md](../页面/卫星遥感-简单版方案.md) 布局修订（方案 A）  
> 状态：✅ 已完成

## 子任务解释

模板已是左右两栏，本任务把比例和颜色落到 CSS：左栏接近竖图比例、图按框内最大完整显示；右栏用站点玻璃深绿，类型四键两列，日期拉满，AI 沉底。窄屏改上下堆叠，避免侧栏把图挤没。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 卫星分栏、图缩放、右栏与响应式样式 |

## 代码内容

主卡在卫星 Tab 用 flex 撑满剩余高度：

```css
.chart-wrapper--satellite {
  display: flex;
  min-height: 0;
}
```

左约 58%、右约 42%；图不再把 img 盒子拉满再留黑边，而是按原比例缩进框内：

```css
.satellite-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 16px;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.satellite-stage {
  height: 100%;
  background: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border);
}

.satellite-stage-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}
```

右栏玻璃底 + 类型两列 + 日期拉满 + AI 沉底：

```css
.satellite-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--glass-bg-subtle);
  border: 1px solid var(--glass-border);
}

.satellite-type-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.satellite-date-select.weather-point-select {
  width: 100%;
  max-width: none;
}

.satellite-side .ai-analysis-box {
  margin-top: auto;
  flex-direction: column;
  align-items: flex-start;
}
```

`width <= 992px` 时改为上图下栏：`grid-template-rows: minmax(320px, 52vh) auto`。

## 验证

桌面宽度打开卫星遥感：图应明显大于改版前居中小图，左右浅色大空白应消失；右栏能切干旱/高温/暴雨/大风并换日期。缩窄窗口后图在上、控件在下。
