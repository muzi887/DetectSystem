# Task 1：作物掩码纯函数

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../新模型训后-后端丰富实施计划.md) Task 1  
> 状态：✅ 已完成（5 项 pytest 通过）

## 子任务解释

智能分析会带上用户选择的作物（`cropType`：小麦 / 玉米 / 番茄 / 水稻）。23 类模型是**全局分类器**，若不约束，选「小麦」仍可能输出「稻瘟病」。

本任务抽出**不依赖 PyTorch 的纯函数**：

1. 固定 23 类中文标签 `CANONICAL_CLASSES`
2. 按作物给出允许集合 `CROP_CLASS_GROUPS`（该类病害 ∪ 健康）
3. `mask_and_renorm`：把非本作物类别的概率置零，再重新归一化；未知作物（如 `peach`）**不过滤**

后续推理（Task 5）在 softmax 之后调用该函数。本任务不改 Flask 路由、不加载权重。

## 改动文件

| 操作 | 文件 |
|------|------|
| 新增 | [`ml-bjj/serving/crop_filter.py`](../../../../ml-bjj/serving/crop_filter.py) |
| 新增 | [`ml-bjj/tests/conftest.py`](../../../../ml-bjj/tests/conftest.py) |
| 新增 | [`ml-bjj/tests/test_crop_filter.py`](../../../../ml-bjj/tests/test_crop_filter.py) |
| 修改 | [`ml-bjj/requirements.txt`](../../../../ml-bjj/requirements.txt)（增加 `pytest>=8.0.0`） |

## 代码内容

### `ml-bjj/serving/crop_filter.py`

```python
from __future__ import annotations

CANONICAL_CLASSES = [
    "健康",
    "小麦锈病", "小麦赤霉病", "小麦白粉病", "小麦蚜虫为害",
    "玉米大斑病", "玉米锈病", "玉米南方锈病", "玉米小斑病",
    "玉米弯孢叶斑病", "玉米褐斑病", "玉米瘤黑粉病", "玉米茎腐病", "玉米穗腐病",
    "番茄早疫病",
    "水稻白叶枯病", "水稻褐斑病", "水稻负泥虫为害", "稻瘟病",
    "水稻叶鞘腐败病", "水稻叶黑粉病", "水稻窄条斑病", "稻颈瘟",
]

CROP_CLASS_GROUPS = {
    "wheat": {"健康", "小麦锈病", "小麦赤霉病", "小麦白粉病", "小麦蚜虫为害"},
    "corn": {
        "健康", "玉米大斑病", "玉米锈病", "玉米南方锈病", "玉米小斑病",
        "玉米弯孢叶斑病", "玉米褐斑病", "玉米瘤黑粉病", "玉米茎腐病", "玉米穗腐病",
    },
    "tomato": {"健康", "番茄早疫病"},
    "rice": {
        "健康", "水稻白叶枯病", "水稻褐斑病", "水稻负泥虫为害", "稻瘟病",
        "水稻叶鞘腐败病", "水稻叶黑粉病", "水稻窄条斑病", "稻颈瘟",
    },
}


def classes_for_crop(crop_type: str) -> set[str] | None:
    return CROP_CLASS_GROUPS.get(crop_type)


def mask_and_renorm(probs: list[float], classes: list[str], crop_type: str) -> list[float]:
    allowed = classes_for_crop(crop_type)
    if allowed is None or len(probs) != len(classes):
        return list(probs)
    masked = [p if label in allowed else 0.0 for p, label in zip(probs, classes)]
    total = sum(masked)
    if total <= 0:
        return list(probs)
    return [p / total for p in masked]
```

### `ml-bjj/tests/conftest.py`

把 `ml-bjj/serving/` 加入 `sys.path`，使测试可 `import crop_filter`。

```python
from __future__ import annotations

import sys
from pathlib import Path

SERVE_DIR = Path(__file__).resolve().parents[1] / "serving"
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))
```

### `ml-bjj/tests/test_crop_filter.py`

```python
from crop_filter import (
    CANONICAL_CLASSES,
    CROP_CLASS_GROUPS,
    classes_for_crop,
    mask_and_renorm,
)


def test_canonical_count_is_23():
    assert len(CANONICAL_CLASSES) == 23
    assert len(set(CANONICAL_CLASSES)) == 23


def test_every_group_is_subset_of_canonical():
    canonical = set(CANONICAL_CLASSES)
    for labels in CROP_CLASS_GROUPS.values():
        assert labels <= canonical
        assert "健康" in labels


def test_unknown_crop_returns_none():
    assert classes_for_crop("unknown") is None
    assert classes_for_crop("") is None


def test_wheat_zeros_rice_then_renorms():
    classes = ["小麦锈病", "稻瘟病", "健康"]
    probs = [0.2, 0.7, 0.1]
    out = mask_and_renorm(probs, classes, "wheat")
    assert out[1] == 0.0
    assert abs(sum(out) - 1.0) < 1e-9
    assert abs(out[0] - 0.2 / 0.3) < 1e-9
    assert abs(out[2] - 0.1 / 0.3) < 1e-9


def test_unknown_crop_does_not_filter():
    classes = ["小麦锈病", "稻瘟病"]
    probs = [0.4, 0.6]
    assert mask_and_renorm(probs, classes, "peach") == probs
```

### `ml-bjj/requirements.txt` 增量

```text
pytest>=8.0.0
```

## 验证

```text
pytest ml-bjj/tests/test_crop_filter.py -v
→ 5 passed
```
