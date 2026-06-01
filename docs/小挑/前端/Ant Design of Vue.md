---
title:
tags:
  - 原理卡
  - Vue
created: 2025-10-15
---

# 🌱原理卡：

> [!NOTE] **定义**：  
> 一个基于 Vue.js 的 UI 组件库，它实现了 Ant Design 的设计规 范。
> 

Ant Design 是阿巴巴集团推出的一套企业级设计系统，旨在提供致的视觉格 和户体验。Ant Design of Vue 提供了丰富的组件，可以快速构建质量的前端界 。

---

## [关键点](https://www.antdv.com/docs/vue/introduce)
- [github代码仓库](https://github.com/vueComponent/ant-design-vue)
### Ant Design Vue 重点学习顺序：

1. **[[Layout]]** - 页面布局
    
2. **[[Form]], Input** - 表单组件
    
3. **Card, Table** - 数据展示
    
4. **Message, Modal** - 反馈组件


---

## 代码示例
全局完整注册
```ts
import Antd from 'ant-design-vue'
import App from './App'
import 'ant-design-vue/dist.reset.css'

const app = createApp(App)
  
app.use(Antd).mount('#app')
```

---

## ❗ 易错点
- 

