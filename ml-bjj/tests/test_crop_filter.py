from crop_filter import (
    CANONICAL_CLASSES,
    CROP_CLASS_GROUPS,
    classes_for_crop,
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
    assert mask_and_renorm(probs, classes, "peach") == probs
