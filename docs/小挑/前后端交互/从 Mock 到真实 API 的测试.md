# 从 Mock 到真实 API 的测试与学习指南

## 如何测试真实登录接口

### 1. **准备测试环境和工具**

#### 安装浏览器开发工具
- Chrome DevTools - 查看 Network 标签
- Vue DevTools - 查看 Vuex/Pinia 状态

#### 使用测试账号
确保你有可用的测试账号：
```javascript
// 比如常见的测试账号模式：
await store.loginApi('13800000000', '123456')
await store.loginApi('13900000000', '12345678') 
await store.loginApi('18812345678', 'password')

// 测试各种情况
await store.loginApi('13800000000', '123456')  // 正确密码
await store.loginApi('13800000000', 'wrong')   // 错误密码  
await store.loginApi('', '123456')             // 空手机号
await store.loginApi('13800000000', '')        // 空密码
await store.loginApi('123', '123456')          // 短手机号
```

![[attachments/测试登录.png]]

### 2. **测试步骤**

#### 步骤1：打开 Network 监控
```bash
# 1. 打开 Chrome DevTools (F12)
# 2. 切换到 Network 标签
# 3. 勾选 "Preserve log" (保留日志)
# 4. 过滤 XHR/Fetch 请求
```

#### 步骤2：执行登录操作
```javascript
// 在登录页面输入：
手机号: 13800000000
密码: 123456
点击登录按钮
```

#### 步骤3：观察网络请求
检查以下关键信息：
- **Request URL**: 是否正确指向 `/api/login`
- **Request Method**: 是否为 `POST`
- **Request Payload**: 是否包含手机号和密码
- **Response Status**: 200(成功) 或 4xx/5xx(错误)
- **Response Data**: 返回的 token 和用户信息

### 3. **修改登录代码进行测试**

```typescript
// src/stores/user.ts
import { ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/utils/http'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)
  const loading = ref(false)

  // Mock 登录（保留供对比学习）
  async function loginMock(phone: string, password: string) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (phone === '13800000000' && password === '123456') {
          const mockData = {
            token: 'mock-jwt-token-123456',
            user: { id: 1, phone, name: '测试用户' }
          }
          token.value = mockData.token
          userInfo.value = mockData.user
          localStorage.setItem('token', mockData.token)
          resolve(mockData)
        } else {
          reject(new Error('手机号或密码错误'))
        }
      }, 1000)
    })
  }

  // 真实 API 登录
  async function loginApi(phone: string, password: string) {
    loading.value = true
    try {
      console.log('🚀 发起登录请求:', { phone, password })
      
      const res = await http.post('/login', { 
        phone, 
        password 
      })
      
      console.log('✅ 登录响应:', res.data)
      
      const data = res.data
      token.value = data.token
      userInfo.value = data.user
      localStorage.setItem('token', data.token)
      
      return data
    } catch (error) {
      console.error('❌ 登录失败:', error)
      throw error // 重要：重新抛出错误，让组件可以处理
    } finally {
      loading.value = false
    }
  }

  return {
    token,
    userInfo,
    loading,
    loginMock,
    loginApi
  }
})
```

### 4. **在 Login.vue 中测试**

```vue
<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <input v-model="form.phone" placeholder="手机号" />
      <input v-model="form.password" type="password" placeholder="密码" />
      <button type="submit" :disabled="userStore.loading">
        {{ userStore.loading ? '登录中...' : '登录' }}
      </button>
      
      <!-- 测试按钮 -->
      <div style="margin-top: 20px;">
        <button type="button" @click="testMockLogin">测试 Mock 登录</button>
        <button type="button" @click="testApiLogin">测试 API 登录</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const form = reactive({
  phone: '',
  password: ''
})

// 真实 API 登录
const handleLogin = async () => {
  try {
    const result = await userStore.loginApi(form.phone, form.password)
    console.log('🎉 登录成功:', result)
    // 跳转到首页
    // router.push('/')
  } catch (error: any) {
    console.error('💥 登录错误:', error)
    
    // 显示错误信息给用户
    if (error.response?.status === 401) {
      alert('手机号或密码错误')
    } else if (error.response?.status === 500) {
      alert('服务器错误，请稍后重试')
    } else if (error.message === 'Network Error') {
      alert('网络连接失败，请检查网络')
    } else {
      alert(error.response?.data?.message || '登录失败')
    }
  }
}

// 测试 Mock 登录
const testMockLogin = async () => {
  try {
    const result = await userStore.loginMock('13800000000', '123456')
    console.log('🎉 Mock 登录成功:', result)
  } catch (error) {
    console.error('💥 Mock 登录失败:', error)
  }
}

// 测试 API 登录
const testApiLogin = async () => {
  try {
    const result = await userStore.loginApi('13800000000', '123456')
    console.log('🎉 API 登录成功:', result)
  } catch (error) {
    console.error('💥 API 登录失败:', error)
  }
}
</script>
```

