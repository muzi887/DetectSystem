from __future__ import annotations

from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from sqlalchemy import select

from db import DatabaseNotConfigured, session_scope
from models import JSON_COLLECTIONS, camel_to_snake
from rules.agri_derived import (
    build_ndvi_summary,
    build_soil_moisture_trend,
    evaluate_disaster_rules,
    handle_farm_login,
    query_moisture_by_nearest_point,
)
from rules.alert_rules import DEFAULT_THRESHOLD_PROFILE
from rules.daily_report import build_daily_report
from rules.persist import (
    profile_for_point,
    publish_alert,
    run_chain1,
    run_chain2,
    run_chain3,
    upsert_threshold_profile,
)
from rules.sensor_readings import filter_readings

biz = Blueprint("biz", __name__)

REST_PATHS = {
    "monitorPoints": "monitorPoints",
    "weatherReadings": "weatherReadings",
    "alerts": "alerts",
    "weatherForecast": "weatherForecast",
    "extremeEvents": "extremeEvents",
    "pestRiskPredictions": "pestRiskPredictions",
    "notifications": "notifications",
    "droneMissions": "droneMissions",
    "fields": "fields",
    "ndviLayers": "ndviLayers",
    "moistureLayers": "moistureLayers",
}


def _db_error():
    return jsonify({"message": "未配置数据库"}), 503


def _apply_filters(rows: list[dict]) -> list[dict]:
    filtered = rows
    sort_key = request.args.get("_sort")
    order = (request.args.get("_order") or "asc").lower()
    for key, value in request.args.items():
        if key.startswith("_"):
            continue
        filtered = [row for row in filtered if str(row.get(key)) == str(value)]
    if sort_key:
        reverse = order == "desc"
        filtered = sorted(filtered, key=lambda row: (row.get(sort_key) is None, row.get(sort_key)), reverse=reverse)
    return filtered


def _assign(model, payload: dict):
    columns = {column.name for column in model.__table__.columns}
    for key, value in payload.items():
        col = camel_to_snake(key)
        if col in columns:
            setattr(model, col, value)
    return model


@biz.post("/login")
def login():
    try:
        with session_scope() as session:
            from models import User

            users = [row.to_camel() for row in session.scalars(select(User)).all()]
            result = handle_farm_login(users, request.get_json(silent=True) or {})
            return jsonify(result["body"]), result["status"]
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/ndvi/summary")
def ndvi_summary():
    try:
        with session_scope() as session:
            from models import Alert, MonitorPoint

            points = [row.to_camel() for row in session.scalars(select(MonitorPoint)).all()]
            alerts = [row.to_camel() for row in session.scalars(select(Alert)).all()]
            return jsonify(build_ndvi_summary(points, alerts))
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/soilMoisture/trend")
def soil_moisture_trend():
    try:
        with session_scope() as session:
            from models import MonitorPoint

            points = [row.to_camel() for row in session.scalars(select(MonitorPoint)).all()]
            return jsonify(build_soil_moisture_trend(points))
    except DatabaseNotConfigured:
        return _db_error()


@biz.post("/disasterRules/evaluate")
def disaster_rules_evaluate():
    try:
        with session_scope() as session:
            from models import MonitorPoint

            points = [row.to_camel() for row in session.scalars(select(MonitorPoint)).all()]
            return jsonify(evaluate_disaster_rules(points, request.get_json(silent=True) or {}))
    except DatabaseNotConfigured:
        return _db_error()


@biz.post("/alerts/evaluate-all")
def evaluate_all_alerts():
    try:
        with session_scope() as session:
            result = run_chain1(session, datetime.now().astimezone())
            return jsonify({"ok": True, "created": len(result["created"])})
    except DatabaseNotConfigured:
        return _db_error()


@biz.post("/weather/extreme-events/evaluate")
def evaluate_extreme():
    try:
        with session_scope() as session:
            result = run_chain2(session, datetime.now().astimezone())
            return jsonify({"ok": True, "created": len(result["created"])})
    except DatabaseNotConfigured:
        return _db_error()


@biz.post("/pest-risk/evaluate")
def evaluate_pest():
    try:
        with session_scope() as session:
            result = run_chain3(session, datetime.now().astimezone())
            from models import PestRiskPrediction

            predictions = [row.to_camel() for row in session.scalars(select(PestRiskPrediction)).all()]
            return jsonify({"ok": True, "created": len(result["created"]), "predictions": predictions})
    except DatabaseNotConfigured:
        return _db_error()


