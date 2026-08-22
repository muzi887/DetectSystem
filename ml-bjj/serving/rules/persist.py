from __future__ import annotations

from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from models import (
    Alert,
    ExtremeEvent,
    Field,
    MonitorPoint,
    NdviLayer,
    Notification,
    PestRiskPrediction,
    RuleState,
    SensorReading,
    ThresholdProfile,
    WeatherForecast,
    WeatherReading,
)
from rules.alert_rules import DEFAULT_THRESHOLD_PROFILE, evaluate_reading
from rules.extreme_weather_rules import evaluate_forecast
from rules.pest_risk_rules import evaluate_pest_risk


def next_alert_id(alerts: list[dict]) -> int:
    max_id = 0
    for row in alerts:
        max_id = max(max_id, int(row.get("id") or 0))
    return max_id + 1


def dedupe_alerts(existing: list[dict], incoming: list[dict]) -> dict:
    alerts = list(existing)
    created: list[dict] = []
    next_id = next_alert_id(alerts)
    for item in incoming:
        dup = next(
            (
                row
                for row in alerts
                if not row.get("handled")
                and row.get("pointId") == item.get("pointId")
                and row.get("ruleId") == item.get("ruleId")
                and row.get("chain") == item.get("chain")
            ),
            None,
        )
        if dup:
            continue
        row = {**item, "id": next_id}
        next_id += 1
        alerts.append(row)
        created.append(row)
    return {"alerts": alerts, "created": created}


def tick_soil_vwc(current: float) -> float:
    stepped = round(current + 0.4, 1)
    if stepped > 14.5:
        return 11
    if stepped < 11:
        return 11
    return stepped


def profile_for_point(session: Session, point_id: int) -> dict:
    row = session.scalar(select(ThresholdProfile).where(ThresholdProfile.point_id == point_id))
    merged = {**DEFAULT_THRESHOLD_PROFILE, "pointId": point_id}
    if row:
        merged.update(row.to_camel())
        merged["pointId"] = point_id
    return merged


def _point_name(session: Session, point_id: int) -> str:
    point = session.get(MonitorPoint, point_id)
    return point.name if point and point.name else f"POINT-{point_id}"


def _field_id_of_point(session: Session, point_id: int) -> str | None:
    field = session.scalar(select(Field).where(Field.monitor_point_id == point_id))
    return str(field.id) if field and field.id else None


def _insert_alerts(session: Session, incoming: list[dict]) -> list[dict]:
    existing_rows = list(session.scalars(select(Alert)).all())
    existing = [row.to_camel() for row in existing_rows]
    result = dedupe_alerts(existing, incoming)
    created = result["created"]
    for item in created:
        session.add(
            Alert(
                id=item["id"],
                point_id=item.get("pointId"),
                field_id=item.get("fieldId"),
                level=item.get("level"),
                message=item.get("message"),
                time=item.get("time"),
                handled=bool(item.get("handled")),
                source=item.get("source"),
                rule_id=item.get("ruleId"),
                chain=item.get("chain"),
                draft=bool(item.get("draft")),
            )
        )
    return created


def run_chain1(session: Session, now: datetime) -> dict:
    latest_ids = {}
    for row in session.scalars(select(WeatherReading)).all():
        point_id = int(row.point_id or 0)
        prev = latest_ids.get(point_id)
        if prev is None or int(row.id) >= int(prev.id):
            latest_ids[point_id] = row

    incoming: list[dict] = []
    processed: set[int] = set()
    for point_id, row in latest_ids.items():
        processed.add(point_id)
        reading = {
            "pointId": point_id,
            "airTemp": float(row.air_temp or 0),
            "soilVwc": float(row.soil_vwc or 0),
            "recordedAt": row.updated_at or "",
        }
        states = [
            item.to_camel()
            for item in session.scalars(select(RuleState).where(RuleState.point_id == point_id)).all()
        ]
        out = evaluate_reading(reading, profile_for_point(session, point_id), states, now, _point_name(session, point_id))
        field_id = _field_id_of_point(session, point_id)
        for alert in out["alertsToCreate"]:
            incoming.append({**alert, "fieldId": field_id})
        session.execute(RuleState.__table__.delete().where(RuleState.point_id == point_id))
        for state in out["nextStates"]:
            session.add(
                RuleState(
                    point_id=state["pointId"],
                    rule_id=state["ruleId"],
                    level=state["level"],
                    started_at=state["startedAt"],
                    last_seen_at=state["lastSeenAt"],
                    alert_emitted=bool(state["alertEmitted"]),
                )
            )
    created = _insert_alerts(session, incoming)
    return {"created": created}


