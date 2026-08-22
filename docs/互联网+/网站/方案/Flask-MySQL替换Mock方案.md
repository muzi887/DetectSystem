# Flask + MySQL 替换 Mock 后端

> **目标**：把 `json-server` + `src/mock/db.json` 换成「扩展后的 Flask + MySQL」。浏览器仍打 `/api/...`，后面只剩 Flask `:5000` 与真库。  
> **相对旧文**：[`假数据库迁真库方案.md`](./假数据库迁真库方案.md) 曾建议 Node 听 3000 再连 MySQL。**本文取代该实现路径**：业务接口扩到现有 Flask，不再保留 json-server 作主后端。旧文的表拆分、API 兼容、规则链事务思路仍沿用。  
> **范围**：登录、监测点、预警 CRUD、自定义路由、三条规则链、60 秒调度全部进 MySQL。识病记录第一期仍用 `ml-bjj/serving/analysis_store.py` 的 JSON，不与业务库合并。  
> **状态**：编码已落地（pytest 绿）。云端空库需执行 Alembic + `import_db_json.py`，Nginx 按第七节切到 5000 并停 `api_mock`。软著说明书 / 源程序导出仍需另改 `scripts/add_code_to_docx.py`。

---

## 一、为什么要换

审查员口头口径是：交上去的代码几乎全是前端，体现不出后端原创性；假后端不行。

现状是两路服务：

```text
浏览器 / Vite
    ├─ /api/analysis/*、/api/treatments/*  →  Flask :5000（真识病）
    └─ /api 其余（去掉 /api 前缀）         →  json-server :3000（db.json）
                                              Flask 识病时还会回打 :3000 取墒情
```

`pnpm mock` 起的是现成工具，按 JSON 文件自动生成 REST，不是你们写的业务服务。只装 MySQL、页面仍打 json-server，审查员看到的还是假后端。

目标：

```text
浏览器 / Vite
    └─ 全部 /api  →  Flask :5000
                        ├─ 识病（权重就绪才推理）
                        └─ 登录 / 监测 / 预警 / 规则链  →  MySQL detect_system
```

换掉 json-server，不是删掉它就结束：必须有 Flask 接住原来的请求。

---

## 二、约束（实现时不要破）

1. **前端路径尽量不变。** `src/utils/http.ts` 的 `baseURL` 仍是 `/api`。Vite 保持「`/api/analysis`、`/api/treatments` 原样转发；其余 `/api` 去掉前缀」。两边都改指向 `127.0.0.1:5000`。Flask 业务路由注册为 `/login`、`/monitorPoints`、`/alerts`……与现在 json-server 一致；识病仍是 `/api/analysis/...`。
2. **启动门闩拆开。** 现在 `ml-bjj/serving/app.py` 权重不是 23 类就 `SystemExit`，整站登录也会死。业务蓝图必须在无权重时也能起；仅识图接口在模型未就绪时返回明确错误。**不要放宽 23 类校验本身。**
3. **调度单进程。** 60 秒 tick 只能一个 worker（与现 Mock 的 `setInterval` 相同）。本地 `python app.py` / waitress 单进程即可。
4. **规则算法不改口径。** `evaluateReading` 等纯函数迁到 Python，行为与现 TS 单测对齐；迁库时不要改阈值含义。
5. **继续兼容 json-server 查询。** `GET /alerts?_sort=time&_order=desc`、`GET /weatherForecast?pointId=` 仍可用。不要让浏览器直连 MySQL。
6. **先不做：** Spring / Django、浏览器 JDBC、合并 Flask 用户与识病账号、栅格大文件进库、重训模型。

---

## 三、目标架构

```text
浏览器 / Vite 代理（路径不变：/monitorPoints /alerts /login …）
        ↓
Flask :5000（ml-bjj/serving，扩展业务蓝图）
        ├── /api/analysis/*、/api/treatments/*   识病（权重可选）
        ├── /login、/alerts、规则链、60s 调度      自研业务接口
        └── SQLAlchemy / PyMySQL
                ↓
        MySQL：detect_system
                ├── users / monitor_points / alerts / …
                └── 规则链：rule_state、weather_readings、weather_forecast、…

识病历史（第一期）仍写 analysis_records.json，不进本库。
```

