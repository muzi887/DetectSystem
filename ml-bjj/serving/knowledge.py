from __future__ import annotations

import json
from pathlib import Path

KNOWLEDGE_PATH = Path(__file__).resolve().parents[1] / "knowledge" / "treatments.json"


def load_catalog() -> dict:
    return json.loads(KNOWLEDGE_PATH.read_text(encoding="utf-8"))


def get_treatment_item(label: str) -> tuple[dict, bool]:
    items = load_catalog().get("items", {})
    if label in items:
        return items[label], True
    fallback = {
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
    return fallback, False
