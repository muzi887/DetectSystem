# Forecast-UI Task 2：气象 Tab 7 日表 + 标签跳转预警

> 对应计划：[`2.0非AI-P0-天气预报UI实施计划.md`](../实施计划/2.0非AI-P0-天气预报UI实施计划.md) Task 2  
> 状态：✅ 已完成（`vue-tsc --noEmit` 通过）

## 子任务解释

把 Task 1 的 7 日种子画到相关数据「气象」Tab：选中站的预报表放在极端天气标签和实时快照卡片之间；橙色标签点进预警中心。不新建 `weather.ts`、不接和风、不改链 2。

1. `fetchForecast(pointId?)` 用 json-server 的 `?pointId=` 过滤
2. `loadForecast` 再走 `daysForPoint(..., 7)`
3. 无行时显示「暂无该站 7 日预报」（其它监测点没有种子时走这条）
4. 字幕在有 7 日数据时带「含 7 日预报」
5. 切站时与阈值表单一并重新拉取

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

表格列：日期、最高温 ℃、最低温 ℃、降水 mm、风速 m/s。

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
