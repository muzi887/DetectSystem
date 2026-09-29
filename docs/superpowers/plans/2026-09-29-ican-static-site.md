# iCAN 静态竞赛站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把评委入口做成 Vercel 上的 Vue 静态站，页面展示地图、监测、三条规则链结果、智慧决策和识病录像，生产构建不再请求 Flask。

**部署选择（2026-09-29）：** Vercel。`netlify.toml` 与 `public/_redirects` 仍按任务生成，换托管时 SPA 回落不用重写。实际上线只部署 Vercel。

**Architecture:** `pnpm dev` 保持现状：`vite.config.ts` 把 `/api` 代理到 `127.0.0.1:5000`。`pnpm build` 里 `import.meta.env.PROD` 为真，`src/utils/http.ts` 改走内存中的演示快照，不创建 axios 客户端。识病上传只留在开发构建里；生产构建的智能分析页播放 `public/demo/analysis.mp4`。规则链不在静态站上重算，快照里已经有墒情、极端天气和虫情草稿。

**Tech Stack:** Vue 3、Vite 7、TypeScript、Pinia、Vue Router `createWebHistory()`、Ant Design Vue、Leaflet、Flask（仅本地录视频和答辩）、`pnpm exec tsx --test`、`pnpm exec vue-tsc --noEmit -p tsconfig.app.json`。

**Source spec:** `docs/互联网+/部署/iCAN竞赛网站部署完整解决方案(1).md`

这些任务有先后关系：先改掉会进画面的文案，再录像，再构建，再部署。因此合成这一份计划。

## Global Constraints

- 主入口是 Vercel、Netlify 或 Cloudflare Pages 一类境外静态平台。不需要 ICP 备案。不采用香港/新加坡/美国 VPS，不把本地服务器穿透到公网，不为识病或规则链租 GPU 云，不做公网「在线体验」按钮。
- 已经停用、材料、页脚和视频字幕里都不要再写的地址：`http://www.dizhongkeji.cn:88`、`http://82.157.234.123:88`。
- 静态站构建时不设置会指向真实接口的地址。页面里不要写死 `localhost`，不要写已停用的两个地址，也不要写本地服务器的 IP 或穿透域名。
- 本地开发仍由 `vite.config.ts` 把 `/api` 代理到本机 `127.0.0.1:5000`。这只用于自己录视频和现场演示。
- 路由是 `createWebHistory()`。平台上要把所有路径回落到 `index.html`。
- 导航保留地图、相关数据、预警、智慧决策、智能分析。不要为了避开接口把规则链页面从导航里拿掉。
- 三条规则链都要能在静态站里点到：墒情/气温/渍涝（雄县墒情在告警线附近）、极端天气（7 日预报以及据此写入的预警）、高风险虫情（草稿；正式发布在现场或录像里点「确认发布」）。
- 识病区块写明：「识病为演示录像，由本系统 `pest-cls-best.pt` 在本地推理生成，23 类，验证集准确率 94.05%。本页不提供公网实时上传。」规则链区块写明：「预警由规则链按演示监测数据生成，页面展示的是已生成的结果。」
- 页脚写明：「本系统为竞赛演示版本。监测、预报与遥感图层为演示数据；预警与决策由规则链按这些数据生成并预先放入页面；识病以演示视频展示，录像来自本系统模型推理，须人工复核。不采集、不上报、不存储任何真实用户信息。」
- 对外准确率只用 `ml-bjj/models/pest-cls-meta.json` 里的 `best_val_acc`（显示为 94.05%）和 23 类。写明按类 75/25、无独立测试集、不是田间准确率。不要写成 mAP，不要混入 8 类时期的 98.99%。
- 录像必须来自本项目的 `pest-cls-best.pt`。视频里的病名和置信度是模型算出来的，不要另配一条和画面不一致的结果。
- iCAN 创新赛道材料禁止出现院校、指导教师、单位名称。提交前从会进构建产物的源文件和 README 删掉。网页标题可以保留系统名。`docs/小挑/`、`docs/简历3.1-C#全站秋招.md`、`docs/本人实际情况.md`、软著历史稿不在本计划的改写范围内，它们不会被 `pnpm build` 打进 `dist/`。
- 地图底图继续请求高德 `webst0{s}.is.autonavi.com` 和 CARTO `basemaps.cartocdn.com`。这不是 Flask。遥感专题图来自仓库里的 `satellite-maps/`，开发时由 Vite 插件提供，生产构建必须复制进 `dist/satellite-maps/`。
- 权重 `pest-cls-best.pt` 不在 Git 里。不要把权重新增到仓库。
- 每项任务末尾的提交在 PowerShell 里用 `git commit -m "message"`。只提交该任务列出的文件。

## File structure

| 路径 | 职责 |
|---|---|
| `src/demo/copy.ts` | 页脚、识病、规则链、指标文案。纯字符串。 |
| `src/demo/snapshot.ts` | 生产构建打进包内的演示快照。导出脚本可以整文件覆盖集合，但模型指标仍以 meta 为准。 |
| `src/demo/staticHttp.ts` | 实现页面用到的 GET/POST/PATCH/PUT/DELETE，返回 `{ data }`，不访问网络。 |
| `src/utils/liveHttp.ts` | 现有 axios 客户端。只有开发构建会动态 import。 |
| `src/utils/http.ts` | `PROD` 时导出静态客户端，否则导出 live 客户端。 |
| `src/demo/session.ts` | 生产构建写入本地演示登录态。 |
| `src/constants/monitorRegions.ts` | 增加 `initialMonitorRegion`。生产构建默认京津冀，开发构建仍是东北。 |
| `src/components/SiteDemoFooter.vue` | 全站页脚声明。 |
| `src/views/user/About.vue`、`index.html`、`README.md` | 去掉院校、指导教师、学校邮箱、已停用地址。 |
| `src/views/user/DataAnalysis.vue` | 生产构建播放录像并隐藏上传。 |
| `src/views/user/WarningSystem.vue` | 展示规则链说明。 |
| `scripts/copy-satellite-maps.mjs` | 构建后把 `satellite-maps/` 复制到 `dist/satellite-maps/`。 |
| `scripts/export-demo-snapshot.mjs` | 从本机 Flask 拉已算好的演示数据，覆盖快照里的业务集合。 |
| `scripts/check-static-site.mjs` | 上线前扫描禁用词、死地址，并在带 `--require-video` 时检查视频体积。 |
| `vercel.json`、`netlify.toml`、`public/_redirects` | SPA 回落到 `index.html`。 |
| `public/demo/analysis.mp4` | 2–3 分钟字幕录像。Vite 会把它复制进 `dist/`。 |

---

### Task 1: 演示文案

**Files:**
- Create: `src/demo/copy.ts`
- Test: `src/demo/copy.test.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `FOOTER_DISCLAIMER: string`
  - `ANALYSIS_DEMO_NOTE: string`
  - `RULE_CHAIN_NOTE: string`
  - `MODEL_METRICS_LINE: string`

- [ ] **Step 1: 写失败测试**

`src/demo/copy.test.ts`

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  ANALYSIS_DEMO_NOTE,
  FOOTER_DISCLAIMER,
  MODEL_METRICS_LINE,
  RULE_CHAIN_NOTE
} from './copy.ts'

test('disease note matches the contest sentence', () => {
  assert.equal(
    ANALYSIS_DEMO_NOTE,
    '识病为演示录像，由本系统 pest-cls-best.pt 在本地推理生成，23 类，验证集准确率 94.05%。本页不提供公网实时上传。'
  )
})

test('rule-chain note matches the contest sentence', () => {
  assert.equal(
    RULE_CHAIN_NOTE,
    '预警由规则链按演示监测数据生成，页面展示的是已生成的结果。'
  )
})

test('footer is the contest disclaimer', () => {
  assert.equal(
    FOOTER_DISCLAIMER,
    '本系统为竞赛演示版本。监测、预报与遥感图层为演示数据；预警与决策由规则链按这些数据生成并预先放入页面；识病以演示视频展示，录像来自本系统模型推理，须人工复核。不采集、不上报、不存储任何真实用户信息。'
  )
})

test('metrics line states the split and the limit of the number', () => {
  assert.equal(MODEL_METRICS_LINE, '23 类，按类 75/25，验证集准确率 94.05%。无独立测试集，不是田间准确率。')
  assert.equal(MODEL_METRICS_LINE.includes('mAP'), false)
  assert.equal(MODEL_METRICS_LINE.includes('98.99'), false)
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/copy.test.ts`

Expected: FAIL，`copy.ts` 不存在。

- [ ] **Step 3: 写最小实现**

`src/demo/copy.ts`

