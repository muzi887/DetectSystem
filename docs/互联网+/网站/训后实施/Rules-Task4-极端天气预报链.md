# Rules Task 4：链 2 预报扫描 + 气象 Tab 标识

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 4  
> 状态：✅ 已完成（`tsx --test` 4 passed；`vue-tsc --noEmit` 通过）

## 子任务解释

链 2 不看此刻传感器，只扫 7 日预报，命中即记 `extremeEvents` 并写 `[极端天气]` 预警（无耐受）：

| ruleId | 条件 | events.level |
|--------|------|----------------|
| `extreme_heat_40` | 任一日 `tempMax >= 40` | `critical` |
| `extreme_heat_3d` | 连续 3 日 `tempMax >= 38` | `warning` |
| `extreme_frost` | 任一日 `tempMin <= -5` | `high` |
| `extreme_wind` | 任一日 `windMax >= 17.2` | `warning` |
| `extreme_rain` | 任一日 `precipMm >= 50` | `high` |

事件去重：`pointId + type + startAt`。预警去重仍用 `pointId + ruleId + chain`（`chain: 'extreme'`）。

雄县种子含 `2026-08-22` `tempMax: 41`，第一次 evaluate 即命中极端高温。相关数据页气象 Tab 在卡片上方显示未过期事件的 `title` tag。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/types/rules.ts`](../../../../src/types/rules.ts) | `ExtremeEvent`；`NewAlert.level` 允许 `critical` |
| 新增 | [`src/utils/extremeWeatherRules.ts`](../../../../src/utils/extremeWeatherRules.ts) | `evaluateForecast`：五类规则 + `[极端天气]` 文案 |
| 新增 | [`src/utils/extremeWeatherRules.test.ts`](../../../../src/utils/extremeWeatherRules.test.ts) | 单日 40℃ 出事件；同 `startAt` 可复现 |
| 修改 | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) | `upsertExtremeEvents` / `runChain2OnDb` |
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | 雄县 7 日预报种子（含 41℃） |
| 修改 | [`src/mock/server.ts`](../../../../src/mock/server.ts) | `POST /weather/extreme-events/evaluate` |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 同规则表 |
| 修改 | [`deploy/api_mock/server.js`](../../../../deploy/api_mock/server.js) | 生产 Mock 同路由 |
| 修改 | [`deploy/api_mock/db.json`](../../../../deploy/api_mock/db.json) | sync 预报种子 |
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | `evaluateExtremeEvents` / `fetchForecast` / `fetchExtremeEvents` |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 气象 Tab 显示「极端高温」等 tag |

## 代码内容

```ts
evaluateForecast(pointId, pointName, days) → { events, alertsToCreate }
```

文案格式：

```text
[极端天气] {pointName} - {title}：{description}
```

```text
POST /weather/extreme-events/evaluate → { ok: true, created }
GET  /extremeEvents
GET  /weatherForecast
```

## 验证

```text
pnpm exec tsx --test src/utils/extremeWeatherRules.test.ts src/mock/persistRules.test.ts
→ 4 passed
pnpm exec vue-tsc --noEmit
→ exit 0
```
