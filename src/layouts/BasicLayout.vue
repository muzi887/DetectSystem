<!-- src/layouts/BasicLayout.vue -->
<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible>
      <div
        class="logo"
        style="
          height: 48px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
        作物灾害系统
      </div>
      <a-menu
        theme="dark"
        mode="inline"
        :selectedKeys="[current]">
        <a-menu-item
          key="dashboard"
          @click="to('/dashboard')">
          仪表盘
        </a-menu-item>
        <a-menu-item
          key="monitor"
          @click="to('/monitor')">
          灾害监测
        </a-menu-item>
        <a-menu-item
          key="alerts"
          @click="to('/alerts')">
          预警中心
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <a-layout>
      <a-layout-header
        style="
          background: #fff;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
        <div>
          欢迎 —
          <strong>{{ store.userInfo.name || '访客' }}</strong>
        </div>
        <div>
          <a-button
            type="link"
            @click="logout">
            登出
          </a-button>
        </div>
      </a-layout-header>

      <a-layout-content style="margin: 16px">
        <slot />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const collapsed = ref(false)
    const to = (path: string) => router.push(path)
    const store = useUserStore()
    const router = useRouter()
    const current = 'dashboard'

    function logout() {
      store.logout()
      router.push('/login')
    }

    return { collapsed, to, store, router, current, logout }
  }
})
</script>
