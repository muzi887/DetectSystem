# Rules Task 2：db 扩展、evaluate-all 落库、双 Mock 路由

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 2  
> 状态：✅ 已完成（`tsx --test` 6 passed）

## 子任务解释

链 1 纯函数算出该不该报警之后，要真正写进 Mock 的 `alerts` / `ruleState`：

1. `POST /alerts/evaluate-all` 对每个监测点最新一条 `weatherReadings` 跑 `evaluateReading`，耐受满足才插入 `[自动预警]`
2. 去重：未 `handled` 的 `pointId + ruleId + chain` 不重复插入
3. `GET/PUT /field-sensors/:pointId/thresholds` 读写 `thresholdProfiles`；没有配置行则返回方案 3.2 默认值
4. 瞬时 `POST /disasterRules/evaluate` 仍不写库，但墒情阈值改为 ≤15 / ≤25（与方案一致）
5. 开发 Mock（`src/mock/server.ts`）与宝塔 CJS（`deploy/api_mock`）路由对齐；`syncKeys` 扩到新表
6. 种子：雄县 `pointId: 2` 已有 `soilVwc: 12.8`，并预置一条未发射的 `water_stress` alert 状态，便于第一次 evaluate 即命中

不改 Flask。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) | `dedupeAlerts` / `nextAlertId` / `runChain1OnDb`：读 db、去重、写 `alerts` 与 `ruleState` |
| 新增 | [`src/mock/persistRules.test.ts`](../../../../src/mock/persistRules.test.ts) | 去重不重复插入；`nextAlertId` 为 max+1 |
| 修改 | [`src/mock/server.ts`](../../../../src/mock/server.ts) | `evaluate-all` 与阈值 GET/PUT |
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | 新表 + 雄县低墒耐受种子 |
| 新增 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | 与 TS 同一张规则表的 CJS 调度（不 import `.ts`） |
| 修改 | [`deploy/api_mock/server.js`](../../../../deploy/api_mock/server.js) | 生产 Mock 同样三条路由 |
| 修改 | [`deploy/api_mock/agriMockCore.cjs`](../../../../deploy/api_mock/agriMockCore.cjs) | 瞬时评估阈值对齐方案 3.2 |
| 修改 | [`deploy/api_mock/db.json`](../../../../deploy/api_mock/db.json) | `pnpm run sync:mock-db` 同步新表 |
| 修改 | [`scripts/sync-mock-db.mjs`](../../../../scripts/sync-mock-db.mjs) | `syncKeys` 增加 `thresholdProfiles` / `ruleState` / `weatherForecast` / `extremeEvents` / `pestRiskPredictions` |

## 代码内容

### 去重

```ts
export function dedupeAlerts(existing: AlertRow[], incoming: NewAlert[]) {
  // 未 handled 且 pointId + ruleId + chain 相同 → 跳过
}
```

### 调度

```ts
runChain1OnDb(db, now) → { created: AlertRow[] }
```

对每个 `pointId` 取 `id` 最大的 `weatherReadings`，用站名拼文案，`fieldId` 从 `fields.monitorPointId` 反查（字符串，如 `xiongxian`）。

### 路由

```text
POST /alerts/evaluate-all → { ok: true, created: number }
GET  /field-sensors/:pointId/thresholds
PUT  /field-sensors/:pointId/thresholds
```

瞬时 `POST /disasterRules/evaluate`：`temp>=38` critical、`>=32` warning；`soilMoisture<=15` critical、`<=25` warning；`>=80` 涝渍。

## 验证

```text
pnpm exec tsx --test src/utils/alertRules.test.ts src/mock/persistRules.test.ts
→ 6 passed
```
