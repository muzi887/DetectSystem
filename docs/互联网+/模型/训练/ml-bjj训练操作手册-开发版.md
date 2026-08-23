# ml-bjj 训练操作手册（开发版）

> **读者**：本人在 `DetectSystem` 仓库内维护分类模型。  
> **组员交付**：见 `[ml-bjj训练操作手册.md](./ml-bjj训练操作手册.md)`（精简版；类数/目录变更后需另同步）。  
> **方案背景**：见 `[京津冀AI模型精简方案-v3.md](../方案/京津冀AI模型精简方案-v3.md)`（历史 8 类方案，当前以本文为准）。

---

## 一、与交付版的区别


| 项         | 开发版（本文）                                  | 交付版                       |
| --------- | ---------------------------------------- | ------------------------- |
| 工作位置      | 项目根 `DetectSystem` + `ml-bjj/`           | 仅 `ml-bjj` 文件夹            |
| Python 环境 | **推荐** `.venv` **虚拟环境**                  | 本机 Python 直跑              |
| 数据        | `data/` 中文类文件夹 + 可重跑 prepare → `bjj_cls` | 通常只带 `bjj_cls`            |
| 命令路径      | `ml-bjj\scripts\...`（从项目根）               | `scripts\...`（在 ml-bjj 内） |
| v2 对照     | 可访问 `ml-v2/`                             | 不涉及                       |


---

## 二、仓库位置与当前类别

```text
DetectSystem/
  ml-bjj/                        ← ★ 开发目录
    .venv/                       ← 本机创建，不提交
    scripts/
      classify_rice.py                    ← 水稻 YOLO → 中文类文件夹
      prepare_from_class_folders.py       ← ★ 当前：中文类文件夹 → bjj_cls
      augment_class.py                    ← 少样本类离线增强（默认弯孢）
      prepare_from_wheat_plantvillage.py  ← 历史：小麦Kaggle + PlantVillage → 8 类
      train_cls.py
      predict.py
    data/                        ← ★ 一类一个中文文件夹（见下）
      bjj_cls/                   ← prepare 生成的 train/val（训练直接读这里）
      hard_cases/                ← 实地难例（可空）
      rice_classify_meta.json    ← 水稻分类脚本记录（可选保留）
    models/
    serving/                     ← 推理服务 app.py · 5000
  docs/互联网+/模型/
```



### 2.1 `data/` 约定（当前结构）

- **一类一个中文文件夹**，与训练标签同名。
- 图片可直接放在类文件夹根下，也可留一层子目录（如 `小麦锈病/Yellow Rust/*.jpg`）；`prepare_from_class_folders.py` **递归收集**。
- **「健康」合并**：小麦 / 玉米 / 番茄 / 水稻健康图都进 `健康/`，不按作物拆开。
- 训练**不直接**读各类文件夹，必须先跑 `prepare_from_class_folders.py` 生成 `bjj_cls/train|val`。
- 旧流程（尚未展平成中文类、仍有 `wheatPlantDiseases` + `plantvillage dataset`）才用 `prepare_from_wheat_plantvillage.py`。



### 2.2 当前训练类别（23 类）


| 作物  | 类别                                                       |
| --- | -------------------------------------------------------- |
| 共用  | 健康                                                       |
| 小麦  | 小麦锈病、小麦赤霉病、小麦白粉病、小麦蚜虫为害                                  |
| 玉米  | 玉米大斑病、玉米锈病、玉米南方锈病、玉米小斑病、玉米弯孢叶斑病、玉米褐斑病、玉米瘤黑粉病、玉米茎腐病、玉米穗腐病 |
| 番茄  | 番茄早疫病                                                    |
| 水稻  | 水稻白叶枯病、水稻褐斑病、水稻负泥虫为害、稻瘟病、水稻叶鞘腐败病、水稻叶黑粉病、水稻窄条斑病、稻颈瘟       |




### 2.3 可删 / 勿删


