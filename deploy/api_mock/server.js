const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')
const {
  handleFarmLogin,
  buildNdviSummary,
  buildSoilMoistureTrend,
  evaluateDisasterRules
} = require('./agriMockCore.cjs')

const dbPath = path.join(__dirname, 'db.json')

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

function readDb(res) {
  let raw = ''
  try {
    raw = fs.readFileSync(dbPath, 'utf-8')
  } catch (err) {
    console.error('read db.json failed:', err)
    res.status(500).jsonp({ message: '无法读取 db.json' })
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (err) {
    console.error('parse db.json failed:', err)
    res.status(500).jsonp({ message: 'db.json 解析错误' })
    return null
  }
}

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
  const db = readDb(res)
  if (!db) return
  const result = handleFarmLogin(db, req.body)
  return res.status(result.status).jsonp(result.body)
})

server.get('/ndvi/summary', (req, res) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(buildNdviSummary(db))
})

server.get('/soilMoisture/trend', (req, res) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(buildSoilMoistureTrend(db))
})

server.post('/disasterRules/evaluate', (req, res) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(evaluateDisasterRules(db, req.body))
})

server.use(router)

const PORT = Number(process.env.MOCK_PORT || process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

server.listen(PORT, HOST, () => {
  console.log(`JSON Server is running on http://${HOST}:${PORT}`)
})
