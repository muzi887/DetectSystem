from __future__ import annotations

CANONICAL_CLASSES = [
    "健康",
    "小麦锈病", "小麦赤霉病", "小麦白粉病", "小麦蚜虫为害",
    "玉米大斑病", "玉米锈病", "玉米南方锈病", "玉米小斑病",
    "玉米弯孢叶斑病", "玉米褐斑病", "玉米瘤黑粉病", "玉米茎腐病", "玉米穗腐病",
    "番茄早疫病",
    "水稻白叶枯病", "水稻褐斑病", "水稻负泥虫为害", "稻瘟病",
    "水稻叶鞘腐败病", "水稻叶黑粉病", "水稻窄条斑病", "稻颈瘟",
]

CROP_CLASS_GROUPS = {
    "wheat": {"健康", "小麦锈病", "小麦赤霉病", "小麦白粉病", "小麦蚜虫为害"},
    "corn": {
        "健康", "玉米大斑病", "玉米锈病", "玉米南方锈病", "玉米小斑病",
        "玉米弯孢叶斑病", "玉米褐斑病", "玉米瘤黑粉病", "玉米茎腐病", "玉米穗腐病",
    },
    "tomato": {"健康", "番茄早疫病"},
    "rice": {
        "健康", "水稻白叶枯病", "水稻褐斑病", "水稻负泥虫为害", "稻瘟病",
        "水稻叶鞘腐败病", "水稻叶黑粉病", "水稻窄条斑病", "稻颈瘟",
    },
}


def classes_for_crop(crop_type: str) -> set[str] | None:
    return CROP_CLASS_GROUPS.get(crop_type)


def mask_and_renorm(probs: list[float], classes: list[str], crop_type: str) -> list[float]:
    allowed = classes_for_crop(crop_type)
    if allowed is None or len(probs) != len(classes):
        return list(probs)
    masked = [p if label in allowed else 0.0 for p, label in zip(probs, classes)]
    total = sum(masked)
    if total <= 0:
        return list(probs)
    return [p / total for p in masked]
