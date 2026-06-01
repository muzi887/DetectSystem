---
tags:
  - 踩坑卡
  - Web
  - HTTP
date: 2025-10-20
---

# 🪤踩坑卡：CORS 问题和代理Proxy解决方案

## 💥问题描述

- **前端**：`http://localhost:5173`
- **Mock API**：`http://localhost:3000`

当你从前端访问 Mock API 时：
```javascript
// 这会触发 CORS 错误
fetch('http://localhost:3000/login')  // 端口不同 → 跨源请求
```
浏览器会发一个 **预检请求（OPTIONS）** 并要求服务器返回合适的 CORS 头。
## 🔍排查过程
- 代理的作用：
	- 配置代理后，前端所有以 `/api` 开头的请求都会被 Vite 开发服务器转发到 Mock 服务，浏览器看到的是同源请求。
	- Proxy 在开发时把浏览器发给 dev-server 的请求转发到你真正的 mock 后端（并可改头、改路径），所以浏览器不触发 CORS；但对前端代码/UI 它**尽量不改变表现**
### 🌐 代理工作原理

#### 配置前（有 CORS 问题）

前端请求：http://localhost:5173/login ❌
实际需要：http://localhost:3000/login
↓
浏览器阻止：跨域请求被阻止

#### 配置后（无 CORS 问题）

前端请求：http://localhost:5173/api/login ✅
Vite 代理转发：http://localhost:3000/login ✅
↓
浏览器允许：同源请求
## ✅解决方案
### 修改 vite.config.ts
```ts
// 🔥 新增代理配置
server: {
  proxy: {
	'/api': {
	  target: 'http://localhost:3000',  // 你的 mock 服务器地址
	  changeOrigin: true,               // 改变请求头中的 Origin
	  rewrite: (path) => path.replace(/^\/api/, '')  // 去掉 /api 前缀
	}
  }
}
```
说明：前端请求写 `/api/login`、`/api/monitorPoints`，Vite 会把 `/api` 转发到 `http://localhost:3000`，并去掉 `/api` 前缀。
### 🎯 立即测试
- 修改配置后，重启开发服务器
- 然后测试代理是否工作：

![[attachments/CORS问题代理方案.png]]
## 🧠知识联想
- 关联概念：开发环境代理的原理与配置（解决跨域的常见手段）

- 浏览器看到的是同源请求（origin = dev server），因此**不再触发 CORS/预检**。
    
- 请求最终到达 mock server，但**Host/Origin** 有可能被代理改写（`changeOrigin:true` 会把 `Origin/Host` 改为目标）。
    
- 你可以在 proxy 层做 **path rewrite**（例如 `/api/login` → `/login`），前端 URL 无需改动。
    
- 对于需要凭证（cookie）的场景，proxy 通常**免去了跨域 cookie 的麻烦**（不过生产仍需正确配置）。
    
- WebSocket/Server-Sent Events 需要额外配置（`ws: true`），否则不会被转发。
    
- 请求/响应 header 可以被代理修改（比如添加/删除头），所以有时候后端看到的请求并不是浏览器原样发的。
    
- 生产环境没有 proxy，部署前必须切回“真实后端地址”。