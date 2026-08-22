# models.py

> 源码：[`ml-bjj/serving/models.py`](../../../../../ml-bjj/serving/models.py)  
> Mock 时对应：[`src/mock/db.json`](../../../../../src/mock/db.json) 的集合结构（不是某个 `.ts`）  
> 连接见 [`db.py.md`](./db.py.md)。建表命令见 [`Flask-MySQL-Task1-连接表结构导入.md`](../../训后实施/Flask-MySQL-Task1-连接表结构导入.md)。本文不贴全部字段。

---

## 一、一句话定义

**`models.py` 是「柜子上的标签」。** 用 Python 类说出库 `detect_system` 有哪些表、每列叫什么。网页仍用驼峰 JSON（`pointId`），库里列名是蛇形（`point_id`）。

它 **不** 开门（[`db.py`](./db.py.md)），**不** 挂网址（[`biz.py`](./blueprints/biz.py.md)），**不** 在启动时建表（Alembic）。识病历史第一期仍写 JSON 文件，**不在** 这 15 张表里。

---

## 二、它解决什么问题

旧 Mock 的 `db.json` 键名是前端驼峰。MySQL 用蛇形。没有对照表，接口一返回 `point_id`，Vue 读 `pointId` 就会空。

本文件：每个集合一个类；`to_camel()` 把一行变成前端字典；`JSON_COLLECTIONS` 把 REST / `db.json` 集合名映射到类。

---

## 三、15 张表（按页面记）

| 类 | 表 | 大致对应 |
|----|----|----------|
| `User` | `users` | 登录 |
| `MonitorPoint` | `monitor_points` | 地图监测点 |
| `WeatherReading` | `weather_readings` | 此刻气象/墒情 |
| `SensorReading` | `sensor_readings` | 折线历史 |
| `WeatherForecast` | `weather_forecast` | 7 日预报 |
| `Alert` | `alerts` | 预警；`time` 为 BIGINT 毫秒 |
| `Notification` | `notifications` | 铃铛 |
| `ThresholdProfile` | `threshold_profiles` | 每站作物/生育期阈值 |
| `RuleState` | `rule_state` | 链 1 耐受；`point_id+rule_id` 唯一 |
| `ExtremeEvent` | `extreme_events` | 链 2 |
| `PestRiskPrediction` | `pest_risk_predictions` | 链 3 |
| `Field` | `fields` | 地块 |
| `NdviLayer` / `MoistureLayer` | `ndvi_layers` / `moisture_layers` | 遥感元数据（图仍在前端静态资源） |
| `DroneMission` | `drone_missions` | 演示航迹 |

改列要改本文件 **并** 写 Alembic 迁移，不要只改 Python 类。

---

## 四、小结

| 要点 | 说明 |
|------|------|
| **本质** | SQLAlchemy ORM：类 = 表 |
| **一句话** | 告诉程序柜子怎么编号；前端说驼峰，库里写蛇形 |

同目录：[`db.py.md`](./db.py.md)、[`alembic/versions/0001_initial.py.md`](./alembic/versions/0001_initial.py.md)、[`import_db_json.py.md`](./import_db_json.py.md)。概念：[`什么是SQLAlchemy.md`](../什么是SQLAlchemy.md)、[`什么是Alembic.md`](../什么是Alembic.md)。
