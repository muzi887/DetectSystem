# Flask 后端 `.py` 说明（索引）

> 本目录对应 **`ml-bjj/serving/`** 里每一个 Python 文件（含 Alembic），外加灌数脚本 `ml-bjj/scripts/import_db_json.py`。  
> 训练脚本（`train_cls.py` 等）不是网站后端，不在这里。  
> Flask 是什么见 [`../什么是Flask.md`](../什么是Flask.md)。怎么启动见 [`../../项目启动说明.md`](../../项目启动说明.md)。

每篇结构相同：一句话定义、解决什么问题、不负责什么；文头有「Mock 时对应」（没有则写无）。不要把本目录当成 API 清单或启动手册。

---

## 怎么读

先分清两条线，再点进文件：

```text
浏览器
    ├─ 识病 / 防治库     →  app.py 挂的 /api/analysis、/api/treatments
    └─ 登录 / 预警 / 监测 →  blueprints/biz.py（MySQL）
                              ↑
                    db.py 开门 · models.py 表 · scheduler.py 60 秒值班
```

空的 `__init__.py` 只是「这是一个 Python 包」，没有业务逻辑，仍各有一篇以免漏文件。

迁自 Mock / 前端 utils 的对照（云端还有 [`deploy/api_mock/`](../../../../../deploy/api_mock/)，说明见 [`什么是api_mock.md`](../什么是api_mock.md)；开发以 `src/` 为准）：

| 现在 | Mock 时对应 |
|------|-------------|
| [`blueprints/biz.py.md`](./blueprints/biz.py.md) | `src/mock/server.ts` + json-server 对 `db.json` 的自动 REST |
| [`rules/agri_derived.py.md`](./rules/agri_derived.py.md) | `deploy/api_mock/agriMockCore.cjs` |
| [`rules/alert_rules.py.md`](./rules/alert_rules.py.md) | `src/utils/alertRules.ts` |
| [`rules/rule_level_map.py.md`](./rules/rule_level_map.py.md) | `src/utils/ruleLevelMap.ts` |
| [`rules/extreme_weather_rules.py.md`](./rules/extreme_weather_rules.py.md) | `src/utils/extremeWeatherRules.ts` |
| [`rules/pest_risk_rules.py.md`](./rules/pest_risk_rules.py.md) | `src/utils/pestRiskRules.ts` |
| [`rules/persist.py.md`](./rules/persist.py.md) | `src/mock/persistRules.ts` |
| [`rules/daily_report.py.md`](./rules/daily_report.py.md) | `src/utils/dailyReport.ts` |
| [`rules/sensor_readings.py.md`](./rules/sensor_readings.py.md) | `src/utils/sensorReadings.ts` |
| [`scheduler.py.md`](./scheduler.py.md) | `src/mock/server.ts` 里的 `setInterval` |
| [`models.py.md`](./models.py.md) | `src/mock/db.json` 的集合结构 |
| [`import_db_json.py.md`](./import_db_json.py.md) | 无（新脚本；读的仍是 `db.json`） |
| [`db.py.md`](./db.py.md)、Alembic、空 `__init__.py`、[`serve.py.md`](./serve.py.md) | 无 |
| [`app.py.md`](./app.py.md) 与识病一组 | 识病本就在 Flask；业务门牌原先在 `server.ts` |

---

## 入口与托管

| 源码 | 说明 |
|------|------|
| [`app.py.md`](./app.py.md) | Flask 应用本体；本机 `python app.py` |
| [`serve.py.md`](./serve.py.md) | 同一应用，生产用 waitress 启动 |
| [`__init__.py.md`](./__init__.py.md) | `serving` 包标记（空） |

## 数据库

| 源码 | 说明 |
|------|------|
| [`db.py.md`](./db.py.md) | 读 `DATABASE_URL`，会话 |
| [`models.py.md`](./models.py.md) | 15 张表 |
| [`scheduler.py.md`](./scheduler.py.md) | 60 秒规则链 |
| [`alembic/env.py.md`](./alembic/env.py.md) | 迁移时怎么连库 |
| [`alembic/versions/0001_initial.py.md`](./alembic/versions/0001_initial.py.md) | 第一版建表 |
| [`import_db_json.py.md`](./import_db_json.py.md) | 把 `db.json` 灌进真库 |

## 业务 HTTP

| 源码 | 说明 |
|------|------|
| [`blueprints/biz.py.md`](./blueprints/biz.py.md) | 登录、REST、自定义业务接口 |
| [`blueprints/__init__.py.md`](./blueprints/__init__.py.md) | 包标记（空） |

## 2.0 规则链（写 `alerts`）

| 源码 | 说明 |
|------|------|
| [`rules/persist.py.md`](./rules/persist.py.md) | 落库：跑链、去重、抖动墒情 |
| [`rules/alert_rules.py.md`](./rules/alert_rules.py.md) | 链 1 纯函数 |
| [`rules/rule_level_map.py.md`](./rules/rule_level_map.py.md) | hint/alert → 页面级别 |
| [`rules/extreme_weather_rules.py.md`](./rules/extreme_weather_rules.py.md) | 链 2 纯函数 |
| [`rules/pest_risk_rules.py.md`](./rules/pest_risk_rules.py.md) | 链 3 纯函数 |
| [`rules/__init__.py.md`](./rules/__init__.py.md) | 包标记（空） |

## 页面辅助（不写 `alerts`）

| 源码 | 说明 |
|------|------|
| [`rules/agri_derived.py.md`](./rules/agri_derived.py.md) | 原 agriMockCore：登录、NDVI、墒情、瞬时评估；不是三条链 |
| [`rules/daily_report.py.md`](./rules/daily_report.py.md) | 监测日报文案 |
| [`rules/sensor_readings.py.md`](./rules/sensor_readings.py.md) | 历史读数按日过滤 |

## 识病（写 JSON 文件，不进 MySQL）

| 源码 | 说明 |
|------|------|
| [`inference.py.md`](./inference.py.md) | 加载权重、跑分类 |
| [`predict_utils.py.md`](./predict_utils.py.md) | Top-K、是否需人工复核 |
| [`crop_filter.py.md`](./crop_filter.py.md) | 23 类、按作物掩码 |
| [`knowledge.py.md`](./knowledge.py.md) | 防治库 JSON |
| [`disease_env_rules.py.md`](./disease_env_rules.py.md) | P3：识病结果叠当前温湿 |
| [`analysis_store.py.md`](./analysis_store.py.md) | 识别记录文件 + 线程锁 |

## Alembic 空包

| 源码 | 说明 |
|------|------|
| [`alembic/__init__.py.md`](./alembic/__init__.py.md) | 包标记（空） |
| [`alembic/versions/__init__.py.md`](./alembic/versions/__init__.py.md) | 包标记（空） |
