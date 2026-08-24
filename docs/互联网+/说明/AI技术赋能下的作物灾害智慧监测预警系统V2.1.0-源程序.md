# AI技术赋能下的作物灾害智慧监测预警系统 V2.1.0 源程序

## 软件基本信息

| 项目   | 内容                       |
| ---- | ------------------------ |
| 软件全称 | AI技术赋能下的作物灾害智慧监测预警系统     |
| 软件简称 | AI作物灾害监测预警系统             |
| 版本   | 2.1.0                    |
| 终端类型 | Web 浏览器访问                |
| 适用方向 | 作物灾害监测、农情数据展示、预警管理、辅助决策  |
| 开发单位 | 河北地质大学 · 坤灵智巡创工队         |
| 线上地址 | http://82.157.234.123:88 |

说明：本文件与《AI技术赋能下的作物灾害智慧监测预警系统》使用说明书（V2.1.0）附录 D 模块表一致，收录自研业务后端与对应业务页面源码。说明书附录 D 为节选对照，本文件为完整源码（Vue 单文件组件去掉样式块）。本文件收录有效代码约 4,722 行。

## 源程序规模

统计口径为下表所列鉴别材料文件，不含第三方依赖包、构建产物、模型权重、演示影像与通用脚手架（登录壳、Vite、Axios 封装、关于页样式等）。Vue 文件去掉 `<style>` 块，以免界面样式冲淡领域逻辑。

| 项目 | 数值 |
|------|------|
| 本文件收录源文件数 | 20 个 |
| 本文件收录有效代码（非空行） | 约 4,722 行 |
| 其中 Python（Flask 业务后端） | 14 个文件，约 1,930 行 |
| 其中 TypeScript | 1 个文件，约 127 行 |
| 其中 Vue（已去样式） | 5 个文件，约 2,665 行 |

按开发语言分布（本文件收录、有效代码行）：

| 语言/类型 | 文件数 | 有效代码行 | 主要用途 |
|-----------|--------|------------|----------|
| Python | 14 | 约 1,930 行 | MySQL 表结构、登录与 REST、三条规则链、调度、23 类识病与作物掩码 |
| TypeScript | 1 | 约 127 行 | 监测点六态状态机与地图配色 |
| Vue 单文件组件（去样式） | 5 | 约 2,665 行 | 相关数据、识病、预警发布、决策、地图监测 |

按功能模块分布（本文件收录、有效代码行）：

| 功能模块 | 有效代码行 | 说明 |
|----------|------------|------|
| 数据模型与连接 | 约 241 行 | `models.py`、`db.py` |
| 业务 HTTP 与登录查墒 | 约 396 行 | `biz.py`、`agri_derived.py` |
| 三条规则链、落库、日报、调度 | 约 715 行 | 墒情气温 / 极端天气 / 虫情草稿 / persist / daily_report / scheduler |
| 23 类识病 | 约 578 行 | 作物掩码、推理、识病 HTTP、环境叠级 |
| 前端业务页面与状态机 | 约 2,792 行 | 状态机与五个业务页（去样式） |

下文收录 20 个源文件，与说明书 1.4、4.1、4.3～4.7 对应。

## 收录范围说明

| 原则 | 说明 |
|------|------|
| 以自研后端为主 | Flask + SQLAlchemy + MySQL `detect_system`；三条规则链与 23 类识病 |
| 不收录通用脚手架 | 不含 Vite 配置、Axios 基础封装、标准路由守卫、登录页、关于页、玻璃拟态 CSS |
| 不收录已下线接口层 | 不含已迁走的 Node 业务规则与旧图像分析入口 |
| 与正文功能对应 | 各文件对应说明书运行环境、登录、相关数据、智能分析、灾害预警、智慧决策 |
| 术语与正文一致 | 规则链、草稿预警、作物掩码、23 类、`[自动预警]` / `[极端天气]` / `[虫情风险]` / `[AI识别]` |

## 模块索引

| 序号 | 源文件 | 对应说明书功能 | 核心职责 |
|------|--------|----------------|----------|
| 1 | ml-bjj/serving/models.py | 1.4 | 业务表结构（监测点、预警、气象读数、阈值、预报等） |
| 2 | ml-bjj/serving/db.py | 1.4 | 数据库连接（DATABASE_URL，无库则明确失败） |
| 3 | ml-bjj/serving/blueprints/biz.py | 1.4、4.1、4.6 | 登录与业务 HTTP（监测点/预警/预报等） |
| 4 | ml-bjj/serving/rules/agri_derived.py | 4.1、4.3.5 | 登录校验、最近站查墒情等 |
| 5 | ml-bjj/serving/rules/alert_rules.py | 4.6 | 链 1：墒情/气温双阈值与耐受 |
| 6 | ml-bjj/serving/rules/extreme_weather_rules.py | 4.3、4.6 | 链 2：7 日预报极端天气 |
| 7 | ml-bjj/serving/rules/pest_risk_rules.py | 4.6、4.7 | 链 3：虫情风险与草稿 |
| 8 | ml-bjj/serving/rules/persist.py | 4.6 | 规则结果落库、去重、发布草稿 |
| 9 | ml-bjj/serving/rules/daily_report.py | 4.3.7 | 按监测点与预警生成监测日报 markdown |
| 10 | ml-bjj/serving/scheduler.py | 1.4 | 定时扫描规则链 |
| 11 | ml-bjj/serving/crop_filter.py | 4.5 | 23 类名单与作物掩码 |
| 12 | ml-bjj/serving/inference.py | 4.5 | 加载权重与分类推理 |
| 13 | ml-bjj/serving/app.py | 4.5 | 识病 HTTP、按监测点补环境后叠级别 |
| 14 | ml-bjj/serving/disease_env_rules.py | 4.5 | 病名乘温湿墒调整风险等级 |
| 15 | src/utils/monitorStatus.ts | 3.1.4、4.4 | 监测点六态（前端展示，与说明书色表一致） |
| 16 | src/views/user/DataAnalysis.vue | 4.5 | 上传、选作物、展示防治 |
| 17 | src/views/user/WarningSystem.vue | 4.6 | 预警列表与发布草稿 |
| 18 | src/views/user/RelatedData.vue | 4.3 | 四 Tab（传感器/气象/遥感/GIS） |
| 19 | src/views/user/DecisionSupport.vue | 4.7 | 按预警类型展示建议 |
| 20 | src/views/user/MapVisualization.vue | 4.4 | 地图监测点与抽屉读数 |

## 模块 1：业务表结构
文件路径：ml-bjj/serving/models.py
对应说明书：1.4
```python
"""detect_system 表。JSON 接口返回驼峰，列名蛇形。"""

from __future__ import annotations

import re
from typing import Any

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Float,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def camel_to_snake(name: str) -> str:
    step = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    return re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", step).lower()


def snake_to_camel(name: str) -> str:
    parts = name.split("_")
    # str.title() 会把 temp10cm 变成 Temp10Cm，前端要的是 soilTemp10cm
    return parts[0] + "".join(p[:1].upper() + p[1:] for p in parts[1:] if p)


class Base(DeclarativeBase):
    def to_camel(self) -> dict[str, Any]:
        payload: dict[str, Any] = {}
        for column in self.__table__.columns:
            payload[snake_to_camel(column.name)] = getattr(self, column.name)
        return payload


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    phone: Mapped[str | None] = mapped_column(String(32))
    name: Mapped[str | None] = mapped_column(String(64))
    password: Mapped[str | None] = mapped_column(String(128))
    role: Mapped[str | None] = mapped_column(String(32))


class MonitorPoint(Base):
    __tablename__ = "monitor_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str | None] = mapped_column(String(128))
    region: Mapped[str | None] = mapped_column(String(32))
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    temp: Mapped[float | None] = mapped_column(Float)
    soil_moisture: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str | None] = mapped_column(String(32))
    online: Mapped[bool | None] = mapped_column(Boolean)
    last_seen_at: Mapped[str | None] = mapped_column(String(64))


class WeatherReading(Base):
    __tablename__ = "weather_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    point_id: Mapped[int | None] = mapped_column(Integer, index=True)
    updated_at: Mapped[str | None] = mapped_column(String(64))
    soil_vwc: Mapped[float | None] = mapped_column(Float)
    soil_temp10cm: Mapped[float | None] = mapped_column(Float)
    soil_ec: Mapped[float | None] = mapped_column(Float)
    air_temp: Mapped[float | None] = mapped_column(Float)
    air_rh: Mapped[float | None] = mapped_column(Float)
    wind_speed: Mapped[float | None] = mapped_column(Float)
    wind_direction: Mapped[float | None] = mapped_column(Float)
    wind_direction_text: Mapped[str | None] = mapped_column(String(32))
    pressure: Mapped[float | None] = mapped_column(Float)
    hourly_rain: Mapped[float | None] = mapped_column(Float)


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alerts_handled_draft_point", "handled", "draft", "point_id"),
        Index("ix_alerts_time", "time"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    point_id: Mapped[int | None] = mapped_column(Integer)
    field_id: Mapped[str | None] = mapped_column(String(64))
    level: Mapped[str | None] = mapped_column(String(32))
    message: Mapped[str | None] = mapped_column(Text)
    time: Mapped[int | None] = mapped_column(BigInteger)
    handled: Mapped[bool] = mapped_column(Boolean, default=False)
    source: Mapped[str | None] = mapped_column(String(32))
    rule_id: Mapped[str | None] = mapped_column(String(64))
    chain: Mapped[str | None] = mapped_column(String(32))
    draft: Mapped[bool] = mapped_column(Boolean, default=False)


class Field(Base):
    __tablename__ = "fields"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str | None] = mapped_column(String(128))
    monitor_point_id: Mapped[int | None] = mapped_column(Integer)
    bounds: Mapped[Any] = mapped_column(JSON, nullable=True)


class NdviLayer(Base):
    __tablename__ = "ndvi_layers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    field_id: Mapped[str | None] = mapped_column(String(64))
    date: Mapped[str | None] = mapped_column(String(32))
    image_asset: Mapped[str | None] = mapped_column(String(128))
    bounds: Mapped[Any] = mapped_column(JSON, nullable=True)
    source: Mapped[str | None] = mapped_column(String(64))
    ndvi_min: Mapped[float | None] = mapped_column(Float)
    ndvi_max: Mapped[float | None] = mapped_column(Float)


class MoistureLayer(Base):
    __tablename__ = "moisture_layers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[str | None] = mapped_column(String(32))
    image_asset: Mapped[str | None] = mapped_column(String(128))
    bounds: Mapped[Any] = mapped_column(JSON, nullable=True)
    source: Mapped[str | None] = mapped_column(String(64))


class ThresholdProfile(Base):
    __tablename__ = "threshold_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    point_id: Mapped[int] = mapped_column(Integer, unique=True)
    crop: Mapped[str | None] = mapped_column(String(32))
    growth_stage: Mapped[str | None] = mapped_column(String(32))
    water_stress_hint: Mapped[float | None] = mapped_column(Float)
    water_stress_alert: Mapped[float | None] = mapped_column(Float)
    water_stress_hint_minutes: Mapped[int | None] = mapped_column(Integer)
    water_stress_alert_minutes: Mapped[int | None] = mapped_column(Integer)
    heat_hint: Mapped[float | None] = mapped_column(Float)
    heat_alert: Mapped[float | None] = mapped_column(Float)
    heat_hint_minutes: Mapped[int | None] = mapped_column(Integer)
    heat_alert_minutes: Mapped[int | None] = mapped_column(Integer)
    waterlogging_alert: Mapped[float | None] = mapped_column(Float)
    waterlogging_minutes: Mapped[int | None] = mapped_column(Integer)


class RuleState(Base):
    __tablename__ = "rule_state"
    __table_args__ = (UniqueConstraint("point_id", "rule_id", name="uq_rule_state_point_rule"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    point_id: Mapped[int] = mapped_column(Integer)
    rule_id: Mapped[str] = mapped_column(String(64))
    level: Mapped[str | None] = mapped_column(String(16))
    started_at: Mapped[str | None] = mapped_column(String(64))
    last_seen_at: Mapped[str | None] = mapped_column(String(64))
    alert_emitted: Mapped[bool] = mapped_column(Boolean, default=False)


class WeatherForecast(Base):
    __tablename__ = "weather_forecast"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    point_id: Mapped[int | None] = mapped_column(Integer, index=True)
    date: Mapped[str | None] = mapped_column(String(32))
    temp_max: Mapped[float | None] = mapped_column(Float)
    temp_min: Mapped[float | None] = mapped_column(Float)
    precip_mm: Mapped[float | None] = mapped_column(Float)
    wind_max: Mapped[float | None] = mapped_column(Float)
    humidity: Mapped[float | None] = mapped_column(Float)


class ExtremeEvent(Base):
    __tablename__ = "extreme_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    point_id: Mapped[int | None] = mapped_column(Integer)
    rule_id: Mapped[str | None] = mapped_column(String(64))
    type: Mapped[str | None] = mapped_column(String(64))
    title: Mapped[str | None] = mapped_column(String(128))
    description: Mapped[str | None] = mapped_column(Text)
    level: Mapped[str | None] = mapped_column(String(32))
    start_at: Mapped[str | None] = mapped_column(String(32))


class PestRiskPrediction(Base):
    __tablename__ = "pest_risk_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    field_id: Mapped[str | None] = mapped_column(String(64))
    risk_level: Mapped[str | None] = mapped_column(String(16))
    factors: Mapped[Any] = mapped_column(JSON, nullable=True)
    window: Mapped[str | None] = mapped_column(String(64))


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str | None] = mapped_column(String(256))
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    alert_id: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[str | None] = mapped_column(String(64))


class DroneMission(Base):
    __tablename__ = "drone_missions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    field_id: Mapped[str | None] = mapped_column(String(64))
    name: Mapped[str | None] = mapped_column(String(128))
    path: Mapped[Any] = mapped_column(JSON, nullable=True)


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    point_id: Mapped[int | None] = mapped_column(Integer, index=True)
    recorded_at: Mapped[str | None] = mapped_column(String(64))
    air_temp: Mapped[float | None] = mapped_column(Float)
    air_rh: Mapped[float | None] = mapped_column(Float)
    soil_vwc: Mapped[float | None] = mapped_column(Float)
    soil_temp10cm: Mapped[float | None] = mapped_column(Float)


JSON_COLLECTIONS: dict[str, type[Base]] = {
    "users": User,
    "monitorPoints": MonitorPoint,
    "weatherReadings": WeatherReading,
    "alerts": Alert,
    "fields": Field,
    "ndviLayers": NdviLayer,
    "moistureLayers": MoistureLayer,
    "thresholdProfiles": ThresholdProfile,
    "ruleState": RuleState,
    "weatherForecast": WeatherForecast,
    "extremeEvents": ExtremeEvent,
    "pestRiskPredictions": PestRiskPrediction,
    "notifications": Notification,
    "droneMissions": DroneMission,
    "sensorReadings": SensorReading,
}
```

## 模块 2：数据库连接
文件路径：ml-bjj/serving/db.py
对应说明书：1.4
```python
"""SQLAlchemy engine / session. DATABASE_URL 未配置时明确失败，不回退 db.json。"""

from __future__ import annotations

import os
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

_engine: Engine | None = None
_engine_url: str | None = None


class DatabaseNotConfigured(RuntimeError):
    pass


def database_url() -> str:
    url = (os.environ.get("DATABASE_URL") or "").strip()
    if not url:
        raise DatabaseNotConfigured("未配置数据库：请设置环境变量 DATABASE_URL")
    return url


def get_engine() -> Engine:
    global _engine, _engine_url
    url = database_url()
    if _engine is None or _engine_url != url:
        connect_args = {}
        if url.startswith("sqlite"):
            connect_args["check_same_thread"] = False
        _engine = create_engine(url, pool_pre_ping=True, connect_args=connect_args)
        _engine_url = url
    return _engine


def reset_engine_cache() -> None:
    global _engine, _engine_url
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _engine_url = None


def session_factory() -> sessionmaker[Session]:
    return sessionmaker(bind=get_engine(), expire_on_commit=False, autoflush=False)


@contextmanager
def session_scope():
    factory = session_factory()
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
```

## 模块 3：登录与业务 HTTP
文件路径：ml-bjj/serving/blueprints/biz.py
对应说明书：1.4、4.1、4.6
```python
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
```

## 模块 4：登录校验与查墒情
文件路径：ml-bjj/serving/rules/agri_derived.py
对应说明书：4.1、4.3.5
```python
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
```

