from __future__ import annotations

from datetime import datetime
from typing import Any

from rules.rule_level_map import map_rule_level

DEFAULT_THRESHOLD_PROFILE: dict[str, Any] = {
    "pointId": 0,
    "crop": "小麦",
    "growthStage": "拔节",
    "waterStressHint": 25,
    "waterStressAlert": 15,
    "waterStressHintMinutes": 30,
    "waterStressAlertMinutes": 10,
    "heatHint": 32,
    "heatAlert": 38,
    "heatHintMinutes": 30,
    "heatAlertMinutes": 10,
    "waterloggingAlert": 80,
    "waterloggingMinutes": 10,
}


def detect_hits(reading: dict, profile: dict) -> list[dict]:
    hits: list[dict] = []
    soil = float(reading["soilVwc"])
    temp = float(reading["airTemp"])

    if soil < profile["waterStressAlert"]:
        hits.append(
            {
                "ruleId": "water_stress",
                "level": "alert",
                "durationMinutes": profile["waterStressAlertMinutes"],
                "reason": "soil moisture below alert",
                "metric": "soilVwc",
                "value": soil,
                "threshold": profile["waterStressAlert"],
            }
        )
    elif soil < profile["waterStressHint"]:
        hits.append(
            {
                "ruleId": "water_stress",
                "level": "hint",
                "durationMinutes": profile["waterStressHintMinutes"],
                "reason": "soil moisture below hint",
                "metric": "soilVwc",
                "value": soil,
                "threshold": profile["waterStressHint"],
            }
        )

    if soil > profile["waterloggingAlert"]:
        hits.append(
            {
                "ruleId": "waterlogging",
                "level": "alert",
                "durationMinutes": profile["waterloggingMinutes"],
                "reason": "soil moisture above waterlogging",
                "metric": "soilVwc",
                "value": soil,
                "threshold": profile["waterloggingAlert"],
            }
        )

    if temp > profile["heatAlert"]:
        hits.append(
            {
                "ruleId": "heat_stress",
                "level": "alert",
                "durationMinutes": profile["heatAlertMinutes"],
                "reason": "air temp above alert",
                "metric": "airTemp",
                "value": temp,
                "threshold": profile["heatAlert"],
            }
        )
    elif temp > profile["heatHint"]:
        hits.append(
            {
                "ruleId": "heat_stress",
                "level": "hint",
                "durationMinutes": profile["heatHintMinutes"],
                "reason": "air temp above hint",
                "metric": "airTemp",
                "value": temp,
                "threshold": profile["heatHint"],
            }
        )

    return hits


def build_env_alert_message(point_name: str, hit: dict, elapsed_minutes: int) -> str:
    kind = "提示阈值" if hit["level"] == "hint" else "告警阈值"
    if hit["metric"] == "airTemp":
        return (
            f"[自动预警] {point_name} - 气温 {hit['value']}℃ 超过{kind} {hit['threshold']}℃，"
            f"已持续 {elapsed_minutes} min"
        )
    if hit["ruleId"] == "waterlogging":
        return (
            f"[自动预警] {point_name} - 土壤湿度 {hit['value']}% 偏高，高于{kind} {hit['threshold']}%，"
            f"已持续 {elapsed_minutes} min"
        )
    return (
        f"[自动预警] {point_name} - 土壤湿度 {hit['value']}% 低于{kind} {hit['threshold']}%，"
        f"已持续 {elapsed_minutes} min"
    )


def evaluate_reading(
    reading: dict,
    profile: dict,
    states: list[dict],
    now: datetime,
    point_name: str = "POINT",
) -> dict:
    next_states: list[dict] = []
    alerts_to_create: list[dict] = []
    hits: list[dict] = []
    now_iso = now.isoformat()

    for hit in detect_hits(reading, profile):
        hits.append(hit)
        prev = next(
            (
                item
                for item in states
                if item["pointId"] == reading["pointId"] and item["ruleId"] == hit["ruleId"]
            ),
            None,
        )
        started_at = prev["startedAt"] if prev and prev.get("level") == hit["level"] else now_iso
        elapsed = (now.timestamp() * 1000 - _parse_ms(started_at)) / 60000
        alert_emitted = bool(prev and prev.get("alertEmitted") and prev.get("level") == hit["level"])
        state = {
            "pointId": reading["pointId"],
            "ruleId": hit["ruleId"],
            "level": hit["level"],
            "startedAt": started_at,
            "lastSeenAt": now_iso,
            "alertEmitted": alert_emitted,
        }
        if elapsed >= hit["durationMinutes"] and not state["alertEmitted"]:
            alerts_to_create.append(
                {
                    "pointId": reading["pointId"],
                    "fieldId": None,
                    "level": map_rule_level(hit["level"]),
                    "message": build_env_alert_message(point_name, hit, int(elapsed)),
                    "time": int(now.timestamp() * 1000),
                    "handled": False,
                    "source": "auto",
                    "ruleId": hit["ruleId"],
                    "chain": "env",
                    "draft": False,
                }
            )
            state["alertEmitted"] = True
        next_states.append(state)

    return {"hits": hits, "nextStates": next_states, "alertsToCreate": alerts_to_create}


def _parse_ms(value: str) -> float:
    text = str(value)
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    return datetime.fromisoformat(text).timestamp() * 1000
