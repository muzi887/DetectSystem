# Sensor-History Task 3：多站同图对比

> 对应计划：[`2.0非AI-P1-气象历史与站点实施计划.md`](../实施计划/2.0非AI-P1-气象历史与站点实施计划.md) Task 3  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

Task 2 已经能画**一个站**的气温/墒情。演示时需要同时看见河间（墒情正常）和雄县（墒情贴着告警带），否则「谁更干」只剩一条线，对比不出来。

本任务只加**多站同图**，不改种子、不改规则、不改地图：

1. 传感器 Tab 顶栏加多选监测站，选项用当前区域的 `filteredMonitorPoints`，**最多 3 个**。
2. 默认选中当前区域前 2 个站（京津冀即河间 + 雄县）。
3. 对每个选中 `pointId` 用 `Promise.all` 调 `fetchSensorReadings`，再画到**同一张** ECharts 上。
4. 同一 x 轴（各站日期并集排序），series 命名 `雄县-气温` / `雄县-墒情` 这种；墒情线颜色不同，两条线能分开看。

切到东北等区域时，多选重置为该区域前 2 站。超过 3 个会截断并提示。

验收口径：至少河间 + 雄县同图两条墒情线可区分。种子里河间约 24–25，雄县 11.5–12.8。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 多选、合并拉数、按站着色折线 |

## 代码内容

```vue
<a-select
  v-if="currentTab === 'sensor'"
  v-model:value="selectedSensorPointIds"
  mode="multiple"
  :options="weatherPointOptions"
  :max-tag-count="2"
  placeholder="对比监测站（最多 3 个）"
  @change="onSensorPointsChange" />
```

```ts
const SENSOR_LINE_PALETTE = [
  { temp: '#ff7875', vwc: '#69c0ff' },
  { temp: '#ffc53d', vwc: '#95de64' },
  { temp: '#b37feb', vwc: '#5cdbd3' }
]
```

## 验证

```text
pnpm exec vue-tsc --noEmit
→ 通过
```
