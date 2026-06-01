---
title: Representational State Transfer（表现层状态转换）
tags:
  - 原理卡
  - Web
created: 2025-10-19
---

# 🌱原理卡：Representational State Transfer（表现层状态转换）

> [!NOTE] **定义**：  
> 一种API设计风格，不是具体技术 ，规定如何通过HTTP协议操作网络资源 ，让前后端用统一的"语言"交流

- ✅ 是**规则**：怎么组织API地址，用什么HTTP方法
    
- ✅ 关注**格式**：URL设计、状态码、数据格式

---

## 关键点

 1. 每个资源都有唯一地址
	- /users        // 用户资源
	- /products     // 商品资源
	- /orders       // 订单资源

2. 通过HTTP方法区分操作
	- GET /users       // 获取用户列表
	- POST /users      // 创建新用户  
	- PUT /users/1     // 更新用户1
	- DELETE /users/1  // 删除用户1


---

## 代码示例
### 命令行测试 REST 接口

```bash
# 启动 Mock 服务器
pnpm run mock

# 在另一个终端启动开发服务器
pnpm run dev
```
#### 打开新的终端窗口，执行：
[[curl命令解析json错误]]
```bash
Add-Type -AssemblyName System.Net.Http
# 使用 System.Net.Http.HttpClient，可靠地拿到状态码和响应体（即使是 401/400）
$uri = 'http://localhost:3000/login'
$payload = @{ phone = '13800000000'; password = '123456' } | ConvertTo-Json

$client = [System.Net.Http.HttpClient]::new()
$content = [System.Net.Http.StringContent]::new($payload, [System.Text.Encoding]::UTF8, 'application/json')

# 同步等待（脚本里方便）
$response = $client.PostAsync($uri, $content).Result

$status = [int]$response.StatusCode
$body = $response.Content.ReadAsStringAsync().Result

Write-Output "Status: $status"
Write-Output "Body: $body"
```
#### 预期成功响应：
```json
Status: 200
Body: {
  "token": "mock-token-1760923718902",
  "user": {
    "id": 1,
    "name": "测试用户",
    "phone": "13800000000",
    "role": "user"
  }
}
```
#### 预期错误响应：
```json
Status: 401
Body: {
  "message": "手机号或密码错误"
}
```

```powershell
POST /login 401 1.561 ms - 43
POST /login 401 2.504 ms - 43
POST /login 200 1.790 ms - 146
POST /login 401 1.710 ms - 43
POST /login 401 1.313 ms - 43
POST /login 401 1.976 ms - 43
POST /login 401 9.123 ms - 43
POST /login 401 1.523 ms - 43
POST /login 200 1.703 ms - 146
```
### 关闭 Mock 服务器


---

## ❗ 易错点
- 