def run_chain2(session: Session, now: datetime) -> dict:
    by_point: dict[int, list[dict]] = {}
    for row in session.scalars(select(WeatherForecast)).all():
        point_id = int(row.point_id or 0)
        by_point.setdefault(point_id, []).append(row.to_camel())
    incoming_events: list[dict] = []
    incoming_alerts: list[dict] = []
    for point_id, days in by_point.items():
        out = evaluate_forecast(point_id, _point_name(session, point_id), days)
        incoming_events.extend(out["events"])
        field_id = _field_id_of_point(session, point_id)
        for alert in out["alertsToCreate"]:
            incoming_alerts.append({**alert, "fieldId": field_id, "time": int(now.timestamp() * 1000)})

    existing_events = [row.to_camel() for row in session.scalars(select(ExtremeEvent)).all()]
    next_id = max([int(row.get("id") or 0) for row in existing_events] + [0]) + 1
    for item in incoming_events:
        dup = next(
            (
                row
                for row in existing_events
                if row.get("pointId") == item.get("pointId")
                and row.get("type") == item.get("type")
                and row.get("startAt") == item.get("startAt")
            ),
            None,
        )
        if dup:
            continue
        session.add(
            ExtremeEvent(
                id=next_id,
                point_id=item.get("pointId"),
                rule_id=item.get("ruleId"),
                type=item.get("type"),
                title=item.get("title"),
                description=item.get("description"),
                level=item.get("level"),
                start_at=item.get("startAt"),
            )
        )
        existing_events.append({**item, "id": next_id})
        next_id += 1
    created = _insert_alerts(session, incoming_alerts)
    return {"created": created}


def _ndvi_mid(layer: dict | None) -> float:
    if not layer:
        return 0.5
    return (float(layer.get("ndviMin") or 0.5) + float(layer.get("ndviMax") or 0.5)) / 2


def run_chain3(session: Session, now: datetime) -> dict:
    layers = [row.to_camel() for row in session.scalars(select(NdviLayer)).all()]
    latest: dict[str, dict] = {}
    for layer in layers:
        field_id = str(layer.get("fieldId") or "")
        prev = latest.get(field_id)
        if not prev or str(layer.get("date") or "") >= str(prev.get("date") or ""):
            latest[field_id] = layer
    mids = [_ndvi_mid(item) for item in latest.values()]
    ndvi_avg = sum(mids) / len(mids) if mids else 0.5
    cutoff = now.timestamp() * 1000 - 7 * 24 * 60 * 60 * 1000
    fields = list(session.scalars(select(Field)).all())
    session.execute(PestRiskPrediction.__table__.delete())
    incoming: list[dict] = []
    pred_id = 1
    for field in fields:
        field_id = str(field.id)
        point_id = int(field.monitor_point_id or 0)
        forecast = [
            row.to_camel()
            for row in session.scalars(select(WeatherForecast).where(WeatherForecast.point_id == point_id)).all()
        ]
        profile = profile_for_point(session, point_id)
        recent_ai = len(
            [
                row
                for row in session.scalars(select(Alert)).all()
                if int(row.point_id or 0) == point_id
                and int(row.time or 0) >= cutoff
                and "[AI识别]" in str(row.message or "")
            ]
        )
        out = evaluate_pest_risk(
            {
                "fieldId": field_id,
                "fieldName": field.name or field_id,
                "pointId": point_id,
                "forecast": forecast,
                "ndvi": _ndvi_mid(latest.get(field_id)),
                "ndviFieldAvg": ndvi_avg,
                "crop": profile.get("crop") or "小麦",
                "growthStage": profile.get("growthStage") or "拔节",
                "recentAiAlertCount": recent_ai,
            }
        )
        session.add(
            PestRiskPrediction(
                id=pred_id,
                field_id=field_id,
                risk_level=out["riskLevel"],
                factors=out["factors"],
                window=out["window"],
            )
        )
        pred_id += 1
        if out.get("draftAlert"):
            incoming.append({**out["draftAlert"], "time": int(now.timestamp() * 1000)})
    created = _insert_alerts(session, incoming)
    return {"created": created}


