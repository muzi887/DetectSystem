# rules/extreme_weather_rules.py

> 源码：[`ml-bjj/serving/rules/extreme_weather_rules.py`](../../../../../../ml-bjj/serving/rules/extreme_weather_rules.py)  
> Mock 时对应：[`src/utils/extremeWeatherRules.ts`](../../../../../../src/utils/extremeWeatherRules.ts)

---

## 一、一句话定义

**`extreme_weather_rules.py` 是 2.0 链 2 的纯函数。** 看未来几天预报：最高温 ≥40℃、低温、大风、暴雨等，生成 `[极端天气]` 事件草稿（标题、级别、日期）。**没有** 链 1 那种耐受分钟数。

写 `extreme_events` / `alerts` 由 [`persist.py`](./persist.py.md) 的 `run_chain2` 完成。预报数据在表 `weather_forecast`，不是本文件去打气象 API。
