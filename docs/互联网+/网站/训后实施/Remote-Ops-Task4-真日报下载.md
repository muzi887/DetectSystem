# Remote-Ops Task 4：真日报下载

> 对应计划：[`2.0非AI-P2-遥感展示与自主运营实施计划.md`](../实施计划/2.0非AI-P2-遥感展示与自主运营实施计划.md) Task 4  
> 状态：✅ 已完成（`tsx --test` 1 passed，`vue-tsc --noEmit` 通过）

## 子任务解释

相关数据页「生成简报」原先假装进度到 100% 再 `message.success('已下载 pdf')`，**没有文件**。演示点下去是空的。

本任务改成真文本：

1. 纯函数 `buildDailyReport` 拼 Markdown，必须有 `## 监测点`、`## 预警统计`、`## 极端天气`。
2. `GET /reports/daily` 读整库监测点、非 draft 预警、`extremeEvents`，返回 `{ markdown }`。
3. 点「生成简报」调接口，弹窗预览前 20 行，确定后用 Blob 下载 `监测日报-YYYY-MM-DD.txt`。失败 `message.error`。

不再声称 PDF。Modal 标题改为「生成监测日报」。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/dailyReport.ts`](../../../../src/utils/dailyReport.ts) | 拼日报 Markdown |
| 新增 | [`src/utils/dailyReport.test.ts`](../../../../src/utils/dailyReport.test.ts) | 离线点名、`待处理: 1`、极端 title |
| 修改 | [`src/mock/server.ts`](../../../../src/mock/server.ts) | `GET /reports/daily`（router 之前） |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 再抄一份 `buildDailyReport` |
| 修改 | [`deploy/api_mock/server.js`](../../../../deploy/api_mock/server.js) | 同路由 |
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | `fetchDailyReport` |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 预览 + Blob 下载 `.txt` |

## 代码内容

```ts
export function buildDailyReport(input: DailyReportInput): string {
  // 含 ## 监测点 / ## 预警统计（待处理） / ## 极端天气
}
```

```ts
const blob = new Blob([markdown], { type: 'text/plain;charset=utf-8' })
link.download = `监测日报-${today}.txt`
```

## 验证

```text
pnpm exec tsx --test src/utils/dailyReport.test.ts
→ 1 passed
pnpm exec vue-tsc --noEmit
→ 通过
```
