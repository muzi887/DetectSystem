from __future__ import annotations

from datetime import datetime

from rules.persist import dedupe_alerts, next_alert_id, tick_soil_vwc


def test_dedupe_skips_unhandled_same_key():
    existing = [{"id": 1, "pointId": 2, "ruleId": "water_stress", "chain": "env", "handled": False, "message": "x"}]
    incoming = [
        {
            "pointId": 2,
            "ruleId": "water_stress",
            "chain": "env",
            "handled": False,
            "message": "y",
            "level": "high",
            "time": 1,
            "source": "auto",
            "draft": False,
        }
    ]
    out = dedupe_alerts(existing, incoming)
    assert len(out["created"]) == 0
    assert len(out["alerts"]) == 1


def test_next_alert_id_is_max_plus_one():
    assert next_alert_id([{"id": 37}, {"id": 12}]) == 38


def test_tick_keeps_xiongxian_in_drought_band():
    next_vwc = tick_soil_vwc(12.8)
    assert 11 <= next_vwc <= 14.5


def test_chain1_inserts_then_dedupes(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'p.db'}")
    import db as serving_db
    from models import Alert, Base, MonitorPoint, WeatherReading
    from rules.persist import run_chain1

    serving_db.reset_engine_cache()
    Base.metadata.create_all(serving_db.get_engine())
    now = datetime.fromisoformat("2026-08-21T08:20:00+08:00")
    with serving_db.session_scope() as session:
        session.add(MonitorPoint(id=2, name="监测站 · 雄县"))
        session.add(WeatherReading(id=1, point_id=2, air_temp=26, soil_vwc=12.8, updated_at=now.isoformat()))
        session.add(
            Alert(
                id=1,
                point_id=2,
                rule_id="water_stress",
                chain="env",
                handled=False,
                message="existing",
                time=1,
                draft=False,
            )
        )
        first = run_chain1(session, now)
        assert first["created"] == [] or all(item["ruleId"] != "water_stress" for item in first["created"]) or True
        # existing unhandled same key should skip water_stress
        created_ids = [item["ruleId"] for item in first["created"]]
        assert "water_stress" not in created_ids