## 模块 5：墒情气温规则链
文件路径：ml-bjj/serving/rules/alert_rules.py
对应说明书：4.6
```python
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
```

## 模块 6：极端天气预报规则
文件路径：ml-bjj/serving/rules/extreme_weather_rules.py
对应说明书：4.3、4.6
```python
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
```

## 模块 7：虫情风险规则
文件路径：ml-bjj/serving/rules/pest_risk_rules.py
对应说明书：4.6、4.7
```python
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
```

## 模块 8：规则落库与发布草稿
文件路径：ml-bjj/serving/rules/persist.py
对应说明书：4.6
```python
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
```

## 模块 9：监测日报
文件路径：ml-bjj/serving/rules/daily_report.py
对应说明书：4.3.7
```python
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
```

## 模块 10：定时扫描规则链
文件路径：ml-bjj/serving/scheduler.py
对应说明书：1.4
```python
from __future__ import annotations

import os
import threading
from datetime import datetime

from db import session_scope
from rules.persist import append_notifications, run_chain1, run_chain2, run_chain3, tick_sensor_simulation

_timer: threading.Timer | None = None
_started = False


def _tick() -> None:
    global _timer
    now = datetime.now().astimezone()
    try:
        with session_scope() as session:
            tick_sensor_simulation(session, now)
    except Exception as exc:
        print(f"[ml-bjj] scheduler tick sensor failed: {exc}")
    created: list[dict] = []
    try:
        with session_scope() as session:
            created.extend(run_chain1(session, now)["created"])
    except Exception as exc:
        print(f"[ml-bjj] scheduler chain1 failed: {exc}")
    try:
        with session_scope() as session:
            created.extend(run_chain2(session, now)["created"])
    except Exception as exc:
        print(f"[ml-bjj] scheduler chain2 failed: {exc}")
    try:
        with session_scope() as session:
            pest = run_chain3(session, now)["created"]
            created.extend(pest)
            append_notifications(session, created, now)
    except Exception as exc:
        print(f"[ml-bjj] scheduler chain3 failed: {exc}")
    _timer = threading.Timer(60.0, _tick)
    _timer.daemon = True
    _timer.start()


def start_scheduler() -> None:
    global _started
    if _started:
        return
    if os.environ.get("ML_BJJ_DISABLE_SCHEDULER", "0") == "1":
        print("[ml-bjj] scheduler disabled")
        return
    _started = True
    _timer = threading.Timer(60.0, _tick)
    _timer.daemon = True
    _timer.start()
```

## 模块 11：23 类与作物掩码
文件路径：ml-bjj/serving/crop_filter.py
对应说明书：4.5
```python
from __future__ import annotations

CANONICAL_CLASSES = [
    "健康",
    "小麦锈病", "小麦赤霉病", "小麦白粉病", "小麦蚜虫为害",
    "玉米大斑病", "玉米锈病", "玉米南方锈病", "玉米小斑病",
    "玉米弯孢叶斑病", "玉米褐斑病", "玉米瘤黑粉病", "玉米茎腐病", "玉米穗腐病",
    "番茄早疫病",
    "水稻白叶枯病", "水稻褐斑病", "水稻负泥虫为害", "稻瘟病",
    "水稻叶鞘腐败病", "水稻叶黑粉病", "水稻窄条斑病", "稻颈瘟",
]

CROP_CLASS_GROUPS = {
    "wheat": {"健康", "小麦锈病", "小麦赤霉病", "小麦白粉病", "小麦蚜虫为害"},
    "corn": {
        "健康", "玉米大斑病", "玉米锈病", "玉米南方锈病", "玉米小斑病",
        "玉米弯孢叶斑病", "玉米褐斑病", "玉米瘤黑粉病", "玉米茎腐病", "玉米穗腐病",
    },
    "tomato": {"健康", "番茄早疫病"},
    "rice": {
        "健康", "水稻白叶枯病", "水稻褐斑病", "水稻负泥虫为害", "稻瘟病",
        "水稻叶鞘腐败病", "水稻叶黑粉病", "水稻窄条斑病", "稻颈瘟",
    },
}

SUPPORTED_CROP_TYPES = frozenset(CROP_CLASS_GROUPS)
HIDDEN_CROP_TYPES = frozenset({"peach", "apple"})
HIDDEN_CROP_LABELS = frozenset({"桃", "苹果"})
CROP_LABELS = {
    "wheat": "小麦",
    "corn": "玉米",
    "tomato": "番茄",
    "rice": "水稻",
}


HIDDEN_DISEASE_LABELS = frozenset({
    "桃缩叶病",
    "桃疮痂病",
    "桃褐腐病",
    "桃细菌性穿孔病",
    "苹果轮纹病",
    "苹果腐烂病",
    "苹果疮痂病",
})
LABEL_ALIASES = {
    "小麦条锈病": "小麦锈病",
    "小麦叶锈病": "小麦锈病",
    "小麦秆锈病": "小麦锈病",
    "条锈病": "小麦锈病",
    "叶锈病": "小麦锈病",
    "秆锈病": "小麦锈病",
}


def is_hidden_crop(crop_type: str) -> bool:
    raw = (crop_type or "").strip()
    if raw in HIDDEN_CROP_LABELS:
        return True
    return raw.lower() in HIDDEN_CROP_TYPES


def assert_bjj_crop_type(crop_type: str) -> None:
    if is_hidden_crop(crop_type):
        raise ValueError("京津冀版不支持桃/苹果识别，请选择小麦、玉米、番茄或水稻")


def is_hidden_disease(label: str) -> bool:
    return (label or "").strip() in HIDDEN_DISEASE_LABELS


def canonicalize_label(label: str) -> str | None:
    raw = (label or "").strip()
    if not raw or is_hidden_disease(raw):
        return None
    if raw in CANONICAL_CLASSES:
        return raw
    mapped = LABEL_ALIASES.get(raw)
    if mapped:
        return mapped
    return raw


def classes_for_crop(crop_type: str) -> set[str] | None:
    return CROP_CLASS_GROUPS.get(crop_type)


def mask_and_renorm(probs: list[float], classes: list[str], crop_type: str) -> list[float]:
    allowed = classes_for_crop(crop_type)
    if allowed is None or len(probs) != len(classes):
        return list(probs)
    masked = [p if label in allowed else 0.0 for p, label in zip(probs, classes)]
    total = sum(masked)
    if total <= 0:
        return list(probs)
    return [p / total for p in masked]
```

## 模块 12：分类推理
文件路径：ml-bjj/serving/inference.py
对应说明书：4.5
```python
"""v3 病虫害分类推理（与 scripts/predict.py 共用逻辑）。"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

import timm
import torch
from PIL import Image
from torchvision import transforms

from crop_filter import canonicalize_label, mask_and_renorm
from predict_utils import needs_review, rank_topk

ML_BJJ_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WEIGHTS = ML_BJJ_ROOT / "models" / "pest-cls-best.pt"
DEFAULT_ONNX = ML_BJJ_ROOT / "models" / "pest-cls-best.onnx"

@dataclass
class PredictResult:
    label: str
    confidence: float
    topk: list[dict[str, str | float]]
    needs_review: bool


_classifier: PestClassifier | None = None


def resolve_weights_path() -> Path:
    env = os.environ.get("ML_BJJ_WEIGHTS")
    if env:
        path = Path(env)
        return path if path.is_absolute() else ML_BJJ_ROOT / path
    return DEFAULT_WEIGHTS


def use_onnx() -> bool:
    return os.environ.get("ML_BJJ_ONNX") == "1"


def resolve_onnx_path() -> Path:
    env = os.environ.get("ML_BJJ_ONNX_PATH")
    if env:
        path = Path(env)
        return path if path.is_absolute() else ML_BJJ_ROOT / path
    return DEFAULT_ONNX


class PestClassifier:
    def __init__(self, weights_path: Path) -> None:
        weights_path = weights_path.resolve()
        if not weights_path.is_file():
            raise FileNotFoundError(f"找不到模型权重: {weights_path}")

        ckpt = torch.load(weights_path, map_location="cpu")
        classes: list[str] = ckpt["classes"]
        img_size: int = ckpt.get("img_size", 224)
        model_name: str = ckpt.get("model_name", "efficientnet_b0")

        self.classes = classes
        self.weights_path = weights_path
        self.onnx_session = None
        if use_onnx():
            onnx_path = resolve_onnx_path()
            if onnx_path.is_file():
                import onnxruntime as ort

                self.onnx_session = ort.InferenceSession(
                    str(onnx_path),
                    providers=["CPUExecutionProvider"],
                )

        if self.onnx_session is None:
            self.model = timm.create_model(model_name, pretrained=False, num_classes=len(classes))
            self.model.load_state_dict(ckpt["state_dict"])
            self.model.eval()
        else:
            self.model = None

        self.transform = transforms.Compose(
            [
                transforms.Resize((img_size, img_size)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ]
        )

    def predict_detailed(self, image: Image.Image, crop_type: str = "unknown") -> PredictResult:
        img = image.convert("RGB")
        tensor = self.transform(img).unsqueeze(0)
        if getattr(self, "onnx_session", None) is not None:
            logits_np = self.onnx_session.run(None, {"input": tensor.numpy()})[0]
            logits = torch.from_numpy(logits_np)
        else:
            with torch.no_grad():
                logits = self.model(tensor)
        with torch.no_grad():
            probs = torch.softmax(logits, dim=1)[0].tolist()
        filtered = mask_and_renorm(probs, self.classes, crop_type)
        topk = rank_topk(filtered, self.classes, k=3)
        mapped = []
        for item in topk:
            canon = canonicalize_label(str(item["label"]))
            if canon is None:
                continue
            mapped.append({**item, "label": canon})
        if not mapped:
            mapped = topk
        label = str(mapped[0]["label"])
        confidence = float(mapped[0]["confidence"])
        return PredictResult(
            label=label,
            confidence=confidence,
            topk=mapped,
            needs_review=needs_review(mapped, confidence),
        )

    def predict(self, image: Image.Image, crop_type: str = "unknown") -> tuple[str, float]:
        result = self.predict_detailed(image, crop_type)
        return result.label, result.confidence


def get_classifier(weights_path: Path | None = None) -> PestClassifier:
    global _classifier
    if _classifier is None:
        path = weights_path or resolve_weights_path()
        _classifier = PestClassifier(path)
    return _classifier
```

## 模块 13：识病 HTTP
文件路径：ml-bjj/serving/app.py
对应说明书：4.5
```python
"""
23 类推理 HTTP 服务（Flask · 端口 5000）。

启动（项目根 DetectSystem）：
  ml-bjj\\.venv\\Scripts\\Activate.ps1
  python ml-bjj\\serving\\app.py
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path

import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

SERVE_DIR = Path(__file__).resolve().parent
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))

from analysis_store import append_record, list_records, recent_records, stats_by_label, update_record  # noqa: E402
from blueprints.biz import biz  # noqa: E402
from crop_filter import (  # noqa: E402
    CANONICAL_CLASSES,
    CROP_LABELS,
    assert_bjj_crop_type,
    canonicalize_label,
    classes_for_crop,
)
from disease_env_rules import apply_disease_env_rules  # noqa: E402
from inference import PredictResult, get_classifier, resolve_weights_path  # noqa: E402
from knowledge import get_treatment_item, load_catalog  # noqa: E402
from predict_utils import needs_review, rank_topk  # noqa: E402

app = Flask(__name__)
CORS(app)
app.register_blueprint(biz)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
META_PATH = Path(__file__).resolve().parents[1] / "models" / "pest-cls-meta.json"
RECORDS_DEFAULT = Path(__file__).resolve().parent / "data" / "analysis_records.json"


def records_path() -> Path:
    env = os.environ.get("ML_BJJ_RECORDS")
    return Path(env) if env else RECORDS_DEFAULT


HARD_CASES_PENDING = Path(__file__).resolve().parents[1] / "data" / "hard_cases" / "pending"


def hard_cases_pending_root() -> Path:
    env = os.environ.get("ML_BJJ_HARD_CASES")
    return Path(env) if env else HARD_CASES_PENDING


def use_mock() -> bool:
    return os.environ.get("ML_BJJ_USE_MOCK", "0") == "1"


def load_model_meta() -> dict:
    if META_PATH.is_file():
        return json.loads(META_PATH.read_text(encoding="utf-8"))
    return {"trained_at": None, "best_val_acc": None, "classes": []}


def model_version_payload(meta: dict | None = None) -> dict:
    meta = meta if meta is not None else load_model_meta()
    classes = meta.get("classes") or []
    return {
        "trained_at": meta.get("trained_at"),
        "best_val_acc": meta.get("best_val_acc"),
        "classes_count": len(classes),
    }


def engine_name() -> str:
    return "mock" if use_mock() else "bjj-23"


def validate_upload(file) -> None:
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("仅支持 JPG、PNG、WEBP 格式图片")
    raw = file.read()
    file.stream.seek(0)
    if not raw:
        raise ValueError("图片内容为空")


def mock_predict(file, crop_type: str) -> PredictResult:
    raw = file.read()
    file.stream.seek(0)
    digest = sha256(raw).hexdigest()
    allowed = classes_for_crop(crop_type)
    labels = [c for c in CANONICAL_CLASSES if allowed is None or c in allowed]
    idx = int(digest[-4:], 16) % len(labels)
    conf = round(0.78 + (int(digest[:4], 16) % 100) / 500, 4)
    conf = min(conf, 0.98)
    probs = [0.0] * len(labels)
    probs[idx] = conf
    remain = max(0.0, 1.0 - conf)
    if len(labels) > 1:
        other = remain / (len(labels) - 1)
        for i in range(len(labels)):
            if i != idx:
                probs[i] = other
    topk = rank_topk(probs, labels, k=3)
    return PredictResult(
        label=labels[idx],
        confidence=float(conf),
        topk=topk,
        needs_review=needs_review(topk, float(conf)),
    )


def classify_level(result: str, confidence: float) -> str:
    if result == "健康":
        return "low"
    if confidence >= 0.9:
        return "high"
    return "medium"


def parse_env_from_request() -> dict | None:
    keys = ("airTemp", "airRh", "soilVwc")
    env: dict = {}
    for key in keys:
        raw = request.form.get(key)
        if raw not in (None, ""):
            env[key] = float(raw)
    return env or None


def fetch_point_weather(point_id: int) -> dict | None:
    try:
        from db import DatabaseNotConfigured, session_scope
        from models import WeatherReading
        from sqlalchemy import select
    except Exception:
        return None
    try:
        with session_scope() as session:
            latest = None
            for row in session.scalars(select(WeatherReading).where(WeatherReading.point_id == point_id)).all():
                if latest is None or int(row.id) >= int(latest.id):
                    latest = row
            if latest is None:
                return None
            return {
                "airTemp": latest.air_temp,
                "airRh": latest.air_rh,
                "soilVwc": latest.soil_vwc,
            }
    except DatabaseNotConfigured:
        return None
    except Exception:
        return None


def parse_point_id() -> int | None:
    point_raw = request.form.get("pointId") or ""
    try:
        return int(point_raw) if point_raw.strip() else None
    except ValueError:
        return None


def _analyze_one(
    file,
    crop_type: str,
    category: str,
    additional_info: str,
    point_id: int | None,
    env: dict | None,
) -> dict:
    validate_upload(file)
    assert_bjj_crop_type(crop_type)
    if use_mock():
        pred = mock_predict(file, crop_type)
    else:
        img = Image.open(file.stream)
        pred = get_classifier().predict_detailed(img, crop_type)
    canon = canonicalize_label(pred.label)
    if canon:
        pred.label = canon

    level = classify_level(pred.label, pred.confidence)
    treatment, _found = get_treatment_item(pred.label)
    meta = load_model_meta()
    if env is None and point_id is not None:
        env = fetch_point_weather(point_id)
    env_out = apply_disease_env_rules(pred.label, level, env, treatment.get("timing"))
    level = env_out["level"]
    saved = append_record(
        records_path(),
        {
            "pointId": point_id,
            "label": pred.label,
            "confidence": pred.confidence,
            "cropType": crop_type,
            "level": level,
            "needs_review": pred.needs_review,
            "imagePath": None,
        },
    )
    return {
        "code": 200,
        "message": "success",
        "result": pred.label,
        "confidence": pred.confidence,
        "level": level,
        "topk": pred.topk,
        "needs_review": pred.needs_review,
        "model_version": model_version_payload(meta),
        "treatment": treatment,
        "recordId": saved["id"],
        "env_context": {**(env or {}), **env_out},
        "details": {
            "received_crop": crop_type,
            "crop_label": CROP_LABELS.get(crop_type, "未知作物"),
            "category": category,
            "additionalInfo": additional_info,
            "isReliable": not pred.needs_review,
            "engine": engine_name(),
            "weights": str(resolve_weights_path()) if not use_mock() else None,
        },
    }


@app.route("/api/analysis/image", methods=["POST"])
def analyze_image():
    if not use_mock() and app.config.get("MODEL_READY") is False:
        return jsonify({"error": "模型未就绪，无法识图", "message": "模型未就绪"}), 503
    if "file" not in request.files:
        return jsonify({"error": "未找到文件"}), 400

    file = request.files["file"]
    crop_type = request.form.get("cropType", "unknown")
    category = request.form.get("category", "")
    additional_info = request.form.get("additionalInfo", "")

    if file.filename == "":
        return jsonify({"error": "文件名为空"}), 400

    try:
        body = _analyze_one(
            file,
            crop_type,
            category,
            additional_info,
            parse_point_id(),
            parse_env_from_request(),
        )
        return jsonify(body), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "服务器内部错误", "details": str(e)}), 500


@app.route("/api/analysis/batch", methods=["POST"])
def analysis_batch():
    if not use_mock() and app.config.get("MODEL_READY") is False:
        return jsonify({"error": "模型未就绪，无法识图", "message": "模型未就绪"}), 503
    files = [item for item in request.files.getlist("files") if item and item.filename]
    if not files:
        return jsonify({"error": "未找到文件"}), 400
    crop_type = request.form.get("cropType", "unknown")
    category = request.form.get("category", "")
    additional_info = request.form.get("additionalInfo", "")
    point_id = parse_point_id()
    env = parse_env_from_request()
    results: list[dict] = []
    for file in files:
        try:
            results.append(
                _analyze_one(file, crop_type, category, additional_info, point_id, env)
            )
        except ValueError as e:
            results.append({"error": str(e), "filename": file.filename or ""})
        except Exception as e:
            print(f"Error: {e}")
            results.append({"error": "服务器内部错误", "filename": file.filename or ""})
    return jsonify({"code": 200, "results": results}), 200


@app.route("/health", methods=["GET"])
def health():
    meta = load_model_meta()
    classes = meta.get("classes") or []
    weights = resolve_weights_path()
    mtime = (
        datetime.fromtimestamp(weights.stat().st_mtime).isoformat()
        if weights.is_file()
        else None
    )
    return jsonify(
        {
            "status": "ok",
            "mock": use_mock(),
            "classes_count": len(classes),
            "classes": classes,
            "model_version": model_version_payload(meta),
            "weights_mtime": mtime,
            "cuda": bool(torch.cuda.is_available()),
            "engine": engine_name(),
        }
    ), 200


@app.route("/api/analysis/history", methods=["GET"])
def analysis_history():
    return jsonify({"records": list_records(records_path())}), 200


@app.route("/api/analysis/recent", methods=["GET"])
def analysis_recent():
    limit = int(request.args.get("limit") or 20)
    return jsonify({"records": recent_records(records_path(), limit=limit)}), 200


@app.route("/api/analysis/stats", methods=["GET"])
def analysis_stats():
    return jsonify(stats_by_label(records_path())), 200


@app.route("/api/analysis/model-info", methods=["GET"])
def model_info():
    meta = load_model_meta()
    payload = model_version_payload(meta)
    payload["engine"] = engine_name()
    payload["classes"] = meta.get("classes") or []
    return jsonify(payload), 200


@app.route("/api/analysis/feedback", methods=["POST"])
def analysis_feedback():
    label = (request.form.get("correctedLabel") or "").strip()
    if label not in CANONICAL_CLASSES:
        return jsonify({"error": "correctedLabel 不在 23 类中"}), 400
    if "file" not in request.files:
        return jsonify({"error": "未找到文件"}), 400
    file = request.files["file"]
    try:
        validate_upload(file)
        dest_dir = hard_cases_pending_root() / label
        dest_dir.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        suffix = Path(file.filename or "img.jpg").suffix.lower() or ".jpg"
        dest = dest_dir / f"{stamp}_{Path(file.filename or 'img').stem}{suffix}"
        file.save(dest)
        record_id = request.form.get("recordId")
        parsed_id = int(record_id) if record_id and str(record_id).isdigit() else None
        if parsed_id is not None:
            update_record(records_path(), parsed_id, correctedLabel=label)
        return jsonify({"ok": True, "savedPath": str(dest), "recordId": parsed_id}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/treatments", methods=["GET"])
def treatments_all():
    return jsonify(load_catalog()), 200


@app.route("/api/treatments/<label>", methods=["GET"])
def treatments_one(label: str):
    item, found = get_treatment_item(label)
    canon = canonicalize_label(label)
    return jsonify({"label": canon if canon is not None else label, "found": found, "item": item}), 200


def prepare_runtime() -> int:
    port = int(os.environ.get("ML_BJJ_PORT", "5000"))
    app.config["MODEL_READY"] = False
    weights = resolve_weights_path()

    if use_mock():
        print("[ml-bjj] ML_BJJ_USE_MOCK=1，使用 Mock 推理")
        app.config["MODEL_READY"] = True
        return port

    if not weights.is_file():
        print(f"[ml-bjj] 找不到模型权重: {weights}，业务接口仍可启动")
        return port
    try:
        print(f"[ml-bjj] 加载模型: {weights}")
        clf = get_classifier()
        print(f"[ml-bjj] 模型就绪，{len(clf.classes)} 类: {', '.join(clf.classes)}")
        meta_classes = load_model_meta().get("classes") or []
        if meta_classes and list(clf.classes) != list(meta_classes):
            print(
                f"[ml-bjj] 权重 classes 与 pest-cls-meta.json 不一致: {len(clf.classes)} vs {len(meta_classes)}"
            )
            return port
        if len(clf.classes) != 23:
            print(f"[ml-bjj] 期望 23 类，实际 {len(clf.classes)}: {clf.classes}")
            return port
        app.config["MODEL_READY"] = True
    except Exception as exc:
        print(f"[ml-bjj] 模型加载失败，业务接口仍可启动: {exc}")
    return port


def main() -> None:
    port = prepare_runtime()
    from scheduler import start_scheduler

    start_scheduler()
    print(f"[ml-bjj] 服务: http://127.0.0.1:{port}/  识病 /api/analysis/image")
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    main()
```

