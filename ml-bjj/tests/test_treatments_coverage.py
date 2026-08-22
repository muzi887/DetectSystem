from crop_filter import CANONICAL_CLASSES
from knowledge import get_treatment_item, load_catalog


def test_catalog_covers_all_canonical_labels():
    items = load_catalog()["items"]
    missing = [label for label in CANONICAL_CLASSES if label not in items]
    assert missing == [], f"treatments.json 缺少: {missing}"


def test_each_item_has_summary_and_measures():
    items = load_catalog()["items"]
    for label in CANONICAL_CLASSES:
        item = items[label]
        assert item["summary"].strip()
        assert "measures" in item


def test_missing_label_does_not_fallback_to_healthy():
    item, found = get_treatment_item("不存在的病名XYZ")
    assert found is False
    assert item["crop"] == "通用"
    assert "暂无" in item["summary"]
    assert "不存在的病名XYZ" in item["summary"]
    assert item is not load_catalog()["items"]["健康"]


def test_wheat_rust_alias_uses_unified_item():
    item, found = get_treatment_item("小麦条锈病")
    canonical, canonical_found = get_treatment_item("小麦锈病")
    assert found is True
    assert canonical_found is True
    assert item["summary"] == canonical["summary"]
    assert item["crop"] == "小麦"


def test_peach_disease_has_no_treatment():
    item, found = get_treatment_item("桃缩叶病")
    assert found is False
    assert "暂无" in item["summary"]
