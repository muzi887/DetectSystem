from __future__ import annotations

from datetime import datetime, timedelta


def last_7_day_range(now: datetime | None = None) -> dict[str, str]:
    current = now or datetime.now()
    to = datetime(current.year, current.month, current.day)
    start = to - timedelta(days=6)
    ymd = lambda d: f"{d.year:04d}-{d.month:02d}-{d.day:02d}"
    return {"from": ymd(start), "to": ymd(to)}


def filter_readings(rows: list[dict], point_id: int, from_day: str | None = None, to_day: str | None = None) -> list[dict]:
    selected = [
        row
        for row in rows
        if int(row.get("pointId") or 0) == int(point_id)
        and (not from_day or str(row.get("recordedAt") or "")[:10] >= from_day)
        and (not to_day or str(row.get("recordedAt") or "")[:10] <= to_day)
    ]
    return sorted(selected, key=lambda row: str(row.get("recordedAt") or ""))