```ts
export const ANALYSIS_DEMO_NOTE =
  '识病为演示录像，由本系统 pest-cls-best.pt 在本地推理生成，23 类，验证集准确率 94.05%。本页不提供公网实时上传。'

export const RULE_CHAIN_NOTE = '预警由规则链按演示监测数据生成，页面展示的是已生成的结果。'

export const FOOTER_DISCLAIMER =
  '本系统为竞赛演示版本。监测、预报与遥感图层为演示数据；预警与决策由规则链按这些数据生成并预先放入页面；识病以演示视频展示，录像来自本系统模型推理，须人工复核。不采集、不上报、不存储任何真实用户信息。'

export const MODEL_METRICS_LINE =
  '23 类，按类 75/25，验证集准确率 94.05%。无独立测试集，不是田间准确率。'
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `pnpm exec tsx --test src/demo/copy.test.ts`

Expected: PASS，4 tests。

- [ ] **Step 5: 提交**

```powershell
git add src/demo/copy.ts src/demo/copy.test.ts
git commit -m "feat: add contest demo copy"
```

---

### Task 2: 静态 HTTP 与三条规则链快照

**Files:**
- Create: `src/demo/snapshot.ts`
- Create: `src/demo/staticHttp.ts`
- Test: `src/demo/staticHttp.test.ts`

**Interfaces:**
- Consumes: 无（文案常量不进快照）
- Produces:
  - `demoSnapshot`
  - `chainCoverage(snapshot): { counties: boolean; env: boolean; extreme: boolean; pestDraft: boolean; forecast: boolean }`
  - `createStaticHttp(source: DemoSnapshot)`，方法 `get/post/patch/put/delete`，resolve `{ data }`
  - `StaticDemoError`，字段 `status`、`friendlyMessage`
  - 模型字段 `modelInfo.classes_count === 23`，`modelInfo.best_val_acc === 0.9404598959759102`（与 `ml-bjj/models/pest-cls-meta.json` 一致，页面用 `(best_val_acc * 100).toFixed(2)` 显示 `94.05`）

页面现有调用约定（axios `baseURL` 已是 `/api`，这里匹配的是去掉 `/api` 之后的路径）：

- `GET /monitorPoints`、`/weatherReadings`、`/alerts?_sort=time&_order=desc`
- `GET /weatherForecast`，可用 `params.pointId` 过滤
- `GET /extremeEvents`、`/pestRiskPredictions`、`/notifications`、`/droneMissions`
- `GET /fields`、`/ndviLayers`、`/moistureLayers`
- `GET /moisture/value?lat=&lng=`
- `GET /reports/daily` 返回 `{ markdown }`
- `GET /analysis/recent` 返回 `{ records }`，认 `params.limit`
- `GET /analysis/stats`、`GET /analysis/model-info`
- `GET /field-sensors/:pointId/readings`、`GET|PUT /field-sensors/:pointId/thresholds`
- `POST /login` 返回 `{ token, user: { id, name, phone, role } }`
- `POST /alerts`、`PATCH /alerts/:id`、`DELETE /alerts/:id`
- `POST /alerts/:id/publish` 把该条 `draft` 改为 `false`
- `POST /alerts/evaluate-all`、`POST /weather/extreme-events/evaluate` 返回 `{ ok: true, created: 0 }`
- `POST /pest-risk/evaluate` 返回 `{ ok: true, created: 0, predictions }`
- `PATCH /notifications/:id` 把 `read` 设为 `true`
- `POST /analysis/image`、`/analysis/batch`、`/analysis/feedback` 拒绝，文案为 `本页不提供公网实时上传`

`createStaticHttp` 必须 `structuredClone` 入参。第二次 `createStaticHttp(demoSnapshot)` 仍看到原始草稿。

- [ ] **Step 1: 写失败测试**

`src/demo/staticHttp.test.ts`

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { chainCoverage, demoSnapshot } from './snapshot.ts'
import { createStaticHttp } from './staticHttp.ts'

test('snapshot covers three counties and three chains', () => {
  const coverage = chainCoverage(demoSnapshot)
  assert.deepEqual(coverage, {
    counties: true,
    env: true,
    extreme: true,
    pestDraft: true,
    forecast: true
  })
})

test('displayed accuracy is 94.05 for 23 classes', () => {
  assert.equal(demoSnapshot.modelInfo.classes_count, 23)
  assert.equal((demoSnapshot.modelInfo.best_val_acc * 100).toFixed(2), '94.05')
})

test('alerts sort desc and xiongxian forecast has a heavy-rain day', async () => {
  const http = createStaticHttp(demoSnapshot)
  const alerts = await http.get('/alerts?_sort=time&_order=desc')
  const times = (alerts.data as Array<{ time: number }>).map((row) => row.time)
  assert.deepEqual(times, [...times].sort((a, b) => b - a))
  const forecast = await http.get('/weatherForecast', { params: { pointId: 1 } })
  const rows = forecast.data as Array<{ pointId: number; precipMm: number }>
  assert.equal(rows.length, 7)
  assert.equal(rows.every((row) => row.pointId === 1), true)
  assert.equal(rows.some((row) => row.precipMm >= 40), true)
})

test('publish flips only the in-memory draft', async () => {
  const http = createStaticHttp(demoSnapshot)
  const before = await http.get('/alerts')
  const draft = (before.data as Array<{ id: number; draft?: boolean }>).find((row) => row.draft === true)
  assert.ok(draft)
  await http.post(`/alerts/${draft.id}/publish`)
  const after = await http.get('/alerts')
  const published = (after.data as Array<{ id: number; draft?: boolean }>).find((row) => row.id === draft.id)
  assert.equal(published?.draft, false)
  const fresh = createStaticHttp(demoSnapshot)
  const again = await fresh.get('/alerts')
  const original = (again.data as Array<{ id: number; draft?: boolean }>).find((row) => row.id === draft.id)
  assert.equal(original?.draft, true)
})

test('login returns an agronomist token without a network call', async () => {
  const http = createStaticHttp(demoSnapshot)
  const res = await http.post('/login', { phone: '13800000000', code: '2026', role: 'agronomist' })
  const body = res.data as { token: string; user: { role: string } }
  assert.equal(body.user.role, 'agronomist')
  assert.equal(typeof body.token, 'string')
})

test('image upload is rejected', async () => {
  const http = createStaticHttp(demoSnapshot)
  await assert.rejects(() => http.post('/analysis/image', {}), /公网实时上传/)
})

test('every page endpoint used today resolves', async () => {
  const http = createStaticHttp(demoSnapshot)
  const gets = [
    '/monitorPoints',
    '/weatherReadings',
    '/alerts?_sort=time&_order=desc',
    '/weatherForecast',
    '/extremeEvents',
    '/pestRiskPredictions',
    '/notifications',
    '/droneMissions',
    '/fields',
    '/ndviLayers',
    '/moistureLayers',
    '/moisture/value?lat=38.99&lng=116.12',
    '/analysis/recent',
    '/analysis/stats',
    '/analysis/model-info',
    '/reports/daily',
    '/field-sensors/1/readings',
    '/field-sensors/1/thresholds'
  ]
  for (const url of gets) {
    const res = await http.get(url)
    assert.notEqual(res.data, undefined, url)
  }
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/staticHttp.test.ts`

Expected: FAIL，模块不存在。

- [ ] **Step 3: 写快照**

`src/demo/snapshot.ts` 使用下面的类型和数据。监测点 `id` 1 是雄县，2 是河间，3 是栾城，`region` 都是 `jjj`。`status` 必须为非空字符串，否则 `src/stores/data.ts` 的 `fetchMonitorPoints` 会丢掉该点。

