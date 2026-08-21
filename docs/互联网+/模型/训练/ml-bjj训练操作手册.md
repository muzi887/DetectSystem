# ml-bjj 训练操作手册

所有命令均在 `ml-bjj` 文件夹内执行。包内已含 `data/bjj_cls/`（23 类）。

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
