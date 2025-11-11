// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router' //  导入组装好的路由实例
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css' // 全局样式
import App from './App.vue'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router) // 使用导入的路由实例
app.use(Antd)
app.mount('#app')
