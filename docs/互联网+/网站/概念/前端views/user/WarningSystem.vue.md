# WarningSystem.vue

> 源码：[`src/views/user/WarningSystem.vue`](../../../../../../src/views/user/WarningSystem.vue)  
> 路由：`/warnings`  
> 后端：`alerts` REST + [`persist.py`](../../后端py文件/rules/persist.py.md) 的 `publish_alert`

---

## 一、一句话定义

**预警中心。** 列出当前区域的预警，可新建、改已处理、删除；虫情草稿可「确认发布」。

---

## 二、页面干什么

默认 **不** 显示 `draft === true` 的行（链 3 虫情草稿）。打开「显示草稿」才出现，并多出发布按钮。监测点名字用 `pointId` 对照 `filteredMonitorPoints`，对不上就显示「未知监测点 #id」。

级别色和中文来自 [`alertLevel.ts`](../../../../../../src/utils/alertLevel.ts)；时间用 [`formatTime`](../../../../../../src/utils/formatTime.ts)。

---

## 三、函数在干什么

| 函数 | 干什么 |
|------|--------|
| `enrichedAlerts` | 过滤区域 + 是否显示草稿，并补 `pointName` |
| `fetchAlerts` | `dataStore.fetchAlerts()`（`GET /alerts?_sort=time&_order=desc`） |
| `showCreateModal` / `handleCreateModalOk` | 弹窗选点、级别、文案 → `createAlert` |
| `handlePublish` | `POST /alerts/:id/publish` 再刷新列表 |
| `handleToggle` | `PATCH` 翻转 `handled` |
| `handleDelete` | `DELETE /alerts/:id` |
| `filterOption` | 新建弹窗里监测点下拉的本地搜索 |

挂载时拉监测点和预警。不在本页触发 `evaluate-all`；60 秒调度在服务器。

---

## 四、不负责什么

- 不算墒情是否该报（链 1 在 Flask）
- 不给处置建议（[`DecisionSupport.vue`](./DecisionSupport.vue.md)）
- 不画地图

---

## 五、小结

**本页是 `alerts` 表的人工工作台。** 规则链写入的行和人手动创建的行在同一张列表里处理。
