<!-- src/layouts/AppLayout.vue -->
<template>
  <div class="app-layout-container">
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

    <!-- 导航栏 (使用 vue-router 的链接) -->
    <nav class="nav-bar">
      <router-link
        to="/"
        class="nav-item">
        首页
      </router-link>
      <router-link
        to="/related-data"
        class="nav-item">
        相关数据
      </router-link>
      <router-link
        to="/monitor"
        class="nav-item">
        灾害实时监测
      </router-link>
      <router-link
        to="/alerts"
        class="nav-item">
        灾害预警
      </router-link>
      <a
        href="#"
        class="nav-item">
        智能分析
      </a>
      <a
        href="#"
        class="nav-item">
        智慧决策
      </a>
      <a
        href="#"
        class="nav-item">
        关于我们
      </a>
    </nav>

    <!-- 这是一个插槽，不同页面的具体内容会在这里显示 -->
    <main class="content-slot">
      <slot></slot>
    </main>
  </div>
</template>
<style scoped>
.app-layout-container {
  width: 100vw;
  height: 100vh;
  background-image: url('@/assets/bg.webp'); /* 确保图片路径正确 */
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  color: #fff;
}

.content-slot {
  flex-grow: 1; /* 占据剩余所有空间 */
  padding: 20px 40px;
  overflow: auto; /* 如果内容过多，允许滚动 */
  display: flex;
  flex-direction: column;
}

/* --- 从 Login.vue 复制过来的样式，几乎不变 --- */
.app-layout-container {
  --primary-green: #677662;
  --dark-green: #4a5c43;
  --light-green: #eef1ea;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 40px;
  background-color: rgb(103 118 98 / 80%);
  backdrop-filter: blur(5px);
  flex-shrink: 0; /* 防止header被压缩 */
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

.nav-bar {
  display: flex;
  justify-content: center;
  background-color: rgb(135 149 128 / 90%);
  box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
  flex-shrink: 0; /* 防止nav-bar被压缩 */
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

/* vue-router 会为当前激活的链接添加这个 class */
.router-link-active.router-link-exact-active,
.nav-item.active {
  /* 保留 active 类以便手动控制 */
  background-color: var(--dark-green);
  font-weight: bold;
}
</style>
