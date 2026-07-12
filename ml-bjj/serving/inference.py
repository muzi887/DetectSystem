"""v3 病虫害分类推理（与 scripts/predict.py 共用逻辑）。"""

from __future__ import annotations

import os
from pathlib import Path

import timm
import torch
from PIL import Image
from torchvision import transforms

ML_BJJ_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WEIGHTS = ML_BJJ_ROOT / "models" / "pest-cls-best.pt"

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

    def predict(self, image: Image.Image) -> tuple[str, float]:
        img = image.convert("RGB")
        tensor = self.transform(img).unsqueeze(0)
        with torch.no_grad():
            logits = self.model(tensor)
            probs = torch.softmax(logits, dim=1)[0]
            conf, idx = probs.max(dim=0)
        return self.classes[idx.item()], float(conf.item())


def get_classifier(weights_path: Path | None = None) -> PestClassifier:
    global _classifier
    if _classifier is None:
        path = weights_path or resolve_weights_path()
        _classifier = PestClassifier(path)
    return _classifier
