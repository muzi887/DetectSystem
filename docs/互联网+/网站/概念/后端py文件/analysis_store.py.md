# analysis_store.py

> 源码：[`ml-bjj/serving/analysis_store.py`](../../../../../ml-bjj/serving/analysis_store.py)  
> Mock 时对应：无（识病记录一直写 JSON 文件）  
> 为何加锁见 [`Python线程锁.md`](../Python线程锁.md)。

---

## 一、一句话定义

**`analysis_store.py` 是识病记录的小仓库。** 把每次识别（及人工改标签）读写到一份 JSON 文件（默认 `serving/data/analysis_records.json`），用线程锁避免 Flask 同时写坏文件。

第一期 **不进** MySQL `detect_system`。登录、预警走 [`db.py`](./db.py.md)；认病历史走本文件。这是方案里刻意拆开的。

---

## 二、提供什么

`list_records` / `append_record` / `update_record` / `recent_records` / `stats_by_label`。路径可由环境变量 `ML_BJJ_RECORDS` 改。

它 **不** 跑模型，**不** 听 HTTP（由 [`app.py`](./app.py.md) 调用）。

---

## 三、小结

**识病历史 = JSON 文件 + 锁；不是业务库里的一张表。**
