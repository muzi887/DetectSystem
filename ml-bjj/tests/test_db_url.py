from __future__ import annotations

import pytest


def test_missing_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    import db as serving_db

    serving_db.reset_engine_cache()
    with pytest.raises(serving_db.DatabaseNotConfigured) as exc:
        serving_db.get_engine()
    assert "未配置数据库" in str(exc.value)


def test_snake_to_camel_digit_in_segment():
    from models import snake_to_camel

    assert snake_to_camel("soil_temp10cm") == "soilTemp10cm"
    assert snake_to_camel("point_id") == "pointId"
    assert snake_to_camel("hourly_rain") == "hourlyRain"


def test_sqlite_create_all(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
    import db as serving_db
    from models import Base, MonitorPoint, User

    serving_db.reset_engine_cache()
    engine = serving_db.get_engine()
    Base.metadata.create_all(engine)
    with serving_db.session_scope() as session:
        session.add(User(id=1, phone="13800000000", name="测试用户", password="123456", role="user"))
        session.add(
            MonitorPoint(id=2, name="监测站 · 雄县", region="jjj", lat=38.994, lng=116.1077)
        )
        session.flush()
        assert session.get(User, 1).phone == "13800000000"
        assert session.get(MonitorPoint, 2).name == "监测站 · 雄县"
