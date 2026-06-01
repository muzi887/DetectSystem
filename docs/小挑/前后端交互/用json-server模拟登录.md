---
tags: [踩坑卡, Web, HTTP]
date: 2025-10-20
---

# 🪤踩坑卡：

## 💥问题描述
 - ❌
 - ⚠️
这是一个典型的将真实后端逻辑（登录）与 `json-server`（一个简单的假数据工具）混淆的场景。我们来一步步分析这个 404 错误，你就能豁然开朗了。

**简单来说：你的前端登录代码试图访问一个 `json-server` 根本不存在的 "登录" 接口。**

---

## 🔍排查过程
### 详细分析：为什么会这样？

#### 1. 你在控制台的测试为什么成功了？

```javascript
// 你在控制台运行的这个
const newUserResponse = await fetch('/api/users', { method: 'POST', ... });
```

这段代码成功的原因是，你向 `/api/users` 这个地址发送了一个 `POST` 请求。`json-server` 的设计就是：当你有一个 `db.json` 文件，里面有 `"users": []` 这样的顶级键时，它会自动为你创建一整套 RESTful API，其中就包括：

*   `POST /users`  (用于**创建**一个新用户)

所以，你的 `fetch` 操作是在**创建一个用户**，`json-server` 完全能理解这个操作，所以它成功了，并返回了新创建的用户 `{..., id: 2}`。

#### 2. 你的前端登录代码为什么失败了 (404 Not Found)？

```
AxiosError: Request failed with status code 404
...
at async Proxy.loginApi (http://localhost:5173/src/stores/user.ts:10:17)
at async onSubmit (http://localhost:5173/src/views/Login.vue:14:9)
```

这个错误栈告诉我们：
*   错误发生在 `Login.vue` 的 `onSubmit` 方法里。
*   它调用了 `user.ts` (你的 Pinia/Vuex store) 里的 `loginApi` 函数。
*   这个 `loginApi` 函数使用 `axios` 发送了一个请求，但服务器返回了 **404 Not Found**。

**核心问题就在这里：**

一个真实的后端，登录接口通常是 `POST /api/login` 或者 `POST /api/auth`。你的 `loginApi` 函数很可能就是这样写的，它试图去访问一个专门处理登录逻辑的接口。

但是，**`json-server` 是一个简单的假数据（Mock）服务器，它没有内置的 `/login` 或 `/auth` 接口！** 它只认识 `GET /users`, `POST /users`, `PUT /users/:id` 这些基于 `db.json` 结构的简单 CRUD 接口。

所以，当你的 `axios` 请求 `POST /api/login` 时，Vite 代理把它转发给 `json-server`，`json-server` 找了一圈，发现自己根本没有 `/login` 这个路由，于是只能礼貌地告诉你：“对不起，你找的地方不存在” —— 这就是 `404 Not Found`。

---
## ✅解决方案
### 如何用 `json-server` "模拟" 登录？

既然 `json-server` 不能真正地“登录”，我们就得换一种思路来**模拟**这个过程。登录的本质是什么？是验证用户提交的账号密码是否存在于数据库中。

我们可以利用 `json-server` 强大的查询功能来实现这一点。

**正确的模拟登录流程应该是：**

1.  前端获取用户输入的手机号和密码。
2.  前端**不是** `POST` 到 `/login`，而是 `GET` 到 `/users`，并带上查询参数，让 `json-server` 帮忙筛选。
3.  `json-server` 会根据查询参数 `phone` 和 `password` 在 `users` 数组里查找。
4.  如果找到了匹配的用户，`json-server` 会返回一个包含该用户对象的数组 `[ { ... } ]`。
5.  如果没找到，`json-server` 会返回一个空数组 `[]`。
6.  前端根据返回的数组是否为空，来判断登录是否“成功”。

### 修改你的 `loginApi` 函数

现在，请打开你的 `src/stores/user.ts` 文件，找到 `loginApi` 函数，并将其修改成下面这样：

```typescript
// 在 src/stores/user.ts 中

import http from '@/utils/http' // 确保你导入了配置好的 axios 实例

// ... 其他代码

// 假设你的 loginApi 是这样写的
// 请用下面的代码替换你原来的 loginApi 函数
async function loginApi({ phone, password }) {
  // 错误的方式（这会导致 404）:
  // const response = await http.post('/login', { phone, password });

  // 正确的、适用于 json-server 的“模拟登录”方式：
  // 1. 使用 GET 请求访问 /users 路由
  // 2. 使用 params 将手机号和密码作为查询字符串附加到 URL 后面
  //    最终请求的 URL 会是：/api/users?phone=139...&password=123
  const response = await http.get('/users', {
    params: {
      phone: phone,
      password: password
    }
  });

  // 3. 检查返回的数据。json-server 找到会返回一个数组，找不到返回空数组
  if (response.data && response.data.length > 0) {
    // 找到了匹配的用户！我们认为登录“成功”。
    const user = response.data[0]; // 取数组的第一个元素
    
    // （重要）模拟真实登录：在本地存储一个 token 或用户信息
    localStorage.setItem('token', 'fake-token-for-' + user.name); // 模拟生成 token
    localStorage.setItem('userInfo', JSON.stringify(user));

    return user; // 返回用户信息，表示成功
  } else {
    // 没找到用户，返回的是空数组。登录“失败”。
    // 抛出一个错误，让调用它的地方（比如 Login.vue）可以捕获到。
    throw new Error('手机号或密码错误');
  }
}
```

**修改完之后，你的登录流程就可以正常工作了！**

**总结一下：**

*   **`POST /users`** 是用来**创建用户**的（注册）。
*   **`GET /users?phone=...&password=...`** 是用来**查询用户**的（模拟登录）。
*   `json-server` 没有 `/login` 接口，不要再尝试访问它了。

## 🧠知识联想
- 关联概念：

