---
tags: [踩坑卡, Web, HTTP]
date: 2025-10-20
---

# 🪤踩坑卡：为什么 json-server 输出了日志，但 db.json 文件没有改变？

## 💥问题描述
 - ❌  json-server 输出了日志，但 db.json 文件没有改变？
 - ⚠️  只看到 `Promise {<pending>}`

## 🔍排查过程
### 核心解释：为什么你只看到 `Promise {<pending>}`

1.  **`async` 函数的本质**：任何一个 `async` 函数，在被调用时，**会立即返回一个 Promise 对象**。它不会等函数内部所有 `await` 的代码都执行完再返回。

2.  **控制台的行为**：当你在控制台里执行一行代码（比如 `testUserCRUD()`），控制台会立即显示这行代码的**返回值**。由于 `testUserCRUD()` 是一个 `async` 函数，它的返回值就是那个 Promise 对象。

3.  **时间差**：在你调用函数的那一瞬间，里面的 `fetch` 请求刚刚被发送出去，还没有收到响应，所以这个 Promise 的状态自然是 **`pending` (进行中)**。

**所以，你看到的 `Promise {<pending>}` 是完全正常、100% 预期的行为！**

### 那么，我想要的 `console.log` 输出在哪里？

它们在后面！它们会在对应的 `fetch` 请求**完成之后**，才被打印出来。

让我们模拟一下你在控制台按下回车后发生的事情：

1.  **瞬间 (0毫秒)**:
    *   你执行 `testUserCRUD()`。
    *   函数开始运行，`console.log('1. 查询用户...')` 被打印。
    *   遇到第一个 `await fetch(...)`，网络请求被发出。
    *   `testUserCRUD` 函数暂停，并**立即返回一个 Promise**。
    *   **控制台显示这个返回值：`Promise {<pending>}`**。

2.  **几十毫秒后**:
    *   第一个 `fetch` 请求回来了。
    *   函数继续执行，`console.log('当前用户:', users)` 被打印。
    *   `console.log('2. 创建用户...')` 被打印。
    *   遇到第二个 `await fetch(...)`，网络请求被发出，函数再次暂停。

3.  **再过几十毫秒**:
    *   第二个 `fetch` 请求回来了。
    *   函数继续执行，`console.log('创建的用户:', newUser)` 被打印。
    *   ...以此类推，直到函数所有代码执行完毕。

你可能因为看到了 `Promise {<pending>}` 就以为失败了，而没有注意到或等待后面陆续打印出来的日志。

---

## ✅解决方案
### 验证方法：两种更直观的测试方式

现在，请忘掉之前的困扰，用下面这两种方式之一在你的控制台里再试一次，你一定会看到期望的结果。

#### 方法一：使用 `.then()` 观察最终结果

`async` 函数返回的 Promise 也是一个标准的 Promise，我们可以用 `.then()` 来确认它最终完成了。

1.  清空你的控制台。
2.  粘贴并运行以下代码：

    ```javascript
    testUserCRUD().then(() => {
      console.log('✅✅✅--- 全部CRUD测试执行完毕 ---✅✅✅');
    });
    ```

3.  **仔细观察控制台**。你会先看到 `Promise {<pending>}`，然后会按顺序看到你函数里所有的 `console.log`，最后，你会看到 `✅✅✅--- 全部CRUD测试执行完毕 ---✅✅✅`。

#### 方法二：使用顶层 `await` (现代浏览器控制台都支持)

这是在控制台里测试异步代码的**最佳实践**，因为它更符合直觉。你不需要把代码包在 `async` 函数里。

1.  清空你的控制台。
2.  **逐行**粘贴并运行以下代码。每运行一行，控制台都会**等待**结果出来后再让你输入下一行。

    ```javascript
    // 1. 查
    const users = await fetch('/api/users').then(r => r.json());
    console.log('当前用户:', users);

    // 2. 增
    const newUserResponse = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '顶层await测试', phone: '13999999899', password: '1233' })
    });
    const newUser = await newUserResponse.json();
    console.log('创建的用户:', newUser);

    // 3. 改
    const updatedUserResponse = await fetch(`/api/users/${newUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newUser, name: '更新后的名字' })
    });
    const updatedUser = await updatedUserResponse.json();
    console.log('更新后的用户:', updatedUser);

    // 4. 删
    await fetch(`/api/users/${newUser.id}`, { method: 'DELETE' });
    console.log('用户删除成功');

    // 5. 再次验证
    const finalUsers = await fetch('/api/users').then(r => r.json());
    console.log('最终用户列表:', finalUsers);
    ```

![[attachments/CRUD增操作.png]]

---

### 测试alert

```ts
const alertStore = await import('/src/stores/alert.ts').then(m => m.useAlertStore())
```

```ts
async function testAlertCRUD() {
  console.log('🧪 开始 Alert CRUD 测试...')
  
  // 🔍 1. 获取所有预警
  console.log('1. 获取预警列表...')
  const alerts = await fetch('http://localhost:3000/alerts').then(r => r.json())
  console.log('当前预警:', alerts)
  
  // 🆕 2. 创建预警
  console.log('2. 创建新预警...')
  const newAlert = await fetch('http://localhost:3000/alerts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pointId: 1,
      level: 'high',
      message: 'Console测试创建的预警',
      time: Date.now(),
      handled: false
    })
  }).then(r => r.json())
  console.log('创建的新预警:', newAlert)
  
  // ✏️ 3. 更新预警
  console.log('3. 更新预警状态...')
  const updatedAlert = await fetch(`http://localhost:3000/alerts/${newAlert.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      handled: true,
      message: '已处理的预警'
    })
  }).then(r => r.json())
  console.log('更新后的预警:', updatedAlert)
  
  // 🗑️ 4. 删除预警
  console.log('4. 删除预警...')
  await fetch(`http://localhost:3000/alerts/${newAlert.id}`, {
    method: 'DELETE'
  })
  console.log('预警删除成功')
  
  // 验证结果
  const finalAlerts = await fetch('http://localhost:3000/alerts').then(r => r.json())
  console.log('✅ 最终预警列表:', finalAlerts)
}

// 执行测试
testAlertCRUD()
```
## 🧠知识联想
- 关联概念：

