---
title: Cross-Origin Resource Sharing，跨源资源共享
tags:
  - 原理卡
  - Web
  - HTTP
created: 2025-10-20
---

# 🌱原理卡：Cross-Origin Resource Sharing，跨源资源共享

> [!NOTE] **定义**：  
> 浏览器的安全机制，用于控制不同"源"之间的资源访问。

---

## 关键点
### 什么是"源"？
"源" = 协议 + 域名 + 端口，三者完全相同才是同源。

| 当前页面                    | 请求目标                        | 是否同源 | 原因                      |
| ----------------------- | --------------------------- | ---- | ----------------------- |
| `http://localhost:5173` | `http://localhost:5173/api` | ✅ 同源 | 相同协议、域名、端口              |
| `http://localhost:5173` | `http://localhost:3000`     | ❌ 跨源 | **端口不同** (5173 vs 3000) |
| `https://example.com`   | `http://example.com`        | ❌ 跨源 | 协议不同 (https vs http)    |
| `https://a.com`         | `https://b.com`             | ❌ 跨源 | 域名不同                    |

## 🚫 为什么需要 CORS？

**浏览器安全策略**：防止恶意网站窃取用户数据。

### 现实例子：
1. 你在 `evil.com` 浏览恶意网站
2. 该网站悄悄请求 `bank.com` 获取你的银行信息
3. **没有 CORS**：恶意网站能拿到你的私人数据 ❌
4. **有 CORS**：浏览器阻止这个请求 ✅

## 🔧 CORS 的工作原理

### 简单请求 vs 预检请求

#### 1. 简单请求（Simple Request）
```javascript
// 这些请求会直接发送
fetch('http://localhost:3000/monitorPoints')
```

#### 2. 预检请求（Preflight Request）
对于复杂请求（如 POST with JSON），浏览器会先发 `OPTIONS` 请求：

```http
# 1. 先发 OPTIONS 预检请求
OPTIONS /login HTTP/1.1
Origin: http://localhost:5173
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

# 2. 服务器同意后，才发真正的 POST 请求
POST /login HTTP/1.1
Origin: http://localhost:5173
Content-Type: application/json

{"phone":"13800000000","password":"123456"}
```

## 🔍 在浏览器中查看 CORS 错误

打开浏览器开发者工具 → Network 标签，你会看到：

1. **红色请求**标记为 CORS 错误
2. **Console 中错误信息**：
   ```
   Access to fetch at 'http://localhost:3000/login' from origin 'http://localhost:5173' 
   has been blocked by CORS policy
   ```
## 🛠️ 解决 CORS：代理（开发环境推荐）
[[CORS 问题和代理解决方案]]

---

## ❗ 易错点
- 

