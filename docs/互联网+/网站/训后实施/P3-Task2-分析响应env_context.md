# P3 Task 2：分析响应附带 `env_context`

> 对应计划：[`新模型训后-P3-规则链与工程化实施计划.md`](../实施计划/新模型训后-P3-规则链与工程化实施计划.md) Task 2  
> 状态：✅ 已完成（`test_app_p3` + 既有 API 共 8 项通过）

## 子任务解释

把 Task 1 接到单张分析接口：

1. 表单可选 `airTemp` / `airRh` / `soilVwc`
2. 三个都空且带了 `pointId` 时，GET `{ML_BJJ_MOCK_ORIGIN}/weatherReadings`（默认 Mock :3000）按监测点取一条
3. 用规则后的 `level` **覆盖** `classify_level`（健康+干旱仍为 `low`）
4. 成功 JSON 增加 `env_context`：环境读数 + `level` / `reasons` / `advice`
5. 落库的 `level` 也用规则后的值，前端 `createAlert` 会带上升级后的 high

读 Mock 失败则当作没有环境，不升降级。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | 解析环境字段、可选拉取监测点气象、调用规则并写入 `env_context` |
| 新增 | [`ml-bjj/tests/test_app_p3.py`](../../../../ml-bjj/tests/test_app_p3.py) | 稻瘟病 + 高湿时 `level` 从 medium 升到 high，且带 `reasons` |

## 代码内容

### 环境解析与 Mock 气象

```python
def parse_env_from_request() -> dict | None: ...
def fetch_point_weather(point_id: int) -> dict | None: ...
```

### 分析成功后（落库前）

```python
env = parse_env_from_request()
if env is None and point_id is not None:
    env = fetch_point_weather(point_id)
env_out = apply_disease_env_rules(pred.label, level, env, treatment.get("timing"))
level = env_out["level"]
```

响应增加 `"env_context": {**(env or {}), **env_out}`。

## 验证

```text
pytest ml-bjj/tests/test_app_p3.py ml-bjj/tests/test_app_api.py ml-bjj/tests/test_app_p2.py -v
→ 8 passed
```
