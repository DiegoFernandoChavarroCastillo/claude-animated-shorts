"""Pruebas de validate_story2d.py (python pipeline/tests/test_validate_story2d.py)."""
import copy
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from validate_story2d import validate  # noqa: E402

TEXTS = ["Todo lo que ves son sombras.", "Viven encadenados mirando la pared.", "Uno sube hacia la luz.", "Nada era como creían.", "Y así volvemos a las sombras."]
ROLES = ["hook", "scene", "ascent", "twist", "cta"]
CAVE = [{"asset": "cueva_corte", "z": 0}, {"asset": "pared_sombras", "z": 1, "at": [0.5, 0.5], "scale": 0.85}, {"asset": "prisioneros", "z": 2, "at": [0.5, 0.8], "scale": 0.5}]


def base() -> dict:
    beats = []
    for i, (t, r) in enumerate(zip(TEXTS, ROLES)):
        beats.append({"id": f"b{i + 1}", "role": r, "text": t, "keyword": t.split()[-1], "shows": "una cueva con prisioneros",
                      "scene": {"palette": "cueva", "light": "fuego", "layers": copy.deepcopy(CAVE), "camera": {"preset": "push_in"}},
                      "overlays": [{"type": "Pill", "at": t.split()[0], "text": "SOMBRAS"}],
                      "actions": [{"type": "pop", "at": t.split()[0], "target": "prisioneros"}], "transition": "crossfade"})
    return {"meta": {"lang": "es", "engine": "2d", "tailS": 0.2}, "beats": beats}


def words(per=0.45, gap_after=None) -> list:
    out, t = [], 0.1
    for i, tx in enumerate(TEXTS):
        for w in tx.split():
            out.append({"w": w, "start": round(t, 2), "end": round(t + per, 2), "beat": f"b{i + 1}"})
            t += per
        t += (gap_after or {}).get(i, 0.2)
    return out


def has(errs, frag):
    return any(frag in e for e in errs)


fails = 0


def check(name, ok, errs=None):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else errs)
    fails += not ok


check("story válido pasa", not validate(base(), words(), closing="bucle"), validate(base(), words(), closing="bucle"))
s = base(); del s["beats"][1]["shows"]
check("sin shows falla", has(validate(s), "falta `shows`"))
s = base(); s["beats"][0]["scene"]["layers"][0]["asset"] = "dragon"
check("asset inexistente falla", has(validate(s), "'dragon' no existe"))
s = base(); s["beats"][0]["scene"]["palette"] = "neon"; s["beats"][0]["scene"]["light"] = "rayo"
e = validate(s); check("paleta y luz inexistentes fallan", has(e, "palette 'neon'") and has(e, "light 'rayo'"), e)
s = base(); s["beats"][0]["scene"]["layers"][1]["at"] = [3.0, 0.5]; s["beats"][0]["scene"]["layers"][2]["scale"] = 10
e = validate(s); check("capa fuera del cuadro o con escala absurda falla", has(e, ".at debe ser") and has(e, ".scale fuera"), e)
s = base(); s["beats"][0]["actions"][0]["target"] = "fuego"
check("acción con target ausente falla", has(validate(s), "necesita `target` = una capa del beat"))
s = base(); s["beats"][0]["scene"]["layers"].append({"asset": "fuego", "z": 3}); s["beats"][0]["actions"][0] = {"type": "stand_up", "at": "Todo", "target": "fuego"}
check("acción propia de otro asset falla", has(validate(s), "'stand_up' no existe para fuego"))
s = base(); s["beats"][0]["scene"]["layers"].append({"asset": "fuego", "z": 3}); s["beats"][0]["actions"][0] = {"type": "flare", "at": "Todo", "target": "fuego"}
check("acción propia del asset correcto pasa", not has(validate(s), "no existe para"))
s = base(); s["beats"][0]["role"], s["beats"][1]["role"] = "scene", "hook"
e = validate(s); check("roles en mal orden fallan", has(e, "no siguen el orden") or has(e, "primer beat debe ser"), e)
s = base(); s["beats"][2]["role"] = "scene"
check("sin ascenso falla", has(validate(s), "al menos 1 beat(s) `ascent`"))
s = base(); s["beats"][1]["overlays"].append({"type": "Callout3D", "at": "Viven", "text": "x"})
check("overlay anclado (3D) falla", has(validate(s), "no sirve en 2D"))
s = base()
for b in s["beats"]:
    b["transition"] = "cut"