```ts
export interface DemoAlert {
  id: number
  pointId: number
  fieldId: string | null
  level: string
  message: string
  time: number
  handled: boolean
  source: 'auto' | 'manual'
  ruleId: string
  chain: 'env' | 'extreme' | 'pest'
  draft: boolean
}

export interface DemoForecastRow {
  pointId: number
  date: string
  tempMax: number
  tempMin: number
  precipMm: number
  windMax: number
  humidity: number
}

export interface DemoSnapshot {
  monitorPoints: Array<Record<string, unknown>>
  weatherReadings: Array<Record<string, unknown>>
  alerts: DemoAlert[]
  weatherForecast: DemoForecastRow[]
  extremeEvents: Array<{ pointId: number; title: string; startAt: string }>
  pestRiskPredictions: Array<Record<string, unknown>>
  notifications: Array<{ id: number; title: string; read: boolean; alertId: number; createdAt: string }>
  droneMissions: Array<Record<string, unknown>>
  fields: Array<Record<string, unknown>>
  ndviLayers: Array<Record<string, unknown>>
  moistureLayers: Array<Record<string, unknown>>
  sensorReadings: Array<{
    id: number
    pointId: number
    recordedAt: string
    airTemp: number
    airRh: number
    soilVwc: number
    soilTemp10cm: number
  }>
  thresholds: Array<Record<string, unknown>>
  dailyReportMarkdown: string
  analysisRecords: Array<{ id: number; label: string; confidence: number; cropType?: string; createdAt?: string }>
  analysisStats: Record<string, unknown>
  modelInfo: { classes_count: number; best_val_acc: number }
}

function forecastFor(pointId: number): DemoForecastRow[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    const heavy = pointId === 1 && index === 3
    return {
      pointId,
      date: `2026-09-${day}`,
      tempMax: pointId === 1 && index === 2 ? 36 : 29,
      tempMin: 18,
      precipMm: heavy ? 48 : 2,
      windMax: heavy ? 12 : 4,
      humidity: heavy ? 90 : 62
    }
  })
}

function readingsFor(pointId: number, soilVwc: number) {
  return [1, 2].map((day) => ({
    id: pointId * 10 + day,
    pointId,
    recordedAt: `2026-09-0${day}T08:00:00+08:00`,
    airTemp: 27,
    airRh: 62,
    soilVwc,
    soilTemp10cm: 22
  }))
}

export const demoSnapshot: DemoSnapshot = {
  monitorPoints: [
    { id: 1, name: '雄县', region: 'jjj', lat: 38.99, lng: 116.12, temp: 28.4, soilMoisture: 16.2, status: 'warning', online: true },
    { id: 2, name: '河间', region: 'jjj', lat: 38.44, lng: 116.08, temp: 26.1, soilMoisture: 28.0, status: 'normal', online: true },
    { id: 3, name: '栾城', region: 'jjj', lat: 37.88, lng: 114.65, temp: 27.2, soilMoisture: 24.5, status: 'normal', online: true }
  ],
  weatherReadings: [
    { id: 1, pointId: 1, updatedAt: '2026-09-02T08:00:00+08:00', soilVwc: 16.2, soilTemp10cm: 22, soilEc: 0.4, airTemp: 28.4, airRh: 58, windSpeed: 3.2, windDirection: 90, windDirectionText: '东', pressure: 1008, hourlyRain: 0 },
    { id: 2, pointId: 2, updatedAt: '2026-09-02T08:00:00+08:00', soilVwc: 28, soilTemp10cm: 21, soilEc: 0.4, airTemp: 26.1, airRh: 64, windSpeed: 2.4, windDirection: 180, windDirectionText: '南', pressure: 1010, hourlyRain: 0 },
    { id: 3, pointId: 3, updatedAt: '2026-09-02T08:00:00+08:00', soilVwc: 24.5, soilTemp10cm: 22, soilEc: 0.3, airTemp: 27.2, airRh: 70, windSpeed: 2.1, windDirection: 45, windDirectionText: '东北', pressure: 1009, hourlyRain: 0 }
  ],
  alerts: [
    {
      id: 1,
      pointId: 1,
      fieldId: null,
      level: 'warning',
      message: '[自动预警] 雄县土壤湿度低于告警线，墒情持续偏低。',
      time: 1750000003000,
      handled: false,
      source: 'auto',
      ruleId: 'water_stress',
      chain: 'env',
      draft: false
    },
    {
      id: 2,
      pointId: 1,
      fieldId: null,
      level: 'high',
      message: '[极端天气] 雄县未来 7 日有强降水，已按预报写入预警。',
      time: 1750000002000,
      handled: false,
      source: 'auto',
      ruleId: 'extreme_rain',
      chain: 'extreme',
      draft: false
    },
    {
      id: 3,
      pointId: 3,
      fieldId: null,
      level: 'high',
      message: '[虫情风险] 栾城虫情风险为草稿，正式发布需确认。',
      time: 1750000001000,
      handled: false,
      source: 'auto',
      ruleId: 'pest_risk',
      chain: 'pest',
      draft: true
    }
  ],
  weatherForecast: [1, 2, 3].flatMap(forecastFor),
  extremeEvents: [{ pointId: 1, title: '强降水', startAt: '2026-09-04T00:00:00+08:00' }],
  pestRiskPredictions: [],
  notifications: [
    { id: 1, title: '雄县墒情预警', read: false, alertId: 1, createdAt: '2026-09-02T08:00:00+08:00' }
  ],
  droneMissions: [],
  fields: [],
  ndviLayers: [],
  moistureLayers: [],
  sensorReadings: [...readingsFor(1, 16.2), ...readingsFor(2, 28), ...readingsFor(3, 24.5)],
  thresholds: [
    { pointId: 1 },
    { pointId: 2 },
    { pointId: 3 }
  ],
  dailyReportMarkdown: '# 演示日报\n\n监测点：河间、雄县、栾城。雄县墒情预警与极端天气预警已写入。栾城虫情为草稿。',
  analysisRecords: [],
  analysisStats: { byLabel: [] },
  modelInfo: { classes_count: 23, best_val_acc: 0.9404598959759102 }
}

export function chainCoverage(snapshot: DemoSnapshot) {
  const xiongxian = snapshot.monitorPoints.find((point) => String(point.name).includes('雄县'))
  const hejian = snapshot.monitorPoints.find((point) => String(point.name).includes('河间'))
  const luancheng = snapshot.monitorPoints.find((point) => String(point.name).includes('栾城'))
  const forecastCount = snapshot.weatherForecast.filter((row) => row.pointId === Number(xiongxian?.id)).length
  return {
    counties: Boolean(xiongxian && hejian && luancheng && xiongxian.region === 'jjj'),
    env: snapshot.alerts.some(
      (alert) =>
        alert.chain === 'env' &&
        alert.draft !== true &&
        alert.message.includes('土壤湿度') &&
        alert.message.includes('雄县')
    ),
    extreme: snapshot.alerts.some(
      (alert) => alert.chain === 'extreme' && alert.draft !== true && alert.message.includes('[极端天气]')
    ),
    pestDraft: snapshot.alerts.some(
      (alert) => alert.chain === 'pest' && alert.draft === true && alert.message.includes('[虫情风险]')
    ),
    forecast: forecastCount >= 7
  }
}
```

- [ ] **Step 4: 写静态 HTTP**

`src/demo/staticHttp.ts`

