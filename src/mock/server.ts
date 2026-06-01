import jsonServer from 'json-server'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import type { Request, Response } from 'express'

interface AgriMockCore {
  handleFarmLogin: (db: any, body: any) => { status: number; body: any }
  buildNdviSummary: (db: any) => any
  buildSoilMoistureTrend: (db: any) => any
  evaluateDisasterRules: (db: any, body: any) => any
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

server.use(router)

const PORT = Number(process.env.MOCK_PORT || 3000)
server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`)
})
