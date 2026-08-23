"""
对单个中文类文件夹做离线数据增强（旋转、翻转、亮度等），缓解少样本类张数不足。

默认目标：ml-bjj/data/玉米弯孢叶斑病/

用法（项目根 DetectSystem）：

  # 预览（不写盘）
  python ml-bjj/scripts/augment_class.py --dry-run

  # 每张原图额外生成 3 张增强图（默认）
  python ml-bjj/scripts/augment_class.py

  # 指定类名与倍数
  python ml-bjj/scripts/augment_class.py --class 玉米弯孢叶斑病 --per-image 4

  # 完成后重切训练集
  python ml-bjj/scripts/prepare_from_class_folders.py
"""

from __future__ import annotations

import argparse
import random
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CLASS = "玉米弯孢叶斑病"
DEFAULT_DATA_ROOT = ROOT / "data"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
AUG_PREFIX = "aug_"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="单类文件夹离线增强（PIL，无新依赖）")
    p.add_argument("--class", dest="class_name", default=DEFAULT_CLASS, help="中文类文件夹名")
    p.add_argument("--data-root", type=Path, default=DEFAULT_DATA_ROOT, help="data 根目录")
    p.add_argument(
        "--per-image",
        type=int,
        default=3,
        help="每张原图额外生成的增强图数量（默认 3）",
    )
    p.add_argument("--seed", type=int, default=42, help="随机种子，便于复现")
    p.add_argument("--dry-run", action="store_true", help="只统计，不写盘")
    return p.parse_args()


def is_source_image(path: Path) -> bool:
    if not path.is_file() or path.suffix.lower() not in IMAGE_EXTS:
        return False
    # 跳过已是增强产物的文件，避免重复跑时指数膨胀
    return not path.name.startswith(AUG_PREFIX)


def list_sources(class_dir: Path) -> list[Path]:
    return sorted(p for p in class_dir.iterdir() if is_source_image(p))


def augment_once(img: Image.Image, rng: random.Random) -> Image.Image:
    out = img.copy()

    if rng.random() < 0.5:
        out = ImageOps.mirror(out)

    angle = rng.choice([-12, -8, -5, 5, 8, 12])
    out = out.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)

    brightness = rng.uniform(0.85, 1.15)
    out = ImageEnhance.Brightness(out).enhance(brightness)

    contrast = rng.uniform(0.9, 1.1)
    out = ImageEnhance.Contrast(out).enhance(contrast)

    # 轻微中心裁剪再缩回原尺寸，模拟不同取景
    w, h = out.size
    crop_ratio = rng.uniform(0.88, 0.96)
    cw, ch = int(w * crop_ratio), int(h * crop_ratio)
    left = (w - cw) // 2
    top = (h - ch) // 2
    out = out.crop((left, top, left + cw, top + ch))
    out = out.resize((w, h), resample=Image.Resampling.BICUBIC)

    return out


def next_aug_path(class_dir: Path, src: Path, variant: int) -> Path:
    stem = src.stem
    ext = src.suffix.lower()
    if ext == ".jpeg":
        ext = ".jpg"
    return class_dir / f"{AUG_PREFIX}{variant:02d}_{stem}{ext}"


def main() -> None:
    args = parse_args()
    rng = random.Random(args.seed)

    class_dir = (args.data_root / args.class_name).resolve()
    if not class_dir.is_dir():
        raise SystemExit(f"找不到类文件夹: {class_dir}")

    sources = list_sources(class_dir)
    print(f"=== 离线增强: {args.class_name} ===\n")
    print(f"目录: {class_dir}")
    print(f"原图（不含 {AUG_PREFIX}*）: {len(sources)} 张")
    print(f"每张额外生成: {args.per_image} 张")
    print(f"预计新增: {len(sources) * args.per_image} 张")

    if not sources:
        raise SystemExit("没有可增强的原图。")

    planned = 0
    written = 0
    skipped_exists = 0

    for src in sources:
        try:
            with Image.open(src) as im:
                base = im.convert("RGB")
        except OSError as e:
            print(f"  跳过无法读取: {src.name} ({e})")
            continue

        for i in range(1, args.per_image + 1):
            dst = next_aug_path(class_dir, src, i)
            planned += 1
            if dst.exists():
                skipped_exists += 1
                continue
            if args.dry_run:
                continue
            aug = augment_once(base, rng)
            save_kwargs: dict = {}
            if dst.suffix.lower() in {".jpg", ".jpeg"}:
                save_kwargs["quality"] = 92
            aug.save(dst, **save_kwargs)
            written += 1

    print(f"\n计划写入: {planned} 张")
    if args.dry_run:
        print("[--dry-run] 未写入磁盘。去掉 --dry-run 再执行。")
        return

    print(f"实际写入: {written} 张（已存在则跳过: {skipped_exists}）")
    total = sum(1 for p in class_dir.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS)
    print(f"该类文件夹现共: {total} 张")
    print("\n下一步:")
    print("  python ml-bjj\\scripts\\prepare_from_class_folders.py")
    print("  python ml-bjj\\scripts\\train_cls.py --epochs 20")


if __name__ == "__main__":
    main()
