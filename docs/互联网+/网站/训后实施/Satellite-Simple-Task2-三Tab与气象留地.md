# Satellite-Simple Task 2：三 Tab，删除 GIS，气象留在地面站

> 对应方案：[卫星遥感-简单版方案.md](../页面/卫星遥感-简单版方案.md) 实施顺序第 2 步  
> 状态：✅ 已完成

## 子任务解释

相关数据只留地 / 空 / 天。独立 GIS 按钮取消；原气象站整页不再占「天」位。气象九类读数、7 日预报、阈值留在地面监测站内，用「查看气象数据」切换，土壤折线用「查看土壤监测」切回。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | Tab 改为三格；`sensorSection` 在土壤/气象间切换 |

## 代码内容

入口只剩三项：

```ts
const tabs = [
  { key: 'sensor', label: '地面监测站 (地)', title: '土壤监测', subtitle: '最近 7 天气温与墒情趋势' },
  { key: 'drone', label: '无人机遥感 (空)', title: '无人机多光谱监测', subtitle: '作物长势 NDVI 指数分析' },
  { key: 'satellite', label: '卫星遥感 (天)', title: '卫星遥感监测', subtitle: '区域墒情热力分布图' }
]
```

地面站内切换：

```ts
const sensorSection = ref<'soil' | 'weather'>('soil')
const showSoilPanel = computed(
  () => currentTab.value === 'sensor' && sensorSection.value === 'soil'
)
const showWeatherPanel = computed(
  () => currentTab.value === 'sensor' && sensorSection.value === 'weather'
)

function toggleGroundSection() {
  if (sensorSection.value === 'soil') {
    sensorSection.value = 'weather'
    return
  }
  sensorSection.value = 'soil'
  void nextTick(() => renderSensorChart())
}
```

模板：`v-show="showSoilPanel"` 显示折线；`v-if="showWeatherPanel"` 显示原气象布局。顶栏按钮文案在「查看气象数据」与「查看土壤监测」之间切换。

## 验证

- 相关数据顶栏只有三个按钮，无 GIS。
- 地面监测站默认土壤折线；点「查看气象数据」出现九类读数与预报。
- 无人机 Tab 行为不变。
