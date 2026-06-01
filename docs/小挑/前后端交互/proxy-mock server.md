Proxy 在开发时把浏览器发给 dev-server 的请求转发到你真正的 mock 后端（并可改头、改路径），所以浏览器不触发 CORS；但对前端代码/UI 它**尽量不改变表现**，这就是“没区别”的原因。

- 浏览器看到的是同源请求（origin = dev server），因此**不再触发 CORS/预检**。
    
- 请求最终到达 mock server，但**Host/Origin** 有可能被代理改写（`changeOrigin:true` 会把 `Origin/Host` 改为目标）。
    
- 你可以在 proxy 层做 **path rewrite**（例如 `/api/login` → `/login`），前端 URL 无需改动。
    
- 对于需要凭证（cookie）的场景，proxy 通常**免去了跨域 cookie 的麻烦**（不过生产仍需正确配置）。
    
- WebSocket/Server-Sent Events 需要额外配置（`ws: true`），否则不会被转发。
    
- 请求/响应 header 可以被代理修改（比如添加/删除头），所以有时候后端看到的请求并不是浏览器原样发的。
    
- 生产环境没有 proxy，部署前必须切回“真实后端地址”。
## 1) 在 `server.ts`（mock server）加入调试日志并重启服务

把下面几行放进 `server.post('/login', ...)` 函数开头（或紧靠 `const { phone, password } = req.body` 之后）：

```ts
console.log('[login] req.url=', req.url, 'method=', req.method)
console.log('[login] headers.origin=', req.headers.origin)
console.log('[login] headers.host=', req.headers.host)
console.log('[login] headers[\'x-forwarded-host\']=', req.headers['x-forwarded-host'])
console.log('[login] body=', req.body)
```

保存后重启你的 mock 服务（例如 `npm run dev` 或你平时启动 json-server 的命令），确保控制台能看到这些日志输出。

---

## 2) 测试 A：通过 dev-server proxy（**有 proxy** — 相对路径 `/api/login`）

在你的前端项目（Vite）里直接发请求，方法任选其一：

### 在浏览器控制台（最直观）

打开项目页面 → F12 → Console，然后粘贴并回车：

```js
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '13800000000', password: '123456' })
}).then(r => r.json().then(b => console.log('resp', r.status, b))).catch(console.error)
```

**观察：** 切回 mock server 的控制台，查看刚才加入的日志。你应该看到类似：

```json
JSON Server is running on http://localhost:3000
[login] req.url= /login method= POST
[login] headers.origin= http://localhost:5173  <-- 或 undefined（但通常是 dev server 的 origin）
[login] headers.host= localhost:3000  <-- 目标 host（或代理写入）
[login] headers['x-forwarded-host']= undefined <-- 若代理加了该头
[login] body= { phone: '13800000000', password: '12346' }
POST /login 401 26.613 ms - 43

[login] req.url= /login method= POST
[login] headers.origin= http://localhost:5173
[login] headers.host= localhost:3000
[login] headers['x-forwarded-host']= undefined
[login] body= { phone: '13800000000', password: '123456' }
POST /login 200 3.384 ms - 146
```

重点看 `headers.origin` / `x-forwarded-host` 与 `host` 的差别 —— 说明请求是由 dev-server 转发过来的。

---

## 3) 测试 B：直接绕过 proxy（**无 proxy** — 绝对路径到 mock ）

在浏览器控制台再发一次但改成绝对 URL：

```js
fetch('http://localhost:3000/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: '13800000000', password: '123456' })
}).then(r => r.text().then(b => console.log('resp', r.status, b))).catch(console.error)
```

**观察：** 回到 mock server 控制台，你会看到这次的 `headers.origin` 很可能是 `http://localhost:5173`（浏览器真实 origin），并且 `x-forwarded-host` 可能不存在（因为没有 proxy）。如果浏览器执行请求时存在跨域限制，浏览器控制台（Network 或 Console）也会出现 CORS 报错（预检或 blocked by CORS）。

示例日志可能是：

```
JSON Server is running on http://localhost:3000
[login] req.url= /login method= POST
[login] headers.origin= http://localhost:5173 <-- 直接来自浏览器
[login] headers.host= localhost:3000
[login] headers['x-forwarded-host']= undefined
[login] body= { phone: '13800000000', password: '123456' }
POST /login 200 25.721 ms - 146
```

---

## 4) 在浏览器 DevTools 查看网络请求（建议）

1. 打开 DevTools → Network。
    
2. 选中 XHR 或 Fetch 过滤器。
    
3. 发起请求（上面 fetch）。
    
4. 点击该请求，查看 **Request URL**（会显示发向 dev-server 还是 mock server），查看 Request Headers 的 `Origin` 字段，和 Response Headers。
    

- 如果使用 `/api/login`（proxy），Request URL 会显示 `http://localhost:5173/api/login`（浏览器与 dev-server 通信），实际转发到 mock 的信息要看你在 mock server 控制台的日志。
    
- 如果用 `http://localhost:3000/login`，Request URL 就直接是 mock 的地址，浏览器会发跨域请求并可能在 Console 中报 CORS 错误。
    

---

## 5) 预期对比（快速判断）

- **有 proxy（/api/login）**：mock 日志中 `x-forwarded-host` 会显示 dev-server，或者 `origin` 显示 dev-server（proxy 可能改写），浏览器不会报 CORS。
    
- **无 proxy（[http://localhost:3000/login）**：mock](http://localhost:3000/login%EF%BC%89**%EF%BC%9Amock) 日志中 `origin` 来自浏览器（通常也是 `http://localhost:5173`），但浏览器可能在 Control台看到 CORS 报错（如果后端未允许跨域），或者直接成功（如果后端允许 CORS）。
    

---

## 6) 做完别忘清理

测试结束后把 `console.log` 删除或注释，避免污染日志。