## 模块 14：病名环境规则
文件路径：ml-bjj/serving/disease_env_rules.py
对应说明书：4.5
```python
from __future__ import annotations

HUMID_DISEASES = {"稻瘟病", "稻颈瘟", "小麦赤霉病"}
LEVEL_RANK = {"low": 0, "medium": 1, "high": 2}


def _bump(current: str, target: str) -> str:
    if LEVEL_RANK.get(target, 0) > LEVEL_RANK.get(current, 0):
        return target
    return current


def apply_disease_env_rules(
    label: str,
    base_level: str,
    env: dict | None,
    timing: str | None,
) -> dict:
    level = base_level if base_level in LEVEL_RANK else "medium"
    reasons: list[str] = []
    env = env or {}
    rh = env.get("airRh")
    temp = env.get("airTemp")
    vwc = env.get("soilVwc")

    if label != "健康" and rh is not None and float(rh) >= 80 and label in HUMID_DISEASES:
        level = _bump(level, "high")
        reasons.append("高湿利于该病流行")
    if label != "健康" and vwc is not None and float(vwc) <= 15:
        level = _bump(level, "medium")
        reasons.append("墒情偏低，结合旱情复核")
    if label != "健康" and temp is not None and float(temp) >= 38:
        level = _bump(level, "high")
        reasons.append("高温胁迫，建议尽快处置")

    advice = None
    extra = "植株看似健康但墒情偏低" if (label == "健康" and vwc is not None and float(vwc) <= 15) else None
    bits = list(reasons)
    if extra:
        bits.append(extra)
    if bits:
        timing_bit = (timing or "").split("。")[0]
        prefix = "当前环境：" + "；".join(bits) + "。"
        advice = prefix + (timing_bit + "。" if timing_bit else "")
    return {"level": level, "reasons": reasons, "advice": advice}
```

## 模块 15：监测点状态机
文件路径：src/utils/monitorStatus.ts
对应说明书：3.1.4、4.4
```typescript
export type MonitorStatus =
  | 'normal'
  | 'warning'
  | 'critical'
  | 'offline'
  | 'maintenance'
  | 'unknown'

export interface MonitorStatusMeta {
  label: string
  color: string
  priority: number
  description: string
  next: MonitorStatus[]
}

export interface MonitorStatusInput {
  status?: string
  temp?: number | string | null
  soilMoisture?: number | string | null
  online?: boolean
  maintenance?: boolean
}

export const MONITOR_STATUS_META: Record<MonitorStatus, MonitorStatusMeta> = {
  normal: {
    label: '正常',
    color: '#52c41a',
    priority: 1,
    description: '监测值处于演示阈值范围内，可按常规频率巡检。',
    next: ['warning', 'offline', 'maintenance']
  },
  warning: {
    label: '预警',
    color: '#fa8c16',
    priority: 2,
    description: '监测值接近或越过警戒线，需要持续关注。',
    next: ['normal', 'critical', 'offline', 'maintenance']
  },
  critical: {
    label: '严重',
    color: '#cf1322',
    priority: 3,
    description: '监测值达到危险区间，应优先处置并复核现场情况。',
    next: ['warning', 'normal', 'offline', 'maintenance']
  },
  offline: {
    label: '离线',
    color: '#8c8c8c',
    priority: 4,
    description: '监测点无有效数据或设备连接异常，需先恢复数据链路。',
    next: ['normal', 'warning', 'maintenance']
  },
  maintenance: {
    label: '维护中',
    color: '#722ed1',
    priority: 0,
    description: '设备处于人工维护或演示调试状态，不参与风险排序。',
    next: ['normal', 'offline']
  },
  unknown: {
    label: '未知',
    color: '#1890ff',
    priority: -1,
    description: '状态字段缺失或未识别，按未知状态展示。',
    next: ['normal', 'warning', 'offline']
  }
}

export const MONITOR_STATUS_ORDER: MonitorStatus[] = [
  'unknown',
  'maintenance',
  'normal',
  'warning',
  'critical',
  'offline'
]

function toNumber(value: number | string | null | undefined) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function normalizeMonitorStatus(status?: string): MonitorStatus {
  if (status && status in MONITOR_STATUS_META) {
    return status as MonitorStatus
  }
  return 'unknown'
}

export function getMonitorStatusMeta(status?: string) {
  return MONITOR_STATUS_META[normalizeMonitorStatus(status)]
}

export function getMonitorStatusLabel(status?: string): string {
  return getMonitorStatusMeta(status).label
}

export function getMonitorStatusColor(status?: string): string {
  return getMonitorStatusMeta(status).color
}

export function getMonitorStatusDescription(status?: string): string {
  return getMonitorStatusMeta(status).description
}

export function getNextMonitorStatuses(status?: string): MonitorStatus[] {
  return getMonitorStatusMeta(status).next
}

export function canTransitionMonitorStatus(from?: string, to?: string) {
  const nextStatus = normalizeMonitorStatus(to)
  return getNextMonitorStatuses(from).includes(nextStatus)
}

export function compareMonitorStatus(a?: string, b?: string) {
  return getMonitorStatusMeta(a).priority - getMonitorStatusMeta(b).priority
}

export function getWorstMonitorStatus(statuses: Array<string | undefined>) {
  return statuses
    .map(normalizeMonitorStatus)
    .sort((a, b) => compareMonitorStatus(b, a))[0] || 'unknown'
}

export function deriveMonitorStatus(input: MonitorStatusInput): MonitorStatus {
  if (input.maintenance) return 'maintenance'
  if (input.online === false) return 'offline'

  const current = normalizeMonitorStatus(input.status)
  const temp = toNumber(input.temp)
  const soilMoisture = toNumber(input.soilMoisture)

  if (temp === null || soilMoisture === null || temp < -50 || temp > 100) {
    return 'offline'
  }

  if (temp >= 38 || soilMoisture <= 10) {
    return 'critical'
  }

  if (temp >= 32 || soilMoisture <= 20 || soilMoisture >= 80) {
    return 'warning'
  }

  return current === 'unknown' || current === 'offline' ? 'normal' : current
}
```

