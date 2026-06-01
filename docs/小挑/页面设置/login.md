Ant Design Vue 的 `<a-form>` 组件的 `@finish` 事件，这比在按钮上监听 `@click` 更健壮，因为它内置了表单校验逻辑

## 无法跳转
问题很大概率出在**别的地方**：**Vue Router 全局前置守卫 (`router.beforeEach`)**。

1. **用户点击登录**：在 `Login.vue` 页面，`onSubmit` 函数被触发。
2. **API 请求成功**：`await store.loginApi(...)` 成功执行。在 `loginApi` 函数内部，Pinia store 的 `token` 状态被成功赋值。
3. **执行跳转**：`await router.push('/home')` 开始执行。
4. **触发路由守卫**：Vue Router 在真正导航到 `/home` 之前，会先执行你在 `src/router/index.ts` 中设置的 `router.beforeEach` 全局守卫。
5. **守卫开始检查**：
    - 守卫代码检查 `to.meta.requireAuth`，对于 `/home` 路径，这个值是 `true`。
    - 然后，守卫检查 `!token`。**这就是问题的核心所在！**

### 问题的根源

你的路由守卫代码存在一个不易察觉的缺陷：

```typescript
// src/router/index.ts 中有问题的部分

router.beforeEach((to) => {
  const userStore = useUserStore()

  // 问题在这里！
  // userStore.token 是 pinia 的 state，它本身是一个 ref。
  // 在组件外部的JS模块中直接访问 ref 可能会导致问题，
  // 特别是 (userStore as any).token.value 这种写法非常脆弱。
  const tokenRef = (userStore as any).token 
  const token = tokenRef ? tokenRef.value : '' // <--- 如果这里拿不到最新的值，token 就为空

  const requireAuth = Boolean((to.meta as any)?.requireAuth)
  if (requireAuth && !token) { // <--- 条件成立！
    // 因为 token 为空，守卫认为你没有登录，
    // 于是把你重新导向回 'Login' 页面！
    return { name: 'Login', replace: true } 
  }
})
```

**执行流程的死循环：**

`登录成功` -> `router.push('/home')` -> `路由守卫拦截` -> `守卫发现 token 为空` -> `守卫强制跳转回 /login`。

结果就是，页面刷新一下或者看起来没反应，但实际上你被瞬间踢回了登录页。

### 解决方案：修正路由守卫

在组件外部的 JS 模块（如 `router/index.ts`）中与 Pinia 交互时，最安全的方式是直接访问 store 的 state 属性，Pinia 会处理好响应式数据的解包。不要使用 `.value`。

请修改你的 `src/router/index.ts` 文件，将 `beforeEach` 守卫改成下面这样：

```typescript
// src/router/index.ts (修正版)

// =========================================================
// 全局前置守卫 (修正后的版本)
// =========================================================
router.beforeEach((to, from, next) => {
  // 确保 Pinia store 实例已创建
  const userStore = useUserStore()

  // 直接从 store 的 state 中读取 token
  // Pinia 会自动处理 ref 的解包，你不需要也不应该使用 .value
  const token = userStore.token 

  // 判断目标路由是否需要认证
  const requiresAuth = to.meta.requireAuth

  if (requiresAuth && !token) {
    // 如果需要认证但没有 token，重定向到登录页
    // 并将用户想去的页面路径作为查询参数，以便登录后能跳回去
    next({ 
      name: 'Login', 
      query: { redirect: to.fullPath } 
    })
  } else if (to.name === 'Login' && token) {
    // 如果用户已经登录，但又访问了登录页，直接让他去首页
    next({ name: 'Home' })
  }
  else {
    // 其他所有情况，正常放行
    next()
  }
})
```

**为什么新版本更好？**

1. **正确的 Token 访问**：直接使用 `userStore.token` 获取值，这是 Pinia 设计的标准用法，更稳定可靠。
2. **使用了 `next()`**：虽然 Vue Router 4+ 支持从守卫中直接返回一个路由对象，但使用 `next()` 是更传统且清晰的写法，尤其是在有多重逻辑判断时。
3. **增加了重定向逻辑**：
    - `query: { redirect: to.fullPath }`：如果未登录的用户试图访问一个受保护的页面，守卫会把他带到登录页，并把原本的目标地址（例如 `/map`）附加到 URL 上，变成 `/login?redirect=%2Fmap`。这样，你的 `Login.vue` 里的 `route.query.redirect` 就能获取到这个值，登录成功后可以直接跳转到用户最初想去的页面，而不是写死的 `/home`。
    - `if (to.name === 'Login' && token)`：这个判断可以防止已登录的用户再次访问登录页。

## `AppLayout` 组件


以下是重构后的 `src/views/user/Login.vue`。

### 修改重点：

1. **移除**：删除了 Header、Nav、背景相关的 HTML 和 CSS。
2. **引入**：使用了 `<AppLayout>` 包裹内容。
3. **布局适配**：
    - 由于 `AppLayout` 的内容区域默认是垂直排列的，我们需要加一个 wrapper (`.login-content-wrapper`) 并设置 `height: 100%` 和 Flex 居中，让登录框完美居中显示。
    - 转换为 `<script setup>` 语法（你之前的代码是混合写法，这里统一为 setup 语法更简洁）。

### **“新中式农业科技风”** **“生态玻璃拟态”**
它的核心特点是：

1. **字体**：标题使用 **衬线体（Serif）**（如宋体），显得更典雅、有文化底蕴，区别于传统的工业科技风。
2. **色调**：采用 **深墨绿** 和 **半透明磨砂** 结合，体现“生态”与“科技”的融合。
3. **控件**：输入框不再是白色，而是**深绿色半透明**，文字是白色的。
4. **布局**：左右不再是完全隔离的两个卡片，而是一个大的**整体磨砂玻璃容器**，包裹着左侧图片和右侧表单。