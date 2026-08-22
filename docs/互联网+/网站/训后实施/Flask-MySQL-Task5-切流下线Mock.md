# Flask-MySQL Task 5：切流、识病改查库、下线 Mock、文档

> 对应计划：[`Flask-MySQL替换Mock实施计划.md`](../实施计划/Flask-MySQL替换Mock实施计划.md) Task 5  
> 状态：✅ 代码与文档已改；云上需手工改 Nginx、停 `api_mock`、Alembic+导入  
> `deploy/api_mock` 是什么见 [`什么是api_mock.md`](../概念/什么是api_mock.md)。

## 子任务解释

前端仍请求 `/api/...`，代理全部进 Flask `:5000`。识病拉墒情改为查 `weather_readings`，不再打 `:3000`。`pnpm mock` 退出并提示改走 Flask。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`vite.config.ts`](../../../../vite.config.ts) | `/api` 目标 `127.0.0.1:5000`，其余去掉 `/api` 前缀 |
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | `fetch_point_weather` 改查 MySQL（识病补温湿墒，不再打 :3000） |
| 修改 | [`package.json`](../../../../package.json) | `mock` 报错退出；`mock:legacy` 保留 json-server |
| 修改 | [`src/utils/http.ts`](../../../../src/utils/http.ts) | 404 文案改为检查 Flask |
| 修改 | [`README.md`](../../../../README.md) | 启动：Flask + `pnpm dev` + `DATABASE_URL` |
| 修改 | [`项目启动说明.md`](../项目启动说明.md) | 两进程 + 云库 |
| 修改 | [`云服务器部署更新说明.md`](../../部署/云服务器部署更新说明.md) | Nginx 全部指 5000 |
| 修改 | [`Flask-MySQL替换Mock方案.md`](../方案/Flask-MySQL替换Mock方案.md) | 状态改为编码已落地 |
| 保留 | [`deploy/api_mock/`](../../../../deploy/api_mock/) | 归档，紧急 `pnpm mock:legacy` |

## 代码内容

Vite：

```ts
'/api': {
  target: 'http://127.0.0.1:5000',
  rewrite: (path) => path.replace(/^\/api/, '')
}
```

识病环境：表单没带 `airTemp` / `airRh` / `soilVwc`、但带了 `pointId` 时，`fetch_point_weather` 取该站 `weather_readings` 中 id 最大一行，交给 P3 叠本次 `level`。失败当没有环境。

```python
for row in session.scalars(select(WeatherReading).where(WeatherReading.point_id == point_id)):
    # 取 id 最大一行的 airTemp / airRh / soilVwc
```

线上 Nginx 须把 `/api/` 的 `proxy_pass` 从 `3000` 改为 `http://127.0.0.1:5000/`（末尾斜杠去掉 `/api` 前缀）。

## 验证

```text
# 本机停掉 3000 后
$env:DATABASE_URL="mysql+pymysql://detect_system:<密码>@82.157.234.123:3306/detect_system"
python ml-bjj\serving\app.py
pnpm dev
# 登录 13800000000 / 验证码 2026
```

云端尚未自动执行：宝塔远程权限、`alembic upgrade head`、导入、改 Nginx、停 Node。
