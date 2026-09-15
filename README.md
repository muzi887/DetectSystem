# AI技术赋能下的作物灾害智慧监测预警系统

> 河北地质大学 · 坤灵智巡创工队 · **V2.1.0**

Web 端由**张晓琳**（信息工程学院 · 计科）完成开发与线上部署（Vue 3 + TypeScript + Vite），集成地图监测、农情数据展示、图片分析、预警管理与决策建议等模块；业务数据由 **Flask + 云端 MySQL `detect_system`** 提供，识病同进程。

**线上地址**：http://82.157.234.123:88  
**演示账号**：手机号 `13800000000`，验证码 `2026`（备用密码 `123456`）

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 首页 | 监测点数量、待处理预警、系统状态、最新预警、快捷入口 |
| 灾害实时监测 | Leaflet 地图 + 聚类；监测点弹窗可手动触发 / 标记解决 |
| 智能分析 | 上传叶片图，选作物后调用 Flask 做 23 类识别，非健康结果写入 `[AI识别]` 预警 |
| 灾害预警 | 预警列表、新建 / 处理 / 删除；「含草稿」与虫情草稿「确认发布」 |
| 智慧决策 | 待处理预警五档筛选、区域小地图、监测数据与按类型分支的处置建议 |
| 相关数据 | 地面监测站（土壤折线，可「查看气象数据」）；无人机 NDVI 与两期对比；卫星遥感入口；GIS 墒情热力与点选查墒；简报下载监测日报 txt |
| 关于我们 | 团队与产品说明、技术栈、联系邮箱 |

**角色说明**：合作社登录后仅可见「首页」「关于我们」；农技员 / 管理员可进入业务页面。

**界面特性**：深绿玻璃拟态 UI、Leaflet 交互地图、监测点状态中文化、平板/手机响应式（汉堡抽屉导航）。

---

## 技术栈

- **前端**：Vue 3、TypeScript、Vite、Ant Design Vue、Pinia、Vue Router
- **样式**：CSS 变量（`glass-theme.css`）+ 公共卡片样式（`page-card.css`）
- **地图**：Leaflet、Leaflet.markercluster
- **图表**：ECharts
- **后端**：Flask（端口 5000，登录/预警/规则链 + 识病）、云端宝塔 MySQL `detect_system`

---

## 开发工具

本项目采用前后端分离的 Web 开发方式。前端以 Vue 3、TypeScript 编写，使用 Vite 作为构建与本地调试工具，包管理为 pnpm，界面与图表分别使用 Ant Design Vue、ECharts，地图为 Leaflet；代码规范由 ESLint、Prettier、Stylelint 辅助。后端业务与叶片识病同属一套 Python 3 环境，以 Flask 提供登录、REST 接口、规则链调度和 23 类图像识别，数据访问用 SQLAlchemy、PyMySQL，库结构变更用 Alembic；识病模型基于 PyTorch。业务数据存放在 MySQL 库 `detect_system`，可用 Navicat 等客户端维护。版本管理使用 Git；日常开发在 VS Code / Cursor 中进行，浏览器以 Chrome、Edge 调试。部署时由 Nginx 托管前端静态资源并反向代理接口，Flask 与 MySQL 在服务器上持续运行。

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm（推荐）/ npm / yarn
- Python 3.10+ 与 `ml-bjj` 虚拟环境（Flask）
- 云端 MySQL `detect_system`（设置环境变量 `DATABASE_URL`，密码不要写入仓库）

### 安装与启动

```bash
pnpm install

# 本机 PowerShell 示例（密码只放本机环境，勿提交 Git；本机连云库端口为 13306）
# $env:DATABASE_URL="mysql+pymysql://detect_system:<密码>@82.157.234.123:13306/detect_system"

# 终端 1：Flask 业务 + 识病（5000）
ml-bjj\.venv\Scripts\Activate.ps1
python ml-bjj\serving\app.py

# 终端 2：前端（5173）
pnpm dev
```

本地访问：http://localhost:5173

`pnpm mock` 已停用（会提示改走 Flask）。紧急演示才用 `pnpm mock:legacy`。更完整的环境说明见 [docs/互联网+/网站/项目启动说明.md](docs/互联网+/网站/项目启动说明.md)。

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
│   ├── mock/             # 遗留 json-server 源码（主后端已停用）
│   └── assets/           # 背景、热力图、插图
├── ml-bjj/serving/       # Flask 业务 + 识病
├── deploy/
│   ├── api_mock/         # 归档的 Mock 部署包
│   └── *.md              # 部署与排错笔记
├── scripts/              # sync-mock-db、optimize-assets、源程序导出等
└── docs/                 # 使用说明、互联网＋方案与部署文档
```

---

## 线上部署（宝塔）

| 组件 | 端口 | 服务器路径 | 托管方式 |
|------|------|------------|----------|
| Vue 前端 | 88 | `/www/wwwroot/DetectSystem/frontend/dist/` | Nginx 静态站 |
| Flask 业务+识病 | 5000 | `/www/wwwroot/DetectSystem/api_flask/` | 宝塔 Python 项目（入口 `serving/serve.py`） |
| MySQL | 3306（云上）/ 13306（本机连云） | 宝塔库 `detect_system` | 仅本机/远程开发机，不对浏览器开放 |

`deploy/api_mock/` 为归档，默认不再起 Node :3000。业务数据在 MySQL。

首次清空重传、日常发版与排错见 [docs/互联网+/部署/云服务器部署更新说明.md](docs/互联网+/部署/云服务器部署更新说明.md)。

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/互联网+/说明/AI技术赋能下的作物灾害智慧监测预警系统V2.1.0使用说明书.md](docs/互联网+/说明/AI技术赋能下的作物灾害智慧监测预警系统V2.1.0使用说明书.md) | 用户操作说明（**V2.1.0**） |
| [docs/互联网+/说明/AI技术赋能下的作物灾害智慧监测预警系统V2.1.0-源程序.md](docs/互联网+/说明/AI技术赋能下的作物灾害智慧监测预警系统V2.1.0-源程序.md) | 鉴别材料源程序（20 个模块） |
| [docs/互联网+/网站/项目启动说明.md](docs/互联网+/网站/项目启动说明.md) | 本地开发环境与端口 |
| [docs/互联网+/部署/云服务器部署更新说明.md](docs/互联网+/部署/云服务器部署更新说明.md) | 首次部署、日常更新、故障排查 |

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
