---
title:
tags:
  - 原理卡
  - Web
  - HTTP
created: 2025-10-19
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> 模拟真实对象或系统的行为，用于测试和开发

---

## 关键点

|方面|Mock API|真实API|
|---|---|---|
|**数据来源**|本地JSON文件|数据库|
|**响应速度**|瞬间响应|网络延迟|
|**数据真实性**|静态测试数据|动态真实数据|
|**开发成本**|快速搭建|需要后端开发|
|**使用阶段**|开发/测试|生产环境|
### 🎪 Mock的常见形式
1. **Mock数据**——db.json
2. **Mock API**
	1. // 真实登录API（后端）POST https://api.company.com/auth/login
	2. // Mock登录API（前端模拟）  POST http://localhost:3000/login
3. **Mock函数**——测试中用
	1. const mockSendEmail = jest.fn() // 假的，只记录调用情况

### 🛠️ Mock的常见工具
1. [[json-server]]
2. Mock.js：数据生成
3. MSV：Mock Service Worker
### 完整流程（前端→mock）

1. 启动 mock：`pnpm run mock`（在另一个终端保持运行）
    
2. 启动前端：`pnpm dev`
    
3. 在登录页用 db.json 中的手机号和密码登录（例：`13800000000` / `123456`）
    
4. 成功后检查：
    
    - localStorage 是否有 `token`（DevTools → Application）
        
    - 请求头是否包含 `Authorization: Bearer mock-token-...`（Network 面板查看请求）
        
    - 访问 `http://localhost:3000/monitorPoints` 是否能拿到数据并能在 Dashboard 请求并渲染（下一步我们会把 Dashboard 请求写好）
        

学到：端到端的请求流程和调试方法（Network、Console、Storage）

---

## 代码示例

```ts
// MSV: 在浏览器层面拦截请求
rest.get('/api/users', (req, res, ctx) => {
  return res(ctx.json([...]))
})
```
### **模拟真实登录**工作流程

1. 客户端 POST /login {phone: '13800000000', password: '123456'}
   ↓
2. 服务器读取 db.json，查找匹配用户
   ↓
3. 找到用户 → 生成 token → 返回成功响应
   ↓  
4. 未找到用户 → 返回 401 错误
   ↓
5. 其他请求（如 GET /monitorPoints）交给 json-server 自动处理

---

## ❗ 易错点
- 

