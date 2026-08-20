import json
import re
from pathlib import Path

from crop_filter import CANONICAL_CLASSES

ROOT = Path(__file__).resolve().parents[2]
DB = ROOT / "src" / "mock" / "db.json"
AI_RE = re.compile(r"\[AI识别\].*?-\s*(.+?)\s*\(置信度")


def test_ai_alerts_use_canonical_labels():
    data = json.loads(DB.read_text(encoding="utf-8"))
    canonical = set(CANONICAL_CLASSES)
    bad = []
    for alert in data["alerts"]:
        message = alert.get("message", "")
        if "[AI识别]" not in message:
            continue
        match = AI_RE.search(message)
        if not match:
            bad.append(("unparsed", message))
            continue
        label = match.group(1).strip()
        if label not in canonical:
            bad.append((label, message))
    assert bad == [], bad
