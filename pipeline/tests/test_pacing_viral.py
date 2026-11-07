"""Prueba del perfil `pacing: viral` (templates/pacing_viral.json): guion, story 2D, voz y plan de SFX.
Sin pytest: python pipeline/tests/test_pacing_viral.py  (código 0 = todo bien)."""
from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from sfx_plan import plan  # noqa: E402
from validate_script import validate  # noqa: E402
from validate_story2d import validate as validate_story  # noqa: E402
from voice import viral_voice  # noqa: E402

EX = HERE.parents[1] / "templates/examples/solipsismo-viral"
SCRIPT = (EX / "02_SCRIPT.md").read_text(encoding="utf-8")
STORY = json.loads((EX / "05_story.json").read_text(encoding="utf-8"))
bad = 0


def check(name: str, ok: bool, extra: str = "") -> None:
    global bad
    bad += not ok
    print(("OK  " if ok else "MAL ") + name + (f" ({extra})" if extra and not ok else ""))


def only(errs: list[str], frag: str) -> bool:
    return len(errs) == 1 and frag in errs[0]


# --- guion
errs, st = validate(SCRIPT)
check("el guion viral de ejemplo pasa", not errs, "; ".join(errs))
errs, _ = validate(SCRIPT.replace("[hook] Nadie a tu alrededor puede probar que siente algo.", "[hook] ¿Alguna vez has sentido que nadie a tu alrededor siente algo?"))
check("gancho con introducción suave falla", any("introducción suave" in e for e in errs), "; ".join(errs))
errs, _ = validate(SCRIPT.replace("es que\n\n##", "es que.\n\n##"))
check("cierre con punto (no engancha con el gancho) falla", any("no se engancha" in e for e in errs), "; ".join(errs))
errs, _ = validate(SCRIPT.replace("Dirá que sí.", "Dirá que sí, porque cualquiera con una cabeza como la tuya contestaría eso mismo sin dudar un segundo."))
check("frase de más de 12 palabras falla", any("frase de" in e for e in errs), "; ".join(errs))
errs, _ = validate(SCRIPT.replace("pacing: viral\n", ""))
check("sin la cabecera viral rige el perfil clásico (las frases cortas siguen valiendo)", not any("viral" in e for e in errs), "; ".join(errs))

# --- voz
check("viral_voice: +13 % y pausas ≤150 ms", (viral_voice(STORY["meta"]) or {}).get("speed") == 1.13 and viral_voice(STORY["meta"])["pauseMaxMs"] == 150)
check("viral_voice: None sin el perfil", viral_voice({"lang": "es"}) is None)

# --- story 2D (sin words: solo reglas estáticas)
errs = validate_story(STORY, None, None, "bucle")
check("el story viral de ejemplo pasa", not errs, "; ".join(errs))
s2 = copy.deepcopy(STORY)
s2["beats"][1]["scene"]["layers"][1]["at"] = [0.5, 0.71]
check("capa con los pies en la franja de subtítulos falla", any("subtítulos virales" in e for e in validate_story(s2, None, None, "bucle")))
s3 = copy.deepcopy(STORY)
s3["beats"][2]["overlays"] = [{"type": "Pill", "at": "cuerpo.", "text": "X", "slot": "bottom"}]
check("overlay en slot bottom falla", any("zona de subtítulos" in e for e in validate_story(s3, None, None, "bucle")))
s4 = copy.deepcopy(STORY)
s4["beats"][3]["scene"]["camera"] = {"preset": "hold"}
check("cámara hold falla", any("'hold'" in e for e in validate_story(s4, None, None, "bucle")))
s5 = copy.deepcopy(STORY)
s5["beats"][4].pop("keywords")
check("beat sin keywords falla", any("palabras clave" in e for e in validate_story(s5, None, None, "bucle")))

# --- plan de SFX con palabras sintéticas (0,27 s por palabra)
words, t = [], 0.1
for b in STORY["beats"]:
    for w in b["text"].split():
        words.append({"w": w, "start": round(t, 3), "end": round(t + 0.25, 3), "beat": b["id"]})
        t += 0.27
ev = plan(STORY, words)["events"]
check("impact en el segundo 0", any(e["type"] == "impact" and e["t"] == 0.0 for e in ev))
scenes = [e for e in ev if e["type"] == "whoosh_soft" and "cambio de escena" in e["why"]]
check("un whoosh por cada cambio de escena", len(scenes) == len(STORY["beats"]) - 1, str(len(scenes)))
risers = {e["why"].split(":")[0] for e in ev if e["type"] == "riser"}
roles = {b["id"] for b in STORY["beats"] if b["role"] in ("rupture", "twist")}
check("riser antes de rupture y twist", risers == roles, f"{risers} vs {roles}")
st2 = copy.deepcopy(STORY)
st2["meta"].pop("pacing")
ev2 = plan(st2, words)["events"]
check("sin el perfil no hay impact en 0 ni whoosh de escena", not any(e["t"] == 0.0 and e["type"] == "impact" for e in ev2) and not any("cambio de escena" in e["why"] for e in ev2))
sys.exit(1 if bad else 0)
