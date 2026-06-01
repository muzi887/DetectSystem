---
title:
tags:
  - 原理卡
  - Vue
created: 2025-11-12
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> 把运行时的数据保存到浏览器的本地存储（localStorage）里，保存后即使刷新页面或关闭再打开浏览器，这些数据仍然存在

---

## 关键点
- 
- 

---

## 代码示例

```ts
// 3. 将 token 和 userInfo 持久化到 localStorage      
 localStorage.setItem('token', token.value)       
 localStorage.setItem('userInfo', JSON.stringify(userInfo.value)) // 必须将对象字符串化     
```

`userInfo.value` 是一个对象，localStorage 只能存字符串，所以要用 `JSON.stringify` 把对象变成 JSON 字符串后保存。

---

## ❗ 易错点
- localStorage 不会自动过期（除非你手动实现过期逻辑），所以需要自己处理 token 过期/刷新。
    
- **安全性风险**：localStorage 容易被页面上的 XSS 攻击读取，所以不要把非常敏感的信息放在这里（例如长期有效的高权限 token）。更安全的方案是用服务器下发的 `HttpOnly` cookie 存 token（前端无法通过 JS 读取，从而防止被 XSS 窃取）。
    
- 如果你用的是 Vue，`token.value` / `userInfo.value` 看起来像 `ref` 的写法——这是正常的，把 `.value` 存入 localStorage 是常见做法。

