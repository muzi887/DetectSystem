from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

_LOCK = Lock()


def _read(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    raw = path.read_text(encoding="utf-8").strip()
    if not raw:
        return []
    data = json.loads(raw)
    return data if isinstance(data, list) else []


def _write(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def list_records(path: Path) -> list[dict]:
    with _LOCK:
        return _read(path)


def append_record(path: Path, record: dict) -> dict:
    with _LOCK:
        rows = _read(path)
        next_id = (rows[-1]["id"] + 1) if rows else 1
        row = {
            **record,
            "id": next_id,
            "createdAt": record.get("createdAt")
            or datetime.now(timezone.utc).isoformat(),
            "correctedLabel": record.get("correctedLabel"),
        }
        rows.append(row)
        _write(path, rows)
        return row


def recent_records(path: Path, limit: int = 20) -> list[dict]:
    rows = list_records(path)
    ordered = sorted(rows, key=lambda item: item.get("createdAt") or "", reverse=True)
    return ordered[: max(0, limit)]


def stats_by_label(path: Path) -> dict:
    rows = list_records(path)
    tally: dict[str, int] = {}
    for row in rows:
        label = str(row.get("label") or "未知")
        tally[label] = tally.get(label, 0) + 1
    counts = [
        {"label": label, "count": count}
        for label, count in sorted(tally.items(), key=lambda item: (-item[1], item[0]))
    ]
    return {"total": len(rows), "counts": counts}
