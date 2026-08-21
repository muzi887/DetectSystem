# P3 Task 5：可选 ONNX 导出与加载

> 对应计划：[`新模型训后-P3-规则链与工程化实施计划.md`](../新模型训后-P3-规则链与工程化实施计划.md) Task 5  
> 状态：✅ 已完成（全量 31 项 pytest 通过；本机手工导出因缺 `onnxscript` 失败，不作为 CI 必过项）

## 子任务解释

默认仍加载 `.pt`。仅当 `ML_BJJ_ONNX=1` **且** 存在 `pest-cls-best.onnx` 时，用 onnxruntime 跑前向，后面的 softmax / 作物掩码 / topk 与 PyTorch 路径相同。

1. `use_onnx()`：环境变量是否为 `"1"`
2. `python ml-bjj/scripts/export_onnx.py` 写出 `ml-bjj/models/pest-cls-best.onnx`（`.gitignore` 已忽略 `*.onnx`）
3. 导出失败 `SystemExit` 非 0；本机当前缺 `onnxscript`，允许失败，不降低 23 类启动门禁

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`ml-bjj/scripts/export_onnx.py`](../../../../ml-bjj/scripts/export_onnx.py) | 从 `.pt` 导出 ONNX（opset 17） |
| 修改 | [`ml-bjj/serving/inference.py`](../../../../ml-bjj/serving/inference.py) | `ML_BJJ_ONNX=1` 且 onnx 文件存在时用 InferenceSession |
| 新增 | [`ml-bjj/tests/test_onnx_flag.py`](../../../../ml-bjj/tests/test_onnx_flag.py) | 未设环境变量时 `use_onnx()` 为 False，不强制 ONNX |

## 代码内容

### 开关

```python
def use_onnx() -> bool:
    return os.environ.get("ML_BJJ_ONNX") == "1"
```

### 推理分叉

`PestClassifier` 在标志开启且 onnx 文件存在时创建 `onnx_session`；`predict_detailed` 用 `session.run(..., {"input": tensor})` 得到 logits，再 `softmax` → `mask_and_renorm` / `rank_topk`。测试里用 `__new__` 构造的假模型靠 `getattr(self, "onnx_session", None)` 回退到 PyTorch。

## 验证

```text
pytest ml-bjj/tests -v
→ 31 passed

python ml-bjj/scripts/export_onnx.py
→ 本机：No module named 'onnxscript'（允许失败）
```
