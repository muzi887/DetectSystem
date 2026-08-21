# P3 Task 4：waitress 生产入口

> 对应计划：[`新模型训后-P3-规则链与工程化实施计划.md`](../新模型训后-P3-规则链与工程化实施计划.md) Task 4  
> 状态：✅ 已完成（本机已安装 waitress 3.0.2；无进程托管单测）

## 子任务解释

Flask 自带 `app.run` 只适合本机调试。生产（Windows / 宝塔）用 WSGI 服务器 **waitress** 托管同一个 `app`：

1. 抽出 `prepare_runtime()`：权重存在、classes 与 meta 一致、必须 23 类（Mock 模式跳过）
2. `python ml-bjj/serving/app.py` 仍走 `app.run`
3. `python ml-bjj/serving/serve.py` 走 `waitress.serve(..., threads=4)`
4. 部署说明补 5–10 行：Windows/宝塔用 waitress，Linux 可选 gunicorn

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 新增 | [`ml-bjj/serving/serve.py`](../../../../ml-bjj/serving/serve.py) | waitress 生产入口，复用 `prepare_runtime()` |
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | 抽出 `prepare_runtime()`；`main()` 仍 `app.run` |
| 修改 | [`ml-bjj/requirements.txt`](../../../../ml-bjj/requirements.txt) | 增加 `waitress>=3.0.0` |
| 修改 | [`docs/互联网+/部署/云服务器部署更新说明.md`](../../部署/云服务器部署更新说明.md) | 推理进程改 waitress / gunicorn 的启动命令 |

## 代码内容

### `serve.py`

```python
def run() -> None:
    port = serving.prepare_runtime()
    print(f"[ml-bjj] waitress: http://127.0.0.1:{port}/api/analysis/image")
    serve(serving.app, host="0.0.0.0", port=port, threads=4)
```

## 验证

```text
pip install waitress
python -c "from importlib.metadata import version; print(version('waitress'))"
→ 3.0.2
```
