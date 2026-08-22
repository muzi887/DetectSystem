# import_db_json.py

> 源码：[`ml-bjj/scripts/import_db_json.py`](../../../../../ml-bjj/scripts/import_db_json.py)（在 `scripts/`，不属于 `serving/` 包，但是后端灌数）  
> Mock 时对应：无（新脚本；读的仍是 [`src/mock/db.json`](../../../../../src/mock/db.json)）  
> 步骤见 [`Flask-MySQL-Task1-连接表结构导入.md`](../../训后实施/Flask-MySQL-Task1-连接表结构导入.md)。

---

## 一、一句话定义

**把 `src/mock/db.json` 整份灌进 `DATABASE_URL` 指向的库。** 先按表清空，再按 [`JSON_COLLECTIONS`](./models.py.md) 插入。可重复跑，每次都是「先倒空再倒入」，不要当增量同步。

运行时网站 **不再** 读这份 JSON；本脚本只为迁库、重置演示数据。密码仍只放环境变量。

`create_all` 在这里是为了测试库缺表时能写；云端正式结构应以 Alembic 为准。

---

## 二、小结

**一次性搬运工：假 JSON → 真 MySQL。不是 Flask 路由。**
