我看到你的第一张截图了！遇到 `npm: command not found` 这个报错非常正常。这说明你的云服务器上还没有安装 Node.js 环境，或者宝塔面板还没有把它的命令开放给全局终端。

⚠️ **特别警报：千万不要听从终端里的红字提示去执行 `apt install npm`！**

在宝塔面板的生态里，如果你混用 Ubuntu 系统的自带 `apt` 命令去装环境，极容易破坏宝塔现有的环境隔离，导致后续一系列难以排查的冲突。

既然你使用的是宝塔面板，我们完全可以采用**更“傻瓜”、更优雅**的图形化界面来解决，甚至都不需要你手敲命令！同时，根据你项目 `README.md` 的前置要求，你需要 **Node.js 18+** 环境。

请按照以下最标准的“宝塔流”步骤操作：

### 完美解决方案：使用 PM2 管理器（免终端操作）

**第一步：安装并配置 Node.js 18+**

1. 在宝塔面板左侧点击 **“软件商店”**。
    
2. 搜索 **“PM2管理器”**（老师如果已经装了，直接点击右侧的“设置”；没装就点“安装”）。
    
3. 打开 PM2 管理器的设置弹窗，点击顶部的 **“Node版本”** 选项卡。
    
4. 在下拉菜单中，选择一个大于 18 的稳定版本（例如 `v18.18.0` 或 `v20.x`），然后点击切换/安装。_(这一步确保满足了你前端代码和运行环境的最低要求)_。
    

**第二步：一键安装 json-server（替代截图里的终端命令）**

1. 依然在 PM2 管理器的设置面板里，点击左侧的 **“模块管理”** 选项。
    
2. 在“模块名称”或者“包名”输入框里，直接输入 `json-server`。
    
3. 点击旁边的 **“添加”** 或 **“安装”** 按钮。
    
4. 宝塔会在后台自动为你全局安装这个插件，等待几秒钟提示成功即可。_(这完美等效于你截图里想要执行的 `npm install -g json-server`)_。
    

---

### 下一步：顺手把 3000 端口跑起来

既然你在图形界面里把 `json-server` 装好了，我们可以直接在 PM2 里把你那个 `db.json` 跑起来：

1. 在 PM2 管理器里点击 **“项目列表”** -> **“添加项目”**。
    
2. **运行目录**：精准选择你截图里的那个路径 `/www/wwwroot/DetectSystem/api_mock`。
    
3. **启动文件/启动命令**：手动填入 `json-server --watch db.json --port 3000`。
    
4. **项目名称**：填 `api_mock`（方便你以后认出它）。
    
5. 点击 **提交**。
    

此时，你应该能在 PM2 的列表里看到这个项目亮起了绿色的运行状态。你的模拟后端就成功在云服务器上安家并守护在 3000 端口了！去试试图形界面的威力吧。

## 
你问得太好了！**必须要用你自己的！** 这次是我疏忽了，给你道个歉。

我刚仔细看了你上传的 `server.ts` 文件，发现里面包含了**非常核心的自定义逻辑**：你不仅用它启动了 json-server，还自己在里面写了一个处理前端登录的接口（`server.post('/login', ...)`），用来校验手机号、密码并下发 Token。

如果用我上一条回复里给你的那段“通用简易版”代码，你的前端就**完全无法登录**了！

### 为什么之前没让你直接用你的 `server.ts`？

根本原因在于文件后缀名：**`.ts` (TypeScript)**。

你的代码是用 TypeScript 写的，带有类型声明（比如 `req: Request, res: Response`）。而宝塔面板的 PM2 和原生的 Node.js 环境**只能直接运行 `.js` (JavaScript) 文件**。如果直接让 PM2 去跑 `.ts` 文件，它会因为看不懂那些类型语法而直接报错崩溃。

### 怎么把“你自己的代码”安全地放上去？

为了让你的完美逻辑在宝塔上顺利跑起来，我们需要把你写的 TypeScript 代码“翻译”成原生的 JavaScript 代码。

**第一步：覆盖你的 `server.js`**

