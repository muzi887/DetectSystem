import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path' // 引入nodejs的path模块
import checker from 'vite-plugin-checker'
import AutoImport from 'unplugin-auto-import/vite' // 这个插件是为了解决在开发中的导入问题

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 根据命令设置 NODE_ENV
  if (command === 'build') {
    process.env.NODE_ENV = 'production'
    mode = 'production'
  } else {
    process.env.NODE_ENV = 'development'
    mode = 'development'
  }
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 第二个参数：process.cwd()表示返回运行当前脚本的工作目录的路径（current work directory）
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  console.log('env:', env, ',mode:', mode, ',command:', command)
  return {
    plugins: [
      vue(),
      //文件保存时或开发服务器启动时，自动检查代码
      checker({
        typescript: true,
        vueTsc: true // 开启 Vue 文件的 TypeScript 检查
      }),
      AutoImport({
        dts: 'types/auto-imports.d.ts', // 生成配置文件，如果是ts项目，通常我们会把声明文件放在根目录/types中
        // 预设负责告诉插件应该自动引入哪些内容
        imports: [
          'vue', // 自动导入 Vue 相关的 API
          'vue-router', // 自动导入 Vue Router 相关的 API
          'pinia',
          {
            axios: [
              ['default', 'axios'] // import { default as axios } from 'axios',
            ]
          }
        ],
        eslintrc: {
          enabled: false, // 默认false, true启用。生成一次就可以，避免每次工程启动都生成，一旦生成配置文件之后，最好把enable关掉，即改成false
          // 否则这个文件每次会在重新加载的时候重新生成，这会导致eslint有时会找不到这个文件。当需要更新配置文件的时候，再重新打开
          filepath: './.eslintrc-auto-import.json', // 生成json文件,可以不配置该项，默认就是将生成在根目录
          globalsPropValue: true
        }
      })
    ],
    // ******resolver配置******
    resolve: {
      // 配置路径别名
      alias: {
        // 如果报错__dirname找不到，需要安装node,执行npm install @types/node --save-dev
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: 5173,
      proxy: {
        // 1. 先匹配最长、最具体的路径：智能分析接口 -> 转发给 Flask
        '/api/analysis': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
          // 只要你的 Flask 路由是 @app.route('/api/analysis/image')，这里就不需要 rewrite
        },

        // 2. 再匹配剩下的通用路径：其他数据接口 -> 转发给 json-server
        '/api': {
          target: 'http://localhost:3000', // 假设你的 json-server 在 3000
          changeOrigin: true,
          // 【重要】json-server 通常没有 /api 前缀，需要把它去掉
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
