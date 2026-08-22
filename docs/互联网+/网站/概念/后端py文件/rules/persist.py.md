# rules/persist.py

> 源码：[`ml-bjj/serving/rules/persist.py`](../../../../../../ml-bjj/serving/rules/persist.py)  
> Mock 时对应：[`src/mock/persistRules.ts`](../../../../../../src/mock/persistRules.ts)

---

## 一、一句话定义

**`persist.py` 是规则链的「落库胶水」。** 从库里取出墒情、预报、阈值、旧预警，调用链 1/2/3 **纯函数**，再按去重规则写入 `alerts`、`rule_state` 等，并补通知、抖动雄县墒情。

阈值怎么比，在 [`alert_rules.py`](./alert_rules.py.md) 等文件，不在这里改口径。本文件 **不** 听 HTTP；[`biz.py`](../blueprints/biz.py.md) 和 [`scheduler.py`](../scheduler.py.md) 都来调同一套函数。

---

## 二、函数在干什么

### 三条链（读表 → 纯函数 → 写表）

| 函数 | 干什么 | 纯函数在哪 |
|------|--------|------------|
| `run_chain1` | 每点取最新 `weather_readings` → 算完后 **整点替换** `rule_state` → 去重插入 `[自动预警]` | [`evaluate_reading`](./alert_rules.py.md) |
| `run_chain2` | 按点读 `weather_forecast` → 去重写 `extreme_events` → 再插 `[极端天气]` | [`evaluate_forecast`](./extreme_weather_rules.py.md) |
| `run_chain3` | 按地块凑 NDVI / 预报 / 近 7 日 `[AI识别]` 次数 → 清空并重写 `pest_risk_predictions` → 高风险插 **草稿** 预警 | [`evaluate_pest_risk`](./pest_risk_rules.py.md) |
| `run_all_chains` | 同一会话里依序跑 1→2→3，再 `append_notifications` | — |

闹钟实际 **不** 走 `run_all_chains`：[`scheduler.py`](../scheduler.py.md) 分四次事务分别调 `tick_sensor_simulation`、`run_chain1`、`run_chain2`、`run_chain3` + `append_notifications`，后一步失败不会撤掉已提交的前一步。人手动点门牌则直接调对应的 `run_chain*`。

`run_chain1` 内部顺序：最新读数 → `profile_for_point` 取阈值 → `evaluate_reading` → 带上 `fieldId` → 删该点旧 `rule_state` 再写入 `nextStates` → `_insert_alerts`。

### 去重与插入

| 函数 | 干什么 |
|------|--------|
| `next_alert_id` | 现有预警 `id` 的最大值 + 1 |
| `dedupe_alerts` | 未 `handled` 且同 `pointId` + `ruleId` + `chain` → **不插第二行**；否则赋新 id |
| `_insert_alerts` | 先 `dedupe_alerts`，只把 `created` 写成 `Alert` 行 |

### 演示墒情与通知、阈值、发布

**VWC** = Volumetric Water Content，体积含水量。`soil_vwc` / `soilVwc` 就是土壤里水占的体积百分比，页面上说的「墒情 %」。

| 函数 | 干什么 | 谁调用 |
|------|--------|--------|
| `tick_soil_vwc` | 闹钟响一次，把墒情 +0.4，夹在 11–14.5，到顶回到 11（纯数字，不碰库）。卡在干旱告警线 15% 以下，方便链 1 演示 | `tick_sensor_simulation` |
| `tick_sensor_simulation` | 只动监测点 **id=2 雄县**：改最新 `weather_readings.soil_vwc`，点亮在线；当天已有 `sensor_readings` 则改墒情，否则插一条 | 闹钟第一步 |
| `append_notifications` | 给本轮新预警各写一条铃铛；草稿标题加「草稿」 | 闹钟在链 3 之后 |
| `profile_for_point` | 读该站 `threshold_profiles`，没有则用小麦/拔节默认值 | 链 1/3、`GET .../thresholds` |
| `upsert_threshold_profile` | 按监测点插入或更新阈值档案 | `PUT .../thresholds` |
| `publish_alert` | 把 `draft=true` 改成正式预警 | `POST /alerts/<id>/publish` |

带 `_` 的 `_point_name`、`_field_id_of_point`、`_ndvi_mid` 只给上面几条链拼名称、地块、NDVI 中值，页面不直接调。

---

## 三、和 Mock 函数怎么对

| 本文件 | [`persistRules.ts`](../../../../../../src/mock/persistRules.ts) |
|--------|----------------------------------------------------------------|
| `next_alert_id` | `nextAlertId` |
| `dedupe_alerts` | `dedupeAlerts` |
| `tick_soil_vwc` | `tickSoilVwc` |
| `run_chain1` | `runChain1OnDb` |
| `run_chain2` | `runChain2OnDb` |
| `run_chain3` | `runChain3OnDb` |
| `run_all_chains` | `runAllChains` |
| `publish_alert` | `publishAlert` |
| `tick_sensor_simulation` | `tickSensorSimulation` |
| `profile_for_point` / `upsert_threshold_profile` | `profileForPoint` 等 |

差别：那边读写整份 `db.json`；这边用 SQLAlchemy 会话写 MySQL。去重口径相同。

---

## 四、小结

**纯函数算该不该报；`run_chain*` 负责读表、去重、写入。** 闹钟分事务喊它们；人点页面走 `biz.py` 同一套函数。
