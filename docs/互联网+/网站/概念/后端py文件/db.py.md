# db.py

> 源码：[`ml-bjj/serving/db.py`](../../../../../ml-bjj/serving/db.py)  
> Mock 时对应：无（原先 json-server 直接读 `db.json`，没有独立的连接模块）  
> 启动与密码见 [`项目启动说明.md`](../../项目启动说明.md)。建表见 [`Flask-MySQL-Task1-连接表结构导入.md`](../../训后实施/Flask-MySQL-Task1-连接表结构导入.md)。本文不贴连接串里的密码。

---

## 一、一句话定义

**`db.py` 是 Flask 连数据库的插头。** 它读环境变量 `DATABASE_URL`，建好 SQLAlchemy 引擎，再借出一次「会话」给登录、预警、规则链去查表、改表。用完自动提交或回滚。

它 **不** 定义表长什么样（那是 [`models.py`](./models.py.md)），**不** 写 `/login`、`/alerts`（那是 [`blueprints/biz.py`](./blueprints/biz.py.md)），**不** 算旱涝热（那是 `rules/`）。没有插头，后面那些文件碰不到 MySQL。

可以把它想成：**只负责开门、递钥匙、用完关门。**

---

## 二、它解决什么问题

迁库之后，登录、监测点、预警走云端那一份库 `detect_system`，不再走 json-server 的 `db.json`。

```text
网页 /api/login、/alerts …
        ↓
Flask :5000（biz.py、scheduler.py …）
        ↓
db.py 按 DATABASE_URL 开门
        ↓
MySQL detect_system
```

连接串、引擎缓存、提交/回滚集中写在这里，避免每个接口自己 `create_engine`。

**没有 `DATABASE_URL` 就明确失败**，不会悄悄再去读 `src/mock/db.json`。登录页会看到 503、文案含「未配置数据库」。

---

## 三、文件里有什么（不必背代码）

| 名字 | 干什么 |
|------|--------|
| `database_url()` | 读环境变量；空就抛 `DatabaseNotConfigured` |
| `get_engine()` | 按 URL 建引擎并缓存；SQLite 测试关掉「同线程」限制 |
| `session_scope()` | 业务代码入口：成功 `commit`，失败 `rollback`，最后关掉 |
| `reset_engine_cache()` | 测试换 URL 时清缓存；日常启动不用 |

`pool_pre_ping=True`：从池里拿出连接时先探活。本机连云端 MySQL，空闲后连接会被掐，没有这一句容易「看起来连着、一查就断」。

真正建表是 Alembic，不是本文件启动时自动建。

---

## 四、小结

| 要点 | 说明 |
|------|------|
| **本质** | SQLAlchemy 引擎 + 会话封装 |
| **不负责** | 表结构、HTTP、规则算法 |
| **一句话** | 读 `DATABASE_URL`，开门干活，用完关门；没配就报错，不回退假库 |

同目录：[`models.py.md`](./models.py.md)、[`scheduler.py.md`](./scheduler.py.md)。概念：[`什么是SQLAlchemy.md`](../什么是SQLAlchemy.md)、[`什么是Alembic.md`](../什么是Alembic.md)、[`什么是Flask.md`](../什么是Flask.md)。
