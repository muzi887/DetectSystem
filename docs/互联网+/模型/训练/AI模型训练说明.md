# 病虫害 AI 模型训练说明

> 本文档是 [`2.0-功能扩展规划.md`](../../规划/2.0-功能扩展规划.md) §3.2 的专项展开。  
> **如果你完全没做过模型训练**：请直接阅读 **§零**，按步骤复制命令即可跑通第一次训练。  
> 项目内已提供可运行脚本：`ml/scripts/`（数据整理、训练、测试）。  
> **多作物 v2 已完成**（27 类、97.53%）：详见 [`数据集整理说明.md`](./数据集整理说明.md)、[`../下一阶段任务与流程.md`](../../规划/下一阶段任务与流程.md)。

---

## 零、零基础上手：从下载到跑通（必读）

### 0.1 训练到底是什么？

可以把它理解成 **「刷题」**：

1. 你准备很多 **图片**，每张图片已经知道答案（比如「苹果疮痂病」「健康」）。
2. 电脑里有一个 **预训练模型**（别人在大数据集上练过的「大脑」，可从网上下载）。
3. 你让电脑在这些叶子上 **再练很多遍**，学会认你们的病虫种类——这叫 **微调（Fine-tune）**。
4. 练完后得到 `.pt` 权重文件；上传新照片，模型输出 **病名 + 置信度**。

你 **不需要** 自己写神经网络，也 **不需要** 一开始就有实地拍的照片——公开数据集 + 预训练权重即可起步。

### 0.2 整体流程（6 步）

```text
① 安装 Python 环境
      ↓
② 下载公开数据集（PlantVillage）
      ↓
③ 运行脚本整理成 train/val 文件夹
      ↓
④ 运行 train_cls.py（自动下载预训练权重并开始训练）
      ↓
⑤ 用 predict.py 测一张图
      ↓
⑥ （可选）启动推理服务，对接网站「智能分析」页
```

### 0.3 第 1 步：安装环境

在 **PowerShell** 中，进入项目根目录 `DetectSystem`：

```powershell
cd D:\code2\software\vue\program\DetectSystem

# 创建虚拟环境（只需做一次）
python -m venv ml\.venv
ml\.venv\Scripts\Activate.ps1

# 安装依赖（含 PyTorch、预训练模型库 timm）
pip install -r ml\requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

若 `Activate.ps1` 被策略拦截，先执行：`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`

**检查是否成功**：

```powershell
python -c "import torch; print('PyTorch', torch.__version__); print('CUDA', torch.cuda.is_available())"
```

- `CUDA True`：有 NVIDIA 显卡，训练较快。  
- `CUDA False`：用 CPU 也能练，只是慢一些（PlantVillage 子集约 30–60 分钟）。

### 0.4 第 2 步：下载数据集（从网上）

**推荐数据集：PlantVillage**（叶子病害，按文件夹分好类，**不用自己标注**）。


| 方式         | 链接                                                                                                                                         | 说明                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Kaggle（常用） | [https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset](https://www.kaggle.com/datasets/abdallahalidev/plantvillage-dataset) | 需免费注册 Kaggle，下载 `plantvillage dataset.zip` |
| Kaggle 彩色版 | [https://www.kaggle.com/datasets/emmarex/plantvillage](https://www.kaggle.com/datasets/emmarex/plantvillage)                               | 结构相同，任选一个                                  |
| GitHub 镜像  | 搜索 `PlantVillage-Dataset github`                                                                                                           | 部分镜像提供 Google Drive 链接                     |


**下载后解压**，得到类似这样的文件夹（名字可能略有差异）：

```text
D:\datasets\PlantVillage\
  Peach___Bacterial_spot\      ← 文件夹名就是类别
    xxx.JPG
    ...
  Peach___healthy\
  Apple___Apple_scab\
  Apple___healthy\
  ...