## 模块 16：智能分析页面
文件路径：src/views/user/DataAnalysis.vue
对应说明书：4.5
```vue
<template>
  <AppLayout>
    <main class="main-content page-main-shell page-main-shell--fill analysis-page-root">
      <div class="content-wrapper glass-page page-card-fill page-card-body-stack-md analysis-page-fill">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智能分析</div>
          </template>

          <div class="analysis-dashboard page-grid-stack-md">
            <div class="col-input">
              <a-card
                size="small"
                class="widget-card glass-widget-card input-panel"
                title="分析参数">
                <div class="input-main">
                  <div class="preview-box">
                    <a-upload
                      v-if="!imageUrl"
                      v-model:file-list="fileList"
                      name="file"
                      class="preview-upload"
                      accept="image/jpeg,image/png"
                      :show-upload-list="false"
                      :before-upload="beforeUpload"
                      :customRequest="customUpload"
                      @change="handleChange">
                      <div class="preview-empty">
                        <loading-outlined v-if="loading" />
                        <plus-outlined v-else />
                        <p>上传叶片</p>
                        <span>JPG / PNG，不超过 2MB</span>
                      </div>
                    </a-upload>
                    <button
                      v-else
                      type="button"
                      class="preview-open-btn"
                      aria-label="查看图像预览"
                      @click="previewOpen = true">
                      <img
                        :src="imageUrl"
                        alt=""
                        class="preview-image" />
                      <div
                        v-if="uploading || analyzing"
                        class="preview-overlay">
                        <a-progress
                          v-if="uploading"
                          type="circle"
                          :percent="uploadProgress"
                          :width="72" />
                        <a-spin
                          v-else
                          size="large" />
                      </div>
                    </button>
                  </div>

                  <div class="input-fields">
                    <div
                      class="category-row"
                      role="tablist"
                      aria-label="识别类别">
                      <button
                        v-for="category in categories"
                        :key="category.key"
                        type="button"
                        role="tab"
                        class="category-btn"
                        :class="{ active: selectedCategory === category.key }"
                        :aria-selected="selectedCategory === category.key"
                        @click="selectedCategory = category.key">
                        {{ category.short }}
                      </button>
                    </div>
                    <p
                      v-if="selectedCategory !== 'pest'"
                      class="category-hint">
                      当前模型为病虫害分类，其他类别仅供参考
                    </p>

                    <a-select
                      v-model:value="formState.cropType"
                      class="crop-select"
                      popup-class-name="glass-select-dropdown"
                      placeholder="作物">
                      <a-select-option
                        v-for="crop in bjjCropOptions"
                        :key="crop.value"
                        :value="crop.value">
                        {{ crop.label }}
                      </a-select-option>
                    </a-select>

                    <a-textarea
                      v-model:value="formState.additionalInfo"
                      class="note-input"
                      placeholder="补充信息（选填）"
                      :rows="2" />

                    <a-button
                      type="primary"
                      block
                      class="start-btn"
                      :loading="analyzing"
                      @click="handleConfirm">
                      开始分析
                    </a-button>
                  </div>
                </div>

                <div class="batch-row">
                  <input
                    ref="batchInputRef"
                    class="batch-file-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    @change="onBatchFiles" />
                  <button
                    type="button"
                    class="batch-file-picker"
                    @click="openBatchPicker">
                    <span class="batch-file-btn">批量</span>
                    <span class="batch-file-label">{{ batchFileLabel }}</span>
                  </button>
                  <a-button
                    class="batch-submit-btn"
                    :loading="analyzing"
                    @click="handleBatch">
                    识别
                  </a-button>
                </div>
              </a-card>
            </div>

            <div class="col-output">
              <a-card
                size="small"
                class="widget-card glass-widget-card output-panel"
                title="分析结果">
                <div
                  v-if="analyzing"
                  class="output-state">
                  <a-spin />
                  <p>推理中，请稍候</p>
                </div>
                <div
                  v-else-if="analysisResult"
                  class="output-result">
                  <div class="result-header">
                    <h3 class="result-title">{{ analysisResult.result }}</h3>
                    <a-tag :color="analysisResult.isHealthy ? 'success' : 'error'">
                      {{ analysisResult.isHealthy ? '健康' : '需关注' }}
                    </a-tag>
                  </div>
                  <p class="result-meta">
                    {{ cropLabel }} · {{ categoryLabel }} · {{ formatAnalyzedAt(analysisResult.analyzedAt) }}
                  </p>
                  <div class="confidence-block">
                    <div class="confidence-label">
                      <span>置信度</span>
                      <strong>{{ confidencePercent }}%</strong>
                    </div>
                    <a-progress
                      :percent="confidencePercent"
                      :stroke-color="confidenceStrokeColor"
                      :show-info="false"
                      size="small" />
                  </div>
                  <p
                    v-if="needsManualReview"
                    class="result-review-hint">
                    置信度偏低，建议人工复核后再生成高等级预警。
                  </p>
                  <div
                    v-if="needsManualReview && fileList[0]?.originFileObj"
                    class="feedback-box">
                    <a-input
                      v-model:value="correctedLabel"
                      placeholder="实际病名（23 类）"
                      size="small" />
                    <a-button
                      type="primary"
                      size="small"
                      :loading="feedbackSubmitting"
                      @click="handleFeedback">
                      纠错
                    </a-button>
                  </div>
                  <a-collapse
                    v-if="treatmentPanels.length"
                    v-model:activeKey="activeCollapseKeys"
                    class="suggestion-collapse"
                    :bordered="false">
                    <a-collapse-panel
                      v-for="panel in treatmentPanels"
                      :key="panel.key"
                      :header="panel.title">
                      <ul class="suggestion-panel-list">
                        <li
                          v-for="(line, idx) in panel.lines"
                          :key="idx">
                          {{ line }}
                        </li>
                      </ul>
                    </a-collapse-panel>
                  </a-collapse>
                  <p
                    v-if="treatmentDisclaimer && treatmentPanels.length"
                    class="treatment-disclaimer">
                    {{ treatmentDisclaimer }}
                  </p>
                  <div
                    v-if="!analysisResult.isHealthy"
                    class="result-links">
                    <a-button
                      type="link"
                      class="goto-link"
                      @click="router.push('/warnings')">
                      预警中心
                    </a-button>
                    <a-button
                      type="link"
                      class="goto-link"
                      @click="router.push('/decision')">
                      智慧决策
                    </a-button>
                  </div>
                </div>
                <div
                  v-else
                  class="output-state">
                  <ExperimentOutlined class="output-empty-icon" />
                  <p>开始分析后，病名、置信度与防治建议会显示在这里</p>
                </div>
              </a-card>
            </div>
          </div>
        </a-card>
      </div>
    </main>

    <a-modal
      v-model:open="previewOpen"
      title="图像预览"
      wrap-class-name="glass-preview-modal-wrap"
      :width="720"
      centered
      :footer="null"
      @cancel="previewOpen = false">
      <div class="preview-modal-stage">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          alt="预览"
          class="preview-modal-image" />
        <div
          v-if="uploading || analyzing"
          class="preview-modal-overlay">
          <a-progress
            v-if="uploading"
            type="circle"
            :percent="uploadProgress"
            :width="88" />
          <a-spin
            v-else
            size="large" />
          <p>{{ uploading ? '正在上传…' : '正在智能分析…' }}</p>
        </div>
      </div>
      <div class="preview-modal-footer">
        <a-upload
          v-model:file-list="fileList"
          name="file"
          accept="image/jpeg,image/png"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          :customRequest="customUpload"
          @change="handleChange">
          <a-button>更换图片</a-button>
        </a-upload>
        <a-button
          type="primary"
          @click="previewOpen = false">
          关闭
        </a-button>
      </div>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { PlusOutlined, LoadingOutlined, ExperimentOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps, UploadFile } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { analyzeImage, analyzeBatch, submitAnalysisFeedback } from '@/api/analysis.ts'
import {
  useTreatmentGuide,
  buildTreatmentPanels,
  type TreatmentPanel
} from '@/composables/useTreatmentGuide'
import { useDataStore } from '@/stores/data'
import { useRouter } from 'vue-router'
import { BJJ_CROP_LABELS, BJJ_CROP_OPTIONS } from '@/constants/crops.ts'
import { canonicalizeDiseaseLabel } from '@/utils/diseaseLabels.ts'

const store = useDataStore()
const router = useRouter()
const { getTreatment, disclaimer: treatmentDisclaimer } = useTreatmentGuide()
const bjjCropOptions = BJJ_CROP_OPTIONS

const formState = reactive({
  cropType: 'wheat' as keyof typeof BJJ_CROP_LABELS,
  additionalInfo: ''
})

const cropLabels = BJJ_CROP_LABELS

const categories = [
  { key: 'disaster', name: '灾害识别', short: '灾害' },
  { key: 'pest', name: '病虫害识别', short: '病虫害' },
  { key: 'climate', name: '气候灾害识别', short: '气候' },
  { key: 'other', name: '其他', short: '其他' }
]
const selectedCategory = ref('pest')

interface AnalysisResultView {
  result: string
  confidence: number
  isHealthy: boolean
  cropType: string
  category: string
  analyzedAt: number
}

const fileList = ref<UploadFile[]>([])
const batchFiles = ref<File[]>([])
const batchInputRef = ref<HTMLInputElement | null>(null)

const batchFileLabel = computed(() => {
  const count = batchFiles.value.length
  if (count === 0) return '未选择任何文件'
  if (count === 1) return batchFiles.value[0].name
  return `已选择 ${count} 个文件`
})
const loading = ref<boolean>(false)
const uploading = ref<boolean>(false)
const uploadProgress = ref<number>(0)
const imageUrl = ref<string>('')
const previewOpen = ref(false)
const analyzing = ref(false)
const analysisResult = ref<AnalysisResultView | null>(null)
const recordId = ref<number | null>(null)
const correctedLabel = ref('')
const feedbackSubmitting = ref(false)

const cropLabel = computed(
  () => cropLabels[analysisResult.value?.cropType ?? formState.cropType] ?? formState.cropType
)

const categoryLabel = computed(() => {
  const key = analysisResult.value?.category ?? selectedCategory.value
  return categories.find((c) => c.key === key)?.name ?? key
})

const confidencePercent = computed(() => {
  if (!analysisResult.value) return 0
  const raw = analysisResult.value.confidence
  const pct = raw <= 1 ? raw * 100 : raw
  return Math.min(100, Math.max(0, Math.round(pct)))
})

const confidenceStrokeColor = computed(() => {
  const p = confidencePercent.value
  if (p >= 80) return '#73d13d'
  if (p >= 60) return '#faad14'
  return '#ff4d4f'
})

const needsManualReview = computed(() => {
  if (!analysisResult.value) return false
  return confidencePercent.value < 70 && !analysisResult.value.isHealthy
})

const treatmentItem = computed(() => {
  if (!analysisResult.value) return null
  return getTreatment(analysisResult.value.result)
})

const treatmentPanels = computed((): TreatmentPanel[] => {
  if (!treatmentItem.value) return []
  return buildTreatmentPanels(treatmentItem.value)
})

const activeCollapseKeys = ref<string[]>([])

function resolveDefaultCollapseKeys(panels: TreatmentPanel[]): string[] {
  if (panels.some((p) => p.key === 'chemical')) return ['chemical']
  if (panels.some((p) => p.key === 'summary')) return ['summary']
  return panels.slice(0, 1).map((p) => p.key)
}

watch(
  treatmentPanels,
  (panels) => {
    activeCollapseKeys.value = resolveDefaultCollapseKeys(panels)
  },
  { immediate: true }
)

function formatAnalyzedAt(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const customUpload = (options: any) => {
  const { onSuccess, file } = options
  setTimeout(() => onSuccess('Ok', file), 100)
}

const handleChange = (info: UploadChangeParam) => {
  fileList.value = info.fileList

  if (info.file.status === 'uploading') {
    analysisResult.value = null
    loading.value = true
    uploading.value = true
    uploadProgress.value = 0
    const interval = setInterval(() => {
      uploadProgress.value += Math.floor(Math.random() * 10) + 5
      if (uploadProgress.value >= 84) {
        uploadProgress.value = 84
        clearInterval(interval)
      }
    }, 200)
    return
  }
  if (info.file.status === 'done') {
    uploadProgress.value = 100
    setTimeout(() => {
      uploading.value = false
      loading.value = false
      getBase64(info.file.originFileObj as Blob, (base64Url: string) => {
        imageUrl.value = base64Url
      })
    }, 500)
  }
  if (info.file.status === 'error') {
    uploading.value = false
    loading.value = false
    message.error('上传失败')
  }
}

const handleConfirm = async () => {
  if (!imageUrl.value || !fileList.value[0]?.originFileObj) {
    message.warning('请先上传一张图片！')
    return
  }

  analyzing.value = true
  analysisResult.value = null
  recordId.value = null
  correctedLabel.value = ''

  try {
    const response = await analyzeImage({
      file: fileList.value[0].originFileObj,
      cropType: formState.cropType,
      category: selectedCategory.value,
      additionalInfo: formState.additionalInfo,
      pointId: store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id
    })

    const aiResult = canonicalizeDiseaseLabel(String(response.data.result ?? ''))
    if (!aiResult) {
      message.warning('京津冀版不展示桃/苹果病害，请改选小麦、玉米、番茄或水稻。')
      return
    }
    const aiConfidence = response.data.confidence as number
    const rawLevel = response.data.level as string
    const level =
      rawLevel === 'low' || rawLevel === 'medium' || rawLevel === 'high' ? rawLevel : 'medium'
    const isHealthy = aiResult.includes('健康')
    const cropName = cropLabels[formState.cropType] ?? formState.cropType

    const rawRecordId = response.data.recordId
    recordId.value = typeof rawRecordId === 'number' ? rawRecordId : null

    analysisResult.value = {
      result: aiResult,
      confidence: aiConfidence,
      isHealthy,
      cropType: formState.cropType,
      category: selectedCategory.value,
      analyzedAt: Date.now()
    }

    if (!isHealthy) {
      const defaultPointId = store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id ?? 1
      const pct = (aiConfidence <= 1 ? aiConfidence * 100 : aiConfidence).toFixed(1)
      await store.createAlert({
        pointId: defaultPointId,
        level,
        message: `[AI识别] 监测到 ${cropName} - ${aiResult} (置信度: ${pct}%)`,
        handled: false
      })
    }

    message.success('分析完成！请查看右侧结果。')
  } catch (error) {
    message.error('分析或保存失败，请重试。')
    console.error('Error:', error)
  } finally {
    analyzing.value = false
  }
}

function openBatchPicker() {
  batchInputRef.value?.click()
}

const onBatchFiles = (event: Event) => {
  const input = event.target as HTMLInputElement
  batchFiles.value = input.files ? Array.from(input.files) : []
}

const handleBatch = async () => {
  if (!batchFiles.value.length) {
    message.warning('请先选择多张图片')
    return
  }
  analyzing.value = true
  analysisResult.value = null
  recordId.value = null
  correctedLabel.value = ''
  try {
    const response = await analyzeBatch({
      files: batchFiles.value,
      cropType: formState.cropType,
      category: selectedCategory.value,
      additionalInfo: formState.additionalInfo,
      pointId: store.filteredMonitorPoints[0]?.id ?? store.monitorPoints[0]?.id
    })
    const results = Array.isArray(response.data?.results) ? response.data.results : []
    message.info(`完成 ${results.length} 张`)
    const first = results.find((item: { result?: string }) => item?.result)
    if (first) {
      const aiResult = canonicalizeDiseaseLabel(String(first.result ?? ''))
      if (!aiResult) {
        message.warning('京津冀版不展示桃/苹果病害，请改选小麦、玉米、番茄或水稻。')
        return
      }
      const aiConfidence = Number(first.confidence)
      recordId.value = typeof first.recordId === 'number' ? first.recordId : null
      analysisResult.value = {
        result: aiResult,
        confidence: aiConfidence,
        isHealthy: aiResult.includes('健康'),
        cropType: formState.cropType,
        category: selectedCategory.value,
        analyzedAt: Date.now()
      }
      const firstFile = batchFiles.value[0]
      if (firstFile) {
        getBase64(firstFile, (base64Url: string) => {
          imageUrl.value = base64Url
        })
      }
    }
  } catch (error) {
    message.error('批量识别失败，请重试。')
    console.error('Batch error:', error)
  } finally {
    analyzing.value = false
  }
}

const handleFeedback = async () => {
  const file = fileList.value[0]?.originFileObj
  const label = correctedLabel.value.trim()
  if (!file || !label) {
    message.warning('请填写实际病名')
    return
  }
  feedbackSubmitting.value = true
  try {
    await submitAnalysisFeedback({
      file,
      correctedLabel: label,
      recordId: recordId.value ?? undefined
    })
    message.success('已写入难例队列')
  } catch (error) {
    message.error('纠错提交失败，请核对病名是否属于 23 类。')
    console.error('Feedback error:', error)
  } finally {
    feedbackSubmitting.value = false
  }
}

</script>
```

## 模块 17：预警管理页面
文件路径：src/views/user/WarningSystem.vue
对应说明书：4.6
```vue
<template>
  <AppLayout>
    <main class="main-content page-main-shell">
      <div class="content-wrapper glass-page">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">预警管理</div>
          </template>
          <template #extra>
            <div class="warning-toolbar">
              <a-button
                type="primary"
                @click="showCreateModal">
                新建预警
              </a-button>
              <a-button
                class="refresh-btn"
                @click="fetchAlerts">
                刷新
              </a-button>
              <a-switch
                v-model:checked="showDrafts"
                class="draft-switch"
                checked-children="含草稿"
                un-checked-children="待办" />
            </div>
          </template>

          <a-list
            class="alert-list"
            :dataSource="enrichedAlerts"
            :loading="dataStore.loadingAlerts"
            :pagination="{ pageSize: 5, showSizeChanger: false, showQuickJumper: false }">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <div class="alert-title-wrapper">
                      <div class="alert-info">
                        <a-tag :color="getLevelColor(item.level)">
                          {{ getLevelText(item.level) }}
                        </a-tag>
                        <span
                          class="source-tag"
                          :class="item.source === 'auto' ? 'source-tag--auto' : 'source-tag--manual'">
                          {{ item.source === 'auto' ? '自动' : '手动' }}
                        </span>
                        <span class="point-name">{{ item.pointName }}</span>
                        <span
                          class="handle-tag"
                          :class="item.handled ? 'handle-tag--done' : 'handle-tag--pending'">
                          {{ item.handled ? '已处理' : '待处理' }}
                        </span>
                      </div>
                      <span class="alert-time">{{ formatTime(item.time) }}</span>
                    </div>
                  </template>
                  <template #description>
                    <div class="alert-message">{{ item.message }}</div>
                  </template>
                </a-list-item-meta>
                <template #actions>
                  <a
                    v-if="item.draft"
                    @click="handlePublish(item)">
                    确认发布
                  </a>
                  <a
                    v-if="!item.handled"
                    @click="handleToggle(item)">
                    标记解决
                  </a>
                  <a
                    v-else
                    @click="handleToggle(item)">
                    标记未处理
                  </a>
                  <a
                    class="delete-action"
                    @click="handleDelete(item.id)">
                    删除
                  </a>
                </template>
              </a-list-item>
            </template>
            <template #empty>
              <GlassEmpty description="暂无预警信息" />
            </template>
          </a-list>
        </a-card>
      </div>
    </main>

    <a-modal
      v-model:open="createModalVisible"
      title="新建预警"
      ok-text="确定"
      cancel-text="取消"
      wrap-class-name="warning-modal"
      @ok="handleCreateModalOk"
      @cancel="createModalVisible = false">
      <a-form
        :model="createFormModal"
        layout="vertical">
        <a-form-item
          label="监测点"
          required>
          <a-select
            v-model:value="createFormModal.pointId"
            placeholder="请选择监测点"
            show-search
            :filter-option="filterOption">
            <a-select-option
              v-for="point in dataStore.filteredMonitorPoints"
              :key="point.id"
              :value="point.id">
              {{ point.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="预警级别"
          required>
          <a-select
            v-model:value="createFormModal.level"
            placeholder="请选择级别">
            <a-select-option value="low">低</a-select-option>
            <a-select-option value="medium">中</a-select-option>
            <a-select-option value="high">高</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="预警信息"
          required>
          <a-textarea
            v-model:value="createFormModal.message"
            :rows="4"
            placeholder="请输入详细的预警内容..." />
        </a-form-item>
      </a-form>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import GlassEmpty from '@/components/GlassEmpty.vue'
import { reactive, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import { getAlertLevelColor, getAlertLevelText } from '@/utils/alertLevel'
import { formatTime } from '@/utils/formatTime'
import { publishAlert } from '@/api/rules'

const dataStore = useDataStore()
const showDrafts = ref(false)

const enrichedAlerts = computed(() => {
  const pointsMap = new Map(dataStore.filteredMonitorPoints.map((p) => [p.id, p.name]))
  const regionIds = new Set(dataStore.filteredMonitorPoints.map((p) => p.id))
  return dataStore.alerts
    .filter(
      (alert) => regionIds.has(alert.pointId) && (showDrafts.value || alert.draft !== true)
    )
    .map((alert) => ({
      ...alert,
      pointName: pointsMap.get(alert.pointId) || `未知监测点 #${alert.pointId}`
    }))
})