不要让浏览器直连数据库。不要把 3000 和 5000 合成两个互相依赖的 Mock。

[`app.py`](../概念/后端py文件/app.py.md) 里的 **`fetch_point_weather`**：识病时若表单没带温湿墒、只带了 `pointId`，按监测点取最新墒情给 P3 叠级别。原先向 `ML_BJJ_MOCK_ORIGIN`（`:3000`）打 HTTP，**已改为**查同库 `weather_readings`，Flask 不再回打 Mock。见 [Task 5](../训后实施/Flask-MySQL-Task5-切流下线Mock.md)。

---

## 四、扩展 Flask：文件与接口

在 `ml-bjj/serving/` 增加模块，不要把全部 CRUD 堆进 `app.py`。

| 建议文件 | 职责 |
|----------|------|
| [`db.py`](../../../../ml-bjj/serving/db.py)（说明见 [`db.py.md`](../概念/后端py文件/db.py.md)） | 连接池，读 `DATABASE_URL` |
| [`models.py`](../../../../ml-bjj/serving/models.py)（说明见 [`models.py.md`](../概念/后端py文件/models.py.md)） | 15 张表；`to_camel()` |
| 表访问层 | 驼峰 JSON ↔ 蛇形列 |
| `blueprints/biz.py`（说明见 [`biz.py.md`](../概念/后端py文件/blueprints/biz.py.md)） | 登录与业务 REST |
| `rules/*.py`（说明见 [索引](../概念/后端py文件/README.md)） | 从现有 TS 移植的纯函数 + SQL 落库 |
| [`scheduler.py`](../../../../ml-bjj/serving/scheduler.py)（说明见 [`scheduler.py.md`](../概念/后端py文件/scheduler.py.md)） | 60s tick + 分事务跑三条链 |
| `ml-bjj/scripts/import_db_json.py`（说明见 [`import_db_json.py.md`](../概念/后端py文件/import_db_json.py.md)） | 读 `src/mock/db.json` 导入 |

依赖写入 `ml-bjj/requirements.txt`：`PyMySQL` + `SQLAlchemy` 2；表结构用 **Alembic**。

### 4.1 自定义路由（现 `src/mock/server.ts` 手写部分）

对照 `deploy/api_mock/agriMockCore.cjs` 与 `persistRules.ts`，口径保持一致。

| 方法 | 路径 | 行为 |
|------|------|------|
| POST | `/login` | 对齐 `handleFarmLogin`：密码或演示码 `2026` |
| GET | `/ndvi/summary` | 对齐 `buildNdviSummary` |
| GET | `/soilMoisture/trend` | 对齐 `buildSoilMoistureTrend` |
| POST | `/disasterRules/evaluate` | 对齐 `evaluateDisasterRules` |
| POST | `/alerts/evaluate-all` | 链 1，写 MySQL |
| POST | `/weather/extreme-events/evaluate` | 链 2 |
| POST | `/pest-risk/evaluate` | 链 3 |
| POST | `/alerts/:id/publish` | `draft=false` |
| GET / PUT | `/field-sensors/:pointId/thresholds` | 阈值档案 |
| GET | `/field-sensors/:pointId/readings` | 传感历史，支持 `from`/`to` |
| GET | `/reports/daily` | 真日报 markdown |
| GET | `/moisture/value` | 最近点墒情，`lat`/`lng` |

### 4.2 原 json-server 自动 REST（前端实际在用）

只实现前端打到的集合，不要把整库自动暴露一遍。

| 方法 | 路径 | 备注 |
|------|------|------|
| GET | `/monitorPoints` | |
| GET | `/weatherReadings` | |
| GET / POST | `/alerts` | 列表支持 `_sort=time&_order=desc` |
| PATCH / DELETE | `/alerts/:id` | |
| GET | `/weatherForecast` | 支持 `?pointId=` |
| GET | `/extremeEvents` | |
| GET | `/pestRiskPredictions` | |
| GET | `/notifications` | |
| PATCH | `/notifications/:id` | `{ read: true }` |
| GET | `/droneMissions` | |
| GET | `/fields` | |
| GET | `/ndviLayers` | |
| GET | `/moistureLayers` | |

