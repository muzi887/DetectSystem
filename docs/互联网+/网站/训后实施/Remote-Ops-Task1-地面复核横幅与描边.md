# Remote-Ops Task 1：地面复核横幅 + 地块描边

> 对应计划：[`2.0非AI-P2-遥感展示与自主运营实施计划.md`](../实施计划/2.0非AI-P2-遥感展示与自主运营实施计划.md) Task 1  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

链 3 已经能给地块打 `riskLevel`（高风险还出草稿预警），控件上也有红标「虫情高风险」。演示时评委看 NDVI 图，**红标太小**，看不出该在哪块地踏查。

本任务只做展示，**不改凑分公式、不改 Flask**：

1. 无人机 Tab、当前田 `riskLevel === high` 时，地图上方加警告横幅「建议地面复核」。
2. NDVI 模式用该田 `fields.bounds` 画红色矩形描边；GIS 墒情模式不画虫情框。
3. 已有红标保留，横幅是第二处提示。

没有高风险预测时横幅和描边都不出现（库里 `pestRiskPredictions` 要等链 3 跑过才有 `high`）。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/stores/remoteSensing.ts`](../../../../src/stores/remoteSensing.ts) | `pestPredictions` 类型补 `factors?: string[]` |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 横幅；把当前高风险田 `bounds` 传给地图 |
| 修改 | [`src/components/remote-sensing/RemoteSensingMap.vue`](../../../../src/components/remote-sensing/RemoteSensingMap.vue) | `highRiskBounds` → `L.rectangle`，叠在栅格之后 |

## 代码内容

```vue
<a-alert
  v-if="currentTab === 'drone' && remoteStore.selectedFieldHighRisk"
  type="warning"
  show-icon
  message="建议地面复核"
  :description="`${selectedFieldName} 虫情风险为高，请结合 NDVI 与预警草稿安排踏查。`" />
```

```ts
highRiskBounds?: RasterBounds | null

highRiskRect = L.rectangle(props.highRiskBounds, {
  color: '#cf1322',
  weight: 3,
  fill: false
}).addTo(map)
```

`imageUrl` / `bounds` 变化时重建描边。GIS 模式 `droneHighRiskBounds` 为 `null`。

## 验证

```text
pnpm exec vue-tsc --noEmit
→ 通过
```
