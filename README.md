# AI 技术赋能下的作物灾害智慧监测预警系统

> 青禾智匠 · 坤灵智巡 —— AI 守麦田，数据护粮仓

基于 Vue 3 + TypeScript + Vite 构建的作物灾害智慧监测预警系统，集成地图可视化、智能分析、预警管理、决策支持等功能。

---

## 功能概览

| 模块 | 说明 |
|------|------|
| 首页 | 核心指标概览、最新预警动态、快捷入口 |
| 实时监测 | 地图展示监测点分布，Leaflet + 聚类标记 |
| 智能分析 | 上传作物图片，AI 病害识别（对接 Flask 后端） |
| 预警中心 | 预警列表、新建/处理/删除预警 |
| 智慧决策 | 待处理预警、区域概览、决策建议 |
| 相关数据 | 传感器/无人机/气象等多源数据展示 |
| 关于我们 | 团队介绍、技术栈、项目背景 |

---

## 技术栈

- **前端**：Vue 3、TypeScript、Vite、Ant Design Vue、Pinia、Vue Router
- **地图**：Leaflet、Leaflet.markercluster
- **图表**：ECharts
- **后端**：JSON Server（模拟 REST）、Flask（病害识别 AI 接口）

---

## 快速开始

### 前置要求

- Node.js 18+
- pnpm / npm / yarn

### 安装依赖

```bash
pnpm install
# 或
npm install
```

### 启动开发环境

开发时需要同时启动：

1. **前端**（端口 5173）：
   ```bash
   pnpm dev
   ```

2. **模拟后端**（端口 3000）：
   ```bash
   pnpm mock
   ```

3. **可选**：AI 病害识别（需 Python 3，端口 5000）：
   ```bash
   python server/app.py
   ```

### 访问地址

- 前端：http://localhost:5173
- 默认跳转登录页，测试账号：`13800000000` / `123456`

### 构建

```bash
pnpm build
pnpm preview
```

---

## 项目结构

```
DetectSystem/
├── src/
│   ├── views/user/     # 页面组件（首页、地图、分析、预警等）
│   ├── layouts/       # 布局（AppLayout）
│   ├── stores/        # Pinia 状态（data、user）
│   ├── api/           # API 封装
│   ├── mock/          # JSON Server 模拟数据
│   └── router/        # 路由配置
├── server/            # Flask AI 病害识别服务
├── scripts/           # 工具脚本（add_code_to_docx.py）
└── docs/              # 文档
```

---

## 文档

| 文档 | 说明 |
|------|------|
| [docs/模拟数据说明.md](docs/模拟数据说明.md) | 模拟数据来源、Mock 后端、Flask 接口说明 |
| [docs/源程序导出实现说明.md](docs/源程序导出实现说明.md) | 源程序导出至 Word 的实现说明 |
| [docs/作物灾害预警系统使用说明.docx](docs/作物灾害预警系统使用说明.docx) | 系统使用说明（含源程序清单） |

---

## 脚本

| 脚本 | 说明 |
|------|------|
| `python scripts/add_code_to_docx.py` | 将源程序按模块导出到 Word 文档 |

---

## 许可证

本项目为 2025-2026 年「挑战杯」大学生创业计划竞赛参赛作品。

**参赛学校**：河北地质大学 &nbsp;|&nbsp; **团队**：坤灵智巡创工队
