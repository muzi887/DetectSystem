# rules/alert_rules.py

> 源码：[`ml-bjj/serving/rules/alert_rules.py`](../../../../../../ml-bjj/serving/rules/alert_rules.py)  
> Mock 时对应：[`src/utils/alertRules.ts`](../../../../../../src/utils/alertRules.ts)（类型还在 [`src/types/rules.ts`](../../../../../../src/types/rules.ts)）  
> 前端同源说明见 [`链1-alertRules三文件说明.md`](../../链1-alertRules三文件说明.md)。

---

## 一、一句话定义

**`alert_rules.py` 是 2.0 链 1 的纯函数（Python 版）。** 拿此刻墒情/气温对照该站阈值：先 `detect_hits` 看碰了哪条（旱/热/涝），再 `evaluate_reading` 看超标是否持续够久，够了才生成 `[自动预警]`。

默认阈值是小麦/拔节。真正写库由 [`persist.py`](./persist.py.md) 做。级别翻译在 [`rule_level_map.py`](./rule_level_map.py.md)。

不要和 [`disease_env_rules.py`](../disease_env_rules.py.md) 搞混：那是识病后叠环境，不写 `alerts`。

---

## 二、小结

**链 1 = 比阈值 + 耐受计时；本文件不算 HTTP、不写 SQL。**
