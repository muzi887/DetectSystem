# 京津冀 AI 模型 v3.1 迭代说明

> **定位**：在 v3 已上线（验证集 **98.99%**、网站推理可用）基础上的 **可选增量版本**，重点提升 **京津冀实地识别** 与 **低置信度误判** 表现，而非重新设计类别体系。  
> **前置文档**：[`京津冀AI模型精简方案-v3.md`](./京津冀AI模型精简方案-v3.md)、[`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md)、[`ml-bjj训练操作手册-开发版.md`](./ml-bjj训练操作手册-开发版.md)  
> **路线引用**：[`../下一阶段任务与流程.md`](../下一阶段任务与流程.md) §4.2 任务 B+1–B+3

---

## 一、v3 与 v3.1 的区别

| 维度 | v3（当前主推） | v3.1（计划迭代） |
|------|----------------|------------------|
| **目标** | 8 类京津冀模型首版，对接网站演示 | 本土化补强、难例消化、可选精度提升 |
| **类别** | 8 类（不变） | **仍为 8 类**，不新增标签体系 |
| **训练数据** | Kaggle 小麦 + PlantVillage 玉米/番茄 | v3 数据 **+** 实地照片 **+** 难例回流 |
| **骨干网络** | `efficientnet_b0` | 默认仍 B0；可选升级 **`efficientnet_b3`** |
| **训练轮数** | 20 epoch（CPU 已训完） | 建议 20–40 epoch；B3 建议在 **GPU** 上 |
| **权重文件** | `ml-bjj/models/pest-cls-best.pt` | 备份为 `pest-cls-bjj-v3.1.pt`，验证通过后替换 best |
| **是否阻塞主流程** | 阶段 A 已完成 | **非阻塞**，答辩前有余力再做 |

**一句话**：v3.1 不是换方案，而是在同一 8 类框架下，用 **实地样本 + 难例 +（可选）更大模型** 做第二轮训练。

---

## 二、为什么要做 v3.1

v3 在公开数据集划分的验证集上表现很好，但存在两类典型差距：

1. **域偏移**：Kaggle / PlantVillage 多为实验室或单一背景特写；京津冀田间光照、角度、背景更复杂。  
2. **难例未覆盖**：验证集误判、线上 `confidence < 70%` 的样本，往往不在原训练分布内。

因此项目规划了 **B+1 实地抽测 → B+2 难例回流 → B+3 可选重训** 的闭环（见 [`../下一阶段任务与流程.md`](../下一阶段任务与流程.md)）。

| 若你的目标是… | 是否必须 v3.1 |
|---------------|---------------|
| 网站演示、答辩展示 v3 能力 | **不必须**（当前 v3 可用） |
| 提高河间/沧州等实地识别率 | **强烈建议** |
| 新增第 9 类作物/病害 | **不是 v3.1**，需改方案并重训 v4 |

---

## 三、触发条件与任务编号

| 编号 | 任务 | 说明 |
|------|------|------|
| **B+1** | 京津冀实地抽测 25–40 张 | 按 [`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md) §五 执行，结果记入 `local_test/results.csv` |
| **B+2** | 难例文件夹 `ml-bjj/data/hard_cases/` | 误判、低置信度样本人工复核后暂存，供合并训练 |
| **B+3** | 换 `efficientnet_b3`、增加 epoch | 在 GPU 机器上重训，冲更高验证集/实地一致率 |

**建议启动 v3.1 的信号**（满足其一即可考虑开训）：

- 实地抽测 **一致率 < 85%**，或某类（如小麦赤霉病）系统性误判  
- 累计 **≥ 15 张** 已标注难例/实地样本  
- 验证集某类 F1 明显偏低，需过采样补强  

若 B+1 抽测全部 ≥ 80% 且无不一致，可 **暂缓 v3.1**，优先做系统 2.0 功能。

---

## 四、目录与数据规范

### 4.1 新增目录（v3.1 专用）

在现有 `ml-bjj/data/` 下扩展：

```text
ml-bjj/data/
  bjj_cls/                    ← v3 训练集（prepare 产出，v3.1 在其基础上增量）
  hard_cases/                 ← ★ 难例队列（待复核、待并入）
    pending/                  ← 未标注：predict 自动/半自动写入
      小麦锈病/
      玉米大斑病/
      ...
    reviewed/                 ← 已人工确认标签
      小麦锈病/
      ...
  local_test/                 ← 实地抽测（不参与训练，仅评估）
    images/                   ← 原始照片
    results.csv               ← 抽测记录表
```

> **说明**：`hard_cases/` 目前为 **文档约定目录**，首次使用前需手动创建；脚本尚未自动写入，见 §5.2。

### 4.2 文件夹命名

必须与 v3 **中文类名** 一致（与 `bjj_cls/classes.txt` 相同）：

