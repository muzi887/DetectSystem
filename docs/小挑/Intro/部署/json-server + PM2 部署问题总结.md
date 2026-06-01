---
title: 宝塔面板部署排查记录：PM2 + json-server 排坑全解析
tags:
  - 部署/宝塔面板
  - 后端/Node
  - 环境/PM2
  - 报错排查/npm
date: 2026-04-28
---

# 宝塔面板部署排查记录：PM2 + json-server 排坑全解析

> [!abstract] 核心总结
> json-server 结合 PM2 部署时出现的“无限闪退（停用）”、“找不到命令”或“端口占用”，本质上是因为 **PM2 的执行上下文与本地终端不一致**。解决关键在于：规避全局安装陷阱、纠正 PM2 的工作目录（cwd）、并通过 `package.json` 的 npm 脚本来标准化启动。

---

## 🧐 第一部分：上帝视角复盘（问题根源）

> [!bug] 阶段一：`npm install` 卡死或报错
> **当时的现象**：安装依赖时报错 `is not in this registry` 或长时间无响应。
> **真正的凶手**：国内服务器请求海外 npm 官方镜像源经常超时或丢包。
> **解决思路**：强制清理缓存，并切换至淘宝/腾讯等国内镜像源。

> [!warning] 阶段二：PM2 启动失败与路径迷失
> **当时的现象**：直接使用 `pm2 start json-server` 报错，或者提示找不到 `db.json`。
> **真正的凶手**：
> 1. **执行上下文错误**：宝塔 PM2 UI 和终端 PM2 环境不同，直接调 `json-server` 往往找不到本地的 `node_modules`。
> 2. **工作目录迷失**：PM2 默认执行路径（cwd）不对，导致相对路径 `db.json` 被解析到了错误的位置。
> **解决思路**：放弃直接调用命令，改用 `npm run` 脚本启动，并将工作权交还给项目目录。

> [!failure] 阶段三：外网访问不到与端口冲突
> **当时的现象**：项目不断闪退重启（端口被占用），或者启动绿灯但网页连不上接口。
> **真正的凶手**：
> 1. 未绑定 host：`json-server` 默认只监听 `localhost`。
> 2. 僵尸进程：之前的测试进程没杀干净。
> **解决思路**：启动命令中显式加入 `--host 0.0.0.0`，并在重新部署前清理旧进程。

---

## 🛠️ 第二部分：终证实操手册（SOP）

弃用宝塔 PM2 图形界面的易错操作，统一采用以下 **标准终端部署流**：

### ⚔️ Step 1: 准备项目与依赖环境
*目标：解决 npm 安装报错及项目配置缺失问题*

打开宝塔终端，执行：
```bash
# 1. 进入项目确切目录
cd /www/wwwroot/DetectSystem/api_mock

# 2. 解决 npm 源问题并安装依赖
npm config set registry [https://registry.npmmirror.com/](https://registry.npmmirror.com/)
npm cache clean --force
npm install
````

**极其关键的一步**：确保你的 `package.json` 中配置了正确的启动脚本（带上 host）：

JSON

```
"scripts": {
  "mock": "json-server --watch db.json --port 3000 --host 0.0.0.0"
}
```

---

### 🛡️ Step 2: 端口“清道夫”与历史遗留清理

_目标：防止端口占用 (port already in use) 与 PM2 状态错乱_

Bash

```
# 1. 杀掉可能的物理占用进程
lsof -i:3000
kill -9 <查出的PID>

# 2. 删除 PM2 中所有旧的错误配置
pm2 delete DetectSystem  # 替换为你旧项目的名字
```

---

### 💣 Step 3: 标准化 PM2 启动流程（终极方案）

_目标：让 PM2 完美挂载 json-server 且保持稳定_

在项目目录 (`/api_mock`) 下执行：

Bash

```
# 1. 通过 PM2 代理执行 npm run mock 命令（最稳妥的做法）
pm2 start npm --name json-api -- run mock

# 2. 将当前正确的运行状态保存，防止服务器重启后丢失
pm2 save
```

> [!success] 最终验证
> 
> - 执行 `pm2 list`：状态应显示为稳固的绿色 `online`，重启次数 (Restarts) 为 0。
>     
> - 执行 `pm2 logs json-api`：查看实时运行日志。
>     
> - 浏览器访问 `http://服务器IP:3000`，即可看到数据成功返回。
>