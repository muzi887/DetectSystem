from disease_env_rules import apply_disease_env_rules


def test_blast_high_humidity_promotes_high():
    out = apply_disease_env_rules(
        "稻瘟病",
        "medium",
        {"airRh": 88, "airTemp": 26, "soilVwc": 30},
        "分蘖盛期防叶瘟。",
    )
    assert out["level"] == "high"
    assert any("高湿" in r for r in out["reasons"])
    assert "分蘖盛期防叶瘟" in (out["advice"] or "")


def test_healthy_stays_low_even_if_dry():
    out = apply_disease_env_rules("健康", "low", {"soilVwc": 10}, None)
    assert out["level"] == "low"
    assert out["advice"]  # 仍提示墒情
    assert any("墒情" in r for r in out["reasons"]) or "墒情" in (out["advice"] or "")


def test_missing_env_does_not_change_level():
    out = apply_disease_env_rules("小麦锈病", "medium", None, None)
    assert out["level"] == "medium"
    assert out["reasons"] == []
    assert out["advice"] is None
