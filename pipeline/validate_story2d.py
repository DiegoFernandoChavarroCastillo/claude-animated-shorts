"""Valida 05_story.json del motor 2D (engine "2d", plan story-2d) contra templates/catalog2d.json.

    python pipeline/validate_story2d.py <05_story.json> [--words 04_words.json] [--script 02_SCRIPT.md]

Lista TODOS los problemas de una vez. Falla si: falta `shows`; un asset / paleta / luz / cámara / transición / overlay / acción no existe;
una capa sale del cuadro o su escala no es razonable; una acción apunta a una capa que no está en el beat; los roles no siguen la estructura;
hay más de 3 cortes por minuto; (con --words) el gancho dura más de 3,2 s, no hay acción antes de 1 s, hay huecos de más de 3,5 s sin cambios,
o el cierre es `bucle` y el último beat no vuelve a la paleta y a los assets del primero (o meta.tailS > 0,3). Con --script, el texto de los beats es el del guion.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, load_json, run_main, words_of  # noqa: E402
from validate_story import hook_title_errors  # noqa: E402
from validate_story import (CUTS_PER_MIN, FAREWELL_ES, HOOK_ACTION_S, HOOK_MAX_S, LOOP_TAIL_MAX_S, MAX_ACTIONS, MAX_EVENT_GAP_S,  # noqa: E402
                            MAX_INSERT_HOLD, MAX_INSERT_TEXT, MAX_INSERTS, MAX_SHOTS, MIN_SHOT_GAP_S, WPS, at_seconds, event_gaps,
                            resolves, script_closing, script_lines)

MAX_LAYERS = 9           # capas por beat (más y la escena se vuelve ilegible)
SCALE_RANGE = (0.05, 3.0)
HOOK_STATIC_CAMERAS = ("hold",)
STRUCTURE_DEFAULT = "alegoria"
CLASSIC_2D_GAP_S = 3.5   # historias 2D sin perfil viral: el explainer bajó a 3,0 s (D121); estas conservan su ritmo
PACING = load_json(ROOT / "templates" / "pacing_viral.json")   # perfil `meta.pacing: "viral"`


def _num(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def _vec(v, n: int) -> bool:
    return isinstance(v, list) and len(v) == n and all(_num(x) for x in v)


def validate(story: dict, words: list | None = None, script: list[str] | None = None, closing: str | None = None,
             structure: str | None = None, order: list[str] | None = None) -> list[str]:
    cat = load_json(ROOT / "templates" / "catalog2d.json")
    cat3 = load_json(ROOT / "templates" / "catalog.json")
    overlays_ok = {k for k, v in cat3["overlays"].items() if not v.get("anchored")}
    errs: list[str] = []
    beats = story.get("beats", [])
    meta = story.get("meta", {})
    if not beats:
        return ["story.json sin beats"]
    if meta.get("engine") != "2d":
        errs.append('meta.engine debe ser "2d"')
    if meta.get("lang") not in ("es", "en"):
        errs.append("meta.lang debe ser es o en")
    errs += hook_title_errors(meta)
    viral = meta.get("pacing") == "viral"
    cap = PACING["captions"]
    gap_max = PACING["cadence"]["eventGapMaxS"] if viral else CLASSIC_2D_GAP_S
    if viral and meta.get("captionEmphasis") not in (None, cap["emphasis"]):
        errs.append(f"el perfil viral resalta las palabras clave con color (captionEmphasis '{cap['emphasis']}')")
    inserts = 0
    for b in beats:
        bid, s, text = b.get("id", "?"), b.get("scene", {}), b.get("text", "")
        if not str(b.get("shows", "")).strip():
            errs.append(f"{bid}: falta `shows` (una frase de lo que se ve; si no coincide con la voz, cambia la escena)")
        if s.get("palette") not in cat["palettes"]:
            errs.append(f"{bid}: palette '{s.get('palette')}' no existe ({', '.join(cat['palettes'])})")
        if s.get("light") not in cat["lights"]:
            errs.append(f"{bid}: light '{s.get('light')}' no existe ({', '.join(cat['lights'])})")
        layers = s.get("layers", [])
        if not layers:
            errs.append(f"{bid}: el beat no tiene capas (scene.layers)")
        if len(layers) > MAX_LAYERS:
            errs.append(f"{bid}: {len(layers)} capas (máximo {MAX_LAYERS})")
        names: dict[str, dict] = {}
        for k, ly in enumerate(layers):
            a = ly.get("asset")
            if a not in cat["assets"]:
                errs.append(f"{bid}: layers[{k}].asset '{a}' no existe en catalog2d.json (tools/catalog_search2d.py <palabras>)")
                continue
            names.setdefault(ly.get("id", a), ly)
            if viral and cat["assets"][a].get("kind") != "fondo" and ly.get("at", [0.5, 1.0])[1] > cap["layerFeetMaxY"]:
                errs.append(f"{bid}: layers[{k}] ({a}) tiene los pies en y={ly.get('at', [0.5, 1.0])[1]} y los subtítulos virales ocupan "
                            f"{PACING['qa']['captionBand'][0]:.2f}–{PACING['qa']['captionBand'][1]:.2f}: sube la capa (y ≤ {cap['layerFeetMaxY']})")
            if "at" in ly and (not _vec(ly["at"], 2) or not all(-0.5 <= v <= 1.5 for v in ly["at"])):
                errs.append(f"{bid}: layers[{k}].at debe ser [x, y] entre -0.5 y 1.5 (0–1 es el cuadro)")
            if "scale" in ly and not (_num(ly["scale"]) and SCALE_RANGE[0] <= ly["scale"] <= SCALE_RANGE[1]):
                errs.append(f"{bid}: layers[{k}].scale fuera de {SCALE_RANGE[0]}–{SCALE_RANGE[1]}")
            for ik, iv in (ly.get("init") or {}).items():
                if ik not in cat["assets"][a].get("actions", {}) or not (_num(iv) and 0 <= iv <= 1):
                    errs.append(f"{bid}: layers[{k}].init '{ik}' debe ser una acción propia de {a} con valor 0–1")
            if "z" in ly and not _num(ly["z"]):
                errs.append(f"{bid}: layers[{k}].z debe ser un número")
        cam = s.get("camera", {})
        if viral and PACING["cadence"]["noHoldCamera"] and cam.get("preset") == "hold":
            errs.append(f"{bid}: cámara 'hold' en el perfil viral: usa push_in, pull_out o pan_slow (movimiento constante)")
        if cam.get("preset") not in cat["camera"]:
            errs.append(f"{bid}: preset de cámara '{cam.get('preset')}' no existe ({', '.join(cat['camera'])})")
        for key in ("from", "to"):
            if key in cam and not _vec(cam[key], 3):
                errs.append(f"{bid}: camera.{key} debe ser [cx, cy, zoom]")
        if cam.get("preset") == "pan_slow" and "to" not in cam:
            errs.append(f"{bid}: pan_slow necesita camera.to")
        if b.get("transition", "crossfade") not in cat["transitions"]:
            errs.append(f"{bid}: transición '{b.get('transition')}' no existe ({', '.join(cat['transitions'])})")
        for kw in ([b["keyword"]] if b.get("keyword") else []) + list(b.get("keywords", [])):
            if kw.lower() not in [w.lower() for w in words_of(text)] and kw.lower() not in [w.lower() for w in text.split()]:
                errs.append(f"{bid}: keyword '{kw}' no está en el texto del beat")
        if viral and not (b.get("keyword") or b.get("keywords")):
            errs.append(f"{bid}: el perfil viral resalta palabras clave en amarillo: añade `keyword` o `keywords` al beat")
        for o in b.get("overlays", []):
            t = o.get("type")
            if t not in overlays_ok:
                errs.append(f"{bid}: overlay '{t}' no sirve en 2D (solo los no anclados: {', '.join(sorted(overlays_ok))})")
            if o.get("slot") and o["slot"] not in cat["overlay_slots"]:
                errs.append(f"{bid}: slot '{o['slot']}' no existe")
            if viral and o.get("slot", "lower") in cap["forbiddenSlots"]:
                errs.append(f"{bid}: overlay en el slot '{o.get('slot', 'lower')}' (zona de subtítulos del perfil viral): usa top, upper o center")
            if not resolves(o.get("at"), text):
                errs.append(f"{bid}: overlay at '{o.get('at')}' no es una palabra del beat")
            if t == "Insert":
                inserts += 1
                if b is beats[0]:
                    errs.append(f"{bid}: un Insert no va en el gancho")
                if not 15 <= o.get("hold", 36) <= MAX_INSERT_HOLD:
                    errs.append(f"{bid}: Insert hold fuera de 15–{MAX_INSERT_HOLD}")
                if len(str(o.get("text", ""))) > MAX_INSERT_TEXT:
                    errs.append(f"{bid}: Insert text de más de {MAX_INSERT_TEXT} letras")
        acts = b.get("actions", [])
        if len(acts) > MAX_ACTIONS:
            errs.append(f"{bid}: {len(acts)} acciones (máximo {MAX_ACTIONS} por beat)")
        for x in acts:
            t, tg = x.get("type"), x.get("target")
            if not resolves(x.get("at"), text):
                errs.append(f"{bid}: acción {t} at '{x.get('at')}' no es una palabra del beat")
            gen = cat["actions"].get(t)
            if gen:
                if gen["scope"] == "capa" and tg not in names:
                    errs.append(f"{bid}: acción {t} necesita `target` = una capa del beat ({', '.join(names)})")
                if t == "palette_shift" and x.get("to") not in cat["palettes"]:
                    errs.append(f"{bid}: palette_shift necesita `to` = una paleta ({', '.join(cat['palettes'])})")
                continue
            if tg not in names:
                errs.append(f"{bid}: acción '{t}' necesita `target` = una capa del beat ({', '.join(names)})")
            elif t not in cat["assets"][names[tg]["asset"]].get("actions", {}):
                errs.append(f"{bid}: acción '{t}' no existe para {names[tg]['asset']} (propias: {', '.join(cat['assets'][names[tg]['asset']].get('actions', {})) or 'ninguna'}; "
                            f"genéricas: {', '.join(cat['actions'])})")
        for x in b.get("sfx", []):
            if x.get("type") not in cat3["sfx"]:
                errs.append(f"{bid}: sfx '{x.get('type')}' no existe")
            if not resolves(x.get("at"), text):
                errs.append(f"{bid}: sfx con at '{x.get('at')}' que no es una palabra del beat")
        shots = b.get("shots", [])
        if len(shots) > MAX_SHOTS:
            errs.append(f"{bid}: {len(shots)} sub-planos (máximo {MAX_SHOTS})")
        for sh in shots:
            if sh.get("camera", {}).get("preset") not in cat["camera"]:
                errs.append(f"{bid}: sub-plano con cámara '{sh.get('camera', {}).get('preset')}' que no existe")
            if not resolves(sh.get("at"), text):
                errs.append(f"{bid}: sub-plano at '{sh.get('at')}' no es una palabra del beat")
    if sum(len(b.get("sfx", [])) for b in beats) > 3:
        errs.append("más de 3 sfx a mano en el video (el director de acentos ya pone los de las acciones)")
    if inserts > MAX_INSERTS:
        errs.append(f"{inserts} Insert en el video (máximo {MAX_INSERTS})")

    with_actions = sum(1 for b in beats if b.get("actions"))
    if with_actions < -(-len(beats) // 2):
        errs.append(f"solo {with_actions} de {len(beats)} beats llevan acciones (hacen falta al menos {-(-len(beats) // 2)}): que la escena reaccione a lo que dice la voz")
    # estructura: los roles siguen el orden de la estructura (cada uno puede repetirse) y cumplen sus mínimos
    st = cat["structures"].get(structure or STRUCTURE_DEFAULT)
    if not st and order:   # estructura nueva del guion (D120): su orden lo declara `beats:` y ya lo validó validate_script
        st = {"order": order}
    if not st:
        errs.append(f"estructura '{structure}' sin orden conocido (del catálogo 2D: {', '.join(cat['structures'])}; "
                    "una nueva necesita `beats:` en 02_SCRIPT.md y pasar --script)")
    else:
        roles = [b.get("role") for b in beats]
        bad = [r for r in roles if r not in st["order"]]
        if bad:
            errs.append(f"roles fuera de la estructura {structure or STRUCTURE_DEFAULT}: {', '.join(sorted(set(bad)))} (orden: {' → '.join(st['order'])})")
        else:
            idx = [st["order"].index(r) for r in roles]
            if idx != sorted(idx):
                errs.append(f"los roles no siguen el orden {' → '.join(st['order'])}: {' → '.join(roles)}")
            for r, n in st.get("min", {}).items():
                if roles.count(r) < n:
                    errs.append(f"la estructura necesita al menos {n} beat(s) `{r}`")
            if roles[0] != st["order"][0]:
                errs.append(f"el primer beat debe ser `{st['order'][0]}`")

    # cortes por minuto (la transición del último beat no se usa)
    dur = (words[-1]["end"] + 1.0) if words else sum(len(words_of(b.get("text", ""))) for b in beats) / WPS
    cuts = sum(1 for b in beats[:-1] if b.get("transition") == "cut")
    if cuts / (dur / 60) > CUTS_PER_MIN:
        errs.append(f"{cuts} cortes en {dur:.0f} s = {cuts / (dur / 60):.1f} por minuto (máximo {CUTS_PER_MIN})")

    if words is not None:
        ids = [b["id"] for b in beats]
        missing = [i for i in ids if not any(w["beat"] == i for w in words)]
        if missing:
            errs.append(f"words.json no tiene palabras de los beats {', '.join(missing)}")
        else:
            w1 = [w for w in words if w["beat"] == beats[0]["id"]]
            if w1[-1]["end"] > HOOK_MAX_S:
                errs.append(f"el gancho dura {w1[-1]['end']:.1f} s hablado (máximo {HOOK_MAX_S:.1f} s): acórtalo (unas 8–9 palabras)")
            acts = [at_seconds(beats[0], w1, x.get("at"), 0.0) for x in beats[0].get("actions", [])]
            if not acts or min(acts) > HOOK_ACTION_S:
                errs.append(f"el primer beat no tiene una acción antes de {HOOK_ACTION_S:.0f} s: abre con movimiento (ej. pop, tremble o appear con at en la 1.ª o 2.ª palabra)")
            if beats[0].get("scene", {}).get("camera", {}).get("preset") in HOOK_STATIC_CAMERAS:
                errs.append("el primer beat usa la cámara 'hold', demasiado quieta para el gancho: usa push_in o pull_out")
            for gap, at, bid in event_gaps(story, words, gap_max):
                errs.append(f"{gap:.1f} s sin ningún cambio en pantalla desde el segundo {at:.1f} (beat {bid}; máximo {gap_max} s): añade una acción o un overlay en ese tramo")
            for b in beats:
                ws = [w for w in words if w["beat"] == b["id"]]
                ts = sorted(at_seconds(b, ws, x.get("at"), 0.0) for x in b.get("shots", []))
                if any(c - a < MIN_SHOT_GAP_S for a, c in zip(ts, ts[1:])):
                    errs.append(f"{b['id']}: dos sub-planos a menos de {MIN_SHOT_GAP_S} s")
    if closing == "bucle" and len(beats) > 1:
        a0, a1 = beats[0].get("scene", {}), beats[-1].get("scene", {})
        set0, set1 = {ly.get("asset") for ly in a0.get("layers", [])}, {ly.get("asset") for ly in a1.get("layers", [])}
        if a0.get("palette") != a1.get("palette") or set0 != set1:
            errs.append(f"el cierre es `bucle`: el último beat debe volver a la paleta ({a0.get('palette')}) y a los assets del primero ({', '.join(sorted(set0))})")
        if meta.get("tailS", 1.0) > LOOP_TAIL_MAX_S:
            errs.append(f"el cierre es `bucle` y meta.tailS vale {meta.get('tailS', 1.0)} (por defecto 1.0): pon meta.tailS = 0.2")
    if script is not None:
        texts = [b.get("text", "") for b in beats]
        if texts != script:
            for k, (a, c) in enumerate(zip(texts, script)):
                if a != c:
                    errs.append(f"beat {k + 1} no coincide con la línea {k + 1} del guion: {a[:40]!r} vs {c[:40]!r}")
                    break
            if len(texts) != len(script):
                errs.append(f"{len(texts)} beats para {len(script)} líneas de guion")
        if closing == "bucle":
            import re
            if re.search(FAREWELL_ES, texts[-1], re.I):
                errs.append("el cierre en bucle no se despide (gracias, adiós, suscríbete…)")
    return errs


def script_structure(md: str) -> str | None:
    import re
    m = re.search(r"^structure:\s*(\w+)", md, re.M)
    return m.group(1) if m else None


def script_beats(md: str) -> list[str] | None:
    """`beats:` de una estructura nueva (D120), con el mismo formato que lee validate_script"""
    import re
    from validate_script import beats_of
    m = re.search(r"^beats:\s*(.+)$", md, re.M | re.I)
    return beats_of(m.group(1)) if m else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("story", type=Path)
    ap.add_argument("--words", type=Path)
    ap.add_argument("--script", type=Path)
    a = ap.parse_args()
    md = a.script.read_text(encoding="utf-8") if a.script else None
    errs = validate(load_json(a.story), load_json(a.words) if a.words else None, script_lines(md) if md else None,
                    script_closing(md) if md else None, script_structure(md) if md else None, script_beats(md) if md else None)
    print(f"{'PASA' if not errs else 'FALLA'}: {a.story}")
    for e in errs:
        print(f"  - {e}")
    sys.exit(0 if not errs else 1)


if __name__ == "__main__":
    run_main(main)
