const ROLE_MAP = {
  admin: 'admin',
  agronomist: 'agronomist',
  cooperative: 'cooperative',
  user: 'cooperative'
}

function normalizeRole(role) {
  return ROLE_MAP[role] || 'cooperative'
}

function getMonitorPoints(db) {
  return Array.isArray(db.monitorPoints) ? db.monitorPoints : []
}

function getAlerts(db) {
  return Array.isArray(db.alerts) ? db.alerts : []
}

function handleFarmLogin(db, body = {}) {
  const { phone, password, code, role } = body
  const users = db.users || db.user || []
  const requestedRole = normalizeRole(role)
  const user = users.find((u) => u.phone === phone)
  const passPassword = user && password && user.password == password
  const passDemoCode = user && code === '2026'

  if (!user || (!passPassword && !passDemoCode)) {
    return {
      ok: false,
      status: 401,
      body: { message: '手机号、验证码或备用密码错误' }
    }
  }

  return {
    ok: true,
    status: 200,
    body: {
      code: 200,
      message: '登录成功',
      token: `qinghe-${requestedRole}-${Date.now()}`,
      user: { id: user.id, name: user.name, phone: user.phone, role: requestedRole }
    }
  }
}

function buildNdviSummary(db) {
  const points = getMonitorPoints(db)
  const alerts = getAlerts(db)
  const activeAlertPointIds = new Set(alerts.filter((a) => !a.handled).map((a) => a.pointId))
  const samples = points.map((point, index) => {
    const moisture = Number(point.soilMoisture || 0)
    const temp = Number(point.temp || 0)
    const stressPenalty = activeAlertPointIds.has(point.id) ? 0.08 : 0
    const ndvi = Math.max(0.28, Math.min(0.86, 0.72 + moisture / 300 - temp / 500 - stressPenalty))
    return {
      pointId: point.id,
      pointName: point.name,
      ndvi: Number(ndvi.toFixed(2)),
      vegetationLevel: ndvi >= 0.72 ? '旺盛' : ndvi >= 0.55 ? '正常' : '偏弱',
      sampleNo: `NDVI-${String(index + 1).padStart(3, '0')}`
    }
  })
  const average =
    samples.length > 0
      ? samples.reduce((sum, item) => sum + item.ndvi, 0) / samples.length
      : 0

  return {
    code: 200,
    message: 'NDVI 摘要已生成',
    data: {
      averageNdvi: Number(average.toFixed(2)),
      weakCount: samples.filter((item) => item.vegetationLevel === '偏弱').length,
      samples
    }
  }
}

function buildSoilMoistureTrend(db) {
  const points = getMonitorPoints(db)
  const base = points.length
    ? points.reduce((sum, point) => sum + Number(point.soilMoisture || 0), 0) / points.length
    : 30

  const days = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3
    const moisture = Math.max(6, Math.min(85, base + offset * 1.8 + Math.sin(index) * 3))
    return {
      dateOffset: offset,
      moisture: Number(moisture.toFixed(1)),
      irrigationAdvice: moisture < 20 ? '建议补水' : moisture > 75 ? '注意排水' : '保持观察'
    }
  })

  return {
    code: 200,
    message: '土壤湿度趋势已生成',
    data: {
      stationCount: points.length,
      unit: '%',
      trend: days
    }
  }
}

function evaluateDisasterRules(db, body = {}) {
  const points = getMonitorPoints(db)
  const pointId = Number(body.pointId || points[0]?.id || 0)
  const point = points.find((item) => item.id === pointId) || points[0]
  const temp = Number(body.temp ?? point?.temp ?? 0)
  const soilMoisture = Number(body.soilMoisture ?? point?.soilMoisture ?? 0)
  const rules = []

  if (temp >= 38) {
    rules.push({ rule: 'high_temperature', level: 'critical', reason: '温度达到高温危险阈值' })
  } else if (temp >= 32) {
    rules.push({ rule: 'heat_attention', level: 'warning', reason: '温度进入持续关注区间' })
  }

  if (soilMoisture <= 10) {
    rules.push({ rule: 'drought_risk', level: 'critical', reason: '土壤湿度低于重旱阈值' })
  } else if (soilMoisture <= 20) {
    rules.push({ rule: 'water_stress', level: 'warning', reason: '土壤湿度低于警戒线' })
  }

  if (soilMoisture >= 80) {
    rules.push({ rule: 'waterlogging_risk', level: 'warning', reason: '土壤湿度偏高，需关注涝渍' })
  }

  const level = rules.some((item) => item.level === 'critical')
    ? 'critical'
    : rules.length
      ? 'warning'
      : 'normal'

  return {
    code: 200,
    message: '灾害规则评估完成',
    data: {
      pointId: point?.id || pointId,
      pointName: point?.name || '未知监测点',
      level,
      rules,
      advice:
        level === 'critical'
          ? '建议立即派人现场复核，并同步预警中心。'
          : level === 'warning'
            ? '建议提高巡检频次，必要时触发人工预警。'
            : '当前指标未触发灾害规则，按常规频次观察。'
    }
  }
}

module.exports = {
  handleFarmLogin,
  buildNdviSummary,
  buildSoilMoistureTrend,
  evaluateDisasterRules
}
