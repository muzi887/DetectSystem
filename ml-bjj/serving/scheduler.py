from __future__ import annotations

import os
import threading
from datetime import datetime

from db import session_scope
from rules.persist import append_notifications, run_chain1, run_chain2, run_chain3, tick_sensor_simulation

_timer: threading.Timer | None = None
_started = False


def _tick() -> None:
    global _timer
    now = datetime.now().astimezone()
    try:
        with session_scope() as session:
            tick_sensor_simulation(session, now)
    except Exception as exc:
        print(f"[ml-bjj] scheduler tick sensor failed: {exc}")
    created: list[dict] = []
    try:
        with session_scope() as session:
            created.extend(run_chain1(session, now)["created"])
    except Exception as exc:
        print(f"[ml-bjj] scheduler chain1 failed: {exc}")
    try:
        with session_scope() as session:
            created.extend(run_chain2(session, now)["created"])
    except Exception as exc:
        print(f"[ml-bjj] scheduler chain2 failed: {exc}")
    try:
        with session_scope() as session:
            pest = run_chain3(session, now)["created"]
            created.extend(pest)
            append_notifications(session, created, now)
    except Exception as exc:
        print(f"[ml-bjj] scheduler chain3 failed: {exc}")
    _timer = threading.Timer(60.0, _tick)
    _timer.daemon = True
    _timer.start()


def start_scheduler() -> None:
    global _started
    if _started:
        return
    if os.environ.get("ML_BJJ_DISABLE_SCHEDULER", "0") == "1":
        print("[ml-bjj] scheduler disabled")
        return
    _started = True
    _timer = threading.Timer(60.0, _tick)
    _timer.daemon = True
    _timer.start()
