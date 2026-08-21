# Python 如何创建与使用线程锁

> 用本项目 `ml-bjj/serving/analysis_store.py` 说明：锁对象怎么造、`with` 怎么占用、解决什么问题。  
> 识别记录的字段、函数清单与 pytest 见 [`训后实施/P2-Task1-识别记录存储.md`](../训后实施/P2-Task1-识别记录存储.md)，本文不重复。

---

## 一、要挡的是什么

Flask 可以同时处理多个请求（多个线程）。识别记录写在同一个 JSON 文件里，典型动作是：

```text
读出列表 → 算出下一个 id → 追加一条 → 写回文件
```

若两个请求同时走到「读出列表」，会算出同一个 `id`，后写的覆盖先写的。线程锁让这段 **读改写** 同一时刻只跑一个线程，另一个在门口等。

它挡的是 **同一 Python 进程里的多个线程**，不是两个电脑、也不是两个独立进程抢文件。

---

## 二、创建：造一把锁，全文件共用

```python
from threading import Lock

_LOCK = Lock()
```

`Lock()` 调用一次，得到一把锁。赋给模块级变量 `_LOCK`，这个文件里的读、写函数都用 **同一把**。

要点：

- 必须是同一对象。每个函数里再 `Lock()` 一次，等于每人一把锁，挡不住别人。
- 文件加载时创建一次即可，不要在每次 `append_record` 里新建。
- 前导下划线 `_LOCK` 只是约定：给本模块内部用，不是语法要求。

---

## 三、使用：`with` 占用，出块就释放

```python
def append_record(path: Path, record: dict) -> dict:
    with _LOCK:
        rows = _read(path)
        # …改 rows、写回文件…
        return row
```

`with _LOCK:` 做两件事：

| 时机 | 动作 |
|------|------|
| 走进缩进块 | **上锁**（已有人占用则在此等待） |
| 离开缩进块 | **解锁**（函数 return 或中途报错都会离开，锁不会一直占着） |

「这一行就实现了加锁吗？」—— **这一行是在使用锁**；锁本身是上面的 `_LOCK = Lock()`。两行合在一起才完整。

等价于手写 `acquire()` / `release()`，但 `with` 不容易忘记解锁：

```python
_LOCK.acquire()
try:
    rows = _read(path)
    # …
finally:
    _LOCK.release()
```

本项目用 `with`，不必手写 `try/finally`。

---

## 四、本文件里谁加了锁

| 函数 | 怎么锁 |
|------|--------|
| `list_records` / `append_record` / `update_record` | 函数体内直接 `with _LOCK:` |
| `recent_records` / `stats_by_label` | 自己不再写 `with`，因为内部调用了已加锁的 `list_records` |

锁要包住 **整段读改写**，不能只锁 `_write` 那一行。否则两个线程都读完旧列表再排队写，`id` 仍会撞。

---

## 五、它不是什么

| 容易误会 | 实际 |
|----------|------|
| 文件锁（操作系统锁住 `.json`） | 不是。另一个进程仍可能同时改这个文件 |
| 多进程锁（gunicorn 开多个 worker） | 不是。每个进程有自己的 `_LOCK`，互不相认 |
| 让程序变单线程 | 不是。没进 `with` 的代码仍可并行；只是进了锁的那几行排队 |

当前 serving 单进程读写这一份 JSON 时，这把锁够用。以后若多进程部署，需要换文件锁或数据库，那是另一套方案。

---

## 六、对照源码位置

```8:8:ml-bjj/serving/analysis_store.py
_LOCK = Lock()
```

```31:32:ml-bjj/serving/analysis_store.py
def append_record(path: Path, record: dict) -> dict:
    with _LOCK:
```

---

## 七、小结

| 说法 | 含义 |
|------|------|
| 创建 | `from threading import Lock`，然后 `_LOCK = Lock()` 一次 |
| 使用 | `with _LOCK:` 包住不能并行的读改写 |
| 共用 | 读写同一份数据的函数必须用同一把锁 |
| 本项目 | 防止并发识别请求写出重复 `id` 或互相覆盖 JSON |
