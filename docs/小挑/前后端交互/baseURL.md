---
title:
tags:
  - 原理卡
  - HTTP
  - Web
created: 2025-10-20
---

# 🌱原理卡：

> [!NOTE] **定义**：  
>  Axios 实例的**基础请求地址**，所有通过该实例发起的请求都会**自动拼接**这个基础路径。

---

## 关键点
- 避免URL重复和硬编码
- 

---

## 代码示例

```ts
const http = axios.create({
  baseURL: 'https://api.example.com/v1'
})

// 实际请求: https://api.example.com/v1/users
http.get('/users')

// 实际请求: https://api.example.com/v1/products/123
http.get('/products/123')
```

---

## ❗ 易错点
- 


