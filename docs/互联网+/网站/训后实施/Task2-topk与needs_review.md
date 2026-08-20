# Task 2：topk 与 needs_review 纯函数

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../新模型训后-后端丰富实施计划.md) Task 2  
> 状态：✅ 已完成（4 项 pytest 通过）

## 子任务解释

分析接口目前只返回最高类的病名和置信度。答辩和人工复核需要：

- **topk（top3）**：次高类是什么，方便说明「易混淆」
- **needs_review**：模型不够确定时明确打标

规则（与规格一致，不依赖模型）：

- `confidence < 0.7` → 需要复核
- 或 top1 与 top2 分差 `< 0.10` → 需要复核
- 否则不复核

`rank_topk` 按概率降序截取前 k 项。本任务仍是纯函数，不改 Flask、不加载权重。

## 改动文件

| 操作 | 文件 |
|------|------|
| 新增 | [`ml-bjj/serving/predict_utils.py`](../../../../ml-bjj/serving/predict_utils.py) |
| 新增 | [`ml-bjj/tests/test_predict_utils.py`](../../../../ml-bjj/tests/test_predict_utils.py) |

## 代码内容

### `ml-bjj/serving/predict_utils.py`

```python
from __future__ import annotations

CONF_REVIEW_THRESHOLD = 0.7
TOP2_MARGIN = 0.10


def rank_topk(probs: list[float], classes: list[str], k: int = 3) -> list[dict[str, str | float]]:
    paired = sorted(zip(classes, probs), key=lambda item: item[1], reverse=True)
    return [{"label": label, "confidence": float(conf)} for label, conf in paired[:k]]


def needs_review(topk: list[dict[str, str | float]], confidence: float) -> bool:
    if confidence < CONF_REVIEW_THRESHOLD:
        return True
    if len(topk) >= 2:
        top1 = float(topk[0]["confidence"])
        top2 = float(topk[1]["confidence"])
        if (top1 - top2) < TOP2_MARGIN:
            return True
    return False
```

### `ml-bjj/tests/test_predict_utils.py`

```python
from predict_utils import needs_review, rank_topk


def test_rank_topk_orders_and_clips_to_three():
    classes = ["A", "B", "C", "D"]
    probs = [0.05, 0.60, 0.25, 0.10]
    top = rank_topk(probs, classes, k=3)
    assert [item["label"] for item in top] == ["B", "C", "D"]
    assert top[0]["confidence"] == 0.60
    assert len(top) == 3


def test_needs_review_when_confidence_low():
    top = [{"label": "稻瘟病", "confidence": 0.55}, {"label": "水稻褐斑病", "confidence": 0.20}]
    assert needs_review(top, 0.55) is True


def test_needs_review_when_margin_small():
    top = [{"label": "稻瘟病", "confidence": 0.46}, {"label": "水稻褐斑病", "confidence": 0.44}]
    assert needs_review(top, 0.46) is True


def test_needs_review_false_when_confident_and_separated():
    top = [{"label": "小麦锈病", "confidence": 0.91}, {"label": "小麦白粉病", "confidence": 0.05}]
    assert needs_review(top, 0.91) is False
```

## 验证

```text
pytest ml-bjj/tests/test_predict_utils.py -v
→ 4 passed
```
