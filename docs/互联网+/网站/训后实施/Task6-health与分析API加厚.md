# Task 6：加厚 `/health` 与分析响应，新增防治 GET

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../新模型训后-后端丰富实施计划.md) Task 6  
> 状态：✅ 已完成（3 项 pytest 通过）

## 子任务解释

把前面纯函数接到 HTTP 层，使网站能直接用加厚后的 JSON：

1. **`GET /health`**：返回 `classes_count` / `classes` / `model_version` / `weights_mtime` / `cuda` / `engine`
2. **`POST /api/analysis/image`**：增加 `topk`、`needs_review`、`model_version`、`treatment`；`details.engine` 改为 `bjj-23`（Mock 为 `mock`）；`isReliable` = `not needs_review`；真实推理走 `predict_detailed` 并带上 `cropType`
3. **`GET /api/treatments`**、**`GET /api/treatments/<label>`**：只读防治库
4. **Vite**：`/api/treatments` 代理到 5000，且写在泛 `/api` 规则之前
5. **启动**：非 Mock 时校验权重 classes 与 meta 一致，且必须为 23 类（当前仓库若仍是 8 类权重，直接 `python app.py` 会拒绝启动，见 Task 9）

## 改动文件

| 操作 | 文件 |
|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) |
| 修改 | [`vite.config.ts`](../../../../vite.config.ts) |
| 新增 | [`ml-bjj/tests/test_app_api.py`](../../../../ml-bjj/tests/test_app_api.py) |

## 代码内容

### 分析成功响应形状

```python
{
    "code": 200,
    "message": "success",
    "result": pred.label,
    "confidence": pred.confidence,
    "level": level,
    "topk": pred.topk,
    "needs_review": pred.needs_review,
    "model_version": model_version_payload(meta),
    "treatment": treatment,
    "details": {
        "received_crop": crop_type,
        "crop_label": CROP_LABELS.get(crop_type, "未知作物"),
        "category": category,
        "additionalInfo": additional_info,
        "isReliable": not pred.needs_review,
        "engine": engine_name(),
        "weights": str(resolve_weights_path()) if not use_mock() else None,
    },
}
```

### 防治路由

```python
@app.route("/api/treatments", methods=["GET"])
def treatments_all():
    return jsonify(load_catalog()), 200


@app.route("/api/treatments/<label>", methods=["GET"])
def treatments_one(label: str):
    item, found = get_treatment_item(label)
    return jsonify({"label": label, "found": found, "item": item}), 200
```

### `vite.config.ts` 代理增量

```ts
        '/api/analysis': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
        },
        '/api/treatments': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
```

完整 `app.py` 见链接（含 `load_model_meta`、`mock_predict` 作物约束、启动 23 类校验）。

## 验证

```text
pytest ml-bjj/tests/test_app_api.py -v
→ 3 passed
```
