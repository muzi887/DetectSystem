# 学习笔记：地图组件「纯 props」原则（P1 架构原则一）

> **出处**：[P1阶段学习笔记总结.md](./P1阶段学习笔记总结.md) §7 原则一  
> **相关代码**：`RemoteSensingMap.vue`、`RelatedData.vue`、`stores/remoteSensing.ts`  
> **文档性质**：概念补课 + 架构说明

---

## 1. 这条原则说什么

**`RemoteSensingMap` 不读 Pinia**，所需数据都由父页面 `RelatedData.vue` 通过 **props** 传入；地图内部用 **emit** 把结果（如查墒情）还给页面。

**一句话：** 地图只负责「画」，不负责「决定画什么」。

---

## 2. 先搞懂：Pinia 和 Store 是什么

### 2.1 两个词分别指什么

| 词 | 是什么 | 打个比方 |
|----|--------|----------|
| **Store** | 全站共享的「记事本」，放很多页面、组件都要用的数据 | 班级公共公告栏 |
| **Pinia** | Vue 里用来**创建、读写** Store 的官方库（npm 包） | 公告栏的管理系统 |

**三句话背下来：**

1. **Store** = 放公共数据的地方。  
2. **Pinia** = 写 Store、用 Store 的工具。  
3. 不是不用 Store，而是要想清楚：**谁直接去翻记事本，谁等别人转告**。

store：页面之间共享状态，刷新后丢失。

### 2.2 和组件里 `ref` 的区别

| | 存在哪 | 谁用 |
|--|--------|------|
| 组件里的 `ref` | 写在某个 `.vue` 里 |  mostly 这个组件自己（如 `lastMoistureQuery`） |
| Store 里的数据 | `src/stores/*.ts` | 多个组件读**同一份**（如当前选的地块） |

### 2.3 本项目里 Pinia 相关文件

```text
src/main.ts                    ← createPinia()，App 启动时注册一次
src/stores/
  remoteSensing.ts             ← 地块、NDVI/墒情日期、对比开关/透明度（P1 常用）
  data.ts                      ← 监测点、预警
  user.ts                      ← 登录、token
```

组件里这样就是在用 Pinia：

```typescript
import { useRemoteSensingStore } from '@/stores/remoteSensing'

const remoteStore = useRemoteSensingStore()
// remoteStore.compareEnabled、selectedFieldId …
```

`node_modules/pinia` 是依赖包本身，一般不用改；**平时说的「Store 文件」指 `src/stores/` 下这几个 `.ts`**。

---

## 3. 数据怎么流（原则一的全景）

```text
Store（记事本）
  compareEnabled、compareOpacity、selectedFieldId …
       ↓
RelatedData（页面：看当前 Tab，从 Store 算出地图要的参数）
       ↓ props
RemoteSensingMap（地图：有 URL 就贴图，有 compare 就叠第二层）
       ↓ emit（如 moistureQuery）
RelatedData（存 lastMoistureQuery → 更新 AI / caption）
```

父组件传参（节选）：

```vue
<RemoteSensingMap
  :compare-image-url="ndviCompareImageUrl"
  :compare-opacity="remoteStore.compareOpacity"
  :show-monitor-points="currentTab === 'gis'"
  :monitor-points="dataStore.monitorPoints"
  @moisture-query="onMoistureQuery"
/>
```

地图**不知道**「河间」「对比历史」这些业务词，只知道：

- 主图 `imageUrl` / `bounds`
- 有没有 `compareImageUrl`、透明度多少
- 要不要画监测点、能不能点击查墒情

---

## 4. 谁读 Store，谁不读

| 模块 | 读 Store？ | 为什么 |
|------|------------|--------|
| `NdviLayerControls.vue` | ✅ | 开关、下拉和 Store 字段一一对应 |
| `RelatedData.vue` | ✅ | 拼副标题、AI，并把 Store 转成地图 props |
| `RemoteSensingMap.vue` | ❌ | 无人机 / GIS 共用；只收 props，好复用、好测 |

---

## 5. 为什么不让地图里 `useRemoteSensingStore()`？

技术上可以，但地图里容易写成：

```text
if 无人机 Tab → 读 NDVI
if GIS Tab → 读墒情
if 开了对比 → 再读对比日期 …
```

地图就和「相关数据页」**绑死**了。

现在的分工：

| 角色 | 干什么 |
|------|--------|
| **Store** | 记用户选了什么 |
| **RelatedData** | 按 Tab 把 Store 翻译成地图能懂的 props |
| **地图** | 画图、点击查墒情、`emit` 结果；不写 AI |

### 人话版

> Store 是账本，RelatedData 是会计，地图是画图的人。会计看账本算好数，用 props 告诉画图的人画啥；画图的人不用翻账本。查墒情结果用 `emit` 还给会计，会计再去更新 AI。

db.json（Mock）
  → 监测点坐标、soilMoisture、NDVI 图层配置
  → 通过 API / json-server 给前端
Pinia Store（remoteSensing）
  → 用户当前选了哪块地、哪期影像、对比开没开
  → 只在这次打开网页期间有用，方便多个组件同步
RelatedData 里的 lastMoistureQuery（ref）
  → 最近一次点击查墒情的结果
  → 甚至只给这一个页面用，都没放进 Store

查墒情时：

真正算墒情的数据来自 db.json 里的监测点（经 Mock API）
用户选了什么、AI 写什么放在 Store / 页面 ref 里

---

## 6. 和 P1 分阶段开发的关系

| 阶段 | 做了什么 |
|------|----------|
| P1-2 | 地图先支持 `compareImageUrl` 等 **props** |
| P1-3 | **Store** 里加 `compareEnabled` 等状态 |
| P1-5 | 地图加 `enableMoistureQuery`，页面传开关 |

Store 或业务变的时候，往往只改 `RelatedData` 怎么传 props，**不必改地图内部**，每次改动范围更小。

---

## 7. 延伸阅读

- [P1-5学习笔记 §5.0](./P1-5学习笔记.md#50-vue-template-与-script-如何连接) — template / script / emit 怎么连  
- [P1-2学习笔记 §6](./P1-2学习笔记.md#6-remotesensingmapvue-核心实现) — 双 overlay 与 props 设计  
- [P1-3学习笔记](./P1-3学习笔记.md) — Store 对比状态  

---

*文档版本：v1.0 · 地图纯 props + Pinia/Store 补课 · 2026-06-05*
