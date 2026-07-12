# 京津冀区域 AI 模型精简方案（v3）

> 面向 **京津冀** 试点：作物聚焦 **小麦、玉米、蔬菜**，病害 **少而精**，与业务场景及网站 Mock 对齐。  
> **v3 需要重新训练**一个新模型（不能从 v2 的 27 类权重里删类）。v2 见 `[AI模型能力与本土化测试说明.md](./AI模型能力与本土化测试说明.md)`，可备份保留。  
> **脚本已就绪**：`ml-bjj/scripts/prepare_bjj.py` → `train_cls.py`。  
> **ml-bjj 目录**：见 **[零、ml-bjj 目录规范](#零ml-bjj-目录规范)**（本项目已按此准备）。  
> **组员训练操作**：见 **[ml-bjj训练操作手册.md](./ml-bjj训练操作手册.md)**（交付版）。  
> **本人开发操作**：见 **[ml-bjj训练操作手册-开发版.md](./ml-bjj训练操作手册-开发版.md)**（虚拟环境 + 完整流程）。

---

## 零、ml-bjj 目录规范

v3 使用项目根下的 **`ml-bjj/`**，与 v2 备份 `ml-v2/` 分离。下列结构为 **已采纳方案**（与当前 `ml-bjj/` 一致）。

### 0.1 目录结构

```text
DetectSystem/
  ml-v2/                              ← v2 备份（不参与 v3）
  ml-bjj/                             ← ★ v3 专用
    .gitignore
    requirements.txt
    scripts/
      prepare_bjj.py
      train_cls.py
      predict.py
    data/
      wheatPlantDiseases/data/              ← 小麦原始素材（prepare 用，见 0.2）
      plantvillage dataset/color/         ← 玉米/番茄原始素材（prepare 用，见 0.3）
      bjj_cls/                            ← 8 类训练集（train_cls 用，见 0.4）
    models/
```

### 0.2 小麦原始数据 `data/wheatPlantDiseases/`（prepare 输入）

**作用**：Kaggle 小麦病害**原始包**；`prepare_bjj.py` 读取后合并为 v3 小麦相关 5 类，写入 `bjj_cls`。**`train_cls.py` 不读此目录。**

路径：`ml-bjj/data/wheatPlantDiseases/data/{train,valid,test}/`

| split | 文件夹命名（Kaggle 原样） | 说明 |
|-------|---------------------------|------|
| `train/` | `Yellow Rust`、`Brown Rust`、`Black Rust`、`Fusarium Head Blight`、`Mildew`、`Aphid`、`Mite`、`Stem fly`、`Healthy` | 9 个 |
| `valid/` | `yellow_rust_valid`、`brown_rust_valid`、…（共 9 个 `*_valid`） | `prepare_bjj.py` 自动识别 |
| `test/` | `yellow_rust_test`、`brown_rust_test`、…（共 9 个 `*_test`） | 同上 |

整理后 v3 标签：

| 源类 | v3 标签 |
|------|---------|
| 三种 Rust | 小麦锈病 |
| Fusarium Head Blight | 小麦赤霉病 |
| Mildew | 小麦白粉病 |
| Aphid / Mite / Stem fly | 小麦蚜虫为害 |
| Healthy | 健康 |

**不要**整包复制 Kaggle 小麦集（含 Septoria、散黑穗等 v3 不用的类）。

### 0.3 PlantVillage 原始数据 `data/plantvillage dataset/color/`（prepare 输入）

**作用**：玉米/番茄**原始公开数据**（5 个文件夹）；`prepare_bjj.py` 读取后写入 `bjj_cls` 的玉米、番茄及「健康」类。**`train_cls.py` 不读此目录。**

路径：`ml-bjj/data/plantvillage dataset/color/`

| 文件夹名 | v3 标签 |
|----------|---------|
| `Corn_(maize)___Common_rust_` | 玉米锈病 |
| `Corn_(maize)___Northern_Leaf_Blight` | 玉米大斑病 |
| `Corn_(maize)___healthy` | 健康 |
| `Tomato___Early_blight` | 番茄早疫病 |
| `Tomato___healthy` | 健康 |

`color/` 下 **仅有这 5 个文件夹**。命令行路径含空格需加引号。

### 0.4 训练集 `data/bjj_cls/`（train 输入）

**作用**：整理后的 **8 类** train/val，由 `prepare_bjj.py` 从小麦 + PlantVillage **复制、合并、划分** 得到；**`train_cls.py` 只读这里。** 只交付训练任务时可只传本目录（不传 0.2、0.3 原始包）。

### 0.5 当前 ml-bjj 自检（2026-07-09）

| 项 | 要求 | 状态 |
|----|------|------|
| `requirements.txt`、`.gitignore` | 存在 | ✅ |
| `scripts/` 三个 py | prepare_bjj、train_cls、predict | ✅ |
| 小麦 train 9 类 | Title Case 英文名 | ✅ |
| 小麦 valid/test 各 9 类 | `*_valid` / `*_test` 命名 | ✅ |
| PlantVillage `data/.../color/` | 恰好 5 个文件夹 | ✅ |
| `data/bjj_cls/` | 跑 `prepare_bjj.py` 后应有 8 类 train/val | ✅ 已生成（10756 / 3581） |
| `.venv/` | 已建并安装依赖 | ✅ |
| `models/pest-cls-best.pt` | v3 训练后产出 | ✅ **98.99%**（2026-07-08） |
| `models/pest-cls-meta.json` | 8 类、history | ✅ |
| `predict.py` 抽测 | 验证集小麦锈病、玉米大斑病 | ✅ 2026-07-09（见 0.8） |
| `models/pest-cls-v2-27cls.pt` | 可选，仅 v2 对照 | ✅ 已有 |
| `models/pest-cls-bjj.pt` | 可选显式备份 | ⬜ 可选（`pest-cls-best.pt` 已是 v3 主推） |

### 0.6 不要复制

| 项 | 原因 |
|----|------|
| `.venv/` | 路径绑定旧目录，必须在 `ml-bjj` 下重建 |
| `__pycache__/`、`*.pyc` | 缓存 |
| `archive.zip`、`archive_*.zip` | 压缩包；源数据已解压则冗余 |
| `data/riceLeafDiseases/` | v3 不用水稻 |
| `data/rice_cls/`、`data/wheat_cls/`、`data/plantvillage_cls/`、`data/all_crops_cls/` | v2 中间/合并结果 |
| `data/plantvillage dataset/grayscale/`、`segmented/` | v3 不用（仅保留 color） |
| `knowledge/` | v3 暂不需要 |
| v2 的 `prepare_plantvillage.py` 等旧脚本 | 桃/苹果、水稻、27 类合并，v3 不用 |
| 把 v2 权重当 v3 模型 | v3 必须重训 8 类 |

### 0.7 已完成流程（2026-07-08 训练 · 2026-07-09 抽测）

```powershell
cd D:\code2\software\vue\program\DetectSystem
ml-bjj\.venv\Scripts\Activate.ps1

python ml-bjj\scripts\prepare_bjj.py
python ml-bjj\scripts\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20

# 抽测（验证集，扩展名以目录内实际文件为准）
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\小麦锈病\小麦锈病_00001.png"
# → 小麦锈病  87.87%

python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\玉米大斑病\玉米大斑病_00001.jpg"
# → 玉米大斑病  91.51%
```

### 0.8 命令行抽测记录（2026-07-09）

| 测试图 | 人工标签（文件夹） | 模型输出 | 置信度 | 结果 |
|--------|-------------------|----------|--------|------|
| `val/小麦锈病/小麦锈病_00001.png` | 小麦锈病 | 小麦锈病 | 87.87% | ✅ |
| `val/玉米大斑病/玉米大斑病_00001.jpg` | 玉米大斑病 | 玉米大斑病 | 91.51% | ✅ |

数据流：

```text
data/wheatPlantDiseases/data/ + data/plantvillage dataset/color/5 文件夹
        ↓  prepare_bjj.py
ml-bjj/data/bjj_cls/（8 类）
        ↓  train_cls.py
ml-bjj/models/pest-cls-best.pt（v3 主推；可选再备份为 pest-cls-bjj.pt）
```

---

## 一、为什么要做 v3


| 问题（v2）                   | v3 目标                 |
| ------------------------ | --------------------- |
| 含水稻、苹果、桃，与京津冀主粮不符        | 仅小麦 + 玉米 + 1–2 种蔬菜    |
| 27 类过多，答辩难讲清             | **10–12 类**，每类有明确业务含义 |
| 小麦锈病拆成 3 类，易混淆           | 合并为 **小麦锈病** 1 类      |
| 无玉米                      | 增加玉米主要病害              |
| Mock 写「小麦锈病」，模型输出「小麦条锈病」 | 训练标签与展示文案统一           |


**原则**：v2 权重备份为 `pest-cls-v2-27cls.pt`；**v3 重训后**用新权重 `pest-cls-bjj.pt`（或覆盖 `pest-cls-best.pt`）作为京津冀主推模型。

---

## 二、推荐类别体系（8 类 · 答辩版）

### 2.1 最终训练用 8 类

```text
健康
小麦锈病、小麦赤霉病、小麦白粉病、小麦蚜虫为害
玉米大斑病、玉米锈病
番茄早疫病
```


| 中文标签   | 作物  | 数据来源                              |
| ------ | --- | --------------------------------- |
| 健康     | 通用  | 小麦/玉米/番茄 healthy 合并               |
| 小麦锈病   | 小麦  | Kaggle 三条锈病合并                     |
| 小麦赤霉病  | 小麦  | Kaggle Fusarium Head Blight       |
| 小麦白粉病  | 小麦  | Kaggle Mildew                     |
| 小麦蚜虫为害 | 小麦  | Kaggle 麦蚜/红蜘蛛/茎蝇合并                |
| 玉米大斑病  | 玉米  | PlantVillage Northern_Leaf_Blight |
| 玉米锈病   | 玉米  | PlantVillage Common_rust          |
| 番茄早疫病  | 蔬菜  | PlantVillage Early_blight         |


「健康」为 **全局 1 类**（小麦、玉米、番茄的正常样本都放进同一文件夹）。

### 2.2 从 v2 删除的内容（不进入 v3 训练集）

| 全部 **水稻** 9 类                | 京津冀非水稻主产区         |
| **桃、苹果** 全部                  | 非本方案作物            |
| 小麦 Septoria、散黑穗、根腐等 **次要病害** | 精简；必要时并入「其他」或暂不识别 |
| 小麦 **3 种锈病独立类**              | 合并为「小麦锈病」         |

---

## 三、v2 → v3 标签映射（整理数据时用）

### 3.1 小麦（来源：`wheat_cls` / Kaggle 英文文件夹）


| 原 v2 标签 / 英文源        | v3 标签                   |
| -------------------- | ----------------------- |
| 小麦条锈病、小麦叶锈病、小麦秆锈病    | **小麦锈病**                |
| 小麦赤霉病                | **小麦赤霉病**               |
| 小麦白粉病                | **小麦白粉病**               |
| 麦蚜为害、麦红蜘蛛为害、麦茎蝇为害    | **小麦蚜虫为害**（或仅保留麦蚜，其余删除） |
| Healthy / 健康（小麦）     | **健康**                  |
| 其余（Septoria、叶枯、散黑穗等） | **不纳入 v3**（或后续「小麦其他病害」） |


### 3.2 玉米（来源：PlantVillage `Corn_(maize)__`_ 或 Kaggle）


| 英文源（PlantVillage 示例）                  | v3 标签       |
| ------------------------------------- | ----------- |
| Corn_(maize)__*Common_rust*           | **玉米锈病**    |
| Corn_(maize)___Northern_Leaf_Blight   | **玉米大斑病**   |
| Corn_(maize)___Cercospora_leaf_spot … | 可并入大斑病或暂不纳入 |
| Corn_(maize)___healthy                | **健康**      |


### 3.3 蔬菜（来源：PlantVillage 番茄 或 Kaggle）


| 英文源                   | v3 标签           |
| --------------------- | --------------- |
| Tomato___Early_blight | **番茄早疫病**       |
| Tomato___Late_blight  | 可并入早疫病或单列（类数+1） |
| Tomato___healthy      | **健康**          |


---

## 四、数据来源总览


| 作物 | 本地路径 | 是否用于 v3 |
|------|----------|-------------|
| 小麦 | `ml-bjj/data/wheatPlantDiseases/data/`（原始，prepare 用） | ✅ |
| 玉米、番茄 | `ml-bjj/data/plantvillage dataset/color/`（原始，prepare 用） | ✅ |
| 训练集 | `ml-bjj/data/bjj_cls/`（train 用） | ✅ |
| 桃、苹果、水稻 | 不纳入 ml-bjj | ❌ |

---

## 五、数据整理（prepare_bjj.py）

原始数据规范见 **第零节**。脚本读取 ml-bjj 内小麦 + PlantVillage，输出 `ml-bjj/data/bjj_cls/`（8 类）。

| 源类 | v3 标签 |
|------|---------|
| 三种 Rust（含 `*_valid` / `*_test` 文件夹名） | 小麦锈病 |
| Fusarium Head Blight | 小麦赤霉病 |
| Mildew | 小麦白粉病 |
| Aphid / Mite / Stem fly | 小麦蚜虫为害 |
| Healthy / 玉米·番茄 healthy | 健康 |
| PlantVillage 5 文件夹 | 玉米大斑病、玉米锈病、番茄早疫病、健康 |

`train/`、`valid/`、`test/` 合并后按 75%/25% 划分 `bjj_cls` 的 train/val。

运行前：`bjj_cls/` 为空则先跑脚本；`--plantvillage-source` 指向 **`ml-bjj/data/plantvillage dataset/color`**（含空格加引号）。

---

## 六、重训 v3 完整流程

> **前提**：ml-bjj 数据目录已就绪（见 **0.4 自检**）；已建 `.venv` 并安装依赖。

在项目根目录 `DetectSystem`，进入虚拟环境：

```powershell
cd D:\code2\software\vue\program\DetectSystem
ml-bjj\.venv\Scripts\Activate.ps1
```

### 第 0 步：v2 权重对照（可选）

ml-bjj 中已有 `models/pest-cls-v2-27cls.pt` 时可跳过；否则：

```powershell
copy ml-v2\models\pest-cls-best.pt ml-bjj\models\pest-cls-v2-27cls.pt
```

### 第 1 步：整理 v3 数据（小麦 + PlantVillage 玉米/番茄 → 8 类）

```powershell
python ml-bjj\scripts\prepare_bjj.py
```

默认读取：

- 小麦：`ml-bjj\data\wheatPlantDiseases\data`
- PlantVillage：`ml-bjj\data\plantvillage dataset\color`
- 输出：`ml-bjj\data\bjj_cls`

路径不同时可显式指定：

```powershell
python ml-bjj\scripts\prepare_bjj.py ^
  --wheat-source ml-bjj\data\wheatPlantDiseases\data ^
  --plantvillage-source "ml-bjj\data\plantvillage dataset\color" ^
  --output ml-bjj\data\bjj_cls
```

成功后检查：

```text
ml-bjj/data/bjj_cls/
  train/健康/  train/小麦锈病/  …  （共 8 类）
  val/…
  classes.txt
  label_map.json
```

若某类显示「无图片」警告，检查对应源目录是否存在。

### 第 2 步：重新训练（必须，这是新模型）

```powershell
python ml-bjj\scripts\train_cls.py --data-dir ml-bjj/data/bjj_cls --epochs 20
```

- 输出默认仍为 `ml-bjj/models/pest-cls-best.pt`  
- 训练完成后建议再备份：`copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj.pt`

CPU 上 8 类比 27 类 **更快**；训练期间电脑 **不要休眠**。

### 第 3 步：测试（已通过 · 2026-07-09）

```powershell
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\小麦锈病\小麦锈病_00001.png"
# 识别结果: 小麦锈病  置信度: 87.87%

python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\玉米大斑病\玉米大斑病_00001.jpg"
# 识别结果: 玉米大斑病  置信度: 91.51%
```

> 路径须含 `ml-bjj\` 前缀；扩展名以验证集目录内实际文件为准（`.png` / `.jpg`）。

### 第 4 步：接入网站

推理服务加载 **v3 权重**（已实现：`ml-bjj/serving/app.py`，见 [`../网站/项目启动说明.md`](../网站/项目启动说明.md)）。

---

## 七、目标数据目录

```text
ml-bjj/data/bjj_cls/              # prepare_bjj.py 自动生成
  train/
    健康/
    小麦锈病/
    小麦赤霉病/
    小麦白粉病/
    小麦蚜虫为害/
    玉米大斑病/
    玉米锈病/
    番茄早疫病/
  val/
    （同上 8 类）
  classes.txt
  label_map.json
```

---

## 八、与旧脚本的关系


| 脚本                        | v3 是否使用                              |
| ------------------------- | ------------------------------------ |
| `prepare_bjj.py`          | ✅ **用这个**                            |
| `prepare_plantvillage.py` | ❌ 桃/苹果，v3 不用                         |
| `prepare_wheat_rice.py`   | ❌ 含水稻，v3 不用                          |
| `merge_datasets.py`       | ❌ 合并 27 类，v3 不用                      |
| `train_cls.py`            | ✅ 改 `--data-dir ml-bjj/data/bjj_cls` |
| `predict.py`              | ✅ 测试 v3                              |


---

## 九、网站与 Mock 对齐

### 9.1 前端 `cropType` 建议


| cropType                  | 适用 v3 类别             |
| ------------------------- | -------------------- |
| `wheat`                   | 小麦锈病、赤霉病、白粉病、蚜虫为害、健康 |
| `corn`                    | 玉米大斑病、玉米锈病、健康        |
| `rice`                    | **下架或隐藏**（京津冀版）      |
| `peach` / `apple`         | **下架或隐藏**            |
| 新增 `tomato` 或 `vegetable` | 番茄早疫病、健康             |


### 9.2 推理输出

v3 训练标签已与 Mock 一致（如「小麦锈病」），**无需再做名称映射**。

### 9.3 Mock 预警示例

```text
[AI识别] 监测到 小麦 - 小麦锈病 (置信度: 94.0%)
[AI识别] 监测到 小麦 - 小麦赤霉病 (置信度: 91.0%)
[AI识别] 监测到 玉米 - 玉米大斑病 (置信度: 88.0%)
```

---

## 十、本土化测试（京津冀 · 精简版）

每类 **3–5 张** 即可，合计约 **25–40 张**：


| 作物  | 必测类别      | 拍摄要点          |
| --- | --------- | ------------- |
| 小麦  | 锈病、赤霉病、健康 | 叶部锈斑 / 穗部霉层特写 |
| 玉米  | 大斑病或锈病、健康 | 玉米叶大斑、锈斑      |
| 番茄  | 早疫病、健康    | 设施大棚叶片轮纹斑     |
| 可选  | 白粉病、蚜虫为害  | 补拍            |


测试命令：

```powershell
python ml-bjj\scripts\predict.py --image "实地照片.jpg"
```

记录表字段：**文件名、地块（京津冀某县）、人工标签、模型输出、置信度**。

---

## 十一、实施路线图


| 阶段 | 任务 | 状态 |
|------|------|------|
| 0 | ml-bjj 目录、数据、`bjj_cls`、`.venv` | ✅ 已完成 |
| 1 | `train_cls.py` 重训 v3（98.99%） | ✅ 已完成 |
| 2 | `predict.py` 抽测（小麦锈病、玉米大斑病） | ✅ 已完成 |
| 3 | 推理服务 / 网站接入 v3 权重 | ✅ 已完成（2026-07-09） |
| 4 | 京津冀实地抽测 | 后续 |


---

## 十二、预期指标（v3）


| 指标            | 目标         | 实际（2026-07-08） |
| ------------- | ---------- | ---------------- |
| 类别数           | **8**      | **8** ✅          |
| 验证集准确率        | ≥ **95%**  | **98.99%** ✅     |
| 命令行抽测         | 主病害识别正确    | 小麦锈病 87.87%、玉米大斑病 91.51% ✅ |
| 覆盖作物          | 小麦、玉米、番茄   | ✅                |
| 网站 curl/页面抽测      | 与 predict 一致   | 小麦锈病 87.87%、玉米大斑病 91.51% ✅ |


---

## 十三、常见问题

**Q：valid/test 文件夹名和 train 不一样可以吗？**  
A：**可以。** Kaggle 的 `valid/`、`test/` 常用 `yellow_rust_valid` 这类命名；`prepare_bjj.py` 会自动规范化，与 train 下的 `Yellow Rust` 等合并处理。

**Q：bjj_cls 目录是空的正常吗？**  
A：**正常。** 跑完 `prepare_bjj.py` 后才会生成 8 类 train/val。

**Q：精简版是不是要重新训练？**  
A：**是。** 整理 `bjj_cls` 后必须再跑 `train_cls.py`，得到新的 8 类权重；不要用 `pest-cls-v2-27cls.pt` 作 v3 模型。

**Q：PlantVillage 路径怎么写？**  
A：**`ml-bjj/data/plantvillage dataset/color`**（含空格加引号）。

---

## 十四、相关文档


| 文档                                         | 关系             |
| ------------------------------------------ | -------------- |
| `[AI模型能力与本土化测试说明.md](./AI模型能力与本土化测试说明.md)` | v2 现状与拍图规范     |
| `[数据集整理说明.md](./数据集整理说明.md)`               | v2 整理流程（小麦/水稻） |
| `[../下一阶段任务与流程.md](../下一阶段任务与流程.md)`           | 整体路线        |
| `[../网站/项目启动说明.md](../网站/项目启动说明.md)`           | 三终端启动       |
| `[../2.0-功能扩展规划.md](../2.0-功能扩展规划.md)`         | 系统整体 2.0       |


---

**文档版本**：V3.2（网站 v3 推理已接入）  
**最后更新**：2026-07-09  
**维护**：互联网＋项目组 / 算法组