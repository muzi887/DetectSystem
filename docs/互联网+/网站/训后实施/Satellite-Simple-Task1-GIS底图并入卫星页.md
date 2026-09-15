# Satellite-Simple Task 1：卫星遥感视图复用 GIS 底图

> 对应方案：[卫星遥感-简单版方案.md](../页面/卫星遥感-简单版方案.md) 实施顺序第 1 步  
> 状态：✅ 已完成

## 子任务解释

方案要求卫星遥感只看区域图，默认底图就是原来 GIS Tab 的墒情热力 + 监测点 + 点击查墒。本任务把 `RemoteSensingMap` 的 `moisture` 模式挂到新的 `satellite` Tab 上，不新做一套地图。

1. `currentTab === 'satellite'` 时走墒情栅格（`moistureLayers` / `MOISTURE_DEMO_LAYER`）。
2. 打开监测点与点击查墒，行为与原 GIS 一致。
3. 离开卫星 Tab 时清空「最近查墒」。
4. 图角图例、来源、影像日期仍用原 GIS 文案。

气象站九宫格不出现在本 Tab（见 Task 2）。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | `satellite` 复用 GIS 地图模式 |

## 代码内容

地图与原 GIS 同一套 props：

```vue
<RemoteSensingMap
  ref="remoteMapRef"
  :key="currentTab"
  :mode="currentTab === 'drone' ? 'ndvi' : 'moisture'"
  :show-monitor-points="currentTab === 'satellite'"
  :enable-moisture-query="currentTab === 'satellite'"
  ...
/>
```

栅格选择：

```ts
if (currentTab.value === 'satellite') {
  return remoteStore.currentMoistureRaster ?? MOISTURE_DEMO_LAYER
}
```

离开卫星页清空查墒：

```ts
if (currentTab.value === 'satellite' && key !== 'satellite') {
  lastMoistureQuery.value = null
}
```

## 验证

相关数据 → 卫星遥感 (天)：应看到原 GIS 墒情热力图，点击地图仍弹出最近站墒情。
