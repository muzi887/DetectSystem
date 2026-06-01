---
title: 可视化图表库
tags:
  - 原理卡
  - JS
created: 2025-10-20
---

# 🌱原理卡：可视化图表库

> [!NOTE] **定义**：  
> 一个由百度开源的可视化图表库，使用 JavaScript 实现，提供直观、生动、可交互的数据可视化图表。

---

## 关键点
### 主要图表类型

|类别|图表类型|
|---|---|
|**基础图表**|折线图、柱状图、饼图、散点图|
|**统计图表**|箱形图、雷达图、热力图|
|**地理可视化**|地图、航线图、散点地图|
|**关系数据**|关系图、树图、矩形树图|
|**3D 可视化**|3D 地球、3D 柱状图、曲面图|

---

## 代码示例

```html
    <div>

      <!-- 预警管理模块 -->

      <a-card title="预警管理">

        <template #extra>

          <a-button

            type="primary"

            size="small"

            @click="showCreateModal">

            新建预警

          </a-button>

          <a-button

            size="small"

            style="margin-left: 8px"

            @click="fetchAlerts">

            刷新

          </a-button>

        </template>

  

        <a-list

          :dataSource="dataStore.alerts"

          :loading="dataStore.loading"

          :pagination="{

            pageSize: 5,

            showSizeChanger: false,

            showQuickJumper: false

          }">

          <template #renderItem="{ item }">

            <a-list-item>

              <a-list-item-meta :description="item.message">

                <template #title>

                  <a-tag :color="getLevelColor(item.level)">

                    {{ getLevelText(item.level) }}

                  </a-tag>

                  {{ `监测点 #${item.pointId}` }}

                  <a-tag

                    :color="item.handled ? 'green' : 'red'"

                    style="margin-left: 8px">

                    {{ item.handled ? '已处理' : '待处理' }}

                  </a-tag>

                </template>

              </a-list-item-meta>

  

              <template #actions>

                <a

                  v-if="!item.handled"

                  @click="handleToggle(item)">

                  标记解决

                </a>

                <a @click="handleDelete(item.id)">删除</a>

              </template>

            </a-list-item>

          </template>

  

          <template #empty>

            <a-empty description="暂无预警信息" />

          </template>

        </a-list>

      </a-card>
```

---

## ❗ 易错点
- 

