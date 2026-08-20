# P2 Task 3：纠错反馈写入 `hard_cases`

> 对应计划：[`新模型训后-P2-闭环与数据实施计划.md`](../新模型训后-P2-闭环与数据实施计划.md) Task 3  
> 状态：✅ 已完成（`test_app_p2` + `test_analysis_store` 共 6 项通过）

## 子任务解释

低置信识别允许用户提交「实际病名」和原图，回流到再训练难例目录：

1. **`POST /api/analysis/feedback`**：multipart `file` + `correctedLabel`（必须 ∈ 23 类）+ 可选 `recordId`
2. 图片写入 `ml-bjj/data/hard_cases/pending/<中文类名>/YYYYMMDDTHHMMSS_<stem>.<ext>`
3. 若带 `recordId`，用公开接口 `update_record` 回写 `correctedLabel`（不从外部导入 `_read/_write/_LOCK`）
4. `hard_cases_pending_root()` 可用 `ML_BJJ_HARD_CASES` 覆盖（测试用 `tmp_path`）
5. `.gitignore` 改为只忽略 `/data/`，并放行 `pending/.gitkeep`；同时不再误忽略 `serving/data/`

未知类名返回 400：`{"error": "correctedLabel 不在 23 类中"}`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | 新增 `POST /api/analysis/feedback`，把纠错图写入 `hard_cases/pending` |
| 修改 | [`ml-bjj/serving/analysis_store.py`](../../../../ml-bjj/serving/analysis_store.py) | 新增公开 `update_record`，回写记录上的 `correctedLabel` |
| 修改 | [`ml-bjj/tests/test_app_p2.py`](../../../../ml-bjj/tests/test_app_p2.py) | 覆盖纠错落盘、路径含正确类名、history 回写 |
| 修改 | [`ml-bjj/.gitignore`](../../../../ml-bjj/.gitignore) | 只忽略 `/data/` 内容，放行 `pending/.gitkeep`，不再误忽略 `serving/data/` |
| 新增 | [`ml-bjj/data/hard_cases/pending/.gitkeep`](../../../../ml-bjj/data/hard_cases/pending/.gitkeep) | 保留难例回流目录结构，大图本身不入库 |
| 新增 | [`ml-bjj/serving/data/.gitkeep`](../../../../ml-bjj/serving/data/.gitkeep) | Task 2 补记：此前被泛匹配 `data/` 误忽略 |

## 代码内容

### `update_record`

```python
def update_record(path: Path, record_id: int, **fields) -> dict | None:
    with _LOCK:
        rows = _read(path)
        found = None
        for row in rows:
            if row.get("id") == record_id:
                row.update(fields)
                found = row
        _write(path, rows)
        return found
```

### 反馈路由

成功 `{ "ok": true, "savedPath": str, "recordId": int | null }`。

## 验证

```text
pytest ml-bjj/tests/test_app_p2.py ml-bjj/tests/test_analysis_store.py -v
→ 6 passed
```
