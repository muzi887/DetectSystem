from __future__ import annotations

HUMID_DISEASES = {"稻瘟病", "稻颈瘟", "小麦赤霉病"}
LEVEL_RANK = {"low": 0, "medium": 1, "high": 2}


def _bump(current: str, target: str) -> str:
    if LEVEL_RANK.get(target, 0) > LEVEL_RANK.get(current, 0):
        return target
    return current


def apply_disease_env_rules(
    label: str,
    base_level: str,
    env: dict | None,
    timing: str | None,
) -> dict:
    level = base_level if base_level in LEVEL_RANK else "medium"
    reasons: list[str] = []
    env = env or {}
    rh = env.get("airRh")
    temp = env.get("airTemp")
    vwc = env.get("soilVwc")

    if label != "健康" and rh is not None and float(rh) >= 80 and label in HUMID_DISEASES:
        level = _bump(level, "high")
        reasons.append("高湿利于该病流行")
    if label != "健康" and vwc is not None and float(vwc) <= 15:
        level = _bump(level, "medium")
        reasons.append("墒情偏低，结合旱情复核")
    if label != "健康" and temp is not None and float(temp) >= 38:
        level = _bump(level, "high")
        reasons.append("高温胁迫，建议尽快处置")

    advice = None
    extra = "植株看似健康但墒情偏低" if (label == "健康" and vwc is not None and float(vwc) <= 15) else None
    bits = list(reasons)
    if extra:
        bits.append(extra)
    if bits:
        timing_bit = (timing or "").split("。")[0]
        prefix = "当前环境：" + "；".join(bits) + "。"
        advice = prefix + (timing_bit + "。" if timing_bit else "")
    return {"level": level, "reasons": reasons, "advice": advice}
