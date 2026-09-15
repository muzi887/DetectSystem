import { defineConfig, loadEnv, type PreviewServer, type ViteDevServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createReadStream, existsSync, statSync } from 'fs'
import { isAbsolute, relative, resolve } from 'path'
import checker from 'vite-plugin-checker'
import AutoImport from 'unplugin-auto-import/vite'

function satelliteMapsPlugin() {
  const mapsRoot = resolve(__dirname, 'satellite-maps')

  function attach(server: ViteDevServer | PreviewServer) {
    server.middlewares.use((req, res, next) => {
      const raw = req.url?.split('?')[0] ?? ''
      if (!raw.startsWith('/satellite-maps/')) {
        next()
        return
      }
      const rel = decodeURIComponent(raw.slice('/satellite-maps/'.length))
      const file = resolve(mapsRoot, rel)
      const relCheck = relative(mapsRoot, file)
      if (
        !relCheck ||
        relCheck.startsWith('..') ||
        isAbsolute(relCheck) ||
        !existsSync(file) ||
        !statSync(file).isFile()
      ) {
        res.statusCode = 404
        res.end()
        return
      }
      res.setHeader('Content-Type', 'image/jpeg')
      createReadStream(file).pipe(res)
    })
  }

  return {
    name: 'satellite-maps',
    configureServer(server: ViteDevServer) {
      attach(server)
    },
    configurePreviewServer(server: PreviewServer) {
      attach(server)
    }
  }
}

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
      satelliteMapsPlugin(),
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
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
