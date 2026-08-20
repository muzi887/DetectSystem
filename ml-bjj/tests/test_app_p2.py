from io import BytesIO
from pathlib import Path

from PIL import Image

from inference import PredictResult


class FakeClassifier:
    def predict_detailed(self, image, crop_type="unknown"):
        topk = [
            {"label": "稻瘟病", "confidence": 0.91},
            {"label": "健康", "confidence": 0.06},
            {"label": "水稻褐斑病", "confidence": 0.03},
        ]
        return PredictResult("稻瘟病", 0.91, topk, False)


def _jpeg() -> BytesIO:
    buf = BytesIO()
    Image.new("RGB", (8, 8), color=(10, 80, 10)).save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_analyze_persists_record(monkeypatch, tmp_path: Path):
    import app as serving_app

    store = tmp_path / "records.json"
    monkeypatch.setattr(serving_app, "use_mock", lambda: False)
    monkeypatch.setattr(serving_app, "get_classifier", lambda: FakeClassifier())
    monkeypatch.setattr(serving_app, "records_path", lambda: store)
    monkeypatch.setattr(
        serving_app,
        "load_model_meta",
        lambda: {"trained_at": "2026-08-20", "best_val_acc": 0.9, "classes": ["稻瘟病"]},
    )
    res = serving_app.app.test_client().post(
        "/api/analysis/image",
        data={"cropType": "rice", "pointId": "1", "category": "pest", "file": (_jpeg(), "leaf.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["recordId"] == 1
    listed = serving_app.app.test_client().get("/api/analysis/recent?limit=5")
    assert listed.status_code == 200
    assert listed.get_json()["records"][0]["label"] == "稻瘟病"
    assert listed.get_json()["records"][0]["pointId"] == 1


def test_stats_endpoint(monkeypatch, tmp_path: Path):
    import app as serving_app
    from analysis_store import append_record

    store = tmp_path / "records.json"
    append_record(store, {"label": "稻瘟病", "confidence": 0.9, "cropType": "rice"})
    monkeypatch.setattr(serving_app, "records_path", lambda: store)
    res = serving_app.app.test_client().get("/api/analysis/stats")
    assert res.status_code == 200
    assert res.get_json()["total"] == 1
    assert res.get_json()["counts"][0]["label"] == "稻瘟病"


def test_feedback_writes_hard_case(monkeypatch, tmp_path: Path):
    import app as serving_app
    from analysis_store import append_record

    store = tmp_path / "records.json"
    pending = tmp_path / "hard_cases" / "pending"
    row = append_record(store, {"label": "水稻褐斑病", "confidence": 0.55, "cropType": "rice"})
    monkeypatch.setattr(serving_app, "records_path", lambda: store)
    monkeypatch.setattr(serving_app, "hard_cases_pending_root", lambda: pending)

    res = serving_app.app.test_client().post(
        "/api/analysis/feedback",
        data={
            "correctedLabel": "稻瘟病",
            "recordId": str(row["id"]),
            "file": (_jpeg(), "wrong.jpg", "image/jpeg"),
        },
        content_type="multipart/form-data",
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["ok"] is True
    saved = Path(body["savedPath"])
    assert saved.is_file()
    assert "稻瘟病" in str(saved)
    updated = serving_app.app.test_client().get("/api/analysis/history").get_json()
    assert updated["records"][0]["correctedLabel"] == "稻瘟病"
