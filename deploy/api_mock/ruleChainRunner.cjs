const DEFAULT_THRESHOLD_PROFILE = {
  pointId: 0,
  crop: '小麦',
  growthStage: '拔节',
  waterStressHint: 25,
  waterStressAlert: 15,
  waterStressHintMinutes: 30,
  waterStressAlertMinutes: 10,
  heatHint: 32,
  heatAlert: 38,
  heatHintMinutes: 30,
  heatAlertMinutes: 10,
  waterloggingAlert: 80,
  waterloggingMinutes: 10
}

function mapRuleLevel(level) {
  return level === 'hint' ? 'warning' : 'high'
}

function detectHits(reading, profile) {
  const hits = []
  const soil = reading.soilVwc
  const temp = reading.airTemp

  if (soil < profile.waterStressAlert) {
    hits.push({
      ruleId: 'water_stress',
      level: 'alert',
      durationMinutes: profile.waterStressAlertMinutes,
      metric: 'soilVwc',
      value: soil,
      threshold: profile.waterStressAlert
    })
  } else if (soil < profile.waterStressHint) {
    hits.push({
      ruleId: 'water_stress',
      level: 'hint',
      durationMinutes: profile.waterStressHintMinutes,
      metric: 'soilVwc',
      value: soil,
      threshold: profile.waterStressHint
    })
  }

  if (soil > profile.waterloggingAlert) {
    hits.push({
      ruleId: 'waterlogging',
      level: 'alert',
      durationMinutes: profile.waterloggingMinutes,
      metric: 'soilVwc',
      value: soil,
      threshold: profile.waterloggingAlert
    })
  }

  if (temp > profile.heatAlert) {
    hits.push({
      ruleId: 'heat_stress',
      level: 'alert',
      durationMinutes: profile.heatAlertMinutes,
      metric: 'airTemp',
      value: temp,
      threshold: profile.heatAlert
    })
  } else if (temp > profile.heatHint) {
    hits.push({
      ruleId: 'heat_stress',
      level: 'hint',
      durationMinutes: profile.heatHintMinutes,
      metric: 'airTemp',
      value: temp,
      threshold: profile.heatHint
    })
  }

  return hits
}

function buildEnvAlertMessage(pointName, hit, elapsedMinutes) {
  const kind = hit.level === 'hint' ? '提示阈值' : '告警阈值'
  if (hit.metric === 'airTemp') {
    return `[自动预警] ${pointName} - 气温 ${hit.value}℃ 超过${kind} ${hit.threshold}℃，已持续 ${elapsedMinutes} min`
  }
  if (hit.ruleId === 'waterlogging') {
    return `[自动预警] ${pointName} - 土壤湿度 ${hit.value}% 偏高，高于${kind} ${hit.threshold}%，已持续 ${elapsedMinutes} min`
  }
  return `[自动预警] ${pointName} - 土壤湿度 ${hit.value}% 低于${kind} ${hit.threshold}%，已持续 ${elapsedMinutes} min`
}

function evaluateReading(reading, profile, states, now, pointName) {
  const nextStates = []
  const alertsToCreate = []
  const hits = []
  for (const hit of detectHits(reading, profile)) {
    hits.push(hit)
    const prev = (states || []).find((s) => s.pointId === reading.pointId && s.ruleId === hit.ruleId)
    const startedAt = prev && prev.level === hit.level ? prev.startedAt : now.toISOString()
    const elapsed = (now.getTime() - Date.parse(startedAt)) / 60000
    const alertEmitted = Boolean(prev && prev.alertEmitted && prev.level === hit.level)
    const state = {
      pointId: reading.pointId,
      ruleId: hit.ruleId,
      level: hit.level,
      startedAt,
      lastSeenAt: now.toISOString(),
      alertEmitted
    }
    if (elapsed >= hit.durationMinutes && !state.alertEmitted) {
      alertsToCreate.push({
        pointId: reading.pointId,
        fieldId: null,
        level: mapRuleLevel(hit.level),
        message: buildEnvAlertMessage(pointName || 'POINT', hit, Math.floor(elapsed)),
        time: now.getTime(),
        handled: false,
        source: 'auto',
        ruleId: hit.ruleId,
        chain: 'env',
        draft: false
      })
      state.alertEmitted = true
    }
    nextStates.push(state)
  }
  return { hits, nextStates, alertsToCreate }
}

