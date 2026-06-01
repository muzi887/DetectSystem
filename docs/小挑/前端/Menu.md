---
tags: [组件卡, Vue]
created: 2025-10-18
component: 导航菜单
---

# 组件卡：导航菜单

## 用途
为页面和功能提供导航的菜单列表。

## API 设计
在各个页面中进行跳转。一般分为顶部导航和侧边导航，顶部导航提供全局性的类目和功能，侧边导航提供多级结构来收纳和排列网站架构。
## 代码骨架
```vue
<template>
  <!-- TODO: 插件生成基础模板 -->
</template>

<script setup>
// props, emits 引入
</script>

<style scoped>
/* TODO: 样式 */
</style>
```

## 例子

- 使用场景：

- Menu 元素为 `ul`，因而仅支持 [`li` 以及 `script-supporting` 子元素](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element)。因而你的子节点元素应该都在 `Menu.Item` 内使用。
- Menu 需要计算节点结构，因而其子元素仅支持 `Menu.*` 以及对此进行封装的 HOC 组件。
- 必须为 SubMenu 设置唯一 key