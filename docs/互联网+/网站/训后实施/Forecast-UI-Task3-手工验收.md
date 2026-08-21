# Forecast-UI Task 3：手工验收清单

> 对应计划：[`2.0非AI-P0-天气预报UI实施计划.md`](../实施计划/2.0非AI-P0-天气预报UI实施计划.md) Task 3  
> 状态：✅ 数据侧已核对；页面点击需本地 `pnpm mock` + 浏览器确认

## 子任务解释

本任务不写 E2E。对照计划三条清单，用种子和纯函数核对数据；界面路径在说明里列出，方便本地点一遍。

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

1. `pnpm mock` 后打开相关数据 → 气象 → 选「监测站 · 雄县」：表应有 7 行，22 日最高温 41；字幕含「含 7 日预报」。
2. 若已 `POST /weather/extreme-events/evaluate` 且 `extremeEvents` 有「极端高温」，点橙色标签应进入 `/warnings`。
3. 切到没有预报的站（如栾城 `pointId: 3`）：表空文案「暂无该站 7 日预报」，不报错。

## 验证

```text
pnpm exec tsx --test src/utils/forecastView.test.ts
→ 2 passed
pnpm exec vue-tsc --noEmit
→ exit 0
```
