# P2 Task 5：首页近期识别 + 关于页模型版本

> 对应计划：[`新模型训后-P2-闭环与数据实施计划.md`](../实施计划/新模型训后-P2-闭环与数据实施计划.md) Task 5  
> 状态：✅ 已完成（全量 25 项 pytest 通过；`vue-tsc --noEmit` 退出 0）

## 子任务解释

开发环境 Vite 不代理 `/health`，因此关于页不直接打 health，而是走已代理的分析前缀：

1. **`GET /api/analysis/model-info`**：`model_version_payload` + `engine` + `classes`
2. **首页**：`GET /api/analysis/recent?limit=5`，在「最新预警动态」下方展示病名与置信度；Flask 未开时静默失败，不挡首页
3. **关于页**「系统实现」卡片追加：`模型 N 类 · 验证 xx.xx%`

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | 新增 `GET /api/analysis/model-info`，给关于页返回类别数与验证准确率 |
| 修改 | [`ml-bjj/tests/test_app_p2.py`](../../../../ml-bjj/tests/test_app_p2.py) | 覆盖 model-info 的 `classes_count` 与 `engine` |
| 修改 | [`src/views/user/Home.vue`](../../../../src/views/user/Home.vue) | 在预警下方展示最近 5 条识别；Flask 未开时静默失败 |
| 修改 | [`src/views/user/About.vue`](../../../../src/views/user/About.vue) | 「系统实现」卡片显示模型类别数与验证准确率 |

`fetchAnalysisRecent` / `fetchAnalysisModelInfo` 已在 Task 4 的 [`src/api/analysis.ts`](../../../../src/api/analysis.ts) 导出。

## 代码内容

### model-info

```python
@app.route("/api/analysis/model-info", methods=["GET"])
def model_info():
    meta = load_model_meta()
    payload = model_version_payload(meta)
    payload["engine"] = engine_name()
    payload["classes"] = meta.get("classes") or []
    return jsonify(payload), 200
```

## 验证

```text
pytest ml-bjj/tests -v
→ 25 passed

pnpm exec vue-tsc --noEmit
→ exit 0
```
