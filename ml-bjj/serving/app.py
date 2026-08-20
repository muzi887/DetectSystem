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
from datetime import datetime
from hashlib import sha256
from pathlib import Path

import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

SERVE_DIR = Path(__file__).resolve().parent
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))

from crop_filter import CANONICAL_CLASSES, classes_for_crop  # noqa: E402
from inference import PredictResult, get_classifier, resolve_weights_path  # noqa: E402
from knowledge import get_treatment_item, load_catalog  # noqa: E402
from predict_utils import needs_review, rank_topk  # noqa: E402

app = Flask(__name__)
CORS(app)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
CROP_LABELS = {
    "wheat": "小麦",
    "corn": "玉米",
    "tomato": "番茄",
    "peach": "桃",
    "apple": "苹果",
    "rice": "水稻",
}
META_PATH = Path(__file__).resolve().parents[1] / "models" / "pest-cls-meta.json"


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


@app.route("/api/analysis/image", methods=["POST"])
def analyze_image():
    if "file" not in request.files:
        return jsonify({"error": "未找到文件"}), 400

    file = request.files["file"]
    crop_type = request.form.get("cropType", "unknown")
    category = request.form.get("category", "")
    additional_info = request.form.get("additionalInfo", "")

    if file.filename == "":
        return jsonify({"error": "文件名为空"}), 400

    try:
        validate_upload(file)

        if use_mock():
            pred = mock_predict(file, crop_type)
        else:
            img = Image.open(file.stream)
            pred = get_classifier().predict_detailed(img, crop_type)

        level = classify_level(pred.label, pred.confidence)
        treatment, _found = get_treatment_item(pred.label)
        meta = load_model_meta()

        return jsonify(
            {
                "code": 200,
                "message": "success",
                "result": pred.label,
                "confidence": pred.confidence,
                "level": level,
                "topk": pred.topk,
                "needs_review": pred.needs_review,
                "model_version": model_version_payload(meta),
                "treatment": treatment,
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
        ), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "服务器内部错误", "details": str(e)}), 500


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


@app.route("/api/treatments", methods=["GET"])
def treatments_all():
    return jsonify(load_catalog()), 200


@app.route("/api/treatments/<label>", methods=["GET"])
def treatments_one(label: str):
    item, found = get_treatment_item(label)
    return jsonify({"label": label, "found": found, "item": item}), 200


def main() -> None:
    port = int(os.environ.get("ML_BJJ_PORT", "5000"))
    weights = resolve_weights_path()

    if use_mock():
        print("[ml-bjj] ML_BJJ_USE_MOCK=1，使用 Mock 推理")
    else:
        if not weights.is_file():
            raise SystemExit(f"找不到模型权重: {weights}")
        print(f"[ml-bjj] 加载模型: {weights}")
        clf = get_classifier()
        print(f"[ml-bjj] 模型就绪，{len(clf.classes)} 类: {', '.join(clf.classes)}")
        meta_classes = load_model_meta().get("classes") or []
        if meta_classes and list(clf.classes) != list(meta_classes):
            raise SystemExit(
                f"权重 classes 与 pest-cls-meta.json 不一致: {len(clf.classes)} vs {len(meta_classes)}"
            )
        if len(clf.classes) != 23:
            raise SystemExit(f"期望 23 类，实际 {len(clf.classes)}: {clf.classes}")

    print(f"[ml-bjj] 推理服务: http://127.0.0.1:{port}/api/analysis/image")
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    main()