---

## 五、使用 MySQL

### 5.0 云端宝塔（2026-08-22 已建空库）

腾讯云服务器宝塔 → 数据库 → MySQL，**不要占用**已有的 `treescan_db` / `iot_db` / `newiot` / `qp_db` / `test1`。已为本项目单独添加：

| 项 | 值 |
|----|-----|
| 数据库名 | `detect_system` |
| 用户名 | `detect_system` |
| 数据库位置 | 本地数据库（相对云服务器 = `127.0.0.1`） |
| 备注 | `detect_system` |

密码只存在宝塔面板与环境变量里，**禁止写入 Git / 说明书 / 源程序 Word**。**业务只使用这一份云端库**，不另装本机 MySQL / Docker，不建第二套 `detect_system`。

| 谁在连 | `DATABASE_URL` 主机 |
|--------|---------------------|
| 云上 Flask（与宝塔同机） | `127.0.0.1` |
| 本机 Flask（笔记本开发） | 云服务器公网 IP（现网 `82.157.234.123`） |

```text
# 云上 Flask
DATABASE_URL=mysql+pymysql://detect_system:<宝塔中的密码>@127.0.0.1:3306/detect_system

# 本机 Flask（同一份库）
DATABASE_URL=mysql+pymysql://detect_system:<宝塔中的密码>@82.157.234.123:3306/detect_system
```

未配置 `DATABASE_URL` 时 Flask **明确报错**，不要默默再去读 `db.json` 当主库。

本机要连上云库，还需：

1. 宝塔该库 → **权限**：允许开发机公网 IP（或临时 `%`，答辩后改回 IP）。现在标注「本地数据库」只表示库在服务器上，默认往往只许 `127.0.0.1`。
2. 腾讯云安全组 + 宝塔防火墙放行 **3306**（仅你的 IP 更稳）。
3. 浏览器仍然只打网站 `/api`，**不要**让前端直连 3306。

本机改预警、导入 `db.json`、规则链 tick，写的都是线上同一份数据。导入或清空前先在宝塔点备份。

- 接口 JSON 仍返回驼峰；表名蛇形。
- 当前空库还没有表，下一步才是 Alembic 建表 + 导入 `db.json`（对这一份云库执行）。
- pytest 可用内存 SQLite 隔离，那不是业务库，不算「第二份 MySQL」。

### 5.1 表与 `db.json` 键

| 现 `db.json` 键 | 建议表名 | 备注 |
|-----------------|----------|------|
| `users` | `users` | 第一期可仍存明文密码，二期再 `password_hash` |
| `monitorPoints` | `monitor_points` | `id` 整型主键 |
| `weatherReadings` | `weather_readings` | `point_id`；链 1 取每点 `id` 最大一行 |
| `alerts` | `alerts` | `time` 用 BIGINT 毫秒；`field_id` 字符串 |
| `fields` | `fields` | `id` VARCHAR，`monitor_point_id` |
| `ndviLayers` / `moistureLayers` | `ndvi_layers` / `moisture_layers` | |
| `thresholdProfiles` | `threshold_profiles` | `point_id` 唯一 |
| `ruleState` | `rule_state` | 联合唯一 `(point_id, rule_id)` |
| `weatherForecast` | `weather_forecast` | 一行一天，或 `days` 用 JSON 列 |
| `extremeEvents` | `extreme_events` | 去重键 `point_id + type + start_at` |
| `pestRiskPredictions` | `pest_risk_predictions` | `factors` 用 JSON 列 |
| `notifications` | `notifications` | |
| `droneMissions` | `drone_missions` | |
| `sensorReadings` | `sensor_readings` | |

索引：`alerts(handled, draft, point_id)`、`alerts(time)`。

规则链去重：未 `handled` 的 `(point_id, rule_id, chain)` 做成条件唯一或插入前 SELECT。`handled=1` 之后允许再插入同类规则。

### 5.2 种子