| 内容                                       | 建议                              |
| ---------------------------------------- | ------------------------------- |
| `archive_*.zip`、`archive.zip`、`corn.zip` | 确认类文件夹齐全后**可删或移到外置备份**（约数 GB）   |
| `archive_riceLeafDiseases/`              | 已跑过 `classify_rice.py` 且抽查无误后可删 |
| 各类中文文件夹                                  | **保留**（原始归类库）                   |
| `bjj_cls/`                               | 改数据后会重建；可删后重跑 prepare           |
| `hard_cases/`                            | 保留（实地误判样本）                      |


自检各类张数：

```powershell
Get-ChildItem "ml-bjj\data" -Directory |
  Where-Object { $_.Name -notin @('bjj_cls','hard_cases','archive_riceLeafDiseases') } |
  ForEach-Object {
    $n = (Get-ChildItem $_.FullName -Recurse -File -Include *.jpg,*.jpeg,*.png,*.webp).Count
    "{0}`t{1}" -f $_.Name, $n
  }
```

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

退出：`deactivate`

> **不要**把 `.venv` 打进给组员的压缩包。

---



## 四、完整流程

以下默认：**已激活** `ml-bjj\.venv`，当前目录为 **DetectSystem 项目根**。

### 4.1（按需）水稻 YOLO → 中文类文件夹

若水稻仍在 `archive_riceLeafDiseases/rice`（`images/` + `labels/`），先分类：

```powershell
# 预览
python ml-bjj\scripts\classify_rice.py --dry-run