## Mock vs 真实 API 的核心差异

### 1. **执行时机差异**

```javascript
// Mock - 同步思维，立即知道结果
async function loginMock() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true }) // 1秒后必定返回
    }, 1000)
  })
}

// 真实 API - 异步思维，结果不确定
async function loginApi() {
  const response = await http.post('/login', data)
  // 可能: 200成功, 401密码错误, 500服务器错误, 网络超时...
  return response.data
}
```

### 2. **错误处理差异**

```javascript
// Mock 错误处理（简单）
loginMock().catch(error => {
  // 只有一种错误：密码错误
  alert('手机号或密码错误')
})

// 真实 API 错误处理（复杂）
loginApi().catch(error => {
  if (error.response) {
    // HTTP 错误
    switch (error.response.status) {
      case 400: alert('请求参数错误'); break
      case 401: alert('认证失败'); break
      case 429: alert('请求太频繁'); break
      case 500: alert('服务器错误'); break
    }
  } else if (error.request) {
    // 网络错误
    alert('网络连接失败')
  } else {
    // 其他错误
    alert('未知错误')
  }
})
```

### 3. **数据格式差异**

```javascript
// Mock 返回的数据格式（你控制的）
const mockResponse = {
  token: 'simple-token',
  user: { id: 1, name: '测试用户' }
}

// 真实 API 返回的数据格式（后端控制的）
const realResponse = {
  code: 0,
  message: 'success',
  data: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      userId: 123,
      userName: '张三',
      phone: '13800000000',
      avatar: 'https://...',
      // 可能还有很多其他字段
    }
  },
  timestamp: 1630000000000
}
```

## 重要的错误处理要点

### 1. **必须重新抛出错误**

```typescript
// ❌ 错误做法：吞掉错误
async function loginApi() {
  try {
    const res = await http.post('/login', data)
    return res.data
  } catch (error) {
    console.error(error)
    // 没有 throw，调用方不知道出错了！
  }
}

// ✅ 正确做法：重新抛出
async function loginApi() {
  try {
    const res = await http.post('/login', data)
    return res.data
  } catch (error) {
    console.error(error)
    throw error // 让调用方能够处理错误
  }
}
```

### 2. **用户友好的错误提示**

```typescript
// 在组件中处理错误
const handleLogin = async () => {
  try {
    await userStore.loginApi(phone, password)
  } catch (error: any) {
    // 将技术错误转换为用户能理解的消息
    let message = '登录失败'
    
    if (error.response?.status === 401) {
      message = '手机号或密码错误'
    } else if (error.response?.status === 429) {
      message = '尝试次数过多，请稍后重试'
    } else if (error.code === 'NETWORK_ERROR') {
      message = '网络连接失败，请检查网络设置'
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    }
    
    alert(message)
  }
}
```

### 3. **加载状态管理**

```typescript
// 在 store 中管理加载状态
async function loginApi(phone: string, password: string) {
  loading.value = true  // 开始加载
  try {
    const res = await http.post('/login', { phone, password })
    // ... 处理成功
    return res.data
  } catch (error) {
    throw error
  } finally {
    loading.value = false // 无论成功失败，都要结束加载
  }
}
```

## 测试 checklist

- [ ] Network 中能看到 `/api/login` 请求
- [ ] 请求包含正确的手机号和密码
- [ ] 成功时：localStorage 有 token，页面跳转
- [ ] 失败时：显示正确的错误提示
- [ ] 加载状态正确显示和隐藏
- [ ] 错误密码返回 401 状态码
- [ ] 网络断开时显示网络错误

通过这样的对比测试，你会深刻理解 Mock 和真实 API 的差异，并掌握生产环境中的错误处理技巧！