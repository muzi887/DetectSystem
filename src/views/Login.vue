<!-- src/views/Login.vue -->
<template>
  <div style="max-width: 420px; margin: 48px auto">
    <a-card title="登录">
      <a-form
        :model="form"
        @submit.prevent="onSubmit">
        <a-form-item label="手机号">
          <a-input
            v-model:value="form.phone"
            placeholder="请输入手机号" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input
            v-model:value="form.password"
            placeholder="请输入密码" />
        </a-form-item>
        <a-form-item>
          <a-button
            type="primary"
            block
            :loading="loading"
            @click="onSubmit">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter, useRoute } from 'vue-router'

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
        await store.loginApi(form.phone, form.password)
        // 跳转到目标页面
        const redirect = (route.query.redirect as string) || '/dashboard'
        await router.push(redirect)
      } catch (err: any) {
        console.error(err)
      } finally {
        loading.value = false
      }
    }
    return { form, onSubmit, loading }
  }
})
</script>
