<template>
  <AppLayout>
    <div class="login-content-wrapper">
      <!-- 左侧：纯图片展示 (宽一点) -->
      <div class="left-card">
        <img
          src="@/assets/wheat.jpg"
          class="wheat-img"
          alt="Wheat" />
      </div>

      <!-- 右侧：登录表单 (高一点，长一点，独立分开) -->
      <div class="right-card">
        <h3 class="login-title">密码登录</h3>
        <div class="title-line"></div>

        <a-form
          class="login-form"
          :model="form"
          @finish="onSubmit">
          <a-form-item
            name="phone"
            :rules="[{ required: true, message: '请输入手机号!' }]">
            <div class="input-label">账号</div>
            <a-input
              v-model:value="form.phone"
              placeholder="手机号/用户名"
              class="custom-input" />
          </a-form-item>

          <a-form-item
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]">
            <div class="input-label">密码</div>
            <a-input-password
              v-model:value="form.password"
              placeholder="请输入密码"
              class="custom-input" />
          </a-form-item>

          <a-form-item>
            <a-checkbox class="custom-checkbox">我已阅读并同意用户协议</a-checkbox>
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block
              class="submit-btn">
              立即登录
            </a-button>
          </a-form-item>
        </a-form>

        <div class="form-footer">
          <a
            href="#"
            class="link-text">
            忘记密码?
          </a>
          <span class="divider">|</span>
          <a
            href="#"
            class="link-text">
            去注册
          </a>
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
import AppLayout from '@/layouts/AppLayout.vue'

const form = reactive({ phone: '', password: '' })
const loading = ref(false)
const store = useUserStore()
const router = useRouter()
const route = useRoute()

async function onSubmit() {
  loading.value = true
  try {
    const res = await store.loginApi(form.phone, form.password)
    if (res && res.token) {
      message.success('登录成功！')
      const redirect = (route.query.redirect as string) || '/home'
      await router.push(redirect)
    } else {
      message.error(res?.message || '登录失败')
    }
  } catch (err: any) {
    message.error('登录失败，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 引入宋体，还原图片质感 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.login-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 左右卡片之间的间距 */
  gap: 30px;
  padding: 0 40px;
}

/* === 左侧卡片：图片 === */
.left-card {
  width: 550px; /* 宽一点 */
  height: 400px; /* 比右边矮一点 */
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgb(0 0 0 / 30%);
  border: 2px solid rgb(255 255 255 / 20%);
  flex-shrink: 0;
}

.wheat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  /* 稍微调暗一点图片，显得更有质感 */
  filter: brightness(0.9);
}

/* === 右侧卡片：登录框 === */
.right-card {
  width: 380px;
  height: 520px; /* 关键点：这里设置得比左边高，形成“长一点”的效果 */

  /* 玻璃拟态背景 */
  background: rgb(255 255 255 / 10%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgb(255 255 255 / 20%);
  box-shadow: 0 15px 40px rgb(0 0 0 / 20%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 35px;
  position: relative;
}

/* 标题样式 */
.login-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #fff;
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 2px;
}

.title-line {
  width: 40px;
  height: 4px;
  background-color: #4a5c43; /* 深绿色装饰条 */
  margin-bottom: 30px;
  border-radius: 2px;
}

/* 输入框上方的文字 Label */
.input-label {
  color: rgb(255 255 255 / 80%);
  font-size: 14px;
  margin-bottom: 6px;
  font-family: 'Noto Serif SC', serif;
}

/* === 输入框深度定制 (还原图片中的深绿条) === */
.custom-input {
  height: 45px;

  /* 图片里那种深墨绿色背景 */
  background-color: rgb(55 75 50 / 70%) !important;
  border: 1px solid rgb(255 255 255 / 15%) !important;
  border-radius: 6px;
  color: white !important;
  font-size: 15px;
}

:deep(.ant-input) {
  background-color: transparent !important; /* 让 input 继承外层颜色 */
  color: white !important;
}

:deep(.ant-input-password-icon) {
  color: rgb(255 255 255 / 70%) !important;
}

/* 占位符颜色 */
:deep(input::placeholder) {
  color: rgb(255 255 255 / 40%);
}

/* 聚焦效果 */
:deep(.ant-input-affix-wrapper-focused),
:deep(.ant-input:focus) {
  box-shadow: 0 0 0 2px rgb(255 255 255 / 20%) !important;
  border-color: rgb(255 255 255 / 50%) !important;
}

/* 复选框 */
.custom-checkbox {
  color: rgb(255 255 255 / 70%);
  font-family: 'Noto Serif SC', serif;
}

:deep(.ant-checkbox-inner) {
  background-color: rgb(55 75 50 / 70%);
  border-color: rgb(255 255 255 / 30%);
}

/* === 按钮样式 === */
.submit-btn {
  height: 48px;

  /* 纯深绿色，不透明，还原图片 */
  background-color: #3d5238 !important;
  border: none !important;
  border-radius: 6px;
  font-size: 18px;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 4px;
  box-shadow: 0 4px 10px rgb(0 0 0 / 30%);
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #4f6848 !important;
}

/* === 底部链接 === */
.form-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.link-text {
  color: rgb(255 255 255 / 60%);
  text-decoration: none;
  transition: color 0.3s;
  font-family: 'Noto Serif SC', serif;
}

.link-text:hover {
  color: #fff;
}

.divider {
  margin: 0 10px;
  color: rgb(255 255 255 / 20%);
}

/* 响应式：小屏幕变垂直排列 */
@media (width <= 1000px) {
  .login-content-wrapper {
    flex-direction: column;
    gap: 20px;
    height: auto;
    padding: 40px 20px;
  }

  .left-card {
    width: 100%;
    max-width: 400px;
    height: 250px;
  }

  .right-card {
    width: 100%;
    max-width: 400px;
    height: auto;
    padding: 30px 20px;
  }
}
</style>