`import_db_json.py` 读现网 `src/mock/db.json`，按 id upsert；可重复跑则先清空或 upsert。验收：停掉 `:3000`、不依赖 `db.json` 作运行时存储，登录/监测点/预警仍可用；重启 Flask 数据还在。

---

## 六、规则链与 60 秒调度

移植时 **纯函数保持可单测**，落库改成按表读写，不要再读整份 JSON 写回。

| 现实现 | 迁到 |
|--------|------|
| `src/utils/alertRules.ts` | 链 1 Python |
| `src/utils/extremeWeatherRules.ts` | 链 2 |
| `src/utils/pestRiskRules.ts` | 链 3 |
| `src/mock/persistRules.ts` 的 `runChain1/2/3OnDb`、`tickSensorSimulation`、`publishAlert` | SQL 版 persist |
| `src/utils/dailyReport.ts`、`filterReadings`、agriMockCore 摘要/最近点 | Python 同口径 |

调度：Flask 启动后每 60s：墒情抖动（现对监测点 id=2 雄县 `tickSoilVwc`）→ `run_all_chains`。链与链 **分事务提交**（链 3 失败不回滚链 1）。

用现有 `src/mock/persistRules.test.ts` 夹具做 Python pytest，对比同一输入是否同样插入/去重。

`evaluateReading` / `detectHits` 等不要在 Python 里改阈值语义；前端若仍引用 TS 副本，两边保持一致即可。

---

## 七、下线 json-server（换掉，不是只删）

### 7.1 本地

1. `vite.config.ts`：`/api` 的 `target` 从 `localhost:3000` 改为 `127.0.0.1:5000`；`/api/analysis`、`/api/treatments` 同样指向 5000。
2. `package.json` 的 `pnpm mock`：改为提示「请起 Flask + MySQL」，或只保留导入种子；**禁止再作为主后端**。
3. 开发启动顺序：**本机 Flask `:5000`（`DATABASE_URL` 指向云端库）→ `pnpm dev`**。不再需要本机 MySQL，也不再需要 `pnpm mock`。

### 7.2 线上 Nginx

现网（见 [`../../部署/云服务器部署更新说明.md`](../../部署/云服务器部署更新说明.md)）是 `/api/analysis/` → 5000、其余 `/api/` → 3000。落地后：

- `/api/analysis/`、`/api/treatments/` → `127.0.0.1:5000`（不变）
- 其余 `/api/` → **也改为** `127.0.0.1:5000`，**继续去掉 `/api` 前缀**（与现 Mock 一致，否则 `/api/login` 对不上 Flask 的 `/login`）
- 宝塔 **停止 Node 项目 `api_mock`**
- 备份改 `mysqldump`，不再 scp `db.json` 当主数据

`deploy/api_mock/` 可留作归档，README 标明已废弃。

---

## 八、分步落地顺序

编码时按此顺序，每步可单独验收。

### 步骤 0：库与迁移

