# Rules Task 6：链 3 虫情凑分 + 草稿发布

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 6  
> 状态：✅ 已完成（`tsx --test` 12 passed；`vue-tsc --noEmit` 通过）

## 子任务解释

链 3 把多条迹象各 +1 分，再分成低/中/高；**只有 high（≥4）** 才写 `draft: true` 的 `[虫情风险]` 预警，农技员在预警页打开「含草稿」后点「确认发布」才进待办列表。

| 因子 | 条件 |
|------|------|
| `humid_3d` | 连续 3 日预报湿度 > 80% |
| `rain_7d` | 7 日累计降水 > 80 mm |
| `ndvi_low` | 地块 NDVI < 田间均值 × 0.85 |
| `temp_range` | 5 日均温 22–28℃ 且作物为小麦 |
| `ai_recent` | 7 日内同点 `[AI识别]` ≥ 2 |

`runAllChains` 已挂上 `runChain3OnDb`。决策页对 `[虫情风险]` / `[极端天气]` 给出巡田与预案建议。NDVI 地块控件在该田 `riskLevel === high` 时显示「虫情高风险」。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/pestRiskRules.ts`](../../../../src/utils/pestRiskRules.ts) | `evaluatePestRisk` 凑分与草稿文案 |
| 新增 | [`src/utils/pestRiskRules.test.ts`](../../../../src/utils/pestRiskRules.test.ts) | high 出草稿、low 无草稿、单因子 humid_3d |
| 修改 | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) | `runChain3OnDb` / `publishAlert` |
| 修改 | [`src/mock/server.ts`](../../../../src/mock/server.ts) | `POST /pest-risk/evaluate`、`POST /alerts/:id/publish`（在 router 之前） |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 同凑分表 |
| 修改 | [`deploy/api_mock/server.js`](../../../../deploy/api_mock/server.js) | 生产 Mock 同路由 |
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | evaluate / predictions / publish |
| 修改 | [`src/views/user/WarningSystem.vue`](../../../../src/views/user/WarningSystem.vue) | 「含草稿」开关 + 确认发布 |
| 修改 | [`src/views/user/DecisionSupport.vue`](../../../../src/views/user/DecisionSupport.vue) | `[虫情风险]` / `[极端天气]` 建议 |
| 修改 | [`src/stores/remoteSensing.ts`](../../../../src/stores/remoteSensing.ts) | 拉取 `pestRiskPredictions` |
| 修改 | [`src/components/remote-sensing/NdviLayerControls.vue`](../../../../src/components/remote-sensing/NdviLayerControls.vue) | 高风险 tag |

## 代码内容

```ts
evaluatePestRisk(input) → { riskLevel, factors, window, draftAlert? }
publishAlert(db, id) → draft = false
```

```text
[虫情风险] 地块 {fieldName} - 风险等级：high（因子1；因子2）
POST /pest-risk/evaluate
POST /alerts/:id/publish
GET  /pestRiskPredictions
```

## 验证

```text
pnpm exec tsx --test src/utils/pestRiskRules.test.ts …（全套规则测试）
→ 12 passed
pnpm exec vue-tsc --noEmit
→ exit 0
```
