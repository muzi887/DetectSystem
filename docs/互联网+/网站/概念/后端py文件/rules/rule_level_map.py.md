# rules/rule_level_map.py

> 源码：[`ml-bjj/serving/rules/rule_level_map.py`](../../../../../../ml-bjj/serving/rules/rule_level_map.py)  
> Mock 时对应：[`src/utils/ruleLevelMap.ts`](../../../../../../src/utils/ruleLevelMap.ts)

---

## 一、一句话定义

**一行翻译：规则内部的 `hint` → 页面 `warning`，其它（`alert`）→ `high`。**

链 1 比较阈值时用 hint/alert；预警中心展示的是 warning/high。没有第三套级别。被 [`alert_rules.py`](./alert_rules.py.md) 调用。

预警级别人话见 [`什么是预警级别.md`](../../什么是预警级别.md)。
