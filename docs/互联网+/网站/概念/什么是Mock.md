# 什么是 Mock（本项目的业务后端）

> 先说明 Mock 是什么、为什么用，再说明 `src/mock` 四个文件。  
> 链 1 纯函数见 [`链1-alertRules三文件说明.md`](./链1-alertRules三文件说明.md)。本文不贴 `db.json` 全文。

---

## 一、Mock 是什么

**Mock** 一般指「假装的后端」：还没有正规数据库时，用一份数据和一套 HTTP 接口，让网页先能登录、列表、增删。

本仓库里它不仅是开发玩具。登录、监测点、预警、规则链落库，实际都跑在 **Node 端口 3000**（`pnpm mock`）。识病才走 Flask:5000。文档叫 Mock，是相对「MySQL + 完整鉴权」而言；**线上宝塔同样把 `/api/*` 反代到这份 Node**。

可以把它想成：**用 JSON 文件假装数据库的网站接口。** json-server 把 `db.json` 里每个顶层键变成 REST；规则链算完也写进同一份文件，不写进 Python。

```text
网页（一般 5173）
    → /api 多数转到 :3000  →  Mock（业务）
    → /api/analysis 转到 :5000 →  Flask（识病）
```

---

## 二、为什么用 Mock

| 原因 | 含义 |
|------|------|
| 先有页面、后有库 | 不必先装 MySQL 就能演示登录和预警 |
| 竞赛好带 | 拷仓库、`pnpm mock` 即可，评委机器不一定有数据库 |
| 和 AI 拆开 | PyTorch 不能塞进 json-server；业务 CRUD 用轻量 Node |
| 种子好改 | 雄县墒情、高温预报直接改 json，立刻能看到自动预警 |
| 接口形状先定死 | 仍是 `/alerts`、`/login`，以后换真库前端可以几乎不动 |

它解决「尽快把站跑通」。多人同时写、按表备份、密码安全，要靠以后的真库，见 [`假数据库迁真库方案.md`](../方案/假数据库迁真库方案.md)。

同仓库 `deploy/api_mock/` 是宝塔上的 CJS 副本，规则表要与 `src/mock` 对齐。改了开发用的 `db.json` 后需 `pnpm run sync:mock-db`。

---

## 三、`src/mock` 四个文件

| 文件 | 角色 |
|------|------|
| `db.json` | **假数据库**：用户、监测点、预警、气象读数等 |
| `server.ts` | **门牌**：听 3000 端口；每 60 秒跑规则链 |
| `persistRules.ts` | **胶水**：调用纯函数，去重编号后写进 db |
| `persistRules.test.ts` | 只测胶水，不启动服务器 |

### 3.1 `db.json`

顶层每个键是一张「表」。json-server 把 `/alerts`、`/monitorPoints` 等映射到这些数组。

| 键 | 用途 |
|----|------|
| `users` / `monitorPoints` / `alerts` / `fields` | 登录、地图点、预警、地块 |
| `weatherReadings` | 链 1 用每个点 id 最大的那条温湿墒 |
| `ruleState` | 链 1 记事本 |
| `thresholdProfiles` | 自定义阈值；空则用代码默认 |
| `weatherForecast` | 7 日预报（链 2 / 3） |
| `extremeEvents` / `pestRiskPredictions` | 链 2 事件、链 3 风险分 |
| `ndviLayers` 等 | 遥感 |

不要边开 Mock 边手改文件，容易被写回覆盖。雄县（`pointId: 2`）墒情偏低，便于链 1 演示。

`rules.ts` 里的类型不必都出现在 json 里：有的是计算中间结果（如 `RuleHit`），有的是从 `weatherReadings` 抽出的窄结构（`SensorSnapshot`）。

### 3.2 `server.ts`

先注册自定义路由，最后 `server.use(router)` 才把其余 CRUD 交给 json-server。

**仍交给 `agriMockCore.cjs`（多数不写规则链状态）：** 登录、NDVI、墒情趋势；`POST /disasterRules/evaluate` 当场比温湿、**不写 `alerts`**。

**规则链落库：**

| 路径 | 调用 | 说明 |
|------|------|------|
| `POST /alerts/evaluate-all` | **只** `runChain1OnDb` | 名字像「全部」，实际只跑链 1 |
| `POST /weather/extreme-events/evaluate` | `runChain2OnDb` | 链 2 |
| `POST /pest-risk/evaluate` | `runChain3OnDb` | 链 3 |
| `POST /alerts/:id/publish` | `publishAlert` | 草稿改正式 |
| `GET/PUT /field-sensors/:pointId/thresholds` | 阈值 | |

**60 秒闹钟：** 微调雄县墒情 → **`runAllChains`（链 1→2→3）** → 写回 json。三条一起转靠闹钟，不靠 evaluate-all。

### 3.3 `persistRules.ts`

纯函数只回答「该不该新建预警」，没有 id、不知道库里已有哪些行。本文件补上写库。

辅助：`nextAlertId`、`dedupeAlerts`（未处理的同一 `pointId+ruleId+chain` 不重复插）、墒情微调、`publishAlert`、`profileForPoint`。

**三条链的落库入口 + 总闸：**

| 函数 | 对应 | 人话 |
|------|------|------|
| `runChain1OnDb` | 链 1 | 最新墒情/气温 → `evaluateReading` → 写 `[自动预警]` |
| `runChain2OnDb` | 链 2 | 扫预报 → `[极端天气]` |
| `runChain3OnDb` | 链 3 | 凑分；高风险才可能写 `[虫情风险]` 草稿 |
| `runAllChains` | 调度，不是第四条链 | 1→2→3，给闹钟调用 |

算法仍在 `evaluateReading` / `evaluateForecast` / `evaluatePestRisk`；这里只取数、调函数、去重写回。

### 3.4 `persistRules.test.ts`

不启动 3000。检查去重、新 id、墒情仍在干旱带。耐受测试在 `alertRules.test.ts`。

---

## 四、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是Flask.md`](./什么是Flask.md) | 识病走 5000 |
| [`什么是规则链.md`](./什么是规则链.md) | Mock 三条链 vs P3 |
| [`链1-alertRules三文件说明.md`](./链1-alertRules三文件说明.md) | 链 1 还不写库 |
| [`假数据库迁真库方案.md`](../方案/假数据库迁真库方案.md) | 换成 MySQL 怎么走 |
| [`项目启动说明.md`](../项目启动说明.md) | `pnpm mock` |

---

## 五、小结

| 说法 | 含义 |
|------|------|
| Mock | 本项目的业务 HTTP 后端：JSON 当库，端口 3000 |
| 为什么用 | 先跑通网站和规则链，不绑死数据库 |
| `src/mock` | 开发用的假库、门牌、规则链落库胶水 |