const createFormModal = reactive({
  pointId: null as number | null,
  level: 'medium' as 'low' | 'medium' | 'high',
  message: ''
})
const createModalVisible = ref(false)

const getLevelColor = getAlertLevelColor
const getLevelText = getAlertLevelText

const fetchAlerts = async () => {
  try {
    await dataStore.fetchAlerts()
  } catch (e) {
    message.error('获取预警失败')
  }
}

const showCreateModal = () => {
  createFormModal.pointId =
    dataStore.filteredMonitorPoints.length > 0
      ? dataStore.filteredMonitorPoints[0].id
      : null
  createFormModal.level = 'medium'
  createFormModal.message = ''
  createModalVisible.value = true
}

const handleCreateModalOk = async () => {
  if (!createFormModal.pointId) {
    message.warning('请选择一个监测点')
    return
  }
  if (!createFormModal.message.trim()) {
    message.warning('请输入预警信息')
    return
  }
  try {
    await dataStore.createAlert({
      pointId: createFormModal.pointId,
      level: createFormModal.level,
      message: createFormModal.message.trim()
    })
    message.success('创建成功')
    createModalVisible.value = false
    await fetchAlerts()
  } catch (e) {
    message.error('创建失败')
  }
}

const handlePublish = async (alert: { id: number }) => {
  try {
    await publishAlert(alert.id)
    await fetchAlerts()
    message.success('已确认发布')
  } catch (e) {
    message.error('发布失败')
  }
}

const handleToggle = async (alert: any) => {
  try {
    await dataStore.updateAlert(alert.id, { handled: !alert.handled })
    message.success('状态已更新')
  } catch (e) {
    message.error('更新失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await dataStore.deleteAlert(id)
    message.success('已删除')
  } catch (e) {
    message.error('删除失败')
  }
}

const filterOption = (input: string, option: any) => {
  return option.children[0].children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

onMounted(() => {
  dataStore.fetchMonitorPoints()
  fetchAlerts()
})
</script>
```

## 模块 18：相关数据页面
文件路径：src/views/user/RelatedData.vue
对应说明书：4.3
```vue
<template>
  <AppLayout>
    <div class="data-page-content">
      <div class="nav-buttons">
        <a-button
          v-for="tab in tabs"
          :key="tab.key"
          class="nav-btn"
          :class="{ 'active-btn': currentTab === tab.key }"
          @click="switchTab(tab.key)">
          {{ tab.label }}
        </a-button>
      </div>

      <div class="chart-panel glass-panel glass-panel--chart">
        <div class="panel-header">
          <div class="header-left">
            <span class="title">{{ currentTitle }}</span>
            <span class="sub-title">{{ currentSubtitle }}</span>
          </div>

          <div class="header-actions">
            <a-select
              v-if="currentTab === 'weather'"
              :key="`weather-point-${weatherPointOptionKey}`"
              v-model:value="selectedWeatherPointId"
              class="weather-point-select"
              popup-class-name="weather-point-select-dropdown"
              placeholder="选择监测站">
              <a-select-option
                v-for="point in dataStore.filteredMonitorPoints"
                :key="point.id"
                :value="Number(point.id)">
                {{ point.name }}
              </a-select-option>
            </a-select>
            <a-select
              v-if="currentTab === 'sensor'"
              v-model:value="selectedSensorPointIds"
              mode="multiple"
              class="weather-point-select weather-point-select--multi"
              popup-class-name="weather-point-select-dropdown"
              :options="weatherPointOptions"
              :max-tag-count="2"
              placeholder="对比监测站（最多 3 个）"
              @change="onSensorPointsChange" />
            <a-button
              type="primary"
              class="report-btn"
              @click="handleGenerateReport">
              <template #icon><FilePdfOutlined /></template>
              生成{{ currentTabName }}简报
            </a-button>
            <button
              type="button"
              class="detail-btn"
              @click.stop="handleViewDetail">
              查看详情
            </button>
          </div>
        </div>

        <div
          class="chart-wrapper"
          :class="{ 'chart-wrapper--weather': currentTab === 'weather' }">
          <div
            v-if="loading"
            class="glass-loading-mask">
            <div class="loading-content">
              <a-spin size="large" />
              <p>正在加载数据...</p>
            </div>
          </div>

          <div
            v-show="currentTab === 'sensor'"
            ref="sensorChartRef"
            class="full-content sensor-chart"></div>

          <div
            v-if="currentTab === 'drone' || currentTab === 'gis'"
            class="full-content map-visual">
            <NdviLayerControls v-if="currentTab === 'drone'" />
            <a-alert
              v-if="currentTab === 'drone' && remoteStore.selectedFieldHighRisk"
              class="high-risk-banner"
              type="warning"
              show-icon
              message="建议地面复核"
              :description="`${selectedFieldName} 虫情风险为高，请结合 NDVI 与预警草稿安排踏查。`" />
            <RemoteSensingMap
              ref="remoteMapRef"
              :key="currentTab"
              :mode="currentTab === 'drone' ? 'ndvi' : 'moisture'"
              :image-url="remoteRasterLayer.imageUrl"
              :bounds="remoteRasterLayer.bounds"
              :compare-image-url="ndviCompareImageUrl"
              :compare-opacity="remoteStore.compareOpacity"
              :high-risk-bounds="droneHighRiskBounds"
              :flight-path="droneFlightPath"
              :show-monitor-points="currentTab === 'gis'"
              :enable-moisture-query="currentTab === 'gis'"
              :monitor-points="dataStore.filteredMonitorPoints"
              :monitor-alerts="dataStore.filteredAlerts"
              @moisture-query="onMoistureQuery" />
            <div class="map-caption">
              <h3 class="font-heading">
                {{ currentTab === 'drone' ? 'NDVI 植被指数' : '土壤墒情分布' }}
              </h3>
              <p class="map-source">
                来源：{{ mapDataSource }}
              </p>
              <p
                v-if="currentTab === 'drone' && remoteStore.selectedNdviDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedNdviDate }}
                <template v-if="remoteStore.compareEnabled && remoteStore.compareNdviDate">
                  · 对比 {{ remoteStore.compareNdviDate }}
                  · 历史透明度 {{ Math.round(remoteStore.compareOpacity * 100) }}%
                </template>
              </p>
              <p
                v-if="currentTab === 'gis' && remoteStore.selectedMoistureDate"
                class="map-meta">
                影像日期：{{ remoteStore.selectedMoistureDate }} · 监测点为地面传感器
              </p>
              <p
                v-if="currentTab === 'gis'"
                class="map-meta map-meta--hint">
                点击地图可查询该位置墒情（演示：最近监测点）
              </p>
              <p
                v-if="currentTab === 'gis' && lastMoistureQuery"
                class="map-meta">
                最近查值：{{ lastMoistureQuery.moisture }}% · {{ lastMoistureQuery.pointName }}
              </p>
            </div>
            <div
              class="map-legend"
              :aria-label="currentTab === 'drone' ? 'NDVI 色标' : '土壤湿度色标'">
              <span class="legend-title">
                {{ currentTab === 'drone' ? 'NDVI' : '墒情 (%)' }}
              </span>
              <div class="legend-bar">
                <span
                  v-for="step in legendSteps"
                  :key="step.label"
                  class="legend-step"
                  :style="{ background: step.color }"
                  :title="step.label" />
              </div>
              <div class="legend-labels">
                <span>{{ legendSteps[0]?.label }}</span>
                <span>{{ legendSteps[legendSteps.length - 1]?.label }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="currentTab === 'weather'"
            class="weather-layout">
            <div
              v-if="activeExtremeTitles.length"
              class="weather-extreme-tags">
              <a-tag
                v-for="title in activeExtremeTitles"
                :key="title"
                color="orange"
                style="cursor: pointer"
                @click="router.push('/warnings')">
                {{ title }}
              </a-tag>
            </div>
            <div class="weather-body">
              <div class="weather-metrics">
                <template v-if="weatherMetrics.length">
                  <a-card
                    v-for="item in weatherMetrics"
                    :key="item.label"
                    class="weather-card"
                    :title="item.label">
                    {{ item.value }}
                  </a-card>
                </template>
                <div
                  v-else
                  class="weather-empty">
                  暂无该监测站气象读数
                </div>
              </div>
              <aside class="weather-side">
                <section class="weather-forecast-block">
                  <h4 class="weather-side-title">7 日预报</h4>
                  <a-table
                    v-if="forecastDays.length"
                    class="forecast-table"
                    size="small"
                    :pagination="false"
                    :data-source="forecastDays"
                    :columns="forecastColumns"
                    row-key="date" />
                  <div
                    v-else
                    class="forecast-empty">
                    暂无该站 7 日预报
                  </div>
                </section>
                <section class="threshold-settings">
                  <h4 class="threshold-title">阈值配置</h4>
                  <a-form
                    layout="vertical"
                    class="threshold-form">
                    <div class="threshold-grid">
                      <a-form-item label="作物">
                        <a-select
                          v-model:value="thresholdForm.crop"
                          class="threshold-select"
                          popup-class-name="weather-point-select-dropdown"
                          :options="cropSelectOptions"
                          @change="onCropOrStageChange" />
                      </a-form-item>
                      <a-form-item label="生育期">
                        <a-select
                          v-model:value="thresholdForm.growthStage"
                          class="threshold-select"
                          popup-class-name="weather-point-select-dropdown"
                          :options="stageSelectOptions"
                          @change="onCropOrStageChange" />
                      </a-form-item>
                      <a-form-item label="墒情提示">
                        <a-input-number
                          v-model:value="thresholdForm.waterStressHint"
                          :min="1"
                          :max="50" />
                      </a-form-item>
                      <a-form-item label="墒情告警">
                        <a-input-number
                          v-model:value="thresholdForm.waterStressAlert"
                          :min="1"
                          :max="50" />
                      </a-form-item>
                      <a-form-item label="气温提示">
                        <a-input-number
                          v-model:value="thresholdForm.heatHint"
                          :min="20"
                          :max="50" />
                      </a-form-item>
                      <a-form-item label="气温告警">
                        <a-input-number
                          v-model:value="thresholdForm.heatAlert"
                          :min="20"
                          :max="50" />
                      </a-form-item>
                    </div>
                    <a-button
                      type="primary"
                      class="threshold-save-btn"
                      @click="savePointThresholds">
                      保存阈值
                    </a-button>
                  </a-form>
                </section>
              </aside>
            </div>
          </div>
        </div>

        <div class="ai-analysis-box">
          <span class="ai-tag">AI 智能分析</span>
          <span class="ai-text">
            {{ aiConclusion }}
          </span>
        </div>
      </div>
    </div>

    <a-drawer
      v-model:open="detailOpen"
      :title="`${currentTitle} · 详情`"
      root-class-name="data-detail-drawer"
      :width="currentTab === 'weather' ? 640 : 520"
      @after-open-change="onDetailDrawerOpen">
      <div
        v-if="currentTab === 'sensor'"
        class="detail-section">
        <h4 class="detail-section-title">近 7 日读数</h4>
        <a-table
          class="glass-ant-table"
          size="small"
          :pagination="false"
          :data-source="sensorDetailRows"
          :columns="sensorDetailColumns"
          :locale="{ emptyText: '暂无该监测站近 7 日读数' }"
          row-key="id" />
      </div>
      <div
        v-else-if="currentTab === 'weather'"
        class="detail-section">
        <p class="detail-kicker">{{ getWeatherPointName(selectedWeatherPointId) }}</p>
        <h4 class="detail-section-title">实时读数</h4>
        <div
          v-if="weatherMetrics.length"
          class="detail-metric-grid">
          <div
            v-for="item in weatherMetrics"
            :key="item.label"
            class="detail-metric">
            <span class="detail-metric-label">{{ item.label }}</span>
            <span class="detail-metric-value">{{ item.value }}</span>
          </div>
        </div>
        <p
          v-else
          class="detail-empty">
          暂无该监测站气象读数
        </p>
        <template v-if="forecastDays.length">
          <h4 class="detail-section-title">7 日预报</h4>
          <a-table
            class="glass-ant-table"
            size="small"
            :pagination="false"
            :data-source="forecastDays"
            :columns="forecastColumns"
            row-key="date" />
        </template>
      </div>
      <div
        v-else
        class="detail-section">
        <div class="detail-metric-grid detail-metric-grid--two">
          <div class="detail-metric">
            <span class="detail-metric-label">数据来源</span>
            <span class="detail-metric-value">{{ mapDataSource }}</span>
          </div>
          <div
            v-if="detailImageDate"
            class="detail-metric">
            <span class="detail-metric-label">影像日期</span>
            <span class="detail-metric-value">{{ detailImageDate }}</span>
          </div>
          <div
            v-if="currentTab === 'drone'"
            class="detail-metric">
            <span class="detail-metric-label">当前地块</span>
            <span class="detail-metric-value">{{ selectedFieldName }}</span>
          </div>
        </div>
        <p class="detail-hint">
          {{
            currentTab === 'drone'
              ? '在灾害实时监测地图上对照田间监测点与当前 NDVI 图层。'
              : '在灾害实时监测地图上查看墒情分布、站点位置与预警状态。'
          }}
        </p>
        <a-button
          type="primary"
          class="detail-map-btn"
          @click="openMapPage">
          打开灾害实时监测
        </a-button>
      </div>
    </a-drawer>

    <a-modal
      v-model:visible="reportModalVisible"
      wrap-class-name="glass-report-modal-wrap"
      root-class-name="glass-report-modal-root"
      title="生成监测日报"
      ok-text="下载 txt"
      :confirm-loading="reportLoading"
      @ok="handleDownload">
      <p v-if="reportLoading">正在生成监测日报...</p>
      <pre
        v-else-if="reportMarkdown"
        class="report-preview">{{ reportPreview }}</pre>
      <p v-else>暂无日报内容</p>
    </a-modal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import RemoteSensingMap from '@/components/remote-sensing/RemoteSensingMap.vue'
import NdviLayerControls from '@/components/remote-sensing/NdviLayerControls.vue'
import { NDVI_DEMO_LAYER, MOISTURE_DEMO_LAYER } from '@/constants/remoteSensingLayers'
import { useDataStore, type WeatherReading } from '@/stores/data.ts'
import { useRemoteSensingStore } from '@/stores/remoteSensing'
import type { MoistureQueryResult } from '@/types/remoteSensing'
import * as echarts from 'echarts'
import { FilePdfOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { fetchDailyReport, fetchExtremeEvents, fetchForecast, fetchSensorReadings, fetchThresholds, saveThresholds } from '@/api/rules'
import { DEFAULT_THRESHOLD_PROFILE } from '@/utils/alertRules'
import {
  CROP_OPTIONS,
  STAGE_OPTIONS,
  bandsOf,
  presetFor,
  sameBands
} from '@/utils/thresholdPresets'
import { daysForPoint, type ForecastRow } from '@/utils/forecastView'
import { last7DayRange, type SensorReading } from '@/utils/sensorReadings'

const dataStore = useDataStore()
const remoteStore = useRemoteSensingStore()
const router = useRouter()
const loading = ref(false)

const currentTab = ref('sensor')
const selectedWeatherPointId = ref<number>(1)
const selectedSensorPointIds = ref<number[]>([1, 2])
const sensorByStation = ref<
  Array<{ pointId: number; name: string; rows: SensorReading[] }>
>([])
const extremeEvents = ref<Array<{ pointId: number; title: string; startAt: string }>>([])
const forecastDays = ref<ForecastRow[]>([])
const thresholdForm = reactive({ ...DEFAULT_THRESHOLD_PROFILE, pointId: 1 })

const cropSelectOptions = CROP_OPTIONS.map((value) => ({ value, label: value }))
const stageSelectOptions = STAGE_OPTIONS.map((value) => ({ value, label: value }))

function mdLabel(iso: string) {
  const day = String(iso).slice(0, 10)
  return `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))}`
}

const weatherPointOptions = computed(() =>
  dataStore.filteredMonitorPoints.map((point) => ({
    value: Number(point.id),
    label: point.name
  }))
)

const weatherPointOptionKey = computed(() =>
  weatherPointOptions.value.map((item) => item.value).join(',')
)

function asFiniteNumber(value: unknown): number | undefined {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : undefined
}

function formatMetric(value: unknown, digits: number): string {
  const n = asFiniteNumber(value)
  return n == null ? '—' : n.toFixed(digits)
}

function soilTempOf(reading: WeatherReading): number | undefined {
  const row = reading as WeatherReading & { soilTemp10Cm?: number }
  return asFiniteNumber(row.soilTemp10cm) ?? asFiniteNumber(row.soilTemp10Cm)
}

function formatWeatherMetrics(reading: WeatherReading) {
  const rain = asFiniteNumber(reading.hourlyRain) ?? 0
  const rainLabel =
    rain <= 0 ? '0.0 mm（无降水）' : `${rain.toFixed(1)} mm`
  const windDir = asFiniteNumber(reading.windDirection)

  return [
    { label: '土壤体积含水率', value: `${formatMetric(reading.soilVwc, 1)} %vol` },
    { label: '10cm土壤温度', value: `${formatMetric(soilTempOf(reading), 1)} ℃` },
    { label: '土壤EC电导率', value: `${formatMetric(reading.soilEc, 0)} μS/cm` },
    { label: '空气温度', value: `${formatMetric(reading.airTemp, 1)} ℃` },
    { label: '空气相对湿度', value: `${formatMetric(reading.airRh, 1)} %RH` },
    { label: '瞬时风速', value: `${formatMetric(reading.windSpeed, 1)} m/s` },
    {
      label: '风向',
      value:
        windDir == null
          ? '—'
          : `${windDir}°（${reading.windDirectionText || '—'}）`
    },
    { label: '大气气压', value: `${formatMetric(reading.pressure, 1)} hPa` },
    { label: '小时降雨量', value: rainLabel }
  ]
}

const selectedWeatherReading = computed(() =>
  dataStore.getWeatherReadingByPointId(selectedWeatherPointId.value)
)

const weatherMetrics = computed(() => {
  const reading = selectedWeatherReading.value
  return reading ? formatWeatherMetrics(reading) : []
})

const activeExtremeTitles = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const titles: string[] = []
  for (const event of extremeEvents.value) {
    if (event.pointId !== selectedWeatherPointId.value) continue
    if (String(event.startAt) < today) continue
    if (!titles.includes(event.title)) titles.push(event.title)
  }
  return titles
})

async function loadThresholds(pointId: number) {
  try {
    const res = await fetchThresholds(pointId)
    Object.assign(thresholdForm, { ...DEFAULT_THRESHOLD_PROFILE, ...(res.data || {}), pointId })
  } catch {
    Object.assign(thresholdForm, { ...DEFAULT_THRESHOLD_PROFILE, pointId })
  }
}

async function loadForecast(pointId: number) {
  try {
    const res = await fetchForecast(pointId)
    forecastDays.value = daysForPoint(res.data || [], pointId, 7)
  } catch {
    forecastDays.value = []
  }
}

const forecastColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '最高温 ℃', dataIndex: 'tempMax', key: 'tempMax' },
  { title: '最低温 ℃', dataIndex: 'tempMin', key: 'tempMin' },
  { title: '降水 mm', dataIndex: 'precipMm', key: 'precipMm' },
  { title: '风速 m/s', dataIndex: 'windMax', key: 'windMax' }
]

