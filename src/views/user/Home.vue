<!-- src/views/user/Home.vue -->
<template>
  <div class="login-page-container">
    <!-- 顶部 Header -->
    <header class="header">
      <div class="logo-area">
        <img
          src="@/assets/logo.jpg"
          alt="Logo"
          class="logo-img" />
        <span class="title">AI技术赋能下的作物灾害智慧监测预警系统</span>
      </div>
      <div class="search-area">
        <a-input-search
          placeholder="输入关键字..."
          style="width: 250px"
          enter-button="搜索" />
      </div>
    </header>

    <!-- 导航栏 -->
    <nav class="nav-bar">
      <router-link
        to="/home"
        class="nav-item">
        首页
      </router-link>

      <router-link
        to="/related-data"
        class="nav-item">
        相关数据
      </router-link>
      <router-link
        to="/map"
        class="nav-item">
        灾害实时监测
      </router-link>
      <router-link
        to="/analysis"
        class="nav-item">
        智能分析
      </router-link>
      <router-link
        to="/warnings"
        class="nav-item">
        灾害预警
      </router-link>
      <router-link
        to="/decision"
        class="nav-item">
        智慧决策
      </router-link>
      <router-link
        to="/about"
        class="nav-item">
        关于我们
      </router-link>
    </nav>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 左侧麦穗图片面板 (装饰性) -->
      <div class="info-panel">
        <img
          src="@/assets/wheat.jpg"
          class="info-panel-img" />
      </div>

      <!-- 右侧登录表单 (核心功能) -->
      <div class="login-panel">
        <h3 class="login-title">密码登录</h3>
        <!--
          - 使用 Ant Design Vue 的 a-form
          - @finish 事件会在表单验证通过后触发，等同于之前的 @submit
          - 它会自动调用 onSubmit 方法
        -->
        <a-form
          class="login-form"
          :model="form"
          @finish="onSubmit">
          <a-form-item
            name="phone"
            :rules="[{ required: true, message: '请输入手机号!' }]">
            <!-- v-model:value="form.phone" 绑定到你已有的 form 对象 -->
            <a-input
              v-model:value="form.phone"
              placeholder="手机号/用户名" />
          </a-form-item>
          <a-form-item
            name="password"
            :rules="[{ required: true, message: '请输入密码!' }]">
            <!-- v-model:value="form.password" 绑定到你已有的 form 对象 -->
            <a-input-password
              v-model:value="form.password"
              placeholder="密码" />
          </a-form-item>
          <a-form-item>
            <a-checkbox>记住登录状态与用户协议</a-checkbox>
          </a-form-item>
          <a-form-item>
            <!--
              - html-type="submit" 让按钮可以触发表单的 finish 事件
              - :loading="loading" 保留了你之前的加载状态
            -->
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block>
              立即登录
            </a-button>
          </a-form-item>
        </a-form>
        <div class="login-extra">
          <a href="#">忘记密码?</a>
        </div>
      </div>
    </main>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue' // 引入 message 用于错误提示

export default defineComponent({
  setup() {
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
          // 若后端返回的结构不同，按需调整此处提示
          message.error(res?.message || '登录失败，请检查手机号或密码')
        }
      } catch (err: any) {
        message.error('登录失败，请检查手机号或密码')
        console.error('Login API request failed:', err)
      } finally {
        loading.value = false
      }
    }
    return { form, onSubmit, loading }
  }
})
</script>

<style scoped>
/* 整个页面的样式 */
.login-page-container {
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/bg.webp');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  color: #fff;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑',
    Arial, sans-serif;
}

/* 颜色变量 */
.login-page-container {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
}

/* 顶部 Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: rgb(103 118 98 / 80%);
  backdrop-filter: blur(5px);
}

.logo-area {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
  margin-right: 15px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.search-area :deep(.ant-input-search-button) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  color: white !important;
}

.search-area :deep(.ant-input) {
  background-color: var(--light-green) !important;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  justify-content: center;
  background-color: rgb(135 149 128 / 90%);
  box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
}

.nav-item {
  padding: 12px 25px;
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgb(0 0 0 / 10%);
}

.nav-item.active {
  background-color: var(--dark-green);
  font-weight: bold;
}

/* 主体内容 */
.main-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
  padding: 40px;
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

.info-panel {
  width: 55%;
  height: 60%;
  max-width: 800px;
}

.info-panel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.login-panel {
  width: 320px;
  padding: 20px 30px;
}

.login-title {
  color: #fff;
  text-align: left;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary-green);
  display: inline-block;
}

.login-form ::v-deep(.ant-input-affix-wrapper),
.login-form ::v-deep(.ant-input) {
  background-color: rgb(255 255 255 / 80%) !important;
  border-radius: 4px;
}

.login-form ::v-deep(.ant-form-item-label > label) {
  color: #fff; /* 虽然没显示label，但以防万一 */
}

.login-form ::v-deep(.ant-checkbox-wrapper) {
  color: var(--light-green);
}

.login-form ::v-deep(.ant-btn-primary) {
  background-color: var(--dark-green) !important;
  border-color: var(--dark-green) !important;
  height: 40px;
  font-size: 16px;
}

.login-extra {
  margin-top: 10px;
  text-align: right;
}

.login-extra a {
  color: var(--light-green);
  font-size: 12px;
}
</style>
