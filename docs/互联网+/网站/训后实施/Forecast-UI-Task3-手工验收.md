# Forecast-UI Task 3：手工验收清单

> 对应计划：[`2.0非AI-P0-天气预报UI实施计划.md`](../实施计划/2.0非AI-P0-天气预报UI实施计划.md) Task 3  
> 状态：✅ 数据侧已核对；页面点击需本地 `pnpm mock` + 浏览器确认

## 子任务解释

本任务**不写**自动化点浏览器的测试（E2E）。用人眼对照计划三条清单：数据对不对、页面看不看得见、空站会不会崩。

要串起来的演示路径：

1. 相关数据 → 气象 → 选雄县，看见 7 日表（22 日最高温 41℃）
2. 若链 2 已跑过，橙色「极端高温」标签能点进预警中心
3. 预警列表里能看到 `[极端天气]`（规则早就会写，本 P0 只保证人能从标签跳过去）

切到没有预报的站（如栾城）应显示「暂无该站 7 日预报」，不要报错。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 无代码 | — | 本任务只验收 Task 1–2 产物 |
| 新增 | 本说明 | 验收步骤与数据核对结果 |

## 数据核对（已做）

`src/mock/db.json` 的 `weatherForecast`：

- 雄县 `pointId: 2` 共 **7** 行，日期 `2026-08-22`～`2026-08-28`
- **22 日 `tempMax: 41`**，链 2 `evaluateForecast` 仍可命中 `extreme_heat_40`
- 河间 `pointId: 1` 共 **7** 行，最高温 ≤ 33（不超过 35）
- `daysForPoint` 测试：按站过滤、按日期升序、`limit` 截断（2 passed）

## 页面点击（本地）

先 `pnpm mock`，再打开网站：

1. 相关数据 → 气象 → 选「监测站 · 雄县」：表应有 7 行，22 日最高温 41；字幕含「含 7 日预报」。
2. 若已 `POST /weather/extreme-events/evaluate`（或等 Mock 60s 调度跑过链 2）且 `extremeEvents` 有「极端高温」，点橙色标签应进入 `/warnings`。
3. 切到没有预报的站（如栾城 `pointId: 3`）：表空文案「暂无该站 7 日预报」，不报错。

## 验证

```text
pnpm exec tsx --test src/utils/forecastView.test.ts
→ 2 passed
pnpm exec vue-tsc --noEmit
→ exit 0
```
