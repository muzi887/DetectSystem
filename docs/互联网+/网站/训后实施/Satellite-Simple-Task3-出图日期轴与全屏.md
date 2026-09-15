# Satellite-Simple Task 3：四类出图日期轴 + 全屏看图

> 对应方案：[卫星遥感-简单版方案.md](../页面/卫星遥感-简单版方案.md) 实施顺序第 3 步  
> 状态：✅ 已完成（`pnpm exec tsx --test src/utils/satelliteThematic.test.ts`、`vue-tsc --noEmit` 通过）

## 子任务解释

把 `docs/出图/` 里干旱 / 高温 / 暴雨 / 大风的竖版专题图接到卫星页。日期下拉只列出**有文件的日期**；「1–8 月汇总」单独一项。点「全屏看图」铺满弹窗看 JPG，不把竖图缩小叠到 Leaflet 上。

出图合计约 941 MB，**不拷进 `public/`**。开发时由 Vite 中间件把 `/satellite-maps/` 映射到 `docs/出图/`。清单是小 JSON。

文件名规则（年份按 2025）：

| 文件名 | 结果 |
|--------|------|
| `1.5.jpg` | `2025-01-05` |
| `高温7.08.jpg` | `2025-07-08` |
| `2025-06-03 高温.jpg` | `2025-06-03` |
| `xindafeng.jpg` | 汇总 |
| `mmexport….jpg` | 忽略 |

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`src/utils/satelliteThematic.ts`](../../../../src/utils/satelliteThematic.ts) | 解析文件名、查日期与 URL |
| 新增 | [`src/utils/satelliteThematic.test.ts`](../../../../src/utils/satelliteThematic.test.ts) | 解析与清单单测 |
| 新增 | [`scripts/build-satellite-catalog.ts`](../../../../scripts/build-satellite-catalog.ts) | 扫描出图，写 catalog |
| 新增 | [`public/satellite/catalog.json`](../../../../public/satellite/catalog.json) | 四类日期与 URL |
| 修改 | [`vite.config.ts`](../../../../vite.config.ts) | 开发/preview 提供 `/satellite-maps/` |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 类型按钮、日期下拉、全屏弹窗 |

## 代码内容

解析单日图：

```ts
const md = base.match(/(?:高温)?(\d{1,2})\.(\d{1,2})$/)
// → 2025-01-05
```

生成清单：

```bash
pnpm exec tsx scripts/build-satellite-catalog.ts
# drought 97 / heat 63 / rain 18 / wind 65
```

卫星页顶栏（底图仍是墒情 Leaflet）：

```vue
<button
  v-for="item in satelliteTypes"
  :class="{ 'active-type-btn': selectedSatelliteType === item.key }"
  @click="syncSatelliteSelection(item.key)">
  {{ item.label }}
</button>
<a-select v-model:value="selectedSatelliteId" :options="satelliteDateOptions" show-search />
<button :disabled="!currentSatelliteItem" @click="satelliteViewerOpen = true">
  全屏看图
</button>
```

大风 2025-01-05 对应 URL：`/satellite-maps/大风/1月(1)/1.5.jpg`（catalog 里已 encode）。无选中项时按钮禁用，不会打开空白大图。Esc 关弹窗（Ant Modal）。

## 验证

```text
pnpm exec tsx --test src/utils/satelliteThematic.test.ts
pnpm exec vue-tsc --noEmit
```

改了 `vite.config.ts` 后需**重启** `pnpm dev`。然后：相关数据 → 卫星遥感 → 大风 → 日期选 `2025-01-05` → 全屏看图。