function nextAlertId(alerts) {
  let max = 0
  for (const row of alerts || []) {
    const id = Number(row.id) || 0
    if (id > max) max = id
  }
  return max + 1
}

function dedupeAlerts(existing, incoming) {
  const alerts = [...(existing || [])]
  const created = []
  let id = nextAlertId(alerts)
  for (const item of incoming || []) {
    const dup = alerts.find(
      (row) =>
        !row.handled &&
        row.pointId === item.pointId &&
        row.ruleId === item.ruleId &&
        row.chain === item.chain
    )
    if (dup) continue
    const row = { ...item, id }
    id += 1
    alerts.push(row)
    created.push(row)
  }
  return { alerts, created }
}

function readingFromWeatherRow(row) {
  return {
    pointId: Number(row.pointId),
    airTemp: Number(row.airTemp),
    soilVwc: Number(row.soilVwc),
    recordedAt: String(row.updatedAt || row.recordedAt || '')
  }
}

function latestWeatherByPoint(rows) {
  const latest = new Map()
  for (const row of rows || []) {
    const pointId = Number(row.pointId)
    const prev = latest.get(pointId)
    if (!prev || Number(row.id) >= Number(prev.id)) {
      latest.set(pointId, row)
    }
  }
  return latest
}

function profileForPoint(db, pointId) {
  const rows = Array.isArray(db.thresholdProfiles) ? db.thresholdProfiles : []
  const found = rows.find((row) => Number(row.pointId) === pointId)
  if (found) return { ...DEFAULT_THRESHOLD_PROFILE, ...found, pointId }
  return { ...DEFAULT_THRESHOLD_PROFILE, pointId }
}

function defaultPointNameOf(db, pointId) {
  const point = (db.monitorPoints || []).find((row) => Number(row.id) === pointId)
  return point && point.name ? point.name : `POINT-${pointId}`
}

function fieldIdOfPoint(db, pointId) {
  const field = (db.fields || []).find((row) => Number(row.monitorPointId) === pointId)
  return field && field.id ? String(field.id) : null
}

function runChain1OnDb(db, now) {
  if (!Array.isArray(db.weatherReadings)) db.weatherReadings = []
  if (!Array.isArray(db.ruleState)) db.ruleState = []
  if (!Array.isArray(db.alerts)) db.alerts = []

  const latest = latestWeatherByPoint(db.weatherReadings)
  const processed = new Set()
  const nextStates = []
  const incoming = []

  for (const [pointId, row] of latest) {
    processed.add(pointId)
    const reading = readingFromWeatherRow(row)
    const profile = profileForPoint(db, pointId)
    const prevStates = db.ruleState.filter((s) => s.pointId === pointId)
    const name = defaultPointNameOf(db, pointId)
    const out = evaluateReading(reading, profile, prevStates, now, name)
    const fieldId = fieldIdOfPoint(db, pointId)
    for (const alert of out.alertsToCreate) {
      incoming.push({ ...alert, fieldId })
    }
    nextStates.push(...out.nextStates)
  }

  db.ruleState = db.ruleState.filter((s) => !processed.has(s.pointId)).concat(nextStates)
  const { alerts, created } = dedupeAlerts(db.alerts, incoming)
  db.alerts = alerts
  return { created }
}

