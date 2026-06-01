---
title: 表单
tags:
  - Vue
  - 组件卡
created: 2025-10-19
---

# 组件卡：表单

## 用途
- 高性能表单控件，自带数据域管理。包含数据录入、校验以及对应样式
- 用于创建一个实体或收集信息。
- 需要对输入的数据类型进行校验时。
## API 设计
- 三种排列方式：
	- 水平排列：标签和表单控件水平排列；（默认）
	- 垂直排列：标签和表单控件上下垂直排列；
	- 行内排列：表单项水平行内排列。
- 表单一定会包含**表单域**，表单域可以是输入控件，标准表单域，标签，下拉菜单，文本域等。

## 代码骨架
```vue
<a-card title="登录">
  <a-form @submit.prevent="onSubmit" :model="form">
	<a-form-item label="手机号" >
	  <a-input v-model:value="form.phone" placeholder="请输入手机号" />
	</a-form-item>

	<a-form-item label="密码">
	  <a-input-password v-model:value="form.password" placeholder="请输入密码" />
	</a-form-item>

	<a-form-item>
	  <a-button type="primary" block @click="onSubmit" :loading="loading">登录</a-button>
	</a-form-item>
  </a-form>
</a-card>
```
## 例子

- 使用场景：

