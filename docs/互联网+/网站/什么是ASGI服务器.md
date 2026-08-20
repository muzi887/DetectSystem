# 什么是 ASGI 服务器

> 说明 WSGI 的后继约定：异步、长连接。本仓库推理服务 **不用** ASGI。  
> WSGI 本身见 [`什么是WSGI服务器.md`](./什么是WSGI服务器.md)，本文不重复插头比喻的展开。

---

## 一、一句话

**ASGI**（Asynchronous Server Gateway Interface）是 Python 里 **接在 WSGI 后面的一套接口约定**：同样分开「听端口的服务器」和「网页应用」，但按 **异步** 来传请求，并支持 WebSocket、服务端推送这类一次连接上多来回的通信。

**ASGI 服务器** 按这条约定托管应用。常见名字：Uvicorn、Daphne、Hypercorn。常见应用：FastAPI、Starlette、Django 的 ASGI 模式。

---

## 二、相对 WSGI 多了什么

WSGI 的模型基本是：**来一个请求，应用算完，返回，连接的这一趟就结束。** 适合本项目「上传图片 → JSON 病名」。

ASGI 额外约定了：

- 应用可以是 **async** 函数，等待磁盘或网络时不把整个线程卡死；
- 同一次连接上可以有多次消息（**WebSocket**、HTTP/2 推送等）。

```text
浏览器  --HTTP 或 WebSocket-->  ASGI 服务器（uvicorn 等）
                                    --ASGI 约定-->  FastAPI / Starlette 等
```

Flask 经典写法是同步 WSGI。若要 WebSocket，需要另接扩展，或换 ASGI 栈。本项目智能分析没有长连接推流，**继续 WSGI + waitress 即可**。

---

## 三、两句话分清

| | 典型例子 | 职责 |
|--|----------|------|
| **ASGI 应用** | FastAPI 的 `app` | 路由、业务（可 async） |
| **ASGI 服务器** | uvicorn | 占端口，按 ASGI 调用 `app` |

和 WSGI 一样：换 uvicorn 或 daphne **不等于** 换识别模型。本仓库没有这条链。

---

## 四、C# 里没有同名的「ASGI」

.NET 不单独流行一套叫 ASGI 的规格。异步 HTTP 和长连接已经做进 **ASP.NET Core**：应用里 `async` 接口 + **Kestrel** 托管。要对标的是「异步的 Kestrel + ASP.NET」，不是再找一个 Python 式的第二插头名字。更细的 C# 对照写在 [`什么是WSGI服务器.md`](./什么是WSGI服务器.md) 第五节。

---

## 五、它不是什么

- 不是「更新的 Flask」。Flask 仍是 WSGI 框架；FastAPI 才是常见的 ASGI 框架。
- 不是更快的 PyTorch。换 ASGI 不会让分类更准。
- 不是 Nginx。外层反向代理仍然可以是 Nginx。

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是WSGI服务器.md`](./什么是WSGI服务器.md) | 本项目实际使用的约定；含 C# 对照 |
| [`什么是waitress.md`](./什么是waitress.md) | 选用的 WSGI 服务器 |
| [`什么是Flask.md`](./什么是Flask.md) | 本项目的 WSGI 应用 |

---

## 七、小结

**ASGI = 面向异步和 WebSocket 的 Python 插头；ASGI 服务器 = 按这根插头听端口的程序。本仓库推理服务用 WSGI，不需要换成 ASGI。**
