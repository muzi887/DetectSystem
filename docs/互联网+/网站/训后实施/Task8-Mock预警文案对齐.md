# Task 8：Mock 预警样例与 23 类中文病名对齐

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../实施计划/新模型训后-后端丰富实施计划.md) Task 8  
> 状态：✅ 已完成（1 项 pytest 通过）

## 子任务解释

决策页用 `parseDiseaseFromAlert` 从 `[AI识别] 监测到 作物 - 病名 (置信度: …)` 里抽出病名再查防治库。Mock 里仍有桃/苹果病名时，会出现「识别了稻瘟、预警写成未知/旧作物」。

本任务把所有 `[AI识别]` 样例的病名改成 23 类键名，作物改为小麦/玉米/番茄/水稻。测试扫描整表，解析出的病名必须属于 `CANONICAL_CLASSES`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | `[AI识别]` 样例病名改为 23 类中文键，作物改为麦/玉/茄/稻 |
| 新增 | [`ml-bjj/tests/test_alert_copy.py`](../../../../ml-bjj/tests/test_alert_copy.py) | 扫描 Mock 预警，解析出的病名必须属于 `CANONICAL_CLASSES` |

## 代码内容

### `ml-bjj/tests/test_alert_copy.py`

```python
import json
import re
from pathlib import Path

from crop_filter import CANONICAL_CLASSES

ROOT = Path(__file__).resolve().parents[2]
DB = ROOT / "src" / "mock" / "db.json"
AI_RE = re.compile(r"\[AI识别\].*?-\s*(.+?)\s*\(置信度")


def test_ai_alerts_use_canonical_labels():
    data = json.loads(DB.read_text(encoding="utf-8"))
    canonical = set(CANONICAL_CLASSES)
    bad = []
    for alert in data["alerts"]:
        message = alert.get("message", "")
        if "[AI识别]" not in message:
            continue
        match = AI_RE.search(message)
        if not match:
            bad.append(("unparsed", message))
            continue
        label = match.group(1).strip()
        if label not in canonical:
            bad.append((label, message))
    assert bad == [], bad
```

### `src/mock/db.json` 文案替换

| id | 新 message |
|----|------------|
| 12 | `[AI识别] 监测到 水稻 - 稻瘟病 (置信度: 88.0%)` |
| 13 | `[AI识别] 监测到 水稻 - 稻颈瘟 (置信度: 96.0%)` |
| 14 | `[AI识别] 监测到 玉米 - 玉米南方锈病 (置信度: 94.0%)` |
| 18 | `[AI识别] 监测到 水稻 - 健康 (置信度: 98.0%)`（`level`: low） |
| 19 | `[AI识别] 监测到 玉米 - 玉米小斑病 (置信度: 88.0%)` |
| 22 | `[AI识别] 监测到 玉米 - 健康 (置信度: 88.0%)`（`level`: low） |
| 24 | `[AI识别] 监测到 水稻 - 水稻白叶枯病 (置信度: 98.0%)` |
| 29 | `[AI识别] 监测到 水稻 - 健康 (置信度: 95.0%)`（原「桃 - 健康」） |
| 30 | `[AI识别] 监测到 玉米 - 玉米褐斑病 (置信度: 93.0%)`（原「桃疮痂病」） |

## 验证

```text
pytest ml-bjj/tests/test_alert_copy.py -v
→ 1 passed
```
