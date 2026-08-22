# inference.py

> 源码：[`ml-bjj/serving/inference.py`](../../../../../ml-bjj/serving/inference.py)  
> Mock 时对应：无（识病一直在 Flask，不是 json-server 迁来的）  
> 模型概念见 [`什么是PyTorch.md`](../../../模型/概念/什么是PyTorch.md)。ONNX 见 [`什么是ONNX.md`](../什么是ONNX.md)。

---

## 一、一句话定义

**`inference.py` 是真正「看图认病」的模块。** 加载 `pest-cls-best.pt`（或可选 ONNX），预处理图片，跑分类，得到病名、置信度、Top-K。进程内缓存分类器，避免每张图都重新读权重。

权重路径可用 `ML_BJJ_WEIGHTS`。`ML_BJJ_USE_MOCK=1` 时由 [`app.py`](./app.py.md) 走假推理，不经过真实权重。

它 **不** 听 HTTP，**不** 写防治库，**不** 写 MySQL。HTTP 在 `app.py`；按作物遮罩在 [`crop_filter.py`](./crop_filter.py.md)；是否需复核在 [`predict_utils.py`](./predict_utils.py.md)。

---

## 二、小结

**Flask 只是门铃；认病的是本文件里的分类器。**
