---
tags: [组件卡, Vue]
created: 2025-10-19
component: 按钮
---

# 组件卡：按钮

## 用途
标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。

## API 设计
- 五种按钮
	- 主Primary按钮：用于主行动点，一个操作区域只能有一个主按钮。
	- 默认Default按钮：用于没有主次之分的一组行动点。
	- 虚线Dashed按钮：常用于添加操作。
	- 文本Text按钮：用于最次级的行动点。
	- 链接Link按钮：一般用于链接，即导航至某位置。
- 4 other properties additionally.
	- `danger`: used for actions of **risk**, like deletion or authorization.
	- `ghost`: used in situations with **complex background, home pages usually**.
	- `disabled`: when actions are not available.
	- `loading`: add loading spinner in button, **avoiding multiple submits** too.
## 代码骨架
```vue
 <a-button type="primary" block @click="onSubmit" :loading="loading">登录</a-button>
<a-button type="link" @click="logout">登出</a-button> <!-- 直接调用路由跳转 -->
<a-button type="link" @click="to('/login')">登出</a-button> <!-- 调用登出函数 -->
    const to = (path: string) => router.push(path)
```

## 例子

- 使用场景：

