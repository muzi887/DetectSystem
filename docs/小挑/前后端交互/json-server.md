---
title:
tags:
  - 原理卡
  - Web
created: 2025-10-19
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> **json-server** = 一个基于 Node.js 的工具，能够：

- 📁 读取你的 JSON 文件
    
- 🌐 自动生成 **REST API** 服务器
    
- 🔄 提供真实的 **HTTP 接口**
    
- 💾 支持数据持久化（修改会保存回文件）

---

## 关键点
- 启动服务：npx json-server --watch mock/db.json --port 3000


---

## 代码示例

1. ✅ json-server **读取 db.json**
    
2. ✅ **自动生成完整的 [[REST]] API**
    
3. ✅ **提供 [[CRUD]] 操作端点**
    
4. ✅ **通过 HTTP 请求来操作这些接口**

---

## ❗ 易错点
- 

## 🎯用 JavaScript 而不是 TypeScript： 主要原因

### 1. **json-server 生态主要是 JS**
```javascript
const jsonServer = require('json-server')  // 这是 CommonJS 模块
```
json-server 本身是用 JS 写的，它的类型定义可能不完善，用 JS 更简单。

### 2. **快速原型开发**
```javascript
// JS - 直接运行，无需编译
node mock/server.js

// TS - 需要先编译
tsc mock/server.ts && node mock/server.js
```
Mock 服务器追求**快速启动和修改**，JS 更符合这个目标。

### 3. **简单的服务器逻辑**
```javascript
server.post('/login', (req, res) => {
  const { phone, password } = req.body  // 即使类型不对，影响也不大
  // ... 简单逻辑
})
```
Mock 服务器的逻辑通常很简单，类型安全的需求不高。
