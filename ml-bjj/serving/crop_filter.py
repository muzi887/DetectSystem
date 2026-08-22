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

SUPPORTED_CROP_TYPES = frozenset(CROP_CLASS_GROUPS)
HIDDEN_CROP_TYPES = frozenset({"peach", "apple"})
HIDDEN_CROP_LABELS = frozenset({"桃", "苹果"})
CROP_LABELS = {
    "wheat": "小麦",
    "corn": "玉米",
    "tomato": "番茄",
    "rice": "水稻",
}


HIDDEN_DISEASE_LABELS = frozenset({
    "桃缩叶病",
    "桃疮痂病",
    "桃褐腐病",
    "桃细菌性穿孔病",
    "苹果轮纹病",
    "苹果腐烂病",
    "苹果疮痂病",
})
LABEL_ALIASES = {
    "小麦条锈病": "小麦锈病",
    "小麦叶锈病": "小麦锈病",
    "小麦秆锈病": "小麦锈病",
    "条锈病": "小麦锈病",
    "叶锈病": "小麦锈病",
    "秆锈病": "小麦锈病",
}


def is_hidden_crop(crop_type: str) -> bool:
    raw = (crop_type or "").strip()
    if raw in HIDDEN_CROP_LABELS:
        return True
    return raw.lower() in HIDDEN_CROP_TYPES


def assert_bjj_crop_type(crop_type: str) -> None:
    if is_hidden_crop(crop_type):
        raise ValueError("京津冀版不支持桃/苹果识别，请选择小麦、玉米、番茄或水稻")


def is_hidden_disease(label: str) -> bool:
    return (label or "").strip() in HIDDEN_DISEASE_LABELS


def canonicalize_label(label: str) -> str | None:
    raw = (label or "").strip()
    if not raw or is_hidden_disease(raw):
        return None
    if raw in CANONICAL_CLASSES:
        return raw
    mapped = LABEL_ALIASES.get(raw)
    if mapped:
        return mapped
    return raw


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
