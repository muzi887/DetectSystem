# Forecast-UI Task 1：按站取 7 日预报纯函数 + 种子

> 对应计划：[`2.0非AI-P0-天气预报UI实施计划.md`](../实施计划/2.0非AI-P0-天气预报UI实施计划.md) Task 1  
> 状态：✅ 已完成（`tsx --test` 2 passed）

## 子任务解释

P0 整件事情只做一件：**让「相关数据 → 气象」能看见未来 7 天。** 链 2（扫预报写 `[极端天气]`）早就有了，本任务**不改规则**，只补数据和一个本地过滤函数。

可以想成：后厨已经会根据菜单判断「明天会不会热到报警」；前台还没把 7 天菜单贴出来。Task 1 是**把菜单写进本子**（种子 + 过滤），贴到墙上是 Task 2。

拆开当时的缺口：

| 人话 | 当时怎样 |
|------|----------|
| 链 2 扫 `weatherForecast` 写 `[极端天气]` | **已经能跑**，不是本任务要做的 |
| 假表里雄县天数 | 只有 **3 行（3 天）**，不够 7 日表 |
| 河间 | **一行都没有**，切到该站会是空的 |
| 气象 Tab 的 7 日表 | **还没有**（Task 2 才画） |

本任务因此先做两件事：

1. **不读 HTTP 的过滤函数** `daysForPoint`：对已经拿到的一堆行，留下这个站 → 按日期排 → 最多 7 条。不访问网络、不调 Mock 接口，测起来简单；页面之后把接口返回的数据丢进去就能用。
2. **种子**：事先写进 `db.json` 的演示数据。雄县、河间都补成 7 天，演示时表格才有东西。

具体约定：

1. `daysForPoint(rows, pointId, limit=7)`：只留该站、按 `date` 升序、最多 7 条
2. 雄县 `pointId: 2`：`2026-08-22`～`28`，**22 日 `tempMax: 41` 保留**（链 2 靠它报极端高温）
3. 河间 `pointId: 1`：同样 7 日，最高温不超过 35（避免两个站一起刷极端预警）
4. 其它站可以没有预报；切到该站时表格显示「暂无」（Task 2）。扁平行字段不变，**不要**改成一个站下面嵌一套 `days`（链 2 读的是一行一天）

不改 Flask、不改 `evaluateForecast`、不接和风。

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
