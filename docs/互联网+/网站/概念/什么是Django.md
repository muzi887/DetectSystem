# 什么是 Django

> 面向零基础读者：Django 是什么、和 Flask 差在哪、本仓库为什么不用它。  
> Flask 本身见 [`什么是Flask.md`](./什么是Flask.md)。迁真库路径见 [`Flask-MySQL替换Mock方案.md`](../方案/Flask-MySQL替换Mock方案.md)（明确先不做 Django）。

---

## 一、一句话定义

**Django** 是用 Python 写网站的「全家桶」框架。登录、后台管理页、连数据库（ORM）、表单校验、后台用户，它都自带一套约定；你按它的项目结构填，而不是只写几个路由函数。

可以把它想成：**带家具的整套公寓。** Flask 更像空房间 + 你自己买桌椅。都能住人（都能对外提供 HTTP），配套多少不一样。

它 **不是** 编程语言，也 **不是** 数据库，也 **不是** 神经网络。语言仍是 Python；认病仍是 PyTorch。

---

## 二、它解决什么问题

做「完整网站后台」时，常常同时需要：用户账号、权限、把表结构映射成 Python 对象、自动生成管理后台。Django 把这些打成一套，适合从零做内容站、后台系统。

本项目现在的分工不是这样：

```text
Vue 页面（5173）
    ├─ 登录 / 预警 / 监测点  →  Mock :3000（json-server）
    └─ 识病 / 防治库        →  Flask :5000
```

识病只要「收图 → 调模型 → 回 JSON」，Flask 够用。业务数据若换真库，方案也是 **扩展现有 Flask + MySQL**，而不是换成 Django。

---

## 三、和 Flask 差在哪（本仓库语境）

| | Flask（本仓库在用） | Django（本仓库不用） |
|--|---------------------|----------------------|
| 体量 | 小，路由 + 你自己拼模块 | 大，自带用户、Admin、ORM |
| 本仓库角色 | `ml-bjj/serving/app.py` 挂推理接口 | 无对应目录 |
| 像 C# 里的 | ASP.NET Core Minimal API / Express | 功能更全的 ASP.NET MVC 那种 |
| 连 MySQL | 需自己加 SQLAlchemy / PyMySQL 等 | 自带 ORM，按 settings 配库 |

「不上 Django」不是说 Django 不好，是：**已经有 Flask 识病服务，再套一个全家桶等于重写后端**，和「审查要自研业务接口」也不自动等同——自研可以继续写在 Flask 里。

---

## 四、和相邻词不要混

| 词 | 是什么 | 和 Django |
|----|--------|-----------|
| **Python** | 语言 | Django 用 Python 写成 |
| **Flask** | 轻量 Web 框架 | 同类、更瘦；本项目选它 |
| **MySQL** | 数据库 | Django 可以连它；不用 Django 也能连 |
| **ORM** | 用对象代替手写 SQL 的一层 | Django 自带；本仓库 Flask 用 [`SQLAlchemy`](./什么是SQLAlchemy.md)，插头是 [`db.py`](./后端py文件/db.py.md) |
| **Spring** | Java 生态里偏全家桶的后端框架 | 文档里常和 Django 并列「先不做」 |

文档里写的 **ASGI** 也可以托管 Django 的异步模式；本仓库推理服务走 Flask + WSGI，与 Django 无关。

---

## 五、小结

| 要点 | 说明 |
|------|------|
| **本质** | Python 全功能 Web 框架（用户、后台、ORM 较齐） |
| **本项目** | **不使用**；识病用 Flask，迁库方案也是扩 Flask |
| **和 Flask** | 都能挂 HTTP；Django 约定多、组件多 |
| **一句话** | Django = Python 网站全家桶；本仓库只要「给推理函数装门铃」，用 Flask |

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是Flask.md`](./什么是Flask.md) | 本仓库实际在用的框架 |
| [`Flask对Python是否等于NET对CSharp.md`](./Flask对Python是否等于NET对CSharp.md) | Flask / Django 分别像 .NET 里哪一层 |
| [`什么是Mock.md`](./什么是Mock.md) | 现在业务数据为什么在 3000 |
| [`Flask-MySQL替换Mock方案.md`](../方案/Flask-MySQL替换Mock方案.md) | 迁真库：扩 Flask，明确不做 Django |
| [`什么是SQLAlchemy.md`](./什么是SQLAlchemy.md) | 本仓库 Flask 用的 ORM |
| [`什么是Alembic.md`](./什么是Alembic.md) | 建表/改表的版本工具 |
| [`什么是WSGI服务器.md`](./什么是WSGI服务器.md) | 托管 Python Web 应用的一种约定 |
