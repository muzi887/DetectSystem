# 链 1 三文件：类型、等级映射、alertRules

> 说明 `rules.ts`、`ruleLevelMap.ts`、`alertRules.ts` 各自干什么，以及 `alertRules` 里三个函数怎么配合。  
> 阈值表、测试步骤见 [`Rules-Task1-环境灾害链纯函数.md`](../训后实施/Rules-Task1-环境灾害链纯函数.md)，本文不贴源码全文。

---

## 一、三个文件的分工

它们合在一起是 **2.0 链 1（环境灾害）的纯函数**：看此刻干不干、热不热，超标要持续够久才生成 `[自动预警]`。不访问网页，也不写 `db.json`。

| 文件 | 角色 |
|------|------|
| [`rules.ts`](../../../../src/types/rules.ts) | **词典**：各种数据长什么样 |
| [`ruleLevelMap.ts`](../../../../src/utils/ruleLevelMap.ts) | **翻译**：规则内部的 hint/alert → 预警上的 warning/high |
| [`alertRules.ts`](../../../../src/utils/alertRules.ts) | **干活**：比阈值 + 耐受计时 + 拼文案 |

```text
此刻气温、墒情
    → detectHits（对照 ThresholdProfile）→ RuleHit[]
    → evaluateReading 对照旧的 RuleState，看满没满分钟
    → 要报警时 mapRuleLevel(hint/alert) 写成 warning/high
    → NewAlert（message 以 [自动预警] 开头）
```

调度器以后会把 `alertsToCreate` 写入预警表、把 `nextStates` 存成 `ruleState`。这三份文件本身还不做那一步。

---

## 二、`rules.ts`：先认这些名字

没有计算，全是类型：字段叫什么、只能填哪些字。

规则内部两档（还不是页面上的低/中/高）：

- **hint**：轻超标（例如墒情 &lt; 25%，或气温 &gt; 32℃），要扛约 30 分钟
- **alert**：更严重（墒情 &lt; 15%，气温 &gt; 38℃，或涝渍 &gt; 80%），扛约 10 分钟

三条规则 id：`water_stress`（旱）、`heat_stress`（热）、`waterlogging`（涝）。

不要把这些名字当成「功能开关」。每个名字只是一张小纸条上有哪些格子。用一个监测点走一遍就清楚了。

**场景：** 2 号站现在土壤湿度 12%（低于 15% 的告警线），气温正常。程序会反复拿读数来算。

1. **`SensorSnapshot`（这一次量到的数）**  
   「现场读数」：哪个点、现在气温多少、墒情多少。  
   例：`pointId=2，soilVwc=12，airTemp=26`。  
   **不含**「算不算旱」「该不该报警」，只是仪表上的数。

2. **`ThresholdProfile`（这个点的及格线）**  
   「规矩」：旱到多少算轻/算重、要持续几分钟才喊；热、涝同理。  
   默认：墒情低于 25% 算轻、低于 15% 算重，重的要满 10 分钟。  
   12% 是 Snapshot，15% 是 Profile，两张纸。

3. **`RuleHit`（这一瞬间已经踩线）**  
   读数和规矩一比：12% 低于 15%，旱这条 **已经命中**，而且是更严重的 **alert**。  
   意思只是「现在超标了」。刚超 1 分钟也是 Hit，因为还没看持续多久。**还不是预警。**

4. **`RuleState`（记事本）**  
   第一次超标记下何时开始、还没喊过。之后只要还在超、档位没变，开始时间不变。  
   满 10 分钟并生成预警后，记「已经喊过」，避免每分钟再喊一次。  
   墒情回到正常，这本关于旱的笔记丢掉，下次再干可以重新计时。

5. **`NewAlert`（预警中心将出现的那一条）**  
   只有「超标 **并且** 已经满了该档的分钟、且还没喊过」才做出来。  
   上面有 `[自动预警] …` 句子。  
   可以有 Hit、有 State，**仍没有** NewAlert（未满 10 分钟时就是这样）。

6. **`EvaluateReadingResult`（函数交回来的三包东西）**  
   不是第四种业务，就是算完一轮的返回值：  
   - `hits`：这一瞬间踩了哪些线  
   - `nextStates`：更新后的记事本（给下一轮用）  
   - `alertsToCreate`：本轮要新建的预警（常常是空的）

```text
14:00  墒情 12%  → Snapshot
         对照 Profile → Hit（旱 / alert）
         新建 State（开始计时）
         alertsToCreate 为空     ← 未满 10 分钟

14:10  仍然 12%  → 还是 Hit
         已满 10 分钟且没喊过 → 做出一条 NewAlert
         Result 里 alertsToCreate 有 1 条
```

| 类型 | 像什么 |
|------|--------|
| `SensorSnapshot` | 仪表读数 |
| `ThresholdProfile` | 这个点的规矩 |
| `RuleHit` | 「现在已经超了」，还不是预警 |
| `RuleState` | 记事本：何时开始超、喊过没有 |
| `NewAlert` | 真要出现在预警列表里的那条 |
| `EvaluateReadingResult` | 这一轮交回的：命中 + 记事本 + 要不要新建预警 |

