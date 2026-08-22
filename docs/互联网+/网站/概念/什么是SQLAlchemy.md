# 什么是 SQLAlchemy

> 面向零基础读者：SQLAlchemy 是什么、在本仓库干什么。  
> 插头文件见 [`后端py文件/db.py.md`](./后端py文件/db.py.md)，表类见 [`后端py文件/models.py.md`](./后端py文件/models.py.md)。改表结构用的工具见 [`什么是Alembic.md`](./什么是Alembic.md)。

---

## 一、一句话定义

**SQLAlchemy** 是 Python 里连数据库、用对象代替手写 SQL 的一套库（常叫 **ORM**：Object-Relational Mapping）。你写 `User`、`Alert` 这样的类，它帮你变成 `users`、`alerts` 表上的查、改、插入。

它 **不是** 数据库本身（库仍是 MySQL 里的 `detect_system`），**不是** Web 框架（听端口的是 Flask），**不是** 把 `db.json` 自动变成表的魔法。语言仍是 Python。

可以把它想成：**Python 对象和 MySQL 表之间的翻译。** 网页说驼峰 `pointId`，表列是蛇形 `point_id`，中间这一层靠 ORM + 本仓库的 `to_camel()`。

若对过 C#：**更接近 Entity Framework**（用类对表），不是 ASP.NET（那一层对本仓库是 Flask）。

---

## 二、它解决什么问题

以前 Mock 把整份业务写在 `db.json` 里，改一行等于改文件。迁真库后，登录、预警要进 MySQL。若每个接口自己拼 `SELECT ...`，列名一改就漏。SQLAlchemy 让业务代码写：

```text
session 里取出 Alert 对象 → 改 handled → commit
```

真正发给 MySQL 的 SQL 由它生成。本仓库用的是 **2.x** 声明式写法（`Mapped[...]`、`mapped_column`），依赖在 `ml-bjj/requirements.txt`。

和旁边两个名字不要叠成一个：

| 名字 | 干什么 |
|------|--------|
| **MySQL** | 真正存数据的服务器 |
| **PyMySQL** | Python 连上 MySQL 的「电线」（连接串里的 `mysql+pymysql://`） |
| **SQLAlchemy** | 在电线上用引擎、会话、类来干活 |

没有 PyMySQL，SQLAlchemy 到不了这台云库；没有 SQLAlchemy，就要手写 SQL。

---

## 三、在本项目中的位置

```text
biz.py / scheduler.py / persist.py
        ↓  session_scope()
db.py    →  create_engine(DATABASE_URL)     ← SQLAlchemy 引擎
        ↓
models.py → class Alert(Base): ...           ← SQLAlchemy 模型
        ↓
PyMySQL  →  云端 MySQL detect_system
```

| 本仓库文件 | 用 SQLAlchemy 的哪一块 |
|------------|------------------------|
| [`db.py`](./后端py文件/db.py.md) | 引擎、`session_scope`（开门关门） |
| [`models.py`](./后端py文件/models.py.md) | 15 张表的类 |
| [`biz.py`](./后端py文件/blueprints/biz.py.md) 等 | `select(...)` 查询、提交 |

pytest 可以把 `DATABASE_URL` 设成 SQLite，仍走同一套 ORM，不碰云端库。日常跑网站时 URL 仍指向云端 `detect_system`。

识病记录第一期仍写 `analysis_records.json`，**不走** SQLAlchemy。

---

## 四、和相邻概念

| 概念 | 和 SQLAlchemy |
|------|----------------|
| **Flask** | 收 HTTP；SQLAlchemy 管库。Flask 不自带 ORM（不像 Django） |
| **Django ORM** | 同类能力，绑在 Django 里；本仓库不用 Django，自己引 SQLAlchemy |
| **Alembic** | 按 SQLAlchemy 的模型去 **建表/改表**；运行时查预警不经过 Alembic |
| **json-server** | 旧假库，没有 ORM |

---

## 五、小结

| 要点 | 说明 |
|------|------|
| **本质** | Python ORM + 引擎/会话 |
| **本项目** | Flask 业务接口读写 MySQL 的方式 |
| **不负责** | 听端口、训模型、改表的版本历史（后者是 Alembic） |
| **一句话** | SQLAlchemy = 用 Python 类操作 MySQL，不必每个接口手写 SQL |

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是Alembic.md`](./什么是Alembic.md) | 按模型给空库建表、以后改列 |
| [`什么是Django.md`](./什么是Django.md) | 全家桶自带 ORM；本仓库是 Flask + SQLAlchemy |
| [`Flask-MySQL-Task1-连接表结构导入.md`](../训后实施/Flask-MySQL-Task1-连接表结构导入.md) | 连接层从哪来 |
| [`项目启动说明.md`](../项目启动说明.md) | `DATABASE_URL` |
