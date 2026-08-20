from io import BytesIO

from PIL import Image

from inference import PredictResult


class FakeBlast:
    def predict_detailed(self, image, crop_type="unknown"):
        topk = [{"label": "稻瘟病", "confidence": 0.85}, {"label": "健康", "confidence": 0.10}]
        return PredictResult("稻瘟病", 0.85, topk, False)


def _jpeg() -> BytesIO:
    buf = BytesIO()
    Image.new("RGB", (8, 8), color=(1, 2, 3)).save(buf, format="JPEG")
    buf.seek(0)
    return buf


def test_analyze_promotes_level_with_humidity(monkeypatch):
    import app as serving_app

    monkeypatch.setattr(serving_app, "use_mock", lambda: False)
    monkeypatch.setattr(serving_app, "get_classifier", lambda: FakeBlast())
    monkeypatch.setattr(
        serving_app,
        "load_model_meta",
        lambda: {"classes": ["稻瘟病"], "trained_at": "x", "best_val_acc": 0.9},
    )
    res = serving_app.app.test_client().post(
        "/api/analysis/image",
        data={"cropType": "rice", "airRh": "90", "file": (_jpeg(), "a.jpg", "image/jpeg")},
        content_type="multipart/form-data",
    )
    body = res.get_json()
    assert body["level"] == "high"
    assert body["env_context"]["reasons"]
