# 从 Mock 到真实 HTTP 调用的核心差异

## 1. **执行时机与确定性差异**

### Mock 调用（可控的）
```typescript
// Mock - 同步思维，结果可预测
async function loginMock(phone: string, password: string) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 固定逻辑，永远相同的结果
      if (phone === '13800000000' && password === '123456') {
        resolve({ token: 'fixed-token', user: { id: 1, name: '测试用户' } })
      } else {
        reject(new Error('手机号或密码错误')) // 只有这一种错误
      }
    }, 1000) // 固定延迟
  })
}
```

### 真实 HTTP 调用（不可控的）
```typescript
// 真实 API - 异步思维，结果不确定
async function loginApi(phone: string, password: string) {
  // 可能发生的各种情况：
  // 1. 成功 (200) - 但数据结构可能变化
  // 2. 认证失败 (401) - 密码错误、账号不存在
  // 3. 权限不足 (403) - 账号被禁用
  // 4. 请求限制 (429) - 频繁请求
  // 5. 服务器错误 (500) - 后端代码问题
  // 6. 网络错误 - 断网、超时、CORS
  // 7. 数据格式错误 - 响应不是JSON
  
  const res = await http.post('/login', { phone, password })
  return res.data
}
```

## 2. **错误处理的本质差异**

### Mock 错误处理（简单）
```typescript
// ❌ Mock 的错误处理很简单
loginMock(phone, password).catch(error => {
  // 只有一种错误：密码错误
  alert(error.message) // "手机号或密码错误"
})
```

### 真实 API 错误处理（复杂）
```typescript
// ✅ 真实 API 需要分层错误处理
loginApi(phone, password).catch(error => {
  if (error.response) {
    // HTTP 错误 (4xx, 5xx)
    switch (error.response.status) {
      case 400: 
        handleBadRequest(error.response.data)
        break
      case 401:
        handleUnauthorized() // 多种原因：密码错误、token过期、账号不存在
        break
      case 403:
        handleForbidden() // 账号被禁用、权限不足
        break
      case 422:
        handleValidationError(error.response.data.errors) // 数据验证失败
        break
      case 429:
        handleRateLimit() // 请求太频繁
        break
      case 500:
        handleServerError() // 服务器内部错误
        break
    }
  } else if (error.request) {
    // 网络错误
    handleNetworkError()
  } else {
    // 其他错误
    handleUnknownError(error)
  }
})
```

## 3. **数据格式的差异**

### Mock 数据格式（你控制的）
```javascript
// 简单、固定、理想化的数据
{
  token: 'simple-jwt-token',
  user: {
    id: 1,
    name: '测试用户',
    phone: '13800000000'
  }
}
```

### 真实 API 数据格式（后端控制的）
```javascript
// 复杂、可能变化、包含元数据
{
  code: 0,           // 业务状态码
  message: 'success', // 业务消息
  data: {            // 实际数据
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // 复杂的JWT
    user: {
      userId: 12345,           // 字段名可能不同
      userName: '张三',         // 命名风格可能不同
      phoneNumber: '13800000000', // 字段结构可能不同
      avatar: 'https://...',   // 可能有额外字段
      roles: ['user', 'admin'], // 可能有多维数据
      permissions: ['read', 'write']
    }
  },
  timestamp: 1630000000000,  // 可能有元数据
  requestId: 'req-123456'    // 追踪信息
}
```

## 4. **错误处理的核心要点**

### 要点1：永远不要吞掉错误
```typescript
// ❌ 错误做法
async function loginApi() {
  try {
    const res = await http.post('/login', data)
    return res.data
  } catch (error) {
    console.error(error) // 错误被吞掉了！
    // 没有 throw，调用方不知道出错了
  }
}

// ✅ 正确做法
async function loginApi() {
  try {
    const res = await http.post('/login', data)
    return res.data
  } catch (error) {
    console.error(error)
    throw error // 重新抛出，让调用方处理
  }
}
```

### 要点2：用户友好的错误消息
```typescript
// 将技术错误转换为用户能理解的消息
function getUserFriendlyError(error) {
  if (error.response?.status === 401) {
    return '手机号或密码错误，请重新输入'
  } else if (error.response?.status === 500) {
    return '服务器暂时不可用，请稍后重试'
  } else if (error.code === 'NETWORK_ERROR') {
    return '网络连接失败，请检查网络设置'
  } else if (error.response?.status === 429) {
    return '操作过于频繁，请稍后再试'
  } else {
    return '系统繁忙，请稍后重试'
  }
}
```

### 要点3：加载状态管理
```typescript
async function loginApi(phone: string, password: string) {
  loading.value = true // 开始加载
  try {
    const res = await http.post('/login', { phone, password })
    return res.data
  } catch (error) {
    throw error
  } finally {
    loading.value = false // 无论成功失败，都要结束加载
  }
}
```

### 要点4：网络重试机制
```typescript
// 对于网络错误可以自动重试
async function loginWithRetry(phone: string, password: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await loginApi(phone, password)
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      // 只对网络错误重试
      if (isNetworkError(error)) {
        await delay(1000 * attempt) // 指数退避
        continue
      }
      throw error
    }
  }
}
```

## 5. **从 Mock 切换到真实的检查清单**

- [ ] **错误处理**：从单一错误扩展到多种错误类型
- [ ] **数据解析**：从简单对象到复杂的响应结构
- [ ] **加载状态**：添加真实的加载指示器
- [ ] **超时处理**：处理网络延迟和超时
- [ ] **重试逻辑**：对临时错误自动重试
- [ ] **用户反馈**：提供有意义的错误提示
- [ ] **日志记录**：记录请求详情用于调试
- [ ] **取消机制**：支持请求取消

## 总结

**从 Mock 到真实的核心转变**：

1. **思维模式**：从"一切都可控"到"什么都可能发生"
2. **错误处理**：从单一错误到分层错误处理
3. **数据管理**：从简单数据到复杂的数据转换
4. **用户体验**：从理想场景到各种边缘情况的处理

这就是为什么真实项目比 Demo 复杂得多的原因！