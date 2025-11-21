// src/mock/server.ts
// Node.js环境（服务器端）
import jsonServer from 'json-server' // 引入json-server库，用于快速创建REST API服务器
import path from 'path' //处理文件路径
import fs from 'fs' //文件系统操作（读取/写入文件）
import { fileURLToPath } from 'url'
import type { Request, Response } from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 服务器初始化
const server = jsonServer.create() //创建Express服务器实例
const router = jsonServer.router(path.join(__dirname, 'db.json')) //基于db.json创建自动路由（GET…）
const middlewares = jsonServer.defaults() //获取json-server的默认中间件（日志、CORS等）

// 中间配置
server.use(middlewares) //应用默认中间件，让服务器具备基础功能
server.use(jsonServer.bodyParser) //添加请求体解析器，可以解析 JSON 格式的请求体

// 自定义登录接口：校验 users 数组中的手机号+密码
server.post('/login', (req: Request, res: Response) => {
  // console.log('[login] req.url=', req.url, 'method=', req.method)
  // console.log('[login] headers.origin=', req.headers.origin)
  // console.log('[login] headers.host=', req.headers.host)
  // console.log("[login] headers['x-forwarded-host']=", req.headers['x-forwarded-host'])
  // console.log('[login] body=', req.body)

  // //创建一个 POST 接口，路径为 /login，对象为请求和响应
  // const { phone, password } = req.body //从请求体中解构出手机号和密码
  // const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf-8')) //构建 db.json 文件的完整路径;同步读取 db.json 文件内容;将文件内容从字符串解析为 JavaScript 对象
  // const user = db.user.find((u: any) => u.phone === phone && u.password == password) //查找手机号和密码都匹配的用户

  const { phone, password } = req.body as { phone?: string; password?: string }

  const dbPath = path.join(__dirname, 'db.json')
  let raw = ''
  try {
    raw = fs.readFileSync(dbPath, 'utf-8')
  } catch (err) {
    console.error('read db.json failed:', err)
    return res.status(500).jsonp({ message: '无法读取 db.json' })
  }

  let db: any
  try {
    db = JSON.parse(raw)
  } catch (err) {
    console.error('parse db.json failed:', err)
    return res.status(500).jsonp({ message: 'db.json 解析错误' })
  }

  // db.users 或 db.user（适配两种命名）
  const users = db.users || db.user || []
  const user = users.find((u: any) => u.phone === phone && u.password == password)

  if (user) {
    //生成一个简单mock token
    const token = 'mock-token-' + Date.now()
    return res.jsonp({
      //返回成功的 JSON 响应，
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
    })
  } else {
    //返回 401 状态码和错误信息（未授权）
    return res.status(401).jsonp({ message: '手机号或密码错误' })
  }
})

//路由挂载到服务器上
server.use(router)

//路由器启动
const PORT = Number(process.env.MOCK_PORT || 3000) //从环境变量读取端口号，如果没有设置则使用 3000
//启动服务器监听指定端口
server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`)
})