```ts
import type { DemoSnapshot } from './snapshot.ts'

export class StaticDemoError extends Error {
  status: number
  friendlyMessage: string

  constructor(message: string, status = 404) {
    super(message)
    this.status = status
    this.friendlyMessage = message
  }
}

type Row = Record<string, unknown>

function splitUrl(url: string) {
  const [path, search = ''] = url.split('?')
  return { path, query: new URLSearchParams(search) }
}

function applyQuery(rows: Row[], query: URLSearchParams, params?: Record<string, unknown>) {
  const filters = new Map<string, string>()
  query.forEach((value, key) => {
    if (!key.startsWith('_')) filters.set(key, value)
  })
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '' && !key.startsWith('_')) filters.set(key, String(value))
    }
  }
  let filtered = rows.filter((row) => {
    for (const [key, value] of filters) {
      if (String(row[key]) !== value) return false
    }
    return true
  })
  const sortKey = query.get('_sort')
  if (sortKey) {
    const reverse = (query.get('_order') || 'asc').toLowerCase() === 'desc'
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (av < bv) return reverse ? 1 : -1
      if (av > bv) return reverse ? -1 : 1
      return 0
    })
  }
  return filtered
}

function nearestMoisture(db: DemoSnapshot, lat: number, lng: number) {
  let best = db.monitorPoints[0]
  let bestDistance = Number.POSITIVE_INFINITY
  for (const point of db.monitorPoints) {
    const distance = Math.hypot(Number(point.lat) - lat, Number(point.lng) - lng)
    if (distance < bestDistance) {
      best = point
      bestDistance = distance
    }
  }
  return {
    moisture: Number(best.soilMoisture),
    source: 'nearest-point',
    nearestPointId: Number(best.id),
    pointName: String(best.name),
    distanceKm: Number((bestDistance * 111).toFixed(2))
  }
}

function dispatch(
  db: DemoSnapshot,
  method: string,
  url: string,
  config?: { params?: Record<string, unknown> },
  body?: unknown
): unknown {
  const { path, query } = splitUrl(url)
  const params = config?.params
  const verb = method.toUpperCase()

  if (verb === 'POST' && (path === '/analysis/image' || path === '/analysis/batch' || path === '/analysis/feedback')) {
    throw new StaticDemoError('本页不提供公网实时上传', 400)
  }
  if (verb === 'POST' && path === '/login') {
    const payload = (body ?? {}) as { role?: string }
    const role = payload.role === 'admin' || payload.role === 'cooperative' || payload.role === 'agronomist'
      ? payload.role
      : 'agronomist'
    return {
      code: 200,
      message: '登录成功',
      token: 'demo-static',
      user: { id: 1, name: '演示农技员', phone: '13800000000', role }
    }
  }
  if (verb === 'POST' && path === '/alerts/evaluate-all') return { ok: true, created: 0 }
  if (verb === 'POST' && path === '/weather/extreme-events/evaluate') return { ok: true, created: 0 }
  if (verb === 'POST' && path === '/pest-risk/evaluate') {
    return { ok: true, created: 0, predictions: db.pestRiskPredictions }
  }

  const publish = path.match(/^\/alerts\/(\d+)\/publish$/)
  if (verb === 'POST' && publish) {
    const row = db.alerts.find((alert) => alert.id === Number(publish[1]))
    if (!row) throw new StaticDemoError('预警不存在', 404)
    row.draft = false
    return row
  }

  if (verb === 'POST' && path === '/alerts') {
    const payload = (body ?? {}) as Row
    const nextId = db.alerts.reduce((max, alert) => Math.max(max, alert.id), 0) + 1
    const row = { id: nextId, draft: false, handled: false, source: 'manual', ...payload }
    db.alerts.push(row as DemoSnapshot['alerts'][number])
    return row
  }

  const alertPath = path.match(/^\/alerts\/(\d+)$/)
  if (alertPath && (verb === 'PATCH' || verb === 'DELETE')) {
    const id = Number(alertPath[1])
    const index = db.alerts.findIndex((alert) => alert.id === id)
    if (index < 0) throw new StaticDemoError('预警不存在', 404)
    if (verb === 'DELETE') {
      db.alerts.splice(index, 1)
      return null
    }
    Object.assign(db.alerts[index], (body ?? {}) as Row)
    return db.alerts[index]
  }

  const noticePath = path.match(/^\/notifications\/(\d+)$/)
  if (verb === 'PATCH' && noticePath) {
    const row = db.notifications.find((item) => item.id === Number(noticePath[1]))
    if (!row) throw new StaticDemoError('通知不存在', 404)
    row.read = true
    return row
  }

  const readingsPath = path.match(/^\/field-sensors\/(\d+)\/readings$/)
  if (verb === 'GET' && readingsPath) {
    return db.sensorReadings.filter((row) => row.pointId === Number(readingsPath[1]))
  }

  const thresholdPath = path.match(/^\/field-sensors\/(\d+)\/thresholds$/)
  if (thresholdPath) {
    const pointId = Number(thresholdPath[1])
    const current = db.thresholds.find((row) => Number(row.pointId) === pointId) ?? { pointId }
    if (verb === 'PUT') {
      Object.assign(current, (body ?? {}) as Row, { pointId })
      if (!db.thresholds.includes(current)) db.thresholds.push(current)
      return current
    }
    if (verb === 'GET') return current
  }

  if (verb === 'GET' && path === '/monitorPoints') return db.monitorPoints
  if (verb === 'GET' && path === '/weatherReadings') return applyQuery(db.weatherReadings, query, params)
  if (verb === 'GET' && path === '/alerts') return applyQuery(db.alerts as unknown as Row[], query, params)
  if (verb === 'GET' && path === '/weatherForecast') return applyQuery(db.weatherForecast as unknown as Row[], query, params)
  if (verb === 'GET' && path === '/extremeEvents') return db.extremeEvents
  if (verb === 'GET' && path === '/pestRiskPredictions') return db.pestRiskPredictions
  if (verb === 'GET' && path === '/notifications') return db.notifications
  if (verb === 'GET' && path === '/droneMissions') return db.droneMissions
  if (verb === 'GET' && path === '/fields') return db.fields
  if (verb === 'GET' && path === '/ndviLayers') return db.ndviLayers
  if (verb === 'GET' && path === '/moistureLayers') return db.moistureLayers
  if (verb === 'GET' && path === '/reports/daily') return { markdown: db.dailyReportMarkdown }
  if (verb === 'GET' && path === '/analysis/stats') return db.analysisStats
  if (verb === 'GET' && path === '/analysis/model-info') return db.modelInfo
  if (verb === 'GET' && path === '/analysis/recent') {
    const limit = Number(query.get('limit') ?? params?.limit ?? 20)
    return { records: db.analysisRecords.slice(0, limit) }
  }
  if (verb === 'GET' && path === '/moisture/value') {
    const lat = Number(query.get('lat') ?? params?.lat)
    const lng = Number(query.get('lng') ?? params?.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new StaticDemoError('缺少经纬度', 400)
    return nearestMoisture(db, lat, lng)
  }

  throw new StaticDemoError(`static demo has no fixture for ${verb} ${path}`, 404)
}

export function createStaticHttp(source: DemoSnapshot) {
  const db = structuredClone(source)
  function call(method: string, url: string, config?: { params?: Record<string, unknown> }, body?: unknown) {
    try {
      return Promise.resolve({ data: dispatch(db, method, url, config, body) })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return {
    get(url: string, config?: { params?: Record<string, unknown> }) {
      return call('GET', url, config)
    },
    post(url: string, body?: unknown) {
      return call('POST', url, undefined, body)
    },
    patch(url: string, body?: unknown) {
      return call('PATCH', url, undefined, body)
    },
    put(url: string, body?: unknown) {
      return call('PUT', url, undefined, body)
    },
    delete(url: string) {
      return call('DELETE', url)
    }
  }
}
```

- [ ] **Step 5: 运行测试，确认通过**

Run: `pnpm exec tsx --test src/demo/staticHttp.test.ts src/demo/copy.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交**

```powershell
git add src/demo/snapshot.ts src/demo/staticHttp.ts src/demo/staticHttp.test.ts
git commit -m "feat: add static demo HTTP fixture"
```

---

### Task 3: 生产构建改走静态客户端

**Files:**
- Create: `src/utils/liveHttp.ts`
- Modify: `src/utils/http.ts`
- Test: `src/demo/httpEntry.test.ts`

**Interfaces:**
- Consumes: `createStaticHttp`、`demoSnapshot`
- Produces: 默认导出的 `http`。生产构建是静态客户端。开发构建是现有 axios 实例，`baseURL` 仍为 `/api`，401 时仍清除 `token` 和 `userInfo`。

- [ ] **Step 1: 写失败测试**

`src/demo/httpEntry.test.ts`

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('http entry uses the static client in production and keeps axios out of that branch', () => {
  const src = readFileSync(new URL('../utils/http.ts', import.meta.url), 'utf8')
  assert.match(src, /import\.meta\.env\.PROD/)
  assert.match(src, /createStaticHttp\(demoSnapshot\)/)
  assert.match(src, /import\('\.\/liveHttp'\)/)
  assert.equal(src.includes("baseURL: '/api'"), false)
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/httpEntry.test.ts`

Expected: FAIL。当前 `src/utils/http.ts` 含有 `baseURL: '/api'`，没有 `createStaticHttp`。

- [ ] **Step 3: 拆出 live 客户端并改入口**

把 `src/utils/http.ts` 整文件剪到 `src/utils/liveHttp.ts`。在 `liveHttp.ts` 里把 `const http = axios.create(...)` 改成函数体，结尾 `return http`，函数名 `export function createLiveHttp()`。`ApiResult`、`API_ERROR_MESSAGES`、`createRequestId`、`clearLocalSession` 和两个拦截器原样保留，不要改 `vite.config.ts` 的 proxy。删掉 `liveHttp.ts` 末尾原来的 `export default http`。

把 `src/utils/http.ts` 换成：

```ts
import { createStaticHttp } from '@/demo/staticHttp'
import { demoSnapshot } from '@/demo/snapshot'

const http = import.meta.env.PROD
  ? createStaticHttp(demoSnapshot)
  : (await import('./liveHttp')).createLiveHttp()

export default http
```

必须写成 `import.meta.env.PROD ? … : await import('./liveHttp')`。不要让生产分支同步 import axios，否则禁用词扫描会在 `dist` 里看到 `baseURL: '/api'`。

- [ ] **Step 4: 运行测试和类型检查**

Run: `pnpm exec tsx --test src/demo/httpEntry.test.ts src/demo/staticHttp.test.ts`

Expected: PASS。

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`

Expected: 退出码 0。若报 top-level await，确认 `tsconfig.app.json` 仍继承 `@vue/tsconfig` 的 `ESNext`，不要改成另外一种动态加载。

- [ ] **Step 5: 提交**

```powershell
git add src/utils/http.ts src/utils/liveHttp.ts src/demo/httpEntry.test.ts
git commit -m "feat: use static demo HTTP in production builds"
```

---

### Task 4: 生产构建直接进入京津冀农技员会话

**Files:**
- Create: `src/demo/session.ts`
- Modify: `src/stores/user.ts`
- Modify: `src/constants/monitorRegions.ts`
- Modify: `src/stores/data.ts`（`selectedRegion` 的初值）
- Modify: `src/router/index.ts`（`path: '/'` 那条）
- Test: `src/demo/session.test.ts`

**Interfaces:**
- Consumes: `useUserStore().isLogged` 仍表示 `token` 非空
- Produces:
  - `seedStaticDemoSession(prod, storage)`。`prod` 为真且没有 `token` 时写入 `token=demo-static`，`userInfo` 为 `{ id: 1, name: '演示农技员', phone: '13800000000', role: 'agronomist' }`
  - `initialMonitorRegion(prod)`。`prod` 为真返回 `'jjj'`，否则返回 `DEFAULT_MONITOR_REGION`（`'northeast'`）
  - `/` 在已登录时重定向到 `/home`，未登录时到 `/login`

开发构建不要预写 token，默认区域仍是东北。

- [ ] **Step 1: 写失败测试**

`src/demo/session.test.ts`

```ts
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialMonitorRegion } from '../constants/monitorRegions.ts'
import { seedStaticDemoSession } from './session.ts'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem(key: string) {
      return data.get(key) ?? null
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    }
  }
}

