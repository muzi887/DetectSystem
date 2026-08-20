# Task 3：防治库加载器与覆盖红灯测试

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../新模型训后-后端丰富实施计划.md) Task 3  
> 状态：✅ 加载器已落地；覆盖测试 **故意红灯**（缺 15 类），由 Task 4 补绿

## 子任务解释

防治文案源文件是 [`ml-bjj/knowledge/treatments.json`](../../../../ml-bjj/knowledge/treatments.json)，目前只有旧 8 类。本任务做两件事：

1. 在 serving 侧提供 `load_catalog()` / `get_treatment_item(label)`，供后续分析接口附带防治片段。
2. 先写「必须覆盖全部 23 类」的测试并看着它失败，避免还没扩库就宣称完成。

未知病名 **禁止** 回落成「健康」条目，改为返回「暂无「某病」的防治条目…」降级对象，`found=False`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`ml-bjj/serving/knowledge.py`](../../../../ml-bjj/serving/knowledge.py) | 加载防治库；按病名取条目，未知类不回落「健康」 |
| 新增 | [`ml-bjj/tests/test_treatments_coverage.py`](../../../../ml-bjj/tests/test_treatments_coverage.py) | 要求覆盖全部 23 类（本任务故意红灯，Task 4 补绿） |

本任务 **不改** `treatments.json`。

## 代码内容

### `ml-bjj/serving/knowledge.py`

```python
from __future__ import annotations

import json
from pathlib import Path

KNOWLEDGE_PATH = Path(__file__).resolve().parents[1] / "knowledge" / "treatments.json"


def load_catalog() -> dict:
    return json.loads(KNOWLEDGE_PATH.read_text(encoding="utf-8"))


def get_treatment_item(label: str) -> tuple[dict, bool]:
    items = load_catalog().get("items", {})
    if label in items:
        return items[label], True
    fallback = {
        "crop": "通用",
        "crop_en": "general",
        "aliases": [],
        "summary": f"暂无「{label}」的防治条目，请以田间复核与当地植保意见为准。",
        "risk_level": "medium",
        "symptoms": [],
        "measures": {
            "chemical": [],
            "biological": [],
            "agronomic": ["保留清晰样本照片与拍摄时间，送农技员复核后再用药。"],
        },
        "timing": "",
        "safety": "在确认病名之前不要盲目施药。",
        "references": [],
    }
    return fallback, False
```

### `ml-bjj/tests/test_treatments_coverage.py`

```python
from crop_filter import CANONICAL_CLASSES
from knowledge import get_treatment_item, load_catalog


def test_catalog_covers_all_canonical_labels():
    items = load_catalog()["items"]
    missing = [label for label in CANONICAL_CLASSES if label not in items]
    assert missing == [], f"treatments.json 缺少: {missing}"


def test_each_item_has_summary_and_measures():
    items = load_catalog()["items"]
    for label in CANONICAL_CLASSES:
        item = items[label]
        assert item["summary"].strip()
        assert "measures" in item


def test_missing_label_does_not_fallback_to_healthy():
    item, found = get_treatment_item("不存在的病名XYZ")
    assert found is False
    assert item["crop"] == "通用"
    assert "暂无" in item["summary"]
    assert "不存在的病名XYZ" in item["summary"]
    assert item is not load_catalog()["items"]["健康"]
```

## 验证

```text
pytest ml-bjj/tests/test_treatments_coverage.py -v
→ test_missing_label_does_not_fallback_to_healthy PASSED
→ test_catalog_covers_all_canonical_labels FAILED（缺 15 个玉米/水稻类）
→ test_each_item_has_summary_and_measures FAILED（KeyError）
```
