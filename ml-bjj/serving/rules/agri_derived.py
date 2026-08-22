from __future__ import annotations

import math
import time

ROLE_MAP = {
    "admin": "admin",
    "agronomist": "agronomist",
    "cooperative": "cooperative",
    "user": "cooperative",
}


def normalize_role(role: str | None) -> str:
    return ROLE_MAP.get(str(role or ""), "cooperative")


def handle_farm_login(users: list[dict], body: dict) -> dict:
    phone = body.get("phone")
    password = body.get("password")
    code = body.get("code")
    requested_role = normalize_role(body.get("role"))
    user = next((item for item in users if item.get("phone") == phone), None)
    pass_password = bool(user and password and user.get("password") == password)
    pass_demo_code = bool(user and code == "2026")
    if not user or (not pass_password and not pass_demo_code):
        return {"ok": False, "status": 401, "body": {"message": "手机号、验证码或备用密码错误"}}
    return {
        "ok": True,
        "status": 200,
        "body": {
            "code": 200,
            "message": "登录成功",
            "token": f"qinghe-{requested_role}-{int(time.time() * 1000)}",
            "user": {
                "id": user.get("id"),
                "name": user.get("name"),
                "phone": user.get("phone"),
                "role": requested_role,
            },
        },
    }


def build_ndvi_summary(points: list[dict], alerts: list[dict]) -> dict:
    active = {item.get("pointId") for item in alerts if not item.get("handled")}
    samples = []
    for index, point in enumerate(points):
        moisture = float(point.get("soilMoisture") or 0)
        temp = float(point.get("temp") or 0)
        penalty = 0.08 if point.get("id") in active else 0
        ndvi = max(0.28, min(0.86, 0.72 + moisture / 300 - temp / 500 - penalty))
        samples.append(
            {
                "pointId": point.get("id"),
                "pointName": point.get("name"),
                "ndvi": round(ndvi, 2),
                "vegetationLevel": "旺盛" if ndvi >= 0.72 else "正常" if ndvi >= 0.55 else "偏弱",
                "sampleNo": f"NDVI-{str(index + 1).zfill(3)}",
            }
        )
    average = sum(item["ndvi"] for item in samples) / len(samples) if samples else 0
    return {
        "code": 200,
        "message": "NDVI 摘要已生成",
        "data": {
            "averageNdvi": round(average, 2),
            "weakCount": len([item for item in samples if item["vegetationLevel"] == "偏弱"]),
            "samples": samples,
        },
    }


def build_soil_moisture_trend(points: list[dict]) -> dict:
    base = (
        sum(float(point.get("soilMoisture") or 0) for point in points) / len(points) if points else 30
    )
    days = []
    for index in range(7):
        offset = index - 3
        moisture = max(6, min(85, base + offset * 1.8 + math.sin(index) * 3))
        days.append(
            {
                "dateOffset": offset,
                "moisture": round(moisture, 1),
                "irrigationAdvice": "建议补水" if moisture < 20 else "注意排水" if moisture > 75 else "保持观察",
            }
        )
    return {
        "code": 200,
        "message": "土壤湿度趋势已生成",
        "data": {"stationCount": len(points), "unit": "%", "trend": days},
    }


def _to_rad(deg: float) -> float:
    return deg * math.pi / 180


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    d_lat = _to_rad(lat2 - lat1)
    d_lng = _to_rad(lng2 - lng1)
    a = math.sin(d_lat / 2) ** 2 + math.cos(_to_rad(lat1)) * math.cos(_to_rad(lat2)) * math.sin(d_lng / 2) ** 2
    return 6371 * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def query_moisture_by_nearest_point(points: list[dict], lat, lng) -> dict:
    if not points:
        return {"ok": False, "status": 404, "body": {"message": "无监测点数据"}}
    try:
        lat_num = float(lat)
        lng_num = float(lng)
    except (TypeError, ValueError):
        return {"ok": False, "status": 400, "body": {"message": "请提供有效的 lat、lng 查询参数"}}
    nearest = points[0]
    min_dist = float("inf")
    for point in points:
        dist = haversine_km(lat_num, lng_num, float(point.get("lat") or 0), float(point.get("lng") or 0))
        if dist < min_dist:
            min_dist = dist
            nearest = point
    return {
        "ok": True,
        "status": 200,
        "body": {
            "moisture": float(nearest.get("soilMoisture") or 0),
            "source": "nearest-point",
            "nearestPointId": nearest.get("id"),
            "pointName": nearest.get("name"),
            "distanceKm": round(min_dist, 1),
        },
    }


def evaluate_disaster_rules(points: list[dict], body: dict) -> dict:
    point_id = int(body.get("pointId") or (points[0].get("id") if points else 0) or 0)
    point = next((item for item in points if item.get("id") == point_id), points[0] if points else None)
    temp = float(body.get("temp") if body.get("temp") is not None else (point or {}).get("temp") or 0)
    soil = float(
        body.get("soilMoisture") if body.get("soilMoisture") is not None else (point or {}).get("soilMoisture") or 0
    )
    rules = []
    if temp >= 38:
        rules.append({"rule": "high_temperature", "level": "critical", "reason": "温度达到高温危险阈值"})
    elif temp >= 32:
        rules.append({"rule": "heat_attention", "level": "warning", "reason": "温度进入持续关注区间"})
    if soil <= 15:
        rules.append({"rule": "drought_risk", "level": "critical", "reason": "土壤湿度低于重旱阈值"})
    elif soil <= 25:
        rules.append({"rule": "water_stress", "level": "warning", "reason": "土壤湿度低于警戒线"})
    if soil >= 80:
        rules.append({"rule": "waterlogging_risk", "level": "warning", "reason": "土壤湿度偏高，需关注涝渍"})
    level = "critical" if any(item["level"] == "critical" for item in rules) else "warning" if rules else "normal"
    advice = {
        "critical": "建议立即派人现场复核，并同步预警中心。",
        "warning": "建议提高巡检频次，必要时触发人工预警。",
        "normal": "当前指标未触发灾害规则，按常规频次观察。",
    }[level]
    return {
        "code": 200,
        "message": "灾害规则评估完成",
        "data": {
            "pointId": (point or {}).get("id") or point_id,
            "pointName": (point or {}).get("name") or "未知监测点",
            "level": level,
            "rules": rules,
            "advice": advice,
        },
    }
