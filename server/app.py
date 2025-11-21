from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import random

app = Flask(__name__)

# 1. 启用 CORS，允许前端(通常是 localhost:5173 或 8080) 访问
CORS(app)

# 模拟的 AI 字典，用于没有真实模型时返回假数据测试
MOCK_RESULTS = {
    "peach": ["桃疮痂病", "桃褐腐病", "桃缩叶病", "健康"],
    "apple": ["苹果腐烂病", "苹果轮纹病", "健康"],
    "wheat": ["小麦锈病", "小麦赤霉病"],
    "rice": ["稻瘟病", "纹枯病"]
}

def run_ai_model_prediction(image_file, crop_type):
    """
    【核心部分】在这里调用你的真实 AI 模型
    """
    # 1. 如果你的模型需要文件路径，先保存文件
    # save_path = os.path.join('uploads', image_file.filename)
    # image_file.save(save_path)
    
    # 2. 如果你的模型支持直接读取内存流 (例如 PyTorch/TensorFlow)
    # from PIL import Image
    # img = Image.open(image_file)
    # tensor = transform(img)
    # output = model(tensor)
    
    # --- 这里是模拟的逻辑 ---
    print(f"正在处理图片: {image_file.filename}, 作物类型: {crop_type}")
    
    # 模拟计算耗时
    time.sleep(1) 
    
    # 随机返回一个结果
    possible_diseases = MOCK_RESULTS.get(crop_type, ["未知病害"])
    result_text = random.choice(possible_diseases)
    confidence_score = round(random.uniform(0.85, 0.99), 2)
    
    return result_text, confidence_score

@app.route('/api/analysis/image', methods=['POST'])
def analyze_image():
    # 1. 检查是否有文件
    if 'file' not in request.files:
        return jsonify({"error": "未找到文件"}), 400
    
    file = request.files['file']
    
    # 2. 获取其他表单字段 (对应前端 formState)
    # request.form 字典中包含所有非文件字段
    crop_type = request.form.get('cropType', 'unknown')
    additional_info = request.form.get('additionalInfo', '')
    category = request.form.get('category', '')

    if file.filename == '':
        return jsonify({"error": "文件名为空"}), 400

    try:
        # 3. 调用 AI 处理逻辑
        result, confidence = run_ai_model_prediction(file, crop_type)

        # 4. 返回 JSON 响应
        response_data = {
            "code": 200,
            "message": "success",
            "result": result,
            "confidence": confidence,
            "details": {
                "received_crop": crop_type,
                "note": "分析完成"
            }
        }
        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "服务器内部错误", "details": str(e)}), 500

if __name__ == '__main__':
    # host='0.0.0.0' 表示允许局域网内的任何设备访问
    app.run(debug=True, port=5000, host='0.0.0.0')
    
    # 确保上传文件夹存在（如果需要保存图片）
    # os.makedirs('uploads', exist_ok=True)
    
    print("后端服务器启动: http://127.0.0.1:5000")
    app.run(debug=True, port=5000)