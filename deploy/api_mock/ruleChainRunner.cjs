const DEFAULT_THRESHOLD_PROFILE = {
  pointId: 0,
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
  if (found) return found
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

function tickSoilVwc(current) {
  const stepped = Number((Number(current) + 0.4).toFixed(1))
  if (stepped > 14.5) return 11
  if (stepped < 11) return 11
  return stepped
}

function tickSensorSimulation(db) {
  if (!Array.isArray(db.weatherReadings)) return
  const latest = latestWeatherByPoint(db.weatherReadings)
  const row = latest.get(2)
  if (!row) return
  row.soilVwc = tickSoilVwc(row.soilVwc)
}

function runChain3OnDb() {
  return { created: [] }
}

function runAllChains(db, now) {
  const env = runChain1OnDb(db, now)
  const extreme = runChain2OnDb(db, now)
  const pest = runChain3OnDb(db, now)
  return { created: env.created.concat(extreme.created, pest.created) }
}

module.exports = {
  DEFAULT_THRESHOLD_PROFILE,
  nextAlertId,
  dedupeAlerts,
  runChain1OnDb,
  runChain2OnDb,
  runChain3OnDb,
  runAllChains,
  tickSoilVwc,
  tickSensorSimulation,
  profileForPoint
}
