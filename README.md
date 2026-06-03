# 青禾智匠 · 作物灾害监测预警系统

> 坤灵智巡创工队 · 河北地质大学 · 挑战杯参赛项目

Web 端由**张晓琳**（信息工程学院 · 计科）完成搭建（Vue 3 + TypeScript + Vite），集成地图监测、图片分析、预警管理与决策建议等模块；业务数据当前以 json-server / Flask 演示接口为主。

**线上地址**：http://82.157.234.123:88  
**演示账号**：`13800000000` / `123456`

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 首页 | 核心指标、系统状态汇总、最新预警、快捷入口 |
| 实时监测 | Leaflet 地图 + 聚类；监测点状态中文显示（正常 / 预警 / 严重） |
| 智能分析 | 上传作物图片，调用 Flask 接口识别并写入预警 |
| 预警中心 | 预警列表、新建 / 处理 / 删除 |
| 智慧决策 | 待处理预警、区域小地图、监测数据与规则建议 |
| 相关数据 | 传感器趋势、NDVI / 墒情热力图、气象卡片、AI 结论文案 |
| 关于我们 | 团队介绍、技术栈、项目背景 |

**界面特性（v1.0.2）**：深绿玻璃拟态 UI、统一空状态与加载态、平板/手机响应式（汉堡抽屉导航）、遥感素材 WebP 优先加载。

---

## 技术栈

- **前端**：Vue 3、TypeScript、Vite、Ant Design Vue、Pinia、Vue Router
- **样式**：CSS 变量（`glass-theme.css`）+ 公共卡片样式（`page-card.css`）
- **地图**：Leaflet、Leaflet.markercluster
- **图表**：ECharts
- **后端**：JSON Server（模拟 REST，端口 3000）、Flask（病害识别，端口 5000）

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm（推荐）/ npm / yarn
- Python 3（仅智能分析功能需要）

### 安装与启动

```bash
pnpm install

# 终端 1：前端（5173）
pnpm dev

# 终端 2：Mock API（3000）
pnpm mock

# 终端 3（可选）：Flask AI（5000）
python server/app.py
```

本地访问：http://localhost:5173

### 构建与预览

```bash
pnpm build
pnpm preview
```

### 素材优化（可选）

将大图转为 WebP、压缩遥感热力图：

```bash
pnpm run optimize-assets
```

---

## 项目结构

```
DetectSystem/
├── src/
│   ├── views/user/       # 业务页面
│   ├── layouts/          # AppLayout（顶栏、导航、搜索）
│   ├── components/       # 公共组件（如 GlassEmpty）
│   ├── styles/           # glass-theme / page-card / leaflet-theme
│   ├── stores/           # Pinia（data、user）
│   ├── api/              # API 封装
│   ├── composables/      # 组合式函数（全局搜索等）
│   ├── utils/            # 工具（http、monitorStatus）
│   ├── mock/             # 本地 Mock 数据与 json-server 源码
│   └── assets/           # 背景、热力图、插图等静态资源
├── deploy/
│   ├── api_mock/         # 线上 Mock 部署包（上传服务器）
│   ├── 宝塔部署-不用PM2.md
│   └── 线上故障排查笔记.md
├── server/               # Flask AI 服务
├── public/               # favicon 等公共静态文件
├── scripts/              # 工具脚本
└── docs/                 # 项目文档
```

---

## 线上部署（宝塔）

| 组件 | 端口 | 服务器路径 | 托管方式 |
|------|------|------------|----------|
| Vue 前端 | 88 | `/www/wwwroot/DetectSystem/frontend/dist/` | Nginx 静态站 |
| Mock API | 3000 | `/www/wwwroot/DetectSystem/api_mock/` | 宝塔 Node 项目 |
| Flask AI | 5000 | `/www/wwwroot/DetectSystem/api_flask/` | 宝塔 Python 项目 |

**仅更新前端 UI 时：**

```bash
pnpm build
# 将 dist/ 内全部文件上传覆盖 frontend/dist/
# 浏览器 Ctrl+Shift+R 强刷
```

**Mock 有改动时**：先执行 `pnpm sync:mock-db`（将 `fields` / `ndviLayers` / `moistureLayers` 同步到 `deploy/api_mock/db.json`），再上传 `deploy/api_mock/`，并在服务器 `npm install --registry=https://registry.npmjs.org`，重启 Node 项目。

详细步骤见 [deploy/宝塔部署-不用PM2.md](deploy/宝塔部署-不用PM2.md)；故障排查见 [deploy/线上故障排查笔记.md](deploy/线上故障排查笔记.md)。

---

## 文档

| 文档 | 说明 |
|------|------|
| [软件使用说明书.md](软件使用说明书.md) | 面向用户的完整操作说明（v1.0.2） |
| [deploy/宝塔部署-不用PM2.md](deploy/宝塔部署-不用PM2.md) | 线上部署与恢复（宝塔 Node 项目） |
| [deploy/线上故障排查笔记.md](deploy/线上故障排查笔记.md) | 502 / 404 / 反代 / 防火墙故障对照 |
| [docs/模拟数据说明.md](docs/模拟数据说明.md) | Mock 数据、json-server、Flask 接口 |
| [docs/源程序导出实现说明.md](docs/源程序导出实现说明.md) | 源程序导出至 Word |
| [docs/作物灾害预警系统使用说明.docx](docs/作物灾害预警系统使用说明.docx) | 使用说明 Word 版（含源程序清单） |
| [docs/本次未提交修改说明.md](docs/本次未提交修改说明.md) | 工作区变更清单（开发维护用） |

---

## 脚本

| 脚本 | 说明 |
|------|------|
| `pnpm run optimize-assets` | 压缩 JPG 热力图并生成 WebP（`scripts/optimize-assets.mjs`） |
| `python scripts/add_code_to_docx.py` | 将源程序按模块导出到 Word 文档 |

---

## 许可证

本项目为 2025–2026 年「挑战杯」大学生创业计划竞赛参赛作品。

**参赛学校**：河北地质大学 &nbsp;|&nbsp; **团队**：坤灵智巡创工队