- [x] **云端宝塔空库已建**（2026-08-22）：库名/用户 `detect_system`，本机 MySQL，见 [§5.0](#50-云端宝塔2026-08-22-已建空库)。**只此一份，本机不另建库。**
- [ ] 宝塔「权限」允许开发机 IP 远程连接；安全组放行 3306。
- [ ] Alembic 初始迁移：按 §5.1 **对云端空库**建表。
- [ ] 写导入脚本，对云端库导入 `db.json`。`DATABASE_URL` 未配置时业务接口返回明确错误。

### 步骤 1：Flask 业务蓝图 + 启动拆门闩

- 注册登录与 REST（可先读库、规则链返回空实现）。
- `app.py`：无 23 类权重也能起进程；识图接口单独失败。
- 验收：`POST /login`、`GET /monitorPoints`、`GET /alerts?_sort=time&_order=desc`。

### 步骤 2：写得最凶的表 + 链 1

优先：`alerts`、`rule_state`、`weather_readings`、`threshold_profiles`。  
`runChain1OnDb` 改为事务：读最新墒情 → `evaluateReading` → 写 state + 插入 alerts。

### 步骤 3：链 2 / 链 3 与 60s

`weather_forecast`、`extreme_events`、`pest_risk_predictions`、`fields`、`ndvi_layers`。调度接入。链间分提交。

### 步骤 4：用户、监测点、其余只读集合

登录查 `users`。`notifications`、`drone_missions`、`sensor_readings`、日报、NDVI 摘要、最近点墒情。

### 步骤 5：切代理、下线 Mock

改 Vite / Nginx，停 3000。`fetch_point_weather` 改查库。

### 步骤 6（可选，非本期必做）

`analysis_records.json` 迁同一实例另一库或同库 `analysis_records`。不是把 3000 和 5000 合成一个历史包袱。

---

## 九、验收

### 9.1 自动化

- Flask `test_client`：登录成功/失败、预警 CRUD 与排序、链 1 去重、`DATABASE_URL` 缺失时报错。
- 现有 `ml-bjj/tests/test_app_api.py` 识病测例保持绿。
- 规则 pytest 与 `persistRules.test.ts` 夹具口径一致。

### 9.2 手工（停掉 `:3000` 之后）

- 登录 → 地图监测点 → 预警中心处理一条 → 相关数据保存阈值 → 决策页 / 日报。
- 智能分析：权重就绪时能识图；权重未齐时登录与监测仍可用。
- 重启 Flask 后预警与监测点仍在（MySQL，不是 `db.json`）。

### 9.3 文档（编码完成后改，勿大面积改小挑旧笔记）

- `README.md` 启动说明：MySQL + Flask + `pnpm dev`。
- 本文状态改为已落地；[`假数据库迁真库方案.md`](./假数据库迁真库方案.md) 文首指向本文。
- [`../../部署/云服务器部署更新说明.md`](../../部署/云服务器部署更新说明.md) 反代目标改为 5000，去掉「必须起 Node Mock」。

---

## 十、与竞赛、软著的关系

| 场景 | 要不要先做本文 |
|------|----------------|
| 互联网＋答辩演示 | 不必。迁库期间可用现有 Mock 讲故事；切 Nginx 前先在本地把 Vue 对 Flask 跑通。 |
| 软著补正（电话：假后端 / 全是前端） | **要。** 落地后源程序应导 Flask 业务蓝图 + 规则 Python + 识病 serving，而不是 Vue + `src/mock/server.ts`。模型权重文件不算源程序。 |
| 只改说明书、不换架构 | 书面通知是「说明书与源程序一致」；电话已否定 json-server。只改文档过关无把握。 |

比赛和软著不是同一套标准。本文解决的是软著要的「自己的后端 + 真库」，不是 2.0 规划里尚未完成的真气象 API、插值热力图、23 类权重重训。

---

## 十一、明确先不做

- 浏览器直连 MySQL
- 用 Django / Spring 重写
- 第一期合并识病用户与 `users` 表
- 把 NDVI 栅格塞进数据库（表里只存元数据）
- 为迁库重训模型或改智能分析页布局
- 放宽 Flask 23 类权重校验（只拆「无权重则整进程退出」）

---

## 十二、相关文档

| 文档 | 关系 |
|------|------|
| [`../实施计划/Flask-MySQL替换Mock实施计划.md`](../实施计划/Flask-MySQL替换Mock实施计划.md) | 编码拆 Task |
| [`../训后实施/Flask-MySQL-Task1-连接表结构导入.md`](../训后实施/Flask-MySQL-Task1-连接表结构导入.md) | Task 1 说明 |
| [`假数据库迁真库方案.md`](./假数据库迁真库方案.md) | 旧路径（Node:3000）；表设计与 API 兼容仍参考；**实现以本文为准** |
| [`什么是Mock.md`](../概念/什么是Mock.md) | 为何曾用假库 |
| [`规则链建模与实现方案.md`](./规则链建模与实现方案.md) | 链语义；迁库只换存储 |
| [`../../部署/云服务器部署更新说明.md`](../../部署/云服务器部署更新说明.md) | 现网仍是 `api_mock`；切流后改本文第七节 |
| [`../项目启动说明.md`](../项目启动说明.md) | 现为三进程；落地后改为 MySQL + Flask + Vite |

---

**文档版本**：V1.2（业务只连云端一份 `detect_system`）  
**最后更新**：2026-08-22  
**维护**：互联网＋项目组
