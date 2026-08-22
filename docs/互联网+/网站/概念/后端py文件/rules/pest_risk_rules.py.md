# rules/pest_risk_rules.py

> 源码：[`ml-bjj/serving/rules/pest_risk_rules.py`](../../../../../../ml-bjj/serving/rules/pest_risk_rules.py)  
> Mock 时对应：[`src/utils/pestRiskRules.ts`](../../../../../../src/utils/pestRiskRules.ts)

---

## 一、一句话定义

**`pest_risk_rules.py` 是 2.0 链 3 的纯函数。** 把连续高湿、累计降水、NDVI 偏低、近期 AI 识病次数等迹象各计一分，再分成风险档。高风险时预警带 `draft: true`，要人点发布才变正式。

凑分、不耐受。落库与发布见 [`persist.py`](./persist.py.md) 的 `run_chain3`、`publish_alert`。
