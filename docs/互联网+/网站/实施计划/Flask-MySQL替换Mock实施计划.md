# Flask + MySQL 替换 Mock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 下线 json-server：登录、监测、预警、三条规则链与 60s 调度全部由 Flask `:5000` 读写 MySQL `detect_system`；前端路径不变。

**Architecture:** 扩展现有 `ml-bjj/serving`，新增业务蓝图（路由无 `/api` 前缀，与 json-server 一致）。识病仍是 `/api/analysis/*`。Vite / Nginx 把其余 `/api` 去掉前缀后也转到 5000。**业务 MySQL 只使用云端宝塔这一份 `detect_system`**（本机 Flask 用公网 IP 连过去）。pytest 用内存 SQLite 隔离，不是第二套业务库。无 23 类权重时进程仍能起，仅识图接口失败。

**Tech Stack:** Flask 3、SQLAlchemy 2、Alembic、PyMySQL、pytest。前端不改路径。不上 Django/Spring。

**Spec:** [`Flask-MySQL替换Mock方案.md`](../方案/Flask-MySQL替换Mock方案.md) 全文。表对照 [`假数据库迁真库方案.md`](../方案/假数据库迁真库方案.md) §四。前置：云端宝塔空库 `detect_system` / 用户 `detect_system` 已建（方案 §5.0）。

## Global Constraints

- 前端 `baseURL` 仍是 `/api`（`src/utils/http.ts`）。不要让浏览器直连 MySQL。
- 业务路由：`/login`、`/monitorPoints`、`/alerts`……；识病：`/api/analysis/...`、`/api/treatments`。
- 继续支持 `GET /alerts?_sort=time&_order=desc`、`GET /weatherForecast?pointId=`。
- **不要放宽** 23 类权重校验；只拆开「无权重则 `SystemExit` 整进程退出」。
- 规则数字与现 TS 一致：墒情 hint&lt;25 / alert&lt;15；气温 hint&gt;32 / alert&gt;38；涝渍 alert&gt;80；耐受 hint 30 min / alert 10 min。去重键：未 `handled` 的 `pointId + ruleId + chain`。
- 链与链分事务；60s 调度单进程。
- 密码、`DATABASE_URL` 禁止写入 Git。**只连云端一份库**：云上 Flask 主机 `127.0.0.1`；本机 Flask 主机为服务器公网 IP（`82.157.234.123`）。不装本机 MySQL / Docker。宝塔需给开发机开远程权限，安全组放行 3306。
- 第一期不迁 `analysis_records.json`；不改智能分析三列布局；不重训模型。
- 现有 `ml-bjj/tests/test_app_api.py` 必须保持绿。
- 改完 `src/mock/db.json` 不再要求 `pnpm sync:mock-db` 作为运行时同步（导入脚本一次性即可）。

### File map

| File | Responsibility |
|------|----------------|
| `ml-bjj/requirements.txt` | 增加 SQLAlchemy、PyMySQL、Alembic |
| `ml-bjj/serving/db.py` | `get_engine` / `Session`；读 `DATABASE_URL` |
| `ml-bjj/serving/models.py` | 15 张表 ORM；`to_camel()` 给 JSON |
| `ml-bjj/serving/alembic/` | 初始迁移 |
| `ml-bjj/scripts/import_db_json.py` | 读 `src/mock/db.json` upsert |
| `ml-bjj/serving/app.py` | 注册蓝图；`prepare_runtime` 拆门闩；`fetch_point_weather` 改查库 |
| `ml-bjj/serving/blueprints/biz.py` | 登录 + REST + 自定义路由 |
| `ml-bjj/serving/rules/alert_rules.py` | 链 1 纯函数（移植 `alertRules.ts`） |
| `ml-bjj/serving/rules/extreme_weather_rules.py` | 链 2 |
| `ml-bjj/serving/rules/pest_risk_rules.py` | 链 3 |
| `ml-bjj/serving/rules/persist.py` | SQL 版 `run_chain1/2/3`、`publish_alert`、`tick_sensor` |
| `ml-bjj/serving/rules/agri_derived.py` | login / ndvi summary / 墒情趋势 / disasterRules / nearest moisture |
| `ml-bjj/serving/rules/daily_report.py` | 移植 `buildDailyReport` |
| `ml-bjj/serving/rules/sensor_readings.py` | 移植 `filterReadings` |
| `ml-bjj/serving/scheduler.py` | 60s：tick → `run_all_chains` |
| `ml-bjj/tests/test_biz_api.py` | 登录 / CRUD / 缺 `DATABASE_URL` |
| `ml-bjj/tests/test_alert_rules.py` | 与 TS 链 1 口径对齐 |
| `ml-bjj/tests/test_persist_rules.py` | 去重、tick 墒情带 |
| `vite.config.ts` | `/api` 全部指向 `127.0.0.1:5000` |
| `package.json` | `pnpm mock` 改为提示，不再当主后端 |
| `README.md`、`docs/互联网+/网站/项目启动说明.md`、`docs/互联网+/部署/云服务器部署更新说明.md` | 启动与反代 |
| `src/utils/http.ts` | 404 文案去掉「检查 Mock」（可选一行） |

