# ml-bjj 训练操作手册（开发版）

> **读者**：本人在 `DetectSystem` 仓库内维护 v3 模型。  
> **组员交付**：见 [`ml-bjj训练操作手册.md`](./ml-bjj训练操作手册.md)（精简版，可只发 `ml-bjj` 文件夹）。  
> **方案背景**：见 [`京津冀AI模型精简方案-v3.md`](./京津冀AI模型精简方案-v3.md)。

---

## 一、与交付版的区别

| 项 | 开发版（本文） | 交付版 |
|----|----------------|--------|
| 工作位置 | 项目根 `DetectSystem` + `ml-bjj/` | 仅 `ml-bjj` 文件夹 |
| Python 环境 | **推荐 `.venv` 虚拟环境** | 本机 Python 直跑 |
| 数据 | 保留原始数据 + `bjj_cls`，可重跑 prepare | 通常只带 `bjj_cls` |
| 命令路径 | `ml-bjj\scripts\...`（从项目根） | `scripts\...`（在 ml-bjj 内） |
| v2 对照 | 可访问 `ml-v2/` | 不涉及 |

---

## 二、仓库中的位置

```text
DetectSystem/
  ml-v2/                    ← v2 备份（27 类，勿动）
  ml-bjj/                   ← ★ v3 开发目录
    .venv/                  ← 本机创建，不提交、不打包给别人
    scripts/
    data/
      wheatPlantDiseases/data/       ← 原始数据（小麦）
      plantvillage dataset/color/    ← 原始数据（玉米/番茄）
      bjj_cls/                       ← 训练集（8 类）
    models/
    serving/                         ← v3 推理服务（app.py · 5000）
  docs/互联网+/
```

**v3 八类**：健康、小麦锈病、小麦赤霉病、小麦白粉病、小麦蚜虫为害、玉米大斑病、玉米锈病、番茄早疫病。

---

## 三、环境（虚拟环境）

在 **项目根目录** 执行（路径按本机修改）：

```powershell
cd D:\code2\software\vue\program\DetectSystem

# 首次：创建虚拟环境（只需一次）
python -m venv ml-bjj\.venv

# 每次开发前：激活
ml-bjj\.venv\Scripts\Activate.ps1

# 首次或 requirements 变更后：安装依赖
pip install -r ml-bjj\requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

激活成功时提示符前有 `(.venv)`。

若 `Activate.ps1` 被拦截：

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**检查**：

```powershell
python -c "import torch, timm; print('PyTorch', torch.__version__); print('CUDA', torch.cuda.is_available())"
```

退出虚拟环境：`deactivate`

> **不要**把 `.venv` 打进给组员的压缩包；交付版见 [`ml-bjj训练操作手册.md`](./ml-bjj训练操作手册.md)。

---

## 四、完整流程

以下命令默认：**已激活 `ml-bjj\.venv`**，当前目录为 **DetectSystem 项目根**。

### 4.1 整理数据（改原始数据或清空 bjj_cls 后执行）

```powershell
python ml-bjj\scripts\prepare_bjj.py
```

默认读取：

- 小麦：`ml-bjj\data\wheatPlantDiseases\data`
- PlantVillage：`ml-bjj\data\plantvillage dataset\color`
- 输出：`ml-bjj\data\bjj_cls`

显式指定路径：

```powershell
python ml-bjj\scripts\prepare_bjj.py ^
  --wheat-source ml-bjj\data\wheatPlantDiseases\data ^
  --plantvillage-source "ml-bjj\data\plantvillage dataset\color" ^
  --output ml-bjj\data\bjj_cls
