# knowledge.py

> 源码：[`ml-bjj/serving/knowledge.py`](../../../../../ml-bjj/serving/knowledge.py)  
> Mock 时对应：无（识病一直在 Flask）

---

## 一、一句话定义

**`knowledge.py` 读防治库 JSON。** 按规范病名取出症状、药剂、农艺措施等，给 `/api/treatments` 和识病结果里的建议用。文件在 `ml-bjj/knowledge/treatments.json`，不是 MySQL。

找不到条目或病名被隐藏时，返回「暂无条目、先复核」的占位，避免前端空白崩溃。

它 **不** 识图，**不** 写预警。

---

## 二、小结

**防治文案来自 JSON 知识库，不是神经网络编出来的。**
