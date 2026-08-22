# Flask-MySQL Task 1：连接、表结构、导入脚本

> 对应计划：[`Flask-MySQL替换Mock实施计划.md`](../实施计划/Flask-MySQL替换Mock实施计划.md) Task 1  
> 状态：✅ 已完成（`pytest tests/test_db_url.py` 2 passed）  
> `db.py` 在干什么（人话）见 [`db.py.md`](../概念/后端py文件/db.py.md)。  
> `models.py` 在干什么（人话）见 [`models.py.md`](../概念/后端py文件/models.py.md)。  
> SQLAlchemy / Alembic 是什么见 [`什么是SQLAlchemy.md`](../概念/什么是SQLAlchemy.md)、[`什么是Alembic.md`](../概念/什么是Alembic.md)。  
> 全部后端 `.py` 索引：[`后端py文件/README.md`](../概念/后端py文件/README.md)。

## 子任务解释

把 `db.json` 的 15 个集合变成 MySQL 表，并用 SQLAlchemy 连接。**没有 `DATABASE_URL` 就明确报错**，绝不回退 json-server。pytest 用内存/临时 SQLite，业务库仍是云端唯一一份 `detect_system`。

本任务只建连接层、ORM、Alembic 与导入脚本，不接 HTTP。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/requirements.txt`](../../../../ml-bjj/requirements.txt) | SQLAlchemy / PyMySQL / Alembic |
| 新增 | [`ml-bjj/serving/db.py`](../../../../ml-bjj/serving/db.py) | `DATABASE_URL`、引擎、`session_scope` |
| 新增 | [`ml-bjj/serving/models.py`](../../../../ml-bjj/serving/models.py) | 15 张表 + `to_camel()` |
| 新增 | [`ml-bjj/serving/alembic.ini`](../../../../ml-bjj/serving/alembic.ini) 与 `alembic/` | `upgrade head` 建表 |
| 新增 | [`ml-bjj/scripts/import_db_json.py`](../../../../ml-bjj/scripts/import_db_json.py) | 清空后导入 `src/mock/db.json` |
| 新增 | [`ml-bjj/tests/test_db_url.py`](../../../../ml-bjj/tests/test_db_url.py) | 缺 URL 失败；SQLite 可写入用户/雄县 |

## 代码内容

未配置数据库：

```python
def database_url() -> str:
    url = (os.environ.get("DATABASE_URL") or "").strip()
    if not url:
        raise DatabaseNotConfigured("未配置数据库：请设置环境变量 DATABASE_URL")
    return url
```

表与 JSON 键对应（节选）：`users`、`monitor_points`、`weather_readings`、`alerts`（`time` 为 BIGINT）、`threshold_profiles`、`rule_state`（`point_id+rule_id` 唯一）。

云端建表与灌数（密码只放环境变量）：

```text
cd ml-bjj/serving
alembic upgrade head
python ../scripts/import_db_json.py
```

本机开发同一命令，但 `DATABASE_URL` 主机用 `82.157.234.123`。

## 验证

```text
ml-bjj\.venv\Scripts\python.exe -m pytest tests/test_db_url.py -q
# 2 passed
```
