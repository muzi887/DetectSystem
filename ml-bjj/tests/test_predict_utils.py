from predict_utils import needs_review, rank_topk


def test_rank_topk_orders_and_clips_to_three():
    classes = ["A", "B", "C", "D"]
    probs = [0.05, 0.60, 0.25, 0.10]
    top = rank_topk(probs, classes, k=3)
    assert [item["label"] for item in top] == ["B", "C", "D"]
    assert top[0]["confidence"] == 0.60
    assert len(top) == 3


def test_needs_review_when_confidence_low():
    top = [{"label": "稻瘟病", "confidence": 0.55}, {"label": "水稻褐斑病", "confidence": 0.20}]
    assert needs_review(top, 0.55) is True


def test_needs_review_when_margin_small():
    top = [{"label": "稻瘟病", "confidence": 0.46}, {"label": "水稻褐斑病", "confidence": 0.44}]
    assert needs_review(top, 0.46) is True


def test_needs_review_false_when_confident_and_separated():
    top = [{"label": "小麦锈病", "confidence": 0.91}, {"label": "小麦白粉病", "confidence": 0.05}]
    assert needs_review(top, 0.91) is False
