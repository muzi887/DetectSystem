# AI技术赋能下的作物灾害智慧监测预警系统

> 河北地质大学 · 坤灵智巡创工队

Web 端由**张晓琳**（信息工程学院 · 计科）完成开发与线上部署（Vue 3 + TypeScript + Vite），集成地图监测、农情数据展示、图片分析、预警管理与决策建议等模块；业务数据当前以 json-server / Flask **演示接口**为主。

**线上地址**：http://82.157.234.123:88  
**演示账号**：手机号 `13800000000`，验证码 `2026`（备用密码 `123456`）

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 首页 | 监测点数量、待处理预警、系统状态、最新预警、快捷入口 |
| 灾害实时监测 | Leaflet 地图 + 聚类；监测点弹窗可手动触发 / 标记解决 |
| 智能分析 | 上传作物图片，调用 Flask 识别并写入预警（演示级结果） |
| 灾害预警 | 预警列表、新建 / 处理 / 删除 |
| 智慧决策 | 待处理预警、区域小地图、监测数据与规则建议 |
| 相关数据 | 传感器 7 日趋势；无人机 NDVI 地图与两期对比；GIS 墒情热力图与点选查墒情；**气象 Tab 三站九类读数**（监测站下拉切换）；底部分析条随 Tab 变化；简报按钮为演示流程 |
| 关于我们 | 团队与产品说明、技术栈、联系邮箱 |

**角色说明**：合作社登录后仅可见「首页」「关于我们」；农技员 / 管理员可进入业务页面。

**界面特性（v1.0.4）**：深绿玻璃拟态 UI、Leaflet 交互遥感地图、监测点状态中文化、平板/手机响应式（汉堡抽屉导航）。

---

## 技术栈

- **前端**：Vue 3、TypeScript、Vite、Ant Design Vue、Pinia、Vue Router
- **样式**：CSS 变量（`glass-theme.css`）+ 公共卡片样式（`page-card.css`）
- **地图**：Leaflet、Leaflet.markercluster
- **图表**：ECharts
- **后端**：JSON Server（Mock REST，端口 3000）、Flask（图片分析，端口 5000）

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm（推荐）/ npm / yarn
- Python 3（仅智能分析需要）

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

```bash
pnpm run optimize-assets
```

---

## 项目结构

```
DetectSystem/
├── src/
│   ├── views/user/       # 业务页面（Home、RelatedData、Map 等）
│   ├── layouts/          # AppLayout（顶栏、导航、搜索）
│   ├── components/       # 公共组件（含 remote-sensing 地图）
│   ├── styles/           # glass-theme / page-card / leaflet-theme
│   ├── stores/           # Pinia（data、user、remoteSensing）
│   ├── api/              # API 封装
│   ├── composables/      # 组合式函数（全局搜索、监测点图层等）
│   ├── utils/            # http、monitorStatus 等
│   ├── mock/             # db.json 与 json-server 源码
│   └── assets/           # 背景、热力图、插图
├── deploy/
│   ├── api_mock/         # 线上 Mock 部署包
│   └── *.md              # 部署与排错笔记
├── server/               # Flask 图片分析
├── scripts/              # sync-mock-db、optimize-assets 等
└── docs/                 # 使用说明、学习笔记、部署文档
```

---

## 线上部署（宝塔）

| 组件 | 端口 | 服务器路径 | 托管方式 |
|------|------|------------|----------|
| Vue 前端 | 88 | `/www/wwwroot/DetectSystem/frontend/dist/` | Nginx 静态站 |
| Mock API | 3000 | `/www/wwwroot/DetectSystem/api_mock/` | 宝塔 Node 项目 |
| Flask AI | 5000 | `/www/wwwroot/DetectSystem/api_flask/` | 宝塔 Python 项目 |

**仅更新前端 UI：**

```bash
pnpm build
# 上传 dist/ 覆盖 frontend/dist/，浏览器强刷
```

**Mock 有改动时**：若只改了遥感表，可执行 `pnpm sync:mock-db` 同步 `fields` / `ndviLayers` / `moistureLayers`；若改了 `monitorPoints`、`weatherReadings`、`alerts` 等，请整体同步或上传 `src/mock/db.json` 与 `deploy/api_mock/db.json`，重启 Node 项目。

详细步骤见 [deploy/宝塔部署-不用PM2.md](deploy/宝塔部署-不用PM2.md)；故障排查见 [deploy/线上故障排查笔记.md](deploy/线上故障排查笔记.md)。

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/小挑/Intro/AI技术赋能下的作物灾害智慧监测预警系统V1.0.4使用说明书.md](docs/小挑/Intro/AI技术赋能下的作物灾害智慧监测预警系统V1.0.4使用说明书.md) | 用户操作说明（**v1.0.4**，软著主稿） |
| [docs/小挑/前端/相关数据页/P1阶段学习笔记总结.md](docs/小挑/前端/相关数据页/P1阶段学习笔记总结.md) | 相关数据页 P0/P1 交付与验收 |
| [docs/小挑/前端/相关数据页/气象Tab动态数据学习笔记.md](docs/小挑/前端/相关数据页/气象Tab动态数据学习笔记.md) | 气象 Tab 三站九项实现说明 |
| [docs/模拟数据说明.md](docs/模拟数据说明.md) | Mock、json-server、Flask 接口 |
| [deploy/宝塔部署-不用PM2.md](deploy/宝塔部署-不用PM2.md) | 线上部署 |
| [deploy/线上故障排查笔记.md](deploy/线上故障排查笔记.md) | 502 / 404 / 反代排错 |

---

## 脚本

| 脚本 | 说明 |
|------|------|
| `pnpm sync:mock-db` | 将遥感相关表从 `src/mock/db.json` 同步到 `deploy/api_mock/db.json` |
| `pnpm run optimize-assets` | 压缩 JPG 热力图并生成 WebP |
| `python scripts/add_code_to_docx.py` | 源程序导出至 Word |

---

## 许可证与联系

**开发单位**：河北地质大学 · 坤灵智巡创工队  
**联系邮箱**：kunling-smart@hgu.edu.cn
