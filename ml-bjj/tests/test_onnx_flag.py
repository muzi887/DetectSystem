import os

from inference import use_onnx


def test_default_does_not_require_onnx(monkeypatch):
    monkeypatch.delenv("ML_BJJ_ONNX", raising=False)
    assert os.environ.get("ML_BJJ_ONNX") != "1"
    assert use_onnx() is False
