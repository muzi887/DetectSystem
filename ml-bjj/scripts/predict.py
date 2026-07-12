"""
用训练好的 v3 模型识别一张叶子图片。

用法：
  python ml-bjj/scripts/predict.py --image D:/test/wheat_leaf.jpg
  python ml-bjj/scripts/predict.py --image 图片.jpg --weights ml-bjj/models/pest-cls-best.pt
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WEIGHTS = ROOT / "models" / "pest-cls-best.pt"

SERVE_DIR = ROOT / "serving"
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))

from inference import PestClassifier  # noqa: E402


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--image", type=Path, required=True, help="待识别图片路径")
    p.add_argument("--weights", type=Path, default=DEFAULT_WEIGHTS, help="模型权重 .pt")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    if not args.weights.is_file():
        raise SystemExit(f"找不到模型 {args.weights}，请先运行 train_cls.py")
    if not args.image.is_file():
        raise SystemExit(f"找不到图片 {args.image}")

    clf = PestClassifier(args.weights)
    label, conf = clf.predict(Image.open(args.image))
    print(f"识别结果: {label}")
    print(f"置信度:   {conf * 100:.2f}%")


if __name__ == "__main__":
    main()
