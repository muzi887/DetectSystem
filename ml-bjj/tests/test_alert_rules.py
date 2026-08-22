from __future__ import annotations

from datetime import datetime

from rules.alert_rules import build_env_alert_message, evaluate_reading
from rules.rule_level_map import map_rule_level

PROFILE = {
    "pointId": 2,
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


def reading(**over):
    base = {
        "pointId": 2,
        "airTemp": 26,
        "soilVwc": 12.8,
        "recordedAt": "2026-08-21T08:00:00+08:00",
    }
    base.update(over)
    return base


def test_jitter_does_not_emit_before_duration():
    now = datetime.fromisoformat("2026-08-21T08:02:00+08:00")
    out = evaluate_reading(reading(), PROFILE, [], now)
    assert len(out["alertsToCreate"]) == 0
    assert out["nextStates"][0]["alertEmitted"] is False
    assert out["nextStates"][0]["ruleId"] == "water_stress"


def test_sustained_alert_emits_one():
    started = datetime.fromisoformat("2026-08-21T07:50:00+08:00")
    now = datetime.fromisoformat("2026-08-21T08:02:00+08:00")
    states = [
        {
            "pointId": 2,
            "ruleId": "water_stress",
            "level": "alert",
            "startedAt": started.isoformat(),
            "lastSeenAt": started.isoformat(),
            "alertEmitted": False,
        }
    ]
    out = evaluate_reading(reading(), PROFILE, states, now)
    assert len(out["alertsToCreate"]) == 1
    assert out["alertsToCreate"][0]["chain"] == "env"
    assert out["alertsToCreate"][0]["ruleId"] == "water_stress"
    assert out["alertsToCreate"][0]["level"] == "high"
    assert out["alertsToCreate"][0]["message"].startswith("[自动预警]")
    assert out["nextStates"][0]["alertEmitted"] is True


def test_recovery_clears_state():
    now = datetime.fromisoformat("2026-08-21T08:02:00+08:00")
    states = [
        {
            "pointId": 2,
            "ruleId": "water_stress",
            "level": "alert",
            "startedAt": "2026-08-21T07:00:00+08:00",
            "lastSeenAt": "2026-08-21T07:50:00+08:00",
            "alertEmitted": True,
        }
    ]
    out = evaluate_reading(reading(soilVwc=30), PROFILE, states, now)
    assert out["nextStates"] == []
    assert out["alertsToCreate"] == []


def test_map_rule_level_and_message():
    assert map_rule_level("hint") == "warning"
    assert map_rule_level("alert") == "high"
    hit = {
        "ruleId": "water_stress",
        "level": "alert",
        "metric": "soilVwc",
        "value": 12.8,
        "threshold": 15,
    }
    message = build_env_alert_message("监测站 · 雄县", hit, 12)
    assert message.startswith("[自动预警]")
    assert "12.8" in message
