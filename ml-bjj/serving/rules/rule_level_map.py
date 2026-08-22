def map_rule_level(level: str) -> str:
    return "warning" if level == "hint" else "high"
