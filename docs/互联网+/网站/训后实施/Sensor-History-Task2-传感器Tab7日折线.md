# Sensor-History Task 2：传感器 Tab 7 日折线

> 对应计划：[`2.0非AI-P1-气象历史与站点实施计划.md`](../实施计划/2.0非AI-P1-气象历史与站点实施计划.md) Task 2  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

Task 1 已经把流水账写进假表。本任务是**换图**：相关数据默认的「传感器」Tab 不再数「7 天里报警了几次」，改成当前站近 7 日 **气温 ℃** 和 **墒情 %** 两条折线。

当时那张图跟墒情无关，也看不出雄县是否干。本任务只接线，不改规则链、不动气象 Tab 的阈值表单。

1. 删掉按 `filteredAlerts` 按天计数的 `buildTrendSeries`。
2. 进入传感器 Tab（它是默认 Tab；以及 `onMounted` / `switchTab('sensor')`）时，用今天往前 6 天的 `YYYY-MM-DD` 调 `fetchSensorReadings`。
3. 失败则空图 + `message.warning`，不要把页面打崩。
4. 图仍用现有 ECharts：透明底、白轴文字；tooltip 同时显示两个指标；**去掉** `minInterval: 1`（气温需要小数，锁成整数会难看）。
5. 默认站与气象 Tab 的 `selectedWeatherPointId` 初值相同（河间 `1`），传感器用自己的 `selectedSensorPointId`。勾选两个站同图是 Task 3。

演示路径（和 Task 3、4 一起看）：传感器 Tab 看见雄县墒情偏低的 7 日线 → 再勾上河间对比 → 地图点雄县，抽屉里对得上同一套数。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 拉 readings、双折线、切站/切区域重绘 |

## 代码内容

```ts
function buildTrendSeries(readings: Array<{ recordedAt: string; airTemp: number; soilVwc: number }>) {
  const sorted = [...readings].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
  return {
    labels: sorted.map((row) => mdLabel(row.recordedAt)),
    temps: sorted.map((row) => row.airTemp),
    vwcs: sorted.map((row) => row.soilVwc)
  }
}

async function loadSensorReadings(pointId: number) {
  const { from, to } = last7DayRange()
  try {
    const res = await fetchSensorReadings(pointId, from, to)
    sensorHistory.value = res.data || []
  } catch {
    sensorHistory.value = []
    message.warning('传感器历史加载失败，请检查 Mock 服务')
  }
  await nextTick()
  renderSensorChart()
}
```

折线 series：`气温 ℃`（左轴）、`墒情 %`（右轴）。`from`/`to` 为本地日历「今天」及往前 6 天。

## 验证

```text
pnpm exec vue-tsc --noEmit
→ 通过
```
