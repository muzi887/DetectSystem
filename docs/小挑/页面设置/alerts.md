### 新的、更优的策略：引流与聚焦

你的 `Dashboard.vue` 应该扮演一个 **“信息摘要和引流中心”**的角色，而不是一个“小型的功能复刻版”。

它的核心目标应该是：**用最少的空间，告诉用户最重要的信息，并引导他们去正确的页面执行复杂操作。**

#### 如何改造 `Dashboard.vue` 的“系统概览”卡片？

我们不需要新建一个卡片，而是直接**“升级”你现有的“系统概览”卡片**，让它变得可交互，成为一个高效的引流入口。

**修改方案：**

将原来纯展示的 `<a-statistic>` 组件，包裹在 `<router-link>` 标签里，或者添加 `@click` 事件，让它们可以被点击，并跳转到对应的详情页面。

**`Dashboard.vue` 修改示例：**

```html
<!-- 在 Dashboard.vue 的模板中 -->
<a-card title="系统概览" style="flex: 1 1 600px; min-width: 360px">
  <a-row :gutter="16">
    <!-- 1. 点击“监测点数量”，跳转到地图监测页 -->
    <a-col :span="6">
      <router-link to="/monitor">
        <a-statistic title="监测点数量" :value="pointsCount" />
      </router-link>
    </a-col>

    <!-- 2. 点击“未处理预警”，跳转到功能完备的 Alerts.vue 页面！ -->
    <a-col :span="6">
      <router-link to="/alerts">
        <a-statistic
          title="未处理预警"
          :value="unhandledCount"
          :value-style="{ color: '#cf1322' }" <!-- 让数字更醒目 -->
        />
      </router-link>
    </a-col>

    <!-- 3. 点击“高危预警”，也可以跳转到 Alerts.vue，并带上筛选参数（高级功能） -->
    <a-col :span="6">
      <!-- 简单版：直接跳转 -->
      <router-link to="/alerts">
        <a-statistic title="高危预警" :value="highRiskCount" />
      </router-link>
    </a-col>

    <a-col :span="6">
      <a-statistic title="系统状态" value="正常" />
    </a-col>
  </a-row>
  
  <!-- ...其他内容... -->
</a-card>
```

**为了让可点击的样式更友好，可以加一点 CSS：**

```css
/* 在 Dashboard.vue 的 <style> 标签中 */
.ant-statistic {
  cursor: pointer;
  transition: transform 0.2s;
}
.ant-statistic:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 4px;
}
```

---

### 这样做的巨大好处

1. **职责清晰，毫无冗余**：
    
    - `Dashboard.vue` 负责**“告诉你现在有 X 件未处理的事情”**（概览和引流）。
    - `Alerts.vue` 负责**“让你处理这 X 件事情”**（具体功能）。  
        这完美地避免了功能重叠。
2. **用户路径非常顺滑**：
    
    - 用户登录，看到仪表盘。
    - 一眼扫到“未处理预警”的红色数字，心里有数。
    - **直接点击这个数字**，无缝跳转到 `Alerts.vue` 页面。
    - 在 `Alerts.vue` 这个功能强大的页面上，从容地进行分页、筛选、处理等所有操作。
3. **代码维护成本低**：  
    你不需要在 `Dashboard.vue` 里再写一遍获取、排序、截取预警数据的逻辑。所有关于预警的操作都集中在 `Alerts.vue` 和 `dataStore` 中，维护起来非常轻松。
    

