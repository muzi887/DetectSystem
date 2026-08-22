from inference import PredictResult


class FakeClassifier:
    classes = ["健康", "小麦锈病", "稻瘟病"]

    def predict_detailed(self, image, crop_type="unknown"):
        if crop_type == "wheat":
            topk = [
                {"label": "小麦锈病", "confidence": 0.92},
                {"label": "健康", "confidence": 0.06},
                {"label": "稻瘟病", "confidence": 0.02},
            ]
            return PredictResult("小麦锈病", 0.92, topk, False)
        topk = [
            {"label": "稻瘟病", "confidence": 0.51},
            {"label": "水稻褐斑病", "confidence": 0.44},
            {"label": "健康", "confidence": 0.05},
        ]
        return PredictResult("稻瘟病", 0.51, topk, True)


def test_health_shape(monkeypatch):
    import app as serving_app

    monkeypatch.setattr(serving_app, "use_mock", lambda: True)
    client = serving_app.app.test_client()
    res = client.get("/health")
    assert res.status_code == 200
    body = res.get_json()
    assert body["status"] == "ok"
    assert "classes_count" in body
    assert "model_version" in body
    assert "engine" in body


def test_analyze_includes_topk_and_treatment(monkeypatch):
    import app as serving_app
    from io import BytesIO
    from PIL import Image

    monkeypatch.setattr(serving_app, "use_mock", lambda: False)
    monkeypatch.setattr(serving_app, "get_classifier", lambda: FakeClassifier())
    monkeypatch.setattr(serving_app, "load_model_meta", lambda: {
        "trained_at": "2026-08-20 00:00:00",
        "best_val_acc": 0.9,
        "classes": FakeClassifier.classes,
    })

    buf = BytesIO()
    Image.new("RGB", (8, 8), color=(10, 80, 10)).save(buf, format="JPEG")
    buf.seek(0)
    res = serving_app.app.test_client().post(
        "/api/analysis/image",
        data={"cropType": "wheat", "category": "pest", "file": (buf, "leaf.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["result"] == "小麦锈病"
    assert body["needs_review"] is False
    assert len(body["topk"]) == 3
    assert body["treatment"]["crop"] == "小麦"
    assert body["details"]["engine"] == "bjj-23"
    assert body["details"]["isReliable"] is True


def test_analyze_rejects_peach_and_apple(monkeypatch):
    import app as serving_app
    from io import BytesIO
    from PIL import Image

    monkeypatch.setattr(serving_app, "use_mock", lambda: True)
    buf = BytesIO()
    Image.new("RGB", (8, 8), color=(10, 80, 10)).save(buf, format="JPEG")
    buf.seek(0)
    res = serving_app.app.test_client().post(
        "/api/analysis/image",
        data={"cropType": "peach", "category": "pest", "file": (buf, "leaf.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 400
    assert "桃" in (res.get_json() or {}).get("error", "")


def test_mock_rice_stays_in_rice_classes(monkeypatch):
    import app as serving_app
    from crop_filter import CROP_CLASS_GROUPS
    from io import BytesIO
    from PIL import Image

    monkeypatch.setattr(serving_app, "use_mock", lambda: True)
    buf = BytesIO()
    Image.new("RGB", (8, 8), color=(10, 80, 10)).save(buf, format="JPEG")
    buf.seek(0)
    res = serving_app.app.test_client().post(
        "/api/analysis/image",
        data={"cropType": "rice", "category": "pest", "file": (buf, "leaf.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    assert res.status_code == 200
    body = res.get_json()
    assert body["result"] in CROP_CLASS_GROUPS["rice"]
    assert body["treatment"]["crop"] in {"水稻", "通用"}


def test_treatments_rice_blast_and_neck_blast():
    import app as serving_app

    for label in ("稻瘟病", "稻颈瘟"):
        res = serving_app.app.test_client().get(f"/api/treatments/{label}")
        assert res.status_code == 200
        body = res.get_json()
        assert body["found"] is True
        assert body["item"]["crop"] == "水稻"


def test_treatments_unifies_wheat_rust_alias():
    import app as serving_app

    res = serving_app.app.test_client().get("/api/treatments/小麦条锈病")
    assert res.status_code == 200
    body = res.get_json()
    assert body["found"] is True
    assert body["label"] == "小麦锈病"
    assert body["item"]["crop"] == "小麦"


def test_treatments_label_route():
    import app as serving_app

    res = serving_app.app.test_client().get("/api/treatments/稻瘟病")
    assert res.status_code == 200
    body = res.get_json()
    assert body["found"] is True
    assert body["item"]["crop"] == "水稻"
