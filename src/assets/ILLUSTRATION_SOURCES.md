# 项目配图与简笔插画资源说明

## 已内置（可直接使用）

| 文件 | 用途 | 许可 |
|------|------|------|
| `illustrations/agri-monitoring-line.svg` | 关于我们 · 智慧农业监测示意（传感器 / 大屏 / 无人机） | 项目自制，可自由使用 |
| `avatars/team-default.svg` | 团队成员默认头像（简笔线稿） | 项目自制 |
| `avatars/advisor-default.svg` | 指导老师默认头像 | 项目自制 |

## 推荐外部资源（简笔 / 线稿风格）

以下站点适合「作物灾害监测 / 智慧农业 / IoT」主题，使用前请阅读各站授权条款。

### 1. [unDraw](https://undraw.co/illustrations)（推荐）

- **风格**：扁平简笔矢量，可在线改主色（建议 `#4a5c43` 或 `#73d13d` 与本站一致）
- **许可**：可免费用于商业项目，无需署名（禁止批量爬取）
- **搜索关键词**：`gardening`、`growth chart`、`location search`、`mobile assistant`、`team`
- **示例页面**：[Gardening](https://undraw.co/illustration/gardening_jck1)

### 2. [The Noun Project](https://thenounproject.com/browse/icons/term/climate-smart-agriculture/)

- **风格**：线性图标（SVG/PNG），适合 Tab、功能入口、空状态
- **关键词**：climate smart agriculture、smart farm、climate monitoring
- **注意**：免费版需署名或购买授权，商用前确认许可类型

### 3. [IconScout 免费区](https://iconscout.com/free-illustrations/iot-monitoring)

- **风格**：智能农业、无人机巡田、数据大屏类插画
- **示例**：[Farmers using smart device for crop monitoring](https://iconscout.com/free-illustration/free-farmers-using-smart-device-for-crop-monitoring-illustration_4161873)
- **注意**：部分为 Premium，下载时筛选 Free

### 4. [Open Crop Icons](https://github.com/openfarmcc/open-crop-icons)（CC0）

- **风格**：作物简笔图标（番茄、小麦等），适合作物类型选择、标签
- **许可**：CC0 公共领域

### 5. [Storyset by Freepik](https://storyset.com/)（可选）

- **风格**：可微调颜色的场景插画，含农业/科技类
- **注意**：通常需署名「Designed by Freepik」或购买 Premium

## 图片压缩与 WebP

大体积位图（遥感热力图、背景图）请在本机执行：

```bash
npm install
npm run optimize-assets
```

将生成 `*.webp` 并缩小 `ndvi-heatmap.jpg`、`soil-moisture-heatmap.jpg` 宽度至 1600px。

## 团队真实头像

将成员照片放入 `src/assets/avatars/members/`，在 `About.vue` 的 `teamMembers` 中为对应成员设置 `avatar: memberXxx` 即可替换默认简笔头像。
