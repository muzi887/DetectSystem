const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')

const dbPath = path.join(__dirname, 'db.json')

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.use((req, res, next) => {
  if (req.method === 'GET') {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      router.db.setState(db)
    } catch (err) {
      console.error('reload db.json failed:', err)
    }
  }
  next()
})

server.post('/login', (req, res) => {
  const { phone, password } = req.body || {}

  let raw = ''
  try {
    raw = fs.readFileSync(dbPath, 'utf-8')
  } catch (err) {
    console.error('read db.json failed:', err)
    return res.status(500).jsonp({ message: '无法读取 db.json' })
  }

  let db
  try {
    db = JSON.parse(raw)
  } catch (err) {
    console.error('parse db.json failed:', err)
    return res.status(500).jsonp({ message: 'db.json 解析错误' })
  }

  const users = db.users || db.user || []
  const user = users.find((u) => u.phone === phone && u.password == password)

  if (user) {
    const token = 'mock-token-' + Date.now()
    return res.jsonp({
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
    })
  }

  return res.status(401).jsonp({ message: '手机号或密码错误' })
})

server.use(router)

const PORT = Number(process.env.MOCK_PORT || process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

server.listen(PORT, HOST, () => {
  console.log(`JSON Server is running on http://${HOST}:${PORT}`)
})
