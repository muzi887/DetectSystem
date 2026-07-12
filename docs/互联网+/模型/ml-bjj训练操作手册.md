# ml-bjj 训练操作手册

> **交付物**：只需 **ml-bjj 文件夹**（组员版；本人开发见 `[ml-bjj训练操作手册-开发版.md](./ml-bjj训练操作手册-开发版.md)`）。  
> **数据与脚本已就绪**，**不用下载数据集、不用改代码**。  
> **所有命令均在 `ml-bjj` 文件夹内执行**（先 `cd` 进入该目录）。

---

## 一、你要完成什么


| 步骤              | 脚本                       | 产出                        |
| --------------- | ------------------------ | ------------------------- |
| 1. 整理训练集（已做完）   | `scripts/prepare_bjj.py` | `data/bjj_cls/`           |
| 2. **训练模型（必做）** | `scripts/train_cls.py`   | `models/pest-cls-best.pt` |
| 3. 抽测验证         | `scripts/predict.py`     | 终端输出「病名 + 置信度」            |


**交付给负责人**：`models/pest-cls-best.pt`、验证准确率（终端或 `models/pest-cls-meta.json`）、至少 2 张抽测截图（小麦 + 玉米/番茄各 1）。

---

## 二、收到文件夹后先看这些

### 2.1 环境要求


| 项      | 要求                                       |
| ------ | ---------------------------------------- |
| 系统     | Windows 10/11（本文命令为 PowerShell）          |
| Python | 3.10 或 3.11（本机安装，能执行 `python --version`） |
| 文件夹    | 解压/拷贝到任意路径，示例：`D:\ml-bjj`                |
| 磁盘     | 整个文件夹约数 GB；训练过程另需约 500 MB                |
| 显卡     | 可选；无 NVIDIA 显卡时用 CPU（更慢，**请勿休眠**）        |
| 网络     | 首次训练需联网下载预训练权重（约 20 MB）                  |


### 2.2 包内有什么 / 没有什么


| 已包含                                | 说明                         |
| ---------------------------------- | -------------------------- |
| `scripts/` 三个训练脚本                  |                            |
| `data/bjj_cls/`                    | **训练直接用**（8 类，已整理好）        |
| `data/wheatPlantDiseases/`         | 小麦原始数据（可选，仅重跑 prepare 时需要） |
| `data/plantvillage dataset/color/` | 玉米/番茄原始数据（可选，同上）           |
| `requirements.txt`                 | 依赖清单                       |
| `models/`                          | 可能有 v2 对照权重；v3 权重训练后生成     |
| `.venv/`                           | **空目录，可忽略**；直接用本机 Python   |


另需本机已安装 **Python 3.10 或 3.11**。若只训练，**只带 `data/bjj_cls/` 即可**。

---

## 三、目录结构

解压后 **ml-bjj 就是工作根目录**，结构如下：

```text
ml-bjj/                          ← ★ 所有命令在这里面执行
  requirements.txt
  scripts/
    prepare_bjj.py
    train_cls.py                 ← 训练
    predict.py
  data/
    bjj_cls/                     ← ★ 训练用 8 类
    wheatPlantDiseases/data/       ← 原始数据（小麦）
    plantvillage dataset/color/  ← 原始数据（玉米/番茄）
  models/
```

（包内若有空的 `.venv/`，可忽略。）

**v3 识别的 8 类**：

```text
健康、小麦锈病、小麦赤霉病、小麦白粉病、小麦蚜虫为害
玉米大斑病、玉米锈病、番茄早疫病
```

当前 `data/bjj_cls/` 已整理完成（约 **train 10756 / val 3581** 张）。**可直接从 §4.2 训练开始**；仅当该目录被删空时才需重跑 `prepare_bjj.py`。

---

## 四、操作步骤（复制命令）

以下先 **进入 ml-bjj**，路径按本机修改：

```powershell
cd D:\ml-bjj
```

### 4.1 安装依赖（每台电脑做一次）

使用 **本机 Python** 即可，**无需** `python -m venv`、**无需**激活 `.venv`：

