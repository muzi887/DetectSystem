from __future__ import annotations

from datetime import datetime


def evaluate_forecast(point_id: int, point_name: str, days: list[dict]) -> dict:
    sorted_days = sorted(days, key=lambda item: str(item.get("date") or ""))
    events: list[dict] = []

    def make_event(rule_id: str, type_name: str, title: str, description: str, level: str, start_at: str):
        return {
            "pointId": point_id,
            "ruleId": rule_id,
            "type": type_name,
            "title": title,
            "description": description,
            "level": level,
            "startAt": start_at,
        }

    for day in sorted_days:
        temp_max = float(day.get("tempMax") or 0)
        temp_min = float(day.get("tempMin") or 0)
        wind_max = float(day.get("windMax") or 0)
        precip = float(day.get("precipMm") or 0)
        date = str(day.get("date") or "")
        if temp_max >= 40:
            events.append(
                make_event(
                    "extreme_heat_40",
                    "high_temperature",
                    "极端高温",
                    f"预报最高气温达到 {temp_max}℃",
                    "critical",
                    date,
                )
            )
        if temp_min <= -5:
            events.append(
                make_event(
                    "extreme_frost",
                    "frost",
                    "霜冻风险",
                    f"预报最低气温 {temp_min}℃",
                    "high",
                    date,
                )
            )
        if wind_max >= 17.2:
            events.append(
                make_event(
                    "extreme_wind",
                    "gale",
                    "大风",
                    f"预报最大风速 {wind_max} m/s",
                    "warning",
                    date,
                )
            )
        if precip >= 50:
            events.append(
                make_event(
                    "extreme_rain",
                    "heavy_rain",
                    "暴雨",
                    f"预报日降水 {precip} mm",
                    "high",
                    date,
                )
            )

    for index in range(0, max(0, len(sorted_days) - 2)):
        window = sorted_days[index : index + 3]
        if window and all(float(item.get("tempMax") or 0) >= 38 for item in window):
            events.append(
                make_event(
                    "extreme_heat_3d",
                    "high_temperature",
                    "连续高温",
                    f"连续 3 日最高气温 ≥ 38℃（自 {window[0].get('date')}）",
                    "warning",
                    str(window[0].get("date") or ""),
                )
            )
            break

    alerts = [
        {
            "pointId": event["pointId"],
            "fieldId": None,
            "level": event["level"],
            "message": f"[极端天气] {point_name} - {event['title']}：{event['description']}",
            "time": int(datetime.now().timestamp() * 1000),
            "handled": False,
            "source": "auto",
            "ruleId": event["ruleId"],
            "chain": "extreme",
            "draft": False,
        }
        for event in events
    ]
    return {"events": events, "alertsToCreate": alerts}