@biz.post("/alerts/<int:alert_id>/publish")
def publish(alert_id: int):
    try:
        with session_scope() as session:
            row = publish_alert(session, alert_id)
            if not row:
                return jsonify({"message": "预警不存在"}), 404
            return jsonify(row)
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/field-sensors/<int:point_id>/readings")
def sensor_history(point_id: int):
    try:
        with session_scope() as session:
            from models import SensorReading

            rows = [row.to_camel() for row in session.scalars(select(SensorReading)).all()]
            from_day = request.args.get("from")
            to_day = request.args.get("to")
            return jsonify(filter_readings(rows, point_id, from_day, to_day))
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/field-sensors/<int:point_id>/thresholds")
def get_thresholds(point_id: int):
    try:
        with session_scope() as session:
            return jsonify(profile_for_point(session, point_id) or {**DEFAULT_THRESHOLD_PROFILE, "pointId": point_id})
    except DatabaseNotConfigured:
        return _db_error()


@biz.put("/field-sensors/<int:point_id>/thresholds")
def put_thresholds(point_id: int):
    try:
        with session_scope() as session:
            return jsonify(upsert_threshold_profile(session, point_id, request.get_json(silent=True) or {}))
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/reports/daily")
def daily_report():
    try:
        with session_scope() as session:
            from models import Alert, ExtremeEvent, MonitorPoint

            markdown = build_daily_report(
                {
                    "generatedAt": datetime.now(timezone.utc).isoformat(),
                    "points": [row.to_camel() for row in session.scalars(select(MonitorPoint)).all()],
                    "alerts": [
                        row.to_camel()
                        for row in session.scalars(select(Alert)).all()
                        if row.draft is not True
                    ],
                    "extremeEvents": [row.to_camel() for row in session.scalars(select(ExtremeEvent)).all()],
                }
            )
            return jsonify({"markdown": markdown})
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/moisture/value")
def moisture_value():
    try:
        with session_scope() as session:
            from models import MonitorPoint

            points = [row.to_camel() for row in session.scalars(select(MonitorPoint)).all()]
            result = query_moisture_by_nearest_point(points, request.args.get("lat"), request.args.get("lng"))
            return jsonify(result["body"]), result["status"]
    except DatabaseNotConfigured:
        return _db_error()


@biz.get("/<collection>")
def rest_list(collection: str):
    if collection not in REST_PATHS:
        return jsonify({"message": "接口地址不存在"}), 404
    try:
        with session_scope() as session:
            model = JSON_COLLECTIONS[collection]
            rows = _apply_filters([row.to_camel() for row in session.scalars(select(model)).all()])
            return jsonify(rows)
    except DatabaseNotConfigured:
        return _db_error()


@biz.post("/<collection>")
def rest_create(collection: str):
    if collection not in REST_PATHS:
        return jsonify({"message": "接口地址不存在"}), 404
    try:
        with session_scope() as session:
            model = JSON_COLLECTIONS[collection]
            payload = request.get_json(silent=True) or {}
            row = model()
            _assign(row, payload)
            session.add(row)
            session.flush()
            return jsonify(row.to_camel()), 201
    except DatabaseNotConfigured:
        return _db_error()


@biz.patch("/<collection>/<item_id>")
def rest_patch(collection: str, item_id: str):
    if collection not in REST_PATHS:
        return jsonify({"message": "接口地址不存在"}), 404
    try:
        with session_scope() as session:
            model = JSON_COLLECTIONS[collection]
            pk = int(item_id) if str(item_id).isdigit() else item_id
            row = session.get(model, pk)
            if not row:
                return jsonify({"message": "记录不存在"}), 404
            _assign(row, request.get_json(silent=True) or {})
            session.flush()
            return jsonify(row.to_camel())
    except DatabaseNotConfigured:
        return _db_error()


@biz.delete("/<collection>/<item_id>")
def rest_delete(collection: str, item_id: str):
    if collection not in REST_PATHS:
        return jsonify({"message": "接口地址不存在"}), 404
    try:
        with session_scope() as session:
            model = JSON_COLLECTIONS[collection]
            pk = int(item_id) if str(item_id).isdigit() else item_id
            row = session.get(model, pk)
            if not row:
                return jsonify({"message": "记录不存在"}), 404
            session.delete(row)
            return "", 204
    except DatabaseNotConfigured:
        return _db_error()
