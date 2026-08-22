# 京津冀 AI 模型 v3.1 迭代说明

> **定位**：在 **23 类 Serving 已就绪、磁盘权重仍为 8 类** 的前提下，把「难例 / 实地 / 可选更大骨干」叠在 **即将重训的 23 类模型** 上。  
> 不再把 v3.1 定义成「永远 8 类、不改标签体系」。8 类是 2026-07 的首版；产品门禁已是 23 类。  
> **当前阻塞**不在本文件：先补图并 `train_cls.py` 出 23 类权重，见 [`下一阶段任务与流程.md`](../../规划/下一阶段任务与流程.md) B23、[`玉米水稻补图-搜索词条.md`](../训练/玉米水稻补图-搜索词条.md)。  
> **前置**：[`京津冀AI模型精简方案-v3.md`](./京津冀AI模型精简方案-v3.md)（8 类历史）、[`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md)、[`ml-bjj训练操作手册-开发版.md`](../训练/ml-bjj训练操作手册-开发版.md)

---

## 一、和 v3、23 类扩展的关系

| 维度 | v3 首版（已训） | 23 类扩展（B23 · 当前优先） | v3.1（本文件 · 非阻塞） |
|------|-----------------|-----------------------------|-------------------------|
| **目标** | 8 类对接网站演示 | 解开 `app.py` 23 类门禁，覆盖水稻与新玉米类 | 实地一致率、消化误判 |
| **类别** | 8 | **23**（与 `classes.txt` / `crop_filter.py` 一致） | **跟当时线上权重**，不另起一套类名 |
| **数据** | Kaggle 小麦 + PlantVillage | 按类源图 + `prepare_from_class_folders.py` | 23 类 train **+** 实地 **+** `hard_cases` |
| **骨干** | EfficientNet-B0 | 默认仍 B0 | 默认 B0；可选 **B3**（GPU） |
| **权重** | 磁盘 `pest-cls-best.pt` 仍为此版 | 训完后覆盖 best，并改写 meta | 备份为 `pest-cls-bjj-v3.1.pt`，验收后再替换 |
| **是否阻塞** | 阶段 A 已完成 | **阻塞智能分析启动** | 答辩前有余力再做 |

**一句话**：先完成 23 类重训，再在同一 23 类中文名下用实地样本和难例做第二轮；不要再训一版 8 类 B3。

---

## 二、为什么还要做 v3.1

公开数据集验证集分数高，仍有两类差距：

1. **域偏移**：公开特写 vs 京津冀田间光照、角度、背景。  
2. **难例未覆盖**：`needs_review`、误判样本往往不在原分布里。

| 若你的目标是… | 做什么 |
|---------------|--------|
| 网站能启动、能出水稻/新玉米病名 | **B23 重训**，不是本文件 |
| 提高河间/沧州等实地识别率 | **建议 v3.1** |
| 只演示规则链 / 预报 / 传感 | 不必须等 v3.1 |

---

## 三、触发条件与任务编号

| 编号 | 任务 | 说明 |
|------|------|------|
| **B23** | 23 类补图 + 切分 + 重训 | [`下一阶段任务与流程.md`](../../规划/下一阶段任务与流程.md)；**先于** B+1–B+3 |
| **B+1** | 京津冀实地抽测 25–40 张 | [`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md) §六 |
| **B+2** | `ml-bjj/data/hard_cases/` | 误判、低置信度，人工复核后并入 train |
| **B+3** | `efficientnet_b3`、增加 epoch | GPU；**仅在 23 类权重已存在之后** |

**建议启动 v3.1 的信号**（满足其一，且 B23 已完成）：

- 实地抽测一致率 &lt; 85%，或某类系统性误判  
- 累计 ≥ 15 张已标注难例/实地样本  
- 23 类验证集某类 F1 明显偏低  

若 B+1 全部 ≥ 80% 且无不一致，可暂缓 v3.1，优先竞赛材料。

---

## 四、目录与数据规范

### 4.1 目录

