from __future__ import annotations

CONF_REVIEW_THRESHOLD = 0.7
TOP2_MARGIN = 0.10


def rank_topk(probs: list[float], classes: list[str], k: int = 3) -> list[dict[str, str | float]]:
    paired = sorted(zip(classes, probs), key=lambda item: item[1], reverse=True)
    return [{"label": label, "confidence": float(conf)} for label, conf in paired[:k]]


def needs_review(topk: list[dict[str, str | float]], confidence: float) -> bool:
    if confidence < CONF_REVIEW_THRESHOLD:
        return True
    if len(topk) >= 2:
        top1 = float(topk[0]["confidence"])
        top2 = float(topk[1]["confidence"])
        if (top1 - top2) < TOP2_MARGIN:
            return True
    return False
