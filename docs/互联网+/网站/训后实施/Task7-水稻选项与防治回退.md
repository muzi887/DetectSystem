# Task 7：水稻作物选项、防治回退、预警等级

> 对应计划：[`新模型训后-后端丰富实施计划.md`](../新模型训后-后端丰富实施计划.md) Task 7  
> 状态：✅ 已完成（`vue-tsc --noEmit` 退出码 0）

## 子任务解释

后端已能按 `cropType=rice` 过滤，前端下拉若没有水稻，用户仍无法触发该路径。另外：

- 旧 `getTreatment` 在查不到病名时回落「健康」，新类一旦漏条目会显示成「未检出病害」
- `createAlert` 写死 `level: 'high'`，忽略 serving 返回的 `low/medium/high`

本任务只做对齐，不改智能分析页三列布局。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/views/user/DataAnalysis.vue`](../../../../src/views/user/DataAnalysis.vue) | 作物下拉增加「水稻」，与 23 类里的稻作病害对齐 |
| 修改 | [`src/composables/useTreatmentGuide.ts`](../../../../src/composables/useTreatmentGuide.ts) | 未知病名不再回落「健康」防治文案，改为缺失提示 |

## 代码内容

### `src/composables/useTreatmentGuide.ts` — 未知类不再回落健康

```ts
const MISSING_TREATMENT: TreatmentItem = {
  crop: '通用',
  crop_en: 'general',
  aliases: [],
  summary: '暂无该类防治条目，请以田间复核与当地植保意见为准。',
  risk_level: 'medium',
  symptoms: [],
  measures: {
    agronomic: ['保留清晰样本照片，送农技员复核后再用药。']
  },
  timing: '',
  safety: '在确认病名之前不要盲目施药。'
}

export function getTreatment(label: string): TreatmentItem {
  const found = resolveByLabel(label)
  if (found) return found
  return {
    ...MISSING_TREATMENT,
    summary: `暂无「${label.trim()}」的防治条目，请以田间复核与当地植保意见为准。`
  }
}
```

### `src/views/user/DataAnalysis.vue` — 水稻选项与预警等级

```html
                      <a-select-option value="wheat">小麦</a-select-option>
                      <a-select-option value="corn">玉米</a-select-option>
                      <a-select-option value="tomato">番茄</a-select-option>
                      <a-select-option value="rice">水稻</a-select-option>
```

```ts
const cropLabels: Record<string, string> = {
  wheat: '小麦',
  corn: '玉米',
  tomato: '番茄',
  rice: '水稻'
}
```

```ts
    const rawLevel = response.data.level as string
    const level =
      rawLevel === 'low' || rawLevel === 'medium' || rawLevel === 'high' ? rawLevel : 'medium'
    // ...
    const pct = (aiConfidence <= 1 ? aiConfidence * 100 : aiConfidence).toFixed(1)
    await store.createAlert({
      pointId: defaultPointId,
      level,
      message: `[AI识别] 监测到 ${cropName} - ${aiResult} (置信度: ${pct}%)`,
      handled: false
    })
```

`needsManualReview` 仍按前端置信度 < 70% 计算，未把 `needs_review` 写入视图模型。

## 验证

```text
pnpm exec vue-tsc --noEmit
→ 退出码 0
```
