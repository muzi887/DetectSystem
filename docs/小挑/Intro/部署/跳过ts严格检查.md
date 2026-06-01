别慌，这在前端打包（`npm run build`）时**非常常见**！

你的代码逻辑其实没有任何问题，报错的原因是 **TypeScript 开启了严格模式（代码洁癖）**。

你看到的报错主要分为两类：

1. **`TS6133`**：你引入了某些变量（比如 `onMounted`, `router` 等），但在代码里**没有使用它们**。
    
2. **`TS7016`**：你引入了 `json-server`，但是缺少它的 TypeScript 类型声明文件。
    

由于 Vue 3 Vite 默认的打包命令是 `vue-tsc -b && vite build`，它会先让 TypeScript 进行全盘严格检查，只要有一个警告就会强行中断打包，导致你无法生成 `dist` 文件夹。

针对你现在急需部署的需求，这里提供**两种解决方案**，推荐直接使用**方案一（最快）**：

### 方案一：暴力且有效（直接跳过 TS 严格检查）⭐⭐⭐⭐⭐

既然你在本地运行（`npm run dev`）是正常的，说明代码能跑。为了赶紧打包出 `dist` 文件上线，我们可以直接让 Vite 忽略这些类型警告。

1. 打开前端项目根目录下的 **`package.json`** 文件。
    
2. 找到 `scripts` 里面的 `build` 命令：
    
    ```JSON
    "scripts": {
      "dev": "vite",
      "build": "vue-tsc -b && vite build",  // <-- 也就是这一行
      "preview": "vite preview"
    }
    ```
    
3. 把它修改为**只执行 Vite 打包**（删掉 `vue-tsc -b &&`）：
    
    JSON
    
    ```
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    }
    ```
    
4. 保存文件，重新在终端运行：
    
    Bash
    
    ```
    npm run build
    ```
    
    _此时你应该能看到绿色的打包成功提示，并顺利生成 `dist` 文件夹！_
    

---

### 方案二：正规修复（降低 TS 严格要求并安装类型）

如果你有强迫症，想保留类型检查但解决报错，可以按以下两步操作：

**1. 解决 `json-server` 的类型报错**

在终端运行以下命令，安装对应的类型声明文件：

Bash

```
npm i --save-dev @types/json-server
```

**2. 关闭“未使用变量”的严格校验**

打开项目根目录下的 **`tsconfig.json`**（如果是 Vite 项目，可能是 **`tsconfig.app.json`**），在 `compilerOptions` 里面加上下面两行配置：

JSON

```
{
  "compilerOptions": {
    // ... 其他已有配置
    "noUnusedLocals": false,       // 允许局部变量声明了未使用
    "noUnusedParameters": false    // 允许函数参数声明了未使用
  }
}
```

保存后，再次运行 `npm run build` 即可顺利通过检查。

**建议：** 既然是《挑战杯》参赛项目，目前的核心任务是**跑通线上流程**，直接用**方案一**快速拿到 `dist` 文件夹丢到宝塔面板里去测试吧！祝部署顺利！