```text
健康
小麦锈病
小麦赤霉病
小麦白粉病
小麦蚜虫为害
玉米大斑病
玉米锈病
番茄早疫病
```

### 4.3 什么样的样本进 `hard_cases/`

| 来源 | 条件 | 放入位置 |
|------|------|----------|
| 实地抽测 B+1 | 预测与人工标签 **不一致** | `hard_cases/reviewed/正确类名/` |
| 实地抽测 B+1 | 一致但置信度 **< 70%** | 同上（模型「猜对但不确定」） |
| 验证集 / 线上 | val 误判样本 | `hard_cases/reviewed/` |
| 用户上传（未来） | 推理 confidence < 0.7 | `hard_cases/pending/` → 农技员复核 → `reviewed/` |

**文件命名建议**：`YYYYMMDD_地点_作物_病害_序号.jpg`，便于追溯与答辩展示。

---

## 五、完整操作流程

### 5.1 阶段 0：备份 v3 基线

```powershell
cd D:\code2\software\vue\program\DetectSystem
ml-bjj\.venv\Scripts\Activate.ps1

copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj-v3.pt
copy ml-bjj\models\pest-cls-meta.json ml-bjj\models\pest-cls-meta-v3.json
```

后续 v3.1 训练不应覆盖 v3 备份，便于 A/B 对比与回退。

### 5.2 阶段 1：实地抽测（B+1）

```powershell
python ml-bjj\scripts\predict.py --image "D:\实地照片\20260710_河间_小麦_锈病_01.jpg"
```

