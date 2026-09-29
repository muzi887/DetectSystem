# 任务 8：专题图进产物，SPA 回落到 Vercel

`public/satellite/catalog.json` 里的图片地址以 `/satellite-maps/` 开头。开发时由 Vite 插件从仓库根目录的 `satellite-maps/` 提供这些文件，Vercel 上没有这个插件。`pnpm build` 在 `vite build` 之后把该目录复制到 `dist/satellite-maps/`。

实际上线用 Vercel。`vercel.json` 把未知路径重写到 `/index.html`，已有的 `/assets/`、`/demo/`、`/satellite-maps/` 文件仍由平台直接返回。`netlify.toml` 和 `public/_redirects` 按计划留下，这次不部署到 Netlify。

专题图体积：248 个文件，986,746,473 字节（约 941 MiB）。按计划仍然复制，不从目录里删图。这个体积很可能超过 Vercel 单次部署上限，任务 12 部署前要单独处理，不能在这一步把图丢掉。

测试：`pnpm exec tsx --test src/demo/hostingSource.test.ts`，通过。

## 改动的文件

- [scripts/copy-satellite-maps.mjs](../../../../scripts/copy-satellite-maps.mjs)
- [package.json](../../../../package.json)
- [vercel.json](../../../../vercel.json)
- [netlify.toml](../../../../netlify.toml)
- [public/_redirects](../../../../public/_redirects)
- [src/demo/hostingSource.test.ts](../../../../src/demo/hostingSource.test.ts)

## 代码

### package.json

```json
"build": "vite build && node scripts/copy-satellite-maps.mjs"
```

### vercel.json

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### scripts/copy-satellite-maps.mjs

```js
import { cpSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve('satellite-maps')
const dest = resolve('dist/satellite-maps')
if (!existsSync(src)) {
  console.error('missing satellite-maps/')
  process.exit(1)
}
if (!existsSync(resolve('dist'))) {
  console.error('missing dist/; run vite build first')
  process.exit(1)
}
rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log('copied satellite-maps to dist/satellite-maps')
```

### netlify.toml

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### public/_redirects

```text
/*    /index.html   200
```
