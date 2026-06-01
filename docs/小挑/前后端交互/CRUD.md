---
title: Create, Read, Update, Delete
tags:
  - 原理卡
  - Web
  - 数据管理
created: 2025-10-19
---

# 🌱原理卡：Create, Read, Update, Delete

> [!NOTE] **定义**：  
> 数据管理的四个基本操作，任何涉及数据存储的系统都离不开CRUD

---

## 关键点

**CRUD是"做什么"，REST是"怎么做"**

| CRUD操作     | [[REST]]对应 | 现实例子   | HTTP方法            |
| ---------- | ---------- | ------ | ----------------- |
| **C**reate | POST       | 添加新用户  | `POST /users`     |
| **R**ead   | GET        | 查看用户列表 | `GET /users`      |
| **U**pdate | PUT/PATCH  | 修改用户信息 | `PUT /users/1`    |
| **D**elete | DELETE     | 删除用户   | `DELETE /users/1` |

### Mock CRUD 工作原理：

- **POST /alerts** → 自动生成 id，追加到数组
    
- **GET /alerts** → 返回整个数组
    
- **PUT/PATCH /alerts/1** → 更新指定 id 的对象
    
- **DELETE /alerts/1** → 删除指定 id 的对象

![[attachments/测试CRUD.png]]

---

## 代码示例

```js
// 在浏览器 Console 中执行

// 先获取 http 实例和 store
const http = await import('/src/utils/http.ts').then(m => m.default)
const userStore = await import('/src/stores/user.ts').then(m => m.useUserStore())

// 🔍 1. GET - 查询所有用户
console.log('📋 查询所有用户:')
const users = await http.get('/users')
console.log('用户列表:', users.data)

// 🆕 2. POST - 创建新用户
console.log('🆕 创建新用户:')
const newUser = await http.post('/users', {
  name: '测试用户',
  phone: '13999999999', 
  password: '123456',
  role: 'user',
  createdAt: Date.now()
})
console.log('创建的用户:', newUser.data)

// ✏️ 3. PUT - 更新用户
console.log('✏️ 更新用户:')
const updatedUser = await http.put(`/users/${newUser.data.id}`, {
  ...newUser.data,
  name: '更新后的用户名'
})
console.log('更新后的用户:', updatedUser.data)

// 🗑️ 4. DELETE - 删除用户  
console.log('🗑️ 删除用户:')
await http.delete(`/users/${newUser.data.id}`)
console.log('用户删除成功')

// 验证删除结果
const finalUsers = await http.get('/users')
console.log('最终用户列表:', finalUsers.data)
```

---

## ❗ 易错点
- 

