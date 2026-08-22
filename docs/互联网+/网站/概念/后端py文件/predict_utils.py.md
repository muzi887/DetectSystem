# predict_utils.py

> 源码：[`ml-bjj/serving/predict_utils.py`](../../../../../ml-bjj/serving/predict_utils.py)  
> Mock 时对应：无（识病一直在 Flask）

---

## 一、一句话定义

**`predict_utils.py` 是识病结果的两个小尺子。** `rank_topk` 排出前几名病名；`needs_review` 在置信度低于 0.7、或第一第二名差太近时标记「建议人工复核」。

纯函数，不读文件、不听端口。[`inference.py`](./inference.py.md) 和训练侧 `scripts/predict.py` 共用同一口径，避免网页和命令行一个严一个松。

---

## 二、小结

**Top-K 和「要不要复核」与卷积无关，是阈值规则。**
