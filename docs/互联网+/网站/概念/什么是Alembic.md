# 什么是 Alembic

> 面向零基础读者：Alembic 是什么、和 SQLAlchemy、和 `python app.py` 的关系。  
> ORM 本身见 [`什么是SQLAlchemy.md`](./什么是SQLAlchemy.md)。挂钩文件见 [`后端py文件/alembic/env.py.md`](./后端py文件/alembic/env.py.md)。建表命令见 [`Flask-MySQL-Task1-连接表结构导入.md`](../训后实施/Flask-MySQL-Task1-连接表结构导入.md)。

---

## 一、一句话定义

**Alembic** 是 SQLAlchemy 官方的 **迁移工具**：把「表应该长什么样」变成一串可重复执行的版本（`upgrade` 往前、`downgrade` 往后）。空库第一次建 15 张表，靠的就是它，不是 Flask 启动时自动 `CREATE TABLE`。

它 **不是** 数据库，**不是** ORM（ORM 是 SQLAlchemy），**不是** 网站进程。日常登录、预警 **不会** 跑 Alembic。只有你在 `ml-bjj/serving` 下执行 `alembic upgrade head` 时才会动表结构。

可以把它想成：**工地施工图的版本号。** SQLAlchemy 的 `models.py` 是图纸；Alembic 是「第 1 版把柜子钉上、以后加抽屉再出第 2 版」。不要把施工队请到每次开门（`python app.py`）里。

若对过 C#：**更接近 EF Core 的 Migrations**（`dotnet ef database update`），不是网站本身。

---

## 二、它解决什么问题

只改 Python 类、不改库，MySQL 里还是旧列，运行会报错。只在库里手动 `ALTER`、不改类，代码和库会分叉。Alembic 把一次结构变更收进 `alembic/versions/` 里的脚本，本机和云端可以对 **同一份** `detect_system` 执行同一条 `upgrade`。

本仓库第一版：[`0001_initial.py`](./后端py文件/alembic/versions/0001_initial.py.md) 按 `models.py` 的 `Base.metadata.create_all` 建表。以后加列应 **新增** 版本，不要在生产库上反复 `drop_all`。

灌数据（把 `db.json` 倒进去）是 [`import_db_json.py`](./后端py文件/import_db_json.py.md)，**不是** Alembic 的职责。顺序一般是：先 `upgrade head` 有表，再导入行。

---

## 三、在本项目中的位置

```text
你敲：cd ml-bjj/serving  →  alembic upgrade head
        ↓
alembic.ini + env.py     读 DATABASE_URL
        ↓
versions/0001_initial.py  按 models.Base 建表
        ↓
云端 MySQL detect_system  多了 15 张空表
```

| 文件 | 角色 |
|------|------|
| `ml-bjj/serving/alembic.ini` | 告诉命令去哪找 `env.py` |
| [`env.py`](./后端py文件/alembic/env.py.md) | 迁移时怎么连库、用哪份 metadata |
| [`0001_initial.py`](./后端py文件/alembic/versions/0001_initial.py.md) | 第一版建表 / 可整库删掉 |

`DATABASE_URL` 与跑 Flask 时相同：密码只放环境变量。本机指云端公网主机；云上 Flask 用 `127.0.0.1`。

---

## 四、和相邻概念

| 概念 | 和 Alembic |
|------|------------|
| **SQLAlchemy** | 运行时查表改表；Alembic **借用它的模型** 去改结构 |
| **`db.py`** | 网站开门；Alembic 自己再连一次（施工专用） |
| **`python app.py`** | 不执行迁移 |
| **json-server** | 没有「建表版本」，文件有键就有「表」 |

---

## 五、小结

| 要点 | 说明 |
|------|------|
| **本质** | SQLAlchemy 的表结构版本工具 |
| **本项目** | 对云端空库 `detect_system` 建 15 张表 |
| **不负责** | HTTP、规则链、往表里灌 `db.json` |
| **一句话** | Alembic = 按图纸给 MySQL 施工；Flask 只负责以后进出这些柜子 |

---

## 六、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是SQLAlchemy.md`](./什么是SQLAlchemy.md) | 运行时如何用类操作表 |
| [`Flask-MySQL-Task1-连接表结构导入.md`](../训后实施/Flask-MySQL-Task1-连接表结构导入.md) | `upgrade head` 与导入 |
| [`项目启动说明.md`](../项目启动说明.md) | 本机/云上 `DATABASE_URL` |
| [`后端py文件/README.md`](./后端py文件/README.md) | `alembic/` 各文件 |