# 正式写入 data/ 下中文类（拷贝；健康并入「健康」）
python ml-bjj\scripts\classify_rice.py
```

映射见脚本内 `YOLO_TO_CN`。完成后抽查 `稻瘟病`、`水稻白叶枯病` 等。

### 4.2 整理训练集（中文类 → `bjj_cls`）

改过类文件夹或清空 `bjj_cls` 后执行：

```powershell
python ml-bjj\scripts\prepare_from_class_folders.py
```

默认：

- 读取：`ml-bjj\data\<中文类名>\`（递归图片）
- 输出：`ml-bjj\data\bjj_cls\train|val\`（约 75% / 25%）
- 写出：`classes.txt`、`label_map.json`

成功：终端打印各类 train/val 张数；缺失的类会警告。

**为何要跑 prepare？** 训练脚本只读 `bjj_cls`，不读 `data/<中文类名>/`。`prepare` 会把各类源图**复制**到 `train|val` 并按约 75%/25% 随机划分——这一步叫「切分」。若以后往源图夹增删图片却**没再跑 prepare**，`bjj_cls` 里仍是上一次切分的结果，就叫「旧切分」；此时源图张数与 `bjj_cls` 会对不上。

**如何核对是否一致**（维护方改源图或打包前建议执行）：

```powershell
# 示例：某类源图总数应 ≈ bjj_cls 的 train + val
# 穗腐、颈瘟、健康等任一类均可按此方式抽查
```

也可在项目根用 Python 逐类比对：各类 `data/<类名>/` 图片数应等于 `data/bjj_cls/train/<类名>/` + `data/bjj_cls/val/<类名>/`。**若相等，说明已同步，可直接训练或打包；若不等，先 prepare 再训。**

只处理部分类时可：

```powershell
python ml-bjj\scripts\prepare_from_class_folders.py --classes 健康 小麦锈病 稻瘟病
```



### 4.3 训练

```powershell
python ml-bjj\scripts\train_cls.py --epochs 20
```

- **一次命令跑完**，不必执行 20 次
- 默认数据：`ml-bjj/data/bjj_cls`
- 输出：`ml-bjj/models/pest-cls-best.pt`、`pest-cls-meta.json`
- 首次需联网下载 EfficientNet-B0 预训练权重
- CPU 较慢，期间勿休眠

调试可用 `--epochs 5`。训练后建议备份：

```powershell
copy ml-bjj\models\pest-cls-best.pt ml-bjj\models\pest-cls-bjj.pt
```

> **注意**：玉米小斑病 / 弯孢叶斑病 / 褐斑病 / 茎腐 / 穗腐等样本偏少，整体准确率可能被少数类拉低；可后续增补或暂时从 `--classes` 中剔除再训。



### 4.4 抽测

```powershell
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\小麦锈病\小麦锈病_00001.jpg"
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\稻瘟病\稻瘟病_00001.jpg"
python ml-bjj\scripts\predict.py --image "实地照片路径.jpg"
```

指定权重：

```powershell
python ml-bjj\scripts\predict.py --image "图片.jpg" --weights ml-bjj\models\pest-cls-bjj.pt
```



### 4.5 启动推理服务（网站智能分析）

三终端完整启动见 `[../网站/项目启动说明.md](../../网站/项目启动说明.md)`。仅推理服务：

```powershell
ml-bjj\.venv\Scripts\Activate.ps1
python ml-bjj\serving\app.py
```

- 监听 **5000**；前端经 Vite 代理 `/api/analysis`
- 答辩降级：`$env:ML_BJJ_USE_MOCK="1"` 后启动

自检：

```powershell
curl http://127.0.0.1:5000/health
```

> 类别从 8 类扩到 23 类后，需确认 `serving/inference.py` / `knowledge/treatments.json` 与新 `pest-cls-meta.json` 中的类名一致，否则网站展示病名或防治文案会对不上。



### 4.6 打包给组员（交付）

**可以只发训练集，不必发完整 `data/` 中文类文件夹**——组员 `train_cls.py` 只读 `data/bjj_cls/`。

### 发件人（维护数据的一方）必须先做

改过 `data/<中文类名>/`（补图、增强、删图）后，**打包前必须重切**，否则组员训的是旧数据：

```powershell
python ml-bjj\scripts\prepare_from_class_folders.py
```

抽查 `bjj_cls` 各类 train/val 张数是否与源图一致（train+val = 源图总数，且约 75/25）。**若某类源图已是 375 张而 bjj 仍只有 44 张，说明未重切，不要打包发出。**

弯孢等少样本类若跑了离线增强，也需先 prepare 再打包。见 [`玉米弯孢叶斑病-离线增强方案.md`](./玉米弯孢叶斑病-离线增强方案.md)。

### 最小交付包（从 `ml-bjj/` 拷贝或压缩）

| 必带 | 说明 |
|------|------|
| `scripts/` | 至少含 `train_cls.py`、`predict.py` |
| `data/bjj_cls/` | 含 `train/`、`val/` 共 23 类；可带 `classes.txt`、`label_map.json` |
| `requirements.txt` | 依赖清单 |
| [`ml-bjj训练操作手册.md`](./ml-bjj训练操作手册.md) | 组员交付版 |

| 可选 | 说明 |
|------|------|
| 完整 `data/<中文类名>/` | 仅当对方要自行补图并重跑 `prepare` |
| `scripts/prepare_from_class_folders.py` | 与上条配套 |

| **不要带** | 说明 |
|------------|------|
| `.venv/`、`__pycache__/` | 对方本机安装 |
| `archive*`、`*.zip`、YOLO 解压包 | 体积大且训练不用 |
| 仅单独一个 `bjj_cls` 文件夹 | **不够**——缺 `scripts` 与 `requirements.txt` 无法按手册训练 |

### 组员侧

解压到例如 `D:\ml-bjj`，按交付版手册安装依赖 → `train_cls.py` → 交回 `pest-cls-best.pt` 与抽测截图。无需执行 `prepare`。

---



## 五、数据流

```text
data/<中文类>/（含子目录图片）
        │
        │  prepare_from_class_folders.py
        ▼
data/bjj_cls/train|val/（23 类）
        │
        │  train_cls.py
        ▼
models/pest-cls-best.pt
        │
        ├── predict.py
        └── serving/app.py（网站）

