"""Export pest-cls-best.pt to ONNX. Failure is allowed if weights are not 23-class."""

from __future__ import annotations

import sys
from pathlib import Path

import timm
import torch

ROOT = Path(__file__).resolve().parents[1]
WEIGHTS = ROOT / "models" / "pest-cls-best.pt"
OUT = ROOT / "models" / "pest-cls-best.onnx"


def main() -> None:
    if not WEIGHTS.is_file():
        raise SystemExit(f"找不到权重: {WEIGHTS}")
    ckpt = torch.load(WEIGHTS, map_location="cpu")
    classes = ckpt["classes"]
    img_size = int(ckpt.get("img_size", 224))
    model_name = ckpt.get("model_name", "efficientnet_b0")
    model = timm.create_model(model_name, pretrained=False, num_classes=len(classes))
    model.load_state_dict(ckpt["state_dict"])
    model.eval()
    dummy = torch.randn(1, 3, img_size, img_size)
    torch.onnx.export(
        model,
        dummy,
        str(OUT),
        input_names=["input"],
        output_names=["logits"],
        opset_version=17,
    )
    print(f"wrote {OUT} ({len(classes)} classes)")


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1) from exc
