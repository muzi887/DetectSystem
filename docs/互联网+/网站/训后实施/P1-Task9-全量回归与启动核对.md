# Task 9：启动核对与全量回归

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../实施计划/新模型训后-后端丰富实施计划.md) Task 9  
> 状态：⚠️ 单元测试已通过；**现场 23 类权重尚未进入本仓库**，真实 serving 启动门禁未放行

## 子任务解释

本任务不写新功能，只验收 Task 1–8：

1. 全量 pytest
2. `pest-cls-meta.json` 是否为 23 类且与 `CANONICAL_CLASSES` 集合相等
3. 启动 `python ml-bjj/serving/app.py`，curl `/health` 与 `/api/treatments/稻瘟病`
4. 智能分析选水稻上传验证集图；选小麦上传同一张水稻图不得出稻瘟

计划约定：第 2 步若不是 23 类，**停止**，先拷贝训好的 `pest-cls-best.pt` 与 `pest-cls-meta.json`。

## 改动文件

本任务 **无生产代码改动**。

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`Task9-全量回归与启动核对.md`](./Task9-全量回归与启动核对.md) | 记录全量 pytest、meta 23 类核对、serving 启动门禁结果（本文件） |

## 验证记录（2026-08-20）

### 1. 单元套件 — 通过

```text
ml-bjj\.venv\Scripts\python.exe -m pytest ml-bjj/tests -v
→ 18 passed
```

| 文件 | 结果 |
|------|------|
| `test_crop_filter.py` | 5 passed |
| `test_predict_utils.py` | 4 passed |
| `test_treatments_coverage.py` | 3 passed |
| `test_predict_detailed.py` | 2 passed |
| `test_app_api.py` | 3 passed |
| `test_alert_copy.py` | 1 passed |

### 2. Meta 门禁 — 未通过（阻塞现场启动）

当前 `ml-bjj/models/pest-cls-meta.json`：

- `classes` **8** 个（健康 + 小麦 4 + 玉米 2 + 番茄早疫病）
- `trained_at`: `2026-07-08 21:48:08`
- `best_val_acc`: 约 0.9899

与 23 类约定不一致。`app.py` 的 `main()` 在非 Mock 模式下会 `SystemExit: 期望 23 类，实际 8`。

**下一步（需你完成本地拷贝后再做）：**

```powershell
# 将训好的 23 类权重与 meta 覆盖到
#   ml-bjj/models/pest-cls-best.pt
#   ml-bjj/models/pest-cls-meta.json
python -c "import json; from pathlib import Path; m=json.loads(Path('ml-bjj/models/pest-cls-meta.json').read_text(encoding='utf-8')); print(len(m['classes']), m['classes'])"
python ml-bjj\serving\app.py
# 另开终端
curl http://127.0.0.1:5000/health
curl http://127.0.0.1:5000/api/treatments/稻瘟病
```

### 3. 接口形状（不启动 main，用 Flask test_client）— 通过

- `GET /health` → 200，含 `classes_count` / `model_version` / `engine` / `weights_mtime` / `cuda`（当前 `classes_count=8`，因 meta 仍是 v3）
- `GET /api/treatments/稻瘟病` → 200，`found=true`，`item.crop=水稻`

### 4. 手工智能分析 — 未做

仓库内没有 `ml-bjj/data/bjj_cls/val/稻瘟病/` 样本（检索为空）。等 23 类权重与验证图到位后，按计划 Step 4 补做：

1. `pnpm dev` + `pnpm run mock` + `python ml-bjj\serving\app.py`
2. 选水稻上传稻瘟图
3. 选小麦上传同一张图，结果不得为稻瘟病

## 本轮已完成的子任务说明

| 任务 | 说明文件 |
|------|----------|
| 1 | [Task1-作物掩码纯函数.md](./Task1-作物掩码纯函数.md) |
| 2 | [Task2-topk与needs_review.md](./Task2-topk与needs_review.md) |
| 3 | [Task3-防治库加载器红灯.md](./Task3-防治库加载器红灯.md) |
| 4 | [Task4-防治库扩到23类.md](./Task4-防治库扩到23类.md) |
| 5 | [Task5-predict_detailed.md](./Task5-predict_detailed.md) |
| 6 | [Task6-health与分析API加厚.md](./Task6-health与分析API加厚.md) |
| 7 | [Task7-水稻选项与防治回退.md](./Task7-水稻选项与防治回退.md) |
| 8 | [Task8-Mock预警文案对齐.md](./Task8-Mock预警文案对齐.md) |
| 9 | 本文件 |