---

### Task 1: 连接、表结构、导入脚本

**Files:**
- Modify: `ml-bjj/requirements.txt`
- Create: `ml-bjj/serving/db.py`、`ml-bjj/serving/models.py`
- Create: `ml-bjj/serving/alembic.ini` + `alembic/` 初始修订
- Create: `ml-bjj/scripts/import_db_json.py`
- Create: `ml-bjj/tests/test_db_url.py`（或并入 `test_biz_api.py`）

**Interfaces:**
- `DATABASE_URL` 未设置 → 业务接口 503，`message` 含「未配置数据库」，不要读 `db.json`。
- pytest：`monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")` 后 `models.Base.metadata.create_all`。
- 表名与方案 §5.1 一致。JSON 列（`pest_risk_predictions.factors`、预报数组若用 JSON）在 SQLite 用 `JSON`/`TEXT`，MySQL 用 `JSON`。
- 索引：`alerts(handled, draft, point_id)`、`alerts(time)`；`rule_state` 联合唯一 `(point_id, rule_id)`。
- 导入：项目根 `src/mock/db.json`；驼峰键写入蛇形列；可重复跑（先 truncate 或 upsert）。

- [ ] **Step 1:** 在 `requirements.txt` 增加 `SQLAlchemy>=2.0`、`PyMySQL>=1.1`、`Alembic>=1.13`。
- [ ] **Step 2:** 写 `db.py`：`create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)`；缺省抛明确错误，不要 fallback 到 json-server。
- [ ] **Step 3:** 按 `db.json` 字段建 ORM（至少覆盖：`users.phone/password/role`；`monitor_points` 的 lat/lng/temp/soilMoisture/online/lastSeenAt/region；`alerts.time` BIGINT；`weather_readings` 九类读数；`threshold_profiles` 含 crop/growthStage）。
- [ ] **Step 4:** Alembic `upgrade head` **只对云端**空库 `detect_system` 建表（本机设好远程 `DATABASE_URL` 后执行一次，或 SSH 到服务器执行）。不要在本机再起一套 MySQL。
- [ ] **Step 5:** `python ml-bjj/scripts/import_db_json.py` 导入后 `SELECT COUNT(*) FROM users` ≥ 1，`monitor_points` 含雄县 id=2。
- [ ] **Step 6:** pytest：无 `DATABASE_URL` 时 `get_engine()` 失败信息可读。

Run: `cd ml-bjj && python -m pytest tests/test_db_url.py -q`（文件名以实际为准）

---

### Task 2: 启动拆门闩 + 登录与基础 REST

**Files:**
- Modify: `ml-bjj/serving/app.py`（`prepare_runtime` / `main`；注册蓝图）
- Create: `ml-bjj/serving/blueprints/biz.py`
- Create: `ml-bjj/serving/rules/agri_derived.py`（先实现 `handle_farm_login`）
- Create: `ml-bjj/tests/test_biz_api.py`
- Modify: `ml-bjj/tests/conftest.py`（给业务测例注入 SQLite + `create_all` + 种子用户）

