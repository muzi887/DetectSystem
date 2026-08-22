# 什么是 deploy/api_mock

> 面向零基础读者：这个文件夹以前干什么、现在还能不能当主后端。  
> Mock 概念与 `src/mock` 四文件见 [`什么是Mock.md`](./什么是Mock.md)。切流见 [`Flask-MySQL-Task5-切流下线Mock.md`](../训后实施/Flask-MySQL-Task5-切流下线Mock.md)。

---

## 一、一句话定义

**`deploy/api_mock/` 是给宝塔用的「线上 Mock 部署包」。** 把本地那套 json-server 业务后端打成 Node 能直接 `npm start` 的目录，上传到服务器 `/www/wwwroot/DetectSystem/api_mock/`，在 **3000** 端口提供登录、预警、监测点等接口。

它 **不是** 新写的一套业务，而是 `src/mock` 的 **CJS 副本**（宝塔跑的是 JavaScript，不能直接执行 TypeScript）。识病从来不是它的活，识病走 Flask `:5000`。

切流之后：**日常主后端是 Flask + MySQL**。本目录留下作归档；只有紧急演示才 `pnpm mock:legacy`，云上应 **停止** 宝塔 Node 项目 `api_mock`。

可以把它想成：**以前往云上寄的那只假数据库快递箱。** 箱子还在仓库里，但网站不该再走这只箱子。

---

## 二、它解决过什么问题

本机开发：`pnpm mock` 跑 `src/mock/server.ts`（tsx 执行 TypeScript）。

云上宝塔：**没有 tsx 那条开发链**，需要一份「拷上去就能 `node server.js`」的包。所以单独放 `deploy/api_mock/`：

```text
浏览器
    → Nginx /api（曾经）→ 127.0.0.1:3000  api_mock（业务 JSON）
    → Nginx /api/analysis     → 127.0.0.1:5000  Flask（识病）
```

本地改 `src/mock/db.json` 后要 `pnpm run sync:mock-db`，把约定字段拷到本目录的 `db.json`，再上传覆盖服务器。只改 JSON 不够：自定义路由在 `server.js`，算法在 `.cjs`，那些要手工与 `src/mock/server.ts` 对齐后上传并 **重启 Node 项目**。

---

## 三、目录里有什么

| 文件 | 角色 | 对标（开发侧） |
|------|------|----------------|
| `package.json` | 依赖 `json-server`，`npm start` → `node server.js` | 根目录 `pnpm mock`（现已改为提示走 Flask） |
| `server.js` | 听 3000：自定义路由 + json-server CRUD | `src/mock/server.ts` |
| `db.json` | 假库快照 | `src/mock/db.json` |
| `agriMockCore.cjs` | 登录、NDVI 摘要、墒情趋势、瞬时灾害评估（不写预警） | 现 Flask：[`agri_derived.py`](./后端py文件/rules/agri_derived.py.md) |
| `ruleChainRunner.cjs` | 三条链落库、60 秒抖动、日报、读数过滤 | 现 Flask：[`persist.py`](./后端py文件/rules/persist.py.md) 等 |

`.cjs` 是 CommonJS，好让 `server.js` 和本机 `server.ts` 都能 `require` 同一份 `agriMockCore.cjs`，避免登录算法写成两套。

---

## 四、现在怎么对待它

| 场景 | 该不该用 |
|------|----------|
| 本机日常开发 | **不用。** `DATABASE_URL` + Flask `:5000` + `pnpm dev` |
| 云上正式站 | **停掉** Node 项目 `api_mock`，Nginx 全部 `/api` 转 Flask |
| 紧急演示、无库 | `pnpm mock:legacy`（仍读这份思路的 json-server） |
| 软著/对照旧接口 | 可当归档读，口径已迁到 `ml-bjj/serving` |

不要两套后端同时写业务数据：一边改 MySQL、一边再起 3000 写 `db.json`，页面会串。

种子灌进真库用的是 `src/mock/db.json` + [`import_db_json.py`](./后端py文件/import_db_json.py.md)，不是在服务器上再跑本目录的 `node server.js`。

---

## 五、小结

| 要点 | 说明 |
|------|------|
| **本质** | 宝塔用的 json-server 部署包（CJS） |
| **曾经** | 线上业务 API，端口 3000 |
| **现在** | 归档；主路径是 Flask + MySQL |
| **一句话** | `deploy/api_mock` = 给云上寄的假后端；假后端下线后箱子留着备用，不再当主库 |

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是Mock.md`](./什么是Mock.md) | Mock 是什么；`src/mock` 四文件 |
| [`Flask-MySQL-Task5-切流下线Mock.md`](../训后实施/Flask-MySQL-Task5-切流下线Mock.md) | 为何停 3000、代理改 5000 |
| [`项目启动说明.md`](../项目启动说明.md) | 当前启动方式（不要 `pnpm mock`） |
| [`云服务器部署更新说明.md`](../../部署/云服务器部署更新说明.md) | 停 `api_mock`；紧急才回档位 B |
| [`后端py文件/README.md`](./后端py文件/README.md) | 现 Flask 文件与 Mock 的对照表 |
