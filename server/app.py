from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
CORS(app)

MOCK_RESULTS = {
    "peach": ["桃疮痂病", "桃褐腐病", "桃缩叶病", "健康"],
    "apple": ["苹果腐烂病", "苹果轮纹病", "健康"],
    "wheat": ["小麦锈病", "小麦赤霉病"],
    "rice": ["稻瘟病", "纹枯病"]
}


def run_ai_model_prediction(image_file, crop_type):
    print(f"分析: {image_file.filename}, 作物={crop_type}")
    time.sleep(1)
    possible = MOCK_RESULTS.get(crop_type, ["未知病害"])
    return random.choice(possible), round(random.uniform(0.85, 0.99), 2)


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
        result, confidence = run_ai_model_prediction(file, crop_type)
        return jsonify({
            "code": 200,
            "message": "success",
            "result": result,
            "confidence": confidence,
            "details": {
                "received_crop": crop_type,
                "category": category,
                "note": "分析完成"
            }
        }), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "服务器内部错误", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
