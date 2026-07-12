# 阶段 A：v3 模型接入网站（实施方案）

> 承接 `[../下一阶段任务与流程.md](../下一阶段任务与流程.md)` §三，为 **编码与联调** 的详细规格。  
> v3 模型与抽测见 `[../模型/AI模型能力与本土化测试说明.md](../模型/AI模型能力与本土化测试说明.md)`。  
> **模型如何被网站调用**：见 **[§三 模型调用原理](#三模型调用原理必读)**。  
> **三终端怎么开**：见 `[项目启动说明.md](./项目启动说明.md)`。  
> **当前基准日**：2026-07-09 · **状态**：✅ 已完成（2026-07-09）

---

## 一、目标与完成标志

### 1.1 目标

用户在「智能分析」页上传叶片照片 → 后端加载 **v3** `pest-cls-best.pt` 推理 → 返回中文病名与置信度 → 自动写入预警中心（现有前端逻辑已支持）。

### 1.2 完成标志

- 网站上传一张 v3 验证集图，结果与 `ml-bjj/scripts/predict.py` 一致（如小麦锈病、玉米大斑病）  
- 识别后预警中心出现 `[AI识别]` 记录  
- 答辩可演示「京津冀 8 类真实模型，非 Mock」

---

## 二、架构

```text
DataAnalysis.vue
    POST /api/analysis/image
         ↓（Vite 代理，见 vite.config.ts）
    http://127.0.0.1:5000/api/analysis/image
         ↓
    ml-bjj/serving/app.py
         ↓
    ml-bjj/serving/inference.py
         ↓
    ml-bjj/models/pest-cls-best.pt（v3 · 8 类）
```

```text
┌─────────────────────────────────────────────────────────────┐
│  浏览器  http://127.0.0.1:5173/analysis                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ POST /api/analysis/image
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Vite 代理（vite.config.ts）                                  │
│    /api/analysis  → 127.0.0.1:5000                           │
│    /api/*         → localhost:3000（json-server Mock）        │
└───────────────┬─────────────────────────────┬─────────────────┘
                │                             │
                ▼                             ▼
   ml-bjj/serving/app.py              pnpm run mock
   （Flask · 5000 · 真实 AI）          （登录/预警/监测点等）
                │
                ▼
   ml-bjj/serving/inference.py
   加载 pest-cls-best.pt · EfficientNet-B0 · 8 类
```

> 项目根 `server/app.py` 为 **旧 Mock**（按文件 hash 伪随机出结果）。现已由 `ml-bjj/serving/app.py` 占用 5000 端口；**勿再启动** `server/app.py`。

### 2.1 三进程分工

| 进程 | 端口 | 命令 | 是否加载 `.pt` |
|------|------|------|----------------|
| 前端 Vue | **5173** | `pnpm dev` | ❌ 浏览器跑不了 PyTorch |
| Mock 后端 | **3000** | `pnpm run mock` | ❌ 只管登录/预警/监测点 |
| v3 推理服务 | **5000** | `python ml-bjj/serving/app.py` | ✅ **唯一加载权重的地方** |

**一句话**：训练好的 `pest-cls-best.pt` 只在 **5000 端口的 Python 进程**里；网站通过 **HTTP 上传图片 → Flask 推理 → JSON 返回** 间接调用模型，前端 never 直接读 `.pt` 文件。

---

## 三、模型调用原理（必读）

### 3.1 从点击「确定」到出结果（六步）

```text
① 用户上传图片，点击「确定」
        ↓
② DataAnalysis.vue 调用 analyzeImage()，FormData 打包 file + cropType
        ↓  src/api/analysis.ts → POST /api/analysis/image
③ Vite 代理把 /api/analysis 转发到 127.0.0.1:5000
        ↓  vite.config.ts
④ Flask app.py 收 multipart 请求，Image.open(上传流)
        ↓  ml-bjj/serving/app.py
⑤ inference.py 预处理 → EfficientNet 前向 → softmax 取最大类
        ↓  ml-bjj/serving/inference.py ← pest-cls-best.pt
⑥ 返回 JSON { result, confidence }，Vue 展示并写入预警中心
```

### 3.2 各层职责与代码位置

| 步骤 | 文件 | 做什么 |
|------|------|--------|
| 发请求 | `src/api/analysis.ts` | `FormData` 追加 `file`、`cropType`，`http.post('/analysis/image')` |
| 代理 | `vite.config.ts` | `/api/analysis` → `5000`；其余 `/api` → `3000` |
| HTTP 入口 | `ml-bjj/serving/app.py` | 路由 `POST /api/analysis/image`，校验图片格式 |
| 加载权重 | `ml-bjj/serving/inference.py` | 启动时 `torch.load(.pt)`，单例 `get_classifier()` |
| 前向推理 | 同上 `PestClassifier.predict()` | 224 缩放 → Normalize → `model(tensor)` → argmax |
| 展示 | `src/views/user/DataAnalysis.vue` | 读 `response.data.result/confidence`，`createAlert` 写预警 |

**前端关键代码**（只调 API，不碰模型）：

```typescript
// src/api/analysis.ts
formData.append('file', data.file)
return http.post('/analysis/image', formData)
```

**推理关键代码**（真正跑 `.pt`）：

```python
# ml-bjj/serving/app.py
img = Image.open(file.stream)
result, confidence = get_classifier().predict(img)

# ml-bjj/serving/inference.py
ckpt = torch.load(weights_path, map_location="cpu")
self.model.load_state_dict(ckpt["state_dict"])
logits = self.model(tensor)
probs = torch.softmax(logits, dim=1)[0]
```

### 3.3 权重文件 `pest-cls-best.pt` 里有什么

训练脚本 `train_cls.py` 保存的是 **PyTorch checkpoint 字典**，推理时按需取出：

| 字段 | 含义 |
|------|------|
| `state_dict` | 神经网络已训练参数（核心） |
| `classes` | 8 个中文类名列表 |
| `model_name` | 如 `efficientnet_b0` |
| `img_size` | 224 |

推理服务 **启动时** 读盘一次、建模型、灌权重；之后每张图只做 **forward**，不再训练。

### 3.4 与命令行 `predict.py` 的关系

| | 命令行 | 网站 |
|--|--------|------|
| 入口 | `python ml-bjj/scripts/predict.py --image xxx.png` | 浏览器上传 |
| 读图 | `Image.open(文件路径)` | `Image.open(HTTP 上传流)` |
| 推理逻辑 | 共用 `ml-bjj/serving/inference.py` | 同上 |
| 输出 | 打印「识别结果 / 置信度」 | JSON 给 Vue |

网站 = **同一套推理逻辑 + HTTP 包装**。验收时同一张图，`predict.py` 与 curl/页面结果应一致（±0.01）。

### 3.5 两条 API 链路（易混淆）

智能分析页一次操作会涉及 **两个后端**：

```text
识别病名     POST /api/analysis/image  →  5000  ml-bjj/serving  （真实 AI）
写入预警列表  POST /api/alerts         →  3000  pnpm run mock   （json-server）
```

5000 只负责「这张图是什么病」；3000 负责「把结果存进预警中心」。两者都要开，全链路才完整。

### 3.6 常见误解

| 误解 | 实际情况 |
|------|----------|
| Vue 里 import 了模型 | ❌ 前端只有 axios，没有 PyTorch |
| 选了「小麦/玉米」会影响识别 | ❌ v3 暂不按 `cropType` 过滤，8 类全局竞争 |
| 只开 `pnpm dev` 就能 AI 识别 | ❌ 必须另开 `python ml-bjj/serving/app.py` |
| `server/app.py` 是真模型 | ❌ 旧 Mock（hash 伪随机），已废弃 |
| 每张图都重新读 `.pt` | ❌ 启动时加载一次，内存中单例复用 |

### 3.7 最小验证（不经过浏览器）

```powershell
# 终端 1：必须先启动（此处才真正 load .pt）
python ml-bjj\serving\app.py

# 终端 2：直接打 API
curl -X POST http://127.0.0.1:5000/api/analysis/image `
  -F "file=@ml-bjj/data/bjj_cls/val/小麦锈病/小麦锈病_00001.png" `
  -F "cropType=wheat"
```

返回 `"result":"小麦锈病"` 即说明 **权重 → inference → HTTP** 链路通；再开 `pnpm dev` 只是把同样请求改为从网页发起。

---

## 四、任务清单

| 序号 | 任务 | 状态 | 验收 |
|------|------|------|------|
| A1 | `inference.py` + `app.py` | ✅ | 与 `predict.py` 同结果 |
| A2 | 启动 5000 | ✅ | curl 通过 |
| A3 | Vite 代理 | ✅ | 已配置 |
| A4 | 联调 `DataAnalysis.vue` | ✅ | 真实病名 |
| A5 | 作物下拉 + 低置信度 | ✅ | wheat/corn/tomato |
| A6 | 启动说明 | ✅ | `项目启动说明.md` |

---

## 五、现状盘点

| 模块 | 路径 | 现状 | 阶段 A 动作 |
|------|------|------|-------------|
| 真实推理 | `ml-bjj/scripts/predict.py` | ✅ v3 权重可用 | 抽取为可复用模块 |
| 推理服务 | `ml-bjj/serving/app.py` | ✅ **v3 真实推理** | 已替代 `server/app.py` Mock |
| 服务目录 | `ml-bjj/serving/` | ✅ 已建 | `inference.py` + `app.py` |
| Vite 代理 | `vite.config.ts` | ✅ `/api/analysis` → 5000 | **无需改** |
| 前端 API | `src/api/analysis.ts` | ✅ FormData POST | **无需改** |
| 智能分析页 | `src/views/user/DataAnalysis.vue` | ✅ 读 result/confidence、写预警 | 作物 v3 化已完成（§七） |
| Mock 后端 | `pnpm run mock`（3000） | ✅ 登录、预警等 | **保留**，并行运行 |
| 依赖 | `ml-bjj/requirements.txt` | 含 flask/flask-cors | ✅ 已补充 |

**关键结论**：前端 → 代理 → 5000 **链路已通**；核心是 **把 5000 从 Mock 换成 v3 真实推理**，并与 `predict.py` 结果一致。

---

## 六、后端实现规格

### 6.1 目录与文件

```text
ml-bjj/serving/
  __init__.py
  inference.py         # 加载模型、predict(image) → (label, conf)
  app.py               # Flask 路由
```

### 6.2 框架选型

| 方案 | 说明 | 建议 |
|------|------|------|
| **Flask** | 与现有 `server/app.py` 路由/响应一致；改动最小 | ✅ 采用 |
| FastAPI | `requirements.txt` 已含 fastapi/uvicorn | 后续优化可选 |

### 6.3 模型加载策略

- **启动时加载一次**（全局单例）；CPU 首次约 3–8 秒。
- 权重默认：`ml-bjj/models/pest-cls-best.pt`。
- 推理：内存 `PIL.Image`（不落盘）；预处理与 `predict.py` 一致（224、ImageNet Normalize、softmax）。

| 环境变量 | 默认值 | 用途 |
|----------|--------|------|
| `ML_BJJ_WEIGHTS` | `ml-bjj/models/pest-cls-best.pt` | 指定权重 |
| `ML_BJJ_USE_MOCK` | `0` | `1` 时回退 Mock（答辩降级） |
| `ML_BJJ_PORT` | `5000` | 服务端口 |

### 6.4 `inference.py`

```python
# 伪代码 · 与 predict.py 同一套 transforms / model_name / img_size
class PestClassifier:
    def __init__(self, weights_path: Path): ...
    def predict(self, image: Image.Image) -> tuple[str, float]:
        """(中文标签, 置信度 0~1)"""

def get_classifier() -> PestClassifier: ...  # 模块级单例
```

**验收**：同一张图与 `predict.py` 标签、置信度（±0.01）一致。

### 6.5 `app.py`

| 项 | 规格 |
|----|------|
| 路由 | `POST /api/analysis/image` |
| 入参 | `file`（必填）、`cropType`、`category`、`additionalInfo`（可选） |
| 成功响应 | `result`（str）、`confidence`（float 0~1） |
| 错误 | 400 / 500，body 含 `error` |
| CORS | Flask-CORS，允许 `127.0.0.1:5173` |
| 启动 | `app.run(host='0.0.0.0', port=5000)`；**勿开 debug reload** |

```python
img = Image.open(file.stream).convert("RGB")
label, conf = get_classifier().predict(img)
return {"result": label, "confidence": conf, ...}
```

> `cropType` v3 **暂不参与推理**（8 类全局分类），原样接收写入 `details` 便于日志。

### 6.6 依赖

`ml-bjj/requirements.txt` 增加：

```text
flask>=3.0.0
flask-cors>=4.0.0
```

```powershell
ml-bjj\.venv\Scripts\Activate.ps1
pip install flask flask-cors
```

---

## 七、前端改动范围

### 必改（无）

- `src/api/analysis.ts`、`vite.config.ts`：已满足，零改动联调。
- `DataAnalysis.vue` 主流程：已满足。

### 已完成（v3 对齐）

| 项 | 改动 |
|----|------|
| 作物下拉 | **wheat / corn / tomato**；默认 `wheat` |
| `cropLabels` | 小麦、玉米、番茄 |
| 低置信度 | `confidence < 0.7` 显示「建议人工复核」 |
| 识别类型默认 | `pest`（病虫害识别） |

### 本阶段不改

- `createAlert`、路由、权限；不按 cropType 过滤模型输出（留 v3.1）。

---

## 八、接口约定

请求：`POST /api/analysis/image`，`multipart/form-data`

| 字段 | 说明 |
|------|------|
| file | 图片文件 |
| cropType | wheat / corn / tomato（模型 8 类全局，暂不过滤） |
| category | pest / disaster / climate / other |

响应（axios `response.data`）：

```json
{
  "result": "小麦锈病",
  "confidence": 0.8787
}
```

与 `[DataAnalysis.vue](../../src/views/user/DataAnalysis.vue)` 中 `response.data.result`、`response.data.confidence` 一致。

---

## 九、联调与验收步骤

### Step 0：环境确认

```powershell
cd D:\code2\software\vue\program\DetectSystem
ml-bjj\.venv\Scripts\Activate.ps1
python -c "import torch, timm; print('ok')"
Test-Path ml-bjj\models\pest-cls-best.pt
```

### Step 1：命令行基线

```powershell
python ml-bjj\scripts\predict.py --image "ml-bjj\data\bjj_cls\val\小麦锈病\小麦锈病_00001.png"
# 期望：小麦锈病  87.87%
```

### Step 2：启动推理服务（编码后）

```powershell
python ml-bjj\serving\app.py
```

### Step 3：curl

```powershell
curl -X POST http://127.0.0.1:5000/api/analysis/image `
  -F "file=@ml-bjj/data/bjj_cls/val/玉米大斑病/玉米大斑病_00001.jpg" `
  -F "cropType=corn" `
  -F "category=pest"
```

期望：`"result": "玉米大斑病"`, `"confidence": 0.9151`（±0.01）

### Step 4：三终端全链路

```powershell
# 终端 1
pnpm run mock

# 终端 2
ml-bjj\.venv\Scripts\Activate.ps1
python ml-bjj\serving\app.py

# 终端 3
pnpm dev
```

浏览器 `/analysis` → 农技员登录 → 上传验证集图 → 「确定」。

### Step 5：验收对照

| 检查项 | 通过标准 |
|--------|----------|
| 小麦锈病图 | 与 `predict.py` 一致 |
| 玉米大斑病图 | confidence ≈ 91.5% |
| 预警中心 | `[AI识别] 监测到 …` |
| Mock 未挂 | 登录、预警、地图正常 |
| 推理挂掉 | 友好报错；可选 `ML_BJJ_USE_MOCK=1` |

### 测试图（已抽测）

```text
ml-bjj/data/bjj_cls/val/小麦锈病/小麦锈病_00001.png    → 小麦锈病 87.87%
ml-bjj/data/bjj_cls/val/玉米大斑病/玉米大斑病_00001.jpg  → 玉米大斑病 91.51%
```

---

## 十、分工与工期（约 3 天）

| 天 | 任务 | 产出 |
|----|------|------|
| D1 上午 | `inference.py` + 对齐 `predict.py` | 同图同结果 |
| D1 下午 | `app.py` + curl | 5000 可调 |
| D2 上午 | 三终端联调、截屏 | 页面真实识别 |
| D2 下午 | 作物下拉 v3 化（可选） | UI 对齐 |
| D3 | 启动说明、答辩预演 | 队友可演示 |

---

## 十一、风险与降级

| 风险 | 应对 |
|------|------|
| 模型加载慢（CPU） | 启动日志 + warmup 一张图 |
| 5000 未启动 | 演示前检查端口 |
| 权重路径错误 | 启动时校验，失败 exit |
| 答辩现场崩溃 | `ML_BJJ_USE_MOCK=1` 或预录屏 |
| 旧作物下拉 | 改为 wheat/corn/tomato |

---

## 十二、文档同步（已完成）

| 文档 | 状态 |
|------|------|
| `下一阶段任务与流程.md` §一 | ✅ 网站联调已勾选 |
| `AI模型能力与本土化测试说明.md` | ✅ 部署状态已更新 |
| `ml-bjj训练操作手册-开发版.md` | ✅ 已增推理服务节 |
| `[项目启动说明.md](./项目启动说明.md)` | ✅ 三终端启动 |

---

## 十三、相关路径

| 路径 | 说明 |
|------|------|
| `ml-bjj/models/pest-cls-best.pt` | v3 权重 |
| `ml-bjj/scripts/predict.py` | 命令行对照 |
| `ml-bjj/serving/app.py` | v3 推理服务（5000） |
| `ml-bjj/serving/inference.py` | 推理核心 |
| `server/app.py` | 旧 Mock（已废弃，勿启动） |
| `src/api/analysis.ts` | 前端 API |
| `vite.config.ts` | `/api/analysis` → 5000 |
| `src/views/user/DataAnalysis.vue` | 智能分析页 |

---

**文档版本**：V1.2（补充 §三 模型调用原理）  
**最后更新**：2026-07-09  
**维护**：互联网＋项目组
