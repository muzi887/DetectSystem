# P3 Task 1：病名 × 环境纯函数

> 对应计划：[`新模型训后-P3-规则链与工程化实施计划.md`](../新模型训后-P3-规则链与工程化实施计划.md) Task 1  
> 状态：✅ 已完成（3 项 pytest 通过）

## 子任务解释

识别结果本身只有病名和置信度。本任务做成**不读 HTTP、不读 Mock** 的纯函数，把病名与当前气温/湿度/墒情合成：

1. 非健康 + 高湿（`airRh >= 80`）且病名为稻瘟病/稻颈瘟/小麦赤霉病 → `level` 至少 `high`
2. 非健康 + 墒情偏低（`soilVwc <= 15`）→ 至少 `medium`
3. 非健康 + 高温（`airTemp >= 38`）→ 至少 `high`
4. 健康 + 墒情偏低 → **不升病害级**（仍 `low`），只在 `advice` 里提示
5. 环境缺失或未知病名不升降级；`advice` 为「当前环境：…」再拼防治 `timing` 首句

完整 2.0 耐受计时写 `alerts` 不在本任务范围。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`ml-bjj/serving/disease_env_rules.py`](../../../../ml-bjj/serving/disease_env_rules.py) | `apply_disease_env_rules`：按病名与气象/墒情升降 `low/medium/high` 并生成 `advice` |
| 新增 | [`ml-bjj/tests/test_disease_env_rules.py`](../../../../ml-bjj/tests/test_disease_env_rules.py) | 覆盖高湿升 high、健康干旱不升级、缺环境不改级 |

## 代码内容

### 返回形状

```python
{
    "level": str,          # low | medium | high
    "reasons": list[str],
    "advice": str | None,
}
```

### 接口

```python
apply_disease_env_rules(
    label: str,
    base_level: str,
    env: dict | None,      # airTemp / airRh / soilVwc
    timing: str | None,
) -> dict
```

## 验证

```text
pytest ml-bjj/tests/test_disease_env_rules.py -v
→ 3 passed
```