**Interfaces:**
- `prepare_runtime()`：无权重或非 23 类时 **打印警告并继续听端口**，设置 `app.config["MODEL_READY"]=False`；`ML_BJJ_USE_MOCK=1` 时识病仍走 mock。23 类校验逻辑保留：权重存在且加载成功时仍要求 23 类，失败则 `MODEL_READY=False` 而不是打死进程（若当前代码是 `SystemExit`，改为记录错误）。**不要**用 8 类权重对外宣称已就绪。
- `POST /api/analysis/image`：`MODEL_READY` 为假且未开 mock → 503，`message` 说明模型未就绪。
- `POST /login` 对齐 `deploy/api_mock/agriMockCore.cjs`：`password` 匹配或 `code === '2026'`；成功返回 `{ code: 200, token, user }`。
- `GET /monitorPoints`、`GET /weatherReadings` 返回驼峰数组。
- `GET /alerts?_sort=time&_order=desc`；`POST /alerts`；`PATCH /alerts/:id`；`DELETE /alerts/:id`。
- `GET /weatherForecast?pointId=`、`GET /extremeEvents`、`GET /pestRiskPredictions`、`GET /notifications`、`PATCH /notifications/:id`、`GET /droneMissions`、`GET /fields`、`GET /ndviLayers`、`GET /moistureLayers`。

- [ ] **Step 1:** 写失败测例：登录错密码 401；`code=2026` 成功；alerts 按 time 降序。
- [ ] **Step 2:** 实现蓝图并用 `app.register_blueprint`。json-server 风格：列表直接返回数组，不要包 `{data:[]}`（登录除外，登录保持现网 body）。
- [ ] **Step 3:** 改 `prepare_runtime`，并给识图路由加未就绪分支。跑 `python -m pytest tests/test_app_api.py tests/test_biz_api.py -q`。

---

### Task 3: 链 1 纯函数 + SQL 落库

**Files:**
- Create: `ml-bjj/serving/rules/alert_rules.py`、`rule_level_map.py`（hint→warning，alert→high）
- Create: `ml-bjj/serving/rules/persist.py`（`run_chain1`、`dedupe_alerts`、`tick_soil_vwc`）
- Create: `ml-bjj/tests/test_alert_rules.py`、`ml-bjj/tests/test_persist_rules.py`
- Modify: `blueprints/biz.py`：`POST /alerts/evaluate-all`、`GET|PUT /field-sensors/:id/thresholds`

对照：`src/utils/alertRules.ts`、`src/mock/persistRules.ts`、`src/mock/persistRules.test.ts`。

- [ ] **Step 1:** 把 `alertRules.test.ts` 里「未满耐受不报警 / 持续超标报警一次」译成 pytest，先红后绿。
- [ ] **Step 2:** `dedupe`：未处理的同一 `pointId+ruleId+chain` 不插入；`tick_soil_vwc(12.8)` 落在 11–14.5。
- [ ] **Step 3:** `run_chain1`：每点取 `weather_readings` 最大 id → `evaluate_reading` → 更新 `rule_state` → 插入 alerts。事务提交。
- [ ] **Step 4:** `PUT` 阈值按 `point_id` upsert，默认值对齐 `DEFAULT_THRESHOLD_PROFILE`（含 crop / growthStage）。

Run: `python -m pytest tests/test_alert_rules.py tests/test_persist_rules.py -q`

---

### Task 4: 链 2、链 3、自定义衍生接口、60s 调度

**Files:**
- Create: `extreme_weather_rules.py`、`pest_risk_rules.py`、`daily_report.py`、`sensor_readings.py`
- Modify: `agri_derived.py`（ndvi summary、soil trend、disasterRules、moisture/value）
- Modify: `persist.py`（`run_chain2`、`run_chain3`、`publish_alert`、`tick_sensor_simulation`、`run_all_chains`、`append_notifications`）
- Create: `ml-bjj/serving/scheduler.py`
- Modify: `app.py` 在 `__main__` / waitress 启动后 `start_scheduler()`（单线程 `threading.Timer` 或 APScheduler 单 job；**禁止** gunicorn 多 worker 各跑一遍）
- Modify: `biz.py` 补齐方案 §4.1 剩余路由

**Interfaces:**
- 链 2：扫 `weather_forecast`，upsert `extreme_events`（键 `point_id+type+start_at`），alerts 前缀 `[极端天气]`。
- 链 3：按 `fields` 写 `pest_risk_predictions`；高风险 `draft: true`；`POST /alerts/:id/publish` 置 `draft=false`。
- `run_all_chains`：链 1 提交 → 链 2 提交 → 链 3 提交 → 通知；后链失败不回滚前链。
- 60s：先 `tick_sensor_simulation`（监测点 id=2 雄县）再 `run_all_chains`。
- `GET /reports/daily` 返回 `{ markdown }`，文案对齐 `src/utils/dailyReport.ts`。
- `GET /moisture/value?lat=&lng=` 对齐 agriMockCore 最近点。

