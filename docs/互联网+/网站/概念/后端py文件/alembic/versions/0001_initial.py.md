# alembic/versions/0001_initial.py

> 源码：[`ml-bjj/serving/alembic/versions/0001_initial.py`](../../../../../../../ml-bjj/serving/alembic/versions/0001_initial.py)  
> Mock 时对应：无（迁真库才有 Alembic；表内容对标 `db.json`）

---

## 一、一句话定义

**第一版建表迁移。** `upgrade` 按 [`models.py`](../../models.py.md) 的 `Base.metadata.create_all` 在空库 `detect_system` 建出 15 张表；`downgrade` 则全部删掉。

改表结构应 **新增** 下一个版本文件，不要在生产库上反复 `drop_all`。灌数见 [`import_db_json.py.md`](../../import_db_json.py.md)。
