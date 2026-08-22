# crop_filter.py

> 源码：[`ml-bjj/serving/crop_filter.py`](../../../../../ml-bjj/serving/crop_filter.py)  
> Mock 时对应：无（识病一直在 Flask）

---

## 一、一句话定义

**`crop_filter.py` 是 23 类病名词典 + 按作物遮罩。** 用户选「小麦」时，把玉米/水稻等类的概率清掉再归一化，避免张冠李戴。也负责隐藏已下线的桃/苹果类名。

它 **不** 加载 `.pt`，**不** 算卷积。真正推理在 [`inference.py`](./inference.py.md)，推理前/后会调用这里的 `classes_for_crop`、`mask_and_renorm`、`canonicalize_label`。

启动门闩「必须 23 类」对的就是这里的 `CANONICAL_CLASSES`。

---

## 二、小结

**作物下拉不是装饰：它决定模型输出里哪些病名允许出现。**
