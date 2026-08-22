# scheduler.py

> 源码：[`ml-bjj/serving/scheduler.py`](../../../../../ml-bjj/serving/scheduler.py)  
> Mock 时对应：[`src/mock/server.ts`](../../../../../src/mock/server.ts) 里的 `setInterval`  
> 规则链概念见 [`什么是规则链.md`](../什么是规则链.md)。实现见 [`Flask-MySQL-Task4-链2链3与调度.md`](../../训后实施/Flask-MySQL-Task4-链2链3与调度.md)。

---

## 一、一句话定义

**`scheduler.py` 是 Flask 进程里的 60 秒闹钟。** 到点后：抖演示墒情 → 链 1 → 链 2 → 链 3，把预警写入 MySQL。人不点按钮也会值班。

它 **不** 听 HTTP，**不** 自己算阈值（[`rules/`](./README.md)），**不** 自己开门（[`db.py`](./db.py.md)）。以前在 Mock 的 `setInterval` 里，切流后搬进 Flask。

---

## 二、一轮 tick

四次独立 `session_scope`：后面失败 **不会** 撤掉前面已提交的预警。

| 顺序 | 调用 | 作用 |
|------|------|------|
| 1 | `tick_sensor_simulation` | 微调雄县墒情 |
| 2 | `run_chain1` | `[自动预警]` |
| 3 | `run_chain2` | `[极端天气]` |
| 4 | `run_chain3` + `append_notifications` | 虫情草稿 + 通知 |

`app.py` / `serve.py` 启动后调用 `start_scheduler()`。`threading.Timer`，`daemon=True`。只启动一次。

**必须单进程**：多个 worker 会让闹钟响两遍、预警重复。测例设 `ML_BJJ_DISABLE_SCHEDULER=1`。

---

## 三、小结

| 要点 | 说明 |
|------|------|
| **本质** | 进程内 Timer，接替 Mock 闹钟 |
| **一句话** | 到点喊三条链值班；失败不回滚已提交的前一步 |

同目录：[`rules/persist.py.md`](./rules/persist.py.md)、[`app.py.md`](./app.py.md)。启动变量见 [`项目启动说明.md`](../../项目启动说明.md)。
