---
tags: [踩坑卡, Web, HTTP]
date: 2025-10-20
---

# 🪤踩坑卡：服务器（Mock Server）绝对正确地发送了响应，但浏览器 DevTools 无法显示它。

## 💥问题描述
 - ❌服务器（Mock Server）绝对正确地发送了响应，但浏览器 DevTools 无法显示它。
 - ⚠️

## 🔍排查过程
1. 100%确定服务器是正常的，因为响应头里有这两个关键信息：

2. `Status Code: 200 OK`
    
3. `content-length: 146`
	1. `content-length: 146` 意味着服务器**明确**告诉浏览器：“我给你发送了 146 字节的数据（你的 JSON 响应体）”。浏览器收到了这个指令，但在 DevTools 想要去读取这 146 字节的数据进行显示时，却发现“资源找不到了”（no resource with given identifier found）。
4. 这几乎**不是**你的 `axios` 代码、Vite 代理配置或 Mock 服务器代码的问题。如果它们有问题（例如代理失败），你会收到 404、500 错误或一个 HTML 错误页面，而不是 `200 OK` 加上正确的 `content-length`。

这个问题 99% 的可能性出在**浏览器端**

## ✅解决方案
1. 罪魁祸首：Service Worker 缓存
	1. 清除缓存——重启😅

![[attachments/Network-Response.png]]

![[attachments/Application-localStorage.png]]
## 🧠知识联想
- 关联概念：

