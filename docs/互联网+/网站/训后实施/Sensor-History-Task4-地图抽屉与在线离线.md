# Sensor-History Task 4：地图抽屉 + 在线/离线

> 对应计划：[`2.0非AI-P1-气象历史与站点实施计划.md`](../实施计划/2.0非AI-P1-气象历史与站点实施计划.md) Task 4  
> 状态：✅ 已完成（`persistRules` 4 passed，`vue-tsc --noEmit` 通过）

## 子任务解释

传感器 Tab 已经能看 7 日折线、还能多站对比。地图页点监测站原先只有小弹窗（温度、墒情、手动触发预警），**没有**右侧抽屉，也分不清站在不在线。雄县的墒情仿真只改「此刻」`weatherReadings`，历史账本不会跟着动，抽屉里的「最后上报」也会是死的。

本任务把「点钉子 → 抽出一张卡片」补上。可以想成：地图上的钉子点一下，右侧滑出流水账摘要，和传感器 Tab 用同一套 readings。

**不拆 popup、不改 Flask、不改识病 P3**：

1. `createMonitorPointLayer` 增加 `onSelectPoint`。marker 点击仍先开现有 popup（含「手动触发预警」），再回调打开抽屉。
2. 离线点灰色 `#8c8c8c`，且排在干旱橙色**之前**，避免墒情低把灰点染成橙。种子里东北建三江 `online: false`。
3. 地图页 `a-drawer`：站名、在线/离线、最后上报 `lastSeenAt`、当前温湿墒、近 7 日 readings **表格**（计划允许迷你折线，实现用表即可）。
4. Mock 每 60 秒 `tickSensorSimulation` 在改雄县 `soilVwc` 后：该站 `online: true`、`lastSeenAt = now`；若已有当日 `sensorReadings` 则更新墒情，否则 push 一行。开发 TS 与宝塔 CJS 同步。这样抽屉里的「最后上报」才会跟着动。

遥感图上的监测点仍是只读，不接这只抽屉（计划只改灾害监测地图页）。通知铃铛、真日报、地块描边是 P2，本任务不做。

演示路径：传感器 Tab 看见雄县墒情偏低的 7 日线 → 再勾上河间对比 → 地图点雄县，抽屉里对得上同一套数；顶栏切东北，建三江应为灰点。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/composables/useMonitorPointLayer.ts`](../../../../src/composables/useMonitorPointLayer.ts) | `onSelectPoint`；click 时 popup 后再回调 |
| 修改 | [`src/composables/useMonitorMarkers.ts`](../../../../src/composables/useMonitorMarkers.ts) | `online === false` → `#8c8c8c`，不被干旱色盖掉 |
| 修改 | [`src/views/user/MapVisualization.vue`](../../../../src/views/user/MapVisualization.vue) | 抽屉、拉 readings、刷新时顺带拉气象快照 |
| 修改 | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) | tick 更新雄县在线状态与当日 reading |
| 修改 | [`src/mock/persistRules.test.ts`](../../../../src/mock/persistRules.test.ts) | 断言 `lastSeenAt` 刷新、当日墒情跟着 `tickSoilVwc` |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 同步 tick |
| 修改 | [`src/utils/sensorReadings.ts`](../../../../src/utils/sensorReadings.ts) | 抽出 `last7DayRange` 给地图抽屉复用 |

`src/utils/monitorStatus.ts` 已有 `online === false → offline`，点状态文案复用，未改文件。

## 代码内容

```ts
marker.on('click', () => {
  options.onSelectPoint?.(p)
})
```

```ts
export function markerColorForPoint(point: MonitorPointLike, alerts: Alert[] = []): string {
  if (point.online === false) return '#8c8c8c'
  // … critical / drought / status
}
```

```vue
<a-drawer
  v-model:open="drawerOpen"
  :title="selectedPoint?.name || '监测站'"
  :width="360">
  <!-- 在线/离线、lastSeenAt、温湿墒、近 7 日表 -->
</a-drawer>
```

tick：雄县 `12.8` → `13.2`（+0.4），当日 reading 同步；没有当日行则 `nextId` push。

## 验证

```text
pnpm exec tsx --test src/mock/persistRules.test.ts src/utils/sensorReadings.test.ts
→ 6 passed
pnpm exec vue-tsc --noEmit
→ 通过
```

手工：`pnpm mock` → 地图点雄县开抽屉有 7 日表；顶栏切东北，建三江应为灰点。