- [ ] **Step 1:** 移植链 2/3 纯函数，用现有 TS 测例中的关键断言（高温日、去重）。
- [ ] **Step 2:** SQL persist + 蓝图路由。
- [ ] **Step 3:** scheduler 默认开启；`ML_BJJ_DISABLE_SCHEDULER=1` 时测试不打 tick。
- [ ] **Step 4:** `pytest tests/test_biz_api.py tests/test_persist_rules.py tests/test_app_api.py -q`

---

### Task 5: 切流、识病改查库、下线 Mock、文档

**Files:**
- Modify: `vite.config.ts`（`/api`、`/api/analysis`、`/api/treatments` 均 `http://127.0.0.1:5000`；其余 `/api` **rewrite 去掉 `/api`**）
- Modify: `ml-bjj/serving/app.py` 的 `fetch_point_weather`：查 `weather_readings`，删除对 `ML_BJJ_MOCK_ORIGIN:3000` 的依赖
- Modify: `package.json`：`"mock"` 改为打印「请启动 MySQL + Flask :5000，勿再用 json-server 作主后端」后 `exit 1`，或改名为 `mock:legacy` 并在 README 标废弃
- Modify: `src/utils/http.ts` 404 文案（去掉「检查 Mock」）
- Modify: `README.md`、`docs/互联网+/网站/项目启动说明.md`、`docs/互联网+/部署/云服务器部署更新说明.md`
- Modify: [`Flask-MySQL替换Mock方案.md`](../方案/Flask-MySQL替换Mock方案.md) 文首状态改为「编码中/已落地」
- 不删 `deploy/api_mock/`，README 标明归档

**Nginx（云上手工，写入部署文档即可）：**

```nginx
location /api/analysis/ { proxy_pass http://127.0.0.1:5000; }
location /api/treatments/ { proxy_pass http://127.0.0.1:5000; }
location /api/ {
    proxy_pass http://127.0.0.1:5000/;   # 斜杠：去掉 /api 前缀
}
```

宝塔停止 Node 项目 `api_mock`。备份用 `mysqldump`。

- [ ] **Step 1:** 改 Vite；本地 **停 3000** 后：`Flask` + `pnpm dev` → 登录 `13800000000` / 验证码 `2026`。
- [ ] **Step 2:** 手工：地图监测点 → 处理一条预警 → 相关数据存阈值 → 决策页 / 日报。权重未齐时登录仍可用；权重就绪时智能分析可用。
- [ ] **Step 3:** 重启 Flask，预警仍在（MySQL）。
- [ ] **Step 4:** 更新三份启动/部署文档。本机与云上 `DATABASE_URL` 都指向云端 `detect_system`（主机不同），用环境变量，**不要**提交密码。

Run: `pnpm exec vue-tsc --noEmit`（前端应无因迁库产生的新错误）

---

## 验收清单

- [ ] 无 json-server 进程时，登录、监测点、预警 CRUD 可用
- [ ] `POST /alerts/evaluate-all` 与 60s 调度写入 MySQL；刷新页面数据还在
- [ ] 未处理的同一 `pointId+ruleId+chain` 不重复插入
- [ ] 前端路径未为迁库而大改
- [ ] 无 23 类权重时 `:5000` 仍监听；识图返回明确错误
- [ ] `test_app_api.py` 绿；业务 pytest 绿
- [ ] 云上 `mysqldump` 能备份 `detect_system`
- [ ] 密码未出现在 Git diff

## 建议提交顺序（每 Task 一次 commit）

1. `feat(serving): add MySQL models and db.json importer`
2. `feat(serving): serve login and CRUD without model weights`
3. `feat(serving): persist rule chain 1 to MySQL`
4. `feat(serving): port chains 2-3 and 60s scheduler`
5. `feat(web): proxy all /api to Flask and retire json-server`

---

**文档版本**：V1.1（业务只连云端一份 MySQL）  
**最后更新**：2026-08-22  
**维护**：互联网＋项目组
