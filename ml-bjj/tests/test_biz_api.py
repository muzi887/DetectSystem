from __future__ import annotations

import pytest


@pytest.fixture
def biz_client(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'biz.db'}")
    monkeypatch.setenv("ML_BJJ_DISABLE_SCHEDULER", "1")
    monkeypatch.setenv("ML_BJJ_USE_MOCK", "1")
    import db as serving_db
    from models import Alert, Base, MonitorPoint, User, WeatherReading

    serving_db.reset_engine_cache()
    Base.metadata.create_all(serving_db.get_engine())
    with serving_db.session_scope() as session:
        session.add(User(id=1, phone="13800000000", name="测试用户", password="123456", role="user"))
        session.add(MonitorPoint(id=2, name="监测站 · 雄县", region="jjj", lat=38.99, lng=116.1, soil_moisture=12))
        session.add(
            WeatherReading(id=1, point_id=2, air_temp=26, soil_vwc=12.8, soil_temp10cm=26.2)
        )
        session.add(Alert(id=1, point_id=2, message="old", time=100, handled=False, draft=False))
        session.add(Alert(id=2, point_id=2, message="new", time=200, handled=False, draft=False))
    import app as serving_app

    serving_app.app.config["MODEL_READY"] = False
    yield serving_app.app.test_client()
    serving_app.app.config["MODEL_READY"] = True


def test_login_wrong_password(biz_client):
    res = biz_client.post("/login", json={"phone": "13800000000", "password": "bad", "role": "admin"})
    assert res.status_code == 401


def test_login_demo_code(biz_client):
    res = biz_client.post("/login", json={"phone": "13800000000", "code": "2026", "role": "admin"})
    assert res.status_code == 200
    body = res.get_json()
    assert body["code"] == 200
    assert body["user"]["phone"] == "13800000000"


def test_alerts_sort_desc(biz_client):
    res = biz_client.get("/alerts?_sort=time&_order=desc")
    assert res.status_code == 200
    rows = res.get_json()
    assert [row["time"] for row in rows] == [200, 100]


def test_monitor_points(biz_client):
    res = biz_client.get("/monitorPoints")
    assert res.status_code == 200
    assert res.get_json()[0]["name"] == "监测站 · 雄县"


def test_weather_reading_soil_temp_camel(biz_client):
    res = biz_client.get("/weatherReadings")
    assert res.status_code == 200
    row = res.get_json()[0]
    assert row["soilTemp10cm"] == 26.2
    assert "soilTemp10Cm" not in row


def test_missing_database_url_login(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("ML_BJJ_DISABLE_SCHEDULER", "1")
    import db as serving_db
    import app as serving_app

    serving_db.reset_engine_cache()
    res = serving_app.app.test_client().post("/login", json={"phone": "13800000000", "code": "2026"})
    assert res.status_code == 503
    assert "未配置数据库" in res.get_json()["message"]


def test_model_not_ready_analyze(biz_client, monkeypatch):
    import app as serving_app

    monkeypatch.setattr(serving_app, "use_mock", lambda: False)
    serving_app.app.config["MODEL_READY"] = False
    res = serving_app.app.test_client().post("/api/analysis/image")
    assert res.status_code == 503