test('production seeds one agronomist session', () => {
  const storage = memoryStorage()
  seedStaticDemoSession(true, storage)
  assert.equal(storage.getItem('token'), 'demo-static')
  assert.deepEqual(JSON.parse(storage.getItem('userInfo') || '{}'), {
    id: 1,
    name: '演示农技员',
    phone: '13800000000',
    role: 'agronomist'
  })
  storage.setItem('token', 'keep-me')
  seedStaticDemoSession(true, storage)
  assert.equal(storage.getItem('token'), 'keep-me')
})

test('development does not seed a session', () => {
  const storage = memoryStorage()
  seedStaticDemoSession(false, storage)
  assert.equal(storage.getItem('token'), null)
})

test('production opens on the Jing-Jin-Ji region', () => {
  assert.equal(initialMonitorRegion(true), 'jjj')
  assert.equal(initialMonitorRegion(false), 'northeast')
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/session.test.ts`

Expected: FAIL，`session.ts` 不存在，`initialMonitorRegion` 未导出。

- [ ] **Step 3: 实现并接上**

`src/demo/session.ts`

```ts
export const STATIC_DEMO_USER = {
  id: 1,
  name: '演示农技员',
  phone: '13800000000',
  role: 'agronomist' as const
}

export function seedStaticDemoSession(
  prod: boolean,
  storage: { getItem(key: string): string | null; setItem(key: string, value: string): void }
) {
  if (!prod) return
  if (!storage.getItem('token')) {
    storage.setItem('token', 'demo-static')
    storage.setItem('userInfo', JSON.stringify(STATIC_DEMO_USER))
  }
}
```

在 `src/constants/monitorRegions.ts` 末尾增加：

```ts
export function initialMonitorRegion(prod: boolean): MonitorRegionId {
  return prod ? 'jjj' : DEFAULT_MONITOR_REGION
}
```

`src/stores/data.ts` 把

```ts
const selectedRegion = ref<MonitorRegionId>(DEFAULT_MONITOR_REGION)
```

改成

```ts
const selectedRegion = ref<MonitorRegionId>(initialMonitorRegion(import.meta.env.PROD))
```

并 import `initialMonitorRegion`。`DEFAULT_MONITOR_REGION` 若不再被这个文件使用，删掉对应 import，避免 `noUnusedLocals`。

`src/stores/user.ts` 在 `defineStore` 之前调用：

```ts
import { seedStaticDemoSession } from '@/demo/session'
seedStaticDemoSession(import.meta.env.PROD, localStorage)
```

这一行必须在 `localStorage.getItem('token')` 读进 `token` ref 之前执行。

`src/router/index.ts` 把 `{ path: '/', redirect: '/login' }` 换成：

```ts
{
  path: '/',
  redirect: () => (useUserStore().isLogged ? '/home' : '/login')
}
```

`useUserStore` 已经在这个文件里 import。不要把 `requiresAuth` 从预警、决策、地图、相关数据、智能分析路由上拿掉。

- [ ] **Step 4: 运行测试**

Run: `pnpm exec tsx --test src/demo/session.test.ts`

Expected: PASS，3 tests。

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`

Expected: 退出码 0。

- [ ] **Step 5: 提交**

```powershell
git add src/demo/session.ts src/demo/session.test.ts src/stores/user.ts src/stores/data.ts src/constants/monitorRegions.ts src/router/index.ts
git commit -m "feat: open the static site as an agronomist in Jing-Jin-Ji"
```

---

### Task 5: 去掉会进构建产物和 README 的双盲信息与旧地址

**Files:**
- Modify: `index.html`
- Modify: `src/views/user/About.vue`
- Modify: `README.md`
- Test: `src/demo/blindSource.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: 上述三个文件不再包含扫描表里的词。关于我们页不再渲染指导教师区块，不再提供 `mailto:`。系统标题 `AI技术赋能下的作物灾害智慧监测预警系统` 保留。

扫描表（测试和后来的 `scripts/check-static-site.mjs` 使用同一组连续字符串）：

- `www.dizhongkeji.cn`
- `82.157.234.123`
- `河北地质大学`
- `坤灵智巡创工队`
- `信息工程学院`
- `hgu.edu.cn`
- `kunling-smart`
- `指导教师`
- `刘兴冉`
- `孙丞淼`
- `中国科学院`
- `西北农林`

队员姓名（王佳欢、张晓琳等）按规格保留在关于我们页。不要改 `docs/小挑/` 和简历。

- [ ] **Step 1: 写失败测试**

`src/demo/blindSource.test.ts`

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const forbidden = [
  ['www.', 'dizhongkeji', '.cn'].join(''),
  ['82.157', '.234', '.123'].join(''),
  ['河北', '地质', '大学'].join(''),
  ['坤灵智巡', '创工队'].join(''),
  ['信息', '工程学院'].join(''),
  ['hgu', '.edu', '.cn'].join(''),
  ['kunling', '-smart'].join(''),
  ['指导', '教师'].join(''),
  ['刘兴', '冉'].join(''),
  ['孙丞', '淼'].join(''),
  ['中国', '科学院'].join(''),
  ['西北', '农林'].join('')
]

test('index, about page, and README do not name the school, advisors, or retired hosts', () => {
  const files = ['../../index.html', '../views/user/About.vue', '../../README.md']
  for (const file of files) {
    const text = readFileSync(new URL(file, import.meta.url), 'utf8')
    for (const word of forbidden) {
      assert.equal(text.includes(word), false, `${file} contains ${word}`)
    }
  }
})
```

测试文件用 `join` 拼词，这样测试源码本身不包含连续禁用词。

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/blindSource.test.ts`

Expected: FAIL。当前 `index.html` 的 description、`About.vue` 的学校名和指导教师、`README.md` 的抬头和线上地址会命中。

- [ ] **Step 3: 改三个文件**

`index.html` 的 description 换成：

```html
<meta
  name="description"
  content="AI技术赋能下的作物灾害智慧监测预警系统 — 农情监测、灾害预警与智慧决策。监测、预报与遥感为演示数据。" />
```

`<title>` 保持 `AI技术赋能下的作物灾害智慧监测预警系统`。

`src/views/user/About.vue`：

- 把「我们是河北地质大学坤灵智巡创工队……」整段换成：`本团队自主开发了这套 Web 监测预警系统，供合作社与农技推广场景演示使用。监测、预报与遥感图层为演示数据。`
- 删除「导师引领」整块模板，以及 `advisors` 常量。
- 删除页脚里的学校名、创工队和 `mailto` 按钮。这一块改由 Task 6 的全站页脚承担，关于我们页不要再留第二段学校页脚。
- 删掉因此不再使用的 import：`TrophyOutlined`、`MailOutlined`、`advisorDefaultAvatar`。`fetchAnalysisModelInfo` 保留，生产构建会从静态客户端拿到 23 类和 `best_val_acc`。
- 队员卡片保留。

`README.md`：

- 抬头去掉学校、创工队、学院和开发者归属句。保留系统名和 `V2.1.0`。
- 把「线上地址」那一行换成：`竞赛入口是 Vercel 或 Netlify 上的静态站。部署完成后再把 https 链接写进赛程材料。`
- `DATABASE_URL` 示例里的主机写成 `<数据库主机>`，不要写数字 IP。
- 把「线上部署（宝塔）」一节换成下面这段，不再把国内 88 端口机器写成当前入口：

```md
## 竞赛入口

`pnpm build` 的产物在 `dist/`。部署到 Vercel 或 Netlify，并把前端路由回落到 `index.html`。生产构建读取包内演示数据，不连接 Flask。

录视频和答辩在本机执行 `pnpm dev`，另开终端运行 `python ml-bjj/serving/app.py`。不要把本机地址写进页面或赛程材料。
```

- 文末「开发单位 / 联系邮箱」两行删除。改成：`页脚声明见站点内的竞赛演示说明。`

- [ ] **Step 4: 运行测试**

Run: `pnpm exec tsx --test src/demo/blindSource.test.ts`

Expected: PASS。

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`

Expected: 退出码 0。

- [ ] **Step 5: 提交**

```powershell
git add index.html src/views/user/About.vue README.md src/demo/blindSource.test.ts
git commit -m "fix: remove school names and retired hosts from the contest entry"
```

---

### Task 6: 全站页脚声明

**Files:**
- Create: `src/components/SiteDemoFooter.vue`
- Modify: `src/layouts/AppLayout.vue`（在 `</main>` 与根节点 `</div>` 之间插入组件）
- Test: `src/demo/footerSource.test.ts`

**Interfaces:**
- Consumes: `FOOTER_DISCLAIMER`
- Produces: 每个套在 `AppLayout` 里的页面底部都渲染这段声明，包括首页、地图、预警、决策、相关数据、智能分析、关于我们。

- [ ] **Step 1: 写失败测试**

`src/demo/footerSource.test.ts`

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('app layout renders the shared demo footer', () => {
  const layout = readFileSync(new URL('../layouts/AppLayout.vue', import.meta.url), 'utf8')
  const footer = readFileSync(new URL('../components/SiteDemoFooter.vue', import.meta.url), 'utf8')
  assert.equal(layout.includes('SiteDemoFooter'), true)
  assert.equal(footer.includes('FOOTER_DISCLAIMER'), true)
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/footerSource.test.ts`

Expected: FAIL，组件文件不存在。

- [ ] **Step 3: 写组件并插入布局**

`src/components/SiteDemoFooter.vue`

```vue
<template>
  <footer class="site-demo-footer">
    <p>{{ FOOTER_DISCLAIMER }}</p>
  </footer>
</template>

<script setup lang="ts">
import { FOOTER_DISCLAIMER } from '@/demo/copy'
</script>

<style scoped>
.site-demo-footer {
  padding: 12px 24px 20px;
  color: var(--glass-text-muted);
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}
</style>
```

在 `src/layouts/AppLayout.vue` 的 `<main class="content-slot">` 结束标签后面插入 `<SiteDemoFooter />`，并在 script 里 import 该组件。导航数组保持这 7 项：`首页`、`相关数据`、`灾害实时监测`、`智能分析`、`灾害预警`、`智慧决策`、`关于我们`。

- [ ] **Step 4: 运行测试**

Run: `pnpm exec tsx --test src/demo/footerSource.test.ts`

Expected: PASS。

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`

Expected: 退出码 0。

- [ ] **Step 5: 提交**

```powershell
git add src/components/SiteDemoFooter.vue src/layouts/AppLayout.vue src/demo/footerSource.test.ts
git commit -m "feat: show the contest demo disclaimer in the footer"
```

---

### Task 7: 预警说明与识病录像区块

**Files:**
- Modify: `src/views/user/WarningSystem.vue`
- Modify: `src/views/user/DataAnalysis.vue`
- Test: `src/demo/pageSource.test.ts`

**Interfaces:**
- Consumes: `RULE_CHAIN_NOTE`、`ANALYSIS_DEMO_NOTE`、`MODEL_METRICS_LINE`
- Produces: 生产构建的智能分析页有 `<video controls src="/demo/analysis.mp4">`，两处 `<a-upload` 都带 `v-if="!staticDemo"`。`staticDemo` 等于 `import.meta.env.PROD`。开发构建仍显示上传，供录视频。预警页展示 `RULE_CHAIN_NOTE`。不要增加「在线体验」按钮。

- [ ] **Step 1: 写失败测试**

`src/demo/pageSource.test.ts`

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('warning page states that alerts are precomputed', () => {
  const src = readFileSync(new URL('../views/user/WarningSystem.vue', import.meta.url), 'utf8')
  assert.equal(src.includes('RULE_CHAIN_NOTE'), true)
})

test('analysis page plays the demo video and hides upload in the static build', () => {
  const src = readFileSync(new URL('../views/user/DataAnalysis.vue', import.meta.url), 'utf8')
  assert.equal(src.includes('ANALYSIS_DEMO_NOTE'), true)
  assert.equal(src.includes('MODEL_METRICS_LINE'), true)
  assert.match(src, /src="\/demo\/analysis\.mp4"/)
  assert.match(src, /<video[^>]*controls/)
  assert.equal(src.includes('在线体验'), false)
  const uploads = src.match(/<a-upload/g) || []
  assert.equal(uploads.length >= 2, true)
  assert.equal((src.match(/v-if="!staticDemo"/g) || []).length >= 2, true)
})

test('nav still exposes the rule-chain pages', () => {
  const src = readFileSync(new URL('../layouts/AppLayout.vue', import.meta.url), 'utf8')
  for (const label of ['相关数据', '灾害实时监测', '智能分析', '灾害预警', '智慧决策']) {
    assert.equal(src.includes(label), true, label)
  }
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/pageSource.test.ts`

Expected: FAIL。预警页和智能分析页还没有这些标记。

- [ ] **Step 3: 改两个页面**

`WarningSystem.vue` 在标题「预警管理」下增加：

```vue
<p class="rule-chain-note">{{ RULE_CHAIN_NOTE }}</p>
```

script 增加 `import { RULE_CHAIN_NOTE } from '@/demo/copy'`。不要删掉「含草稿」开关和「确认发布」。

`DataAnalysis.vue` 的 script 增加：

```ts
import { ANALYSIS_DEMO_NOTE, MODEL_METRICS_LINE } from '@/demo/copy'
const staticDemo = import.meta.env.PROD
```

在「智能分析」标题下方、参数卡片之前，仅在静态构建显示：

```vue
<section v-if="staticDemo" class="analysis-demo">
  <video
    controls
    playsinline
    preload="metadata"
    src="/demo/analysis.mp4"></video>
  <p>{{ ANALYSIS_DEMO_NOTE }}</p>
  <p>{{ MODEL_METRICS_LINE }}</p>
</section>
```

给两个 `<a-upload`（主预览区和预览弹窗里的那一个）都加上 `v-if="!staticDemo"`。开发构建的上传、`analyzeImage` 调用保持不动，录像时走的是这一支。

`.analysis-demo video` 设 `width: 100%`、`max-height: 420px`。

- [ ] **Step 4: 运行测试**

Run: `pnpm exec tsx --test src/demo/pageSource.test.ts src/demo/blindSource.test.ts`

Expected: PASS。

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`

Expected: 退出码 0。

- [ ] **Step 5: 提交**

```powershell
git add src/views/user/WarningSystem.vue src/views/user/DataAnalysis.vue src/demo/pageSource.test.ts
git commit -m "feat: show precomputed alerts and the disease demo video"
```

---

### Task 8: 专题图进产物，SPA 回落

**Files:**
- Create: `scripts/copy-satellite-maps.mjs`
- Modify: `package.json` 的 `build` 脚本
- Create: `vercel.json`
- Create: `netlify.toml`
- Create: `public/_redirects`
- Test: `src/demo/hostingSource.test.ts`

**Interfaces:**
- Consumes: 仓库根目录 `satellite-maps/`（`public/satellite/catalog.json` 的 url 以 `/satellite-maps/` 开头）
- Produces: `pnpm build` 在 `vite build` 之后执行复制脚本。`dist/satellite-maps/` 与源目录一致。三个托管配置都把未知路径回落到 `/index.html`，状态为 200 式重写，不覆盖已经存在的 `/assets/`、`/demo/`、`/satellite-maps/` 文件。

- [ ] **Step 1: 写失败测试**

`src/demo/hostingSource.test.ts`

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('build copies satellite maps and hosts rewrite to index.html', () => {
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    scripts: { build: string }
  }
  assert.equal(pkg.scripts.build, 'vite build && node scripts/copy-satellite-maps.mjs')
  const vercel = readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')
  const netlify = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8')
  const redirects = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8')
  assert.equal(vercel.includes('/index.html'), true)
  assert.equal(netlify.includes('/index.html'), true)
  assert.equal(netlify.includes('status = 200'), true)
  assert.match(redirects, /\/index\.html\s+200/)
})
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `pnpm exec tsx --test src/demo/hostingSource.test.ts`

Expected: FAIL，`vercel.json` 等文件不存在。

- [ ] **Step 3: 写复制脚本和托管配置**

`scripts/copy-satellite-maps.mjs`

```js
import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve('satellite-maps')
const dest = resolve('dist/satellite-maps')
if (!existsSync(src)) {
  console.error('missing satellite-maps/')
  process.exit(1)
}
if (!existsSync(resolve('dist'))) {
  console.error('missing dist/; run vite build first')
  process.exit(1)
}
rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log('copied satellite-maps to dist/satellite-maps')
```

`package.json`：

```json
"build": "vite build && node scripts/copy-satellite-maps.mjs"
```

`vercel.json`：

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

`netlify.toml`：

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

`public/_redirects`：

```text
/*    /index.html   200
```

- [ ] **Step 4: 运行测试并量一下专题图体积**

Run: `pnpm exec tsx --test src/demo/hostingSource.test.ts`

Expected: PASS。

Run（PowerShell）：

```powershell
Get-ChildItem satellite-maps -Recurse -File | Measure-Object -Property Length -Sum
```

Expected: 打印 `Sum`。记下字节数。复制步骤不因体积跳过；专题图不在 `dist` 里时，相关数据页的 `/satellite-maps/` 图片会 404。

- [ ] **Step 5: 提交**

```powershell
git add scripts/copy-satellite-maps.mjs package.json vercel.json netlify.toml public/_redirects src/demo/hostingSource.test.ts
git commit -m "feat: publish satellite maps and SPA fallbacks"
```

---

### Task 9: 上线前扫描脚本

**Files:**
- Create: `scripts/check-static-site.mjs`
- Modify: `package.json` 增加 `"check:static": "node scripts/check-static-site.mjs"`

**Interfaces:**
- Consumes: Task 5 的禁用词表
- Produces: 退出码 0 表示通过。扫描 `index.html`、`README.md`、`src`、`public`，若存在 `dist` 也扫描。文本扩展名：`.html` `.js` `.css` `.json` `.svg` `.txt` `.vue` `.ts` `.md` `.srt`。跳过 `*.test.ts`。跳过 `.jpg` `.jpeg` `.png` `.webp` `.mp4`。
- `src`、`public`、`dist`、`index.html` 额外禁止连续字符串 `localhost` 和 `127.0.0.1`。`README.md` 不查这两项，开发说明仍可写本机调试。
- `dist` 里的 `.js` 若包含 `baseURL:"/api"`、`baseURL: "/api"` 或 `baseURL:'/api'`，失败。
- `--require-video` 时要求 `public/demo/analysis.mp4` 和 `dist/demo/analysis.mp4` 都存在，且每个文件大小在 1 字节到 40 MiB（`40 * 1024 * 1024`）之间。

脚本源码里的禁用词用数组 `join` 拼出来，避免脚本把自己扫进去。不要把 `docs/` 列进扫描根。`src/mock/` 是已停用的 json-server 入口，不会进 `dist/`，扫描时跳过路径分段 `mock`。

- [ ] **Step 1: 写脚本**

`scripts/check-static-site.mjs`

```js
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const textExt = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt', '.vue', '.ts', '.md', '.srt'])
const requireVideo = process.argv.includes('--require-video')
const words = [
  ['www.', 'dizhongkeji', '.cn'].join(''),
  ['82.157', '.234', '.123'].join(''),
  ['河北', '地质', '大学'].join(''),
  ['坤灵智巡', '创工队'].join(''),
  ['信息', '工程学院'].join(''),
  ['hgu', '.edu', '.cn'].join(''),
  ['kunling', '-smart'].join(''),
  ['指导', '教师'].join(''),
  ['刘兴', '冉'].join(''),
  ['孙丞', '淼'].join(''),
  ['中国', '科学院'].join(''),
  ['西北', '农林'].join(''),
  ['98', '.99'].join(''),
  'mAP'
]
const loopback = ['localhost', ['127', '.0', '.0', '.1'].join('')]
const pageRoots = ['index.html', 'src', 'public']
if (existsSync('dist')) pageRoots.push('dist')
const roots = ['README.md', ...pageRoots]
const hits = []

function walk(path) {
  if (!existsSync(path)) return
  const stat = statSync(path)
  if (stat.isDirectory()) {
    for (const name of readdirSync(path)) walk(join(path, name))
    return
  }
  if (path.endsWith('.test.ts')) return
  if (path.split(/[/\\]/).includes('mock')) return
  if (!textExt.has(extname(path))) return
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  const banned = path === 'README.md' || path.startsWith('README.md') ? words : words.concat(loopback)
  lines.forEach((line, index) => {
    for (const word of banned) {
      if (line.includes(word)) hits.push(`${path}:${index + 1}: ${word}`)
    }
    if (path.endsWith('.js') && path.startsWith('dist')) {
      if (line.includes('baseURL:"/api"') || line.includes('baseURL: "/api"') || line.includes("baseURL:'/api'")) {
        hits.push(`${path}:${index + 1}: live api baseURL`)
      }
    }
  })
}

for (const root of roots) walk(root)

if (requireVideo) {
  const limit = 40 * 1024 * 1024
  for (const file of ['public/demo/analysis.mp4', 'dist/demo/analysis.mp4']) {
    if (!existsSync(file)) {
      hits.push(`${file}: missing`)
      continue
    }
    const size = statSync(file).size
    if (size < 1 || size > limit) hits.push(`${file}: size ${size}`)
  }
}

if (hits.length) {
  console.error(hits.join('\n'))
  process.exit(1)
}
console.log('static site check ok')
```

`README.md` 不查 `localhost` 和 `127.0.0.1`。`src`、`public`、`dist`、`index.html` 要查。禁用词用 `join` 拼出来。不要扫描 `docs/`。

- [ ] **Step 2: 运行扫描**

Run: `pnpm check:static`

Expected: 打印 `static site check ok`，退出码 0。此时还没有 mp4，不要加 `--require-video`。

若失败，修的是 `src/`、`index.html`、`README.md` 或 `public/` 里的命中，不要把扫描脚本改成忽略这些目录。

- [ ] **Step 3: 提交**

```powershell
git add scripts/check-static-site.mjs package.json
git commit -m "feat: check the static site for retired hosts and school names"
```

---

### Task 10: 从本机 Flask 导出已经算好的演示快照

**Files:**
- Create: `scripts/export-demo-snapshot.mjs`
- Modify: `package.json` 增加 `"export:snapshot": "node scripts/export-demo-snapshot.mjs"`
- Modify: `src/demo/snapshot.ts`（只在导出成功时由脚本覆盖业务集合）

**Interfaces:**
- Consumes: 本机 `http://127.0.0.1:5000` 上已经跑过规则链的 Flask。直接请求 Flask 路径，不经过 Vite：
  - `GET /monitorPoints`、`/weatherReadings`、`/alerts`、`/weatherForecast`、`/extremeEvents`、`/pestRiskPredictions`、`/notifications`、`/droneMissions`、`/fields`、`/ndviLayers`、`/moistureLayers`、`/reports/daily`
  - 对每个监测点 `GET /field-sensors/{id}/readings` 和 `GET /field-sensors/{id}/thresholds`
  - `GET /api/analysis/recent?limit=20`
- Produces: 重写 `src/demo/snapshot.ts`，保留 `DemoSnapshot` 类型、`chainCoverage`、`forecastFor` 可以删除（数据改为字面量）。`modelInfo` 不读接口，读 `ml-bjj/models/pest-cls-meta.json`。若 `classes.length !== 23` 或 `(best_val_acc * 100).toFixed(2) !== '94.05'`，脚本退出码 1，不写文件。
- 写完后再次执行 `chainCoverage` 同款检查：三个县名、`region === 'jjj'`、墒情链、极端天气链、虫情草稿、雄县至少 7 条预报。任一为假则退出码 1，并留下导出前的 `snapshot.ts`（先写临时文件，检查通过再替换）。

这一任务依赖本机数据库里已经有这批演示结果。若 Flask 没开，脚本打印 `start python ml-bjj/serving/app.py first` 并退出码 1。不要在静态站里改去调用 `evaluate-all`。

- [ ] **Step 1: 启动本机后端并确认模型**

PowerShell，仓库根目录：

```powershell
ml-bjj\.venv\Scripts\Activate.ps1
python ml-bjj\serving\app.py
```

Expected: 日志里有 `http://127.0.0.1:5000/`，并且模型类数为 23。权重文件是本机的 `pest-cls-best.pt`，不要提交它。

另开终端，让规则链至少写出三条里能看懂的记录。现有调度在进程内每 60 秒跑一轮；若当前库里还没有雄县墒情、极端天气预警和虫情草稿，就在这台机器上等到一轮跑完，或按 `ml-bjj/serving/app.py` 里已经注册的评估路由在本机调用一次 `POST /alerts/evaluate-all`、`POST /weather/extreme-events/evaluate`、`POST /pest-risk/evaluate`。调用目标只限于 `127.0.0.1:5000`。然后 `GET /alerts`，确认响应里同时有 `chain` 为 `env`、`extreme` 的非草稿，以及 `chain` 为 `pest` 且 `draft` 为真的记录。

- [ ] **Step 2: 写导出脚本并运行**

`scripts/export-demo-snapshot.mjs` 只替换 `src/demo/snapshot.ts` 里 `export const demoSnapshot` 到 `export function chainCoverage` 之前的那段，类型和 `chainCoverage` 保持 Task 2 的原文。

```js
import { readFileSync, writeFileSync } from 'node:fs'

const base = 'http://127.0.0.1:5000'
const target = 'src/demo/snapshot.ts'

async function getJson(path) {
  let res
  try {
    res = await fetch(base + path)
  } catch {
    console.error('start python ml-bjj/serving/app.py first')
    process.exit(1)
  }
  if (!res.ok) {
    console.error(`${path} ${res.status}`)
    process.exit(1)
  }
  return res.json()
}

const meta = JSON.parse(readFileSync('ml-bjj/models/pest-cls-meta.json', 'utf8'))
if (!Array.isArray(meta.classes) || meta.classes.length !== 23) {
  console.error('classes_count is not 23')
  process.exit(1)
}
if ((Number(meta.best_val_acc) * 100).toFixed(2) !== '94.05') {
  console.error('displayed accuracy is not 94.05')
  process.exit(1)
}

const monitorPoints = await getJson('/monitorPoints')
const sensorReadings = []
const thresholds = []
for (const point of monitorPoints) {
  sensorReadings.push(...(await getJson(`/field-sensors/${point.id}/readings`)))
  thresholds.push(await getJson(`/field-sensors/${point.id}/thresholds`))
}
const daily = await getJson('/reports/daily')
const recent = await getJson('/api/analysis/recent?limit=20')
const snapshot = {
  monitorPoints,
  weatherReadings: await getJson('/weatherReadings'),
  alerts: await getJson('/alerts'),
  weatherForecast: await getJson('/weatherForecast'),
  extremeEvents: await getJson('/extremeEvents'),
  pestRiskPredictions: await getJson('/pestRiskPredictions'),
  notifications: await getJson('/notifications'),
  droneMissions: await getJson('/droneMissions'),
  fields: await getJson('/fields'),
  ndviLayers: await getJson('/ndviLayers'),
  moistureLayers: await getJson('/moistureLayers'),
  sensorReadings,
  thresholds,
  dailyReportMarkdown: daily.markdown ?? '',
  analysisRecords: recent.records ?? [],
  analysisStats: { byLabel: [] },
  modelInfo: { classes_count: meta.classes.length, best_val_acc: meta.best_val_acc }
}

const original = readFileSync(target, 'utf8')
const start = original.indexOf('export const demoSnapshot')
const end = original.indexOf('export function chainCoverage')
if (start < 0 || end < 0 || end <= start) {
  console.error('snapshot.ts is missing demoSnapshot or chainCoverage')
  process.exit(1)
}
const next =
  original.slice(0, start) +
  `export const demoSnapshot: DemoSnapshot = ${JSON.stringify(snapshot, null, 2)}\n\n` +
  original.slice(end)
writeFileSync(target, next)
console.log('wrote', target)
```

写完后用现有测试做链检查，不要在覆盖前删掉 `chainCoverage`。

Run: `pnpm export:snapshot`

Expected: 退出码 0。

Run: `pnpm exec tsx --test src/demo/staticHttp.test.ts`

Expected: PASS。若失败，说明本机库还没有三条链或雄县不在 `jjj`。把本机演示数据补到能通过测试再导出。不要把测试改成接受缺链的快照。

Run: `pnpm exec vue-tsc --noEmit -p tsconfig.app.json`

Expected: 退出码 0。Flask 行里的 `chain` 必须是 `env`、`extreme` 或 `pest` 之一；缺了就会在这里报错。

- [ ] **Step 3: 提交**

```powershell
git add scripts/export-demo-snapshot.mjs package.json src/demo/snapshot.ts
git commit -m "feat: export the local demo snapshot into the static build"
```

---

### Task 11: 录制并压到站点里的识病与规则链视频

**Files:**
- Create: `public/demo/analysis.mp4`

**Interfaces:**
- Consumes: Task 5 已合并（画面里不能有校名）。本地 `pnpm dev` 加 Flask，不是生产构建。生产构建的智能分析页没有上传按钮。
- Produces: `public/demo/analysis.mp4`，H.264，`+faststart`，体积不超过 40 MiB，时长约 2–3 分钟。画面含：预警列表里的雄县墒情、极端天气、虫情草稿及「确认发布」、智慧决策里的处置建议、智能分析里上传后的病名与置信度。字幕说明 23 类、验证集准确率 94.05%、无独立测试集、不是田间准确率。

- [ ] **Step 1: 用开发服务器录**

终端 1 保持 Task 10 的 Flask。终端 2：

```powershell
pnpm dev
```

打开 `http://127.0.0.1:5173`。用手机号 `13800000000`、验证码 `2026`、角色农技员进入。区域选京津冀。

样例图用训练 `pest-cls-best.pt` 的那套小麦、玉米、番茄、水稻图片，每种一张。这套图片不在 Git 里。不要换一张网图再手写一个和模型输出不一致的病名。

镜头顺序：

1. 灾害预警：雄县土壤湿度自动预警、极端天气预警。打开「含草稿」，看到栾城虫情草稿，点「确认发布」。
2. 智慧决策：点开墒情或极端天气，画面上有处置建议。
3. 相关数据：雄县 7 日预报。
4. 智能分析：上传一张样例，停在病名、置信度和 top-3。
5. 字幕全程不要出现校名、指导教师、学院、已停用域名或 IP。

- [ ] **Step 2: 压缩**

```powershell
ffmpeg -i raw.mp4 -vf scale=1280:-2 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 96k -movflags +faststart public/demo/analysis.mp4
```

Expected: 生成 `public/demo/analysis.mp4`。若仍大于 40 MiB，把 `-crf 28` 改成 `-crf 32` 再压一次，覆盖同一路径。

- [ ] **Step 3: 看一遍成片**

播放 `public/demo/analysis.mp4`。确认能出声或有字幕、病名与画面一致、没有校名和已停用地址。若有 `public/demo/analysis.srt`，下一任务的扫描会读它。

- [ ] **Step 4: 提交**

```powershell
git add public/demo/analysis.mp4
git commit -m "feat: add the contest demo recording"
```

只在文件不超过 40 MiB 时提交。不要提交 `raw.mp4` 或权重。

---

### Task 12: 构建并用评委路径核对

**Files:**
- 无新源文件。核对 `dist/`。

**Interfaces:**
- Consumes: Task 1–11
- Produces: `dist/` 能被静态托管打开。`pnpm check:static -- --require-video` 通过。下面的手工路径每一条都成立。

- [ ] **Step 1: 构建**

Run: `pnpm build`

Expected: `vite build` 成功，随后打印 `copied satellite-maps to dist/satellite-maps`。`dist/index.html`、`dist/demo/analysis.mp4`、`dist/satellite-maps/` 都存在。

- [ ] **Step 2: 扫描产物**

Run: `pnpm exec node scripts/check-static-site.mjs --require-video`

Expected: `static site check ok`。

Run: `pnpm exec tsx --test src/demo/copy.test.ts src/demo/staticHttp.test.ts src/demo/httpEntry.test.ts src/demo/session.test.ts src/demo/blindSource.test.ts src/demo/footerSource.test.ts src/demo/pageSource.test.ts src/demo/hostingSource.test.ts`

Expected: 全部 PASS。

- [ ] **Step 3: 用预览站走评委路径**

Run: `pnpm preview`

在浏览器打开预览地址（Vite 会打印，默认端口 4173）。开发者工具网络面板里确认：

- 没有发往 `/api` 的请求
- 没有发往已停用域名、已停用 IP、`localhost`、`127.0.0.1` 的请求
- 底图请求高德或 CARTO 可以出现

页面路径：

| 路径 | 期望 |
|---|---|
| `/` | 进入首页，不出现登录失败。区域是京津冀。 |
| `/warnings` | 看得到雄县墒情预警和极端天气预警。打开「含草稿」后看得到虫情草稿。页面有规则链说明。 |
| `/decision` | 能点开一条预警并看到处置建议。 |
| `/related-data` | 默认雄县有 7 日预报。专题图地址以 `/satellite-maps/` 开头且返回 200。 |
| `/map` | 地图上有雄县、河间、栾城。 |
| `/analysis` | 视频能播放。有识病说明和 94.05% / 23 类。没有上传控件。 |
| `/about` | 没有学校名、指导教师、学校邮箱。 |
| `/warnings` 刷新深链 | 刷新后仍是预警页，不是宿主的 404。 |

页脚在这些页面都能看到演示声明。

再用手机流量打开同一预览地址，或部署后的 https 地址，重复 `/analysis` 的播放和 `/warnings` 的三条结果。流量下视频应能开始播放。

- [ ] **Step 4: 部署**

把 `dist/` 部署到 Vercel（`vercel.json` 的 `outputDirectory` 是 `dist`，`buildCommand` 是 `pnpm build`）。拿到 `https://*.vercel.app` 链接后，只把这个新链接写进赛程材料。不要把本机地址、穿透域名或已停用地址写进去。不要部署到 Netlify。

部署完成后用手机流量再打开一次新链接，重复 Step 3 的表。

- [ ] **Step 5: 答辩当天**

答辩机器提前开机。同一套 Flask 和 `pest-cls-best.pt` 要能上传识病，规则链要能写出一条和预警页对得上的记录。评委若要看过程，在这台机器上演示；看不了就播放静态站上的同一段视频。不要把这台机器的地址交给评委。

---

## Spec coverage

| 规格 | 任务 |
|---|---|
| 境外静态主入口，不备案，不穿透，不租 GPU | Global Constraints，Task 8、Task 12 |
| 停用两个旧地址 | Task 5、Task 9、Task 12 |
| 地图、监测、预警、决策、相关数据不请求 Flask | Task 2、Task 3、Task 4 |
| 三条规则链都能点到 | Task 2、Task 7、Task 10、Task 12 |
| 识病改为录像，准确率 94.05% / 23 类 | Task 1、Task 7、Task 11 |
| 双盲：校名、指导教师、学校邮箱 | Task 5、Task 9 |
| 页脚声明 | Task 1、Task 6 |
| SPA 回落 | Task 8、Task 12 |
| 本地 Flask 只用于录像和答辩 | Task 10、Task 11、Task 12 Step 5 |
| 遥感专题图在静态托管上仍可打开 | Task 8 |
| 上线前 8 项检查 | Task 9 加 Task 12 的表 |
