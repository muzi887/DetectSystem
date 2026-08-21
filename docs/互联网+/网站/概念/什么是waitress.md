# 什么是 waitress

> 说明生产环境用什么进程托管 Flask，以及它和 `app.run`、gunicorn 的差别。  
> 入口脚本、端口、部署摘录见 [`新模型训后-P3-规则链与工程化实施计划.md`](../实施计划/新模型训后-P3-规则链与工程化实施计划.md) Task 4，本文不重复。

---

## 一、一句话

**Waitress** 是一个用 Python 写的 **WSGI 服务器**：专门在端口上稳定地接待 HTTP 请求，再交给 Flask 应用。本项目计划用它在 **Windows / 宝塔** 上跑推理服务（5000 端口）。

Flask 自己的 `app.run()` 适合本机点开调试，不适合当正式站点的长期进程。Waitress 补的是「怎么把同一个 `app` 挂出去」。

---

## 二、它解决什么问题

Flask 是框架（路由、`jsonify`）。真正在操作系统里听端口、同时处理多个连接，需要一个 **托管进程**。

```text
浏览器 → 端口 5000 → waitress（接待连接，可多线程）
                         ↓
                    Flask app.py（路由、调推理）
```

P3 约定：

- 本地调试：**继续** `python app.py` → 内部 `app.run`
- 生产 Windows / 宝塔：`python ml-bjj/serving/serve.py` → waitress 托管 **同一份** Flask `app`
- 生产 Linux：文档里可改用 **gunicorn**（另一个托管程序），不是必须和 Windows 用同一个

校验权重是否 23 类，应在托管开始前做完，与用 waitress 还是 `app.run` 无关。

---

## 三、和相邻概念怎么区分

| 名称 | 角色 |
|------|------|
| **Flask** | 写「哪个网址调用哪个函数」 |
| **waitress** | Windows 上常用的托管进程，多线程听端口 |
| **gunicorn** | Linux 上常用的托管进程（多 worker 进程） |
| **线程锁** | 同一进程内改同一份 JSON 时排队；waitress 开多线程时更需要它 |
| **ONNX** | 模型前向用哪种格式；和谁听端口无关 |

Waitress 主要是线程模型，**挡不住多个独立进程**同时写同一个文件。多 worker（如 gunicorn `-w 2`）时，P2 那把进程内锁不够，需要文件锁或数据库——那已超出 waitress 这一层。

---

## 四、它不是什么

- 不是新框架，不替代 Flask，也不替代 Vue / Nginx。
- 不是「上了 waitress 推理就会变准」。准确率仍看模型和掩码。
- 不是 ONNX：换托管程序不会自动改用 `.onnx`。

---

## 五、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是Flask.md`](./什么是Flask.md) | Flask 本身 |
| [`什么是WSGI服务器.md`](./什么是WSGI服务器.md) | waitress 所遵守的 Python 接口约定 |
| [`Python线程锁.md`](./Python线程锁.md) | 多线程写识别记录 |
| [`新模型训后-P3-规则链与工程化实施计划.md`](../实施计划/新模型训后-P3-规则链与工程化实施计划.md) | P3 里 serve.py 与部署备注 |

---

## 六、小结

**waitress = 把现有 Flask 应用在 Windows 上较稳地挂到端口上的生产进程；本地调试仍可用 Flask 自带的 `app.run`。**
