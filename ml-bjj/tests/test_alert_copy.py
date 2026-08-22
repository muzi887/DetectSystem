import json
import re
from pathlib import Path

from crop_filter import CANONICAL_CLASSES

ROOT = Path(__file__).resolve().parents[2]
DB_PATHS = (
    ROOT / "src" / "mock" / "db.json",
    ROOT / "deploy" / "api_mock" / "db.json",
)
AI_RE = re.compile(r"\[AI识别\].*?-\s*(.+?)\s*\(置信度")
HIDDEN = ("桃", "苹果", "peach", "apple")


def test_ai_alerts_use_canonical_labels_and_hide_peach_apple():
    canonical = set(CANONICAL_CLASSES)
    bad = []
    for db_path in DB_PATHS:
        data = json.loads(db_path.read_text(encoding="utf-8"))
        for alert in data["alerts"]:
            message = alert.get("message", "")
            lower = message.lower()
            if any(token in message or token in lower for token in HIDDEN):
                bad.append((str(db_path), "hidden-crop", message))
                continue
            if "[AI识别]" not in message:
                continue
            match = AI_RE.search(message)
            if not match:
                bad.append((str(db_path), "unparsed", message))
                continue
            label = match.group(1).strip()
            if label not in canonical:
                bad.append((str(db_path), label, message))
    assert bad == [], bad


def test_mock_includes_rice_blast_samples():
    src = json.loads((ROOT / "src" / "mock" / "db.json").read_text(encoding="utf-8"))
    deploy = json.loads((ROOT / "deploy" / "api_mock" / "db.json").read_text(encoding="utf-8"))
    src_text = " ".join(a.get("message", "") for a in src["alerts"])
    deploy_text = " ".join(a.get("message", "") for a in deploy["alerts"])
    assert "稻瘟病" in src_text
    assert "稻颈瘟" in src_text
    assert "稻瘟病" in deploy_text
    assert "稻颈瘟" in deploy_text