记录人工标签、模型输出、置信度到 `ml-bjj/data/local_test/results.csv`（模板见 [`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md) §5.2）。

### 5.3 阶段 2：难例收集与复核（B+2）

1. 创建目录：`ml-bjj/data/hard_cases/pending/`、`reviewed/`  
2. 将 §5.3 表中符合条件的图片复制到对应 **正确类名** 子文件夹  
3. **人工确认** 每张图的标签（误判样本务必按 **真实病害** 归档，不是按模型输出）  
4. 复核完成后，文件应在 `hard_cases/reviewed/类名/` 下  

**可选**：对 `reviewed/` 做简单统计，确认各类至少 3–5 张再开训；单类样本过少时优先补拍。

### 5.4 阶段 3：合并进训练集

当前 `prepare_bjj.py` **不会自动** 读取 `hard_cases/`。v3.1 采用 **手动合并**（简单可靠）：

**方式 A — 直接复制到 `bjj_cls/train`（推荐）**

```powershell
# 示例：将已复核难例并入训练集（按类复制）
xcopy /E /I /Y "ml-bjj\data\hard_cases\reviewed\小麦锈病" "ml-bjj\data\bjj_cls\train\小麦锈病\"
```

实地新拍、尚未进 `hard_cases` 的照片，也可按类名直接放入 `bjj_cls/train/类名/`。

**方式 B — 全量重跑 prepare（仅当改动原始包或需重新划分 val 时）**

若大量新增原始数据并希望重新 75/25 划分：

```powershell
# 先将 reviewed 样本放入约定原始目录或扩展 prepare 脚本后再执行
python ml-bjj\scripts\prepare_bjj.py
```

> **注意**：重跑 prepare 会 **重建** `bjj_cls`，请先备份已合并的 train 或确认脚本已支持增量。日常 v3.1 小批量难例用 **方式 A** 即可。

**划分原则**：

- 难例/实地样本 **优先进 train**，避免与 fixed val 泄漏  
- 若某类新增 > 20 张，可手动留 2–3 张到 `val/类名/` 作该类实地 hold-out  

### 5.5 阶段 4：训练 v3.1

**方案 4a — 保守（与 v3 同配置，适合 CPU / 样本少）**

```powershell
python ml-bjj\scripts\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20
```

**方案 4b — 增强（B+3，需 GPU）**

1. 编辑 `ml-bjj/scripts/train_cls.py`：  
   - 将 `efficientnet_b0` 改为 `efficientnet_b3`（共 3 处：create_model、print、ckpt 内 `model_name`）  
   - 可选：将 `BATCH_SIZE` 从 32 降为 16（防显存不足）  
2. 训练：

```powershell
python ml-bjj\scripts\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 40
```

训练完成后：

```powershell
copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj-v3.1.pt
```

`pest-cls-meta.json` 会更新为 v3.1 的训练记录；请对比 `best_val_acc` 与 v3 基线。

### 5.6 阶段 5：验收对比

| 验收项 | 通过标准 | 命令/位置 |
|--------|----------|-----------|
| 验证集准确率 | ≥ v3 基线，或下降 ≤ 0.5% 但实地提升 | `pest-cls-meta.json` |
| 原 v3 抽测样例 | 小麦锈病、玉米大斑病仍正确 | `predict.py` |
| 实地 hold-out | B+1 中此前误判/低置信样本 **改善** | 对比 `results.csv` 重跑 predict |
| 推理服务 | 网站智能分析返回合理 | 替换权重后重启 `serving/app.py` |

```powershell
# 对比 v3 与 v3.1 单张
python ml-bjj\scripts\predict.py --image "图片.jpg" --weights ml-bjj\models\pest-cls-bjj-v3.pt
python ml-bjj\scripts\predict.py --image "图片.jpg" --weights ml-bjj\models\pest-cls-bjj-v3.1.pt
```

**上线决策**：

- 实地一致率明显提升 → 用 v3.1 覆盖 `pest-cls-best.pt`，重启推理服务  
- 验证集升、实地降 → **不上线**，保留 v3，继续收难例  
- 两者持平 → 答辩期 **维持 v3**，v3.1 作「持续优化」说明即可  

---

## 六、难例回流闭环（长期）

```text
用户上传 / 实地拍照
    → predict.py 或网站推理
    → confidence < 0.7 或 与人工不一致
    → hard_cases/pending/
    → 农技员标注 → hard_cases/reviewed/
    → 合并 bjj_cls/train
    → train_cls.py 重训
    → pest-cls-bjj-v3.x.pt
    → 实地复测 → 循环
```

与 [`AI模型训练说明.md`](./AI模型训练说明.md) §4.3 难例挖掘策略一致；预期实地一致率 **+3%–5%**（视样本量与质量而定）。

---

## 七、与网站 / 推理服务的衔接

| 组件 | v3 行为 | v3.1 变更 |
|------|---------|-----------|
| `ml-bjj/serving/app.py` | 加载 `pest-cls-best.pt` | 替换权重后 **重启** Flask 服务即可 |
| `ml-bjj/serving/inference.py` | 读 ckpt 内 `model_name` | 若用 B3，ckpt 须含 `"model_name": "efficientnet_b3"` |
| 前端智能分析 | 8 类 label 不变 | **无需改前端**（类名未变） |
| 低置信度提示 | 可选 `< 70%` 提示复核 | 可与 v3.1 一并作为产品说明 |

替换权重示例：

```powershell
copy ml-bjj\models\pest-cls-bjj-v3.1.pt ml-bjj\models\pest-cls-best.pt
# 重启 serving（见 docs/互联网+/网站/项目启动说明.md）
```

---

## 八、风险与注意事项

1. **样本过少过拟合**：难例 < 10 张时，epoch 不宜过大（≤ 20），优先 B0。  
2. **标签错误**：一张标错的难例会伤害整类；复核必须两人交叉或组长确认。  
3. **验证集泄漏**：不要把 B+1 测试用过的同一张图既测又训。  
4. **B3 部署成本**：B3 推理慢于 B0；答辩现场若 CPU 演示，需提前测单张耗时。  
5. **prepare 全量重跑**：会改变 train/val 划分与样本编号；小迭代用手动合并更安全。  

---

## 九、检查清单（开训前 / 答辩前）

**开训前**

- [ ] v3 权重与 meta 已备份  
- [ ] `hard_cases/reviewed/` 各类样本数量已统计  
- [ ] 实地 `results.csv` 已标注「待改善」样本清单  
- [ ] 已选择方案 4a 或 4b（B0 / B3）  

**答辩前（若已出 v3.1）**

- [ ] 能说明 v3 → v3.1 的数据增量（张数、来源、地块）  
- [ ] 有 v3 vs v3.1 同图对比或 `results.csv` 前后对比  
- [ ] 网站演示路径仍畅通（5000 推理 + 前端）  
- [ ] 未参与训练的 3–5 张实地图可现场识别  

---

## 十、相关文件

| 路径 | 说明 |
|------|------|
| `ml-bjj/models/pest-cls-best.pt` | 当前线上权重（v3） |
| `ml-bjj/models/pest-cls-bjj-v3.1.pt` | v3.1 备份（训练后手动命名） |
| `ml-bjj/data/hard_cases/` | 难例队列（待建） |
| `ml-bjj/data/local_test/results.csv` | 实地抽测记录 |
| `ml-bjj/scripts/train_cls.py` | 训练入口（B3 需改 backbone） |
| `ml-bjj/scripts/predict.py` | 单张评估 |
| [`京津冀AI模型精简方案-v3.md`](./京津冀AI模型精简方案-v3.md) | v3 数据与类别定义 |
| [`../下一阶段任务与流程.md`](../下一阶段任务与流程.md) | B+1–B+3 总览 |

---

**文档版本**：V1.0  
**最后更新**：2026-07-12  
**维护**：互联网＋项目组 / 算法组
