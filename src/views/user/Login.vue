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
/* 引入宋体 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.login-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 增加卡片之间的间距 */
  gap: 60px;
  padding: 0 40px;

  /* 确保在小屏幕高度下也能滚动，防止被截断 */
  overflow-y: auto;
}

/* === 左侧卡片：图片 (大幅加大) === */
.left-card {
  /* 宽度加大 */
  width: 750px;

  /* 高度加大 */
  height: 550px;
  border-radius: 24px;
  overflow: hidden;

  /* 阴影加深，更有立体感 */
  box-shadow: 0 20px 50px rgb(0 0 0 / 40%);
  border: 3px solid rgb(255 255 255 / 15%);
  flex-shrink: 0;
}

.wheat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;

  /* 稍微降低亮度，让图片更有质感，不刺眼 */
  filter: brightness(0.95) contrast(1.1);
}

/* === 右侧卡片：登录框 (大幅加高、加宽) === */
.right-card {
  /* 宽度加大 */
  width: 460px;

  /* 高度大幅拉高，形成修长的视觉效果 */
  height: 700px;

  /* 玻璃拟态背景 */
  background: rgb(255 255 255 / 10%);
  backdrop-filter: blur(25px);
  backdrop-filter: blur(25px);
  border-radius: 24px;
  border: 1px solid rgb(255 255 255 / 20%);
  box-shadow: 0 20px 50px rgb(0 0 0 / 30%);
  display: flex;
  flex-direction: column;

  /* 让内容在垂直方向分散对齐，填满高度 */
  justify-content: center;

  /* 增加内部内边距 */
  padding: 60px 50px;
  position: relative;
}

/* 标题样式 */
.login-title {
  font-family: 'Noto Serif SC', serif;

  /* 字体放大 */
  font-size: 36px;
  color: #fff;
  margin-bottom: 15px;
  font-weight: bold;
  letter-spacing: 3px;
}

.title-line {
  width: 60px;
  height: 5px;
  background-color: #4a5c43;
  margin-bottom: 40px;
  border-radius: 3px;
}

/* 输入框上方的文字 Label */
.input-label {
  color: rgb(255 255 255 / 90%);

  /* 字体放大 */
  font-size: 16px;
  margin-bottom: 10px;
  font-family: 'Noto Serif SC', serif;
  font-weight: bold;
}

/* === 输入框深度定制 === */
.custom-input {
  /* 输入框高度加大 */
  height: 55px;
  background-color: rgb(55 75 50 / 60%) !important;
  border: 1px solid rgb(255 255 255 / 20%) !important;
  border-radius: 8px;
  color: white !important;

  /* 输入文字放大 */
  font-size: 18px;
  padding-left: 15px;
}

:deep(.ant-input) {
  background-color: transparent !important;
  color: white !important;
  font-size: 18px; /* 确保输入文字也是大号 */
}

:deep(.ant-input-password-icon) {
  color: rgb(255 255 255 / 80%) !important;
  font-size: 18px;
}

/* 复选框区域调整 */
:deep(.ant-form-item) {
  /* 增加表单项之间的间距 */
  margin-bottom: 30px;
}

.custom-checkbox {
  color: rgb(255 255 255 / 80%);
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
}

:deep(.ant-checkbox-inner) {
  width: 18px;
  height: 18px;
  background-color: rgb(55 75 50 / 70%);
  border-color: rgb(255 255 255 / 40%);
}

/* === 按钮样式 === */
.submit-btn {
  /* 按钮高度加大 */
  height: 60px;
  background-color: #3d5238 !important;
  border: none !important;
  border-radius: 8px;

  /* 按钮文字放大 */
  font-size: 22px;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 6px;
  box-shadow: 0 6px 15px rgb(0 0 0 / 40%);
  margin-top: 10px;
  font-weight: bold;
}

.submit-btn:hover {
  background-color: #4f6848 !important;
  transform: translateY(-2px);
}

/* === 底部链接 === */
.form-footer {
  text-align: center;
  margin-top: 30px;
  font-size: 16px;
}

.link-text {
  color: rgb(255 255 255 / 70%);
  text-decoration: none;
  transition: color 0.3s;
  font-family: 'Noto Serif SC', serif;
}

.link-text:hover {
  color: #fff;
  text-decoration: underline;
}

.divider {
  margin: 0 15px;
  color: rgb(255 255 255 / 30%);
}

/* 响应式适配：防止大屏设计在笔记本上溢出 */
@media (height <= 900px) {
  .left-card {
    height: 450px;
    width: 600px;
  }

  .right-card {
    height: 600px;
    padding: 40px 30px;
  }
}

/* 移动端适配 */
@media (width <= 1200px) {
  .login-content-wrapper {
    flex-direction: column;
    gap: 30px;
    padding: 40px 20px;
    height: auto; /* 允许滚动 */
  }

  .left-card {
    width: 100%;
    max-width: 600px;
    height: 300px;
  }

  .right-card {
    width: 100%;
    max-width: 500px;
    height: auto;
    padding: 40px 30px;
  }
}
</style>