`ForecastDay` / `ExtremeEvent` 给链 2 用，链 1 不算它们。  
`MappedAlertLevel` 是预警表上的档：`warning` | `high` | `critical`。链 1 只用前两个。

---

## 三、`ruleLevelMap.ts`：一行翻译

`hint` → `warning`（决策页筛「高」时算进去）。  
`alert` → `high`。

链 1 的轻超标 **不会** 写成 `medium`。`medium` 主要是看图认病、置信度不到 90% 时用的，见 [`什么是预警级别.md`](./什么是预警级别.md)。

---

## 四、`alertRules.ts` 里的函数

对外 **3 个函数** + 一份默认阈值。入口是 `evaluateReading`，另外两个是帮手。

```text
evaluateReading（入口：这一轮要不要报警）
    ├── detectHits            这一瞬间踩了哪些线
    └── buildEnvAlertMessage  真要报警时拼中文句子
         └── mapRuleLevel     在 ruleLevelMap.ts：hint→warning，alert→high
```

`DEFAULT_THRESHOLD_PROFILE` 不是函数，是默认规矩：旱 25%/15%、热 32℃/38℃、涝 80%；轻档扛 30 分钟、重档扛 10 分钟。

### 4.1 `detectHits(reading, profile)`

**只看这一瞬间**，不看时间。把此刻墒情、气温和阈值比，返回踩线清单（`RuleHit[]`），可能为空。

| 读数 | 结果 |
|------|------|
| 墒情低于重旱线（默认 15%） | 旱，`alert`，要扛 10 分钟 |
| 否则墒情低于轻旱线（默认 25%） | 旱，`hint`，要扛 30 分钟 |
| 墒情高于涝线（默认 80%） | 涝，只有 `alert` |
| 气温高于重热线（默认 38℃） | 热，`alert` |
| 否则气温高于轻热线（默认 32℃） | 热，`hint` |

旱、热用 `if / else if`：12% 只算重旱，不会再算轻旱。涝是另一条判断。  
刚低于 15% 的第一秒也会有 Hit。**到这里还没有预警。**

### 4.2 `buildEnvAlertMessage(pointName, hit, elapsedMinutes)`

**只拼给人看的一句话**，不决定报不报。三种模板：气温过高、土壤过湿、土壤过干（默认即旱）。

`hint` 写「提示阈值」，`alert` 写「告警阈值」。例如：

`[自动预警] 监测站 · 雄县 - 土壤湿度 12% 低于告警阈值 15%，已持续 12 min`

### 4.3 `evaluateReading(reading, profile, states, now, pointName?)`

**入口。** 在 Hit 之上加上「已经持续多久、以前喊过没有」。

| 参数 | 含义 |
|------|------|
| `reading` | 这一次仪表读数 |
| `profile` | 这个点的规矩（没有配置就用默认） |
| `states` | **上一轮**留下的记事本（第一次是空数组） |
| `now` | 「现在」几点，测试里可以假造 |
| `pointName` | 写进文案的站名，缺省 `POINT` |

对 `detectHits` 得到的每一条 Hit：

1. 在旧 `states` 里找同一监测点 + 同一规则（例如 2 号站的旱）。
2. 找到且档位没变 → 开始时间沿用旧的 `startedAt`；档位变了（轻旱变重旱）→ 从 `now` 重新计时。
3. `elapsed` = 现在减去开始时间，单位分钟。
4. 旧记事本已喊过且档位没变 → 仍视为已喊过。
5. **只有** 已满该档分钟 **并且** 还没喊过 → 才往 `alertsToCreate` 里塞一条（文案走 4.2，级别走 `mapRuleLevel`），记事本标成已喊过。
6. 这条新记事本放进 `nextStates`。

没有 Hit 的规则不进入 `nextStates`。墒情回到 30%，旱的记事本丢掉，下次再干可以重新计时。

返回三包：`hits`、`nextStates`、`alertsToCreate`（未满时间则最后一包为空）。这就是第二节的 `EvaluateReadingResult`。

对照：墒情 12% 只持续 3 分钟 → 有 Hit、有记事本、**没有** NewAlert。满 10 分钟 → 一条 `[自动预警]`，级别 `high`。墒情 20% 满 30 分钟 → hint → 预警 `warning`。已报过且仍在超标 → 不再发第二条。

---

## 五、延伸阅读

| 文档 | 内容 |
|------|------|
| [`什么是规则链.md`](./什么是规则链.md) | 规则链概念；P3 与 2.0 |
| [`什么是预警级别.md`](./什么是预警级别.md) | low / medium / high 与 warning |
| [`Rules-Task1-环境灾害链纯函数.md`](../训后实施/Rules-Task1-环境灾害链纯函数.md) | 本任务验收与接口形状 |
| [`规则链建模与实现方案.md`](../方案/规则链建模与实现方案.md) | 链 1 状态机全文 |

---

## 六、小结

| 文件 | 一句话 |
|------|--------|
| 类型 | 给链 1（以及后面的链）统一字段名 |
| 等级映射 | hint/alert 换成预警能存的 warning/high |
| alertRules | `detectHits` 看超没超；`evaluateReading` 看超了多久；够了才用 `buildEnvAlertMessage` 写出 `[自动预警]` |
