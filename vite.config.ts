import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import checker from 'vite-plugin-checker'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    process.env.NODE_ENV = 'production'
    mode = 'production'
  } else {
    process.env.NODE_ENV = 'development'
    mode = 'development'
  }

  const env = loadEnv(mode, process.cwd(), 'VITE_')
  console.log('env:', env, ',mode:', mode, ',command:', command)

  return {
    plugins: [
      vue(),
      checker({
        typescript: true,
        vueTsc: true
      }),
      AutoImport({
        dts: 'types/auto-imports.d.ts',
        imports: ['vue', 'vue-router', 'pinia', { axios: [['default', 'axios']] }],
        eslintrc: {
          enabled: false,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      host: '127.0.0.1',
      allowedHosts: true,
      port: 5173,
      proxy: {
        '/api/analysis': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
        },
        '/api/treatments': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
