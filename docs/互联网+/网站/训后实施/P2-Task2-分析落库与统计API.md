# P2 Task 2：分析落库与 history / recent / stats

> 对应计划：[`新模型训后-P2-闭环与数据实施计划.md`](../新模型训后-P2-闭环与数据实施计划.md) Task 2  
> 状态：✅ 已完成（`test_app_p2` + `test_app_api` 共 5 项通过）

## 子任务解释

把 Task 1 的 JSON 存储接到 Flask：

1. **`records_path()`**：`ML_BJJ_RECORDS` 环境变量优先，否则 `ml-bjj/serving/data/analysis_records.json`
2. **`POST /api/analysis/image`**：表单可带 `pointId`（可空）；成功响应增加 `recordId`
3. **`GET /api/analysis/history`**：全量，id 升序
4. **`GET /api/analysis/recent?limit=20`**：按时间倒序
5. **`GET /api/analysis/stats`**：按病名计数
6. 运行时 JSON 不入库：`.gitignore` 忽略 `serving/data/analysis_records.json`；目录保留 `.gitkeep`
7. 测试用 `autouse` fixture 把记录写到 `tmp_path`，避免污染仓库

## 改动文件

| 操作 | 文件 |
|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) |
| 修改 | [`ml-bjj/.gitignore`](../../../../ml-bjj/.gitignore) |
| 修改 | [`ml-bjj/tests/conftest.py`](../../../../ml-bjj/tests/conftest.py) |
| 新增 | [`ml-bjj/serving/data/.gitkeep`](../../../../ml-bjj/serving/data/.gitkeep) |
| 新增 | [`ml-bjj/tests/test_app_p2.py`](../../../../ml-bjj/tests/test_app_p2.py) |

## 代码内容

### 落库（分析成功后、返回 JSON 前）

```python
saved = append_record(
    records_path(),
    {
        "pointId": point_id,
        "label": pred.label,
        "confidence": pred.confidence,
        "cropType": crop_type,
        "level": level,
        "needs_review": pred.needs_review,
        "imagePath": None,
    },
)
```

响应增加 `"recordId": saved["id"]`。

### 查询路由

```python
@app.route("/api/analysis/history", methods=["GET"])
def analysis_history():
    return jsonify({"records": list_records(records_path())}), 200


@app.route("/api/analysis/recent", methods=["GET"])
def analysis_recent():
    limit = int(request.args.get("limit") or 20)
    return jsonify({"records": recent_records(records_path(), limit=limit)}), 200


@app.route("/api/analysis/stats", methods=["GET"])
def analysis_stats():
    return jsonify(stats_by_label(records_path())), 200
```

## 验证

```text
pytest ml-bjj/tests/test_app_p2.py ml-bjj/tests/test_app_api.py -v
→ 5 passed
```
