---
title: Request failed with status code 401"
tags:
  - 原理卡
  - Vue
created: 2025-11-12
---

# 🌱原理卡：Request failed with status code 401"

> [!NOTE] **定义**：  
>`err.message` 是 Axios 自动生成的英文错误信息。表示服务器收到了登录请求，但经过验证后，认为你提供的凭据（手机号/密码）是错误的。

---

## 关键点
- 
- 

---

## 代码示例

```ts
// ... in onSubmit function ... 
} catch (err: any) { 
// 调用 message.error，传入中文提示 
message.error('登录失败，请检查手机号或密码！'); 
// 在开发者控制台，打印完整的、详细的英文错误，方便调试 
console.error('Login API request failed:', err); 
} finally { 
// ...
```

---

## ❗ 易错点
- 

