from __future__ import annotations


def build_daily_report(input_data: dict) -> str:
    alerts = list(input_data.get("alerts") or [])
    pending = len([row for row in alerts if not row.get("handled")])
    points = list(input_data.get("points") or [])
    point_lines = []
    for point in points:
        status = "离线" if point.get("online") is False else "在线"
        point_lines.append(
            f"- {point.get('name')}（{status}，气温 {point.get('temp', '—')}℃，墒情 {point.get('soilMoisture', '—')}%）"
        )
    events = list(input_data.get("extremeEvents") or [])
    extreme_lines = (
        [f"- {event.get('title')}（{event.get('startAt')}）" for event in events] if events else ["- 无"]
    )
    return "\n".join(
        [
            "# 监测日报",
            f"生成时间：{input_data.get('generatedAt')}",
            "",
            "## 监测点",
            *(point_lines if point_lines else ["- 无监测点"]),
            "",
            "## 预警统计",
            f"- 总数: {len(alerts)}",
            f"- 待处理: {pending}",
            "",
            "## 极端天气",
            *extreme_lines,
            "",
        ]
    )
