"""Temas visuales y reglas de look del motor 2D (D123): templates/themes2d.json y pipeline/validate_story2d.py
(python pipeline/tests/test_temas2d.py)."""
import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools"))
from common import ROOT, load_json  # noqa: E402
from validate_story2d import validate  # noqa: E402
import look_sheet  # noqa: E402

cat, th = load_json(ROOT / "templates" / "catalog2d.json"), load_json(ROOT / "templates" / "themes2d.json")
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


for name, t in th["themes"].items():
    check(f"{name}: paletas, luces y ambiente existen en el catálogo", set(t["palettes"]) <= set(cat["palettes"]) and set(t["lights"]) <= set(cat["lights"])
          and all(cat["assets"].get(a, {}).get("kind") == "ambiente" for a in t["ambient"]), t)
    check(f"{name}: dice cómo se ve y cuándo elegirlo", bool(t.get("look")) and bool(t.get("when")))
check("cada cielo es de una paleta y tiene tres colores", all(k in cat["palettes"] and len(v) == 3 for k, v in th["skies"].items()))


def story(theme, closing=None):
    return {"meta": {"id": "t", "lang": "es", "title": "t", "engine": "2d", "pacing": "viral", "captionEmphasis": "accent", "theme": theme, "hookTitle": "Una prueba de look"},
            "beats": copy.deepcopy(look_sheet.SCENES[theme])}


def errs_of(s, closing=None):
    return [e for e in validate(s, None, None, closing, "alegoria") if "estructura" not in e and "roles" not in e and "primer beat" not in e and "beat(s)" not in e]


for theme in look_sheet.SCENES:
    s = story(theme)
    s["beats"] = [b for b in s["beats"] if b["role"] != "cta"]
    check(f"la escena de prueba de {theme} cumple las reglas del tema", not errs_of(s), errs_of(s))
s = story("vivo"); s["meta"]["theme"] = "plastilina"
check("tema desconocido falla", any("no existe en templates/themes2d.json" in e for e in errs_of(s)))
s = story("vivo"); s["beats"][0]["scene"]["palette"] = "claroscuro"
check("paleta de otro tema falla", any("no es del tema" in e for e in errs_of(s)))
s["meta"]["themeAlt"] = "drama_oscuro"
check("con themeAlt la segunda paleta vale", not any("paleta" in e and "no es del tema" in e for e in errs_of(s)))
s = story("vivo"); s["beats"][0]["scene"]["layers"] = [ly for ly in s["beats"][0]["scene"]["layers"] if cat["assets"][ly["asset"]]["kind"] != "ambiente"]
check("beat sin capa de ambiente falla", any("capa de ambiente" in e for e in errs_of(s)))
s = story("vivo"); s["beats"][0]["scene"]["layers"][3]["repeat"]["n"] = 500
check("repeat desmedido falla", any("repeat" in e for e in errs_of(s)))
s = story("cosmos"); s["beats"][0]["overlays"] = []; s["beats"][0]["actions"] = []
check("cifra dicha sin imagen falla", any("dice una cifra" in e for e in errs_of(s)))
s = story("noche_calida")
check("remate_cta con ShareCTA en el último beat pasa", not any("remate_cta" in e for e in errs_of(s, "remate_cta")))
s["beats"][-1]["overlays"] = []
check("remate_cta sin CTA animado falla", any("remate_cta" in e for e in errs_of(s, "remate_cta")))
s = story("vivo"); del s["meta"]["theme"]
check("sin tema (videos anteriores) no se exigen las reglas de look", not any("ambiente" in e or "tema" in e for e in errs_of(s)))
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
