"""
从 Kaggle 小麦包 + PlantVillage 玉米/番茄 整理为 8 类 bjj_cls（历史 v3 流程）

用法（项目根目录 DetectSystem）：
  python ml-bjj/scripts/prepare_from_wheat_plantvillage.py

  python ml-bjj/scripts/prepare_from_wheat_plantvillage.py ^
    --wheat-source ml-bjj/data/wheatPlantDiseases/data ^
    --plantvillage-source "ml-bjj/data/plantvillage dataset/color" ^
    --output ml-bjj/data/bjj_cls

说明见 docs/互联网+/京津冀AI模型精简方案-v3.md
"""

from __future__ import annotations

import argparse
import json
import random
import re
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# 原始数据（仅 prepare_from_wheat_plantvillage.py 读取；train_cls.py 不读）
# - wheatPlantDiseases：Kaggle 小麦图，英文类名，供合并为 5 类小麦相关 v3 标签
# - plantvillage dataset/color：玉米/番茄公开数据集，5 个文件夹 → 3 类 v3 标签 + 健康
DEFAULT_WHEAT = ROOT / "data" / "wheatPlantDiseases" / "data"
DEFAULT_PV = ROOT / "data" / "plantvillage dataset" / "color"
# 整理后的 8 类训练集（train_cls.py 默认读这里）
DEFAULT_OUTPUT = ROOT / "data" / "bjj_cls"

# PlantVillage 文件夹名 → v3 标签（None = 本方案不使用，桃/苹果等直接忽略）
PLANTVILLAGE_TO_V3: dict[str, str | None] = {
    "Corn_(maize)___Common_rust_": "玉米锈病",
    "Corn_(maize)___Northern_Leaf_Blight": "玉米大斑病",
    "Corn_(maize)___healthy": "健康",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": None,
    "Tomato___Early_blight": "番茄早疫病",
    "Tomato___healthy": "健康",
    # 以下番茄类 v3 暂不纳入
    "Tomato___Late_blight": None,
    "Tomato___Bacterial_spot": None,
    "Tomato___Leaf_Mold": None,
    "Tomato___Septoria_leaf_spot": None,
    "Tomato___Spider_mites Two-spotted_spider_mite": None,
    "Tomato___Target_Spot": None,
    "Tomato___Tomato_mosaic_virus": None,
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": None,
}

# 小麦英文类名（train 或 valid/test 规范化后）→ v3
WHEAT_TO_V3: dict[str, str | None] = {
    "Yellow Rust": "小麦锈病",
    "Brown Rust": "小麦锈病",
    "Black Rust": "小麦锈病",
    "Fusarium Head Blight": "小麦赤霉病",
    "Mildew": "小麦白粉病",
    "Aphid": "小麦蚜虫为害",
    "Mite": "小麦蚜虫为害",
    "Stem fly": "小麦蚜虫为害",
    "Healthy": "健康",
    "Blast": None,
    "Common Root Rot": None,
    "Leaf Blight": None,
    "Septoria": None,
    "Smut": None,
    "Tan spot": None,
}

V3_CLASSES = [
    "健康",
    "小麦锈病",
    "小麦赤霉病",
    "小麦白粉病",
    "小麦蚜虫为害",
    "玉米大斑病",
    "玉米锈病",
    "番茄早疫病",
]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="整理京津冀 v3 数据集（8 类）")
    p.add_argument("--wheat-source", type=Path, default=DEFAULT_WHEAT)
    p.add_argument("--plantvillage-source", type=Path, default=DEFAULT_PV)
    p.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    p.add_argument("--val-ratio", type=float, default=0.25)
    p.add_argument("--seed", type=int, default=42)
    return p.parse_args()


def normalize_wheat_folder(name: str) -> str:
    if name in WHEAT_TO_V3:
        return name
    base = re.sub(r"_(valid|test)(_.*)?$", "", name, flags=re.IGNORECASE)
    base = base.replace("_", " ").strip()
    title = " ".join(w.capitalize() for w in base.split())
    fixes = {"Stem Fly": "Stem fly", "Tan Spot": "Tan spot"}
    return fixes.get(title, title)


def iter_images(folder: Path) -> list[Path]:
    if not folder.is_dir():
        return []
    return [
        p
        for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    ]


def collect_wheat(wheat_root: Path, pool: dict[str, list[Path]]) -> int:
    count = 0
    for split in ("train", "valid", "test"):
        split_dir = wheat_root / split
        if not split_dir.is_dir():
            continue
        for class_dir in split_dir.iterdir():
            if not class_dir.is_dir():
                continue
            canonical = normalize_wheat_folder(class_dir.name)
            v3 = WHEAT_TO_V3.get(canonical)
            if v3 is None:
                continue
            for img in iter_images(class_dir):
                pool[v3].append(img)
                count += 1
    return count


