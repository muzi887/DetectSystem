<template>
  <AppLayout>
    <div class="login-viewport">
      <!-- 左侧：独立的图片卡片 (宽、矮) -->
      <div class="image-card">
        <img
          src="@/assets/wheat.jpg"
          class="wheat-img"
          alt="Wheat" />
      </div>

      <!-- 右侧：独立的登录卡片 (窄、高、悬浮感) -->
      <div class="login-card">
        <h3 class="login-title">密码登录</h3>
        <div class="title-underline"></div>

        <a-form
          class="login-form"
          :model="form"
          @finish="onSubmit">
          <a-form-item name="phone">
            <div class="input-label">账号</div>
            <a-input
              v-model:value="form.phone"
              placeholder="手机号/用户名"
              class="custom-input" />
          </a-form-item>

          <a-form-item name="password">
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
            class="footer-link">
            忘记密码
          </a>
          <span class="divider">|</span>
          <a
            href="#"
            class="footer-link">
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
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.login-viewport {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 使用 clamp 函数让间距在 40px 到 100px 之间根据屏幕宽度自动伸缩 */
  gap: clamp(40px, 8vw, 100px);
  padding: 0 40px;
  overflow-y: auto;
}

/* === 左侧：图片卡片 === */
.image-card {
  /* 让宽度自动填充剩余空间，但最大不超过 1000px */
  flex: 1 1 auto;
  width: 100%;
  max-width: 1000px;

  /* 随屏幕高度变化 */
  height: 50vh;
  border-radius: 20px;
  border: 4px solid rgb(255 255 255 / 20%);
  box-shadow: 0 20px 40px rgb(0 0 0 / 50%);
  overflow: hidden;
  position: relative;
}

.wheat-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：保证图片铺满且不变形 */
  filter: brightness(0.9) contrast(1.1);
  transition: transform 0.5s ease;
}

.image-card:hover .wheat-img {
  transform: scale(1.05); /* 鼠标悬停微动效果 */
}

/* === 右侧：登录卡片 === */
.login-card {
  width: 350px;
  height: 600px;

  /* 新增：防止登录框被压缩，始终保持 350px */
  flex-shrink: 0;

  /* 独立的玻璃拟态 */
  background: rgb(255 255 255 / 10%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgb(255 255 255 / 20%);
  box-shadow: 0 20px 50px rgb(0 0 0 / 30%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 50px 40px; /* 内部留白 */
}

/* 标题 */
.login-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 30px;
  color: #fff;
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 2px;
}

.title-underline {
  width: 50px;
  height: 4px;
  background-color: #4a5c43;
  margin-bottom: 35px;
  border-radius: 2px;
}

/* 表单 Label */
.input-label {
  color: rgb(255 255 255 / 80%);
  font-size: 14px;
  margin-bottom: 8px;
  font-family: 'Noto Serif SC', serif;
}

/* === 输入框样式 (保持深绿色风格) === */
.custom-input {
  height: 50px;
  background-color: rgb(55 75 50 / 60%) !important;
  border: 1px solid rgb(255 255 255 / 20%) !important;
  border-radius: 6px;
  color: white !important;
  font-size: 16px;
  padding-left: 12px;
}

:deep(.ant-input) {
  background-color: transparent !important;
  color: white !important;
}

:deep(.ant-input-password-icon) {
  color: rgb(255 255 255 / 70%) !important;
}

/* 表单间距 */
:deep(.ant-form-item) {
  margin-bottom: 24px;
}

/* 复选框 */
.custom-checkbox {
  color: rgb(255 255 255 / 70%);
  font-family: 'Noto Serif SC', serif;
  font-size: 13px;
}

:deep(.ant-checkbox-inner) {
  background-color: rgb(55 75 50 / 60%);
  border-color: rgb(255 255 255 / 30%);
}

/* === 按钮 === */
.submit-btn {
  height: 54px;
  background-color: #3d5238 !important;
  border: none !important;
  border-radius: 6px;
  font-size: 18px;
  font-family: 'Noto Serif SC', serif;
  letter-spacing: 4px;
  box-shadow: 0 4px 15px rgb(0 0 0 / 30%);
  font-weight: bold;
  margin-top: 5px;
}

.submit-btn:hover {
  background-color: #4f6848 !important;
  transform: translateY(-2px);
}

/* 底部链接 */
.form-footer {
  text-align: center;
  margin-top: 20px;
}

.footer-link {
  color: rgb(255 255 255 / 60%);
  text-decoration: none;
  font-family: 'Noto Serif SC', serif;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #fff;
}

.divider {
  margin: 0 12px;
  color: rgb(255 255 255 / 20%);
}

/* === 响应式 === */

/* 建议把断点稍微调大一点（比如1200px），因为你的卡片比较宽，
   这样在中型屏幕（笔记本）上能更早切换为上下结构，体验更好 */
@media (width <= 1200px) {
  .login-viewport {
    flex-direction: column;
    gap: 30px;
    padding: 40px 20px; /* 稍微减少移动端的左右内边距 */
    height: auto; /* 允许内容撑开高度 */
    min-height: 100%; /* 保证背景铺满 */
  }

  .image-card {
    width: 100%;
    max-width: 600px; /* 移动端限制一下图片最大宽度 */
    height: 300px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    height: auto; /* 高度自适应 */
    padding: 40px 30px;
  }
}
</style>
