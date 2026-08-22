# DecisionSupport.vue

> 源码：[`src/views/user/DecisionSupport.vue`](../../../../../../src/views/user/DecisionSupport.vue)  
> 路由：`/decision`  
> 防治条目与识病页共用 [`useTreatmentGuide`](../../../../../../src/composables/useTreatmentGuide.ts)

---

## 一、一句话定义

**智慧决策。** 左侧未处理预警（可按高/中/低筛），右侧按选中那条给出防治折叠面板、虫情因子、联动处置建议；小地图定位该监测点。可导出 txt 计划。

---

## 二、页面干什么

只看 **未处理** 预警（`unhandledAlerts`），并补上站点名、坐标、温度、墒情。选中一条后：

- 文案含 `[AI识别]` → 从消息里解析病名 → 防治库面板  
- 含 `[虫情风险]` → [`factorsFromAlert`](../../../../../../src/utils/pestFactors.ts) 对齐遥感 `pestPredictions`  
- 任何类型 → `buildRuleSuggestions` 按消息前缀/关键字给灌溉、降温等句子（**不是** 模型）

导出把防治行 + 因子 + 联动建议收成纯文本下载。

---

## 三、函数在干什么

| 函数 | 干什么 |
|------|--------|
| `unhandledAlerts` | 未处理预警 enrich 监测点字段，按时间倒序 |
| `matchesLevelFilter` / `filteredAlerts` / `pagedAlerts` | 高含 critical/high/warning；每页 6 条 |
| `buildRuleSuggestions` | 看 `[自动预警]` / `[虫情风险]` / `[极端天气]` 和温湿关键字拼建议 |
| `knowledgePanels` | 仅 AI 识别预警：`parseDiseaseFromAlert` + `buildTreatmentPanels` |
| `pestFactorLines` | 虫情预警：地块 `monitorPointId` 对上 `pestPredictions` |
| `suggestionCollapsePanels` | 防治 + 因子 + 联动合成折叠项 |
| `exportPlan` | `exportLines` 写成 `处置计划-监测点-日期.txt` |
| `selectArea` / `focusSelectedOnMap` | 选中并 `setView` 到该点 |
| `initMap` / `renderMapMarkers` | 与监测页相同的 Leaflet 底图 + 点图层；点点可选中对应预警 |

`syncDefaultSelection`：列表变化时尽量保持当前选中，否则选第一条。

---

## 四、不负责什么

- 不发布草稿（预警中心的 `publishAlert`）
- 不改阈值、不跑链
- 建议文案写死在 `buildRuleSuggestions`，改口径改这个函数即可

---

## 五、小结

**本页把一条预警翻译成可执行的处置说明。** 识病走防治库；环境/极端/虫情走前缀规则；地图只负责对准站点。
