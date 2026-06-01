---
title:
tags:
  - 原理卡
  - HTTP
  - 客户端
created: 2025-10-19
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> 一个基于 Promise 的 HTTP 客户端，用于浏览器和 Node.js

---

## 关键点
### 🔧 核心功能

1. **发送 HTTP 请求**
2. **处理响应数据**
### Axios 的优势：

1. **✅ 自动 JSON 转换**：不需要手动 `response.json()`
    
2. **✅ 更好的错误处理**：HTTP 错误状态自动 reject
    
3. **✅ 请求/响应拦截器**：统一处理认证、错误等
    
4. **✅ 取消请求**：可以取消进行中的请求
    
5. **✅ 浏览器兼容**：支持旧版浏览器
    
6. **✅ 进度监控**：支持上传/下载进度

### 🔄 完整的工作流程
1. 用户点击登录
2. Axios 发送 POST 请求到 /login
3. Mock 服务器验证用户信息
4. Axios 接收响应并自动解析 JSON
5. 更新前端状态
6. 完成登录流程

### Axios基本用法
1. **axios.get() - 发起GET请求**

```ts
// 语法：axios.get(url[, config])
axios.get('/api/users', {
  params: { page: 1, limit: 10 }, // 查询参数
  headers: { 'X-Custom-Header': 'value' }
})
```

2. **.then() - 处理成功响应**

```ts
.then(response => {
  console.log(response.data) // 服务器返回的数据
  console.log(response.status) // HTTP状态码，如 200
  console.log(response.headers) // 响应头
  console.log(response.config) // 请求配置
})
```

### 3. **.catch() - 处理错误**

```ts
.catch(error => {
  if (error.response) {
    // 服务器响应了错误状态码 (4xx, 5xx)
    console.log(error.response.status) // 404, 500等
    console.log(error.response.data) // 错误响应体
  } else if (error.request) {
    // 请求发出但没有收到响应
    console.log('网络错误:', error.request)
  } else {
    // 其他错误
    console.log('错误:', error.message)
  }
})
```

---

## 代码示例

```ts
// 第1步：基础使用
axios.get('/api/data')

// 第2步：添加配置
axios.get('/api/data', { params: { id: 1 } })

// 第3步：错误处理
axios.get('/api/data')
  .then(response => {})
  .catch(error => {})

// 第4步：async/await
async function getData() {
  const response = await axios.get('/api/data')
  return response.data
}
```

---

## ❗ 易错点
- 

|特性|Axios|fetch|jQuery.ajax|
|---|---|---|---|
|**JSON 转换**|自动|手动|自动|
|**错误处理**|智能|基础|智能|
|**拦截器**|支持|不支持|支持|
|**取消请求**|支持|支持|支持|
|**包大小**|小|内置|大|