```

成功：终端打印 8 类及 train/val 张数；`label_map.json` 更新。

### 4.2 备份 v2 权重（可选）

```powershell
copy ml-v2\models\pest-cls-best.pt ml-bjj\models\pest-cls-v2-27cls.pt
```

若 `ml-bjj\models\` 里已有该文件可跳过。

### 4.3 训练 v3

```powershell
python ml-bjj\scripts\train_cls.py --epochs 20
```

- **epochs=20**：脚本内部学 20 遍数据集，**只敲一次命令**，无需重复执行
- 默认数据：`ml-bjj/data/bjj_cls`
- 输出：`ml-bjj/models/pest-cls-best.pt`、`pest-cls-meta.json`
- 首次需联网下载 EfficientNet-B0 预训练权重
- CPU 训练较慢，期间勿休眠

调试可先用 `--epochs 5`。

训练后备份：

```powershell
copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj.pt
```

### 4.4 抽测

```powershell
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\小麦锈病\小麦锈病_00001.jpg"
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\玉米大斑病\玉米大斑病_00001.jpg"
python ml-bjj\scripts\predict.py --image "实地照片路径.jpg"
```

指定权重：

```powershell
python ml-bjj\scripts\predict.py --image "图片.jpg" --weights ml-bjj\models\pest-cls-bjj.pt
```

### 4.5 启动推理服务（网站智能分析）

三终端完整启动见 [`../网站/项目启动说明.md`](../网站/项目启动说明.md)。仅推理服务：

```powershell
ml-bjj\.venv\Scripts\Activate.ps1
python ml-bjj\serving\app.py
```

- 监听 **5000**；前端 `pnpm dev` 经 Vite 代理 `/api/analysis` 转发至此
- 与 `predict.py` 共用 `ml-bjj/serving/inference.py`
- 答辩降级：`$env:ML_BJJ_USE_MOCK="1"` 后启动

自检：

```powershell
curl http://127.0.0.1:5000/health
```

### 4.6 打包给组员（交付）

从 `ml-bjj/` 中拷贝（详见交付手册）：

- 必带：`scripts/`、`data/bjj_cls/`、`requirements.txt`、交付版手册
- 可选：原始 `data/wheatPlantDiseases/`、`data/plantvillage dataset/`（仅当对方可能要重跑 prepare）
- **不带**：`.venv/`、`__pycache__/`

---

## 五、数据流

```text
data/wheatPlantDiseases/data/  ──┐
                                 ├── prepare_bjj.py
data/plantvillage dataset/color/ ─┘
              ↓
       data/bjj_cls/（8 类）
              ↓
         train_cls.py
              ↓
   models/pest-cls-best.pt
              ↓
    predict.py / ml-bjj/serving/app.py（网站）
```

---

## 六、产出文件

| 文件 | 说明 |
|------|------|
| `ml-bjj/models/pest-cls-best.pt` | v3 当前最佳权重 |
| `ml-bjj/models/pest-cls-bjj.pt` | 建议自留备份 |
| `ml-bjj/models/pest-cls-meta.json` | 训练元数据、最佳验证准确率 |
| `ml-bjj/data/bjj_cls/label_map.json` | 数据整理记录 |

查看准确率：

```powershell
Get-Content ml-bjj\models\pest-cls-meta.json
```

目标：验证准确率 **≥ 95%**。

---

## 七、常见问题（开发）

**Q：为什么要用虚拟环境？**  
A：与仓库其他 Python 依赖隔离；本机长期开发更稳妥。组员交付版为省事用本机 Python。

**Q：改原始数据后要不要重训？**  
A：先 `prepare_bjj.py` 再生 `bjj_cls`，再 `train_cls.py`。

**Q：训练轮数 20 要执行 20 次命令吗？**  
A：**不用。** 一次 `train_cls.py --epochs 20`，脚本自动跑 20 个 epoch。

**Q：训练中断怎么办？**  
A：当前脚本不支持断点续训；重新执行 `train_cls.py`（会覆盖 `pest-cls-best.pt`）。

**Q：训练完怎么接网站？**  
A：已实现。启动 `python ml-bjj\serving\app.py`，详见 [`../网站/项目启动说明.md`](../网站/项目启动说明.md)。

---

## 八、相关文档

| 文档 | 用途 |
|------|------|
| [`京津冀AI模型精简方案-v3.md`](./京津冀AI模型精简方案-v3.md) | 8 类方案、目录规范 |
| [`ml-bjj训练操作手册.md`](./ml-bjj训练操作手册.md) | 组员交付版 |
| [`AI模型能力与本土化测试说明.md`](./AI模型能力与本土化测试说明.md) | 实地拍图与抽测 |
| [`../下一阶段任务与流程.md`](../下一阶段任务与流程.md) | 整体路线 |
| [`../网站/项目启动说明.md`](../网站/项目启动说明.md) | 三终端启动 |
| [`AI模型训练说明.md`](./AI模型训练说明.md) | v2 通用训练知识 |

---

**文档版本**：V1.1（补充推理服务启动）  
**最后更新**：2026-07-09  
**维护**：互联网＋项目组 / 算法组
