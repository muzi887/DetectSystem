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
