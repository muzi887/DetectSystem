# Rules Task 3：预警来源列 + 决策页 `[自动预警]` 建议

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 3  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

链 1 写入的自动预警要能在页面上和手工预警区分开，并按文案前缀给出灌溉/降温/排水建议：

1. `Alert` 增加 `source` / `ruleId` / `chain` / `draft` / `fieldId`
2. 列表默认隐藏 `draft === true`（给 Task 6 虫情草稿留口）
3. 预警中心等级旁显示「自动」或「手动」
4. 智慧决策：`[自动预警]` + 「土壤湿度…低于」→ 灌溉；「气温…超过」→ 降温；「偏高/涝」→ 排水；无前缀的旧预警仍走原来的 critical/湿度关键字
5. 前端 API：`evaluateAllAlerts` / `fetchThresholds` / `saveThresholds`

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/stores/data.ts`](../../../../src/stores/data.ts) | 扩展 `Alert`；`filteredAlerts` 过滤草稿 |
| 修改 | [`src/views/user/WarningSystem.vue`](../../../../src/views/user/WarningSystem.vue) | 来源 tag：自动 / 手动 |
| 修改 | [`src/views/user/DecisionSupport.vue`](../../../../src/views/user/DecisionSupport.vue) | `buildRuleSuggestions` 最前按 `[自动预警]` 分支 |
| 新增 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | 评估全量、读写阈值 |

## 代码内容

### Alert 扩展

```ts
source?: 'manual' | 'auto'
ruleId?: string
chain?: 'env' | 'extreme' | 'pest'
draft?: boolean
fieldId?: string | null
```

### 决策建议（前缀优先）

```ts
if (rawMessage.includes('[自动预警]')) {
  // 低于 → 灌溉；超过 → 降温；偏高/涝 → 排水
  if (suggestions.length) return suggestions
}
```

### API

```ts
evaluateAllAlerts()
fetchThresholds(pointId)
saveThresholds(pointId, body)
```

## 验证

```text
pnpm exec vue-tsc --noEmit
→ exit 0
```
