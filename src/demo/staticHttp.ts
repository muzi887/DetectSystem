import type { DemoSnapshot } from './snapshot.ts'

export class StaticDemoError extends Error {
  status: number
  friendlyMessage: string

  constructor(message: string, status = 404) {
    super(message)
    this.status = status
    this.friendlyMessage = message
  }
}

type Row = Record<string, unknown>

function splitUrl(url: string) {
  const [pathPart, search = ''] = url.split('?')
  return { path: pathPart ?? url, query: new URLSearchParams(search) }
}

function applyQuery(rows: Row[], query: URLSearchParams, params?: Record<string, unknown>) {
  const filters = new Map<string, string>()
  query.forEach((value, key) => {
    if (!key.startsWith('_')) filters.set(key, value)
  })
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value != null && value !== '' && !key.startsWith('_')) filters.set(key, String(value))
    }
  }
  let filtered = rows.filter((row) => {
    for (const [key, value] of filters) {
      if (String(row[key]) !== value) return false
    }
    return true
  })
  const sortKey = query.get('_sort')
  if (sortKey) {
    const reverse = (query.get('_order') || 'asc').toLowerCase() === 'desc'
    filtered = [...filtered].sort((a, b) => {
      const av = a[sortKey] as number | string | null | undefined
      const bv = b[sortKey] as number | string | null | undefined
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (av < bv) return reverse ? 1 : -1
      if (av > bv) return reverse ? -1 : 1
      return 0
    })
  }
  return filtered
}

function nearestMoisture(db: DemoSnapshot, lat: number, lng: number) {
  const first = db.monitorPoints[0]
  if (!first) throw new StaticDemoError('没有监测点', 404)
  let best = first
  let bestDistance = Number.POSITIVE_INFINITY
  for (const point of db.monitorPoints) {
    const distance = Math.hypot(Number(point.lat) - lat, Number(point.lng) - lng)
    if (distance < bestDistance) {
      best = point
      bestDistance = distance
    }
  }
  return {
    moisture: Number(best.soilMoisture),
    source: 'nearest-point',
    nearestPointId: Number(best.id),
    pointName: String(best.name),
    distanceKm: Number((bestDistance * 111).toFixed(2))
  }
}

