from __future__ import annotations

from datetime import datetime


def _day_mean_temp(day: dict) -> float:
    return (float(day.get("tempMax") or 0) + float(day.get("tempMin") or 0)) / 2


def _has_humid_3d(days: list[dict]) -> bool:
    sorted_days = sorted(days, key=lambda item: str(item.get("date") or ""))
    for index in range(0, max(0, len(sorted_days) - 2)):
        window = sorted_days[index : index + 3]
        if all(float(item.get("humidity") or 0) > 80 for item in window):
            return True
    return False


def _rain_7d(days: list[dict]) -> float:
    sorted_days = sorted(days, key=lambda item: str(item.get("date") or ""))[:7]
    return sum(float(item.get("precipMm") or 0) for item in sorted_days)


def _mean_temp_5d(days: list[dict]) -> float | None:
    sorted_days = sorted(days, key=lambda item: str(item.get("date") or ""))[:5]
    if not sorted_days:
        return None
    return sum(_day_mean_temp(item) for item in sorted_days) / len(sorted_days)


def evaluate_pest_risk(input_data: dict) -> dict:
    factors: list[str] = []
    forecast = list(input_data.get("forecast") or [])
    if _has_humid_3d(forecast):
        factors.append("连续 3 日湿度 > 80%")
    if _rain_7d(forecast) > 80:
        factors.append("7 日累计降水偏多")
    ndvi = float(input_data.get("ndvi") or 0)
    ndvi_avg = float(input_data.get("ndviFieldAvg") or 0)
    if ndvi_avg > 0 and ndvi < ndvi_avg * 0.85:
        factors.append("NDVI 低于田间均值 15%")
    mean5 = _mean_temp_5d(forecast)
    crop = str(input_data.get("crop") or "")
    if mean5 is not None and 22 <= mean5 <= 28 and "小麦" in crop:
        factors.append("气温处于病害流行适温区间")
    if int(input_data.get("recentAiAlertCount") or 0) >= 2:
        factors.append("近期 AI 已多次检出病虫害")

    score = len(factors)
    risk_level = "high" if score >= 4 else "medium" if score >= 2 else "low"
    window = ""
    if forecast:
        first = str(forecast[0].get("date") or "")
        last = str(forecast[-1].get("date") or "")
        window = f"{first}~{last}"

    result: dict = {"riskLevel": risk_level, "factors": factors, "window": window}
    if risk_level == "high":
        field_name = input_data.get("fieldName") or input_data.get("fieldId")
        result["draftAlert"] = {
            "pointId": int(input_data.get("pointId") or 0),
            "fieldId": input_data.get("fieldId"),
            "level": "high",
            "message": f"[虫情风险] 地块 {field_name} - 风险等级：high（{'；'.join(factors)}）",
            "time": int(datetime.now().timestamp() * 1000),
            "handled": False,
            "source": "auto",
            "ruleId": "pest_risk",
            "chain": "pest",
            "draft": True,
        }
    return result
