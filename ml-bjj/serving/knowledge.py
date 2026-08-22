from __future__ import annotations

import json
from pathlib import Path

from crop_filter import canonicalize_label, is_hidden_disease

KNOWLEDGE_PATH = Path(__file__).resolve().parents[1] / "knowledge" / "treatments.json"


def load_catalog() -> dict:
    return json.loads(KNOWLEDGE_PATH.read_text(encoding="utf-8"))


def _missing(label: str) -> dict:
    return {
        "crop": "通用",
        "crop_en": "general",
        "aliases": [],
        "summary": f"暂无「{label}」的防治条目，请以田间复核与当地植保意见为准。",
        "risk_level": "medium",
        "symptoms": [],
        "measures": {
            "chemical": [],
            "biological": [],
            "agronomic": ["保留清晰样本照片与拍摄时间，送农技员复核后再用药。"],
        },
        "timing": "",
        "safety": "在确认病名之前不要盲目施药。",
        "references": [],
    }


def get_treatment_item(label: str) -> tuple[dict, bool]:
    raw = (label or "").strip()
    if is_hidden_disease(raw):
        return _missing(raw), False
    canon = canonicalize_label(raw)
    if canon is None:
        return _missing(raw), False
    items = load_catalog().get("items", {})
    if canon in items:
        return items[canon], True
    fallback = _missing(canon)
    fallback["summary"] = f"暂无「{canon}」的防治条目，请以田间复核与当地植保意见为准。"
    return fallback, False
