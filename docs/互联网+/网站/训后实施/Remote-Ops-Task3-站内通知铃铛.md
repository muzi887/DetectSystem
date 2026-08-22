# Remote-Ops Task 3：站内通知铃铛

> 对应计划：[`2.0非AI-P2-遥感展示与自主运营实施计划.md`](../实施计划/2.0非AI-P2-遥感展示与自主运营实施计划.md) Task 3  
> 状态：✅ 已完成（`persistRules` 5 passed，`vue-tsc --noEmit` 通过）

## 子任务解释

三条规则链会往 `alerts` 里写新行，但顶栏没有铃铛，演示时要进预警页才能发现刚刷出来的单。本任务做**站内**通知，不接邮件/微信、不上 WebSocket。

1. `runAllChains` 三链跑完、合并 `created` 之后，每条新预警插一条 `notifications`。链 1/2（非草稿）和链 3 草稿都写；草稿标题前面加「草稿」。
2. json-server 自带 `GET /notifications`、`PATCH /notifications/:id`，不必手写 PATCH。
3. 顶栏账号菜单左侧：未读角标 + 铃铛。点开抽屉，点一条标记已读并跳到 `/warnings`。
4. 现有 30s `useAlertEngine` 顺带拉通知。

标题用预警 `message` 截到 40 字。`read` 默认 `false`。

## 改动文件

| 操作 | 文件 | 作用 |
|------|------|------|
| 修改 | [`src/mock/persistRules.ts`](../../../../src/mock/persistRules.ts) | `appendNotifications`；`runAllChains` 末尾调用 |
| 修改 | [`src/mock/persistRules.test.ts`](../../../../src/mock/persistRules.test.ts) | 两条新预警 → 两条通知；草稿标题带「草稿」 |
| 修改 | [`deploy/api_mock/ruleChainRunner.cjs`](../../../../deploy/api_mock/ruleChainRunner.cjs) | CJS 同步 |
| 修改 | [`src/mock/db.json`](../../../../src/mock/db.json) | `"notifications": []` |
| 修改 | [`scripts/sync-mock-db.mjs`](../../../../scripts/sync-mock-db.mjs) | `syncKeys` 加 `notifications` |
| 修改 | [`src/api/rules.ts`](../../../../src/api/rules.ts) | `fetchNotifications`、`markNotificationRead` |
| 修改 | [`src/composables/useAlertEngine.ts`](../../../../src/composables/useAlertEngine.ts) | 30s 一并拉通知 |
| 修改 | [`src/layouts/AppLayout.vue`](../../../../src/layouts/AppLayout.vue) | 铃铛、角标、抽屉 |

## 代码内容

```ts
export function appendNotifications(db: any, createdAlerts: AlertRow[], now = new Date()): void {
  if (!Array.isArray(db.notifications)) db.notifications = []
  let nextId = nextAlertId(db.notifications)
  for (const alert of createdAlerts) {
    let title = String(alert.message || '').slice(0, 40)
    if (alert.draft) title = `草稿 ${title}`
    db.notifications.push({
      id: nextId,
      title,
      read: false,
      alertId: alert.id,
      createdAt: now.toISOString()
    })
    nextId += 1
  }
}
```

```ts
export const fetchNotifications = () => http.get('/notifications')
export const markNotificationRead = (id: number) => http.patch(`/notifications/${id}`, { read: true })
```

## 验证

```text
pnpm exec tsx --test src/mock/persistRules.test.ts
→ 5 passed
pnpm exec vue-tsc --noEmit
→ 通过
pnpm run sync:mock-db
```
