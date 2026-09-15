# Satellite-Simple Task 4：有图天数 + 跳转预警

> 对应方案：[卫星遥感-简单版方案.md](../页面/卫星遥感-简单版方案.md) 实施顺序第 4 步  
> 状态：✅ 已完成

## 子任务解释

卫星页底栏做轻量统计：当前灾害类型「有图天数」（不含 1–8 月汇总）、最近一张单日图日期；橙色标签跳转到 `/warnings`，复用已有极端天气预警列表，不在本页新做规则或大表。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/utils/satelliteThematic.ts`](../../../../src/utils/satelliteThematic.ts) | `imageDayCount` / `latestDay` |
| 修改 | [`src/utils/satelliteThematic.test.ts`](../../../../src/utils/satelliteThematic.test.ts) | 有图天数不含汇总 |
| 修改 | [`src/views/user/RelatedData.vue`](../../../../src/views/user/RelatedData.vue) | 地图下方底栏 |

## 代码内容

```ts
export function imageDayCount(catalog: SatelliteCatalog, type: SatelliteType): number {
  return catalog[type].days.length
}

export function latestDay(catalog: SatelliteCatalog, type: SatelliteType): string | null {
  const days = daysForType(catalog, type)
  return days.length ? days[days.length - 1] : null
}
```

底栏：

```vue
<div v-if="currentTab === 'satellite'" class="satellite-footer">
  <span>
    {{ satelliteTypeLabel }}有图 {{ satelliteImageDayCount }} 天
    <template v-if="satelliteLatestDay"> · 最近 {{ satelliteLatestDay }}</template>
  </span>
  <a-tag color="orange" style="cursor: pointer" @click="router.push('/warnings')">
    极端天气预警
  </a-tag>
</div>
```

大风默认 65 天有图；切类型后数字与「最近」日期跟着变。点标签进入灾害预警页。

## 验证

`pnpm exec tsx --test src/utils/satelliteThematic.test.ts` 中 `imageDayCount ignores summary` 通过。手工：卫星页底栏数字与日期下拉条数一致（不含「1–8 月汇总」）。
