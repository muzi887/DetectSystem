# 玉米 / 水稻补图 — Kaggle 搜索词条

> 用途：补充 P0 玉米少样本类、P1 水稻四百余张类时，在 Kaggle Datasets 中检索用。  
> 搜英文词条通常比中文更准；下载后按 `ml-bjj/data/<中文类名>/` 归类，再重跑 `prepare_from_class_folders.py`。

---

## P0 玉米（优先补）

当前约 41～73 张/类：茎腐、穗腐、弯孢、小斑、褐斑、瘤黑粉。

| 中文类 | 推荐搜索词（可复制） |
|--------|----------------------|
| 玉米茎腐病 | `corn stalk rot` / `maize stalk rot` / `fusarium stalk rot maize` |
| 玉米穗腐病 | `corn ear rot` / `maize ear rot` / `gibberella ear rot` / `fusarium ear rot corn` |
| 玉米弯孢叶斑病 | `curvularia leaf spot maize` / `curvularia corn` |
| 玉米小斑病 | `southern corn leaf blight` / `Bipolaris maydis` / `SCLB maize` |
| 玉米褐斑病 | `physoderma brown spot corn` / `corn brown spot` / `maize brown spot` |
| 玉米瘤黑粉病 | `corn smut` / `common smut maize` / `Ustilago maydis` |

玉米通用（再在结果里按类筛选）：

- `maize disease`
- `corn leaf disease`
- `corn plant disease dataset`

---

## P1 水稻（可缓，有空再补）

当前约 431～456 张/类：稻瘟、稻颈瘟、叶鞘腐败、窄条斑、负泥虫。

| 中文类 | 推荐搜索词 |
|--------|------------|
| 稻颈瘟 | `rice neck blast` / `neck blast rice` / `panicle blast rice` |
| 水稻叶鞘腐败病 | `rice leaf scald` / `rice sheath rot`（注意：有的库把 LeafScald / Sheath rot 分开标） |
| 水稻窄条斑病 | `narrow brown leaf spot rice` / `Cercospora oryzae` |
| 水稻负泥虫为害 | `rice hispa` / `Dicladispa armigera` / `hispa rice leaf` |

水稻通用：

- `rice leaf disease`
- `rice disease dataset`
- `paddy disease`

与现有水稻包相关时可再搜：

- `rice leaf diseases yusuf`
- `Rice__LeafBlast`

---

## 使用提示

1. 先搜通用大包（如 `rice leaf disease`、`corn leaf disease`），再对照本表中文类名归档。  
2. 单病名有时数据集很少，不必强求每个类都有独立 Dataset。  
3. 注意许可证是否允许竞赛/展示使用。  
4. 图片放入 `ml-bjj/data/<中文类名>/` 后执行：

```powershell
python ml-bjj\scripts\prepare_from_class_folders.py
python ml-bjj\scripts\train_cls.py --epochs 20
```

---

## 各类张数与库内抽测估测置信度

统计口径：`ml-bjj/data/<中文类名>/` 源图总数；train/val 为 `data/bjj_cls/`（约 75/25）。  
置信度：只针对 **抽测本库图片做演示** 的估测（20 epoch、未跑 23 类实测）；训完以 `predict.py` 终端为准。健康为各作物合并类。

| 作物 | 类别 | 源图张数 | train | val | 库内抽测估测置信度 |
|------|------|----------|------:|----:|--------------------|
| 共用 | 健康 | 4186 | 3140 | 1046 | 95%～99% |
| 小麦 | 小麦锈病 | 3148 | 2361 | 787 | 95%～99% |
| 小麦 | 小麦蚜虫为害 | 1937 | 1453 | 484 | 95%～99% |
| 小麦 | 小麦白粉病 | 1081 | 811 | 270 | 95%～99% |
| 小麦 | 小麦赤霉病 | 611 | 459 | 152 | 92%～98% |
| 玉米 | 玉米南方锈病 | 1233 | 925 | 308 | 95%～99% |
| 玉米 | 玉米锈病 | 1192 | 894 | 298 | 95%～99% |
| 玉米 | 玉米大斑病 | 1036 | 777 | 259 | 95%～99% |
| 玉米 | 玉米瘤黑粉病 | 73 | 55 | 18 | 85%～98% |
| 玉米 | 玉米褐斑病 | 54 | 41 | 13 | 85%～98% |
| 玉米 | 玉米小斑病 | 51 | 39 | 12 | 85%～98% |
| 玉米 | 玉米弯孢叶斑病 | 50 | 38 | 12 | 85%～98% |
| 玉米 | 玉米穗腐病 | 44 | 33 | 11 | 85%～98% |
| 玉米 | 玉米茎腐病 | 41 | 31 | 10 | 85%～98% |
| 番茄 | 番茄早疫病 | 1000 | 750 | 250 | 95%～99% |
| 水稻 | 水稻叶黑粉病 | 2000 | 1500 | 500 | 95%～99% |
| 水稻 | 水稻白叶枯病 | 2000 | 1500 | 500 | 95%～99% |
| 水稻 | 水稻褐斑病 | 2000 | 1500 | 500 | 95%～99% |
| 水稻 | 水稻叶鞘腐败病 | 456 | 342 | 114 | 90%～97% |
| 水稻 | 稻颈瘟 | 453 | 340 | 113 | 90%～97% |
| 水稻 | 稻瘟病 | 449 | 337 | 112 | 90%～97% |
| 水稻 | 水稻窄条斑病 | 443 | 333 | 110 | 90%～97% |
| 水稻 | 水稻负泥虫为害 | 431 | 324 | 107 | 90%～97% |

演示抽测库内图时，张数少的玉米类也可以打出高置信度。补图只为以后实地识别更稳，不是演示前提。

---

**最后更新**：2026-08-18
