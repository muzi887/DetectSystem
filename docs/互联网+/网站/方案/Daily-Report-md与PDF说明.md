# Daily-Report：txt 改 md，再生成 PDF

> 对应现状：[`Remote-Ops-Task4-真日报下载.md`](./Remote-Ops-Task4-真日报下载.md)（已完成，下载的是 `.txt`）  
> 页面：[`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue)  
> 状态：✅ 已按 Task 1～3 实施（训后说明见 `训后实施/Daily-Report-Task1～3`）

---

## 一、先分清：内容已经是 Markdown

Flask `GET /reports/daily` 返回的字段名叫 `markdown`，正文就是 `# 监测日报` + `## 监测点` 等。  
前端弹窗也用 `reportMarkdown` 预览。**没再转成纯文本**，只是下载时把后缀写成了 `.txt`、MIME 写成了 `text/plain`。

```text
Flask build_daily_report()  →  { markdown: "# 监测日报\n..." }
        ↓
弹窗预览前 20 行
        ↓
Blob + 监测日报-YYYY-MM-DD.txt   ← 只改这里就能变成 .md
        ↓（下一步）
同一段 markdown → HTML → PDF
```

不要重写 `daily_report.py` 去「改成 md」。后端不用动。

---

## 二、Task 1：下载改成 `.md`

只改 `RelatedData.vue` 里下载这一处。

| 项 | 现在 | 改成 |
|------|------|------|
| 按钮 | `ok-text="下载 txt"` | `ok-text="下载 md"` |
| MIME | `text/plain;charset=utf-8` | `text/markdown;charset=utf-8` |
| 文件名 | `监测日报-${stamp}.txt` | `监测日报-${stamp}.md` |

```ts
const handleDownload = () => {
  if (!reportMarkdown.value) {
    message.error('暂无日报内容')
    return
  }
  const blob = new Blob([reportMarkdown.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const today = new Date()
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  link.href = url
  link.download = `监测日报-${stamp}.md`
  link.click()
  URL.revokeObjectURL(url)
  reportModalVisible.value = false
}
```

验收：点「生成简报」→「下载 md」，得到能用 VS Code / Typora 打开的 Markdown，标题仍是「监测日报」。

---

## 三、Task 2：用这份 md 生成 PDF

不要再让 Flask 另写一套 PDF 模板（部署要加 WeasyPrint/wkhtmltopdf，宝塔还要装系统库）。日报正文已经在浏览器里，**前端把 markdown 渲成 HTML，再出 PDF**。

### 3.1 三条路

| 方案 | 做法 | 优点 | 缺点 |
|------|------|------|------|
| **A. 浏览器打印**（推荐） | 把 md 渲成 HTML，`window.print()`，用户「另存为 PDF」 | 中文不配字体；零新依赖；宝塔不用改 | 会弹出系统打印框 |
| B. html2pdf.js | `html2canvas` + jsPDF，一键下 `.pdf` | 按钮一次完成 | 中文靠网页字体截图，长文可能分页糊 |
| C. Flask 出 PDF | 服务端 markdown → PDF | 可归档 | 依赖重，和现网「只反代 /api」不一致 |

答辩要真文件、少踩中文字体，用 **A**。需要「点一下就掉 pdf、不要打印框」再用 B。

### 3.2 推荐落地（方案 A）

1. 弹窗里不要只用 `<pre>` 预览源码。用极小的 markdown 渲染（可手写：按行识别 `#` / `##` / `- `，不必上 `markdown-it`）。
2. 底部两个动作：**下载 md**（Task 1）+ **导出 PDF**（打印当前预览）。
3. 加打印样式：只打日报区，不打顶栏导航。

模板方向：

```vue
<a-modal
  v-model:visible="reportModalVisible"
  title="生成监测日报"
  :footer="null">
  <p v-if="reportLoading">正在生成监测日报...</p>
  <div v-else-if="reportMarkdown" id="daily-report-print" class="report-preview-html">
    <!-- 由 reportHtml 渲染标题/列表，不要再 dump 源码 -->
  </div>
  <div class="report-actions">
    <a-button @click="handleDownload">下载 md</a-button>
    <a-button type="primary" @click="handlePrintPdf">导出 PDF</a-button>
  </div>
</a-modal>
```

```ts
function handlePrintPdf() {
  if (!reportMarkdown.value) {
    message.error('暂无日报内容')
    return
  }
  window.print()
}
```

```css
@media print {
  body * {
    visibility: hidden;
  }
  #daily-report-print,
  #daily-report-print * {
    visibility: visible;
  }
  #daily-report-print {
    position: absolute;
    inset: 0;
    background: #fff;
    color: #000;
  }
}
```

打印对话框里选「另存为 PDF」/「Microsoft Print to PDF」，文件名可手改成 `监测日报-日期.pdf`。

若必须一键下载、不要打印框：`pnpm add html2pdf.js`，对 `#daily-report-print` 调用 `html2pdf().from(el).save('监测日报-日期.pdf')`。仍用同一段 HTML，不要另拼内容。

### 3.3 不要做的事

- 不要改 `build_daily_report` / `buildDailyReport` 的章节结构（`## 监测点` 等是验收口径）。
- 不要在 Flask 再加 `/reports/daily.pdf`，除非以后要服务端存档。
- 不要继续 Toast「已下载 pdf」却没有文件（Task 4 已经改掉过一次）。

---

## 四、改哪些文件

| 操作 | 文件 | Task 1 | Task 2 |
|------|------|--------|--------|
| 修改 | `src/views/user/RelatedData.vue` | 按钮、Blob、后缀 | 预览 HTML、打印 CSS、导出 PDF |
| 可选 | `src/utils/dailyReport.ts` | 否 | 若抽出 `markdownToSimpleHtml()`，单测放这里 |
| 修改 | 使用说明书 §4.3.7 | 下载 md，不是 txt | 写明导出 PDF 走打印另存 |
| 修改 | `docs/互联网+/规划/2.0-功能扩展规划.md` | — | 「❌ 导出 PDF」改为已做 |

后端 `ml-bjj/serving/rules/daily_report.py`、`GET /reports/daily` **保持返回 `{ markdown }`**。

---

## 五、验收

```text
1. 相关数据 → 生成简报 → 预览仍有「监测点 / 预警统计 / 极端天气」
2. 「下载 md」得到 监测日报-YYYY-MM-DD.md，用编辑器能看到 # / ## / -
3. 「导出 PDF」弹出打印框（方案 A）或直接下载 .pdf（方案 B）
4. PDF 里中文正常，不是方框
5. vue-tsc --noEmit 通过
```

---

## 六、和旧文档的关系

| 文档 | 口径 |
|------|------|
| `Remote-Ops-Task4-真日报下载.md` | 当时故意下 `.txt`、不声称 PDF |
| `docs/小挑/前端/相关数据页/生成简报实现说明.md` | 更早的假进度条方案，已过时 |
| **本文** | 内容沿用现有 markdown；先正名 `.md`，再用同一份预览出 PDF |

---

## 七、日报里如何加入图片（天气预报 / NDVI 等）

Flask 的 `build_daily_report` **看不到浏览器里的图**。它只查监测点、预警、极端天气事件，返回纯文字 markdown。天气预报表、NDVI 热力、土壤折线、卫星出图都在 `RelatedData.vue` 里，所以图必须在 **前端拼预览 / 出 PDF 时贴进去**，不要让 Python 去「画」这些图。

现在点「生成地面监测站简报」和「生成卫星遥感简报」，下的是 **同一份** 监测日报。要带图，建议做成「文字日报 + 附图附录」，按当前页已有画面取图，而不是按按钮名字再调一套接口。

### 7.1 各图从哪来

| 想放进日报的 | 页面上实际是什么 | 推荐取法 | 不要 |
|------|------|------|------|
| **7 日天气预报** | 气象区 `forecastDays` **表格**，不是一张图 | 先做成 markdown 表（日期 / 高温 / 低温 / 降水 / 风）；若一定要「图」，再 `html2canvas` 截 `.forecast-table` | 不要虚构一张天气图 |
| **NDVI** | 无人机 Tab，Leaflet 上贴 `remoteRasterLayer.imageUrl`（webp 热力） | 直接用该 `imageUrl`：`![NDVI 2025-05-20](url)` | 不要让 Flask 读 `src/assets` |
| **土壤折线** | 地面站 ECharts | `chartInstance.getDataURL({ type: 'png' })` 得到 data URI | 不要截整页 |
| **卫星专题图** | 左栏 `currentSatelliteItem.url`（`/satellite-maps/...`） | 原样当 `<img src>`；线上要 Nginx 已能打开该 URL | 不要把 900MB 出图打进 md 文件 |
| **GIS 墒情热力** | `soil-moisture-heatmap.webp` | 同 NDVI，用图层 `imageUrl` | 卫星页已不再主展示 GIS，日报可作附录 |

预报优先 **表格进正文**，热力 / 出图才当图片。两者都有数据，日报才完整。

### 7.2 推荐拼法（仍走前端 PDF）

生成流程改成：

```text
GET /reports/daily  →  原 markdown（监测点 / 预警 / 极端天气）
        +
前端附录：
  ## 7 日预报     ← markdown 表（forecastDays）
  ## 土壤墒情     ← ECharts getDataURL
  ## 无人机 NDVI  ← 当前期 imageUrl（对比期可选第二张）
  ## 卫星专题图   ← 当前类型/日期出图 URL
        ↓
同一块 #daily-report-print 里既有文字也有 <img> / <table>
        ↓
下载 md（图用 URL 或只保留文字+表）
导出 PDF（打印这块 HTML，图会一起进去）
```

贴图用 HTML 即可（打印 / html2pdf 都认 `<img>`）：

```html
<h2>无人机 NDVI</h2>
<p>地块：东试验田 · 日期：2025-05-20</p>
<img src="/assets/ndvi-heatmap-xxxxx.webp" alt="NDVI" style="max-width:100%;" />

<h2>卫星专题图</h2>
<p>干旱 · 2025-01-15</p>
<img src="/satellite-maps/干旱/1.15.jpg" alt="干旱专题图" style="max-width:100%;" />
```

土壤折线没有现成文件，用 data URI：

```ts
const soilPng = chartInstance?.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#fff' })
// <img :src="soilPng" alt="土壤墒情折线" />
```3

预报不要硬转图片，追加表即可：

```md
## 7 日预报

| 日期 | 最高温 | 最低温 | 降水 mm | 风 |
|------|--------|--------|---------|----|
| 2026-09-16 | 28 | 16 | 0 | 4 |
```

`daysForPoint` 已经能提供这些列。

### 7.3 `.md` 和 PDF 对图的处理不同

| 格式 | 建议 |
|------|------|
| **PDF / 打印** | 预览 DOM 里放 `<img>` 和 `<table>`，图会印进去。卫星图走站点 URL，本机开发走 Vite `/satellite-maps/`。 |
| **下载的 .md** | 不要把 PNG data URI 写进文件（会非常大）。写相对/站点 URL，或 md 只保留文字+预报表，图只出现在 PDF。答辩要「一个能打开的 md」时，第二种更干净。 |

### 7.4 注意

1. 生成前若人在「地面监测站」，ECharts 才存在；在卫星 Tab 时折线容器可能未挂载。附录若需要土壤图，先 `nextTick` 渲染图表再 `getDataURL`，或规定「附录只收当前 Tab 能拿到的图」。
2. Leaflet 地图截屏（含点位）要用 `html2canvas` 截 `.leaflet-container`，比直接贴热力 webp 更像页面，但字体和瓦片可能花。首版用 **现成 imageUrl** 就够。
3. 不要改 Flask 去 `open(jpg)` 塞进响应：出图在 Nginx 静态目录，识病进程读不到也 inflates JSON。
4. 卫星 JPG 单张 3～5MB，PDF 里限制 `max-width` 并考虑压成预览宽（例如 800px）再进打印页。

### 7.5 建议实施顺序

1. Task 1：下载改 `.md`（仍无图）。
2. Task 2：预览 HTML + 导出 PDF（仍无图）。
3. **Task 3（附图）**：预报表 + NDVI `imageUrl` + 卫星 `currentSatelliteItem.url` 进 `#daily-report-print`。
4. 可选：土壤 `getDataURL`、NDVI 对比期第二张、地图截屏。