```

> **说明**：PlantVillage 含桃、苹果等，**没有小麦/水稻**。先用桃+苹果把流程跑通；小麦锈病等可后续换专用数据集（见 §0.9）。

### 0.5 第 3 步：整理数据（运行我们的脚本）

脚本会把 PlantVillage **按 75% / 25% 分成训练集和验证集**，并将英文文件夹名 **自动映射为中文标签**（如 `Peach___healthy` → `健康`），与网站 Mock 文案一致。标签指 **子文件夹名**，不是单张图片的文件名。

```powershell
# 仍在激活 ml\.venv 的状态下（默认即为中文映射，无需额外参数）
python ml\scripts\prepare_plantvillage.py --source "D:\ml\plantvillage dataset\color" --crop peach apple
```

成功后目录如下：

```text
ml/data/plantvillage_cls/
  train/
    桃细菌性穿孔病/
    健康/
    苹果疮痂病/
    ...
  val/
    （同上结构，约 25% 图片）
  classes.txt
```

### 0.6 第 4 步：开始训练（一条命令）

```powershell
python ml\scripts\train_cls.py
```

**第一次运行会自动从网上下载** `efficientnet_b0` 的 ImageNet 预训练权重（约 20 MB），无需手动找模型文件。

训练过程中你会看到：

- 每个 Epoch 的进度条  
- **验证准确率**（这就是文档里说的「精度」）  
- 准确率最高时自动保存 → `ml/models/pest-cls-best.pt`

默认练 **15 个 Epoch**，PlantVillage 子集通常可达 **90%+ 验证准确率**（已远高于 Mock 演示需求）。

### 0.7 第 5 步：用一张照片测试

```powershell
python ml\scripts\predict.py --image D:\datasets\PlantVillage\Peach___healthy\xxx.JPG
```

示例输出：

```text
识别结果: 健康
置信度:   97.32%
```

换一张有病斑的图片，应输出对应病名。若这里正常，说明 **你已经完成第一次模型训练**。

### 0.8 第 6 步：（可选）接入网站

网站「智能分析」页调用 `POST /analysis/image`。训练完成后需启动 Python 推理服务，详见 **§五** 与 `[docs/小挑/页面设置/图片分析.md](../../../小挑/页面设置/图片分析.md)`。

当前阶段可先 **不接网站**，只要 `predict.py` 能识别即可用于答辩说明「模型已真实训练」。

### 0.9 常见问题（新手）


| 问题                     | 原因              | 解决办法                                               |
| ---------------------- | --------------- | -------------------------------------------------- |
| `找不到训练数据`              | 没跑第 3 步         | 先运行 `prepare_plantvillage.py`                      |
| `pip install torch` 很慢 | 网络              | 用清华源 `-i https://pypi.tuna.tsinghua.edu.cn/simple` |
| 准确率很低（<60%）            | 数据路径错、类别太少      | 检查 `--source` 是否指向含 `Peach___` 文件夹的目录              |
| 想练小麦/水稻                | PlantVillage 没有 | 见下表补充数据集                                           |
| 没有显卡                   | 正常              | CPU 可练，把 `train_cls.py` 里 `EPOCHS` 改小如 5 先试验       |


**小麦 / 水稻补充数据集（可选，第二阶段）**：