function evaluateForecast(pointId, pointName, days) {
  const sorted = [...(days || [])].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  const events = []

  function pushEvent(ruleId, type, title, description, level, startAt) {
    events.push({ pointId, ruleId, type, title, description, level, startAt })
  }

  for (const day of sorted) {
    if (day.tempMax >= 40) {
      pushEvent(
        'extreme_heat_40',
        'high_temperature',
        '极端高温',
        `预报最高气温达到 ${day.tempMax}℃`,
        'critical',
        day.date
      )
    }
    if (day.tempMin <= -5) {
      pushEvent('extreme_frost', 'frost', '霜冻风险', `预报最低气温 ${day.tempMin}℃`, 'high', day.date)
    }
    if (day.windMax >= 17.2) {
      pushEvent('extreme_wind', 'gale', '大风', `预报最大风速 ${day.windMax} m/s`, 'warning', day.date)
    }
    if (day.precipMm >= 50) {
      pushEvent('extreme_rain', 'heavy_rain', '暴雨', `预报日降水 ${day.precipMm} mm`, 'high', day.date)
    }
  }

  for (let i = 0; i <= sorted.length - 3; i++) {
    const window = sorted.slice(i, i + 3)
    if (window.every((d) => d.tempMax >= 38)) {
      pushEvent(
        'extreme_heat_3d',
        'high_temperature',
        '连续高温',
        `连续 3 日最高气温 ≥ 38℃（自 ${window[0].date}）`,
        'warning',
        window[0].date
      )
      break
    }
  }

  const alertsToCreate = events.map((event) => ({
    pointId: event.pointId,
    fieldId: null,
    level: event.level,
    message: `[极端天气] ${pointName} - ${event.title}：${event.description}`,
    time: Date.now(),
    handled: false,
    source: 'auto',
    ruleId: event.ruleId,
    chain: 'extreme',
    draft: false
  }))
  return { events, alertsToCreate }
}

function upsertExtremeEvents(existing, incoming) {
  const events = [...(existing || [])]
  const added = []
  let id = nextAlertId(events)
  for (const item of incoming || []) {
    const dup = events.find(
      (row) => row.pointId === item.pointId && row.type === item.type && row.startAt === item.startAt
    )
    if (dup) continue
    const row = { ...item, id }
    id += 1
    events.push(row)
    added.push(row)
  }
  return { events, added }
}

function runChain2OnDb(db, now) {
  if (!Array.isArray(db.weatherForecast)) db.weatherForecast = []
  if (!Array.isArray(db.extremeEvents)) db.extremeEvents = []
  if (!Array.isArray(db.alerts)) db.alerts = []

  const byPoint = new Map()
  for (const row of db.weatherForecast) {
    const pointId = Number(row.pointId)
    if (!byPoint.has(pointId)) byPoint.set(pointId, [])
    byPoint.get(pointId).push(row)
  }

  const incomingEvents = []
  const incomingAlerts = []
  for (const [pointId, days] of byPoint) {
    const name = defaultPointNameOf(db, pointId)
    const fieldId = fieldIdOfPoint(db, pointId)
    const out = evaluateForecast(pointId, name, days)
    incomingEvents.push(...out.events)
    for (const alert of out.alertsToCreate) {
      incomingAlerts.push({ ...alert, fieldId, time: (now || new Date()).getTime() })
    }
  }

  db.extremeEvents = upsertExtremeEvents(db.extremeEvents, incomingEvents).events
  const { alerts, created } = dedupeAlerts(db.alerts, incomingAlerts)
  db.alerts = alerts
  return { created }
}

function filterReadings(rows, pointId, from, to) {
  return [...(rows || [])]
    .filter((row) => Number(row.pointId) === Number(pointId))
    .filter((row) => {
      const day = String(row.recordedAt || '').slice(0, 10)
      if (from && day < from) return false
      if (to && day > to) return false
      return true
    })
    .sort((a, b) => String(a.recordedAt).localeCompare(String(b.recordedAt)))
}

function tickSoilVwc(current) {
  const stepped = Number((Number(current) + 0.4).toFixed(1))
  if (stepped > 14.5) return 11
  if (stepped < 11) return 11
  return stepped
}

function localDay(now) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}

function nextRowId(rows) {
  let max = 0
  for (const row of rows || []) {
    const id = Number(row.id) || 0
    if (id > max) max = id
  }
  return max + 1
}

