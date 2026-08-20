from __future__ import annotations

import sys
from pathlib import Path

SERVE_DIR = Path(__file__).resolve().parents[1] / "serving"
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))
