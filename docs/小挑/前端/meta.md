---
title:
tags:
  - 原理卡
  - Vue
created: 2025-10-19
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> 路由配置中的一个对象，用来存储任何与路由相关的自定义信息。

---

## 关键点
- 
- 

---

## 代码示例

```ts
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requireAuth: true,        // 需要登录
      title: '仪表盘',          // 页面标题
      permissions: ['admin']    // 所需权限
    }
  }
]
```

---

## ❗ 易错点
- 