function tickSensorSimulation(db, now) {
  const clock = now || new Date()
  if (!Array.isArray(db.weatherReadings)) return
  const latest = latestWeatherByPoint(db.weatherReadings)
  const row = latest.get(2)
  if (!row) return
  row.soilVwc = tickSoilVwc(row.soilVwc)

  if (!Array.isArray(db.monitorPoints)) db.monitorPoints = []
  const point = db.monitorPoints.find((item) => Number(item.id) === 2)
  if (point) {
    point.online = true
    point.lastSeenAt = clock.toISOString()
  }

  if (!Array.isArray(db.sensorReadings)) db.sensorReadings = []
  const today = localDay(clock)
  const existing = db.sensorReadings.find(
    (item) => Number(item.pointId) === 2 && String(item.recordedAt).slice(0, 10) === today
  )
  if (existing) {
    existing.soilVwc = row.soilVwc
    return
  }
  db.sensorReadings.push({
    id: nextRowId(db.sensorReadings),
    pointId: 2,
    recordedAt: today + 'T08:00:00+08:00',
    airTemp: Number(row.airTemp != null ? row.airTemp : 0),
    airRh: Number(row.airRh != null ? row.airRh : 0),
    soilVwc: row.soilVwc,
    soilTemp10cm: Number(row.soilTemp10cm != null ? row.soilTemp10cm : 0)
  })
}

function ndviMid(layer) {
  if (!layer) return 0.5
  const min = Number(layer.ndviMin != null ? layer.ndviMin : 0.5)
  const max = Number(layer.ndviMax != null ? layer.ndviMax : 0.5)
  return (min + max) / 2
}

function latestNdviByField(db) {
  const map = new Map()
  for (const layer of db.ndviLayers || []) {
    const prev = map.get(String(layer.fieldId))
    if (!prev || String(layer.date) >= String(prev.date)) {
      map.set(String(layer.fieldId), layer)
    }
  }
  return map
}

function recentAiCount(db, pointId, now) {
  const cutoff = now.getTime() - 7 * 24 * 60 * 60 * 1000
  return (db.alerts || []).filter(
    (row) =>
      Number(row.pointId) === pointId &&
      Number(row.time) >= cutoff &&
      String(row.message || '').includes('[AI识别]')
  ).length
}

function evaluatePestRisk(input) {
  const factors = []
  const forecast = input.forecast || []
  const sorted = [...forecast].sort((a, b) => String(a.date).localeCompare(String(b.date)))

  for (let i = 0; i <= sorted.length - 3; i++) {
    const window = sorted.slice(i, i + 3)
    if (window.every((d) => Number(d.humidity || 0) > 80)) {
      factors.push('连续 3 日湿度 > 80%')
      break
    }
  }

  const rain = sorted.slice(0, 7).reduce((sum, d) => sum + Number(d.precipMm || 0), 0)
  if (rain > 80) factors.push('7 日累计降水偏多')

  if (input.ndviFieldAvg > 0 && input.ndvi < input.ndviFieldAvg * 0.85) {
    factors.push('NDVI 低于田间均值 15%')
  }

  const five = sorted.slice(0, 5)
  if (five.length) {
    const mean = five.reduce((acc, d) => acc + (Number(d.tempMax) + Number(d.tempMin)) / 2, 0) / five.length
    if (mean >= 22 && mean <= 28 && String(input.crop).includes('小麦')) {
      factors.push('气温处于病害流行适温区间')
    }
  }

  if (input.recentAiAlertCount >= 2) factors.push('近期 AI 已多次检出病虫害')

  const score = factors.length
  const riskLevel = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low'
  const window = forecast.length ? `${forecast[0].date}~${forecast[forecast.length - 1].date}` : ''
  const result = { riskLevel, factors, window }
  if (riskLevel === 'high') {
    result.draftAlert = {
      pointId: input.pointId || 0,
      fieldId: input.fieldId,
      level: 'high',
      message: `[虫情风险] 地块 ${input.fieldName} - 风险等级：high（${factors.join('；')}）`,
      time: Date.now(),
      handled: false,
      source: 'auto',
      ruleId: 'pest_risk',
      chain: 'pest',
      draft: true
    }
  }
  return result
}

function publishAlert(db, id) {
  const row = (db.alerts || []).find((item) => Number(item.id) === Number(id))
  if (!row) return null
  row.draft = false
  return row
}

