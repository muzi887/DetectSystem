from __future__ import annotations

import sys
from pathlib import Path

import pytest

SERVE_DIR = Path(__file__).resolve().parents[1] / "serving"
if str(SERVE_DIR) not in sys.path:
    sys.path.insert(0, str(SERVE_DIR))


@pytest.fixture(autouse=True)
def isolate_analysis_records(tmp_path, monkeypatch):
    monkeypatch.setenv("ML_BJJ_RECORDS", str(tmp_path / "analysis_records.json"))
