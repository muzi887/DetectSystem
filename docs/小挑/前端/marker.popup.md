# 一、从页面到 POST 的完整调用链

1. `marker.bindPopup(popupHtml)`：你把一段包含 `<button id="trigger-${p.id}">` 的 HTML 字符串放进 popup。
    
    - **重要**：这段 HTML _并不会_ 立即插入到页面 DOM 中，只有当用户**打开该 marker 的 popup**（点击 marker）时，Leaflet 才把这段 HTML 插入到 DOM（插入到 Leaflet 管理的 popup 容器里）。
        
2. `attachPopupButtons()`：
    
    - 你的函数在 `renderMarkers()` 后执行，并用 `setTimeout` 延迟 200ms，然后对每个点执行 `document.getElementById('trigger-...')` 去找按钮元素并绑定 `onclick`。
        
    - **关键点**：`document.getElementById` 只有在对应 popup 的 HTML 已经存在于 DOM 时才会返回元素；如果用户还没打开 popup（或 popup 被延迟渲染），这里会查不到元素，绑定就不会发生。
        
3. 按钮的 `onclick` 回调：
    
    - 回调里调用 `await dataStore.createAlert({...})` —— 这里通常是 store 里的方法，内部会做一次 HTTP 请求（例如用 `fetch` 或 `axios`）向 mock 后端 `POST /alerts`。
        
    - 如果 `createAlert` 写成正确的 POST 请求，并且后端可达，json-server（或你用的 mock）会收到请求并把数据写入 `db.json`（前提：mock 运行并允许写入）。
        

总结：要从“点按钮”到“db.json 变化”，必须满足两件事同时成立：

- 按钮的 DOM 元素 **实际被绑定了 onclick**（即 `attachPopupButtons` 在元素可用时绑定成功），
    
- `dataStore.createAlert` **确实发出并被 mock 接收、并写入 `db.json`**（HTTP 成功且 mock 正确配置）。
    

---

# 二、你网页点了但 `db.json` 没变化 / Dashboard 没更新 —— 常见原因 & 含义（按概率从高到低）

1. **事件根本没绑定（最常见）**
    
    - 原因：`attachPopupButtons` 在 popup 未打开时就查找按钮（找不到），因此按钮虽然在 popup 里可见，但没有 onclick 处理。
        
    - 结果：点按钮看起来有反应（按钮存在），但实际上没有任何网络请求发出。
        
2. **网络请求被发出了，但失败了（4xx/5xx/CORS）**
    
    - 原因：请求 URL 不对（比如应为 `http://localhost:3000/alerts`，但发送到 `/api/alerts` 或带了错误 base URL），或后端未运行，或 CORS 被拦截。
        
    - 结果：浏览器 Network 可以看到请求但状态不是 201/200；db.json 未写入。
        
3. **请求成功，但是写入了不同的 `db.json` 文件**
    
    - 原因：你在不同目录、不同进程里启动了 json-server（工作目录不同），或者 mock 被多个实例启动，导致你查看的 `db.json` 不是 json-server 实际写入的那个文件。
        
    - 结果：json-server 接收并写入某个 db.json，但你打开的另一个文件没变。
        
4. **json-server 没以“watch/write”模式运行或无写权限**
    
    - 原因：某些启动方式或文件权限会阻止写入。
        
    - 结果：请求可能返回但文件不更新。
        
5. **store(createAlert) 只是返回成功但没有更新本地 store 状态或没有触发 dashboard 的刷新**
    
    - 原因：`createAlert` 做了 POST 但没有把新 alert 推到 Vue 的响应式数组里，也没有在 dashboard 里重新 fetch alerts 或监听 store。
        
    - 结果：db.json 已变化（或未），但 Dashboard 数据没刷新。
        

---

# 三、按步骤的排查流程

> 你只需要打开浏览器开发者工具（F12），并同时看启动 mock 的终端。

1. **在浏览器里重现操作并观察 Network（最重要的一步）**
    
    - 打开 DevTools → Network 标签页（切到 Preservation/Disable cache 可选）。
        
    - 在 Monitor 页面手动：点击某个 marker → 确认 popup 打开 → 点击“模拟触发预警”按钮。
        
    - 观察 Network 列表：
        
        - **如果看不到任何请求发出（没有 POST /alerts）** → 说明按钮没有绑定点击事件（见原因 1）。
            
        - **如果看到 POST /alerts** → 点开该请求查看：
            
            - 请求 URL（完整地址）是什么？（注意端口、是否带 `/api` 前缀）
                
            - 请求状态码（201 / 200 / 4xx / 5xx / CORS）？
                
            - 请求 payload（body）是否是你期望的 JSON？
                
            - 响应体是什么（json-server 通常会返回创建的对象）？
                
2. **若 Network 显示没有请求**（说明事件没绑上）
    
    - 原因很可能是 `attachPopupButtons` 在 popup 未插入时执行。
        
    - 进一步验证：打开 popup 后，在 Console 输入 `document.getElementById('trigger-<某id>')`（把 `<某id>` 换成你某个点的 id），看看是否返回元素对象或 `null`。
        
        - 返回 `null` → 确认绑定未发生。
            
        - 返回元素但 onclick 没设置 → `getEventListeners(element)`（Chrome）看看是否有 `click` 监听器。
            
3. **若 Network 显示有请求，但失败（4xx/5xx 或 CORS）**
    
    - 点开请求看返回的错误信息（response body / headers）。
        
    - 检查：请求的完整 URL 是否是你期望的 mock 服务地址（端口）？若是 `/api/alerts`，看你的 dev-server 是否用了 proxy 转发到 mock。
        
    - 在 mock（json-server）所在的终端看有没有对应的请求日志（json-server 会打印访问日志）。如果终端没有对应日志，说明请求可能被浏览器拦截（CORS）或被代理拦截。
        
4. **若请求成功（201）但 db.json 看不到变化**
    
    - 检查你打开的 `db.json` 文件路径是否与 json-server 启动时所在目录一致（json-server 在启动目录寻找并写入 db.json）。
        
    - 在 mock 终端查找写入日志。也可以做 `GET /alerts`（在浏览器地址栏或 Postman）看服务器返回的数据是否包含你刚刚创建的 alert。
        
    - 若 `GET /alerts` 能看到新数据，但你本地 `db.json` 文件没变 → 说明可能是你打开的是不同路径下的 db.json，或文件写入缓冲/权限导致没即时更新。
        
5. **若请求成功且 db.json 更新，但 Dashboard 不变**
    
    - Dashboard 可能只在 mount 时 `fetchAlerts()`，并未对 store 的数组做响应式更新或订阅。检查 Dashboard 的数据来源是否实时从 store 的 alerts 数组读取，或是否需要手动刷新/重新 fetch（你可以在 Console 里查看 store.alerts 的值，或在 Network 里查看 Dashboard 是否发起新的 GET）。
        

---

# 四、基于你现有代码的**最可能**情形

- 最常见的问题（且与你代码片段直接相关）是：**你用 `setTimeout` 在 popup 还没插入 DOM 时去绑定按钮**，导致按钮虽然显示但没有 `onclick`；因此浏览器不会发出 POST，db.json 不会变化，也就看不到 Dashboard 更新。
    
- 其次常见的是：**请求发出但发送到了错误的地址/端口（或被 CORS 拦截）**，这会在 Network 中清楚显示（错误码、无终端日志等）。
    