function runChain3OnDb(db, now) {
  if (!Array.isArray(db.fields)) db.fields = []
  if (!Array.isArray(db.pestRiskPredictions)) db.pestRiskPredictions = []
  if (!Array.isArray(db.alerts)) db.alerts = []
  if (!Array.isArray(db.weatherForecast)) db.weatherForecast = []

  const latestNdvi = latestNdviByField(db)
  const mids = [...latestNdvi.values()].map((layer) => ndviMid(layer))
  const ndviFieldAvg = mids.length ? mids.reduce((a, b) => a + b, 0) / mids.length : 0.5
  const predictions = []
  const incoming = []

  for (const field of db.fields) {
    const fieldId = String(field.id)
    const pointId = Number(field.monitorPointId || 0)
    const forecast = (db.weatherForecast || []).filter((row) => Number(row.pointId) === pointId)
    const profile = profileForPoint(db, pointId)
    const out = evaluatePestRisk({
      fieldId,
      fieldName: field.name || fieldId,
      pointId,
      forecast,
      ndvi: ndviMid(latestNdvi.get(fieldId)),
      ndviFieldAvg,
      crop: profile.crop || '小麦',
      growthStage: profile.growthStage || '拔节',
      recentAiAlertCount: recentAiCount(db, pointId, now || new Date())
    })
    predictions.push({
      id: predictions.length + 1,
      fieldId,
      riskLevel: out.riskLevel,
      factors: out.factors,
      window: out.window
    })
    if (out.draftAlert) incoming.push({ ...out.draftAlert, time: (now || new Date()).getTime() })
  }

  db.pestRiskPredictions = predictions
  const { alerts, created } = dedupeAlerts(db.alerts, incoming)
  db.alerts = alerts
  return { created }
}

function appendNotifications(db, createdAlerts, now) {
  const clock = now || new Date()
  if (!Array.isArray(db.notifications)) db.notifications = []
  let nextId = nextAlertId(db.notifications)
  for (const alert of createdAlerts || []) {
    let title = String(alert.message || '').slice(0, 40)
    if (alert.draft) title = '草稿 ' + title
    db.notifications.push({
      id: nextId,
      title,
      read: false,
      alertId: alert.id,
      createdAt: clock.toISOString()
    })
    nextId += 1
  }
}

function runAllChains(db, now) {
  const env = runChain1OnDb(db, now)
  const extreme = runChain2OnDb(db, now)
  const pest = runChain3OnDb(db, now)
  const created = env.created.concat(extreme.created, pest.created)
  appendNotifications(db, created, now)
  return { created }
}

function buildDailyReport(input) {
  const alerts = input.alerts || []
  const pending = alerts.filter((row) => !row.handled).length
  const pointLines = (input.points || []).map((point) => {
    const status = point.online === false ? '离线' : '在线'
    return '- ' + point.name + '（' + status + '，气温 ' + (point.temp != null ? point.temp : '—') + '℃，墒情 ' + (point.soilMoisture != null ? point.soilMoisture : '—') + '%）'
  })
  const extremeEvents = input.extremeEvents || []
  const extremeLines = extremeEvents.length
    ? extremeEvents.map((event) => '- ' + event.title + '（' + event.startAt + '）')
    : ['- 无']
  return [
    '# 监测日报',
    '生成时间：' + input.generatedAt,
    '',
    '## 监测点',
    ...(pointLines.length ? pointLines : ['- 无监测点']),
    '',
    '## 预警统计',
    '- 总数: ' + alerts.length,
    '- 待处理: ' + pending,
    '',
    '## 极端天气',
    ...extremeLines,
    ''
  ].join('\n')
}

module.exports = {
  DEFAULT_THRESHOLD_PROFILE,
  nextAlertId,
  dedupeAlerts,
  runChain1OnDb,
  runChain2OnDb,
  runChain3OnDb,
  runAllChains,
  filterReadings,
  tickSoilVwc,
  tickSensorSimulation,
  appendNotifications,
  buildDailyReport,
  profileForPoint,
  publishAlert
}
