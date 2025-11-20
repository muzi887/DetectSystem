<!-- src/views/user/Login.vue -->
<template>
  <!-- 1. 使用 AppLayout 包裹，复用头部和导航 -->
  <AppLayout>
    <!-- 2. 内容容器：负责在剩余空间内居中显示内容 -->
    <div class="login-content-wrapper">
      <!-- 左侧麦穗图片面板 (装饰性) -->
      <div class="info-panel">
        <img
          src="@/assets/wheat.jpg"
          class="info-panel-img"
          alt="Welcome" />
      </div>

      <!-- 右侧登录表单 (核心功能) -->
      <div class="login-panel">
        <h3 class="login-title">密码登录</h3>
        <a-form
          class="login-form"
          :model="form"
          @finish="onSubmit">
          <a-form-item
            name="phone"
            :rules="[{ required: true, message: '请输入手机号!' }]">
            <a-input
              v-model:value="form.phone"
              placeholder="手机号/用户名"
              size="large" />
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]">
            <a-input-password
              v-model:value="form.password"
              placeholder="密码"
              size="large" />
          </a-form-item>

          <a-form-item>
            <a-checkbox class="white-checkbox">记住登录状态与用户协议</a-checkbox>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block
              size="large">
              立即登录
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-extra">
          <a href="#">忘记密码?</a>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
// 引入布局组件
import AppLayout from '@/layouts/AppLayout.vue'

const form = reactive({ phone: '', password: '' })
const loading = ref(false)
const store = useUserStore()
const router = useRouter()
const route = useRoute()

async function onSubmit() {
  loading.value = true
  try {
    // 调用登录函数
    const res = await store.loginApi(form.phone, form.password)

    if (res && res.token) {
      message.success('登录成功！')
      // 跳转到目标页面
      const redirect = (route.query.redirect as string) || '/home'
      await router.push(redirect)
    } else {
      message.error(res?.message || '登录失败，请检查手机号或密码')
    }
  } catch (err: any) {
    message.error('登录失败，请检查手机号或密码')
    console.error('Login API request failed:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 
  因为 AppLayout 使用了 scoped 样式，这里的变量需要重新定义。
  或者将其放入 assets/main.css 全局样式中。
*/
.login-content-wrapper {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;

  /* 核心布局：让内容在 AppLayout 提供的插槽中居中 */
  width: 100%;
  height: 100%; /* 填满父容器高度 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  gap: 50px; /* 图片和登录框之间的间距 */
}

/* 玻璃感面板通用样式 */
.info-panel,
.login-panel {
  background-color: rgb(255 255 255 / 10%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 30px rgb(0 0 0 / 10%);
  backdrop-filter: blur(12px);
  border: 1px solid rgb(255 255 255 / 20%);
}

/* 左侧图片区域 */
.info-panel {
  width: 55%;
  height: 65%; /* 稍微调高一点 */
  max-width: 800px;
  min-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-panel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* 右侧登录框区域 */
.login-panel {
  width: 360px; /* 稍微宽一点点 */
  padding: 30px;
}

.login-title {
  color: #fff;
  text-align: left;
  margin-bottom: 25px;
  font-size: 22px;
  font-weight: bold;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--primary-green);
  display: inline-block;
}

/* Ant Design 样式覆盖 */
.login-form :deep(.ant-input-affix-wrapper),
.login-form :deep(.ant-input) {
  background-color: rgb(255 255 255 / 80%) !important;
  border-radius: 6px;
  border: none;
}

.login-form :deep(.ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  height: 45px; /* 按钮高一点 */
  font-size: 16px;
  margin-top: 10px;
}

.login-form :deep(.ant-btn-primary:hover) {
  background-color: #5d7454 !important;
}

.white-checkbox {
  color: #eef1ea;
}

.login-form :deep(.ant-checkbox-wrapper) {
  color: #eef1ea;
}

.login-extra {
  margin-top: 15px;
  text-align: center;
}

.login-extra a {
  color: var(--light-green);
  font-size: 14px;
  text-decoration: underline;
  opacity: 0.8;
}

.login-extra a:hover {
  opacity: 1;
}

/* 响应式调整：当屏幕较窄时，上下排列 */
@media (width <= 900px) {
  .login-content-wrapper {
    flex-direction: column;
    height: auto;
    padding: 20px 0;
  }

  .info-panel {
    width: 100%;
    height: 200px; /* 变矮 */
    display: none; /* 手机端如果不想要图片可以隐藏，或者保留 */
  }

  .login-panel {
    width: 100%;
    max-width: 400px;
  }
}
</style>
