# 宝塔部署（不用 PM2）

在 `82.157.234.123` 上继续用老师的服务器，**Mock 后端改用宝塔「Node 项目」**托管（与 `api_flask` 的 Python 项目同一套机制），不再使用 PM2。

---

## 架构（不变）

| 组件 | 端口 | 托管方式 |
|------|------|----------|
| Vue 前端 `dist` | 88 | Nginx 静态站点 |
| Mock API | 3000 | **宝塔 Node 项目** |
| Flask AI | 5000 | 宝塔 Python 项目（已有 `api_flask`） |

Nginx 仍将 `/api/` 反代到 `127.0.0.1:3000`，前端无需改代码。

---

## 一、本地准备

1. 构建前端（有改动时）：
   ```bash
   pnpm build
   ```
2. 若改过模拟数据，同步 `db.json`：
   ```bash
   copy src\mock\db.json deploy\api_mock\db.json
   ```
3. 需要上传到服务器的目录：
   - `deploy/api_mock/` 下全部文件 → 服务器 `/www/wwwroot/DetectSystem/api_mock/`
   - `dist/` 内全部文件 → 服务器 `/www/wwwroot/DetectSystem/frontend/dist/`

---

## 二、停掉 PM2（避免 3000 端口冲突）

1. 宝塔 → **软件商店** → **PM2 管理器** → **项目列表**
2. 找到 `json-api`，点击 **停止**，再 **删除**
3. 终端确认 3000 端口已释放：
   ```bash
   lsof -i:3000
   ```
   无输出即正常。

> **同一端口只能有一个进程**。PM2 与 Node 项目不能同时跑 3000。

---

## 三、上传并安装依赖

1. 宝塔 **文件** → 进入 `/www/wwwroot/DetectSystem/api_mock/`
2. 上传（覆盖）：
   - `package.json`
   - `server.js`
   - `db.json`
3. 在该目录打开 **终端**，执行：
   ```bash
   cd /www/wwwroot/DetectSystem/api_mock
   npm install --registry=https://registry.npmjs.org
   ```
4. 本地验证（必须通过再进下一步）：
   ```bash
   node server.js
   ```
   看到 `JSON Server is running on http://0.0.0.0:3000` 后 Ctrl+C 退出。

---

## 四、添加宝塔 Node 项目

1. 宝塔左侧 **网站** → 顶部 **Node 项目**（不是 PHP 项目）
2. **添加 Node 项目**，填写：

   | 项 | 值 |
   |---|---|
   | 项目名称 | `json-api` |
   | 项目路径 | `/www/wwwroot/DetectSystem/api_mock` |
   | 启动文件 | `server.js` |
   | 端口 | `3000` |
   | Node 版本 | **v18 或 v20**（≥18） |
   | 运行方式 | `npm start` 或直接运行 `server.js`（按面板选项选） |

3. 提交后状态应为 **运行中**（绿色）。

4. 若面板有 **「模块安装」**，在项目设置里对当前目录执行依赖安装（等效于 `npm install`）。

---

## 五、确认 Nginx 反代（一般不用改）

网站 `82.157.234.123:88` → **设置** → **配置文件**，需包含：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Flask 若走 `/api/analysis/`，保留原有第二条反代到 `5000` 即可。

---

## 六、验证清单

在服务器终端：

```bash
curl http://127.0.0.1:3000/monitorPoints
curl -X POST http://127.0.0.1:3000/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000000","password":"123456"}'
```

浏览器（务必 **http**，不是 https）：

```
http://82.157.234.123:88
```

测试账号：`13800000000` / `123456`

---

## 七、为什么比 PM2 更适合你

| PM2 | 宝塔 Node 项目 |
|-----|----------------|
| 图形界面 cwd 易配错 | 项目路径绑定目录，与 Python 项目一致 |
| 需手动 `pm2 save` | 面板统一管理启停、开机自启 |
| 依赖丢了不易发现 | 项目目录内 `package.json` + `npm install` 标准流程 |
| 与面板两套体系 | 和 `api_flask` 同一种运维方式 |

---

## 八、决赛前检查（建议打印）

- [ ] PM2 里已无 `json-api`（避免端口冲突）
- [ ] Node 项目 `json-api` 运行中
- [ ] Python 项目 `api_flask` 运行中
- [ ] Nginx 运行中，88 端口可访问
- [ ] 登录 + 地图 + 上传识别各测一遍
- [ ] 访问地址使用 `http://82.157.234.123:88`

---

## 九、以后只更新 Mock 数据

1. 本地改 `src/mock/db.json`
2. 复制到 `deploy/api_mock/db.json` 并上传覆盖服务器
3. 宝塔 Node 项目 → **重启** `json-api`

---

## 十、故障排查

| 现象 | 处理 |
|------|------|
| `Cannot find module 'json-server'` | 在 `api_mock` 目录重新 `npm install` |
| 3000 端口被占用 | `lsof -i:3000`，停掉 PM2 或旧进程 |
| 502 | Node 项目未运行，或 Nginx 反代地址错误 |
| 登录 401 | 检查 `db.json` 是否上传、账号密码是否正确 |

---

**线上地址**：http://82.157.234.123:88
