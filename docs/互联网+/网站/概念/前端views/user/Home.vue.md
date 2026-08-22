# Home.vue

> 源码：[`src/views/user/Home.vue`](../../../../../../src/views/user/Home.vue)  
> 路由：`/home`  
> 数据：[`src/stores/data.ts`](../../../../../../src/stores/data.ts) 的监测点/预警；近期识别走 [`app.py`](../../后端py文件/app.py.md) `GET /api/analysis/recent`

---

## 一、一句话定义

**登录后的总览。** 三个快捷入口、监测点数量、待处理预警、系统状态词、预警列表、最近几次识病卡片。

---

## 二、页面干什么

挂载时拉预警、监测点、最近 6 条识别记录。数字和列表都是 **computed 切片**，不在本页写规则链。

系统状态词按未处理预警的最高级别：无待办→正常；有 `critical`→严重告警；有 `high`→高风险；有 `warning`/`medium`→需关注；其余→轻微波动。

---

## 三、函数在干什么

| 名称 | 干什么 |
|------|--------|
| `unhandledAlertsCount` | `dataStore.unhandledAlerts.length` |
| `systemStatus` | 按未处理预警级别选文案和 CSS class |
| `monitorPointsCount` | 监测点总数（**未**按区域过滤） |
| `sortedAlerts` / `pagedAlerts` | 当前区域预警按时间倒序，每页 3 条 |
| `pagedAnalyses` | 近期识别每页 3 条 |
| `cropLabel` | `wheat` 等英文键 → 中文作物名（[`crops.ts`](../../../../../../src/constants/crops.ts)） |
| `formatConfidence` | 0–1 或百分数都显示成 `%` |
| `formatAnalysisTime` | ISO 时间交给 [`formatTime`](../../../../../../src/utils/formatTime.ts) |
| `onMounted` | `fetchAlerts`、`fetchMonitorPoints`、`fetchAnalysisRecent(6)` |

预警色块用 [`getAlertLevelClass`](../../../../../../src/utils/alertLevel.ts)，不在本页定义级别表。

---

## 四、不负责什么

- 不上传图片识病（[`DataAnalysis.vue`](./DataAnalysis.vue.md)）
- 不创建/处理预警（[`WarningSystem.vue`](./WarningSystem.vue.md)）
- 不跑三条规则链

---

## 五、小结

**本页是看板：store 计数 + 识病 recent 接口。** 点卡片跳到对应业务页。
