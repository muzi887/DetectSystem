# About.vue

> 源码：[`src/views/user/About.vue`](../../../../../../src/views/user/About.vue)  
> 路由：`/about`  
> 可选接口：[`app.py`](../../后端py文件/app.py.md) `GET /api/analysis/model-info`

---

## 一、一句话定义

**关于我们。** 展示口号、技术栈、指导教师、队员；「系统实现」里若识病服务在跑，会显示模型类数和验证准确率。

---

## 二、页面干什么

文案和头像路径都写在本文件的常量里（`techStack`、`advisors`、`teamMembers`），不进 MySQL。

`onMounted` 调 `fetchAnalysisModelInfo`，失败则 `modelInfo` 为空，类数那一行不显示，页面其余部分照常。

---

## 三、函数在干什么

本页 **没有** 业务函数表。唯一异步是挂载时拉模型元信息。模板用 `v-if="modelInfo.classes_count"` 决定是否展示「模型 N 类 · 验证 xx%」。

---

## 四、不负责什么

- 不登录、不预警、不识病推理
- 不维护队员名单的后台（改源码里的数组）

---

## 五、小结

**静态介绍页 + 一次可选的 model-info。** 和监测业务解耦，合作社角色也能进。
