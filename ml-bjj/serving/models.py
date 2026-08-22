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
