<template>
  <AppLayout>
    <div class="login-viewport">
      <div class="image-card">
        <picture>
          <source
            :srcset="wheatWebp"
            type="image/webp" />
          <img
            :src="wheatJpg"
            class="wheat-img"
            alt="麦田"
            loading="lazy"
            decoding="async" />
        </picture>
      </div>

      <div class="login-card">
        <h3 class="login-title">农情通行登录</h3>
        <div class="title-underline"></div>

        <a-form
          class="login-form"
          :model="form"
          @finish="onSubmit">
          <a-form-item name="phone">
            <div class="input-label">手机号</div>
            <a-input
              v-model:value="form.phone"
              placeholder="请输入演示手机号"
              class="custom-input" />
          </a-form-item>

          <a-form-item name="verificationCode">
            <div class="input-label">演示验证码</div>
            <a-input
              v-model:value="form.verificationCode"
              placeholder="默认验证码 2026"
              class="custom-input" />
          </a-form-item>

          <a-form-item name="role">
            <div class="input-label">登录角色</div>
            <a-select
              v-model:value="form.role"
              class="role-select"
              popupClassName="farm-role-dropdown">
              <a-select-option value="admin">管理员</a-select-option>
              <a-select-option value="agronomist">农技员</a-select-option>
              <a-select-option value="cooperative">合作社</a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item name="password">
            <div class="input-label">备用密码</div>
            <a-input-password
              v-model:value="form.password"
              placeholder="旧演示密码仍可用"
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
              进入系统
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
import { useUserStore, type FarmUserRole } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import wheatJpg from '@/assets/wheat.jpg'
import wheatWebp from '@/assets/wheat.webp'

const form = reactive({
  phone: '13800000000',
  verificationCode: '2026',
  role: 'agronomist' as FarmUserRole,
  password: ''
})
const loading = ref(false)
const store = useUserStore()
const router = useRouter()
const route = useRoute()

async function onSubmit() {
  loading.value = true
  try {
    const res = await store.loginApi({
      phone: form.phone,
      verificationCode: form.verificationCode,
      role: form.role,
      password: form.password
    })
    if (res && res.token) {
      message.success('登录成功！')
      const redirect = (route.query.redirect as string) || '/home'
      await router.push(redirect)
    } else {
      message.error(res?.message || '登录失败')
    }
  } catch (err: any) {
    message.error(err?.friendlyMessage || '登录失败，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-viewport {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  gap: clamp(40px, 8vw, 100px);
  padding: 0 40px;
  overflow-y: auto;
}

.image-card {
  flex: 1 1 auto;
  width: 100%;
  max-width: 1000px;
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
  object-fit: cover;
  filter: brightness(0.9) contrast(1.1);
  transition: transform 0.5s ease;
}

.image-card:hover .wheat-img {
  transform: scale(1.05);
}

.login-card {
  width: 350px;
  height: 600px;
  flex-shrink: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 50px 40px;
}

.login-title {
  font-family: var(--font-serif);
  font-size: 30px;
  color: var(--glass-text-primary);
  margin-bottom: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: var(--glass-title-shadow);
}

.title-underline {
  width: 50px;
  height: 4px;
  background-color: #4a5c43;
  margin-bottom: 35px;
  border-radius: 2px;
}

.input-label {
  color: var(--glass-text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
  font-family: var(--font-serif);
}

.custom-input {
  height: 50px;
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 6px;
  color: var(--glass-text-primary) !important;
  font-size: 16px;
  padding-left: 12px;
}

.role-select {
  width: 100%;
}

.role-select :deep(.ant-select-selector) {
  height: 50px !important;
  background-color: var(--glass-bg-input) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 6px !important;
  color: var(--glass-text-primary) !important;
  align-items: center;
}

.role-select :deep(.ant-select-selection-item) {
  color: var(--glass-text-primary);
  font-size: 16px;
}

:deep(.ant-input) {
  background-color: transparent !important;
  color: white !important;
}

:deep(.ant-input-password-icon) {
  color: var(--glass-text-muted) !important;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

.custom-checkbox {
  color: var(--glass-text-muted);
  font-family: var(--font-serif);
  font-size: 13px;
}

:deep(.ant-checkbox-inner) {
  background-color: var(--glass-bg-input);
  border-color: var(--glass-border-strong);
}

.submit-btn {
  height: 54px;
  background-color: #3d5238 !important;
  border: none !important;
  border-radius: 6px;
  font-size: 18px;
  font-family: var(--font-serif);
  letter-spacing: 4px;
  box-shadow: 0 4px 15px rgb(0 0 0 / 30%);
  font-weight: bold;
  margin-top: 5px;
}

.submit-btn:hover {
  background-color: #4f6848 !important;
  transform: translateY(-2px);
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

.footer-link {
  color: var(--glass-text-muted);
  text-decoration: none;
  font-family: var(--font-serif);
  font-size: 14px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: var(--glass-text-primary);
}

.divider {
  margin: 0 12px;
  color: rgb(255 255 255 / 20%);
}

@media (width <= 1200px) {
  .login-viewport {
    flex-direction: column;
    gap: 30px;
    padding: 40px 20px;
    height: auto;
    min-height: 100%;
  }

  .image-card {
    width: 100%;
    max-width: 600px;
    height: 300px;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    height: auto;
    padding: 40px 30px;
  }
}
</style>