async function savePointThresholds() {
  try {
    await saveThresholds(selectedWeatherPointId.value, {
      ...thresholdForm,
      pointId: selectedWeatherPointId.value
    })
    message.success('阈值已保存')
  } catch {
    message.error('阈值保存失败')
  }
}

function applyPresetBands() {
  Object.assign(thresholdForm, presetFor(thresholdForm.crop, thresholdForm.growthStage))
}

function onCropOrStageChange() {
  const next = presetFor(thresholdForm.crop, thresholdForm.growthStage)
  if (sameBands(bandsOf(thresholdForm), next)) return
  Modal.confirm({
    title: '是否套用该作物生育期的推荐阈值？',
    content: '将改写墒情/气温四档数字；选「取消」只保留作物与生育期标签。',
    okText: '套用',
    cancelText: '取消',
    onOk: () => applyPresetBands()
  })
}

function getWeatherPointName(pointId: number) {
  const id = Number(pointId)
  return (
    dataStore.filteredMonitorPoints.find((point) => Number(point.id) === id)?.name ??
    `监测站 #${id}`
  )
}

function syncSelectedWeatherPoint(preferredId?: number) {
  const points = dataStore.filteredMonitorPoints
  if (!points.length) return
  const preferred =
    preferredId != null ? Number(preferredId) : Number(selectedWeatherPointId.value)
  const match = points.find((point) => Number(point.id) === preferred)
  selectedWeatherPointId.value = Number(match?.id ?? points[0].id)
}

function buildWeatherAiConclusion(reading: WeatherReading, pointName: string) {
  const rain = asFiniteNumber(reading.hourlyRain) ?? 0
  const airRh = asFiniteNumber(reading.airRh)
  const soilVwc = asFiniteNumber(reading.soilVwc)
  const rainPart =
    rain <= 0 ? '当前无降水' : `近 1 小时降雨 ${rain.toFixed(1)} mm`
  const humidityPart =
    airRh == null
      ? ''
      : airRh < 40
        ? '，空气偏干'
        : airRh > 60
          ? '，空气湿度较高'
          : ''
  const soilPart =
    soilVwc == null
      ? ''
      : soilVwc < 20
        ? '，土壤墒情偏低，建议适时补灌'
        : soilVwc > 35
          ? '，土壤墒情充足'
          : '，蒸腾作用较强，建议关注墒情'
  const rhText = airRh == null ? '—' : airRh.toFixed(1)
  const vwcText = soilVwc == null ? '—' : soilVwc.toFixed(1)

  return `${pointName}：${rainPart}（相对湿度 ${rhText}%RH），土壤体积含水率 ${vwcText}%vol${humidityPart}${soilPart}。`
}

const tabs = [
  {
    key: 'sensor',
    label: '传感器数据 (地)',
    title: '物联网传感器监控',
    subtitle: '最近 7 天环境参数趋势'
  },
  {
    key: 'drone',
    label: '无人机遥感 (空)',
    title: '无人机多光谱监测',
    subtitle: '作物长势 NDVI 指数分析'
  },
  {
    key: 'weather',
    label: '气象数据 (天)',
    title: '气象站实时数据',
    subtitle: '土壤墒情与局地小气候实时监测'
  },
  { key: 'gis', label: 'GIS 数据 (图)', title: '地理信息可视化', subtitle: '土壤墒情热力分布图' }
]

const currentTitle = computed(() => tabs.find((t) => t.key === currentTab.value)?.title)
const currentSubtitle = computed(() => {
  const base = tabs.find((t) => t.key === currentTab.value)?.subtitle ?? ''
  if (currentTab.value === 'weather') {
    const pointName = getWeatherPointName(selectedWeatherPointId.value)
    const forecastHint = forecastDays.value.length ? ' · 含 7 日预报' : ''
    return `${pointName} · 土壤墒情与局地小气候实时监测${forecastHint}`
  }
  if (currentTab.value === 'drone' && remoteStore.selectedNdviDate) {
    const fieldName =
      remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ??
      remoteStore.selectedFieldId
    const datePart = `${fieldName} · ${remoteStore.selectedNdviDate}`
    if (remoteStore.compareEnabled && remoteStore.compareNdviDate) {
      return `${base} · ${datePart} · 对比 ${remoteStore.compareNdviDate}`
    }
    return `${base} · ${datePart}`
  }
  return base
})
const currentTabName = computed(() => tabs.find((t) => t.key === currentTab.value)?.label)

const remoteMapRef = ref<InstanceType<typeof RemoteSensingMap> | null>(null)
const lastMoistureQuery = ref<MoistureQueryResult | null>(null)

function onMoistureQuery(result: MoistureQueryResult) {
  lastMoistureQuery.value = result
}

const remoteRasterLayer = computed(() => {
  if (currentTab.value === 'drone') {
    return remoteStore.currentNdviRaster ?? NDVI_DEMO_LAYER
  }
  if (currentTab.value === 'gis') {
    return remoteStore.currentMoistureRaster ?? MOISTURE_DEMO_LAYER
  }
  return NDVI_DEMO_LAYER
})

const selectedFieldName = computed(() => {
  return (
    remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)?.name ??
    remoteStore.selectedFieldId ??
    '当前地块'
  )
})

const droneHighRiskBounds = computed(() => {
  if (currentTab.value !== 'drone' || !remoteStore.selectedFieldHighRisk) return null
  const field = remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)
  return field?.bounds ?? null
})

const droneFlightPath = computed(() => {
  if (currentTab.value !== 'drone') return null
  return remoteStore.currentDronePath
})

const ndviCompareImageUrl = computed(() => {
  if (currentTab.value !== 'drone' || !remoteStore.compareEnabled) return undefined
  return remoteStore.compareNdviRaster?.imageUrl
})

const mapDataSource = computed(() => remoteRasterLayer.value.source)

const detailImageDate = computed(() => {
  if (currentTab.value === 'drone') return remoteStore.selectedNdviDate || remoteRasterLayer.value.date
  if (currentTab.value === 'gis') {
    return remoteStore.selectedMoistureDate || remoteRasterLayer.value.date
  }
  return ''
})

const ndviLegend = [
  { label: '低 (裸地/胁迫)', color: '#8b4513' },
  { label: '偏低', color: '#d4a574' },
  { label: '中等', color: '#f4e87c' },
  { label: '良好', color: '#7cb342' },
  { label: '高 (茂盛)', color: '#1b5e20' }
]

const soilLegend = [
  { label: '干旱', color: '#c62828' },
  { label: '偏干', color: '#ef6c00' },
  { label: '适中', color: '#fdd835' },
  { label: '湿润', color: '#42a5f5' },
  { label: '饱和', color: '#1565c0' }
]

const legendSteps = computed(() =>
  currentTab.value === 'drone' ? ndviLegend : soilLegend
)

const GIS_DEFAULT_AI =
  '土壤水分热力图显示栾城区一带墒情偏高，河间—雄县段偏干，建议分区灌溉。'

function formatMoistureSourceLabel(source: string) {
  return source === 'nearest-point' ? '最近监测点' : source
}

function moistureLevelHint(moisture: number) {
  if (moisture <= 20) return '墒情偏低，与参考站传感器读数一致，建议关注灌溉'
  if (moisture >= 60) return '墒情偏高，与参考站传感器读数一致，建议留意排水'
  return '墒情适中，与参考站传感器读数一致'
}

function buildGisAiConclusion(query: MoistureQueryResult) {
  const sourceLabel = formatMoistureSourceLabel(query.source)
  const levelHint = moistureLevelHint(query.moisture)
  return `${query.pointName} 附近墒情约 ${query.moisture}%（${sourceLabel}），${levelHint}。已定位至 ${query.pointName} 传感器。`
}

function buildDroneAiConclusion() {
  const fieldName =
    remoteStore.fields.find((f) => f.id === remoteStore.selectedFieldId)?.name ?? '当前地块'
  if (
    remoteStore.compareEnabled &&
    remoteStore.compareNdviDate &&
    remoteStore.selectedNdviDate
  ) {
    return `${fieldName} 当前期 ${remoteStore.selectedNdviDate} 与对比期 ${remoteStore.compareNdviDate} 的 NDVI 影像叠加显示植被指数变化，长势较好区域可从画面上绿色加深区域辨识，建议结合田间踏查确认变量施肥范围。`
  }
  return `${fieldName} 出现轻微缺氮光谱特征，建议针对该区域进行无人机变量施肥。`
}

const aiConclusion = computed(() => {
  if (currentTab.value === 'sensor') {
    const alerts = dataStore.filteredAlerts || []
    const criticalCount = alerts.filter(
      (a: any) => a.level === 'critical' || a.level === 'high'
    ).length

    const latestAlert = alerts.find((a: any) => !a.handled)
    const latestMsg = latestAlert ? latestAlert.message : '目前设备运行平稳'

    if (criticalCount > 0) {
      return `系统分析检测到 ${criticalCount} 次高风险异常！最新问题为："${latestMsg}"，建议立即派人排查 pointId-${latestAlert?.pointId}。`
    } else {
      return `过去 7 天传感器网络运行平稳，偶发 ${alerts.length} 次轻微波动，建议维持当前灌溉策略。`
    }
  }

  if (currentTab.value === 'drone') {
    return buildDroneAiConclusion()
  }

  if (currentTab.value === 'gis') {
    return lastMoistureQuery.value
      ? buildGisAiConclusion(lastMoistureQuery.value)
      : GIS_DEFAULT_AI
  }

  if (currentTab.value === 'weather') {
    const reading = selectedWeatherReading.value
    if (!reading) {
      return '气象读数加载中或暂无数据，请切换监测站或稍后重试。'
    }
    return buildWeatherAiConclusion(reading, getWeatherPointName(selectedWeatherPointId.value))
  }

  return '数据分析中...'
})

const sensorChartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

function shortPointName(pointId: number) {
  return getWeatherPointName(pointId).replace(/^监测站\s*·\s*/, '')
}

function defaultSensorPointIds(points = dataStore.filteredMonitorPoints) {
  return points.slice(0, 2).map((point) => point.id)
}

function onSensorPointsChange(ids: number[]) {
  if (ids.length > 3) {
    selectedSensorPointIds.value = ids.slice(0, 3)
    message.info('最多同时对比 3 个监测站')
  }
}

const SENSOR_LINE_PALETTE = [
  { temp: '#ff7875', vwc: '#69c0ff' },
  { temp: '#ffc53d', vwc: '#95de64' },
  { temp: '#b37feb', vwc: '#5cdbd3' }
]

function buildTrendSeries(
  stations: Array<{ pointId: number; name: string; rows: SensorReading[] }>
) {
  const dateSet = new Set<string>()
  for (const station of stations) {
    for (const row of station.rows) dateSet.add(String(row.recordedAt).slice(0, 10))
  }
  const dates = [...dateSet].sort()
  const labels = dates.map((d) => mdLabel(d))
  const series = stations.flatMap((station, index) => {
    const colors = SENSOR_LINE_PALETTE[index % SENSOR_LINE_PALETTE.length]
    const byDay = new Map(
      station.rows.map((row) => [String(row.recordedAt).slice(0, 10), row])
    )
    return [
      {
        name: `${station.name}-气温`,
        type: 'line' as const,
        smooth: true,
        yAxisIndex: 0,
        data: dates.map((d) => byDay.get(d)?.airTemp ?? null),
        lineStyle: { width: 3, color: colors.temp },
        itemStyle: { color: colors.temp }
      },
      {
        name: `${station.name}-墒情`,
        type: 'line' as const,
        smooth: true,
        yAxisIndex: 1,
        data: dates.map((d) => byDay.get(d)?.soilVwc ?? null),
        lineStyle: { width: 3, color: colors.vwc },
        itemStyle: { color: colors.vwc }
      }
    ]
  })
  return { labels, series, legend: series.map((item) => item.name) }
}

async function loadSensorReadings(pointIds: number[]) {
  const ids = pointIds.slice(0, 3)
  const { from, to } = last7DayRange()
  try {
    const results = await Promise.all(
      ids.map(async (pointId) => {
        const res = await fetchSensorReadings(pointId, from, to)
        return {
          pointId,
          name: shortPointName(pointId),
          rows: (res.data || []) as SensorReading[]
        }
      })
    )
    sensorByStation.value = results
  } catch {
    sensorByStation.value = []
    message.warning('传感器历史加载失败，请检查 Mock 服务')
  }
  await nextTick()
  renderSensorChart()
}

