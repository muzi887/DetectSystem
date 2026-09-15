# Daily-Report Task 3：预报、NDVI 与卫星附图

> 对应方案：[Daily-Report-md与PDF说明.md](../方案/Daily-Report-md与PDF说明.md) 第七节 Task 3  
> 状态：✅ 已完成

## 子任务解释

Flask 日报仍只有监测点 / 预警 / 极端天气文字。附图在前端拼进同一块 `#daily-report-print`：

- **7 日预报**：用已有 `forecastDays` 做表格（不是假天气图）
- **无人机 NDVI**：当前期 `imageUrl`
- **卫星专题图**：`currentSatelliteItem.url`

下载的 `.md` 只追加预报表，不写图片 data URI。PDF / 打印走预览里的 `<table>` 和 `<img>`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/utils/dailyReport.ts`](../../../../src/utils/dailyReport.ts) | `buildForecastMarkdownTable` |
| 修改 | [`src/utils/dailyReport.test.ts`](../../../../src/utils/dailyReport.test.ts) | 有行 / 空行 |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 附录 DOM、md 下载拼接预报表 |

## 代码内容

```ts
export function buildForecastMarkdownTable(rows: ForecastTableRow[]): string {
  if (!rows.length) return ''
  return [
    '## 7 日预报',
    '',
    '| 日期 | 最高温 | 最低温 | 降水 mm | 风 |',
    '|------|--------|--------|---------|----|',
    ...rows.map((row) => `| ${row.date} | ${row.tempMax} | ${row.tempMin} | ${row.precipMm} | ${row.windMax} |`),
    ''
  ].join('\n')
}
```

```vue
<section v-if="forecastDays.length" class="report-appendix">…表格…</section>
<section v-if="reportNdviUrl" class="report-appendix">
  <h2>无人机 NDVI</h2>
  <img class="report-appendix-img" :src="reportNdviUrl" alt="NDVI" />
</section>
<section v-if="currentSatelliteItem" class="report-appendix">
  <h2>卫星专题图</h2>
  <img class="report-appendix-img" :src="currentSatelliteItem.url" alt="卫星专题图" />
</section>
```

```ts
const markdown = [
  reportMarkdown.value.trimEnd(),
  buildForecastMarkdownTable(forecastDays.value)
]
  .filter((part) => part)
  .join('\n\n')
```

图片 `max-width: 800px`，避免卫星 JPG 撑破打印页。

## 验证

```text
pnpm exec tsx --test src/utils/dailyReport.test.ts
→ 5 passed
```

手工：生成简报预览底部有 7 日预报表、NDVI、当前类型卫星图；下载 md 含 `## 7 日预报` 且不含 `data:image`；导出 PDF 时附图一起打印。