请在宝塔面板的 `/www/wwwroot/DetectSystem/api_mock/` 目录下，打开你刚才新建的 `server.js`，把你之前的简易版代码清空，**完整粘贴下面这段代码并保存**（这完全是你原本 `server.ts` 里的逻辑，我帮你去掉了 TS 的类型检查，并改成了最稳定的 CommonJS 引入方式）：

JavaScript

```
const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

// 服务器初始化
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// 中间配置
server.use(middlewares);
server.use(jsonServer.bodyParser);

// 自定义登录接口：校验 users 数组中的手机号+密码
server.post('/login', (req, res) => {
  const { phone, password } = req.body;

  const dbPath = path.join(__dirname, 'db.json');
  let raw = '';
  try {
    raw = fs.readFileSync(dbPath, 'utf-8');
  } catch (err) {
    console.error('read db.json failed:', err);
    return res.status(500).jsonp({ message: '无法读取 db.json' });
  }

  let db;
  try {
    db = JSON.parse(raw);
  } catch (err) {
    console.error('parse db.json failed:', err);
    return res.status(500).jsonp({ message: 'db.json 解析错误' });
  }

  // db.users 或 db.user（适配两种命名）
  const users = db.users || db.user || [];
  const user = users.find((u) => u.phone === phone && u.password == password);

  if (user) {
    //生成一个简单mock token
    const token = 'mock-token-' + Date.now();
    return res.jsonp({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
    });
  } else {
    return res.status(401).jsonp({ message: '手机号或密码错误' });
  }
});

// 路由挂载到服务器上
server.use(router);

// 路由器启动
const PORT = 3000; 
server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});
```

**第二步：在当前目录安装依赖**

因为你在代码里用到了 `require('json-server')`，我们需要确保这个文件夹里真的有它。

1. 在宝塔面板进入 `/www/wwwroot/DetectSystem/api_mock/` 目录。
    
2. 点击上方的 **“终端”**（这样终端会自动定位在这个目录下）。
    
3. 在终端里输入：`npm install json-server` 并回车。
    

**第三步：在 PM2 里重启项目**

1. 回到 **PM2管理器**。
    
2. 找到刚才添加的 `api_mock` 项目。
    
3. 点击最右侧操作栏里的 **“重启”**（绿色的旋转箭头图标）。
    

现在，你的 `3000` 端口跑的就是**包含了你全部心血的自定义接口**了，前端的登录功能也能完美打通了！

## 
看到这个满屏幕的红色 `npm ERR! 404` 别慌，**这完全不是你代码或操作的问题！**

### 为什么会报错？

从你的终端截图中可以清楚地看到错误链接：`https://cdn.npmmirror.com/...`。

这是因为宝塔面板（或者你老师的服务器）为了在国内下载代码快一点，默认把 npm 的下载源配置成了**淘宝镜像（npmmirror）**。但是，服务器上目前的镜像源地址配置似乎有点问题（它试图去 binaries 目录下找，路径不对），导致它找不到 `json-server` 这个包，直接报了 404 NotFound 错误。

### 🚀 完美解决办法：强制使用官方源下载

既然国内镜像源抽风了，我们直接绕过它，强制让它去 npm 官方源下载就可以了。

请在你当前的终端（`root@VM-8-12-ubuntu:/www/wwwroot/DetectSystem/api_mock#`）里，复制并运行下面这行命令（注意后面多加的参数）：

Bash

```
npm install json-server --registry=https://registry.npmjs.org
```

### 接下来怎么做？

1. 运行上面这行命令后，稍微等待十几秒，只要不出现大片的红色 ERR，而是出现类似 `added X packages` 或者绿色的提示，就说明**安装成功**了。
    
2. 安装成功后，这个终端就可以直接关掉了。
    
3. 回到宝塔的 **PM2管理器**。
    
4. 找到你刚才添加的 `api_mock` 项目，点击最右侧操作栏里的 **“重启”**（绿色的旋转箭头图标）。
    

重启之后，你的自定义 `server.js` 就能成功找到 `json-server` 模块，你的模拟后端和自定义登录接口就彻底复活了！去试试看！

![[attachments/Pasted image 20260429000119.png]]

![[attachments/Pasted image 20260429000410.png]]
