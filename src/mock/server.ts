import jsonServer from 'json-server'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import type { Request, Response } from 'express'
import { DEFAULT_THRESHOLD_PROFILE } from '../utils/alertRules.ts'
import { buildDailyReport } from '../utils/dailyReport.ts'
import { filterReadings } from '../utils/sensorReadings.ts'
import { profileForPoint, publishAlert, runAllChains, runChain1OnDb, runChain2OnDb, runChain3OnDb, tickSensorSimulation } from './persistRules.ts'

interface AgriMockCore {
  handleFarmLogin: (db: any, body: any) => { status: number; body: any }
  buildNdviSummary: (db: any) => any
  buildSoilMoistureTrend: (db: any) => any
  evaluateDisasterRules: (db: any, body: any) => any
  queryMoistureByNearestPoint: (
    db: any,
    lat: unknown,
    lng: unknown
  ) => { ok: boolean; status: number; body: any }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'db.json')
const require = createRequire(import.meta.url)
const agriMockCore = require('../../deploy/api_mock/agriMockCore.cjs') as AgriMockCore

const server = jsonServer.create()
const router = jsonServer.router(dbPath)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

function readDb(res: Response) {
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

function writeDb(db: any) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + '\n')
  router.db.setState(db)
}

server.use((req: Request, _res: Response, next) => {
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

server.post('/login', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = agriMockCore.handleFarmLogin(db, req.body)
  return res.status(result.status).jsonp(result.body)
})

server.get('/ndvi/summary', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(agriMockCore.buildNdviSummary(db))
})

server.get('/soilMoisture/trend', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(agriMockCore.buildSoilMoistureTrend(db))
})

server.post('/disasterRules/evaluate', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  return res.jsonp(agriMockCore.evaluateDisasterRules(db, req.body))
})

server.post('/alerts/evaluate-all', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = runChain1OnDb(db, new Date())
  writeDb(db)
  return res.jsonp({ ok: true, created: result.created.length })
})

server.post('/weather/extreme-events/evaluate', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = runChain2OnDb(db, new Date())
  writeDb(db)
  return res.jsonp({ ok: true, created: result.created.length })
})

server.post('/pest-risk/evaluate', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = runChain3OnDb(db, new Date())
  writeDb(db)
  return res.jsonp({ ok: true, created: result.created.length, predictions: db.pestRiskPredictions })
})

server.post('/alerts/:id/publish', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const row = publishAlert(db, Number(req.params.id))
  if (!row) return res.status(404).jsonp({ message: '预警不存在' })
  writeDb(db)
  return res.jsonp(row)
})

server.get('/field-sensors/:pointId/readings', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const pointId = Number(req.params.pointId)
  const from = typeof req.query.from === 'string' ? req.query.from : undefined
  const to = typeof req.query.to === 'string' ? req.query.to : undefined
  const rows = Array.isArray(db.sensorReadings) ? db.sensorReadings : []
  return res.jsonp(filterReadings(rows, pointId, from, to))
})

server.get('/field-sensors/:pointId/thresholds', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const pointId = Number(req.params.pointId)
  return res.jsonp(profileForPoint(db, pointId) || { ...DEFAULT_THRESHOLD_PROFILE, pointId })
})

server.put('/field-sensors/:pointId/thresholds', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const pointId = Number(req.params.pointId)
  if (!Array.isArray(db.thresholdProfiles)) db.thresholdProfiles = []
  const body = { ...DEFAULT_THRESHOLD_PROFILE, ...(req.body || {}), pointId }
  const idx = db.thresholdProfiles.findIndex((row: { pointId: number }) => Number(row.pointId) === pointId)
  if (idx >= 0) db.thresholdProfiles[idx] = body
  else db.thresholdProfiles.push(body)
  writeDb(db)
  return res.jsonp(body)
})

server.get('/reports/daily', (_req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const markdown = buildDailyReport({
    generatedAt: new Date().toISOString(),
    points: Array.isArray(db.monitorPoints) ? db.monitorPoints : [],
    alerts: (Array.isArray(db.alerts) ? db.alerts : []).filter((row: { draft?: boolean }) => row.draft !== true),
    extremeEvents: Array.isArray(db.extremeEvents) ? db.extremeEvents : []
  })
  return res.jsonp({ markdown })
})

server.get('/moisture/value', (req: Request, res: Response) => {
  const db = readDb(res)
  if (!db) return
  const result = agriMockCore.queryMoistureByNearestPoint(db, req.query.lat, req.query.lng)
  return res.status(result.status).jsonp(result.body)
})

server.use(router)

const PORT = Number(process.env.MOCK_PORT || 3000)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`)
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
