# Sensor-History Task 1：readings 过滤纯函数 + API + 种子

> 对应计划：[`2.0非AI-P1-气象历史与站点实施计划.md`](../实施计划/2.0非AI-P1-气象历史与站点实施计划.md) Task 1  
> 状态：✅ 已完成（`tsx --test` 2 passed）

## 子任务解释

P1 整件事情补的是 **「过去几天田里热不热、干不干」**，以及地图上点开一个站能看详情。和 P0 不是同一张表：P0 是 **未来 7 天预报**（明天会不会热）；本阶段是 **已经发生的传感记录**。阈值表单、决策页前缀建议已经有了，P1 **不再做**。

可以想成：田里每天记一笔流水账。Task 1 是**先有账本和取账口**；画成折线是 Task 2，两站对账是 Task 3，地图抽出卡片是 Task 4。

拆开当时的缺口：

| 人话 | 当时怎样 |
|------|----------|
| 「此刻」快照 `weatherReadings` | 一站一行，**没有**按天存的历史 |
| 传感器 Tab | 画的是 **7 天里报警次数**，不是气温/墒情 |
| 链 1 自动预警 | **已经能跑**，本任务不改规则 |
| 地图抽屉 / 灰点 | **还没有**（Task 4） |

本任务**不改页面、不改 Flask**，只把账本写进 Mock：

1. **不读 HTTP 的过滤函数** `filterReadings`：对已经拿到的一堆行，留下这个站 → 按 `recordedAt` 升序 → `from`/`to`（`YYYY-MM-DD`）闭区间。不访问网络；页面和路由之后把接口/库里的数据丢进去就能用。和 P0 的 `daysForPoint` 同类。
2. **种子**：京津冀 3 站（河间、雄县、栾城）各 7 日，一天一行即可，不必做成每小时一条（否则 `db.json` 会胀）。日期 `2026-08-15`～`21`。雄县墒情故意停在约 11.5～14.2——链 1 靠「持续太干」才写 `[自动预警]`，种子若变成 30%，演示会断。
3. **路由**：`GET /field-sensors/:pointId/readings?from=&to=` 挂在 json-server 的 `router` **之前**（否则会被当成资源名）。开发 Mock 和宝塔 CJS **都要加**，否则线上 404。
4. 监测点补 `online`（在不在线）和 `lastSeenAt`（最后上报）。河间、雄县、栾城在线；东北建三江离线，给 Task 4 灰点用。

扁平行：**一行就是某站某一天**。不要改成一站下面嵌一套 `days`。不接旧接口 `/soilMoisture/trend`（本阶段用新 readings）。不给「保存阈值」做 403（相关数据页本来就要农技员才能进）。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/sensorReadings.ts`](../../../../src/utils/sensorReadings.ts) | `filterReadings`：按站、按日闭区间、按时间排序 |
| 新增 | [`src/utils/sensorReadings.test.ts`](../../../../src/utils/sensorReadings.test.ts) | 雄县在 `08-20`～`21` 只留 1 条；无区间时按时间升序 |
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | `sensorReadings` 21 行；京津冀 3 站在线；建三江离线 |
| 修改 | [`src/mock/server.ts`](../../../../src/mock/server.ts) | `GET /field-sensors/:pointId/readings` |
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | `fetchSensorReadings(pointId, from?, to?)` |
| 修改 | [`scripts/sync-mock-db.mjs`](../../../../scripts/sync-mock-db.mjs) | `syncKeys` 增加 `sensorReadings`、`monitorPoints` |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 再抄一份 `filterReadings` 并导出 |
| 修改 | [`deploy/api_mock/server.js`](../../../../deploy/api_mock/server.js) | 与 TS Mock 相同的 readings 路由 |
| 修改 | [`deploy/api_mock/db.json`](../../../../deploy/api_mock/db.json) | `pnpm run sync:mock-db` 同步 |

## 代码内容

```ts
export function filterReadings(
  rows: SensorReading[],
  pointId: number,
  from?: string,
  to?: string
): SensorReading[] {
  return [...rows]
    .filter((row) => Number(row.pointId) === Number(pointId))
    .filter((row) => {
      const day = String(row.recordedAt).slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
}
```

扁平行字段：`id`、`pointId`、`recordedAt`、`airTemp`、`airRh`、`soilVwc`、`soilTemp10cm`。

```ts
export const fetchSensorReadings = (pointId: number, from?: string, to?: string) =>
  http.get(`/field-sensors/${pointId}/readings`, { params: { from, to } })
```

雄县 7 日 `soilVwc`：11.5、11.9、12.3、12.6、12.1、12.4、**12.8**（与现有 `weatherReadings` 快照对齐）。

## 验证

```text
pnpm exec tsx --test src/utils/sensorReadings.test.ts
→ 2 passed
pnpm run sync:mock-db
```
