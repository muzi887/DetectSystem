# Flask-MySQL Task 2：启动拆门闩 + 登录与基础 REST

> 对应计划：[`Flask-MySQL替换Mock实施计划.md`](../实施计划/Flask-MySQL替换Mock实施计划.md) Task 2  
> 状态：✅ 已完成（`test_biz_api.py` + 原 `test_app_api.py` 绿）

## 子任务解释

1. 权重不是 23 类时 **Flask 仍监听 5000**，只把 `MODEL_READY=False`；识图返回 503。不放宽 23 类校验。  
2. 业务蓝图按 json-server 路径提供 `/login`、`/monitorPoints`、`/alerts?_sort=time&_order=desc` 等。列表直接返回数组。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`ml-bjj/serving/app.py`](../../../../ml-bjj/serving/app.py) | 注册蓝图biz；`prepare_runtime` 不再 `SystemExit`；识图检查 `MODEL_READY` |
| 新增 | [`ml-bjj/serving/blueprints/biz.py`](../../../../ml-bjj/serving/blueprints/biz.py) | 登录 + REST |
| 新增 | [`ml-bjj/serving/rules/agri_derived.py`](../../../../ml-bjj/serving/rules/agri_derived.py) | `handle_farm_login`（密码或验证码 `2026`） |
| 新增 | [`ml-bjj/tests/test_biz_api.py`](../../../../ml-bjj/tests/test_biz_api.py) | 登录失败/成功、预警排序、缺库 503、模型未就绪 503 |

## 代码内容

启动门闩（有权重才标就绪）：

```python
app.config["MODEL_READY"] = False
# ... 加载成功且 23 类 ...
app.config["MODEL_READY"] = True
```

登录对齐原 Mock：

```python
pass_password = bool(user and password and user.get("password") == password)
pass_demo_code = bool(user and code == "2026")
```

REST：`GET /<collection>` 支持 `_sort` / `_order` 及 `?pointId=`。`POST/PATCH/DELETE` 写入对应表。

## 验证

```text
python -m pytest tests/test_biz_api.py tests/test_app_api.py -q
```
