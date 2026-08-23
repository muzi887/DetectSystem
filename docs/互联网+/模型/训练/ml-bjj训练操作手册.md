# ml-bjj 训练操作手册

所有命令均在 `ml-bjj` 文件夹内执行。包内已含 `data/bjj_cls/`（23 类，train/val 已切好）。

> **组员只需本包即可训练**，不必再有 `data/` 下各中文类文件夹。若压缩包里只有 `bjj_cls` 而没有 `scripts/`、`requirements.txt`，请向发件人索要完整交付包。

---

## 一、任务与交付

| 步骤 | 命令脚本 | 产出 |
|------|----------|------|
| 1. 训练模型 | `scripts/train_cls.py` | `models/pest-cls-best.pt` |
| 2. 抽测 | `scripts/predict.py` | 病名 + 置信度 |

交回：`models/pest-cls-best.pt`、`models/pest-cls-meta.json`、小麦/玉米/水稻各 1 张抽测截图。

---

## 二、环境

| 项 | 要求 |
|------|------|
| 系统 | Windows 10/11，PowerShell |
| Python | 3.10 或 3.11 |
| 网络 | 首次训练需联网下载预训练权重 |
| 注意 | CPU 训练较慢，期间勿休眠、勿关终端 |

---

## 三、目录与类别

```text
ml-bjj/
  requirements.txt
  scripts/
    train_cls.py
    predict.py
  data/
    bjj_cls/        ← 训练读取
  models/
```

共 23 类：

| 作物 | 类别 |
|------|------|
| 共用 | 健康 |
| 小麦 | 小麦锈病、小麦赤霉病、小麦白粉病、小麦蚜虫为害 |
| 玉米 | 玉米大斑病、玉米锈病、玉米南方锈病、玉米小斑病、玉米弯孢叶斑病、玉米褐斑病、玉米瘤黑粉病、玉米茎腐病、玉米穗腐病 |
| 番茄 | 番茄早疫病 |
| 水稻 | 水稻白叶枯病、水稻褐斑病、水稻负泥虫为害、稻瘟病、水稻叶鞘腐败病、水稻叶黑粉病、水稻窄条斑病、稻颈瘟 |

### 3.1 收到压缩包后应有哪些内容

| 应有 | 说明 |
|------|------|
| `scripts/train_cls.py`、`scripts/predict.py` | 训练与抽测 |
| `data/bjj_cls/train/`、`data/bjj_cls/val/` | 23 类图片（约 75% / 25%） |
| `requirements.txt` | Python 依赖 |
| 本手册 | 操作说明 |

**不需要**：`data/稻瘟病/` 等中文源图文件夹、`archive*`、`.venv`（对方本机自建环境）。

> **发件人须知**：压缩包里的 `bjj_cls` 应以**打包前已执行 `prepare_from_class_folders.py`** 为准。若维护方只改了 `data/<类名>/` 源图、未重切，组员仍会训到旧数据。打包前请核对：各类源图张数 = `bjj_cls` 的 train + val。

---

## 四、操作步骤

```powershell
cd D:\ml-bjj
```

路径按本机修改。

### 4.1 安装依赖

```powershell
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
python -c "import torch, timm; print(torch.__version__, torch.cuda.is_available())"
```

### 4.2 训练

```powershell
python scripts\train_cls.py --epochs 20
```

读取 `data/bjj_cls/`，写出 `models/pest-cls-best.pt` 与 `models/pest-cls-meta.json`。

```powershell
copy models\pest-cls-best.pt models\pest-cls-bjj.pt
```

### 4.3 抽测

```powershell
python scripts\predict.py --image "data\bjj_cls\val\小麦锈病\小麦锈病_00001.jpg"
python scripts\predict.py --image "data\bjj_cls\val\玉米大斑病\玉米大斑病_00001.jpg"
python scripts\predict.py --image "data\bjj_cls\val\稻瘟病\稻瘟病_00001.jpg"
```

---

## 五、查看准确率

```powershell
Get-Content models\pest-cls-meta.json
```

目标：验证准确率 ≥ 95%。

---

## 六、汇报模板

```text
【ml-bjj 训练汇报】
执行人：
日期：
路径：
环境：CPU / GPU
epochs：20
最佳验证准确率：
权重：models/pest-cls-best.pt
抽测小麦：结果=  置信度=
抽测玉米：结果=  置信度=
抽测水稻：结果=  置信度=
```

---

**最后更新**：2026-08-22（发件人打包前须 prepare 的通用说明）
