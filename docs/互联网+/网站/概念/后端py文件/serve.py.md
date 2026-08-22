# serve.py

> 源码：[`ml-bjj/serving/serve.py`](../../../../../ml-bjj/serving/serve.py)  
> Mock 时对应：无（生产用 waitress；Mock 没有这层）  
> waitress / WSGI 见 [`什么是waitress.md`](../什么是waitress.md)、[`什么是WSGI服务器.md`](../什么是WSGI服务器.md)。对照 [`app.py.md`](./app.py.md)。

---

## 一、一句话定义

**`serve.py` 是生产启动脚本。** 调用与 [`app.py`](./app.py.md) 相同的 `prepare_runtime()` 和 `start_scheduler()`，但用 **waitress** 听端口，而不是 Flask 自带的开发服务器。

开发 `python app.py`；云上 / Windows 长期跑 `python serve.py`。应用对象仍是 `app.py` 里的那个 `app`，本文件不新增路由。

---

## 二、和 `app.py` 的区别与联系

**联系：同一份 Flask 应用。** `import app as serving` 之后用 `serving.app`。权重 23 类门闩、60 秒闹钟、识病与业务蓝图都在 `app.py`（及 `biz.py`），本文件只负责「用 waitress 挂上去」。

**区别：开机方式不同，不是第二套后端。**

| | [`app.py`](./app.py.md) 的 `main()` | 本文件 |
|--|-----------------------------------|--------|
| 命令 | `python app.py` | `python serve.py` |
| 听端口 | `app.run`（Flask 开发服务器） | `waitress.serve(..., threads=4)` |
| 适合 | 本机调试 | 云上 / 长期跑 |
| 写路由 | 是 | 否 |

waitress 仍是 **一个进程**。不要再开多个 waitress / 不要和 `app.py` 同时占 5000，否则闹钟会响两遍、预警重复。

---

## 三、小结

**`app.py` 是店；`serve.py` 是换一块更稳的招牌把门开着。店里卖什么不变。**
