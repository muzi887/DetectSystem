# RelatedData.vue

> 源码：[`src/views/user/RelatedData.vue`](../../../../../../src/views/user/RelatedData.vue)  
> 路由：`/related-data`  
> 后端：传感器历史、预报、阈值、极端事件、日报见 [`biz.py`](../../后端py文件/blueprints/biz.py.md)；遥感图层走 `fields` / `ndviLayers` 等 REST

---

## 一、一句话定义

**相关数据页。** 四个 Tab：传感器（地）、无人机 NDVI（空）、气象（天）、GIS 墒情（图）。底部「AI 智能分析」是 **前端拼句子**，不是模型。

---

## 二、页面干什么

| Tab | 看见什么 | 数据从哪来 |
|-----|----------|------------|
| 传感器 | ECharts 近 7 日气温/墒情折线，最多 3 站对比 | `GET /field-sensors/:id/readings` |
| 无人机 | NDVI 栅格 + 地块控件 + 高风险框/航线 | [`useRemoteSensingStore`](../../../../../../src/stores/remoteSensing.ts) |
| 气象 | 9 张实时卡片、7 日预报表、作物生育期阈值 | `weatherReadings`、`/weatherForecast`、`/thresholds` |
| GIS | 墒情栅格；点击地图查最近点 | `GET /moisture/value`（组件里发） |

「生成简报」调 `GET /reports/daily`，预览后下载 txt。详情抽屉按当前 Tab 展示表或跳转地图页。

东北站点可以有监测点，但 `fields` 种子只有京津冀三块田，所以遥感地块下拉没有东北项。见预警表 `field_id` 为空的说明。

---

## 三、函数在干什么

### 气象 Tab

| 函数 | 干什么 |
|------|--------|
| `asFiniteNumber` / `formatMetric` | 缺数字显示「—」，避免 `.toFixed` 把整页打崩 |
| `soilTempOf` | 读 `soilTemp10cm`，兼容旧接口误写的 `soilTemp10Cm` |
| `formatWeatherMetrics` | 把一条 `WeatherReading` 变成 9 张卡片的 label/value |
| `selectedWeatherReading` / `weatherMetrics` | 按当前监测站取读数；没有则空数组 |
| `activeExtremeTitles` | 该站、起始日未过期的极端天气标题，点 tag 去预警页 |
| `loadForecast` | `fetchForecast` + [`daysForPoint`](../../../../../../src/utils/forecastView.ts) 截 7 天 |
| `loadThresholds` / `savePointThresholds` | 读/写该站阈值；缺行用 [`DEFAULT_THRESHOLD_PROFILE`](../../../../../../src/utils/alertRules.ts) |
| `applyPresetBands` / `onCropOrStageChange` | 换作物/生育期时问是否套用 [`thresholdPresets`](../../../../../../src/utils/thresholdPresets.ts) |
| `syncSelectedWeatherPoint` | 区域切换后选中该区域里的站；优先遥感地块绑定的 `monitorPointId` |
| `buildWeatherAiConclusion` | 按雨量、湿度、墒情门槛拼底部一句分析 |

### 传感器 / 遥感 / 简报

| 函数 | 干什么 |
|------|--------|
| `loadSensorReadings` | 对所选站并行拉近 7 日（[`last7DayRange`](../../../../../../src/utils/sensorReadings.ts)） |
| `buildTrendSeries` / `renderSensorChart` | 按日对齐，画双轴折线 |
| `onSensorPointsChange` | 最多 3 站 |
| `switchTab` | 切 Tab；传感器重拉曲线，空/图 Tab 让地图 `invalidate` |
| `onMoistureQuery` / `buildGisAiConclusion` | 记下点击查值，拼墒情那句分析 |
| `buildDroneAiConclusion` | 用地块名和 NDVI 对比期拼长势那句 |
| `aiConclusion` | 按当前 Tab 选上面三句之一，或传感器 Tab 用未处理预警条数 |
| `handleGenerateReport` / `handleDownload` | 拉日报 markdown，存成 `监测日报-日期.txt` |

挂载时并行：遥感 `fetchAll`、预警、监测点、气象读数、极端事件、预报、传感器曲线。

---

## 四、不负责什么

- 不在浏览器里跑链 1/2/3（闹钟在 [`scheduler.py`](../../后端py文件/scheduler.py.md)）
- 不训练模型、不识病
- 底部 AI 文案 **没有** 调 `/api/analysis`

---

## 五、小结

**本页是多源数据展台。** 图表和卡片用 REST + store；「AI 分析」是本文件里的字符串模板。