function dispatch(
  db: DemoSnapshot,
  method: string,
  url: string,
  config?: { params?: Record<string, unknown> },
  body?: unknown
): unknown {
  const { path, query } = splitUrl(url)
  const params = config?.params
  const verb = method.toUpperCase()

  if (verb === 'POST' && (path === '/analysis/image' || path === '/analysis/batch' || path === '/analysis/feedback')) {
    throw new StaticDemoError('本页不提供公网实时上传', 400)
  }
  if (verb === 'POST' && path === '/login') {
    const payload = (body ?? {}) as { role?: string }
    const role = payload.role === 'admin' || payload.role === 'cooperative' || payload.role === 'agronomist'
      ? payload.role
      : 'agronomist'
    return {
      code: 200,
      message: '登录成功',
      token: 'demo-static',
      user: { id: 1, name: '演示农技员', phone: '13800000000', role }
    }
  }
  if (verb === 'POST' && path === '/alerts/evaluate-all') return { ok: true, created: 0 }
  if (verb === 'POST' && path === '/weather/extreme-events/evaluate') return { ok: true, created: 0 }
  if (verb === 'POST' && path === '/pest-risk/evaluate') {
    return { ok: true, created: 0, predictions: db.pestRiskPredictions }
  }

  const publish = path.match(/^\/alerts\/(\d+)\/publish$/)
  if (verb === 'POST' && publish?.[1]) {
    const row = db.alerts.find((alert) => alert.id === Number(publish[1]))
    if (!row) throw new StaticDemoError('预警不存在', 404)
    row.draft = false
    return row
  }

  if (verb === 'POST' && path === '/alerts') {
    const payload = (body ?? {}) as Row
    const nextId = db.alerts.reduce((max, alert) => Math.max(max, alert.id), 0) + 1
    const row = { id: nextId, draft: false, handled: false, source: 'manual', ...payload }
    db.alerts.push(row as DemoSnapshot['alerts'][number])
    return row
  }

  const alertPath = path.match(/^\/alerts\/(\d+)$/)
  if (alertPath?.[1] && (verb === 'PATCH' || verb === 'DELETE')) {
    const id = Number(alertPath[1])
    const index = db.alerts.findIndex((alert) => alert.id === id)
    const target = db.alerts[index]
    if (index < 0 || !target) throw new StaticDemoError('预警不存在', 404)
    if (verb === 'DELETE') {
      db.alerts.splice(index, 1)
      return null
    }
    Object.assign(target, (body ?? {}) as Row)
    return target
  }

  const noticePath = path.match(/^\/notifications\/(\d+)$/)
  if (verb === 'PATCH' && noticePath?.[1]) {
    const row = db.notifications.find((item) => item.id === Number(noticePath[1]))
    if (!row) throw new StaticDemoError('通知不存在', 404)
    row.read = true
    return row
  }

  const readingsPath = path.match(/^\/field-sensors\/(\d+)\/readings$/)
  if (verb === 'GET' && readingsPath?.[1]) {
    return db.sensorReadings.filter((row) => row.pointId === Number(readingsPath[1]))
  }

  const thresholdPath = path.match(/^\/field-sensors\/(\d+)\/thresholds$/)
  if (thresholdPath?.[1]) {
    const pointId = Number(thresholdPath[1])
    const current = db.thresholds.find((row) => Number(row.pointId) === pointId) ?? { pointId }
    if (verb === 'PUT') {
      Object.assign(current, (body ?? {}) as Row, { pointId })
      if (!db.thresholds.includes(current)) db.thresholds.push(current)
      return current
    }
    if (verb === 'GET') return current
  }

  if (verb === 'GET' && path === '/monitorPoints') return db.monitorPoints
  if (verb === 'GET' && path === '/weatherReadings') return applyQuery(db.weatherReadings, query, params)
  if (verb === 'GET' && path === '/alerts') return applyQuery(db.alerts as unknown as Row[], query, params)
  if (verb === 'GET' && path === '/weatherForecast') return applyQuery(db.weatherForecast as unknown as Row[], query, params)
  if (verb === 'GET' && path === '/extremeEvents') return db.extremeEvents
  if (verb === 'GET' && path === '/pestRiskPredictions') return db.pestRiskPredictions
  if (verb === 'GET' && path === '/notifications') return db.notifications
  if (verb === 'GET' && path === '/droneMissions') return db.droneMissions
  if (verb === 'GET' && path === '/fields') return db.fields
  if (verb === 'GET' && path === '/ndviLayers') return db.ndviLayers
  if (verb === 'GET' && path === '/moistureLayers') return db.moistureLayers
  if (verb === 'GET' && path === '/reports/daily') return { markdown: db.dailyReportMarkdown }
  if (verb === 'GET' && path === '/analysis/stats') return db.analysisStats
  if (verb === 'GET' && path === '/analysis/model-info') return db.modelInfo
  if (verb === 'GET' && path === '/analysis/recent') {
    const limit = Number(query.get('limit') ?? params?.limit ?? 20)
    return { records: db.analysisRecords.slice(0, limit) }
  }
  if (verb === 'GET' && path === '/moisture/value') {
    const lat = Number(query.get('lat') ?? params?.lat)
    const lng = Number(query.get('lng') ?? params?.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new StaticDemoError('缺少经纬度', 400)
    return nearestMoisture(db, lat, lng)
  }

  throw new StaticDemoError(`static demo has no fixture for ${verb} ${path}`, 404)
}

export function createStaticHttp(source: DemoSnapshot) {
  const db = structuredClone(source)
  function call(method: string, url: string, config?: { params?: Record<string, unknown> }, body?: unknown) {
    try {
      return Promise.resolve({ data: dispatch(db, method, url, config, body) })
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return {
    get<T = unknown>(url: string, config?: { params?: Record<string, unknown> }) {
      return call('GET', url, config) as Promise<{ data: T }>
    },
    post<T = unknown>(url: string, body?: unknown) {
      return call('POST', url, undefined, body) as Promise<{ data: T }>
    },
    patch<T = unknown>(url: string, body?: unknown) {
      return call('PATCH', url, undefined, body) as Promise<{ data: T }>
    },
    put<T = unknown>(url: string, body?: unknown) {
      return call('PUT', url, undefined, body) as Promise<{ data: T }>
    },
    delete<T = unknown>(url: string) {
      return call('DELETE', url) as Promise<{ data: T }>
    }
  }
}
