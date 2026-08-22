# MapVisualization.vue

> 源码：[`src/views/user/MapVisualization.vue`](../../../../../../src/views/user/MapVisualization.vue)  
> 路由：`/map`  
> 地图底图：[`useLeafletBase`](../../../../../../src/composables/useLeafletBase.ts)；点位：[`useMonitorPointLayer`](../../../../../../src/composables/useMonitorPointLayer.ts)

---

## 一、一句话定义

**灾害实时监测。** 高德卫星底图上画当前区域的监测点聚合，点开抽屉看实时气象和近 7 日传感器表；弹窗里可手动触发或关闭该点预警。

---

## 二、页面干什么

顶栏 `RegionSelect` 改 `dataStore.selectedRegion` 后，本页 `watch` 重画点、缩放到该区域中心。点色还带干旱指数（在 `useMonitorPointLayer` 里算），不是本文件写的。

抽屉数字优先用 `weatherReadings` 里该站最新一条；土温同样兼容 `soilTemp10Cm`。历史表走 `GET /field-sensors/:id/readings`。

---

## 三、函数在干什么

| 函数 | 干什么 |
|------|--------|
| `initMap` | `createLeafletBaseMap`（卫星）+ `createMonitorPointLayer`；回调里 `createAlert` / `updateAlert` |
| `renderMarkers` | 把 `filteredMonitorPoints` + `filteredAlerts` 交给图层，再 `zoomToAll` |
| `openPointDrawer` | 打开抽屉，`last7DayRange` + `fetchSensorReadings` |
| `soilTempOf` / `drawerSoilTemp` 等 | 抽屉展示用的计算属性 |
| `refreshData` | 再拉监测点、预警、气象读数 |
| `zoomToAll` | 有点则 fitBounds，没有则回到区域默认中心/缩放 |
| `formatLastSeen` | `lastSeenAt` 去掉时区尾巴便于阅读 |

卸载时 `removeLeafletMap`，避免切走页面后地图还占着。

---

## 四、不负责什么

- 不画 NDVI/墒情栅格（那是相关数据页的 `RemoteSensingMap`）
- 不跑识病
- 「刷新」只是重新 GET，不是调度器

---

## 五、小结

**本页 = Leaflet 监测点图层 + 抽屉里的实时/历史读数。** 预警增改走 `dataStore`，和预警中心同一张 `alerts` 表。
