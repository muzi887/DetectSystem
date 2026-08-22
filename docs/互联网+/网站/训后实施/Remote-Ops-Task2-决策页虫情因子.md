# Remote-Ops Task 2：决策页列出虫情因子

> 对应计划：[`2.0非AI-P2-遥感展示与自主运营实施计划.md`](../实施计划/2.0非AI-P2-遥感展示与自主运营实施计划.md) Task 2  
> 状态：✅ 已完成（`tsx --test` 2 passed，`vue-tsc --noEmit` 通过）

## 子任务解释

链 3 写预警时，文案里已经带了因子：`[虫情风险] …（连续 3 日湿度 > 80%；NDVI …）`，预测表也有 `factors` 数组。决策页原先只给一句「按风险因子安排巡田」，**没有把因子列出来**，评委对不上 NDVI 红框。

本任务只做展示：

1. 纯函数 `factorsFromAlert`：优先用预测行的 `factors`；没有则从中文括号里按 `；` 切开。
2. 选中预警含 `[虫情风险]` 时，在「联动处置建议」**之上**加「风险因子」面板。有几条列几条，**不假造**。
3. `buildRuleSuggestions` 里那条巡田建议保留。

决策页会拉遥感 store（地块 + 预测），用 `monitorPointId` 对上 `fieldId`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/pestFactors.ts`](../../../../src/utils/pestFactors.ts) | 从预测或文案抽出因子 |
| 新增 | [`src/utils/pestFactors.test.ts`](../../../../src/utils/pestFactors.test.ts) | 有预测用数组；否则解析括号 |
| 修改 | [`src/views/user/DecisionSupport.vue`](../../../../src/views/user/DecisionSupport.vue) | 「风险因子」面板；导出方案带上因子 |

## 代码内容

```ts
export function factorsFromAlert(
  message: string,
  prediction?: { factors?: string[] }
): string[] {
  const fromPred = (prediction?.factors || []).map((item) => String(item).trim()).filter(Boolean)
  if (fromPred.length) return fromPred
  const match = String(message).match(/（([^）]+)）/)
  if (!match) return []
  return match[1].split('；').map((item) => item.trim()).filter(Boolean)
}
```

面板插在知识库防治与「联动处置建议」之间，`key: 'pest-factors'`。

## 验证

```text
pnpm exec tsx --test src/utils/pestFactors.test.ts
→ 2 passed
pnpm exec vue-tsc --noEmit
→ 通过
```
