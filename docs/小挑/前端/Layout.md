---
tags: [组件卡, Vue]
created: 2025-10-18
component: a-layout
---

# 组件卡：a-layout

## 用途
用于构建页面的整体结构
它通常和**头部**（`a-layout-header`）、**侧边栏**（`a-layout-sider`）、**内容区**（`a-layout-content`）、**底部**（`a-layout-footer`）这些子组件搭配使用。
## API 设计

```html
<template>
  <a-layout>
    <a-layout-header>Header</a-layout-header>
    <a-layout>
      <a-layout-sider>Sider</a-layout-sider>
      <a-layout-content>Content</a-layout-content>
    </a-layout>
    <a-layout-footer>Footer</a-layout-footer>
  </a-layout>
</template>
```

## 代码骨架
### 🔧 从零开始搭建基础布局

下面我们一步步创建一个典型的管理平台布局（顶部导航栏 + 侧边菜单栏 + 内容区）。

1.  **搭建基础框架**
    在项目的某个视图组件（例如 `src/views/Dashboard.vue`）或主布局组件中，写入以下代码。它定义了一个具有顶部导航和侧边栏的基本布局结构：

    ```html
    <template>
      <a-layout id="components-layout-demo-top-side-2">
        <!-- 顶部导航 -->
        <a-layout-header class="header">
          <div class="logo" />
          <a-menu
            theme="dark"
            mode="horizontal"
            :default-selected-keys="['2']"
            :style="{ lineHeight: '64px', float:'right' }"
          >
            <a-menu-item key="1">我的</a-menu-item>
            <a-menu-item key="2">消息</a-menu-item>
            <a-menu-item key="3">退出</a-menu-item>
          </a-menu>
        </a-layout-header>
        
        <a-layout>
          <!-- 侧边栏 -->
          <a-layout-sider width="200" style="background: #fff">
            <a-menu
              mode="inline"
              :default-selected-keys="['1']"
              :default-open-keys="['sub1']"
              :style="{ height: '100%', borderRight: 0 }"
            >
              <a-sub-menu key="sub1">
                <span slot="title"><a-icon type="user" />首页</span>
                <a-menu-item key="1">vue</a-menu-item>
                <a-menu-item key="2">react</a-menu-item>
                <a-menu-item key="3">layui</a-menu-item>
              </a-sub-menu>
              <a-sub-menu key="sub2">
                <span slot="title"><a-icon type="laptop" />行业使用</span>
                <a-menu-item key="5">医疗</a-menu-item>
                <a-menu-item key="6">教育</a-menu-item>
                <a-menu-item key="7">司法</a-menu-item>
              </a-sub-menu>
            </a-menu>
          </a-layout-sider>
          
          <!-- 主内容区 -->
          <a-layout style="padding: 0 24px 24px">
            <a-layout-content
              :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
            >
              这里是页面主要内容，可以通过路由动态切换。
              <router-view></router-view>
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </template>
    
    <script>
    export default {
      data() {
        return {
          collapsed: false,
        };
      },
    };
    </script>
    
    <style scoped>
    #components-layout-demo-top-side-2 .logo {
      width: 120px;
      height: 31px;
      background: rgba(255, 255, 255, 0.2);
      margin: 16px 28px 16px 0;
      float: left;
    }
    </style>
    ```

2.  **让侧边栏动起来：实现收起/展开**
    侧边栏的 `collapsible` 属性可以让它显示一个收起/展开的触发器，通过 `v-model` 绑定一个变量（例如 `collapsed`）来控制状态：

    ```html
    <a-layout-sider 
      collapsible 
      v-model="collapsed"
      width="200" 
      style="background: #fff"
    >
      <!-- 菜单内容 -->
    </a-layout-sider>
    ```
    在脚本的 `data` 中定义 `collapsed` 变量并初始化为 `false`（即默认展开）：
    ```javascript
    data() {
      return {
        collapsed: false,
      };
    },
    ```

3.  **集成路由**
    为了让主内容区（`a-layout-content`）能根据侧边栏或顶部的菜单导航显示不同的页面内容，你需要结合 Vue Router。在主内容区放置 `<router-view></router-view>` 标签，它就像是内容的动态插槽，根据当前路由显示对应的组件。

### 💡 实用技巧和最佳实践

-   **组件化拆分**：当布局变得复杂时，一个好习惯是将头部、侧边栏、内容区等拆分成独立的 `.vue` 组件，然后通过引入组件的方式组装布局。这使得代码更清晰、更易于维护。
-   **样式调整**：你可以通过覆盖默认的 CSS 样式来自定义布局的外观。Ant Design Vue 的 Layout 组件也提供了一些内置的样式属性，你可以灵活运用。
-   **响应式考虑**：Ant Design Vue 的布局组件本身具有一定的响应式特性，但在实际项目中，你可能需要根据不同的屏幕尺寸调整布局，例如在小屏幕下隐藏侧边栏。

### 🚧 常见问题与解决

-   **样式不生效**：请确保你已正确引入 Ant Design Vue 的样式文件。如果使用了按需引入，检查相关配置。
-   **菜单路由不匹配**：确保你的路由配置（在 `router/index.js` 中）正确，并且菜单项（如 `a-menu-item`）的 `key` 或路由路径与路由配置匹配。
-   **布局错乱**：检查自定义的 CSS 样式是否存在冲突，或者布局组件的嵌套结构是否符合预期。

### 🎯 下一步学习建议

-   **多动手尝试**：直接修改上面的示例代码，调整布局结构、样式，观察变化，这是最有效的学习方式。
-   **查阅具体组件文档**：Layout 常与 Menu（菜单）、Icon（图标） 等组件协同工作，建议你也熟悉这些组件的用法。
-   **参考官方示例**：Ant Design Vue 官网通常会在组件文档页面提供更多的布局示例，多看多练，慢慢就能找到感觉。

## 例子

- 使用场景：


