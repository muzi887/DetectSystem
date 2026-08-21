# P2 Task 1：识别记录 JSON 存储

> 对应计划：[`新模型训后-P2-闭环与数据实施计划.md`](../实施计划/新模型训后-P2-闭环与数据实施计划.md) Task 1  
> 状态：✅ 已完成（3 项 pytest 通过）

## 子任务解释

智能分析记录不进 Mock `db.json`，而由 Flask 进程读写一份 JSON 列表，便于后续 history / stats / 纠错回写。本任务只做纯函数，不挂 HTTP。

1. **`append_record`**：自增 `id`（从 1 起），补 `createdAt`（UTC ISO-8601）与 `correctedLabel`
2. **`list_records`**：按 `id` 升序（文件中的写入顺序）
3. **`recent_records(limit)`**：按 `createdAt` 降序截取
4. **`stats_by_label`**：`{"total", "counts": [{"label", "count"}, ...]}`，count 降序

读写加线程锁；路径由调用方传入（测试用 `tmp_path`，线上默认见 Task 2）。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`ml-bjj/serving/analysis_store.py`](../../../../ml-bjj/serving/analysis_store.py) | 读写 JSON 识别记录：append / list / recent / stats（带线程锁） |
| 新增 | [`ml-bjj/tests/test_analysis_store.py`](../../../../ml-bjj/tests/test_analysis_store.py) | 验证自增 id、最近列表倒序、按病名统计 |

## 代码内容

### 记录形状

```python
{
    "id": int,
    "pointId": int | None,
    "label": str,
    "confidence": float,
    "cropType": str,
    "level": str,
    "needs_review": bool,
    "imagePath": str | None,
    "createdAt": str,
    "correctedLabel": str | None,
}
```

### 接口

```python
append_record(path: Path, record: dict) -> dict
list_records(path: Path) -> list[dict]
recent_records(path: Path, limit: int = 20) -> list[dict]
stats_by_label(path: Path) -> dict
```

## 验证

```text
pytest ml-bjj/tests/test_analysis_store.py -v
→ 3 passed
```
