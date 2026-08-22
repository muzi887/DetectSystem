# alembic/env.py

> 源码：[`ml-bjj/serving/alembic/env.py`](../../../../../../ml-bjj/serving/alembic/env.py)  
> Mock 时对应：无（迁真库才有 Alembic）

---

## 一、一句话定义

**Alembic 跑 `upgrade` / `downgrade` 时的挂钩。** 把 `serving` 加进 `sys.path`，用 [`db.py`](../db.py.md) 的 `DATABASE_URL` 和 [`models.py`](../models.py.md) 的 `Base.metadata`，让迁移知道「连哪、表长什么样」。

日常 `python app.py` **不会** 执行本文件。只有在 `ml-bjj/serving` 下敲 `alembic upgrade head` 时才会走到这里。

---

## 二、小结

**施工队进场时的说明书，不是网站运行时的一环。** Alembic 是什么见 [`什么是Alembic.md`](../../什么是Alembic.md)。
