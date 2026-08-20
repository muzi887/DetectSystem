# Task 4：防治库扩到 23 类并同步前端

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../新模型训后-后端丰富实施计划.md) Task 4  
> 状态：✅ 已完成（覆盖测试 3 passed）

## 子任务解释

Task 3 的红灯测试要求 `treatments.json` 的 `items` 键覆盖全部 23 类。本任务：

1. 保留原有 8 类正文（健康、四种小麦、玉米大斑/锈病、番茄早疫病）
2. 新增玉米 7 类 + 水稻 8 类，字段与现网一致（`crop` / `summary` / `measures` / `timing` 等）
3. `version` 改为 `"2.0"`，`updated_at` 为 `2026-08-20`
4. 运行 `pnpm run sync:knowledge`，把源库复制到前端静态副本（勿手改副本）

文案为竞赛演示用农技整理，用药须遵标签与当地植保意见。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/knowledge/treatments.json`](../../../../ml-bjj/knowledge/treatments.json) | 防治库唯一源，从 8 类扩到 23 类（补 15 个键） |
| 修改 | [`src/assets/knowledge/treatments.json`](../../../../src/assets/knowledge/treatments.json) | 前端副本，由 `pnpm run sync:knowledge` 从唯一源生成 |

新增键（15）：

- 玉米：南方锈病、小斑病、弯孢叶斑病、褐斑病、瘤黑粉病、茎腐病、穗腐病
- 水稻：白叶枯病、褐斑病、负泥虫为害、稻瘟病、叶鞘腐败病、叶黑粉病、窄条斑病、稻颈瘟

## 代码内容

### 库头

```json
{
  "version": "2.0",
  "region": "京津冀",
  "updated_at": "2026-08-20",
  "disclaimer": "本库为竞赛演示与农技辅助参考，用药请遵当地植保部门指导、农药标签及安全间隔期；最终以田间复核为准。",
  "items": { ... 23 类 ... }
}
```

完整 23 条见源文件。示例（稻瘟病）：

```json
    "稻瘟病": {
      "crop": "水稻",
      "crop_en": "rice",
      "aliases": ["稻瘟", "叶瘟"],
      "summary": "稻瘟病可表现为叶瘟、节瘟等，典型病斑梭形、中央灰白、边缘褐色，流行年份减产明显。",
      "risk_level": "high",
      "symptoms": [
        "叶片梭形病斑，中央灰白，边缘褐色，外有黄晕",
        "潮湿时病部可见灰绿色霉层"
      ],
      "measures": {
        "chemical": [
          "发病初期选用三环唑、稻瘟灵、春雷霉素等登记药剂",
          "破口前 5–7 天预防穗颈瘟，与稻颈瘟防治一体安排"
        ],
        "biological": ["优先使用生物源药剂与抗性品种"],
        "agronomic": [
          "选用抗病品种，避免偏施氮肥",
          "浅水勤灌，改善通风透光"
        ]
      },
      "timing": "分蘖盛期防叶瘟；破口抽穗期防穗瘟。",
      "safety": "严格安全间隔期；雨前抢喷、雨后补喷。",
      "references": ["水稻稻瘟病防控技术方案（团队整理）"]
    }
```

## 验证

```text
pnpm run sync:knowledge
pytest ml-bjj/tests/test_treatments_coverage.py -v
→ 3 passed
```
