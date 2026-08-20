# P2 Task 4：分析页提交 `pointId` 与低置信纠错

> 对应计划：[`新模型训后-P2-闭环与数据实施计划.md`](../新模型训后-P2-闭环与数据实施计划.md) Task 4  
> 状态：✅ 已完成（`vue-tsc --noEmit` 退出 0）

## 子任务解释

前端把识别记录和地块对上，并在低置信时允许用户把原图纠错回流：

1. **`analyzeImage`**：FormData 增加可选 `pointId`（当前筛选监测点，否则全量第一个）
2. 保存响应里的 `recordId`
3. 当 `needsManualReview` 且仍有原图时，显示「实际病名」输入框 +「提交纠错」
4. **`submitAnalysisFeedback`**：`POST /api/analysis/feedback`，成功提示「已写入难例队列」
5. 顺带导出 `fetchAnalysisRecent` / `fetchAnalysisStats` / `fetchAnalysisModelInfo` 供首页与关于页（Task 5）使用

不改智能分析页三列布局。

## 改动文件

| 操作 | 文件 |
|------|------|
| 修改 | [`src/api/analysis.ts`](../../../../src/api/analysis.ts) |
| 修改 | [`src/views/user/DataAnalysis.vue`](../../../../src/views/user/DataAnalysis.vue) |

## 代码内容

### 提交 `pointId`

```ts
pointId: store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id
```

### 纠错区块（低置信）

```html
<div v-if="needsManualReview && analysisResult && fileList[0]?.originFileObj" class="feedback-box">
  <a-input v-model:value="correctedLabel" placeholder="实际病名（须与 23 类一致）" />
  <a-button type="primary" :loading="feedbackSubmitting" @click="handleFeedback">提交纠错</a-button>
</div>
```

## 验证

```text
pnpm exec vue-tsc --noEmit
→ exit 0
```
