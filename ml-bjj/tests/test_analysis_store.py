from pathlib import Path

from analysis_store import append_record, list_records, recent_records, stats_by_label


def test_append_assigns_incremental_ids(tmp_path: Path):
    store = tmp_path / "records.json"
    a = append_record(store, {"label": "稻瘟病", "confidence": 0.91, "cropType": "rice"})
    b = append_record(store, {"label": "健康", "confidence": 0.88, "cropType": "rice"})
    assert a["id"] == 1
    assert b["id"] == 2
    assert "createdAt" in a
    assert list_records(store)[1]["label"] == "健康"


def test_recent_is_newest_first(tmp_path: Path):
    store = tmp_path / "records.json"
    append_record(store, {"label": "小麦锈病", "confidence": 0.8, "cropType": "wheat"})
    append_record(store, {"label": "稻瘟病", "confidence": 0.9, "cropType": "rice"})
    recent = recent_records(store, limit=1)
    assert recent[0]["label"] == "稻瘟病"


def test_stats_groups_by_label(tmp_path: Path):
    store = tmp_path / "records.json"
    append_record(store, {"label": "稻瘟病", "confidence": 0.9, "cropType": "rice"})
    append_record(store, {"label": "稻瘟病", "confidence": 0.8, "cropType": "rice"})
    append_record(store, {"label": "健康", "confidence": 0.7, "cropType": "wheat"})
    stats = stats_by_label(store)
    assert stats["total"] == 3
    assert stats["counts"][0] == {"label": "稻瘟病", "count": 2}
