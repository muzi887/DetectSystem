import pytest
from crop_filter import (
    CANONICAL_CLASSES,
    CROP_CLASS_GROUPS,
    CROP_LABELS,
    assert_bjj_crop_type,
    canonicalize_label,
    classes_for_crop,
    is_hidden_crop,
    mask_and_renorm,
)


def test_canonical_count_is_23():
    assert len(CANONICAL_CLASSES) == 23
    assert len(set(CANONICAL_CLASSES)) == 23


def test_every_group_is_subset_of_canonical():
    canonical = set(CANONICAL_CLASSES)
    for labels in CROP_CLASS_GROUPS.values():
        assert labels <= canonical
        assert "健康" in labels


def test_unknown_crop_returns_none():
    assert classes_for_crop("unknown") is None
    assert classes_for_crop("") is None


def test_wheat_zeros_rice_then_renorms():
    classes = ["小麦锈病", "稻瘟病", "健康"]
    probs = [0.2, 0.7, 0.1]
    out = mask_and_renorm(probs, classes, "wheat")
    assert out[1] == 0.0
    assert abs(sum(out) - 1.0) < 1e-9
    assert abs(out[0] - 0.2 / 0.3) < 1e-9
    assert abs(out[2] - 0.1 / 0.3) < 1e-9


def test_unknown_crop_does_not_filter():
    classes = ["小麦锈病", "稻瘟病"]
    probs = [0.4, 0.6]
    assert mask_and_renorm(probs, classes, "unknown") == probs


def test_rice_group_includes_blast_and_neck_blast():
    rice = CROP_CLASS_GROUPS["rice"]
    assert "稻瘟病" in rice
    assert "稻颈瘟" in rice


def test_peach_apple_are_hidden_from_bjj():
    assert is_hidden_crop("peach")
    assert is_hidden_crop("APPLE")
    assert is_hidden_crop("桃")
    assert is_hidden_crop("苹果")
    assert not is_hidden_crop("rice")
    assert "peach" not in CROP_LABELS
    assert "apple" not in CROP_LABELS
    with pytest.raises(ValueError, match="桃/苹果"):
        assert_bjj_crop_type("peach")


def test_wheat_rust_aliases_unify():
    assert canonicalize_label("小麦条锈病") == "小麦锈病"
    assert canonicalize_label("小麦叶锈病") == "小麦锈病"
    assert canonicalize_label("秆锈病") == "小麦锈病"
    assert canonicalize_label("小麦锈病") == "小麦锈病"
    assert canonicalize_label("稻瘟病") == "稻瘟病"
    assert canonicalize_label("稻颈瘟") == "稻颈瘟"
    assert canonicalize_label("桃缩叶病") is None
    assert canonicalize_label("苹果轮纹病") is None
