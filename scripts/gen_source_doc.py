# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / "docs/小挑/Intro/AI技术赋能下的作物灾害智慧监测预警系统V1.0.4-源程序.md"

MODULES = [
    ("监测点状态机", "src/utils/monitorStatus.ts", "3.1.4、4.4", "监测点六态状态机与阈值推导", "typescript"),
    ("农情数据 Store", "src/stores/data.ts", "4.2、4.6", "监测点/预警/气象读数聚合与落库", "typescript"),
    ("全局农情检索", "src/composables/useGlobalSearch.ts", "3.2、4.2.2", "菜单、监测点、预警全局检索", "typescript"),
    ("地图监测点图层与 GIS 联动", "src/composables/useMonitorPointLayer.ts", "4.3.5、4.4", "地图聚类、弹窗处置、GIS 查值联动高亮", "typescript"),
    ("遥感 NDVI 两期对比", "src/stores/remoteSensing.ts", "4.3.4", "NDVI 地块切换与两期影像对比状态", "typescript"),
    ("农业业务规则引擎", "deploy/api_mock/agriMockCore.cjs", "4.3、4.7", "农情登录、NDVI 摘要、墒情趋势、灾害规则、最近站查墒情", "javascript"),
    ("农业领域接口路由", "src/mock/server.ts", "1.4、4.3", "农业领域 REST 路由注册", "typescript"),
    ("作物图像分析流水线", "server/app.py", "4.5", "作物图像预处理—特征—分类—建议流水线", "python"),
    ("相关数据页面", "src/views/user/RelatedData.vue", "4.3", "传感器/气象/遥感/GIS/AI 文案/简报多 Tab 业务界面", "vue"),
    ("智能分析页面", "src/views/user/DataAnalysis.vue", "4.5", "作物图像上传、分析类型选择与结果展示", "vue"),
    ("智慧决策页面", "src/views/user/DecisionSupport.vue", "4.7", "预警关联选择与处置建议展示", "vue"),
    ("灾害实时监测页面", "src/views/user/MapVisualization.vue", "4.4", "监测点地图渲染、弹窗处置与状态联动", "vue"),
]


def count_nonempty(path: str) -> int:
    p = root / path
    return sum(1 for line in p.read_text(encoding="utf-8").splitlines() if line.strip())


def main() -> None:
    code_lines = sum(count_nonempty(m[1]) for m in MODULES)

    header = f"""# AI技术赋能下的作物灾害智慧监测预警系统 V1.0.4 源程序

## 软件基本信息

| 项目 | 内容 |
|------|------|
| 软件全称 | AI技术赋能下的作物灾害智慧监测预警系统 |
| 软件简称 | AI作物灾害监测预警系统 |
| 版本 | 1.0.4 |
| 终端类型 | Web 浏览器访问 |
| 适用方向 | 作物灾害监测、农情数据展示、预警管理、辅助决策 |
| 开发单位 | 河北地质大学 · 坤灵智巡创工队 |
| 线上地址 | http://82.157.234.123:88 |

说明：本文件由《AI技术赋能下的作物灾害智慧监测预警系统V1.0.4使用说明书》附录 D 所列模块及对应业务页面提炼，收录源文件完整代码。说明书附录 D 为节选对照，本文件为完整源码。本文件收录有效代码约 {code_lines:,} 行。

## 源程序规模

本系统源程序采用 Vue 3 + TypeScript + JavaScript + Python 开发，统计口径为生产代码目录（前端 `src/`、图像分析服务 `server/`、业务接口 `deploy/api_mock/`），不含第三方依赖包、构建产物与演示数据文件。

| 项目 | 数值 |
|------|------|
| 源程序文件数 | 44 个 |
| 有效代码行数（非空行） | 约 6,538 行 |
| 前端有效代码 | 约 6,146 行 |
| 后端有效代码 | 约 392 行（含农业业务规则与图像分析服务） |
| 本文件收录有效代码 | 约 {code_lines:,} 行（12 个源文件） |

按开发语言分布（有效代码行）：

| 语言/类型 | 文件数 | 有效代码行 | 主要用途 |
|-----------|--------|------------|----------|
| Vue 单文件组件 | 16 | 约 4,592 行 | 登录、首页、相关数据、地图监测、智能分析、预警、决策等业务页面 |
| TypeScript | 22 | 约 1,292 行 | 状态管理、路由、地图组合逻辑、监测状态机、接口封装 |
| JavaScript | 2 | 约 272 行 | 农业领域业务规则与接口服务 |
| Python | 1 | 约 120 行 | 作物图像预处理、特征提取与分类建议 |
| 样式表（CSS） | 3 | 约 262 行 | 玻璃拟态主题、地图与页面公共样式 |

按功能模块分布（有效代码行）：

| 功能模块 | 有效代码行 | 说明 |
|----------|------------|------|
| 业务页面 | 约 3,500 行 | 七大导航模块对应的用户界面与交互 |
| 布局与公共组件 | 约 1,090 行 | 顶栏导航、全局搜索、遥感地图、空状态展示 |
| 状态与业务逻辑 | 约 1,072 行 | 监测点/预警/气象/遥感数据管理、状态机、检索 |
| 后端服务 | 约 392 行 | 登录校验、灾害规则评估、查墒情、图像分析 |

下文收录 12 个源文件之完整代码，涵盖附录 D 核心业务逻辑与说明书第四章主要业务页面，合计约 {code_lines:,} 行有效代码。

## 收录范围说明

| 原则 | 说明 |
|------|------|
| 完整收录业务代码 | 监测状态机、遥感对比、GIS 查墒情、灾害规则评估、图像分析流水线及主要业务页面 |
| 不收录通用脚手架 | 不含 Vite 配置、Axios 基础封装、标准路由守卫、Ant Design 表单样板等 |
| 与正文功能对应 | 下列各文件分别对应说明书第四章「相关数据」「灾害实时监测」「智能分析」「灾害预警」「智慧决策」 |
| 术语与正文一致 | 监测点状态机、九类农田小气候读数、NDVI 期次对比、最近站查墒情等表述与说明书统一 |

## 模块索引

| 序号 | 源文件 | 对应说明书功能 | 核心职责 |
|------|--------|----------------|----------|
"""

    index_rows = [f"| {i} | {path} | {chapter} | {duty} |" for i, (_, path, chapter, duty, _) in enumerate(MODULES, 1)]
    parts = [header + "\n".join(index_rows) + "\n"]

    for i, (title, path, chapter, _, lang) in enumerate(MODULES, 1):
        code = (root / path).read_text(encoding="utf-8").rstrip() + "\n"
        parts.append(
            f"## 模块 {i}：{title}\n"
            f"文件路径：{path}\n"
            f"对应说明书：{chapter}\n"
            f"```{lang}\n"
            f"{code}"
            f"```\n"
        )

    content = "\n".join(parts)
    out.write_text(content, encoding="utf-8")
    print(f"Wrote: {out}")
    print(f"Total md lines: {len(content.splitlines())}")
    print(f"Code non-empty lines: {code_lines}")


if __name__ == "__main__":
    main()
