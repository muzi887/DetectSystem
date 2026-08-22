# Flask-MySQL Task 3：链 1 纯函数 + SQL 落库

> 对应计划：[`Flask-MySQL替换Mock实施计划.md`](../实施计划/Flask-MySQL替换Mock实施计划.md) Task 3  
> 状态：✅ 已完成（`test_alert_rules.py` + `test_persist_rules.py`）  
> 人话：[`rule_level_map.py.md`](../概念/后端py文件/rules/rule_level_map.py.md)、[`alert_rules.py.md`](../概念/后端py文件/rules/alert_rules.py.md)、[`persist.py.md`](../概念/后端py文件/rules/persist.py.md)

## 子任务解释

把 `alertRules.ts` 的阈值与耐受时间原样搬到 Python，落库改为按表读写，不再写整份 `db.json`。去重键仍是未处理的 `pointId + ruleId + chain`。

## 改动文件

| 操作 | 文件 | 作用 | Mock 时对应 |
|------|------|------|-------------|
| 新增 | [`ml-bjj/serving/rules/rule_level_map.py`](../../../../ml-bjj/serving/rules/rule_level_map.py) | hint→warning，alert→high | [`src/utils/ruleLevelMap.ts`](../../../../src/utils/ruleLevelMap.ts) |
| 新增 | [`ml-bjj/serving/rules/alert_rules.py`](../../../../ml-bjj/serving/rules/alert_rules.py) | `detect_hits` / `evaluate_reading` | [`src/utils/alertRules.ts`](../../../../src/utils/alertRules.ts) |
| 新增 | [`ml-bjj/serving/rules/persist.py`](../../../../ml-bjj/serving/rules/persist.py) | `run_chain1`、`dedupe_alerts`、`tick_soil_vwc`、阈值 upsert | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) |
| 修改 | [`ml-bjj/serving/blueprints/biz.py`](../../../../ml-bjj/serving/blueprints/biz.py) | `POST /alerts/evaluate-all`、`GET\|PUT /field-sensors/:id/thresholds` | [`src/mock/server.ts`](../../../../src/mock/server.ts) 对应路由 |
| 新增 | [`ml-bjj/tests/test_alert_rules.py`](../../../../ml-bjj/tests/test_alert_rules.py) | 未满耐受不报、持续超标报一条、恢复清状态 | [`src/utils/alertRules.test.ts`](../../../../src/utils/alertRules.test.ts) |
| 新增 | [`ml-bjj/tests/test_persist_rules.py`](../../../../ml-bjj/tests/test_persist_rules.py) | 去重、墒情带 11–14.5、链 1 不重复插 | [`src/mock/persistRules.test.ts`](../../../../src/mock/persistRules.test.ts) |

链 1 在 Mock 侧原先分两步落地：纯函数见 [Rules-Task1](./Rules-Task1-环境灾害链纯函数.md)，写 `db.json` 见 [Rules-Task2](./Rules-Task2-evaluate-all落库.md)。本任务把这两步接到 Flask + MySQL。

## 代码内容

默认阈值与 TS 相同：墒情 hint 25 / alert 15；气温 32 / 38；涝渍 80；耐受 30 / 10 分钟。

```python
if elapsed >= hit["durationMinutes"] and not state["alertEmitted"]:
    alerts_to_create.append({..., "chain": "env", "draft": False})
    state["alertEmitted"] = True
```

`run_chain1`：每点取 `weather_readings` 最大 id → `evaluate_reading` → 替换该点 `rule_state` → `dedupe` 后插入 `alerts`。

## 验证

```text
python -m pytest tests/test_alert_rules.py tests/test_persist_rules.py -q
```
