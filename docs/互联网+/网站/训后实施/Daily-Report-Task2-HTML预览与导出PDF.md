# Daily-Report Task 2：HTML 预览与导出 PDF

> 对应方案：[Daily-Report-md与PDF说明.md](../方案/Daily-Report-md与PDF说明.md) 第三节（方案 A）  
> 状态：✅ 已完成

## 子任务解释

弹窗不再用 `<pre>` 只显示前 20 行源码。把同一份 markdown 渲成标题/列表 HTML，预览完整日报。底部两个按钮：「下载 md」沿用 Task 1；「导出 PDF」调用 `window.print()`，用户在打印框里另存为 PDF。不加 html2pdf、不改 Flask。

`markdownToSimpleHtml` 只识别 `#` / `##` / `- `，并对正文做 HTML 转义，避免日报字段里的 `<` 注入。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/utils/dailyReport.ts`](../../../../src/utils/dailyReport.ts) | `markdownToSimpleHtml` |
| 修改 | [`src/utils/dailyReport.test.ts`](../../../../src/utils/dailyReport.test.ts) | 标题、列表、转义 |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 预览 HTML、下载/打印按钮、打印样式 |

## 代码内容

```ts
export function markdownToSimpleHtml(markdown: string): string {
  // # → h1，## → h2，- → li，其余 → p；escapeHtml
}
```

```vue
<div id="daily-report-print" class="report-preview-html" v-html="reportBodyHtml" />
<div class="report-actions">
  <a-button @click="handleDownload">下载 md</a-button>
  <a-button type="primary" @click="handlePrintPdf">导出 PDF</a-button>
</div>
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

打印时只显示 `#daily-report-print`，隐藏顶栏与「下载 md / 导出 PDF」。

## 验证

```text
pnpm exec tsx --test src/utils/dailyReport.test.ts
→ 3 passed
```

手工：生成简报后预览可见「监测点 / 预警统计 / 极端天气」标题；「导出 PDF」弹出系统打印框。