```text
ml-bjj/data/
  <中文类名>/                 ← 23 类源图（prepare_from_class_folders 输入）
  bjj_cls/                    ← train/val（train_cls 只读这里）
  hard_cases/                 ← 难例队列
    pending/                  ← 未标注
    reviewed/                 ← 已人工确认
  local_test/                 ← 实地抽测（不参与训练）
    images/
    results.csv
```

`hard_cases/` 为约定目录，首次使用前需手动创建；脚本尚未自动写入。

### 4.2 文件夹命名

必须与 **23 类中文名** 一致（`bjj_cls/classes.txt`），不要再用 8 类清单当「完整类表」。完整列表见 [`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md) §3.1。

### 4.3 什么样的样本进 `hard_cases/`

| 来源 | 条件 | 放入位置 |
|------|------|----------|
| 实地抽测 B+1 | 预测与人工标签不一致 | `hard_cases/reviewed/正确类名/` |
| 实地抽测 B+1 | 一致但置信度 &lt; 70% | 同上 |
| 验证集 / 线上 | 误判 | `reviewed/` |
| 用户上传 | `needs_review` | `pending/` → 复核 → `reviewed/` |

文件命名建议：`YYYYMMDD_地点_作物_病害_序号.jpg`。

---

## 五、完整操作流程

### 5.1 阶段 0：备份当前 best

在覆盖权重前：

```powershell
cd D:\code2\software\vue\program\DetectSystem
ml-bjj\.venv\Scripts\Activate.ps1

copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj-v3.pt
copy ml-bjj\models\pest-cls-meta.json ml-bjj\models\pest-cls-meta-v3.json
```

若即将做的是 **第一次 23 类训练**，备份的是 8 类基线，文件名仍可用 `v3`，避免和 v3.1 混淆。

### 5.2 阶段 1：实地抽测（B+1）

```powershell
python ml-bjj\scripts\predict.py --image "D:\实地照片\20260710_河间_小麦_锈病_01.jpg"
```

网站抽测须选对 `cropType`（命令行无掩码）。记录到 `ml-bjj/data/local_test/results.csv`。

### 5.3 阶段 2：难例收集与复核（B+2）

1. 创建 `hard_cases/pending/`、`reviewed/`  
2. 按 **真实病害** 类名归档（不要按模型错输出归档）  
3. 单类过少时优先补拍，再开训  

### 5.4 阶段 3：合并进训练集

**不要**再运行 `prepare_bjj.py`（已更名/废弃）。

**方式 A — 复制到 `bjj_cls/train`（小批量难例）**

```powershell
xcopy /E /I /Y "ml-bjj\data\hard_cases\reviewed\小麦锈病" "ml-bjj\data\bjj_cls\train\小麦锈病\"
```

**方式 B — 源图变更后全量重切（推荐与 B23 同一套）**

把复核图拷进 `ml-bjj/data/<类名>/`，再：

```powershell
python ml-bjj\scripts\prepare_from_class_folders.py
```

重跑 prepare 会重建 `bjj_cls`。难例优先进 train，避免与 val 泄漏。某类新增很多时可留 2–3 张到 `val/` 作实地 hold-out。

仅复现 2026-07 的 8 类配方时，才用 `prepare_from_wheat_plantvillage.py`。

### 5.5 阶段 4：训练

**方案 4a — 与现网同配置（CPU / 样本少）**

```powershell
python ml-bjj\scripts\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20
```

训完后 `pest-cls-meta.json` 的 `classes` **必须是 23 个**，否则不要覆盖网站用权重。

**方案 4b — B+3（GPU，B3）**

1. 改 `train_cls.py`：`efficientnet_b0` → `efficientnet_b3`（create_model、print、ckpt 内 `model_name`）  
2. 可选 `BATCH_SIZE` 32 → 16  
3. `--epochs 40`  

```powershell
copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj-v3.1.pt
```

对比 `best_val_acc` 与 23 类第一版，不要和 8 类 98.99% 混比。

### 5.6 阶段 5：验收

| 验收项 | 通过标准 |
|--------|----------|
| meta 类数 | **23**，且与 ckpt、`classes.txt` 一致 |
| 验证集准确率 | 相对 **23 类上一版** 不崩，或实地明显提升 |
| 原抽测样例 | 小麦锈病、玉米大斑病仍正确 |
| 水稻抽测 | 选 `rice` 时第一名只能是水稻类或健康 |
| 推理服务 | 重启 `app.py` 不再因 8 类退出 |

```powershell
python ml-bjj\scripts\predict.py --image "图片.jpg" --weights ml-bjj\models\pest-cls-bjj-v3.pt
python ml-bjj\scripts\predict.py --image "图片.jpg" --weights ml-bjj\models\pest-cls-bjj-v3.1.pt
```

**上线**：实地提升 → 覆盖 `pest-cls-best.pt`；验证升实地降 → 不上线；持平 → 答辩维持已上线 23 类第一版。

---

## 六、难例回流闭环（长期）

```text
用户上传 / 实地拍照
    → 网站推理（有作物掩码）或 predict.py（无掩码）
    → needs_review 或与人工不一致
    → hard_cases/pending/
    → 农技员标注 → hard_cases/reviewed/
    → 并入源图或 bjj_cls/train
    → train_cls.py
    → pest-cls-bjj-v3.x.pt
    → 实地复测
```

与 [`AI模型训练说明.md`](../训练/AI模型训练说明.md) 难例策略一致。

---

## 七、与网站 / 推理服务的衔接

| 组件 | 行为 | v3.1 注意 |
|------|------|-----------|
| `app.py` | 启动要求 **23 类** | 8 类 ckpt 会直接退出，不要为了 v3.1 放宽门禁 |
| `inference.py` | 读 ckpt `model_name` | B3 时 ckpt 须含 `"efficientnet_b3"` |
| `crop_filter.py` | 23 类作物组 | 类名必须仍在 `CANONICAL_CLASSES` |
| 前端 | wheat/corn/tomato/rice | 不增类则无需改下拉 |
| 防治库 | 已 23 类 | 新类名才需要改 `treatments.json` |

```powershell
copy ml-bjj\models\pest-cls-bjj-v3.1.pt ml-bjj\models\pest-cls-best.pt
# 重启 serving
```

---

## 八、风险与注意事项

1. 难例 &lt; 10 张时 epoch 不宜过大，优先 B0。  
2. 标错一张会伤整类。  
3. 不要把 B+1 测过的同一张图既测又训。  
4. B3 在 CPU 答辩可能更慢，先测单张耗时。  
5. `prepare_from_class_folders.py` 全量重跑会改划分；小迭代用方式 A。  
6. **禁止**用 8 类 98.99% 宣传 23 类 v3.1。

---

## 九、检查清单

**开训前（v3.1）**

- [ ] 23 类第一版权重已能启动 serving  
- [ ] 当前 best 与 meta 已备份  
- [ ] `hard_cases/reviewed/` 数量已统计  
- [ ] 已选 4a / 4b  

**答辩前（若已出 v3.1）**

- [ ] 能说明相对 23 类第一版的数据增量  
- [ ] 有前后对比或 `results.csv`  
- [ ] `:5000` 仍是 23 类  
- [ ] 未参与训练的 3–5 张实地图可现场识别  

---

## 十、相关文件

| 路径 | 说明 |
|------|------|
| `ml-bjj/models/pest-cls-best.pt` | 线上权重（替换前仍可能是 8 类） |
| `ml-bjj/scripts/prepare_from_class_folders.py` | 当前整理 |
| `ml-bjj/scripts/prepare_from_wheat_plantvillage.py` | 仅 8 类历史 |
| `ml-bjj/data/hard_cases/` | 难例（待建） |
| [`作物掩码与推理接入.md`](./作物掩码与推理接入.md) | 23 类推理 |

---

**文档版本**：V1.1（叠在 23 类上；废弃 prepare_bjj.py）  
**最后更新**：2026-08-22  
**维护**：互联网＋项目组 / 算法组