```powershell
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**检查环境**：

```powershell
python -c "import torch, timm; print('PyTorch', torch.__version__); print('CUDA', torch.cuda.is_available())"
```

若 `pip` 找不到，可改用：`python -m pip install -r requirements.txt ...`

### 4.2 整理数据（可选，多数情况跳过）

仅在 `data/bjj_cls/` **不存在或为空** 时执行：

```powershell
python scripts\prepare_bjj.py
```

成功标志：终端打印 8 个类别及 `train=… val=…`；`data/bjj_cls/` 下出现 `classes.txt`、`label_map.json`。

### 4.3 训练模型（核心步骤）

```powershell
python scripts\train_cls.py --epochs 20
```

说明：

- 默认读取 `data/bjj_cls/`，输出 `models/pest-cls-best.pt`
- 首次运行会自动下载 **EfficientNet-B0** 预训练权重
- 每个 epoch 结束会打印 **验证准确率**；最高的一次会自动保存
- **CPU 训练较慢**（可能数小时），期间不要休眠、不要关终端

快速试跑（约 5 epoch，仅调试）：

```powershell
python scripts\train_cls.py --epochs 5
```

训练完成后建议备份：

```powershell
copy models\pest-cls-best.pt models\pest-cls-bjj.pt
```

若包内有 `models/pest-cls-v2-27cls.pt`（27 类旧版），**不要当作 v3 模型使用**。

### 4.4 单张图片抽测

```powershell
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\小麦锈病\小麦锈病_00001.png"
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\玉米大斑病\玉米大斑病_00001.jpg"
```

输出示例：

```text
识别结果: 小麦锈病
置信度:   94.32%
```

也可测自己拍的照片：

```powershell
python scripts\predict.py --image "D:\照片\某张叶子.jpg"
```

---

## 五、训练结果在哪里


| 文件                          | 说明                  |
| --------------------------- | ------------------- |
| `models/pest-cls-best.pt`   | **v3 主模型权重**（交回负责人） |
| `models/pest-cls-meta.json` | 训练时间、最佳验证准确率        |
| `models/pest-cls-bjj.pt`    | 建议自留备份              |


查看最佳准确率：

```powershell
Get-Content models\pest-cls-meta.json
```

目标：验证准确率 **≥ 95%**（20 epoch、CPU 一般可达）。

---

## 六、常见问题

**Q：只有 ml-bjj 文件夹，没有 DetectSystem 行吗？**  
A：**行。** 本包自包含，不依赖上级仓库；始终在 `ml-bjj` 内执行命令即可。

**Q：包里的 `.venv` 是空的，要自建虚拟环境吗？**  
A：**不用。** 空目录可忽略；用本机 Python 执行 §4.1 安装依赖后，直接跑训练脚本即可。

**Q：找不到 `data/bjj_cls/train`？**  
A：运行 `python scripts\prepare_bjj.py`。

**Q：找不到 `models/pest-cls-best.pt`？**  
A：先完成 `train_cls.py` 训练。

**Q：训练很慢？**  
A：无显卡时用 CPU 正常；可先用 `--epochs 5` 试流程，正式交付用 20。

**Q：PlantVillage 路径报错？**  
A：路径在 `data/plantvillage dataset/color`，含空格，加引号：`"data\plantvillage dataset\color"`。

**Q：训练中断后能续训吗？**  
A：**不支持断点续训**；需重新运行 `train_cls.py`（会覆盖 `pest-cls-best.pt`）。

---

## 七、汇报模板（复制填写）

```text
【ml-bjj v3 训练汇报】
执行人：
日期：
ml-bjj 路径：D:\ml-bjj（本机实际路径）
环境：CPU / GPU（CUDA True/False）
训练轮数(epochs)：20
最佳验证准确率：（见 models/pest-cls-meta.json 或终端）
权重文件：models/pest-cls-best.pt（已备份 pest-cls-bjj.pt：是/否）
抽测1：图片路径=…  输出=…  置信度=…
抽测2：图片路径=…  输出=…  置信度=…
备注：
```

---

**文档版本**：V1.4（原始数据统一在 data/ 下；注释 wheat / PlantVillage 作用）  
**最后更新**：2026-07-08  
**维护**：互联网＋项目组 / 算法组