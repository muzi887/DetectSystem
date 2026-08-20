# 什么是 WSGI 服务器

> 说明 Python 里「听端口的程序」和「Flask 应用」之间的约定叫什么。  
> waitress / gunicorn 怎么选、本仓库怎么启动，见 [`什么是waitress.md`](./什么是waitress.md) 与 P3 计划，本文不重复。

---

## 一、一句话

**WSGI**（Web Server Gateway Interface）是 Python 的一项 **接口约定**：规定「接待 HTTP 的服务器」要怎样把一次请求交给「Python 网页应用」，应用又怎样把响应交回去。

**WSGI 服务器** 就是按这条约定实现的托管程序：在端口上收浏览器请求，转成 WSGI 调用，再把应用返回的内容写成 HTTP 响应。

Waitress、gunicorn，以及 Flask 调试用的 `app.run()`（底层 Werkzeug）都是 WSGI 服务器（或自带了一个）。Flask 的 `app` 则是 **WSGI 应用**——被调用的那一端。

---

## 二、为什么需要这层约定

浏览器只懂 HTTP。Python 函数只懂参数和返回值。中间要有人：

1. 听 5000 端口、拆开 HTTP 报文；
2. 用一种固定方式叫醒 Flask；
3. 把 Flask 的返回再封成 HTTP 发回去。

若每个框架和每个服务器都私自约定一套，Flask 就只能绑死某一种服务器。WSGI 把插头标准化：**同一个 `app` 可以换 waitress 或 gunicorn，不必改路由代码。**

可以把它想成电源规格：插座（服务器）和电器（Flask）都遵守同一套脚位，才能互换品牌。

```text
浏览器  --HTTP-->  WSGI 服务器（waitress / gunicorn / app.run）
                        --WSGI 约定-->  Flask app（路由、jsonify、调推理）
```

---

## 三、两句话分清「应用」和「服务器」

| | 本项目里 | 职责 |
|--|----------|------|
| **WSGI 应用** | `app.py` 里的 `app = Flask(__name__)` | 这个网址干什么、回什么 JSON |
| **WSGI 服务器** | waitress、gunicorn、或调试时的 `app.run` | 占端口、管连接、按约定调用 `app` |

换服务器不等于换框架：P3 生产改 waitress，智能分析的 `@app.route` 仍然是那些。

---

## 四、它不是什么

- 不是一种编程语言，也不是 Flask 的替代品。
- 不是 Nginx：Nginx 常在更外层做反向代理（例如 88 端口转到 5000）；WSGI 服务器是 **Python 这一侧** 接应用的那一层。
- 不是 ONNX / PyTorch：不负责认病，只负责把请求送到已有 Python 代码。
- 和 **ASGI** 不同：那是偏异步、WebSocket 的后继约定，见 [`什么是ASGI服务器.md`](./什么是ASGI服务器.md)。本项目推理服务走普通请求-响应，用 WSGI 即可。

---

## 五、C# 里什么有类似功能

C# 版  **「服务器 ↔ 应用」这一层插头**。

| Python | C# / .NET 里更接近的 |
|--------|----------------------|
| **WSGI 约定** | 早年的 **OWIN**（Open Web Interface for .NET）：同样规定服务器如何把请求交给应用。后来能力并进 **ASP.NET Core 托管模型**，日常已很少单独提 OWIN。 |
| **WSGI 应用**（Flask 的 `app`） | **ASP.NET Core** 应用（`WebApplication` / Controller / Minimal API） |
| **WSGI 服务器**（waitress、gunicorn、`app.run`） | **Kestrel**：ASP.NET Core 自带的 HTTP 服务器，负责听端口、把请求送进管道 |
| 更外层的 Nginx | **IIS** 或反向代理（Nginx 也能放在 Kestrel 前面） |

记住对应关系：

- waitress / gunicorn ≈ **Kestrel**（谁在端口上接待连接）
- Flask 路由代码 ≈ **ASP.NET Core** 里的接口方法
- WSGI 这份「可换服务器、不改应用」的规格 ≈ 历史上的 **OWIN**；现在 .NET 把服务器和应用收成一套模板，换 Kestrel 或 IIS 托管时，业务代码仍然是 ASP.NET，不必自己实现第二套插头

Kestrel 从一开始就是异步的，所以 **ASGI 多出来的「异步 HTTP」在 C# 里没有另起一个通用名字**，就在 ASP.NET Core + Kestrel 里。WebSocket 也由同一套管道提供，而不是再换一种叫 ASGI 的服务器规格。

框架和整个 .NET 平台不要混为一谈，见 [`Flask对Python是否等于NET对CSharp.md`](./Flask对Python是否等于NET对CSharp.md)。

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是Flask.md`](./什么是Flask.md) | WSGI 应用这一端 |
| [`什么是waitress.md`](./什么是waitress.md) | 本项目选用的一种 WSGI 服务器 |
| [`什么是ASGI服务器.md`](./什么是ASGI服务器.md) | 异步 / WebSocket 那套后继约定 |
| [`Flask对Python是否等于NET对CSharp.md`](./Flask对Python是否等于NET对CSharp.md) | 框架 ≠ 整个运行平台 |

---

## 七、小结

**WSGI = Python 网页应用和 HTTP 托管进程之间的标准插头；WSGI 服务器 = 按这根插头听端口、转发请求的程序。**  
在 C# 里，日常对标的是 **Kestrel + ASP.NET Core**；若问「那份可插拔规格」本身，最像的是历史上的 **OWIN**。
