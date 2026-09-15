# Daily-Report Task 1：下载改为 `.md`

> 对应方案：[Daily-Report-md与PDF说明.md](../方案/Daily-Report-md与PDF说明.md) 第二节  
> 状态：✅ 已完成

## 子任务解释

日报接口返回的已经是 Markdown（`# 监测日报`、`## 监测点` 等），弹窗也按 `reportMarkdown` 预览。此前下载却把 MIME 写成 `text/plain`、后缀写成 `.txt`。本任务只改下载这一处：按钮改为「下载 md」，文件名为 `监测日报-YYYY-MM-DD.md`。不改 Flask，不改章节结构。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 按钮文案、Blob 类型、下载后缀 |

## 代码内容

```vue
ok-text="下载 md"
```

```ts
const blob = new Blob([reportMarkdown.value], { type: 'text/markdown;charset=utf-8' })
link.download = `监测日报-${stamp}.md`
```

## 验证

相关数据 → 生成简报 → 「下载 md」得到 Markdown 文件，用编辑器能看到 `# 监测日报` 与 `## 监测点`。
