const jsonServer = require('json-server')
const path = require('path')
const fs = require('fs')
const {
  handleFarmLogin,
  buildNdviSummary,
  buildSoilMoistureTrend,
  evaluateDisasterRules,
  queryMoistureByNearestPoint
} = require('./agriMockCore.cjs')
const { runChain1OnDb, runChain2OnDb, runChain3OnDb, runAllChains, tickSensorSimulation, profileForPoint, publishAlert, DEFAULT_THRESHOLD_PROFILE, filterReadings } = require('./ruleChainRunner.cjs')

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

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n')
  router.db.setState(db)
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

server.post('/alerts/evaluate-all', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const result = runChain1OnDb(db, new Date())
  writeDb(db)
  return res.jsonp({ ok: true, created: result.created.length })
})

server.post('/weather/extreme-events/evaluate', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const result = runChain2OnDb(db, new Date())
  writeDb(db)
  return res.jsonp({ ok: true, created: result.created.length })
})

server.post('/pest-risk/evaluate', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const result = runChain3OnDb(db, new Date())
  writeDb(db)
  return res.jsonp({ ok: true, created: result.created.length, predictions: db.pestRiskPredictions })
})

server.post('/alerts/:id/publish', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const row = publishAlert(db, Number(req.params.id))
  if (!row) return res.status(404).jsonp({ message: '预警不存在' })
  writeDb(db)
  return res.jsonp(row)
})

server.get('/field-sensors/:pointId/readings', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const pointId = Number(req.params.pointId)
  const from = typeof req.query.from === 'string' ? req.query.from : undefined
  const to = typeof req.query.to === 'string' ? req.query.to : undefined
  const rows = Array.isArray(db.sensorReadings) ? db.sensorReadings : []
  return res.jsonp(filterReadings(rows, pointId, from, to))
})

server.get('/field-sensors/:pointId/thresholds', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const pointId = Number(req.params.pointId)
  return res.jsonp(profileForPoint(db, pointId) || { ...DEFAULT_THRESHOLD_PROFILE, pointId })
})

server.put('/field-sensors/:pointId/thresholds', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const pointId = Number(req.params.pointId)
  if (!Array.isArray(db.thresholdProfiles)) db.thresholdProfiles = []
  const body = { ...DEFAULT_THRESHOLD_PROFILE, ...(req.body || {}), pointId }
  const idx = db.thresholdProfiles.findIndex((row) => Number(row.pointId) === pointId)
  if (idx >= 0) db.thresholdProfiles[idx] = body
  else db.thresholdProfiles.push(body)
  writeDb(db)
  return res.jsonp(body)
})

server.get('/moisture/value', (req, res) => {
  const db = readDb(res)
  if (!db) return
  const result = queryMoistureByNearestPoint(db, req.query.lat, req.query.lng)
  return res.status(result.status).jsonp(result.body)
})

server.use(router)

const PORT = Number(process.env.MOCK_PORT || process.env.PORT || 3000)
const HOST = process.env.HOST || '0.0.0.0'

server.listen(PORT, HOST, () => {
  console.log(`JSON Server is running on http://${HOST}:${PORT}`)
  setInterval(() => {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
      tickSensorSimulation(db)
      runAllChains(db, new Date())
      writeDb(db)
    } catch (err) {
      console.error('rule-chain interval failed:', err)
    }
  }, 60_000)
})
