# Rules Task 1：类型、等级映射、链 1 纯函数

> 对应计划：[`规则链-2.0总线实施计划.md`](../实施计划/规则链-2.0总线实施计划.md) Task 1  
> 状态：✅ 已完成（`tsx --test` 4 passed）  
> 三文件怎么读：[`链1-alertRules三文件说明.md`](../概念/链1-alertRules三文件说明.md)

## 子任务解释

Mock 侧环境灾害链（链 1）需要先有一份**不读 HTTP、不写 db.json** 的纯函数：拿此刻墒情/气温和阈值比，超标要扛够耐受时间才生成 `[自动预警]`。

1. `soilVwc < 15` 优先于 hint（`< 25`）→ `water_stress` / `alert`，耐受 10 min；hint 耐受 30 min
2. `airTemp > 38` 优先于 hint（`> 32`）→ `heat_stress`
3. `soilVwc > 80` → `waterlogging`，仅 alert，10 min
4. 抖动未满耐受：只写入 `ruleState`，`alertsToCreate` 为空
5. 读数恢复：该规则不进入 `nextStates`，下次可再触发
6. `hint` → 预警 `warning`，`alert` → `high`

本任务不改 Flask、不写 Mock 路由。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/types/rules.ts`](../../../../src/types/rules.ts) | `SensorSnapshot` / `ThresholdProfile` / `RuleHit` / `RuleState` / `NewAlert` 等共用类型；`fieldId` 为 `string` |
| 新增 | [`src/utils/ruleLevelMap.ts`](../../../../src/utils/ruleLevelMap.ts) | `mapRuleLevel('hint'\|'alert')` → `'warning'\|'high'` |
| 新增 | [`src/utils/alertRules.ts`](../../../../src/utils/alertRules.ts) | `detectHits` + 耐受状态机 `evaluateReading` + `[自动预警]` 文案 |
| 新增 | [`src/utils/alertRules.test.ts`](../../../../src/utils/alertRules.test.ts) | 抖动不误报、持续超标发一条、恢复清状态、文案格式 |

## 代码内容

### 等级映射

```ts
export function mapRuleLevel(level: 'hint' | 'alert'): 'warning' | 'high' {
  return level === 'hint' ? 'warning' : 'high'
}
```

### 默认阈值（方案 3.2）

```ts
export const DEFAULT_THRESHOLD_PROFILE: ThresholdProfile = {
  pointId: 0,
  waterStressHint: 25,
  waterStressAlert: 15,
  waterStressHintMinutes: 30,
  waterStressAlertMinutes: 10,
  heatHint: 32,
  heatAlert: 38,
  heatHintMinutes: 30,
  heatAlertMinutes: 10,
  waterloggingAlert: 80,
  waterloggingMinutes: 10
}
```

### 接口

```ts
evaluateReading(
  reading: SensorSnapshot,
  profile: ThresholdProfile,
  states: RuleState[],
  now: Date,
  pointName?: string
): { hits: RuleHit[]; nextStates: RuleState[]; alertsToCreate: NewAlert[] }

buildEnvAlertMessage(pointName: string, hit: RuleHit, elapsedMinutes: number): string
```

墒情告警文案示例：

```text
[自动预警] 监测站 · 雄县 - 土壤湿度 12.8% 低于告警阈值 15%，已持续 12 min
```

## 验证

```text
pnpm exec tsx --test src/utils/alertRules.test.ts
→ 4 passed
```
