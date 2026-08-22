# Flask-MySQL Task 4：链 2 / 链 3、自定义路由、60 秒调度

> 对应计划：[`Flask-MySQL替换Mock实施计划.md`](../实施计划/Flask-MySQL替换Mock实施计划.md) Task 4  
> 状态：✅ 已完成  
> `scheduler.py` 在干什么（人话）见 [`scheduler.py.md`](../概念/后端py文件/scheduler.py.md)。  
> 全部后端 `.py` 索引：[`后端py文件/README.md`](../概念/后端py文件/README.md)。

## 子任务解释

极端天气、虫情草稿、日报、最近点墒情、NDVI 摘要等原 Mock 自定义接口改由 Flask 查库。60 秒：先抖雄县墒情，再分事务跑三条链（后链失败不回滚前链）。`ML_BJJ_DISABLE_SCHEDULER=1` 时测试不打 tick。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`extreme_weather_rules.py`](../../../../ml-bjj/serving/rules/extreme_weather_rules.py) | 预报 ≥40℃ 等 |
| 新增 | [`pest_risk_rules.py`](../../../../ml-bjj/serving/rules/pest_risk_rules.py) | 多因子打分，high 出草稿 |
| 新增 | [`daily_report.py`](../../../../ml-bjj/serving/rules/daily_report.py) | 日报 markdown |
| 新增 | [`sensor_readings.py`](../../../../ml-bjj/serving/rules/sensor_readings.py) | `from`/`to` 过滤 |
| 修改 | [`agri_derived.py`](../../../../ml-bjj/serving/rules/agri_derived.py) | NDVI 摘要、墒情趋势、灾害瞬时评估、最近点 |
| 修改 | [`persist.py`](../../../../ml-bjj/serving/rules/persist.py) | `run_chain2/3`、`publish_alert`、`tick_sensor_simulation`、`run_all_chains` |
| 新增 | [`scheduler.py`](../../../../ml-bjj/serving/scheduler.py) | 60s Timer |
| 修改 | [`app.py`](../../../../ml-bjj/serving/app.py) / [`serve.py`](../../../../ml-bjj/serving/serve.py) | 启动后 `start_scheduler()` |
| 修改 | [`biz.py`](../../../../ml-bjj/serving/blueprints/biz.py) | evaluate 链 2/3、publish、日报、moisture/value 等 |

## 代码内容

调度分提交：

```python
with session_scope() as session:
    tick_sensor_simulation(session, now)
with session_scope() as session:
    created.extend(run_chain1(session, now)["created"])
# chain2、chain3 各自 session_scope
```

链 3 高风险 `draft: true`；`POST /alerts/:id/publish` 置 `draft=false`。

`GET /reports/daily` 返回 `{ "markdown": "..." }`，文案对齐原 `dailyReport.ts`。

## 验证

```text
python -m pytest tests -q
# 56 passed（本目录全量，含既有识病测例）
```
