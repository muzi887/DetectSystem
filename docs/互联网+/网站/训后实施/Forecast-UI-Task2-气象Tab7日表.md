# Forecast-UI Task 2：气象 Tab 7 日表 + 标签跳转预警

> 对应计划：[`2.0非AI-P0-天气预报UI实施计划.md`](../实施计划/2.0非AI-P0-天气预报UI实施计划.md) Task 2  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

Task 1 已经把 7 日菜单写进本子。本任务是**贴到前台**：相关数据「气象」Tab 能看见选中站未来 7 天，并能从极端标签跳到预警中心。

当时气象 Tab 只有「此刻」快照卡片（温度、墒情等）和橙色极端标签，标签还点不进预警页。本任务**不改链 2**，只接线：

1. 接口已有 `fetchForecast`，带上 `?pointId=`，只拉当前选中的站（json-server 支持这个 query）。不新建 `weather.ts`，不接和风。
2. 拉回来的行再走 Task 1 的 `daysForPoint(..., 7)`，保证日期顺序和最多 7 条。
3. 快照卡片**保留**；在极端标签和快照之间加 7 日表。列：日期、最高温 ℃、最低温 ℃、降水 mm、风速 m/s。
4. 橙色标签加上点击 → 跳到 `/warnings`（预警中心去看 `[极端天气]`）。
5. 换监测站时，和阈值表单一并重新拉预报。没有种子的站显示「暂无该站 7 日预报」，不要报错。
6. 有 7 日数据时，字幕带上「含 7 日预报」。

演示路径（和 Task 3 一起看）：气象 Tab 看见 7 日高温 → 橙色标签 → 预警中心里的 `[极端天气]`。

地图右侧 24 h 迷你趋势属于 P1 抽屉，本任务不做。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | `fetchForecast(pointId?)` 带 query |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 7 日表、标签跳 `/warnings`、字幕、切站加载 |

## 代码内容

```ts
export const fetchForecast = (pointId?: number) =>
  http.get('/weatherForecast', { params: pointId ? { pointId } : undefined })
```

```vue
<a-tag ... @click="router.push('/warnings')">{{ title }}</a-tag>
```

字幕：

```ts
`${pointName} · 土壤墒情与局地小气候实时监测${forecastDays.length ? ' · 含 7 日预报' : ''}`
```

## 验证

```text
pnpm exec vue-tsc --noEmit
→ exit 0
```
