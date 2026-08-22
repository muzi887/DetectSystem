# blueprints/biz.py

> 源码：[`ml-bjj/serving/blueprints/biz.py`](../../../../../../ml-bjj/serving/blueprints/biz.py)  
> Mock 时对应：[`src/mock/server.ts`](../../../../../../src/mock/server.ts)（手写路由）+ json-server 对 `db.json` 的自动 REST  
> 迁库方案见 [`Flask-MySQL替换Mock方案.md`](../../../方案/Flask-MySQL替换Mock方案.md)。

---

## 一、一句话定义

**`biz` 是 business 的缩写，这里指「业务」（登录、预警、监测），不是识病。**

**`biz.py` 是业务 HTTP 蓝图。** 登录、监测点、预警、预报、遥感元数据、规则链手工触发、日报、传感器历史等，从前 json-server 的那些路径，现在由本文件查 MySQL 再返回驼峰 JSON。

[`app.py`](../app.py.md) 里 `register_blueprint(biz)` 把它挂上。浏览器仍打 `/api/...`，Vite/Nginx 去掉前缀后对上这里的 `/login`、`/alerts` 等。

---

## 二、大致有哪些门牌

| 类型 | 例子 |
|------|------|
| 页面辅助（[`agri_derived.py`](../rules/agri_derived.py.md)） | `POST /login`、`GET /ndvi/summary`、`GET /soilMoisture/trend`、`POST /disasterRules/evaluate`、`GET /moisture/value` |
| 兼容 json-server 的 CRUD | `GET/POST/PATCH/DELETE` 监测点、预警等；`JSON_COLLECTIONS` + `_sort` 查询参数 |
| 规则链 | 评估链 1/2/3（`run_chain1/2/3`）、发布草稿预警 |
| 其它 | 日报 markdown（[`daily_report.py`](../rules/daily_report.py.md)）、按日过滤 `sensorReadings` |

这 5 个页面辅助门牌都是同一模式：本文件 `session_scope` 查表、转驼峰 dict，再交给 [`agri_derived.py`](../rules/agri_derived.py.md) 的纯函数。迁库前对应 `server.ts`（门牌）和 `agriMockCore.cjs`（算法）；那个文件不碰 SQLAlchemy，也不是连库/跑链所必需。链 1/2/3、CRUD、日报不走它。

缺 `DATABASE_URL` 时返回 503「未配置数据库」，不读 `db.json`。

它 **不** 跑 PyTorch，**不** 自己 `create_engine`（用 [`db.py`](../db.py.md)），**不** 定义表（[`models.py`](../models.py.md)）。60 秒自动跑链是 [`scheduler.py`](../scheduler.py.md)，不经过这些路由。

---

## 三、小结

**人点页面走 `biz.py`；闹钟值班走 [`scheduler.py`](../scheduler.py.md)；两边写同一份 MySQL。**

本文件挂牌、查库。后面干活的不止 [`agri_derived.py`](../rules/agri_derived.py.md)：那 5 个页面辅助由它比数、拼结果；链 1/2/3 交给 [`persist.py`](../rules/persist.py.md)；日报交给 [`daily_report.py`](../rules/daily_report.py.md)；传感历史过滤交给 [`sensor_readings.py`](../rules/sensor_readings.py.md)；监测点/预警增删改由本文件自己查表写表。