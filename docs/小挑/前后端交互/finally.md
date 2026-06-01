---
title: 
tags: [原理卡, Java, Spring]
created: 2025-10-20
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> `finally` 中的代码**无论是否发生异常或是否有 `return`** 都会执行，适合放“清理/关闭/释放/设置 loading 状态”这类保证执行的操作。  
但要避免在 `finally` 中 `return`（或抛出新的错误），因为它会**覆盖原来的返回值**或异常，导致调试困难。

---

## 关键点
### 基本结构

```js
try {
  // 可能抛错的代码
} catch (err) {
  // 处理错误（可选）
} finally {
  // 总会执行（用于清理）
}
```

### 常见且正确的使用场景

- 关闭 loading 指示 `loading = false`（正符合你的 `fetchAlerts` 写法）。
    
- 释放资源、关闭文件/socket、解除订阅、取消计时器等。
    
- 在异步函数中做 `await` 清理（注意：如果在 finally 使用 `await`，函数会等待该 promise 完成）。
    

```ts
async function fetchAlerts() {
  loading = true
  try {
    const res = await http.get('/alerts')
    return res.data
  } finally {
    loading = false // 无论请求成功、抛错还是被外层捕获，这里都会执行
  }
}
```

---

## 代码示例

1. 用 `finally` 做「清理」和「状态恢复」（如 `loading = false`）。
    ```ts
    try {
      // ...
    } finally {
      try {
        await cleanup()
      } catch (cleanupErr) {
        console.error('cleanup failed', cleanupErr) // 记录但不覆盖主错误
      }
    }
    ```
    
2. `finally` 很适合做原 store 里 `loading` 的开关：`loading=true` 在 try 前，`loading=false` 在 finally 中 — 这是标准且正确的模式。

---

## ❗ 易错点
### 不要在 `finally` `return` 或抛新错

- 如果 `try` 或 `catch` 中有 `return`，`finally` 仍然会执行。但**如果 `finally` 也 `return`，它将覆盖原来的返回值**。
    
- 同理：如果 `try` 抛错，但 `finally` 抛出另一个错误，**最终抛出的会是 `finally` 的错误**（原始错误会被吞掉）。
    

示例说明为什么**不要在 `finally` `return` 或抛新错**：

```js
function bad() {
  try {
    return 1
  } finally {
    return 2  // 覆盖了 try 的返回值，调用者只会得到 2
  }
}
console.log(bad()) // 2
```

示例：错误被 finally 覆盖（不想要的行为）

```js
function badError() {
  try {
    throw new Error('try error')
  } finally {
    throw new Error('finally error') // 原来的 'try error' 会被替换
  }
}
badError() // 抛出 'finally error'
```

- `finally` 会等待其中的 `await`：
    
    ```ts
    try {
      await someAsync()
    } finally {
      await cleanupAsync() // outer function 会等待 cleanupAsync 完成
    }
    ```
    
- 这意味着用 `finally` 做异步清理是可以的，但注意失败处理（若 cleanup 失败，可能会掩盖原始错误）。
    
如果 `finally` 的清理可能失败，考虑在 `finally` 内部捕获它，避免覆盖主流程的错误