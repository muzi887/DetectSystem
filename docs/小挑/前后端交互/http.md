---
title:
tags:
  - 原理卡
  - HTTP
  - Web
created: 2025-10-20
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> 一个**HTTP请求封装工具**，通常位于 `@/utils/http`，用于统一管理前端应用的所有网络请求。

---

## 关键点
### HTTP 请求

- **常见方法**：`http.get` / `http.post` / `http.patch` / `http.delete`。  
    你在 store 里直接调用这些方法与传 URL。
    
- **返回值习惯**：封装通常把真实业务数据放 `res.data`，因此你写 `res.data` 来取后端返回的主体。
    
- **默认参数覆盖**（你在 `createAlert` 中用法）：  
    `http.post('/alerts', { time: Date.now(), handled: false, ...alertData })` —— 后面的 `...alertData` 会覆盖默认字段（如果用户传了相同字段）。
    
- **错误处理**：如果 `http` 抛错（网络/后端错误），`await` 会抛出，若没有 `catch` 会冒泡；`finally` 仍会执行。
    
- **日志**：`console.log` 是调试用，帮助观察请求体与响应体（请在生产移除或用 logger）。
### `http` 封装

- **统一 [[baseURL]] / headers / timeout**（隐藏在 `http` 内部，不在 store）——所以 store 只需写相对路径 `/alerts`。
    
- **[[拦截器]]（Interceptors）**：常用于自动把 token 加到请求头、统一剥离 `res.data` 或把后端错误转成异常；这解释了为什么你能直接用 `res.data`。
    
- **类型化返回（可选）**：若 `http` 支持泛型，调用方可写 `http.get<Alert[]>('/alerts')` 以获得 TS 类型提示（当前你的代码用 `any[]`，可以替换为具体类型）。
    
- **取消请求 / 并发控制（可选）**：你的代码没用，但了解它能防止组件卸载后处理响应（axios 的 CancelToken / fetch 的 AbortController）

---

## 代码示例

```ts
http.get('/alerts?_sort=time&_order=desc')
```

- **`http.get()`**: 发起一个 HTTP GET 请求的方法
    
- **`/alerts`**: 请求的端点（通常表示"警报"或"通知"数据）
    
- **`?_sort=time&_order=desc`**: 查询字符串参数
### 查询参数详解

#### `_sort=time`

- 告诉服务器按照 `time` 字段对结果进行排序
    
- 假设数据中有一个名为 `time` 的字段（可能是时间戳或日期时间）
    

#### `_order=desc`

- `desc` = descending（降序）
    
- 表示从最新到最旧排序

> **"获取所有的警报数据，按照时间字段从最新到最旧排序"**


---

## ❗ 易错点
- 