（水稻一次性）
archive_riceLeafDiseases/rice  ──classify_rice.py──►  data/水稻*|稻*|健康/
```

---



## 六、产出文件


| 文件                                    | 说明                 |
| ------------------------------------- | ------------------ |
| `ml-bjj/models/pest-cls-best.pt`      | 当前最佳权重             |
| `ml-bjj/models/pest-cls-bjj.pt`       | 建议自留备份             |
| `ml-bjj/models/pest-cls-meta.json`    | 训练元数据、最佳验证准确率、类别列表 |
| `ml-bjj/data/bjj_cls/label_map.json`  | prepare 记录         |
| `ml-bjj/data/rice_classify_meta.json` | 水稻分类记录             |


查看准确率：

```powershell
Get-Content ml-bjj\models\pest-cls-meta.json
```

目标：验证准确率 **≥ 95%**（样本极少的类可能拖后腿，需分项看混淆矩阵或后续增补）。

---



## 七、常见问题（开发）

**Q：为什么要用虚拟环境？**  
A：与仓库其他 Python 依赖隔离；交付版为省事可用本机 Python。

**Q：改了某类图片要不要重训？**  
A：先 `prepare_from_class_folders.py` 再生 `bjj_cls`，再 `train_cls.py`。

**Q：训练轮数 20 要执行 20 次命令吗？**  
A：**不用。** 一次 `--epochs 20` 即可。

**Q：训练中断怎么办？**  
A：当前脚本不支持断点续训；重新执行 `train_cls.py`（会覆盖 `pest-cls-best.pt`）。

**Q：小麦类文件夹里还有 Yellow Rust 等英文子目录，要展平吗？**  
A：**不必。** prepare 会递归收集；若想目录更干净，可自行把图片挪到类文件夹根下。

**Q：水稻为什么要单独脚本？**  
A：源数据是 YOLO（`images` + `labels`），没有按类分文件夹；`classify_rice.py` 按标签写入中文类。

**Q：训练完怎么接网站？**  
A：启动 `python ml-bjj\serving\app.py`，详见 `[../网站/项目启动说明.md](../../网站/项目启动说明.md)`；并核对 serving / 知识库与新类别一致。

**Q：能否只把 `data/bjj_cls` 打包发给组员训练？**  
A：**可以**，但须是**打包前已 prepare** 的 `bjj_cls`，并与 `scripts/`、`requirements.txt`、交付版手册一起交付。发件人改源图后须重切，否则组员训不到新图。详见 **§4.2**、**§4.6**。

---



## 八、相关文档


| 文档                                         | 用途                    |
| ------------------------------------------ | --------------------- |
| `[京津冀AI模型精简方案-v3.md](../方案/京津冀AI模型精简方案-v3.md)` | 早期 8 类方案（目录已过时，逻辑可参考） |
| `[ml-bjj训练操作手册.md](./ml-bjj训练操作手册.md)`     | 组员交付版 |
| `[玉米弯孢叶斑病-离线增强方案.md](./玉米弯孢叶斑病-离线增强方案.md)` | 少样本弯孢离线增强 |
| `[玉米水稻补图-搜索词条.md](./玉米水稻补图-搜索词条.md)` | 补图搜索与来源 |
| `[AI模型能力与本土化测试说明.md](../方案/AI模型能力与本土化测试说明.md)` | 实地拍图与抽测               |
| `[../下一阶段任务与流程.md](../../规划/下一阶段任务与流程.md)`       | 整体路线                  |
| `[../网站/项目启动说明.md](../../网站/项目启动说明.md)`       | 三终端启动                 |
| `[AI模型训练说明.md](./AI模型训练说明.md)`             | 通用训练知识                |


---

**文档版本**：V2.0（按 `data/` 中文类扁平结构 + 23 类重写；补充水稻 classify）  
**最后更新**：2026-08-22（§4.2 改为「prepare 与核对」通用说明，去掉过时「当前旧切分」表）  
**维护**：互联网＋项目组 / 算法组