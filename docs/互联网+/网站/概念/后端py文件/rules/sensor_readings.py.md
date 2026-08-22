# rules/sensor_readings.py

> 源码：[`ml-bjj/serving/rules/sensor_readings.py`](../../../../../../ml-bjj/serving/rules/sensor_readings.py)  
> Mock 时对应：[`src/utils/sensorReadings.ts`](../../../../../../src/utils/sensorReadings.ts)

---

## 一、一句话定义

**按监测点 + 日期范围过滤传感器历史。** `filter_readings` 选出 `pointId` 匹配且 `recordedAt` 落在 `from`/`to` 的行，再按时间排序。`last_7_day_range` 给出默认近 7 日。

不查库。[`biz.py`](../blueprints/biz.py.md) 先把 `sensor_readings` 表读出来，再交给本函数，供传感器 Tab 折线使用。
