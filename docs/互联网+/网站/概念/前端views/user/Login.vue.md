# Login.vue

> 源码：[`src/views/user/Login.vue`](../../../../../../src/views/user/Login.vue)  
> 路由：`/login`（不要求已登录）  
> 后端：[`biz.py`](../../后端py文件/blueprints/biz.py.md) 的 `POST /login` → [`agri_derived.py`](../../后端py文件/rules/agri_derived.py.md) 的 `handle_farm_login`

---

## 一、一句话定义

**登录页。** 填手机号、演示验证码 `2026`（或备用密码）、角色，点「进入系统」后把 token 存进浏览器，再跳首页。

---

## 二、页面干什么

左侧麦田图，右侧表单。角色三档：管理员、农技员、合作社。勾选协议框目前不校验。

真正核对账号不在本文件，而在 Pinia [`src/stores/user.ts`](../../../../../../src/stores/user.ts) 的 `loginApi`：组 payload 打 `/login`，成功则写 `localStorage` 的 `token`、`userInfo`。

---

## 三、函数在干什么

| 函数 | 干什么 |
|------|--------|
| `onSubmit` | 表单 `@finish`：`store.loginApi(...)`；有 `token` 则 `router.push` 到 `?redirect=` 或 `/home`；失败用接口 `friendlyMessage` 提示 |

本页几乎没有本地计算函数。样式与麦田图路径不参与业务。

---

## 四、不负责什么

- 不查 `users` 表（Flask 查）
- 不画顶栏菜单（登录后的壳是 `AppLayout`，本页也包了布局但路由守卫允许未登录进来）
- 不实现验证码短信；`2026` 是演示口令，口径在后端登录纯函数里

---

## 五、小结

**本页只收集表单并调用 `loginApi`。** 过不过关由 Flask `/login` 决定。
