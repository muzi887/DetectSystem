# disease_env_rules.py

> 源码：[`ml-bjj/serving/disease_env_rules.py`](../../../../../ml-bjj/serving/disease_env_rules.py)  
> Mock 时对应：无（P3 识病叠环境，不是 Mock 2.0 三条链）  
> 与 2.0 三条链的差别见 [`什么是规则链.md`](../什么是规则链.md)（文中的 **P3**）。

---

## 一、一句话定义

**`disease_env_rules.py` 是「看完这张叶子之后，再用当前温湿墒抬一抬级别」。** 例如稻瘟 + 空气湿度 ≥80% 把本次识别的 `level` 提到 high，并拼一句环境建议。

它 **不** 写 `alerts` 表，**没有** 耐受计时，**不是** [`scheduler.py`](./scheduler.py.md) 那条 60 秒总线。智慧决策读的是预警文案前缀，不是这里的 `env_context`。

调用点在 [`app.py`](./app.py.md) 的 `_analyze_one`：先 `parse_env_from_request`，表单三个环境字段都空且有 `pointId` 时，由 **`fetch_point_weather`** 查该站最新 `weather_readings`。产出仍贴在 **这一次** 分析 JSON 的 `env_context` 上。

---

## 二、小结

**P3 = 改这一次识病结果；2.0 闹钟 = 给地块写自动预警。两者平行。**
