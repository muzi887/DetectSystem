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