check("demasiados cortes fallan", has(validate(s), "cortes en"))
s = base(); s["beats"][0]["scene"]["palette"] = "x"; del s["beats"][1]["shows"]; s["beats"][2]["scene"]["camera"]["preset"] = "dolly"
check("varios problemas se listan a la vez", len(validate(s)) >= 3, validate(s))
s = base(); s["meta"]["engine"] = "3d"
check("engine distinto de 2d falla", has(validate(s), 'meta.engine debe ser "2d"'))
check("estructura sin implementar falla", has(validate(base(), structure="reflexion"), "sin implementar"))
check("gancho largo falla", has(validate(base(), words(per=0.9)), "el gancho dura"))
s = base(); s["beats"][0]["actions"] = []
check("gancho sin acción falla", has(validate(s, words()), "no tiene una acción antes de 1 s"))
s = base(); s["beats"][0]["scene"]["camera"]["preset"] = "hold"
check("gancho con cámara hold falla", has(validate(s, words()), "demasiado quieta"))
s = base()
for b in s["beats"][1:]:
    b["actions"], b["overlays"] = [], []
e = validate(s, words(per=0.8)); check("huecos largos se listan con su beat", has(e, "sin ningún cambio en pantalla") and has(e, "beat b"), e)
s = base(); s["beats"][4]["scene"]["palette"] = "exterior"
check("bucle con paleta distinta falla", has(validate(s, words(), closing="bucle"), "debe volver a la paleta"))
s = base(); s["beats"][4]["scene"]["layers"] = [{"asset": "cueva_corte", "z": 0}]
check("bucle con otros assets falla", has(validate(s, words(), closing="bucle"), "debe volver a la paleta"))
s = base(); s["meta"]["tailS"] = 1.0
check("bucle con cola larga falla", has(validate(s, words(), closing="bucle"), "meta.tailS"))
check("guion distinto falla", has(validate(base(), script=["otra cosa"] * 5), "no coincide con la línea"))
check("guion igual pasa", not has(validate(base(), script=TEXTS), "guion"))
s = base(); s["beats"][1]["sfx"] = [{"type": "chains", "at": "Viven"}]
check("sfx a mano válido pasa", not has(validate(s), "sfx"))
s = base(); s["beats"][1]["sfx"] = [{"type": "trueno", "at": "Viven"}]
check("sfx inexistente falla", has(validate(s), "sfx 'trueno' no existe"))
s = base()
for i in range(4):
    s["beats"][i]["sfx"] = [{"type": "chains", "at": s["beats"][i]["text"].split()[0]}]
check("más de 3 sfx a mano fallan", has(validate(s), "más de 3 sfx"))
s = base(); s["beats"][0]["scene"]["layers"].append({"asset": "prisionero_libre", "z": 3, "init": {"stand_up": 1}})
check("init con acción propia pasa", not has(validate(s), "init"))
s = base(); s["beats"][0]["scene"]["layers"].append({"asset": "prisionero_libre", "z": 3, "init": {"flare": 1}})
check("init con acción ajena falla", has(validate(s), "layers[3].init 'flare'"))
from common import ROOT, load_json  # noqa: E402
from validate_story import script_closing, script_lines  # noqa: E402
from validate_story2d import script_structure  # noqa: E402
ex = ROOT / "templates" / "examples" / "mito-caverna"
md = (ex / "02_SCRIPT.md").read_text(encoding="utf-8")
e = validate(load_json(ex / "05_story.json"), load_json(ex / "04_words.json"), script_lines(md), script_closing(md), script_structure(md))
check("el ejemplo mito-caverna (story + palabras + guion) pasa", not e, e)
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