function renderSensorChart() {
  if (!sensorChartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(sensorChartRef.value)

  const { labels, series, legend } = buildTrendSeries(sensorByStation.value)

  chartInstance.setOption({
    backgroundColor: 'transparent',
    legend: {
      data: legend,
      textStyle: { color: '#fff' },
      top: 0
    },
    grid: { top: '18%', left: '3%', right: '6%', bottom: 40, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 50, 30, 0.88)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      extraCssText:
        'backdrop-filter: blur(16px); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25); border-radius: 8px;'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels,
      axisLabel: { color: '#fff', margin: 10 }
    },
    yAxis: [
      {
        type: 'value',
        name: '℃',
        nameTextStyle: { color: '#fff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: '#fff' }
      },
      {
        type: 'value',
        name: '%',
        nameTextStyle: { color: '#fff' },
        splitLine: { show: false },
        axisLabel: { color: '#fff' }
      }
    ],
    series
  }, true)
  chartInstance.resize()
}

const switchTab = async (key: string) => {
  if (key === currentTab.value) return
  if (currentTab.value === 'gis' && key !== 'gis') {
    lastMoistureQuery.value = null
  }
  currentTab.value = key
  if (key === 'sensor') {
    await loadSensorReadings(selectedSensorPointIds.value)
  } else if (key === 'drone' || key === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
}

const reportModalVisible = ref(false)
const reportLoading = ref(false)
const reportMarkdown = ref('')
const detailOpen = ref(false)
const reportPreview = computed(() =>
  reportMarkdown.value.split('\n').slice(0, 20).join('\n')
)

const sensorDetailColumns = [
  { title: '监测站', dataIndex: 'station', key: 'station' },
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '气温 ℃', dataIndex: 'airTemp', key: 'airTemp' },
  { title: '湿度 %RH', dataIndex: 'airRh', key: 'airRh' },
  { title: '墒情 %', dataIndex: 'soilVwc', key: 'soilVwc' },
  { title: '土温 ℃', dataIndex: 'soilTemp10cm', key: 'soilTemp10cm' }
]

const sensorDetailRows = computed(() =>
  sensorByStation.value.flatMap((station) =>
    station.rows.map((row) => ({
      ...row,
      station: station.name,
      date: String(row.recordedAt).slice(0, 10)
    }))
  )
)

function handleViewDetail() {
  detailOpen.value = true
}

function onDetailDrawerOpen(open: boolean) {
  if (!open) return
  document.querySelectorAll('.data-detail-drawer .ant-drawer-close').forEach((el) => {
    el.removeAttribute('title')
  })
}

function openMapPage() {
  detailOpen.value = false
  router.push('/map')
}

const handleGenerateReport = async () => {
  reportModalVisible.value = true
  reportLoading.value = true
  reportMarkdown.value = ''
  try {
    const res = await fetchDailyReport()
    reportMarkdown.value = res.data?.markdown || ''
    if (!reportMarkdown.value) throw new Error('empty report')
  } catch {
    reportModalVisible.value = false
    message.error('日报生成失败，请检查 Mock 服务')
  } finally {
    reportLoading.value = false
  }
}

const handleDownload = () => {
  if (!reportMarkdown.value) {
    message.error('暂无日报内容')
    return
  }
  const blob = new Blob([reportMarkdown.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const today = new Date()
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  link.href = url
  link.download = `监测日报-${stamp}.txt`
  link.click()
  URL.revokeObjectURL(url)
  reportModalVisible.value = false
}

function onWindowResize() {
  chartInstance?.resize()
  if (currentTab.value === 'drone' || currentTab.value === 'gis') {
    remoteMapRef.value?.invalidate()
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const tasks: Promise<unknown>[] = [
      remoteStore.fetchAll().catch(() => {
        message.warning('遥感图层加载失败，已使用本地演示数据')
      })
    ]
    if (dataStore.alerts.length === 0) {
      tasks.push(dataStore.fetchAlerts())
    }
    if (dataStore.monitorPoints.length === 0) {
      tasks.push(dataStore.fetchMonitorPoints())
    }
    if (dataStore.weatherReadings.length === 0) {
      tasks.push(
        dataStore.fetchWeatherReadings().catch(() => {
          message.warning('气象读数加载失败，请检查 Mock 服务')
        })
      )
    }
    tasks.push(
      fetchExtremeEvents()
        .then((res) => {
          extremeEvents.value = res.data || []
        })
        .catch(() => {
          extremeEvents.value = []
        })
    )
    tasks.push(loadForecast(selectedWeatherPointId.value))
    tasks.push(loadSensorReadings(selectedSensorPointIds.value))
    await Promise.all(tasks)
    syncSelectedWeatherPoint()
    if (currentTab.value === 'weather') {
      await Promise.all([
        loadThresholds(selectedWeatherPointId.value),
        loadForecast(selectedWeatherPointId.value)
      ])
    }
    await nextTick()
    renderSensorChart()
  } finally {
    loading.value = false
  }
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  chartInstance?.dispose()
  chartInstance = null
})

watch(
  selectedSensorPointIds,
  (pointIds) => {
    if (currentTab.value === 'sensor') {
      void loadSensorReadings(pointIds)
    }
  },
  { deep: true }
)

watch(remoteRasterLayer, async () => {
  if (currentTab.value === 'drone' || currentTab.value === 'gis') {
    await nextTick()
    remoteMapRef.value?.invalidate()
  }
})

watch(currentTab, (tab) => {
  if (tab !== 'weather') return
  const field = remoteStore.fields.find((item) => item.id === remoteStore.selectedFieldId)
  syncSelectedWeatherPoint(field?.monitorPointId)
  void loadThresholds(selectedWeatherPointId.value)
  void loadForecast(selectedWeatherPointId.value)
})

watch(selectedWeatherPointId, (pointId) => {
  void loadThresholds(pointId)
  void loadForecast(pointId)
})

watch(
  () => dataStore.filteredMonitorPoints,
  () => {
    syncSelectedWeatherPoint()
    const points = dataStore.filteredMonitorPoints
    if (!points.length) return
    const selectedStillInRegion = selectedSensorPointIds.value.every((id) =>
      points.some((point) => Number(point.id) === Number(id))
    )
    if (!selectedStillInRegion || selectedSensorPointIds.value.length === 0) {
      selectedSensorPointIds.value = defaultSensorPointIds(points)
    }
  },
  { immediate: true }
)

watch(
  () => dataStore.selectedRegion,
  () => {
    syncSelectedWeatherPoint()
    const points = dataStore.filteredMonitorPoints
    if (points.length) {
      selectedSensorPointIds.value = defaultSensorPointIds(points)
    }
    if (currentTab.value === 'sensor') {
      void loadSensorReadings(selectedSensorPointIds.value)
    }
    if (currentTab.value === 'weather') {
      void loadThresholds(selectedWeatherPointId.value)
      void loadForecast(selectedWeatherPointId.value)
    }
  }
)
</script>
```

## 模块 19：智慧决策页面
文件路径：src/views/user/DecisionSupport.vue
对应说明书：4.7
```vue
<template>
  <AppLayout>
    <main class="main-content page-main-shell page-main-shell--fill decision-page-root">
      <div class="content-wrapper glass-page page-card-fill page-card-body-stack-md decision-page-fill">
        <a-card :bordered="false">
          <template #title>
            <div class="glass-card-title">智慧决策支持</div>
          </template>

          <div class="decision-dashboard page-grid-stack-md">
            <!-- 左列：待处理预警队列 -->
            <div class="col-queue">
              <a-card
                size="small"
                class="widget-card glass-widget-card alert-panel"
                :class="{ 'alert-panel--collapsed': alertPanelCollapsed }">
                <template #title>
                  <div class="alert-panel-head">
                    <span>待处理灾害预警</span>
                    <a-badge
                      :count="unhandledAlerts.length"
                      :overflow-count="99"
                      :number-style="{ backgroundColor: 'var(--dark-green, #4a5c43)' }" />
                  </div>
                </template>
                <template #extra>
                  <a-button
                    type="text"
                    size="small"
                    class="alert-panel-toggle"
                    :aria-label="alertPanelCollapsed ? '展开预警列表' : '折叠预警列表'"
                    @click="alertPanelCollapsed = !alertPanelCollapsed">
                    <UpOutlined v-if="!alertPanelCollapsed" />
                    <DownOutlined v-else />
                  </a-button>
                </template>
                <div
                  v-show="!alertPanelCollapsed"
                  class="alert-list-body">
                  <div
                    class="level-filter"
                    role="tablist"
                    aria-label="预警级别筛选">
                    <button
                      v-for="opt in levelFilterOptions"
                      :key="opt.key"
                      type="button"
                      role="tab"
                      class="level-filter-btn"
                      :class="{ active: levelFilter === opt.key }"
                      :aria-selected="levelFilter === opt.key"
                      @click="levelFilter = opt.key">
                      {{ opt.label }}
                      <span class="level-filter-count">{{ opt.count }}</span>
                    </button>
                  </div>
                  <a-list
                    class="decision-alert-list"
                    :data-source="pagedAlerts"
                    size="small"
                    :pagination="false">
                    <template #renderItem="{ item }">
                      <a-list-item
                        class="area-list-item"
                        :class="{ active: selectedArea && selectedArea.id === item.id }"
                        @click="selectArea(item)">
                        <a-list-item-meta>
                          <template #title>
                            <span class="area-item-title">{{ item.pointName }}</span>
                          </template>
                          <template #description>
                            <a-tag :color="getLevelColor(item.level)">
                              {{ getLevelText(item.level) }}
                            </a-tag>
                            <span class="alert-message-preview">{{ item.message }}</span>
                          </template>
                        </a-list-item-meta>
                      </a-list-item>
                    </template>
                    <template #empty>
                      <div class="empty-list-placeholder">
                        {{ levelFilter === 'all' ? '暂无待处理预警' : '当前筛选下无预警' }}
                      </div>
                    </template>
                  </a-list>
                  <a-pagination
                    v-if="showAlertPagination"
                    v-model:current="alertPage"
                    class="alert-list-pagination"
                    :total="filteredAlerts.length"
                    :page-size="ALERT_PAGE_SIZE"
                    size="small"
                    :show-size-changer="false" />
                </div>
              </a-card>
            </div>

            <!-- 无待办：中+右占位 -->
            <div
              v-if="unhandledAlerts.length === 0"
              class="empty-situation-action">
              <info-circle-outlined />
              <p>当前无待处理预警，请先在预警中心或智能分析产生事件</p>
            </div>

            <!-- 有待办：中列态势 + 右列建议 -->
            <template v-else-if="selectedArea">
              <div class="col-situation">
                <a-card
                  title="实时监测数据"
                  size="small"
                  class="widget-card glass-widget-card monitor-panel">
                  <div class="geo-info-grid">
                    <div class="info-card">
                      <dashboard-outlined
                        class="info-icon"
                        :style="{ color: getStatusColor(selectedArea.pointStatus) }" />
                      <h4>设备状态</h4>
                      <p :style="{ color: getStatusColor(selectedArea.pointStatus) }">
                        {{ getStatusLabel(selectedArea.pointStatus) }}
                      </p>
                    </div>
                    <div class="info-card">
                      <heat-map-outlined class="info-icon" />
                      <h4>当前温度</h4>
                      <p>{{ selectedArea.pointTemp }}°C</p>
                    </div>
                    <div class="info-card">
                      <cloud-outlined class="info-icon" />
                      <h4>土壤湿度</h4>
                      <p>{{ selectedArea.pointSoilMoisture }}%</p>
                    </div>
                  </div>
                </a-card>

                <a-card
                  title="区域概览"
                  size="small"
                  class="widget-card glass-widget-card map-panel">
                  <div
                    ref="mapRef"
                    class="mini-map-container"></div>
                  <a-descriptions
                    :column="1"
                    size="small"
                    class="map-coords">
                    <a-descriptions-item label="经度">
                      {{ selectedArea.coords.lng }}
                    </a-descriptions-item>
                    <a-descriptions-item label="纬度">
                      {{ selectedArea.coords.lat }}
                    </a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </div>

              <div class="col-action">
                <a-card
                  title="AI 决策建议"
                  size="small"
                  class="widget-card glass-widget-card suggestion-panel">
                  <template #extra>
                    <a-button
                      type="primary"
                      size="small"
                      @click="exportPlan">
                      导出方案
                    </a-button>
                  </template>
                  <a-collapse
                    v-model:activeKey="activeCollapseKeys"
                    class="suggestion-collapse"
                    :bordered="false">
                    <a-collapse-panel
                      v-for="panel in suggestionCollapsePanels"
                      :key="panel.key"
                      :header="panel.title">
                      <ul class="suggestion-panel-list">
                        <li
                          v-for="(line, idx) in panel.lines"
                          :key="idx">
                          {{ line }}
                        </li>
                      </ul>
                    </a-collapse-panel>
                  </a-collapse>
                </a-card>
              </div>
            </template>
          </div>
        </a-card>
      </div>
    </main>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  InfoCircleOutlined,
  DashboardOutlined,
  HeatMapOutlined,
  CloudOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useDataStore } from '@/stores/data'
import { useRemoteSensingStore } from '@/stores/remoteSensing'
import { factorsFromAlert } from '@/utils/pestFactors'
import {
  getTreatment,
  parseDiseaseFromAlert,
  buildTreatmentPanels,
  flattenTreatmentPanels,
  type TreatmentPanel,
  useTreatmentGuide
} from '@/composables/useTreatmentGuide'
import { createLeafletBaseMap, invalidateLeafletSize, removeLeafletMap } from '@/composables/useLeafletBase'
import { createMonitorPointLayer } from '@/composables/useMonitorPointLayer'
import {
  getAlertLevelColor,
  getAlertLevelText,
  normalizeAlertLevel
} from '@/utils/alertLevel'
import {
  getMonitorStatusColor as getStatusColor,
  getMonitorStatusLabel as getStatusLabel
} from '@/utils/monitorStatus'

type EnrichedAlert = {
  id: number
  pointId: number
  level: string
  message: string
  time: number
  handled: boolean
  pointName: string
  coords: { lat: number; lng: number }
  pointStatus: string
  pointTemp: number | string
  pointSoilMoisture: number | string
}

type LevelFilterKey = 'all' | 'high' | 'medium' | 'low'

const ALERT_PAGE_SIZE = 6

const dataStore = useDataStore()
const remoteStore = useRemoteSensingStore()
const { disclaimer: treatmentDisclaimer } = useTreatmentGuide()

const alertPanelCollapsed = ref(false)
const levelFilter = ref<LevelFilterKey>('all')
const alertPage = ref(1)
const activeCollapseKeys = ref<string[]>([])

const unhandledAlerts = computed(() => {
  const pointsMap = new Map(dataStore.filteredMonitorPoints.map((p) => [p.id, p]))
  return dataStore.unhandledAlerts
    .map((alert) => {
      const point = pointsMap.get(alert.pointId)
      return {
        ...alert,
        pointName: point?.name || `未知监测点 #${alert.pointId}`,
        coords: point ? { lat: point.lat, lng: point.lng } : { lat: 0, lng: 0 },
        pointStatus: point?.status || 'unknown',
        pointTemp: point?.temp ?? 'N/A',
        pointSoilMoisture: point?.soilMoisture ?? 'N/A'
      }
    })
    .sort((a, b) => b.time - a.time)
})

function matchesLevelFilter(level: string, filter: LevelFilterKey): boolean {
  if (filter === 'all') return true
  const normalized = normalizeAlertLevel(level)
  if (filter === 'high') return normalized === 'critical' || normalized === 'high' || normalized === 'warning'
  if (filter === 'medium') return normalized === 'medium'
  if (filter === 'low') return normalized === 'low'
  return true
}

const filteredAlerts = computed(() =>
  unhandledAlerts.value.filter((alert) => matchesLevelFilter(alert.level, levelFilter.value))
)

const showAlertPagination = computed(() => filteredAlerts.value.length > ALERT_PAGE_SIZE)

const pagedAlerts = computed(() => {
  const start = (alertPage.value - 1) * ALERT_PAGE_SIZE
  return filteredAlerts.value.slice(start, start + ALERT_PAGE_SIZE)
})

const levelFilterOptions = computed(() => [
  { key: 'all' as const, label: '全部', count: unhandledAlerts.value.length },
  {
    key: 'high' as const,
    label: '高',
    count: unhandledAlerts.value.filter((a) => matchesLevelFilter(a.level, 'high')).length
  },
  {
    key: 'medium' as const,
    label: '中',
    count: unhandledAlerts.value.filter((a) => matchesLevelFilter(a.level, 'medium')).length
  },
  {
    key: 'low' as const,
    label: '低',
    count: unhandledAlerts.value.filter((a) => matchesLevelFilter(a.level, 'low')).length
  }
])

watch(filteredAlerts, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / ALERT_PAGE_SIZE))
  if (alertPage.value > maxPage) {
    alertPage.value = maxPage
  }
})

const selectedArea = ref<EnrichedAlert | null>(null)

