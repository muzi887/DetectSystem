"""
从 ml-bjj/data/ 下各中文类文件夹收集图片，划分 train/val → data/bjj_cls/

当前 data 约定：一类一个中文文件夹；文件夹内可扁平放图，也可保留一层子目录
（如 小麦锈病/Yellow Rust/*.jpg），脚本会递归收集图片。

用法（项目根 DetectSystem）：
  python ml-bjj/scripts/prepare_from_class_folders.py
  python ml-bjj/scripts/prepare_from_class_folders.py --data-root ml-bjj/data --output ml-bjj/data/bjj_cls

历史 8 类流程（小麦 Kaggle + PlantVillage）见：
  prepare_from_wheat_plantvillage.py
"""

from __future__ import annotations

import argparse
import json
import random
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_ROOT = ROOT / "data"
DEFAULT_OUTPUT = ROOT / "data" / "bjj_cls"

# 训练使用的全部类别（与 data/ 下文件夹名一致；「健康」合并各作物）
V3_CLASSES = [
    "健康",
    "小麦锈病",
    "小麦赤霉病",
    "小麦白粉病",
    "小麦蚜虫为害",
    "玉米大斑病",
    "玉米锈病",
    "玉米南方锈病",
    "玉米小斑病",
    "玉米弯孢叶斑病",
    "玉米褐斑病",
    "玉米瘤黑粉病",
    "玉米茎腐病",
    "玉米穗腐病",
    "番茄早疫病",
    "水稻白叶枯病",
    "水稻褐斑病",
    "水稻负泥虫为害",
    "稻瘟病",
    "水稻叶鞘腐败病",
    "水稻叶黑粉病",
    "水稻窄条斑病",
    "稻颈瘟",
]

# data/ 下非类别目录（跳过）
SKIP_DIR_NAMES = {
    "bjj_cls",
    "hard_cases",
    "archive_riceLeafDiseases",
    "wheatPlantDiseases",
    "plantvillage dataset",
    "corn",
    "rice",
    "__pycache__",
}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="中文类文件夹 → bjj_cls train/val")
    p.add_argument("--data-root", type=Path, default=DEFAULT_DATA_ROOT)
    p.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    p.add_argument("--val-ratio", type=float, default=0.25)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument(
        "--classes",
        nargs="*",
        default=None,
        help="只处理指定类；默认处理 V3_CLASSES 中存在的文件夹",
    )
    return p.parse_args()


def iter_images(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    return [
        p
        for p in folder.rglob("*")
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    ]


def collect_pool(data_root: Path, classes: list[str]) -> dict[str, list[Path]]:
    pool: dict[str, list[Path]] = defaultdict(list)
    for label in classes:
        class_dir = data_root / label
        if not class_dir.is_dir():
            print(f"  警告: 缺少类别目录「{label}」，跳过")
            continue
        images = iter_images(class_dir)
        unique = list({p.resolve(): p for p in images}.values())
        pool[label] = unique
        print(f"  {label}: {len(unique)} 张")
    return pool


def write_split(
    pool: dict[str, list[Path]], out_root: Path, classes: list[str], val_ratio: float, seed: int
) -> tuple[int, int]:
    if out_root.exists():
        shutil.rmtree(out_root)
    train_root = out_root / "train"
    val_root = out_root / "val"
    train_root.mkdir(parents=True)
    val_root.mkdir(parents=True)

    rng = random.Random(seed)
    total_train = total_val = 0

    for label in classes:
        images = pool.get(label, [])
        if not images:
            continue
        rng.shuffle(images)
        val_n = max(1, int(len(images) * val_ratio)) if len(images) > 1 else 0
        if len(images) == 1:
            val_n = 0
        val_set = set(id(p) for p in images[:val_n])

        train_dir = train_root / label
        val_dir = val_root / label
        train_dir.mkdir(parents=True, exist_ok=True)
        if val_n:
            val_dir.mkdir(parents=True, exist_ok=True)

        for i, img in enumerate(images):
            dst_dir = val_dir if id(img) in val_set else train_dir
            out_name = f"{label}_{i:05d}{img.suffix.lower()}"
            shutil.copy2(img, dst_dir / out_name)
            if id(img) in val_set:
                total_val += 1
            else:
                total_train += 1
        print(f"  → {label}: train={len(images) - val_n}, val={val_n}")

    return total_train, total_val


def main() -> None:
    args = parse_args()
    data_root = args.data_root.resolve()
    out_root = args.output.resolve()
    classes = list(args.classes) if args.classes else list(V3_CLASSES)

    print("=== 中文类文件夹 → bjj_cls ===\n")
    print(f"数据根: {data_root}")
    print(f"输出:   {out_root}")
    print(f"类别数: {len(classes)}\n")

    extra = [
        p.name
        for p in data_root.iterdir()
        if p.is_dir() and p.name not in classes and p.name not in SKIP_DIR_NAMES
    ]
    if extra:
        print(f"提示: data/ 下有未列入训练的目录（已忽略）: {extra}\n")

    print("收集图片（含子目录）:")
    pool = collect_pool(data_root, classes)
    present = [c for c in classes if pool.get(c)]
    missing = [c for c in classes if not pool.get(c)]
    if missing:
        print(f"\n缺失/空类 ({len(missing)}): {missing}")

    print(f"\n划分 train/val ({1 - args.val_ratio:.0%}/{args.val_ratio:.0%}):")
    n_train, n_val = write_split(pool, out_root, present, args.val_ratio, args.seed)

    (out_root / "classes.txt").write_text("\n".join(present), encoding="utf-8")
    meta = {
        "version": "bjj-flat-v4",
        "classes": present,
        "missing_classes": missing,
        "data_root": str(data_root),
        "train_images": n_train,
        "val_images": n_val,
        "val_ratio": args.val_ratio,
        "seed": args.seed,
        "note": "递归收集各类中文文件夹内图片；健康为各作物合并类",
    }
    (out_root / "label_map.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print("\n完成！")
    print(f"  train={n_train}, val={n_val}, 类别={len(present)}")
    print("\n下一步:")
    print("  python ml-bjj\\scripts\\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20")


if __name__ == "__main__":
    main()
