# rules/agri_derived.py

> 源码：[`ml-bjj/serving/rules/agri_derived.py`](../../../../../../ml-bjj/serving/rules/agri_derived.py)  
> Mock 时对应：[`deploy/api_mock/agriMockCore.cjs`](../../../../../../deploy/api_mock/agriMockCore.cjs)

---

## 一、一句话定义

**`agri_derived.py` 是一堆「页面要、但不是三条链本身」的纯函数。** 登录校验（手机号/密码/演示验证码 2026）、角色归一、NDVI 摘要、墒情趋势、最近点查墒情、瞬时灾害评估（当场比阈值、**不写** `alerts`）等。

真正写自动预警的是链 1 + [`persist.py`](./persist.py.md)。本文件里的 `evaluate_disaster_rules` 只给接口返回 JSON，和 2.0 总线不是同一扇门。

---

## 二、为什么单独有这个文件

**不是连库、跑链所必需。** 删掉它，网站照样能起；但前端还在打 `/login`、`/ndvi/summary` 等 5 个接口，计算必须有个地方放。

迁库前：门牌在 `src/mock/server.ts`，算法在 `deploy/api_mock/agriMockCore.cjs`。Flask 接盘时按同一刀切开：[`biz.py`](../blueprints/biz.py.md) 对标 `server.ts`（听 HTTP、查库）；本文件对标 `agriMockCore.cjs`（纯函数、不算库）。文件名里的 agri 来自那份 Mock 核心。

不能塞进链 1/2/3 或 `persist.py`：那几条是值班写 `alerts` 的；这里只当场算完返回 JSON。单独成文件而不是写进 `biz.py`，是为了门牌和算法分开，与 [`daily_report.py`](./daily_report.py.md) 同一套拆法。把这 170 行贴进蓝图也能跑，只是又混在一起。

---

## 三、谁调谁

调用方只有 [`biz.py`](../blueprints/biz.py.md) 里这 5 个门牌。链 1/2/3、CRUD、日报 **不** 走本文件。

| `biz.py` 门牌 | 本文件函数 |
|---|---|
| `POST /login` | `handle_farm_login` |
| `GET /ndvi/summary` | `build_ndvi_summary` |
| `GET /soilMoisture/trend` | `build_soil_moisture_trend` |
| `POST /disasterRules/evaluate` | `evaluate_disaster_rules` |
| `GET /moisture/value` | `query_moisture_by_nearest_point` |

分工：`biz.py` 用 `session_scope` / `select` 查表、把行转成驼峰 dict；本文件只收 `list[dict]` / `dict`，再拼返回值。本文件开头只有 `math`、`time`，**不** import SQLAlchemy、**不** 开会话。

登录是同一模式：`biz.py` 先 `select(User)`，再把 `users` 交给 `handle_farm_login` 比对手机号、密码、验证码。

---

## 四、小结

**页面还要那些结果，计算必须存在；单独这个文件，是为了别跟三条链、也别跟 HTTP/SQL 挤在一处。**
