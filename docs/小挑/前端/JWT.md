---
title: JSON Web Token
tags:
  - 原理卡
  - Vue
created: 2025-10-18
---

# 🌱原理卡：JSON Web Token

> [!NOTE] **定义**：  
> 在最主流的用于安全传递用户身份信息的[[../../../后端/八股/计算机网络/认证令牌]]形式

---

## 关键点

### 🔐 JWT 的组成结构

JWT 一共由三部分组成，用 `.` 分隔：

```
Header.Payload.Signature
```

比如👇

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsIm5hbWUiOiJKZXNzYW15biIsImV4cCI6MTcwMDAwMDAwMH0.
M5Zk2QzOHRv7pWWD0pSkv0tm2C8MEvQK0yxxkYh8ItE
```

#### 1️⃣ Header（头部）

说明**令牌的类型和加密算法**。

```json
{
  "alg": "HS256",   // 加密算法 HMAC-SHA256
  "typ": "JWT"      // 令牌类型
}
```

经过 Base64 编码后，变成第一段。

---

#### 2️⃣ Payload（载荷）

存放用户的**身份信息**和**附加声明**。

```json
{
  "userId": 1,
  "name": "Jessamyn",
  "exp": 1700000000   // 过期时间（时间戳）
}
```

⚠️ 注意：**这些信息是可见的**（只是编码，不是加密），  
所以不要放密码或敏感数据。

---

#### 3️⃣ Signature（签名）

签名 = 加密算法( header + payload + secret )

比如：

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

服务器用一个只有自己知道的 **“密钥（secret）”生成签名**，  
这样别人就无法伪造一个有效的令牌。

---

### 🧠 三、JWT 的工作流程

以登录流程为例 👇

1. **用户登录**
    
    - 前端提交账号密码到服务器。
        
2. **服务器验证**
    
    - 验证通过后，生成一个 JWT：
        
        - 包含 `userId`、`name`、`exp` 等。
            
        - 用密钥签名。
            
3. **返回 JWT**
    
    - 服务器把 JWT 返回给前端。
        
4. **前端保存**
    
    - 前端一般把 JWT 存在 `localStorage` 或 `cookie`。
        
5. **访问接口**
    
    - 每次请求时在请求头加上：
        
```http
Authorization: Bearer <token>
```
        
6. **服务器验证**
    
    - 拿到 token → 验签 → 检查是否过期。
        
    - 通过后返回数据。
        

---

### ⚙️ 四、JWT 的优点

| 优点      | 说明                               |
| ------- | -------------------------------- |
| 无状态     | 服务器**不用存用户会话**，所有信息都在 JWT 中      |
| 高扩展性    | 适合分布式、微服务架构                      |
| 通用标准    | 各语言框架都有库支持（Java、Python、Node等）    |
| 前后端分离友好 | 很适合 Vue / React + Spring Boot 项目 |

---

### ⚠️ 五、JWT 的缺点与注意事项

|问题|说明|
|---|---|
|不可撤销|一旦签发，直到过期前都有效（除非有黑名单机制）|
|安全性|不能存放敏感信息（因为Payload是明文）|
|长度较长|比 Session ID 要大，不适合频繁传输|
|过期处理|要设计好刷新机制（refresh token）|

---

## Vue + Spring Boot 示例流程

1️⃣ 用户登录  
前端发送：

```js
axios.post('/api/login', { username, password })
```

2️⃣ 后端生成 JWT（Java伪代码）：

```java
String token = Jwts.builder()
  .setSubject(username)
  .setExpiration(new Date(System.currentTimeMillis() + 3600000))
  .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
  .compact();
```

3️⃣ 返回给前端：

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

4️⃣ 前端保存并请求时附上：

```js
axios.get('/api/user', {
  headers: { Authorization: `Bearer ${token}` }
})
```

5️⃣ 后端拦截器验证：

- 验签、解析；
    
- 验证是否过期；
    
- 放行或拒绝访问。
    

---

## ❗ 易错点
- 

