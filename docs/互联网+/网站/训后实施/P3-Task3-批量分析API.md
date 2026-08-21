# P3 Task 3：批量分析 `POST /api/analysis/batch`

> 对应计划：[`新模型训后-P3-规则链与工程化实施计划.md`](../新模型训后-P3-规则链与工程化实施计划.md) Task 3  
> 状态：✅ 已完成（`test_app_p3` + `test_app_api` 5 项通过；`vue-tsc --noEmit` 退出 0）

## 子任务解释

一次请求识别多张图，共用表单里的作物和环境字段：

1. **`POST /api/analysis/batch`**：multipart 字段名 `files`（多个）
2. 返回 `{ "code": 200, "results": [ 与单张成功体相同的对象, ... ] }`
3. 单张校验失败时该项为 `{ "error", "filename" }`，HTTP 仍 200；一张都没有 → 400
4. 抽出 `_analyze_one`，单张与批量共用推理、作物过滤、`env_context`、落库
5. 分析页最小入口：多选文件 +「批量识别」；成功提示完成张数，并展示第一张结果（不做画廊）

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | `_analyze_one` 供单张/批量复用；新增 `/api/analysis/batch` |
| 修改 | [`ml-bjj/tests/test_app_p3.py`](../../../../ml-bjj/tests/test_app_p3.py) | 两张 JPEG 批量返回 2 条，首条病名为稻瘟病 |
| 修改 | [`src/api/analysis.ts`](../../../../src/api/analysis.ts) | `analyzeBatch`：FormData 多次 `append('files', file)` |
| 修改 | [`src/views/user/DataAnalysis.vue`](../../../../src/views/user/DataAnalysis.vue) | 多选上传 + 批量识别按钮，展示第一张结果 |

## 代码内容

### 批量路由

```python
@app.route("/api/analysis/batch", methods=["POST"])
def analysis_batch():
    files = [item for item in request.files.getlist("files") if item and item.filename]
    if not files:
        return jsonify({"error": "未找到文件"}), 400
    ...
    return jsonify({"code": 200, "results": results}), 200
```

### 前端

```ts
export const analyzeBatch = (data: { files: File[]; cropType: string; ... }) => {
  const formData = new FormData()
  data.files.forEach((file) => formData.append('files', file))
  ...
  return http.post('/analysis/batch', formData)
}
```

## 验证

```text
pytest ml-bjj/tests/test_app_p3.py ml-bjj/tests/test_app_api.py -v
→ 5 passed

pnpm exec vue-tsc --noEmit
→ exit 0
```
