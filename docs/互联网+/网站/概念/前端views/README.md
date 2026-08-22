# 前端 `src/views` 说明（索引）

> 本目录对应 **`src/views/user/`** 里每一个页面 `.vue`。  
> 顶栏、铃铛、区域切换在 [`src/layouts/AppLayout.vue`](../../../../../src/layouts/AppLayout.vue)，不是 views。  
> 怎么启动见 [`../../项目启动说明.md`](../../项目启动说明.md)。  
> Flask 侧对照见 [`../后端py文件/README.md`](../后端py文件/README.md)。

每篇结构相同：一句话定义、页面干什么、函数怎么接到接口/工具。不要把本目录当成路由清单或 CSS 说明。

---

## 怎么读

浏览器进哪个页，由 [`src/router`](../../../../../src/router/index.ts) 决定。页面自己 **不连 MySQL**：业务走 `/api` → Vite 去掉前缀 → [`biz.py`](../后端py文件/blueprints/biz.py.md)；识病走 [`app.py`](../后端py文件/app.py.md) 的 `/api/analysis`。

```text
浏览器
    ├─ 登录 / 首页 / 关于     →  Login / Home / About
    ├─ 相关数据 / 地图 / 预警 / 决策 →  RelatedData / Map / Warning / Decision
    └─ 智能分析（识病）       →  DataAnalysis  →  app.py /api/analysis
```

导航角色门槛（`meta.requiresRole`）：合作社能进首页、关于；农技员/管理员才能进监测、识病、预警、决策、相关数据。

| 源码 | 路由 | 说明 |
|------|------|------|
| [`user/Login.vue.md`](./user/Login.vue.md) | `/login` | 农情登录 |
| [`user/Home.vue.md`](./user/Home.vue.md) | `/home` | 首页指标与近期识别 |
| [`user/RelatedData.vue.md`](./user/RelatedData.vue.md) | `/related-data` | 地/空/天/图四 Tab |
| [`user/MapVisualization.vue.md`](./user/MapVisualization.vue.md) | `/map` | 灾害实时监测地图 |
| [`user/DataAnalysis.vue.md`](./user/DataAnalysis.vue.md) | `/analysis` | 上传叶片识病 |
| [`user/WarningSystem.vue.md`](./user/WarningSystem.vue.md) | `/warnings` | 预警列表增删改、发布草稿 |
| [`user/DecisionSupport.vue.md`](./user/DecisionSupport.vue.md) | `/decision` | 按预警给处置建议 |
| [`user/About.vue.md`](./user/About.vue.md) | `/about` | 团队与技术栈介绍 |
