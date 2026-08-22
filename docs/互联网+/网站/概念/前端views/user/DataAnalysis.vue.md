# DataAnalysis.vue

> 源码：[`src/views/user/DataAnalysis.vue`](../../../../../../src/views/user/DataAnalysis.vue)  
> 路由：`/analysis`  
> 后端：[`app.py`](../../后端py文件/app.py.md) `/api/analysis/image`、`/batch`、反馈；防治文案 [`knowledge.py`](../../后端py文件/knowledge.py.md)

---

## 一、一句话定义

**智能分析（识病）。** 选作物、上传叶片 JPG/PNG，把图交给 Flask 分类；非健康则往当前区域第一个监测点写一条 `[AI识别]` 预警；右侧折叠展示防治条目。

---

## 二、页面干什么

分类按钮（灾害/病虫害/气候/其他）主要影响请求里的 `category` 字段，真正类别集合在权重的 23 类。单张走 `analyzeImage`；多张走 `analyzeBatch`，界面只展示第一张有效结果。

结果病名先过 [`canonicalizeDiseaseLabel`](../../../../../../src/utils/diseaseLabels.ts)，桃/苹果等非京津冀作物会提示改选。置信度 &lt; 70% 且非健康时显示需人工复核。纠错 `handleFeedback` 把图和改正病名写入难例队列（不是改 MySQL 预警）。

---

## 三、函数在干什么

| 函数 | 干什么 |
|------|--------|
| `beforeUpload` | 限制 jpeg/png、2MB；不合格不进列表 |
| `customUpload` / `handleChange` | 不真传 OSS：本地成功后 `FileReader` 出预览 base64，进度条是假动画 |
| `handleConfirm` | `analyzeImage` → 规范化病名 → 填 `analysisResult` → 非健康则 `dataStore.createAlert` |
| `openBatchPicker` / `onBatchFiles` / `handleBatch` | 隐藏 file input 选多张，`analyzeBatch` 后展示第一条 |
| `handleFeedback` | `submitAnalysisFeedback` |
| `getTreatment` / `buildTreatmentPanels` | [`useTreatmentGuide`](../../../../../../src/composables/useTreatmentGuide.ts) 按病名拆化学/农业等折叠面板 |
| `confidencePercent` 等 | 把 0–1 或百分数收成圆环百分比和颜色 |
| `resolveDefaultCollapseKeys` | 默认展开「化学防治」或第一条 |

`pointId` 取 `filteredMonitorPoints[0]`，没有则全库第一个点。

---

## 四、不负责什么

- 不加载 `.pth`（Flask [`inference.py`](../../后端py文件/inference.py.md)）
- 权重不是 23 类时接口 503，本页只提示失败
- 不编辑防治库 JSON

---

## 五、小结

**本页是识病窗口。** 算图在 Flask；本文件负责选图、展示、必要时写一条 AI 预警、拉防治文案。
