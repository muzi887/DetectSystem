# Rules Task 5：60s 调度总线 + 前端轮询

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 5  
> 状态：✅ 已完成（`tsx --test` 9 passed；`vue-tsc --noEmit` 通过）

## 子任务解释

不要等人点按钮：Mock 每 60 秒抖动雄县墒情（保持 11–14.5%、低于告警线 15），再跑 `runAllChains`（链 1 + 链 2；链 3 预留空实现，Task 6 挂上）。前端登录后的 `AppLayout` 每 30 秒拉一次 `alerts`。测试只测 `tickSoilVwc`，不启动 `listen`、不等 60 秒。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) | `tickSoilVwc` / `tickSensorSimulation` / `runAllChains`；`runChain3OnDb` 空实现占位 |
| 修改 | [`src/mock/persistRules.test.ts`](../../../../src/mock/persistRules.test.ts) | 抖动后仍在干旱带 |
| 修改 | [`src/mock/server.ts`](../../../../src/mock/server.ts) | `listen` 后 `setInterval(60_000)` |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 同 tick / `runAllChains` |
| 修改 | [`deploy/api_mock/server.js`](../../../../deploy/api_mock/server.js) | 生产 Mock 同样 60s 调度 |
| 新增 | [`src/composables/useAlertEngine.ts`](../../../../src/composables/useAlertEngine.ts) | 30s `fetchAlerts`；导出 `triggerEvaluateAll` |
| 修改 | [`src/layouts/AppLayout.vue`](../../../../src/layouts/AppLayout.vue) | 登录后 layout 启停轮询（登录页不用此 layout） |

## 代码内容

```ts
tickSoilVwc(12.8) → 仍 ∈ [11, 14.5]
runAllChains(db, now) = chain1 → chain2 → chain3(占位)
```

Mock 调度：

```ts
setInterval(() => {
  tickSensorSimulation(db)
  runAllChains(db, new Date())
  writeDb(db)
}, 60_000)
```

```ts
useAlertEngine()
  setInterval(fetchAlerts, 30_000)
  triggerEvaluateAll() → POST /alerts/evaluate-all 再刷新列表
```

## 验证

```text
pnpm exec tsx --test src/mock/persistRules.test.ts src/utils/alertRules.test.ts src/utils/extremeWeatherRules.test.ts
→ 9 passed
pnpm exec vue-tsc --noEmit
→ exit 0
```
