---
title:
tags:
  - 原理卡
  - Web
  - JS
created: 2025-10-19
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> Node.js 的"模块打包系统"

---

## 关键点
- **CommonJS**：2009年诞生，为服务器设计的模块系统
    
- **ES Module**：2015年诞生，为现代JavaScript设计的标准

| 方面                | CommonJS                       | ES Module           |
| ----------------- | ------------------------------ | ------------------- |
| **语法**            | `require()` / `module.exports` | `import` / `export` |
|                   | 文件柜                            | 快递系统                |
| **加载方式**          | 同步加载                           | 异步加载                |
| **主要环境**          | Node.js 服务器                    | 浏览器 + 现代Node（Vite   |
| **文件扩展**          | `.js` / `.cjs`                 | `.js` / `.mjs`      |
| ** tree shaking** | 不支持                            | 支持                  |


---

## 代码示例

```js
// 导入
const jsonServer = require('json-server')
const path = require('path')

// 导出
module.exports = { someFunction }

// 或者
exports.someFunction = function() {}
```

---

## ❗ 易错点
- 

