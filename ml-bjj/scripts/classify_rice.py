"""
将 YOLO 格式水稻数据集按类别拷贝到 ml-bjj/data/ 下的中文类文件夹。

默认源：ml-bjj/data/archive_riceLeafDiseases/rice
默认输出：ml-bjj/data/（与小麦/玉米等同级）

用法（在 DetectSystem 项目根）：

  # 先预览（不写盘）
  python ml-bjj/scripts/classify_rice.py --dry-run

  # 正式分类（拷贝图片，保留 YOLO 源目录）
  python ml-bjj/scripts/classify_rice.py

  # 指定路径
  python ml-bjj/scripts/classify_rice.py ^
    --source ml-bjj/data/archive_riceLeafDiseases/rice ^
    --output ml-bjj/data
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data" / "archive_riceLeafDiseases" / "rice"
DEFAULT_OUTPUT = ROOT / "data"

# data.yaml names[] 下标 → 中文类名（写入 data/ 根目录）
# Rice__Healthy 并入统一「健康」，与小麦/玉米/番茄一致
YOLO_TO_CN: dict[str, str] = {
    "Rice__BacterialLeafBlight": "水稻白叶枯病",
    "Rice__BrownSpot": "水稻褐斑病",
    "Rice__Healthy": "健康",
    "Rice__Hispa": "水稻负泥虫为害",
    "Rice__LeafBlast": "稻瘟病",
    "Rice__LeafScald": "水稻叶鞘腐败病",
    "Rice__LeafSmut": "水稻叶黑粉病",
    "Rice__NarrowBrownLeafSpot": "水稻窄条斑病",
    "Rice__NeckBlast": "稻颈瘟",
}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="水稻 YOLO 数据 → data/ 中文类文件夹")
    p.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="含 data.yaml / images / labels 的 rice 目录")
    p.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="输出根目录（各类中文文件夹的父目录）")
    p.add_argument("--dry-run", action="store_true", help="只统计，不拷贝")
    p.add_argument("--move", action="store_true", help="移动而非拷贝（慎用）")
    p.add_argument("--splits", nargs="+", default=["train", "val"], help="处理的 images/labels 子目录")
    return p.parse_args()


def load_class_names(yaml_path: Path) -> list[str]:
    """轻量解析 data.yaml 的 names 列表（不依赖 PyYAML）。"""
    text = yaml_path.read_text(encoding="utf-8")
    names: list[str] = []
    in_names = False
    for line in text.splitlines():
        raw = line.rstrip()
        if re.match(r"^names:\s*$", raw):
            in_names = True
            continue
        if in_names:
            m = re.match(r"^\s*-\s*(.+)$", raw)
            if m:
                names.append(m.group(1).strip().strip("'\""))
                continue
            if raw.strip() and not raw.startswith(" ") and not raw.startswith("\t"):
                break
            if raw.strip().startswith("nc:"):
                break
    # 单行 names: [...] 写法
    if not names:
        m = re.search(r"names:\s*\[([^\]]+)\]", text)
        if m:
            names = [x.strip().strip("'\"") for x in m.group(1).split(",") if x.strip()]
    if not names:
        raise SystemExit(f"无法从 {yaml_path} 解析 names 列表")
    return names


def dominant_class_id(label_path: Path) -> int | None:
    if not label_path.is_file():
        return None
    ids: list[int] = []
    for line in label_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            ids.append(int(float(line.split()[0])))
        except ValueError:
            continue
    if not ids:
        return None
    return Counter(ids).most_common(1)[0][0]


def iter_images(images_dir: Path) -> list[Path]:
    if not images_dir.is_dir():
        return []
    return sorted(p for p in images_dir.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS)


def main() -> None:
    args = parse_args()
    source = args.source.resolve()
    output = args.output.resolve()
    yaml_path = source / "data.yaml"

    if not yaml_path.is_file():
        raise SystemExit(f"找不到 data.yaml: {yaml_path}")

    yolo_names = load_class_names(yaml_path)
    print("=== 水稻 YOLO → 中文类文件夹 ===\n")
    print(f"源目录: {source}")
    print(f"输出根: {output}")
    print(f"YAML 类别 ({len(yolo_names)}):")
    for i, name in enumerate(yolo_names):
        cn = YOLO_TO_CN.get(name, "【未映射-跳过】")
        print(f"  [{i}] {name} → {cn}")

    unknown = [n for n in yolo_names if n not in YOLO_TO_CN]
    if unknown:
        print(f"\n警告: 以下 YAML 类未映射，对应图片将跳过: {unknown}")

    stats: dict[str, int] = defaultdict(int)
    skipped_no_label = 0
    skipped_unknown = 0
    actions: list[tuple[Path, Path]] = []

    for split in args.splits:
        img_dir = source / "images" / split
        lab_dir = source / "labels" / split
        images = iter_images(img_dir)
        print(f"\n扫描 {split}: {len(images)} 张")
        for img in images:
            label = lab_dir / f"{img.stem}.txt"
            cid = dominant_class_id(label)
            if cid is None:
                skipped_no_label += 1
                continue
            if cid < 0 or cid >= len(yolo_names):
                skipped_unknown += 1
                continue
            yolo_name = yolo_names[cid]
            cn = YOLO_TO_CN.get(yolo_name)
            if not cn:
                skipped_unknown += 1
                continue
            # 文件名带类别前缀，避免与小麦/玉米「健康」等同名冲突
            out_name = f"水稻_{split}_{img.name}"
            dst = output / cn / out_name
            actions.append((img, dst))
            stats[cn] += 1

    print("\n将归入各类（张数）:")
    for cn in sorted(stats.keys()):
        print(f"  {cn}: {stats[cn]}")
    print(f"\n跳过: 无标签={skipped_no_label}, 未知/未映射={skipped_unknown}")
    print(f"合计将处理: {len(actions)} 张")

    if args.dry_run:
        print("\n[--dry-run] 未写入磁盘。去掉 --dry-run 再执行一次即可正式分类。")
        return

    for cn in stats:
        (output / cn).mkdir(parents=True, exist_ok=True)

    copied = 0
    for src, dst in actions:
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            continue
        if args.move:
            shutil.move(str(src), str(dst))
        else:
            shutil.copy2(src, dst)
        copied += 1

    meta = {
        "source": str(source),
        "output": str(output),
        "yolo_names": yolo_names,
        "mapping": YOLO_TO_CN,
        "counts": dict(stats),
        "copied_or_moved": copied,
        "mode": "move" if args.move else "copy",
    }
    meta_path = output / "rice_classify_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n完成！实际写入 {copied} 张（已存在则跳过）")
    print(f"记录: {meta_path}")
    print("\n下一步建议:")
    print("  1. 抽查 data/稻瘟病、data/水稻白叶枯病 等文件夹")
    print("  2. 确认无误后可删除 archive_riceLeafDiseases/ 与 *.zip 节省空间")
    print("  3. 再用 prepare 脚本生成 bjj_cls 训练集（后续手册会更新）")


if __name__ == "__main__":
    main()
