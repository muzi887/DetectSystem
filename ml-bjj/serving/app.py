"""
v3 推理 HTTP 服务（Flask · 端口 5000）。

启动（项目根 DetectSystem）：
  ml-bjj\\.venv\\Scripts\\Activate.ps1
  python ml-bjj\\serving\\app.py
"""

from __future__ import annotations

import os
import sys
from hashlib import sha256
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image

SERVE_DIR = Path(__file__).resolve().parent
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))

from inference import get_classifier, resolve_weights_path  # noqa: E402

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


def use_mock() -> bool:
    return os.environ.get("ML_BJJ_USE_MOCK", "0") == "1"


def validate_upload(file) -> None:
    filename = file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("仅支持 JPG、PNG、WEBP 格式图片")
    raw = file.read()
    file.stream.seek(0)
    if not raw:
        raise ValueError("图片内容为空")


def mock_predict(file, crop_type: str) -> tuple[str, float]:
    raw = file.read()
    file.stream.seek(0)
    digest = sha256(raw).hexdigest()
    mock_labels = ["健康", "小麦锈病", "小麦赤霉病", "玉米大斑病", "番茄早疫病"]
    idx = int(digest[-4:], 16) % len(mock_labels)
    conf = round(0.78 + (int(digest[:4], 16) % 100) / 500, 4)
    return mock_labels[idx], min(conf, 0.98)


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
            result, confidence = mock_predict(file, crop_type)
            engine = "mock"
        else:
            img = Image.open(file.stream)
            result, confidence = get_classifier().predict(img)
            engine = "v3"

        level = classify_level(result, confidence)
        is_reliable = confidence >= 0.7

        return jsonify(
            {
                "code": 200,
                "message": "success",
                "result": result,
                "confidence": confidence,
                "level": level,
                "details": {
                    "received_crop": crop_type,
                    "crop_label": CROP_LABELS.get(crop_type, "未知作物"),
                    "category": category,
                    "additionalInfo": additional_info,
                    "isReliable": is_reliable,
                    "engine": engine,
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
    return jsonify({"status": "ok", "mock": use_mock()}), 200


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

    print(f"[ml-bjj] 推理服务: http://127.0.0.1:{port}/api/analysis/image")
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    main()
