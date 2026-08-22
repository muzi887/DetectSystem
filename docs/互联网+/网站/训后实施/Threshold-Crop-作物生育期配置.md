# Threshold-Crop Task：作物/生育期下拉 + 推荐四档

> 对应方案：[`阈值按作物生育期配置方案.md`](../方案/阈值按作物生育期配置方案.md)  
> 状态：✅ 已完成（`tsx --test` 12 passed；`vue-tsc --noEmit` 通过）

## 子任务解释

气象 Tab 原先只能改四个数，说不清「这座站种什么、长到哪一阶段」。本任务仍是 **一站一行**：加上作物、生育期下拉；换组合时询问是否套用推荐墒情/气温四档。链 1 继续只看数字；链 3 改读保存的作物，不再写死小麦拔节。雄县种子保持小麦拔节，干旱演示不断。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | `src/types/rules.ts` | `crop` / `growthStage` |
| 修改 | `src/utils/alertRules.ts` | 默认小麦拔节 |
| 新增 | `src/utils/thresholdPresets.ts` | `presetFor` |
| 新增 | `src/utils/thresholdPresets.test.ts` | 小麦拔节=现网；水稻灌浆更湿 |
| 修改 | `src/views/user/RelatedData.vue` | 下拉、确认套用、保存 |
| 修改 | `src/mock/persistRules.ts` | 缺字段时与默认合并；链 3 读正式字段 |
| 修改 | `src/mock/db.json` | 河间、雄县小麦拔节种子 |
| 修改 | `deploy/api_mock/ruleChainRunner.cjs` | 默认值与 merge 同步 |

## 验证

```text
pnpm exec tsx --test src/utils/thresholdPresets.test.ts src/utils/alertRules.test.ts src/mock/persistRules.test.ts
→ 12 passed
pnpm exec vue-tsc --noEmit
pnpm run sync:mock-db
```

手工：相关数据 → 气象 → 选水稻/灌浆 → 套用后墒情提示 40、告警 30 → 保存。雄县勿改成水稻。
