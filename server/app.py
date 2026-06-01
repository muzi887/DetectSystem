from flask import Flask, request, jsonify
from flask_cors import CORS
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path

app = Flask(__name__)
CORS(app)

CROP_DISEASE_LABELS = {
    "peach": ["桃疮痂病", "桃褐腐病", "桃缩叶病", "健康"],
    "apple": ["苹果腐烂病", "苹果轮纹病", "健康"],
    "wheat": ["小麦锈病", "小麦赤霉病", "健康"],
    "rice": ["稻瘟病", "纹枯病", "健康"]
}

SUPPORTED_CROPS = {
    "peach": "桃",
    "apple": "苹果",
    "wheat": "小麦",
    "rice": "水稻"
}

CONFIDENCE_THRESHOLD = 0.82
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@dataclass
class ImageSample:
    filename: str
    crop_type: str
    category: str
    size_kb: float
    digest: str


def normalize_crop_type(crop_type):
    return crop_type if crop_type in SUPPORTED_CROPS else "unknown"


def preprocess_image_sample(image_file, crop_type, category):
    filename = image_file.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError("仅支持 JPG、PNG、WEBP 格式图片")

    raw = image_file.read()
    image_file.stream.seek(0)
    if not raw:
        raise ValueError("图片内容为空")

    return ImageSample(
        filename=filename,
        crop_type=normalize_crop_type(crop_type),
        category=category or "general",
        size_kb=round(len(raw) / 1024, 2),
        digest=sha256(raw).hexdigest()
    )


def extract_agri_features(sample):
    digest_value = int(sample.digest[:8], 16)
    spot_score = (digest_value % 100) / 100
    texture_score = ((digest_value // 100) % 100) / 100
    moisture_hint = "偏湿" if texture_score > 0.66 else "偏干" if texture_score < 0.33 else "适中"
    return {
        "spotScore": round(spot_score, 2),
        "textureScore": round(texture_score, 2),
        "moistureHint": moisture_hint,
        "fileSizeKb": sample.size_kb
    }


def classify_crop_disaster(sample, features):
    labels = CROP_DISEASE_LABELS.get(sample.crop_type, ["未知病害"])
    label_index = int(sample.digest[-4:], 16) % len(labels)
    result = labels[label_index]
    confidence = round(0.78 + features["spotScore"] * 0.18, 2)

    if result == "健康" and confidence < CONFIDENCE_THRESHOLD:
        confidence = CONFIDENCE_THRESHOLD

    level = "low" if result == "健康" else "high" if confidence >= 0.9 else "medium"
    return {
        "result": result,
        "confidence": min(confidence, 0.98),
        "level": level,
        "isReliable": confidence >= CONFIDENCE_THRESHOLD
    }


def build_agri_advice(sample, classification, features):
    if classification["result"] == "健康":
        return "图像未触发明显病害特征，建议保持常规巡检并继续留存样本。"
    crop_name = SUPPORTED_CROPS.get(sample.crop_type, "作物")
    if features["moistureHint"] == "偏湿":
        return f"{crop_name}样本疑似 {classification['result']}，同时纹理提示偏湿，建议加强通风排湿并复核田间积水。"
    if features["moistureHint"] == "偏干":
        return f"{crop_name}样本疑似 {classification['result']}，建议结合土壤湿度数据判断是否需要补水和病斑复查。"
    return f"{crop_name}样本疑似 {classification['result']}，建议农技员现场复核后决定是否生成高等级预警。"


def run_ai_model_prediction(image_file, crop_type, category=""):
    sample = preprocess_image_sample(image_file, crop_type, category)
    features = extract_agri_features(sample)
    classification = classify_crop_disaster(sample, features)
    advice = build_agri_advice(sample, classification, features)
    return sample, features, classification, advice



@app.route('/api/analysis/image', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "未找到文件"}), 400

    file = request.files['file']
    crop_type = request.form.get('cropType', 'unknown')
    category = request.form.get('category', '')

    if file.filename == '':
        return jsonify({"error": "文件名为空"}), 400

    try:
        sample, features, classification, advice = run_ai_model_prediction(file, crop_type, category)
        return jsonify({
            "code": 200,
            "message": "success",
            "result": classification["result"],
            "confidence": classification["confidence"],
            "level": classification["level"],
            "advice": advice,
            "details": {
                "received_crop": sample.crop_type,
                "crop_label": SUPPORTED_CROPS.get(sample.crop_type, "未知作物"),
                "category": category,
                "features": features,
                "isReliable": classification["isReliable"],
                "note": "Mock 按预处理、特征提取、分类规则生成结果"
            }
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "服务器内部错误", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
