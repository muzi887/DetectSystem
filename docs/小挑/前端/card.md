---
tags: [组件卡, Vue]
created: 2025-10-18
component: 卡片
---

# 组件卡：卡片

## 用途
用于展示内容和操作

## API 设计
|属性|说明|类型|默认值|
|---|---|---|---|
|`title`|卡片标题|string|-|
|`bordered`|是否有边框|boolean|`true`|
|`size`|卡片尺寸|`default` \| `small`|`default`|
|`loading`|当卡片内容还在加载时，可以用这个展示占位|boolean|`false`|
|`hoverable`|鼠标移过时可浮起|boolean|`false`|
|`cover`|卡片封面|slot|-|
|`extra`|卡片右上角的操作区域|slot|-|
|`actions`|卡片操作组，位置在卡片底部|Array<slot>|-|

## 代码骨架
```vue
<template>
  <a-card title="默认尺寸的卡片">
    <p>卡片内容</p>
    <p>卡片内容</p>
    <p>卡片内容</p>
  </a-card>
</template>
```

## 例子

## 常用属性和功能

### 1. 标题和操作区
```vue
<template>
  <a-card 
    title="卡片标题" 
    :extra="<a href='#'>更多</a>"
  >
    <p>卡片内容...</p>
  </a-card>
</template>
```

### 2. 不同尺寸
```vue
<template>
  <a-space direction="vertical" style="width: 100%">
    <a-card title="小卡片" size="small">
      <p>小尺寸卡片内容</p>
    </a-card>
    
    <a-card title="默认卡片">
      <p>默认尺寸卡片内容</p>
    </a-card>
  </a-space>
</template>
```

### 3. 带封面图片
```vue
<template>
  <a-card
    hoverable
    style="width: 240px"
    cover="
      <img 
        alt='example' 
        src='https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png' 
      />
    "
  >
    <template #actions>
      <setting-outlined key="setting" />
      <edit-outlined key="edit" />
      <ellipsis-outlined key="ellipsis" />
    </template>
    
    <a-card-meta
      title="Europe Street beat"
      description="www.instagram.com"
    />
  </a-card>
</template>

<script setup>
import {
  SettingOutlined,
  EditOutlined,
  EllipsisOutlined
} from '@ant-design/icons-vue';
</script>
```

### 4. 网格布局（常用于仪表盘）
```vue
<template>
  <a-row :gutter="16">
    <a-col :span="8">
      <a-card title="数据统计1" :bordered="false">
        <p>内容</p>
      </a-card>
    </a-col>
    <a-col :span="8">
      <a-card title="数据统计2" :bordered="false">
        <p>内容</p>
      </a-card>
    </a-col>
    <a-col :span="8">
      <a-card title="数据统计3" :bordered="false">
        <p>内容</p>
      </a-card>
    </a-col>
  </a-row>
</template>
```

### 5. 加载状态
```vue
<template>
  <a-card :loading="true" title="卡片标题">
    这里的内容不会显示，因为正在加载
  </a-card>
</template>
```

## 在实际项目中的应用

### 用户信息卡片
```vue
<template>
  <a-card title="用户信息" style="width: 300px">
    <a-list item-layout="horizontal">
      <a-list-item>
        <a-list-item-meta
          description="高级用户"
          avatar="https://joeschmoe.io/api/v1/random"
          title="张三"
        />
      </a-list-item>
      <a-list-item>
        <span>邮箱</span>
        <span>zhangsan@example.com</span>
      </a-list-item>
      <a-list-item>
        <span>电话</span>
        <span>138****1234</span>
      </a-list-item>
    </a-list>
    
    <template #actions>
      <a-button type="primary">编辑</a-button>
      <a-button>重置密码</a-button>
    </template>
  </a-card>
</template>
```

### 数据展示卡片
```vue
<template>
  <a-card title="系统状态">
    <a-statistic title="CPU 使用率" :value="68.5" suffix="%" />
    <a-progress :percent="68.5" />
    
    <a-statistic title="内存使用" :value="2048" suffix="MB" />
    <a-progress :percent="50" />
  </a-card>
</template>
```

## 在你的项目中实践

你可以在之前创建的 Dashboard 页面中使用卡片：

```vue
<!-- src/views/Dashboard.vue -->
<template>
  <div style="padding: 24px">
    <a-page-header title="仪表盘" />
    
    <a-row :gutter="16" style="margin-top: 20px">
      <a-col :span="6">
        <a-card title="用户统计" :bordered="false">
          <a-statistic title="总用户数" :value="112893" />
        </a-card>
      </a-col>
      
      <a-col :span="6">
        <a-card title="订单统计" :bordered="false">
          <a-statistic title="今日订单" :value="1234" />
        </a-card>
      </a-col>
      
      <a-col :span="6">
        <a-card title="收入统计" :bordered="false">
          <a-statistic 
            title="本月收入" 
            :value="112893" 
            :precision="2" 
            suffix="元"
          />
        </a-card>
      </a-col>
      
      <a-col :span="6">
        <a-card title="系统状态" :bordered="false">
          <a-statistic title="正常运行" :value="99.9" suffix="%" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>
```

**总结**：`a-card` 是一个非常灵活的容器组件，可以用来展示各种类型的内容，是构建后台管理系统仪表盘、数据展示页面的核心组件之一。