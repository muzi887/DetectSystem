"""v3 病虫害分类推理（与 scripts/predict.py 共用逻辑）。"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import timm
import torch
from PIL import Image
from torchvision import transforms

from crop_filter import mask_and_renorm
from predict_utils import needs_review, rank_topk

ML_BJJ_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WEIGHTS = ML_BJJ_ROOT / "models" / "pest-cls-best.pt"

@dataclass
class PredictResult:
    label: str
    confidence: float
    topk: list[dict[str, str | float]]
    needs_review: bool


_classifier: PestClassifier | None = None


def resolve_weights_path() -> Path:
    env = os.environ.get("ML_BJJ_WEIGHTS")
    if env:
        path = Path(env)
        return path if path.is_absolute() else ML_BJJ_ROOT / path
    return DEFAULT_WEIGHTS


class PestClassifier:
    def __init__(self, weights_path: Path) -> None:
        weights_path = weights_path.resolve()
        if not weights_path.is_file():
            raise FileNotFoundError(f"找不到模型权重: {weights_path}")

        ckpt = torch.load(weights_path, map_location="cpu")
        classes: list[str] = ckpt["classes"]
        img_size: int = ckpt.get("img_size", 224)
        model_name: str = ckpt.get("model_name", "efficientnet_b0")

        self.classes = classes
        self.weights_path = weights_path
        self.model = timm.create_model(model_name, pretrained=False, num_classes=len(classes))
        self.model.load_state_dict(ckpt["state_dict"])
        self.model.eval()

        self.transform = transforms.Compose(
            [
                transforms.Resize((img_size, img_size)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ]
        )

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


def get_classifier(weights_path: Path | None = None) -> PestClassifier:
    global _classifier
    if _classifier is None:
        path = weights_path or resolve_weights_path()
        _classifier = PestClassifier(path)
    return _classifier
