# Task 5：`predict_detailed` 接入作物过滤与 topk

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../实施计划/新模型训后-后端丰富实施计划.md) Task 5  
> 状态：✅ 已完成（本任务 2 passed，连带 Task 1–2 共 11 passed）

## 子任务解释

把 Task 1 的作物掩码和 Task 2 的 topk / 复核接到真正的推理路径上：

1. 新增 `PredictResult`（`label` / `confidence` / `topk` / `needs_review`）
2. `predict_detailed(image, crop_type)`：softmax → `mask_and_renorm` → `rank_topk` → `needs_review`
3. 原 `predict` 改为调用 `predict_detailed`，仍返回 `(label, confidence)`，`predict.py` 命令行不受影响

测试用假模型：logits 故意让「稻瘟病」最高，选 `wheat` 后不得输出稻瘟。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/serving/inference.py`](../../../../ml-bjj/serving/inference.py) | `PredictResult` + `predict_detailed`：softmax 后作物掩码，再 rank / needs_review |
| 新增 | [`ml-bjj/tests/test_predict_detailed.py`](../../../../ml-bjj/tests/test_predict_detailed.py) | 验证小麦掩码生效；旧 `predict` 元组接口仍可用 |

## 代码内容

### `ml-bjj/serving/inference.py`（关键新增）

```python
@dataclass
class PredictResult:
    label: str
    confidence: float
    topk: list[dict[str, str | float]]
    needs_review: bool


class PestClassifier:
    def predict_detailed(self, image: Image.Image, crop_type: str = "unknown") -> PredictResult:
        img = image.convert("RGB")
        tensor = self.transform(img).unsqueeze(0)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0].tolist()
        filtered = mask_and_renorm(probs, self.classes, crop_type)
        topk = rank_topk(filtered, self.classes, k=3)
        label = str(topk[0]["label"])
        confidence = float(topk[0]["confidence"])
        return PredictResult(
            label=label,
            confidence=confidence,
            topk=topk,
            needs_review=needs_review(topk, confidence),
        )

    def predict(self, image: Image.Image, crop_type: str = "unknown") -> tuple[str, float]:
        result = self.predict_detailed(image, crop_type)
        return result.label, result.confidence
```

完整文件见链接。`__init__` 加载权重逻辑未改。

### `ml-bjj/tests/test_predict_detailed.py`

```python
from PIL import Image
import torch

from inference import PestClassifier, PredictResult


class _FakeModel:
    def __init__(self, logits: torch.Tensor) -> None:
        self.logits = logits

    def eval(self):
        return self

    def __call__(self, tensor):
        return self.logits


def test_predict_detailed_applies_wheat_mask():
    clf = PestClassifier.__new__(PestClassifier)
    clf.classes = ["小麦锈病", "稻瘟病", "健康"]
    clf.transform = lambda img: torch.zeros(3, 224, 224)
    clf.model = _FakeModel(torch.tensor([[1.0, 8.0, 0.5]]))
    img = Image.new("RGB", (16, 16), color=(0, 128, 0))
    result = clf.predict_detailed(img, crop_type="wheat")
    assert isinstance(result, PredictResult)
    assert result.label in {"小麦锈病", "健康"}
    assert result.label != "稻瘟病"
    assert result.topk[0]["label"] == result.label


def test_predict_wrapper_returns_tuple():
    clf = PestClassifier.__new__(PestClassifier)
    clf.classes = ["健康", "小麦锈病"]
    clf.transform = lambda img: torch.zeros(3, 224, 224)
    clf.model = _FakeModel(torch.tensor([[3.0, 0.1]]))
    img = Image.new("RGB", (8, 8), color=(1, 1, 1))
    label, conf = clf.predict(img)
    assert label == "健康"
    assert conf > 0.5
```

## 验证

```text
pytest ml-bjj/tests/test_predict_detailed.py ml-bjj/tests/test_crop_filter.py ml-bjj/tests/test_predict_utils.py -v
→ 11 passed
```