| 数据集      | 链接                                                                 | 内容            |
| -------- | ------------------------------------------------------------------ | ------------- |
| 小麦病害     | Kaggle 搜索 `wheat disease dataset`                                  | 锈病、白粉病等       |
| 水稻病害     | Kaggle 搜索 `rice leaf disease`                                      | 稻瘟病、纹枯病等      |
| IP102 虫害 | [https://github.com/xpwu95/IP102](https://github.com/xpwu95/IP102) | 102 类害虫，偏昆虫特写 |


下载后同样整理成 `train/类别名/图片` 结构，或改写 `prepare_plantvillage.py` 适配其目录。

### 0.10 预训练模型从哪里来？（不用自己造）


| 名称              | 获取方式                                                      | 用途                           |
| --------------- | --------------------------------------------------------- | ---------------------------- |
| EfficientNet-B0 | `timm` 库 `pretrained=True` 自动下载                           | **本仓库默认**，`train_cls.py` 已配置 |
| YOLOv8n         | `ultralytics` 首次训练自动下载                                    | 可选，做检测框（§3.3）                |
| 更大模型 B3         | 把 `train_cls.py` 中 `efficientnet_b0` 改为 `efficientnet_b3` | 冲更高精度，更慢                     |


**你不需要** 从论文作者处要权重；上述库在首次运行时会从 Hugging Face / GitHub 拉取。

### 0.11 和竞赛目标的关系


| 阶段 | 你要做的事 | 预计时间 | 状态 |
|------|------------|----------|------|
| **入门** | 完成 §0.3–0.7，能 predict 出结果 | 0.5–1 天 | ✅ 已完成 |
| **多作物 v2** | 小麦/水稻整理 + 合并 + 训练（见 [`数据集整理说明.md`](./数据集整理说明.md)） | 1–3 天（CPU） | ✅ 已完成（**97.53%**） |
| **对接网站** | 启动推理 API，前端不再用 Mock | 2–3 天 | ⬜ **当前最优先** |
| **可选优化** | 难例挖掘、B3 模型、防治知识库（§4.3） | 1–2 周 | ⬜ 待做 |


---

## 一、训练目标与任务定义

### 1.1 业务目标


| 指标                                 | 基线    | 竞赛目标                   | 说明           |
| ---------------------------------- | ----- | ---------------------- | ------------ |
| 分类准确率（Top-1）                       | ≥ 85% | ≥ 95%                  | 主指标，按验证集统计   |
| 检测 [mAP@0.5](mailto:mAP@0.5)（若做定位） | ≥ 80% | ≥ 90%                  | 辅助指标，病虫害区域框选 |
| 单张推理耗时                             | —     | ≤ 2 s（GPU）/ ≤ 5 s（CPU） | 含预处理与后处理     |
| 低置信度复核率                            | —     | 置信度 < 70% 进入人工队列       | 降低误报对预警的影响   |


### 1.2 AI 任务拆分

系统「智能分析」页支持四类识别场景，模型建议采用 **「主模型 + 专家模型」** 策略：


| 前端 `category`   | 任务类型                | 推荐模型                                   | 输出             |
| --------------- | ------------------- | -------------------------------------- | -------------- |
| `pest` 病虫害识别    | **主任务** 图像分类 + 可选检测 | EfficientNet-B3 / ConvNeXt-T + YOLOv8n | 病虫名称、置信度、受害部位框 |
| `disaster` 灾害识别 | 分类                  | 同上结构，独立权重                              | 灾害类型（倒伏、涝渍等）   |
| `climate` 气候灾害  | 分类                  | 规则 + 轻量分类器                             | 冻害、热害、风害等      |
| `other` 其他      | 兜底                  | 通用健康/异常二分类                             | 健康 / 需关注       |


**竞赛阶段优先完成 `pest`（病虫害）**，与 Mock 数据中已有类别对齐：

- 桃：疮痂病、褐腐病、缩叶病、健康
- 苹果：腐烂病、轮纹病、健康
- 小麦：锈病、赤霉病、健康（可扩展白粉病、蚜虫等）
- 水稻：稻瘟病、纹枯病、健康

### 1.3 与系统对接的输出格式

推理服务需返回与前端一致的 JSON（与现有 `analyzeImage` 响应兼容）：

```json
{
  "result": "桃缩叶病",
  "confidence": 0.96,
  "detail": {
    "cropType": "peach",
    "category": "pest",
    "severity": "medium",
    "affectedPart": "叶片",
    "bbox": [120, 80, 340, 290],
    "modelVersion": "pest-cls-v2.0",
    "treatmentHint": "发病初期可喷施戊唑醇，注意采摘安全间隔期"
  }
}
```

前端 `confidence` 支持 0–1 或 0–100，现有逻辑已做归一化处理。

---

## 二、数据集建设

### 2.1 数据来源


| 来源        | 说明                                          | 预估占比 |
| --------- | ------------------------------------------- | ---- |
| 公开数据集     | PlantVillage、IP102（虫害）、AI Challenger 农业相关子集 | 40%  |
| 团队实地采集    | 合作社示范田、农技站巡田手机拍摄                            | 40%  |
| 网络爬取 + 清洗 | 农业论坛、科普图库（需注意版权与标注复核）                       | 20%  |


**采集要求**：

- 分辨率：短边 ≥ 512 px，推荐 1024×1024 左右。
- 格式：JPG / PNG，单张 ≤ 5 MB（前端当前限制 2 MB，部署时可按需调整）。
- 场景多样：晴天/阴天、不同生育期、不同拍摄距离、叶片/果实/穗部特写。
- 每类样本：**建议 ≥ 200 张** 方可稳定训练；冲 95% 时重点类别 ≥ 500 张。

### 2.2 目录结构（推荐）

> **零基础**：跑通 §零 后，以下 `ml/` 目录会自动生成，无需手工创建。

```text
ml/
├── requirements.txt            # Python 依赖
├── scripts/
│   ├── prepare_plantvillage.py # §0.5 数据整理（PlantVillage → train/val）
│   ├── train_cls.py            # §0.6 一键训练
│   ├── predict.py              # §0.7 单张测试
│   ├── train_det.py            # （可选）YOLO 检测
│   ├── export_onnx.py          # （可选）导出 ONNX
│   └── evaluate.py             # （可选）详细评估
├── data/
│   └── plantvillage_cls/       # 整理后的数据（prepare 脚本生成）
│       ├── train/
│       ├── val/
│       └── classes.txt
├── models/
│   ├── pest-cls-best.pt        # train_cls.py 输出的最佳权重
│   └── pest-cls-meta.json      # 训练指标记录
└── serving/
    └── app.py                  # （可选）FastAPI 推理服务
```

### 2.3 标注规范

#### 分类任务（必做）

- 每张图**唯一主标签**：以画面中最主要病虫为准。
- 多病害共存时：标「更严重 / 更易传播」的一类，并在 `metadata.json` 记录次要标签。
- 「健康」类需包含：无症叶片、正常果实、不同光照下的健康样本，防止模型把「清晰绿叶」误判为异常。

#### 检测任务（可选，用于受害部位框选）

- 工具：LabelImg / CVAT / Label Studio。
- 框紧贴病斑或虫体，不框整株。
- 类别命名与分类标签一致，如 `peach_scab`（桃疮痂病）。

#### 元数据字段（建议每张图记录）

```json
{
  "filename": "peach_001.jpg",
  "crop": "peach",
  "label": "桃缩叶病",
  "growth_stage": "开花期",
  "capture_date": "2026-05-12",
  "location": "河北河间",
  "annotator": "张三",
  "source": "field"
}
```

### 2.4 训练集 / 验证集划分（75% / 25%）

**原则**：同一地块、同一天、连拍序列不得同时出现在 train 与 val，防止「泄漏」导致虚高准确率。

```python
# scripts/split_dataset.py 核心逻辑示意
# 按「地块+日期」分组后分层抽样，保证各类别在 train/val 比例接近 75:25

from sklearn.model_selection import GroupShuffleSplit

gss = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=42)
for train_idx, val_idx in gss.split(X, y, groups=group_ids):
    ...
```


| 检查项    | 要求                                                |
| ------ | ------------------------------------------------- |
| 类别平衡   | 验证集每类至少 30 张；过少类别做适度过采样                           |
| 健康样本比例 | 约占 20%–30%，避免模型倾向报病                               |
| 划分固化   | `splits/train.txt`、`val.txt` 提交 Git LFS 或网盘，实验可复现 |


---

## 三、模型选型与训练流程

### 3.1 推荐方案


| 阶段             | 分类模型                         | 检测模型    | 理由               |
| -------------- | ---------------------------- | ------- | ---------------- |
| 基线 v1.0（冲 85%） | EfficientNet-B0              | YOLOv8n | 训练快、显存占用低，适合首轮验证 |
| 竞赛 v2.0（冲 95%） | EfficientNet-B3 或 ConvNeXt-T | YOLOv8s | 更强表征，配合增广与难例挖掘   |


**双任务关系**：

1. **分类模型**：给出病虫名称与置信度（主路径，对接预警）。
2. **检测模型**：在分类为「需关注」时运行，输出 `bbox` 与严重程度估计（可选，提升展示效果）。

### 3.2 分类模型训练（PyTorch 示例）

> **推荐**：直接使用项目脚本 `ml/scripts/train_cls.py`（§0.6），无需手写训练循环。以下为原理说明与自定义参考。

**环境**（与 §0.3 相同）：

```bash
python -m venv ml/.venv
ml/.venv/Scripts/activate        # Windows
pip install -r ml/requirements.txt
```

**一键训练**：

```powershell
python ml/scripts/train_cls.py
```

**训练脚本核心逻辑**（`ml/scripts/train_cls.py`）：

```python
import timm
import torch
from torch.utils.data import DataLoader

# 1. 模型：ImageNet 预训练 + 替换分类头
num_classes = len(class_names)  # 如桃 4 类、苹果 3 类… 或合并为全局 label map
model = timm.create_model('efficientnet_b3', pretrained=True, num_classes=num_classes)

# 2. 优化器与调度
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=50)

# 3. 损失：交叉熵 + Label Smoothing（0.1）缓解过拟合
criterion = torch.nn.CrossEntropyLoss(label_smoothing=0.1)

# 4. 训练循环：早停 patience=8，监控 val_accuracy
```

**默认超参（v1.0 基线）**：


| 参数         | 值                   |
| ---------- | ------------------- |
| input size | 384×384             |
| batch size | 32（显存不足则 16 + 梯度累积） |
| epochs     | 80（早停）              |
| 初始学习率      | 3e-4                |
| 权重衰减       | 1e-4                |
| 预训练        | ImageNet-1k         |


### 3.3 检测模型训练（YOLOv8）

```bash
yolo detect train \
  data=configs/pest_det.yaml \
  model=yolov8n.pt \
  imgsz=640 \
  epochs=100 \
  batch=16 \
  patience=20 \
  project=models \
  name=pest-det-v1
```

`configs/pest_det.yaml` 示例：

```yaml
path: ../data/labeled
train: ../data/splits/train_det.txt
val: ../data/splits/val_det.txt
names:
  0: peach_scab
  1: peach_leaf_curl
  2: apple_ring_rot
  # ...
```

### 3.4 数据增广策略

使用 **Albumentations**，仅对训练集应用：


| 增广                | 参数                                  | 目的     |
| ----------------- | ----------------------------------- | ------ |
| RandomResizedCrop | scale 0.8–1.0                       | 模拟不同取景 |
| HorizontalFlip    | p=0.5                               | 叶片对称   |
| VerticalFlip      | p=0.2                               | 田间倒置拍摄 |
| ColorJitter       | brightness/contrast/saturation ±20% | 光照变化   |
| GaussNoise        | var_limit 10–50                     | 手机噪点   |
| MotionBlur        | p=0.1                               | 手持抖动   |
| CoarseDropout     | max_holes=8                         | 抗遮挡    |


验证集**只做 Resize + Normalize**，不得增广。

---

## 四、评估与 85% → 95% 优化路径

### 4.1 评估指标


| 指标                        | 公式/含义            | 达标线     |
| ------------------------- | ---------------- | ------- |
| Top-1 Accuracy            | 预测最高分 = 真实标签     | 主指标     |
| Macro-F1                  | 各类 F1 算术平均       | 防止小类被忽视 |
| Confusion Matrix          | 混淆对（如缩叶病↔健康）     | 指导补数据   |
| [mAP@0.5](mailto:mAP@0.5) | 检测 IoU≥0.5 的平均精度 | 检测任务    |


```bash
python scripts/evaluate.py --weights models/pest-cls-v2.0.pt --split val
```

输出示例：

```text
Top-1 Accuracy: 94.2%
Macro-F1:       93.8%
Worst classes:  小麦赤霉病(89.1%), 桃褐腐病(91.3%)
```

### 4.2 基线阶段（目标 85%）

1. 使用公开数据 + 少量实地数据，EfficientNet-B0，基础增广。
2. 合并四作物标签为**全局 label map**（或按作物训练 4 个专家模型，推理时根据 `cropType` 路由）。
3. 达到 85% 后冻结为 **v1.0**，接入演示环境。

### 4.3 冲刺阶段（85% → 95%）

按优先级依次执行：


| 步骤           | 方法                                          | 预期提升     |
| ------------ | ------------------------------------------- | -------- |
| 1. 难例挖掘      | 收集 val 误判 + 线上 confidence<70% 样本，人工复核后加入训练集 | +3%–5%   |
| 2. 类别增广      | 对 F1<90% 的类别过采样至 1.5× 中位数                   | +2%–3%   |
| 3. 更大骨干      | B0 → B3 / ConvNeXt-T，其余超参不变                 | +1%–3%   |
| 4. 测试时增强 TTA | 原图 + 水平翻转，概率平均                              | +0.5%–1% |
| 5. 模型集成      | 3 个不同 seed 模型投票或概率平均                        | +1%–2%   |
| 6. 知识蒸馏（可选）  | 大模型教小模型，部署仍用轻量模型                            | 保持精度降延迟  |


**难例回流流程**：

```text
用户上传 → 推理 confidence < 0.7
    → 写入 hard_cases 队列
    → 农技员标注确认
    → 纳入下一版 train.txt
    → 重训 v2.1
```

### 4.4 验收清单（竞赛答辩用）

- 验证集 75/25 划分文件可出示，无数据泄漏说明。
- 混淆矩阵大图：说明最易混淆类别及改进措施。
- 基线 v1.0 与当前 v2.0 的 Accuracy / F1 对比表。
- 5–10 张**未参与训练**的实地照片现场识别演示。
- 推理耗时与部署环境（CPU/GPU）说明。

---

## 五、模型部署与系统接入

### 5.1 导出 ONNX

```python
# scripts/export_onnx.py
import torch

model.eval()
dummy = torch.randn(1, 3, 384, 384)
torch.onnx.export(
    model, dummy, 'models/pest-cls-v2.0.onnx',
    input_names=['input'], output_names=['logits'],
    dynamic_axes={'input': {0: 'batch'}, 'logits': {0: 'batch'}},
    opset_version=17
)
```

### 5.2 推理服务（FastAPI）

与现有前端 `POST /analysis/image` 对齐，建议路径：

```text
POST /api/analysis/image
Content-Type: multipart/form-data
  - file: 图片
  - cropType: peach | apple | wheat | rice
  - category: pest | disaster | climate | other
  - additionalInfo: 可选文本
```

**服务伪代码**：

```python
@app.post("/api/analysis/image")
async def analyze_image(
    file: UploadFile,
    cropType: str = Form(...),
    category: str = Form("pest"),
    additionalInfo: str = Form("")
):
    image = preprocess(await file.read())
    if category == "pest":
        logits = cls_session.run(None, {"input": image})[0]
        label, conf = postprocess(logits, cropType)
    else:
        label, conf = fallback_rules_or_submodel(category, image)

    detail = knowledge_base.lookup(cropType, label)  # 防治建议
    return {"result": label, "confidence": conf, "detail": detail}
```

### 5.3 与 Vue 前端联调

现有调用链无需大改：

```typescript
// src/api/analysis.ts — 保持不变
return http.post('/analysis/image', formData)
```

需配置 Vite 代理或生产环境 Nginx，将 `/analysis/image` 转发至 Python 推理服务（参考 `[docs/小挑/页面设置/图片分析.md](../../../小挑/页面设置/图片分析.md)` 中的 Flask 方案，可升级为 FastAPI + ONNX Runtime）。

**识别完成后的业务联动**（已实现）：

- `DataAnalysis.vue` 在分析成功后调用 `store.createAlert()` 写入预警中心。
- 低置信度时前端可增加「建议人工复核」提示（`confidence < 0.7`）。

### 5.4 模型版本管理


| 版本      | 用途               | 切换方式                      |
| ------- | ---------------- | ------------------------- |
| v0-mock | json-server 随机结果 | 当前演示默认                    |
| v1.0    | 基线 85% 模型        | 环境变量 `MODEL_VERSION=v1.0` |
| v2.0    | 竞赛 95% 模型        | 环境变量 `MODEL_VERSION=v2.0` |


推理服务启动时加载对应 ONNX；响应中 `detail.modelVersion` 便于日志与答辩追溯。

---

## 六、防治知识库（训练后衔接）

模型只解决「是什么」，防治方案依赖结构化知识库（可与训练并行）：

```text
ml/knowledge/
└── treatments.json
```

```json
{
  "桃缩叶病": {
    "chemical": ["甲基硫菌灵 800 倍液", "戊唑醇 3000 倍液"],
    "biological": ["清园、摘除病叶"],
    "window": "萌芽至展叶期",
    "safetyInterval": "7天"
  }
}
```

推理服务根据 `result` 字段查询，填入 `detail.treatmentHint`，供 `DecisionSupport.vue` 后续一键生成任务单。

---

## 七、人员分工与里程碑


| 角色    | 职责                    | 产出                    |
| ----- | --------------------- | --------------------- |
| 算法负责人 | 模型选型、训练脚本、评估报告        | `ml/scripts/*`、指标报告   |
| 数据标注员 | 按规范标注、质检              | `data/labeled/`       |
| 后端    | FastAPI 部署、与 Vue 代理联调 | `serving/app.py`      |
| 前端    | 低置信度 UI、模型版本展示        | `DataAnalysis.vue` 小改 |
| 农技顾问  | 标签体系、防治知识库审核          | `treatments.json`     |



| 周次    | 里程碑                                |
| ----- | ---------------------------------- |
| W1–W2 | 数据采集规范定稿，完成 ≥ 2000 张标注，75/25 划分    |
| W3–W4 | v1.0 训练，验证集 Accuracy ≥ 85%，ONNX 导出 |
| W5–W6 | 推理服务上线，前端真实联调                      |
| W7–W8 | 难例挖掘 + v2.0 训练，Accuracy ≥ 95%，答辩材料 |


---

## 八、风险与降级策略


| 风险         | 现象        | 应对                             |
| ---------- | --------- | ------------------------------ |
| 某类样本不足     | 该类 F1<80% | 合并相近类别或仅做「疑似」提示                |
| 实地与训练分布差异大 | 现场演示误判    | 演示前用现场光线重拍标定图；准备 3 张保底样例       |
| GPU 资源不足   | 训练慢       | Google Colab / 校内服务器；先用 B0 小模型 |
| 达不到 95%    | 答辩被问指标    | 强调「可迭代架构 + 难例闭环」与全链路业务价值       |
| 推理服务宕机     | 前端报错      | 回退 Mock 或返回「服务繁忙，请稍后」          |


---

## 九、相关文档索引


| 文档                                                                         | 说明                  |
| -------------------------------------------------------------------------- | ------------------- |
| `[2.0-功能扩展规划.md](../../规划/2.0-功能扩展规划.md)`                                         | 总体功能与阶段路线           |
| `[2.0.md](./2.0.md)`                                                       | 原始功能提纲              |
| `[docs/小挑/页面设置/图片分析.md](../../../小挑/页面设置/图片分析.md)`                               | Flask Mock 与前后端联调示例 |
| `[src/api/analysis.ts](../../../../src/api/analysis.ts)`                         | 前端分析 API            |
| `[src/views/user/DataAnalysis.vue](../../../../src/views/user/DataAnalysis.vue)` | 智能分析页面              |


---

**文档版本**：V1.2（同步 v2 多作物训练完成，97.53%）  
**最后更新**：2026-07-07  
**维护**：算法组 / 互联网＋项目组