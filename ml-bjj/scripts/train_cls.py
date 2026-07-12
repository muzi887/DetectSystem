"""
京津冀 v3 图像分类 — 训练脚本

前置：已运行 prepare_bjj.py 生成 ml-bjj/data/bjj_cls/

用法（项目根目录 DetectSystem）：
  python ml-bjj/scripts/train_cls.py
  python ml-bjj/scripts/train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20

训练完成后权重在 ml-bjj/models/pest-cls-best.pt
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

import timm
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from tqdm import tqdm

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_DIR = ROOT / "data" / "bjj_cls"
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 15
LR = 3e-4
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def build_loaders(data_dir: Path) -> tuple[DataLoader, DataLoader, list[str]]:
    train_tf = transforms.Compose(
        [
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(0.2, 0.2, 0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )
    val_tf = transforms.Compose(
        [
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ]
    )

    train_ds = datasets.ImageFolder(data_dir / "train", transform=train_tf)
    val_ds = datasets.ImageFolder(data_dir / "val", transform=val_tf)
    classes = train_ds.classes

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    return train_loader, val_loader, classes


def evaluate(model: nn.Module, loader: DataLoader) -> tuple[float, float]:
    model.eval()
    correct = total = 0
    loss_sum = 0.0
    criterion = nn.CrossEntropyLoss()
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            logits = model(images)
            loss_sum += criterion(logits, labels).item() * labels.size(0)
            pred = logits.argmax(dim=1)
            correct += (pred == labels).sum().item()
            total += labels.size(0)
    return correct / max(total, 1), loss_sum / max(total, 1)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="病虫害图像分类训练")
    p.add_argument(
        "--data-dir",
        type=Path,
        default=DEFAULT_DATA_DIR,
        help="含 train/val 的数据集目录，默认 bjj_cls",
    )
    p.add_argument("--epochs", type=int, default=EPOCHS)
    return p.parse_args()


def main() -> None:
    args = parse_args()
    data_dir = args.data_dir.resolve()
    epochs = args.epochs

    if not (data_dir / "train").is_dir():
        raise SystemExit(
            f"找不到训练数据 {data_dir / 'train'}\n"
            "请先运行 prepare_bjj.py，见 docs/互联网+/京津冀AI模型精简方案-v3.md"
        )

    print(f"数据目录: {data_dir}")
    print(f"设备: {DEVICE}")
    print("正在加载数据…")
    train_loader, val_loader, classes = build_loaders(data_dir)
    num_classes = len(classes)
    print(f"类别数: {num_classes} → {classes}")

    print("正在下载/加载预训练模型 efficientnet_b0（首次会自动从网络下载权重）…")
    model = timm.create_model("efficientnet_b0", pretrained=True, num_classes=num_classes)
    model = model.to(DEVICE)

    optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

    best_acc = 0.0
    history = []

    for epoch in range(1, epochs + 1):
        model.train()
        running_loss = 0.0
        pbar = tqdm(train_loader, desc=f"Epoch {epoch}/{epochs}")
        for images, labels in pbar:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
            pbar.set_postfix(loss=f"{loss.item():.4f}")

        val_acc, val_loss = evaluate(model, val_loader)
        history.append({"epoch": epoch, "val_acc": val_acc, "val_loss": val_loss})
        print(f"  验证准确率: {val_acc * 100:.2f}%  验证损失: {val_loss:.4f}")

        if val_acc > best_acc:
            best_acc = val_acc
            ckpt = {
                "model_name": "efficientnet_b0",
                "state_dict": model.state_dict(),
                "classes": classes,
                "img_size": IMG_SIZE,
                "best_val_acc": best_acc,
            }
            out_path = MODEL_DIR / "pest-cls-best.pt"
            torch.save(ckpt, out_path)
            print(f"  ★ 保存最佳模型 → {out_path}")

    meta = {
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "best_val_acc": best_acc,
        "epochs": epochs,
        "classes": classes,
        "device": DEVICE,
        "history": history,
    }
    (MODEL_DIR / "pest-cls-meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n训练完成！")
    print(f"  最佳验证准确率: {best_acc * 100:.2f}%")
    print(f"  模型文件: {MODEL_DIR / 'pest-cls-best.pt'}")
    print("\n测试单张图片：")
    print("  python ml-bjj/scripts/predict.py --image 路径/某张叶子.jpg")


if __name__ == "__main__":
    main()
