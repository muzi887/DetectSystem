# app.py

> 源码：[`ml-bjj/serving/app.py`](../../../../../ml-bjj/serving/app.py)  
> Mock 时对应：识病本就在本文件；业务门牌原先在 [`src/mock/server.ts`](../../../../../src/mock/server.ts)  
> Flask 概念见 [`什么是Flask.md`](../什么是Flask.md)。启动见 [`项目启动说明.md`](../../项目启动说明.md)。

---

## 一、一句话定义

**`app.py` 是 Flask 应用本体。** 它创建 `app`、挂上业务蓝图、提供识病与防治库的 HTTP，并在 `python app.py` 时加载权重、启动 60 秒闹钟、在 5000 端口听请求。

可以把它想成：**大门 + 识病窗口。** 登录/预警窗口在 [`blueprints/biz.py`](./blueprints/biz.py.md) 里，这里 `register_blueprint(biz)` 一并挂上。

---

## 二、它负责什么

| 块 | 作用 |
|----|------|
| `/api/analysis/...` | 上传图片识病、识别记录 CRUD、统计 |
| `/api/treatments/...` | 防治条目 |
| `/health` 等 | 探活、模型是否就绪 |
| `prepare_runtime()` | 找权重；不是 23 类则 **识病不可用**，但业务接口仍可起 |
| `main()` | 开发服务器 + [`start_scheduler()`](./scheduler.py.md) |

识病真正算图的是 [`inference.py`](./inference.py.md)；记录写文件是 [`analysis_store.py`](./analysis_store.py.md)；P3 叠环境是 [`disease_env_rules.py`](./disease_env_rules.py.md)。本文件把它们变成网址。

**`fetch_point_weather`**：识病时按监测点补当前温湿墒。表单已带 `airTemp` / `airRh` / `soilVwc` 就用表单；三个都空但带了 `pointId`，才取该站 `weather_readings` 里 **id 最大** 一行的这三个数，交给 P3 决定要不要抬本次 `level`。不写 `alerts`，不是 2.0 三条链。取不到或未配库返回 `None`，识病照常、不叠环境。迁库前打 Mock `:3000`；现在查同一份 MySQL。

权重未就绪时不要让整站登录失败——门闩已拆开：只把 `MODEL_READY` 关掉，业务蓝图照常。

---

## 三、不负责什么

- 不连 MySQL 的表结构（[`models.py`](./models.py.md)）
- 不实现 `/login` 细节（`biz.py`）
- 不训练模型（`ml-bjj/scripts/train_cls.py`）
- **怎么挂到端口上**：本机调试用下面的 `main()`（`app.run`）；云上 / 长期跑用 [`serve.py`](./serve.py.md)（waitress）。路由仍是本文件里的，不是第二套后端。

---

## 四、和 `serve.py` 的区别与联系

**联系：同一份应用。** `serve.py` 写 `import app as serving`，用的就是本文件里的 `app`、`prepare_runtime()`、以及同一套 [`start_scheduler()`](./scheduler.py.md)。识病、防治库、业务蓝图只在本文件（和 `biz.py`）里。

**区别：谁来听端口。**

| | 本文件 `main()` | [`serve.py`](./serve.py.md) |
|--|----------------|---------------------------|
| 命令 | `python app.py` | `python serve.py` |
| 听端口 | Flask 自带 `app.run` | **waitress**（`threads=4`，仍单进程） |
| 适合 | 本机调试 | 云上 / Windows 长期跑 |
| 路由 / 权重门闩 / 闹钟 | 都有 | 不新增路由；门闩和闹钟复用本文件 |

不要两个一起占 5000。闹钟必须单进程，waitress 也不要再开多个进程。概念见 [`什么是waitress.md`](../什么是waitress.md)。

---

## 五、小结

**`app.py` = Flask 应用本体（路由 + 开发时听端口）。`serve.py` 只换一种开机方式，不另做一套后端。**
