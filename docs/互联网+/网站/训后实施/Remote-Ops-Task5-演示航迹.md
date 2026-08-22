# Remote-Ops Task 5：演示航迹

> 对应计划：[`2.0非AI-P2-遥感展示与自主运营实施计划.md`](../实施计划/2.0非AI-P2-遥感展示与自主运营实施计划.md) Task 5  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

无人机 Tab 一直只有 NDVI 底图，没有航线，演示「飞过这块田」时地图是空的。本任务加**一条假航迹**，不接真无人机协议。

1. `db.json` 种子 1 条雄县任务：`path` 为 `[lat, lng][]`，落在该田 `bounds` 内。
2. `GET /droneMissions` 走 json-server 集合，不必手写路由。
3. NDVI 模式且当前地块 `selectedFieldId === fieldId` 时画 `L.polyline`（`#69c0ff`）。切到河间或 GIS 墒情模式不画。无任务则不画。

`syncKeys` 加上 `droneMissions`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | 雄县示范航线 3 个点 |
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | `fetchDroneMissions` |
| 修改 | [`src/stores/remoteSensing.ts`](../../../../src/stores/remoteSensing.ts) | 拉任务；`currentDronePath` 按当前田过滤 |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 无人机 Tab 传入 `flightPath` |
| 修改 | [`src/components/remote-sensing/RemoteSensingMap.vue`](../../../../src/components/remote-sensing/RemoteSensingMap.vue) | NDVI 模式画折线 |
| 修改 | [`scripts/sync-mock-db.mjs`](../../../../scripts/sync-mock-db.mjs) | `syncKeys` 加 `droneMissions` |
| 修改 | [`deploy/api_mock/db.json`](../../../../deploy/api_mock/db.json) | `pnpm run sync:mock-db` |

## 代码内容

```json
{
  "id": 1,
  "fieldId": "xiongxian",
  "name": "雄县示范航线",
  "path": [[38.95, 116.04], [38.97, 116.08], [38.98, 116.12]]
}
```

雄县 `bounds` 为 `[[38.94, 116.02], [38.99, 116.14]]`，三点都在框内。

```ts
flightLine = L.polyline(props.flightPath, {
  color: '#69c0ff',
  weight: 3
}).addTo(map)
```

## 验证

```text
pnpm exec vue-tsc --noEmit
→ 通过
pnpm run sync:mock-db
```

手工：`pnpm mock` → 相关数据 → 无人机遥感 → 选「2号地块（雄县）」应看见浅蓝折线。
