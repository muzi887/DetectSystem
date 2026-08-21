# Rules Task 7：阈值配置 UI + 干旱指数上色

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 7  
> 状态：✅ 已完成（`tsx --test` 13 passed；`vue-tsc --noEmit` 通过）

## 子任务解释

干旱指数只给地图监测点上色，**不写** `alerts`：

```text
droughtIndex = clamp(0, 100, (25 - soilVwc) * 2 + dryDays * 5)
```

`dryDays` 为该点预报从首日起连续 `precipMm < 1` 的天数（点上可带 `dryDays`，默认 0）。指数 ≥40 偏橙、≥70 偏红；若该点有未处理 `critical` 预警，仍用 critical 色，不被干旱色盖掉。

相关数据页气象 Tab 下方可编辑该站墒情/气温 hint·alert，`PUT /field-sensors/:pointId/thresholds` 无行则创建。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/droughtIndex.ts`](../../../../src/utils/droughtIndex.ts) | `droughtIndex` / `countConsecutiveDryDays` |
| 新增 | [`src/utils/droughtIndex.test.ts`](../../../../src/utils/droughtIndex.test.ts) | `15,0 → 20`；`0,20 → 100` |
| 修改 | [`src/composables/useMonitorMarkers.ts`](../../../../src/composables/useMonitorMarkers.ts) | `markerColorForPoint`：干旱上色但不覆盖 critical |
| 修改 | [`src/composables/useMonitorPointLayer.ts`](../../../../src/composables/useMonitorPointLayer.ts) | 创建 marker 时传入 alerts |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 气象 Tab 阈值表单 GET/PUT |

## 代码内容

```ts
droughtIndex(15, 0) === 20
droughtIndex(0, 20) === 100

markerColorForPoint(point, alerts)
  critical 未处理预警 → 监测点 critical 色
  droughtIndex >= 70 → #cf1322
  droughtIndex >= 40 → #d46b08
  否则 → 原 status 色
```

阈值表单字段：`waterStressHint` / `waterStressAlert` / `heatHint` / `heatAlert`。

## 验证

```text
pnpm exec tsx --test src/utils/droughtIndex.test.ts …（全套 13）
→ 13 passed
pnpm exec vue-tsc --noEmit
→ exit 0
```
