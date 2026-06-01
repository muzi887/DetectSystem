---
tags:
  - 踩坑卡
  - Web
  - HTTP
date: 2025-10-20
---

# 🪤踩坑卡：ts项目使用json-server

## 💥问题描述
### ❌ `Error: Must use import to load ES Module: ...\src\mock\server.ts`

说明：

1. 你的项目在 `package.json` 中声明了 `"type": "module"`，因此 Node.js 按 **ESM 模式** 运行。
    
2. `ts-node-dev` 是基于 **CommonJS (CJS)** 的运行工具，它尝试用 `require()` 加载你的 `server.ts` 文件。
    
3. Node.js 阻止了这种行为，因为 **ESM 模块只能用 `import` 加载**。
    

虽然你添加了 `--esm` 参数，但 `ts-node-dev` 对 ESM 的兼容性不稳定，经常报类似错误。

### ⚠️ `ERR_MODULE_NOT_FOUND`

这说明 `tsx` 已经启动成功，但在加载 `json-server` 时失败。

出现原因是你使用了 `"json-server": "1.0.0-beta.3"` ——  
这个 **beta 版本对 ESM 支持存在缺陷**，其 `package.json` 的 `exports` 字段配置错误，导致 Node.js 无法正确解析入口文件。

✅ **解决方法：换成稳定版**

```bash
pnpm add json-server@0.17.4 -D
```

(注意：`@0.17.4` 是版本号，`-D` 是 `devDependencies`)
## 🔍排查过程
1. 首先尝试在 ESM 项目中使用 `ts-node-dev` 启动 mock 服务，报错提示需使用 import 加载模块。
2. 尝试添加 `--esm` 标志后依然报错。
3. 改用 `tsx` 启动，发现 `json-server` 加载失败。
4. 检查版本号后发现使用的是 `1.0.0-beta.3`，降级为 `0.17.4` 后恢复正常
## ✅解决方案
- 使用 `tsx` 替代 `ts-node-dev`
- 
> `tsx` 是专为现代 TypeScript + ESM 项目设计的 CLI 工具，  
> 它内置 watch 功能，支持零配置热重载，能完美取代 `ts-node-dev`。

修改 `package.json`：
```json
"mock": "tsx watch src/mock/server.ts"
```
## 🧠知识联想
- **CJS vs ESM**
    
    - CommonJS 用 `require`/`module.exports`
        
    - ESModule 用 `import`/`export`
        
    - 两者加载机制完全不同，混用会出错。
        
- **`tsx` 的优势**
    
    - 原生支持 ESM / TSX / TS
        
    - 无需额外配置
        
    - 自带 `watch` 热重载
        
    - 适配 Node.js 18+ 默认 ESM 模式
        
- **`json-server` 版本差异**
    
    - `1.0.0-beta.*` 是未稳定测试版本
        
    - `0.17.4` 是当前最兼容、最主流的稳定版
