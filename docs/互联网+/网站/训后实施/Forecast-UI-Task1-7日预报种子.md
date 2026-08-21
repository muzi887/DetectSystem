# Forecast-UI Task 1：按站取 7 日预报纯函数 + 种子

> 对应计划：[`2.0非AI-P0-天气预报UI实施计划.md`](../实施计划/2.0非AI-P0-天气预报UI实施计划.md) Task 1  
> 状态：✅ 已完成（`tsx --test` 2 passed）

## 子任务解释

链 2 已经能扫 `weatherForecast` 写 `[极端天气]`，但表里雄县只有 3 天、河间没有行，气象 Tab 也还没表格。本任务先做**不读 HTTP** 的过滤函数，并把种子补到每站 7 日：

1. `daysForPoint(rows, pointId, limit=7)`：只留该站、按 `date` 升序、最多 7 条
2. 雄县 `pointId: 2`：`2026-08-22`～`28`，**22 日 `tempMax: 41` 保留**（链 2 仍能命中极端高温）
3. 河间 `pointId: 1`：同样 7 日，最高温不超过 35
4. 其它站可以没有预报；扁平行字段不变，不改成嵌套 `days`

不改 Flask、不改 `evaluateForecast`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/forecastView.ts`](../../../../src/utils/forecastView.ts) | `daysForPoint`：按站过滤、按日期排序、截断 |
| 新增 | [`src/utils/forecastView.test.ts`](../../../../src/utils/forecastView.test.ts) | 雄县 3 行按日期排序；`limit=1` 只留 1 条 |
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | 雄县 7 日 + 河间 7 日种子 |
| 修改 | [`deploy/api_mock/db.json`](../../../../deploy/api_mock/db.json) | `pnpm run sync:mock-db` 同步 `weatherForecast` |

## 代码内容

```ts
export function daysForPoint(
  rows: ForecastRow[],
  pointId: number,
  limit = 7
): ForecastRow[] {
  return [...rows]
    .filter((row) => Number(row.pointId) === Number(pointId))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit)
}
```

扁平行字段：`date`、`tempMax`、`tempMin`、`precipMm`、`windMax`，可选 `humidity`。

## 验证

```text
pnpm exec tsx --test src/utils/forecastView.test.ts
→ 2 passed
pnpm run sync:mock-db
```
