# rules/daily_report.py

> 源码：[`ml-bjj/serving/rules/daily_report.py`](../../../../../../ml-bjj/serving/rules/daily_report.py)  
> Mock 时对应：[`src/utils/dailyReport.ts`](../../../../../../src/utils/dailyReport.ts)

---

## 一、一句话定义

**`daily_report.py` 把监测点、待处理预警、极端天气拼成一份 Markdown 日报。** 纯字符串拼接，不查库。[`biz.py`](../blueprints/biz.py.md) 的 `GET /reports/daily` 先取表，再调用 `build_daily_report`。

它 **不** 发邮件、**不** 定时生成文件；只在有人请求（或以后接调度）时现拼。