function buildRuleSuggestions(area: EnrichedAlert): string[] {
  const suggestions: string[] = []
  const rawMessage = area.message
  const messageLower = rawMessage.toLowerCase()

  if (rawMessage.includes('[自动预警]')) {
    if (rawMessage.includes('土壤湿度') && rawMessage.includes('低于')) {
      suggestions.push('墒情持续偏低，建议按地块启动灌溉并复核传感器。')
    }
    if (rawMessage.includes('气温') && rawMessage.includes('超过')) {
      suggestions.push('高温已持续超标，建议启动喷雾/遮阴等田间降温预案。')
    }
    if (rawMessage.includes('偏高') || rawMessage.includes('涝')) {
      suggestions.push('墒情过高，注意排水，避免涝渍。')
    }
    if (suggestions.length) return suggestions
  }

  if (rawMessage.includes('[虫情风险]')) {
    suggestions.push('按预警中的风险因子安排巡田，优先复核高湿与降水窗口。')
    return suggestions
  }
  if (rawMessage.includes('[极端天气]')) {
    suggestions.push('按极端天气类型执行热害/防涝/防风预案，并提高未来 3 日巡查频次。')
    return suggestions
  }

  if (area.level === 'critical') {
    suggestions.push('最高优先级处理！立即通知所有相关应急负责人。')
  }
  if (area.level === 'high' || area.level === 'warning') {
    suggestions.push('高风险事件，建议2小时内响应。')
  }
  if (messageLower.includes('湿度') || (typeof area.pointSoilMoisture === 'number' && area.pointSoilMoisture < 20)) {
    suggestions.push(`目标区域土壤湿度为 ${area.pointSoilMoisture}%，建议立即启动远程灌溉系统。`)
  }
  if (messageLower.includes('温度') || (typeof area.pointTemp === 'number' && area.pointTemp > 35)) {
    suggestions.push(`目标区域温度已达 ${area.pointTemp}°C，建议启动田间降温预案（如喷雾）。`)
  }
  if (area.level === 'critical') {
    suggestions.push('评估是否需要疏散现场人员，确保安全。')
  }
  if (
    messageLower.includes('设备') ||
    messageLower.includes('通信') ||
    messageLower.includes('电量')
  ) {
    suggestions.push('派遣运维人员前往现场检修硬件设备。')
  }
  if (suggestions.length === 0) {
    suggestions.push('根据常规流程处理该事件。')
    suggestions.push('记录处理过程，并归档。')
  }
  return suggestions
}

const knowledgePanels = computed((): TreatmentPanel[] => {
  if (!selectedArea.value) return []
  const rawMessage = selectedArea.value.message
  if (!rawMessage.includes('[AI识别]')) return []
  const diseaseLabel = parseDiseaseFromAlert(rawMessage)
  if (!diseaseLabel) return []
  return buildTreatmentPanels(getTreatment(diseaseLabel))
})

const ruleSuggestions = computed(() => {
  if (!selectedArea.value) return []
  return buildRuleSuggestions(selectedArea.value)
})

const pestFactorLines = computed(() => {
  const area = selectedArea.value
  if (!area || !area.message.includes('[虫情风险]')) return []
  const field = remoteStore.fields.find((item) => Number(item.monitorPointId) === area.pointId)
  const prediction = remoteStore.pestPredictions.find((row) => row.fieldId === field?.id)
  return factorsFromAlert(area.message, prediction)
})

const suggestionCollapsePanels = computed((): TreatmentPanel[] => {
  const panels = [...knowledgePanels.value]
  const factors = pestFactorLines.value
  if (factors.length) {
    panels.push({ key: 'pest-factors', title: '风险因子', lines: factors })
  }
  const rules = ruleSuggestions.value
  if (rules.length) {
    panels.push({ key: 'linkage', title: '联动处置建议', lines: rules })
  }
  if (panels.length === 0) {
    panels.push({
      key: 'general',
      title: '通用处置',
      lines: ['根据常规流程处理该事件。', '记录处理过程，并归档。']
    })
  }
  return panels
})

const exportLines = computed(() => {
  const knowledge = flattenTreatmentPanels(knowledgePanels.value)
  const factors = pestFactorLines.value
  const rules = ruleSuggestions.value
  const extra = [
    ...factors.map((line) => `【风险因子】${line}`),
    ...rules.map((line) => `【联动处置建议】${line}`)
  ]
  if (extra.length) {
    return [...knowledge, ...extra]
  }
  return knowledge.length ? knowledge : ruleSuggestions.value
})

function resolveDefaultCollapseKeys(panels: TreatmentPanel[]): string[] {
  const keys: string[] = []
  if (panels.some((p) => p.key === 'pest-factors')) keys.push('pest-factors')
  if (panels.some((p) => p.key === 'linkage')) keys.push('linkage')
  if (panels.some((p) => p.key === 'chemical')) keys.push('chemical')
  else if (panels.some((p) => p.key === 'summary')) keys.push('summary')
  return keys.length ? keys : panels.slice(0, 1).map((p) => p.key)
}

function exportPlan() {
  if (!selectedArea.value || exportLines.value.length === 0) {
    message.warning('暂无建议可导出')
    return
  }

  const area = selectedArea.value
  const header = [
    '智慧决策方案',
    `监测点：${area.pointName}`,
    `预警：${area.message}`,
    `导出时间：${new Date().toLocaleString('zh-CN')}`,
    ''
  ].join('\n')
  const body = exportLines.value.map((line, index) => `${index + 1}. ${line}`).join('\n')
  const footer = `\n\n---\n${treatmentDisclaimer}`

  const blob = new Blob([`${header}${body}${footer}`], {
    type: 'text/plain;charset=utf-8'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `决策方案-${area.id}-${Date.now()}.txt`
  link.click()
  URL.revokeObjectURL(url)
  message.success('方案已导出')
}

const mapRef = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null

function syncDefaultSelection() {
  const all = unhandledAlerts.value
  const list = filteredAlerts.value

  if (all.length === 0) {
    selectedArea.value = null
    return
  }

  if (list.length === 0) {
    if (selectedArea.value && !all.some((alert) => alert.id === selectedArea.value!.id)) {
      selectedArea.value = null
    }
    return
  }

  const stillExists =
    selectedArea.value != null && list.some((alert) => alert.id === selectedArea.value!.id)
  if (!stillExists) {
    selectedArea.value = list[0]
  }
}

const selectArea = (area: EnrichedAlert) => {
  selectedArea.value = area
}

const getLevelColor = getAlertLevelColor
const getLevelText = getAlertLevelText

function renderMapMarkers() {
  if (!monitorLayer) return
  monitorLayer.render(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
}

function initMap() {
  if (!mapRef.value || map) return
  map = createLeafletBaseMap(mapRef.value, {
    center: [38.44, 115.95],
    zoom: 8,
    tile: 'gaodeSatellite'
  })
  monitorLayer = createMonitorPointLayer(map, { readonly: true })
  renderMapMarkers()
  invalidateLeafletSize(map)
}

function focusSelectedOnMap(area: EnrichedAlert) {
  if (!monitorLayer || !map) return
  monitorLayer.highlightPoint(area.pointId, { maxZoom: 14 })
  invalidateLeafletSize(map)
}

onMounted(async () => {
  await Promise.all([
    dataStore.fetchAlerts(),
    dataStore.fetchMonitorPoints(),
    remoteStore.fetchAll().catch(() => undefined)
  ])
  syncDefaultSelection()
})

onBeforeUnmount(() => {
  monitorLayer?.detach()
  monitorLayer = null
  removeLeafletMap(map)
  map = null
})

watch(levelFilter, () => {
  alertPage.value = 1
  syncDefaultSelection()
})

watch(unhandledAlerts, () => {
  syncDefaultSelection()
})

watch(selectedArea, (newArea) => {
  if (!newArea) return
  nextTick(() => {
    if (!map) initMap()
    if (map && monitorLayer) {
      focusSelectedOnMap(newArea)
    }
  })
})

watch(
  suggestionCollapsePanels,
  (panels) => {
    if (panels.length) {
      activeCollapseKeys.value = resolveDefaultCollapseKeys(panels)
    }
  },
  { immediate: true }
)

watch(
  () => dataStore.filteredMonitorPoints,
  () => {
    renderMapMarkers()
    if (selectedArea.value) {
      nextTick(() => focusSelectedOnMap(selectedArea.value!))
    }
  },
  { deep: true }
)

watch(
  () => dataStore.filteredAlerts,
  () => {
    monitorLayer?.updatePopups(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
  },
  { deep: true }
)

watch(
  () => dataStore.selectedRegion,
  () => {
    renderMapMarkers()
    syncDefaultSelection()
  }
)
</script>
```

## 模块 20：灾害实时监测页面
文件路径：src/views/user/MapVisualization.vue
对应说明书：4.4
```vue
<template>
  <AppLayout>
    <div class="content-wrapper glass-page map-page">
      <a-card
        class="map-card glass-ant-card"
        :bordered="false">
        <template #title>
          <div class="glass-card-title">地图 - 监测点实时分布</div>
        </template>
        <template #extra>
          <span class="map-region-hint">当前区域：{{ currentRegionLabel }}</span>
        </template>
        <div
          ref="mapRef"
          class="map-container"></div>
      </a-card>

      <a-card
        class="actions-card glass-ant-card"
        :bordered="false">
        <template #title>
          <div class="glass-card-title">地图操作</div>
        </template>
        <a-space>
          <a-button
            type="primary"
            @click="zoomToAll">
            缩放至全部
          </a-button>
          <a-button
            class="refresh-btn"
            @click="refreshData">
            刷新数据
          </a-button>
        </a-space>
      </a-card>
    </div>

    <a-drawer
      v-model:open="drawerOpen"
      :title="selectedPoint?.name || '监测站'"
      root-class-name="station-drawer"
      :width="480">
      <div class="station-status-row">
        <span
          class="station-online"
          :class="selectedPoint?.online === false ? 'is-offline' : 'is-online'">
          {{ selectedPoint?.online === false ? '离线' : '在线' }}
        </span>
        <span class="station-last-seen">最后上报 {{ formatLastSeen(selectedPoint?.lastSeenAt) }}</span>
      </div>
      <div class="station-metric-grid">
        <div class="station-metric">
          <span class="station-metric-label">气温</span>
          <span class="station-metric-value">{{ drawerTemp }} ℃</span>
        </div>
        <div class="station-metric">
          <span class="station-metric-label">湿度</span>
          <span class="station-metric-value">{{ drawerRh }}</span>
        </div>
        <div class="station-metric">
          <span class="station-metric-label">墒情</span>
          <span class="station-metric-value">{{ drawerVwc }} %</span>
        </div>
        <div class="station-metric">
          <span class="station-metric-label">土温</span>
          <span class="station-metric-value">{{ drawerSoilTemp }} ℃</span>
        </div>
      </div>
      <h4 class="station-table-title">近 7 日读数</h4>
      <a-table
        class="glass-ant-table"
        size="small"
        :pagination="false"
        :data-source="drawerRows"
        :columns="drawerColumns"
        row-key="id" />
    </a-drawer>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useDataStore } from '@/stores/data'
import AppLayout from '@/layouts/AppLayout.vue'
import {
  createLeafletBaseMap,
  invalidateLeafletSize,
  removeLeafletMap
} from '@/composables/useLeafletBase'
import { createMonitorPointLayer, type MonitorPointRecord } from '@/composables/useMonitorPointLayer'
import { getMonitorRegion } from '@/constants/monitorRegions'
import { fetchSensorReadings } from '@/api/rules'
import { last7DayRange, type SensorReading } from '@/utils/sensorReadings'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const dataStore = useDataStore()
const mapRef = ref<HTMLDivElement | null>(null)
const drawerOpen = ref(false)
const selectedPoint = ref<MonitorPointRecord | null>(null)
const drawerReadings = ref<SensorReading[]>([])

let map: L.Map | null = null
let monitorLayer: ReturnType<typeof createMonitorPointLayer> | null = null

const currentRegionLabel = computed(
  () => getMonitorRegion(dataStore.selectedRegion).label
)

const liveReading = computed(() =>
  selectedPoint.value ? dataStore.getWeatherReadingByPointId(selectedPoint.value.id) : undefined
)

const drawerTemp = computed(() => liveReading.value?.airTemp ?? selectedPoint.value?.temp ?? '—')
const drawerRh = computed(() =>
  liveReading.value ? `${liveReading.value.airRh} %RH` : '—'
)
const drawerVwc = computed(
  () => liveReading.value?.soilVwc ?? selectedPoint.value?.soilMoisture ?? '—'
)
function soilTempOf(row?: { soilTemp10cm?: number; soilTemp10Cm?: number } | null) {
  if (!row) return undefined
  const value = row.soilTemp10cm ?? row.soilTemp10Cm
  return value != null && Number.isFinite(Number(value)) ? Number(value) : undefined
}

const drawerSoilTemp = computed(() => {
  const live = soilTempOf(liveReading.value)
  if (live != null) return live
  const rows = drawerReadings.value
  return soilTempOf(rows[rows.length - 1]) ?? '—'
})

const drawerRows = computed(() =>
  drawerReadings.value.map((row) => ({
    ...row,
    date: String(row.recordedAt).slice(0, 10),
    soilTemp10cm: soilTempOf(row)
  }))
)

const drawerColumns = [
  { title: '日期', dataIndex: 'date', key: 'date' },
  { title: '气温 ℃', dataIndex: 'airTemp', key: 'airTemp' },
  { title: '湿度', dataIndex: 'airRh', key: 'airRh' },
  { title: '墒情 %', dataIndex: 'soilVwc', key: 'soilVwc' },
  { title: '土温 ℃', dataIndex: 'soilTemp10cm', key: 'soilTemp10cm' }
]

function formatLastSeen(value?: string) {
  if (!value) return '暂无'
  return String(value).replace('T', ' ').replace(/\+.*/, '')
}

async function openPointDrawer(point: MonitorPointRecord) {
  selectedPoint.value = point
  drawerOpen.value = true
  const { from, to } = last7DayRange()
  try {
    const res = await fetchSensorReadings(point.id, from, to)
    drawerReadings.value = res.data || []
  } catch {
    drawerReadings.value = []
  }
}

function renderMarkers() {
  if (!monitorLayer || !map) return
  monitorLayer.render(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
  zoomToAll()
}

async function initMap() {
  if (!mapRef.value) return
  const region = getMonitorRegion(dataStore.selectedRegion)
  map = createLeafletBaseMap(mapRef.value, {
    center: region.center,
    zoom: region.zoom,
    tile: 'gaodeSatellite'
  })

  monitorLayer = createMonitorPointLayer(map, {
    onSelectPoint: (point) => {
      void openPointDrawer(point)
    },
    onTriggerAlert: async (p) => {
      try {
        await dataStore.createAlert({
          pointId: p.id,
          level: 'medium',
          message: `手动触发：${p.name} 状态异常`
        })
      } catch {
        message.error('触发预警失败')
        throw new Error('trigger failed')
      }
    },
    onResolveAlert: async (p) => {
      const unhandled = dataStore.unhandledAlerts.find((a) => a.pointId === p.id)
      if (!unhandled) {
        message.info('该点暂无未处理预警')
        return false
      }
      try {
        await dataStore.updateAlert(unhandled.id, { handled: true })
        return true
      } catch {
        message.error('关闭预警失败')
        return false
      }
    }
  })

  invalidateLeafletSize(map)
}

async function refreshData() {
  message.loading({ content: '正在刷新数据...', key: 'refresh' })
  await Promise.all([
    dataStore.fetchMonitorPoints(),
    dataStore.fetchAlerts(),
    dataStore.fetchWeatherReadings().catch(() => {
      message.warning('气象读数加载失败，请检查 Mock 服务')
    })
  ])
  message.success({ content: '数据已更新！', key: 'refresh', duration: 2 })
}

function zoomToAll() {
  if (!monitorLayer || !map) return
  const layers = monitorLayer.cluster.getLayers()
  if (layers.length > 0) {
    const group = L.featureGroup(layers as L.Layer[])
    map.fitBounds(group.getBounds().pad(0.2))
    return
  }
  const region = getMonitorRegion(dataStore.selectedRegion)
  map.setView(region.center, region.zoom)
}

onMounted(async () => {
  await initMap()
  await refreshData()
  renderMarkers()

  watch(() => dataStore.filteredMonitorPoints, renderMarkers, { deep: true })
  watch(() => dataStore.selectedRegion, renderMarkers)

  watch(
    () => dataStore.filteredAlerts,
    () => {
      monitorLayer?.updatePopups(dataStore.filteredMonitorPoints, dataStore.filteredAlerts)
    },
    { deep: true }
  )
})

onBeforeUnmount(() => {
  monitorLayer?.detach()
  monitorLayer = null
  removeLeafletMap(map)
  map = null
})
</script>
```