def collect_plantvillage(pv_root: Path, pool: dict[str, list[Path]]) -> tuple[int, list[str]]:
    count = 0
    skipped: list[str] = []
    if not pv_root.is_dir():
        raise SystemExit(f"PlantVillage 目录不存在: {pv_root}")

    for class_dir in sorted(pv_root.iterdir()):
        if not class_dir.is_dir():
            continue
        name = class_dir.name
        # 桃、苹果等：不在映射表且非玉米/番茄前缀 → 跳过
        if name not in PLANTVILLAGE_TO_V3:
            if not name.startswith("Corn_(maize)___") and not name.startswith("Tomato___"):
                continue
            skipped.append(name)
            continue
        v3 = PLANTVILLAGE_TO_V3[name]
        if v3 is None:
            skipped.append(name)
            continue
        for img in iter_images(class_dir):
            pool[v3].append(img)
            count += 1
    return count, skipped


def write_split(pool: dict[str, list[Path]], out_root: Path, val_ratio: float, seed: int) -> tuple[int, int]:
    if out_root.exists():
        shutil.rmtree(out_root)
    train_root = out_root / "train"
    val_root = out_root / "val"
    train_root.mkdir(parents=True)
    val_root.mkdir(parents=True)

    rng = random.Random(seed)
    total_train = total_val = 0

    for label in V3_CLASSES:
        images = pool.get(label, [])
        if not images:
            print(f"  警告: v3 类别「{label}」无图片，请检查数据源")
            continue
        unique = list({p.resolve(): p for p in images}.values())
        rng.shuffle(unique)
        val_n = max(1, int(len(unique) * val_ratio))
        val_set = set(id(p) for p in unique[:val_n])

        train_dir = train_root / label
        val_dir = val_root / label
        train_dir.mkdir(parents=True, exist_ok=True)
        val_dir.mkdir(parents=True, exist_ok=True)

        for i, img in enumerate(unique):
            dst_dir = val_dir if id(img) in val_set else train_dir
            ext = img.suffix.lower()
            out_name = f"{label}_{i:05d}{ext}"
            shutil.copy2(img, dst_dir / out_name)
            if id(img) in val_set:
                total_val += 1
            else:
                total_train += 1
        print(f"  {label}: total={len(unique)}, train={len(unique) - val_n}, val={val_n}")

    return total_train, total_val


def main() -> None:
    args = parse_args()
    wheat_root = args.wheat_source.resolve()
    pv_root = args.plantvillage_source.resolve()
    out_root = args.output.resolve()

    pool: dict[str, list[Path]] = defaultdict(list)

    print("=== 京津冀 v3 数据整理 ===\n")
    print(f"小麦源: {wheat_root}")
    n_wheat = collect_wheat(wheat_root, pool)
    print(f"  纳入小麦图片: {n_wheat} 张")

    print(f"\nPlantVillage 源: {pv_root}")
    print("  仅使用: 玉米 Common_rust / Northern_Leaf_Blight / healthy")
    print("          番茄 Early_blight / healthy")
    print("  忽略: Peach___*、Apple___* 及其他番茄/玉米子类")
    n_pv, skipped = collect_plantvillage(pv_root, pool)
    print(f"  纳入 PlantVillage 图片: {n_pv} 张")
    if skipped:
        print(f"  已跳过 {len(skipped)} 个文件夹（未纳入 v3）")

    print(f"\n按 v3 标签划分 train/val ({1 - args.val_ratio:.0%}/{args.val_ratio:.0%}) → {out_root}")
    n_train, n_val = write_split(pool, out_root, args.val_ratio, args.seed)

    classes = [c for c in V3_CLASSES if (out_root / "train" / c).is_dir()]
    (out_root / "classes.txt").write_text("\n".join(classes), encoding="utf-8")

    meta = {
        "version": "bjj-v3",
        "classes": classes,
        "wheat_source": str(wheat_root),
        "plantvillage_source": str(pv_root),
        "plantvillage_used": [k for k, v in PLANTVILLAGE_TO_V3.items() if v],
        "plantvillage_skipped_count": len(skipped),
        "train_images": n_train,
        "val_images": n_val,
    }
    (out_root / "label_map.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print("\n完成！")
    print(f"  train={n_train}, val={n_val}, 类别={len(classes)}")
    print(f"  类别: {classes}")
    print("\n下一步（重训 v3 模型）：")
    print("  python ml-bjj\\scripts\\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20")


if __name__ == "__main__":
    main()
