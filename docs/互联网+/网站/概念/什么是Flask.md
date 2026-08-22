# 什么是 Flask

> 面向零基础读者：Flask 是什么、在本系统里干什么。  
> 具体路由清单、代理配置、启动命令见 [`项目启动说明.md`](../项目启动说明.md) 与训后 Task，本文不重复。

---

## 一、一句话定义

**Flask** 是用 Python 写网站接口的轻量框架。你用函数写「收到某种请求后做什么」，Flask 负责在某个端口上听 HTTP 请求、找到对应函数、把返回值变成 JSON 发给浏览器。

本项目的推理服务就是 Flask 应用：`ml-bjj/serving/app.py`，默认端口 **5000**。

可以把它想成：**给 Python 函数装上门牌和门铃。** 没有 Flask，函数只能在测试里直接调用；有了 Flask，网页才能用网址找到它们。训后文档里说的「挂 HTTP」，指的就是接到 Flask 路由上。

---

## 二、它解决什么问题

智能分析页在浏览器里运行（Vue），病虫害模型在 Python 里运行（PyTorch）。浏览器 **不能** `import torch` 或直接打开 `.pt` 文件。

需要一个中间人：

```text
网页上传图片
    → HTTP 请求（带图片和作物类型）
    → Flask 收到后调用推理函数
    → 把病名、置信度等做成 JSON 发回网页
```

Flask 只做「收请求、调函数、回 JSON」。真正认病的是 PyTorch；真正读写识别记录的是 `analysis_store` 等纯函数。Flask 把它们露给网站。

---

## 三、最小样子（不必背代码）

本仓库里是这种结构：

```python
from flask import Flask, jsonify, request

app = Flask(__name__)          # 创建一个应用

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(port=5000)
```

| 写法 | 含义 |
|------|------|
| `app = Flask(__name__)` | 创建应用实例 |
| `@app.route("网址", methods=["GET"或"POST"])` | 给函数挂上门牌 |
| `request` | 读这次请求带来的图片、表单、JSON |
| `jsonify(...)` | 把 Python 字典变成 HTTP 响应里的 JSON |

访问 `http://127.0.0.1:5000/health` 时，Flask 调用 `health()`，页面或前端就能拿到返回内容。

---

## 四、在本项目中的位置

```text
浏览器 / 智能分析页（Vue · 一般是 5173）
        ↓  Vite 把 /api/analysis、/api/treatments 转到 5000
Flask  app.py（5000）
        ↓
PyTorch 推理、作物掩码、防治库、识别记录 JSON
```

同机还有 **Mock（3000）**：登录、预警、监测点等业务 CRUD，那是 Node / json-server，**不是 Flask**。Flask 专管 AI 分析这一侧。

前端 **不运行 Flask**。开发时要单独启动 Python 进程；Flask 没开，分析接口会失败（首页近期识别等处会故意静默，避免挡整页）。

---

## 五、和相邻概念怎么区分

| 概念 | 干什么 | 和 Flask 的关系 |
|------|--------|-----------------|
| **纯函数** | 输入进、结果出，不监听端口 | 先写函数，再挂到 Flask 上 |
| **HTTP** | 浏览器与服务器约定怎么传请求 | Flask 是用 Python 响应 HTTP 的一种实现 |
| **PyTorch** | 训练和运行神经网络 | Flask 调用它，自己不算模型 |
| **线程锁** | 同一进程里排队改同一份 JSON | Flask 可能同时处理多个请求，所以存储层要加锁 |

「不挂 HTTP」= 这个 Task 只写函数，`app.py` 里还不加 `@app.route`。网页暂时调不到，pytest 可以直接 `append_record(...)`。

「挂 HTTP」 就是：给这段逻辑加上网站能访问的网址（路由），让浏览器或前端用 GET / POST 调到它。

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`项目启动说明.md`](../项目启动说明.md) | 如何启动 Flask 与网站 |
| [`什么是Mock.md`](./什么是Mock.md) | 旧的 json-server 业务后端（已切流） |
| [`什么是api_mock.md`](./什么是api_mock.md) | 宝塔上的 Mock 部署包；现已归档 |
| [`Flask对Python是否等于NET对CSharp.md`](./Flask对Python是否等于NET对CSharp.md) | Flask 不能当成 Python 的整个 .NET |
| [`什么是Django.md`](./什么是Django.md) | Python 网站全家桶；本仓库不用 |
| [`什么是SQLAlchemy.md`](./什么是SQLAlchemy.md) | Flask 用它读写 MySQL |
| [`什么是Alembic.md`](./什么是Alembic.md) | 按模型给空库建表 |
| [`后端py文件/README.md`](./后端py文件/README.md) | **每个** Flask 后端 `.py` 在干什么 |
| [`Python线程锁.md`](./Python线程锁.md) | Flask 并发写识别记录时为何加锁 |
| [`什么是batch.md`](./什么是batch.md) | 一次请求识别多张图 |
| [`什么是ONNX.md`](./什么是ONNX.md) | 可选的另一种模型推理格式 |
| [`什么是waitress.md`](./什么是waitress.md) | Windows 上托管 Flask 的生产进程 |
| [`什么是WSGI服务器.md`](./什么是WSGI服务器.md) | 托管进程与 Flask 之间的接口约定；含 C# 对照 |
| [`什么是ASGI服务器.md`](./什么是ASGI服务器.md) | 异步 / WebSocket 的后继约定（本仓库不用） |
| [`../模型/什么是PyTorch.md`](../../模型/概念/什么是PyTorch.md) | 推理用的深度学习框架 |
| [`../模型/作物掩码与推理接入.md`](../../模型/方案/作物掩码与推理接入.md) | 接到推理路径（函数层），再由 Flask 对外提供 |

---

## 七、小结

| 要点 | 说明 |
|------|------|
| **本质** | Python 微型 Web 框架，把函数变成网址 |
| **本项目** | `app.py` 在 5000 端口提供智能分析等接口 |
| **不负责** | 不训练模型、不替代 Vue、不管 Mock 里的登录预警 |
| **一句话** | Flask = 让网页通过 HTTP 用到 Python 推理代码 |