def append_notifications(session: Session, created_alerts: list[dict], now: datetime) -> None:
    max_id = session.scalar(select(func.max(Notification.id))) or 0
    next_id = int(max_id) + 1
    for alert in created_alerts:
        title = str(alert.get("message") or "")[:40]
        if alert.get("draft"):
            title = f"草稿 {title}"
        session.add(
            Notification(
                id=next_id,
                title=title,
                read=False,
                alert_id=alert.get("id"),
                created_at=now.isoformat(),
            )
        )
        next_id += 1


def run_all_chains(session: Session, now: datetime) -> dict:
    created: list[dict] = []
    created.extend(run_chain1(session, now)["created"])
    session.flush()
    created.extend(run_chain2(session, now)["created"])
    session.flush()
    created.extend(run_chain3(session, now)["created"])
    session.flush()
    append_notifications(session, created, now)
    return {"created": created}


def publish_alert(session: Session, alert_id: int) -> dict | None:
    row = session.get(Alert, alert_id)
    if not row:
        return None
    row.draft = False
    return row.to_camel()


def tick_sensor_simulation(session: Session, now: datetime) -> None:
    latest = None
    for row in session.scalars(select(WeatherReading).where(WeatherReading.point_id == 2)).all():
        if latest is None or int(row.id) >= int(latest.id):
            latest = row
    if latest is None:
        return
    latest.soil_vwc = tick_soil_vwc(float(latest.soil_vwc or 0))
    point = session.get(MonitorPoint, 2)
    if point:
        point.online = True
        point.last_seen_at = now.isoformat()
    today = f"{now.year:04d}-{now.month:02d}-{now.day:02d}"
    existing = next(
        (
            row
            for row in session.scalars(select(SensorReading).where(SensorReading.point_id == 2)).all()
            if str(row.recorded_at or "")[:10] == today
        ),
        None,
    )
    if existing:
        existing.soil_vwc = latest.soil_vwc
        return
    max_id = session.scalar(select(func.max(SensorReading.id))) or 0
    session.add(
        SensorReading(
            id=int(max_id) + 1,
            point_id=2,
            recorded_at=f"{today}T08:00:00+08:00",
            air_temp=latest.air_temp,
            air_rh=latest.air_rh,
            soil_vwc=latest.soil_vwc,
            soil_temp10cm=latest.soil_temp10cm,
        )
    )


def upsert_threshold_profile(session: Session, point_id: int, body: dict) -> dict:
    merged = {**DEFAULT_THRESHOLD_PROFILE, **(body or {}), "pointId": point_id}
    row = session.scalar(select(ThresholdProfile).where(ThresholdProfile.point_id == point_id))
    if row is None:
        row = ThresholdProfile(point_id=point_id)
        session.add(row)
    row.crop = merged.get("crop")
    row.growth_stage = merged.get("growthStage")
    row.water_stress_hint = merged.get("waterStressHint")
    row.water_stress_alert = merged.get("waterStressAlert")
    row.water_stress_hint_minutes = merged.get("waterStressHintMinutes")
    row.water_stress_alert_minutes = merged.get("waterStressAlertMinutes")
    row.heat_hint = merged.get("heatHint")
    row.heat_alert = merged.get("heatAlert")
    row.heat_hint_minutes = merged.get("heatHintMinutes")
    row.heat_alert_minutes = merged.get("heatAlertMinutes")
    row.waterlogging_alert = merged.get("waterloggingAlert")
    row.waterlogging_minutes = merged.get("waterloggingMinutes")
    session.flush()
    return {**row.to_camel(), "pointId": point_id}
