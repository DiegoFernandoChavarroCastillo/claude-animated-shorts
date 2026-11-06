"""Etapa 5b: valida 05_story.json contra el catálogo y el contrato (plan §6).

    python pipeline\\validate_story.py <05_story.json> [--words 04_words.json] [--script 02_SCRIPT.md]

Falla si: un env / luz / hero (kind, asset, pose) / overlay / ancla / preset de cámara / transición / sfx no existe en
templates/catalog.json; un "at" no resuelve a una palabra del beat; un beat mechanism, item, versus o chain no tiene overlay; hay más de 3
"cut" por minuto; (F16, con --words) el gancho se dice en más de 3 s, el primer beat no tiene acción antes de 1 s o usa cámara drift, pasan más de 3,5 s sin un cambio en pantalla, o el cierre es `bucle` con meta.tailS > 0,3; un mismo objeto protagonista en más de 3 beats seguidos o en más del 65 % de los beats; una acción que no existe, con ancla inválida, con "at" que no es una palabra o más de 3 por beat (con --require-actions, menos de la mitad de los beats con acciones); un beat con overlay numérico no tiene "sources"; la keyword no está en el texto. Con --script,
además, el texto de los beats debe ser el del guion aprobado, línea a línea.
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, load_json, norm, run_main, words_of  # noqa: E402

CUTS_PER_MIN = 3
OVERLAY_ROLES = ("mechanism", "item", "versus", "chain")   # beats que explican un paso o un punto: llevan un overlay de dato
MAX_ACTIONS = 3          # acciones por beat (F13)
MIN_ACTION_SHARE = 0.5   # fracción mínima de beats con al menos una acción cuando se exige (--require-actions)
MAX_HERO_RUN = 3        # beats seguidos con el mismo objeto protagonista (garganta-gripe usó 8 de 8 y salió plano)
MAX_HERO_SHARE = 0.65   # fracción máxima de beats con el mismo objeto (celular-calienta: 5 de 8 = 0,62 pasa)
WPS = 2.8  # para estimar la duración si no hay words.json
# F16 · gancho, ritmo y bucle (con words.json)
HOOK_MAX_S = 3.2         # el primer beat (gancho) se dice en unos 3 s (margen de 0,2 s)
HOOK_ACTION_S = 1.0      # y lleva una acción que empieza antes de 1,0 s
HOOK_STATIC_CAMERAS = ("drift",)   # cámaras demasiado suaves para el primer beat
MAX_EVENT_GAP_S = 3.5    # tiempo máximo sin corte, acción u overlay
LOOP_TAIL_MAX_S = 0.3    # con cierre `bucle`, la cola tras la última palabra (meta.tailS)
FPS = 30
FAREWELL_ES = r"gracias|adi[oó]s|hasta (luego|pronto|la pr[oó]xima)|nos vemos|suscr[ií]b|s[ií]gueme|comenta|dale (like|me gusta)|d[eé]jame|deja tu|hasta aqu[ií]"
MAX_INSERTS = 3          # insertos (cortes de datos de ~1 s) por video (F18)
MAX_INSERT_HOLD = 60     # frames que dura un inserto como máximo (2 s)
MAX_INSERT_TEXT = 18     # letras del texto de un inserto
MAX_SHOTS = 3            # sub-planos por beat (F17)
MIN_SHOT_GAP_S = 1.5     # separación mínima entre dos cambios de plano dentro de un beat


def resolves(at, text: str) -> bool:
    ws = words_of(text)
    if at is None:
        return True
    if isinstance(at, (int, float)):
        return at >= 0
    m = re.fullmatch(r"#(\d+)", str(at))
    if m:
        return int(m.group(1)) < len(ws)
    return norm(str(at)) in {norm(w) for w in ws}


def at_seconds(beat: dict, ws: list, at, a_s: float) -> float:
    """segundo en que cae un `at` del beat: None = inicio del beat, número = frames desde el inicio, palabra o #n = su inicio"""
    if at is None:
        return a_s
    if isinstance(at, (int, float)):
        return a_s + at / FPS
    m = re.fullmatch(r"#(\d+)", str(at))
    if m:
        return ws[int(m.group(1))]["start"] if int(m.group(1)) < len(ws) else a_s
    return next((w["start"] for w in ws if norm(w["w"]) == norm(str(at))), a_s)


def event_times(story: dict, words: list) -> list[float]:
    """momentos en que cambia algo en pantalla: inicio de cada beat, overlays y acciones (en segundos)"""
    ev, starts = [0.0], []
    for b in story["beats"]:
        ws = [w for w in words if w["beat"] == b["id"]]
        a_s = 0.0 if not starts else max(0.0, ws[0]["start"] - 2 / FPS)
        starts.append(a_s)
        ev.append(a_s)
        ev += [at_seconds(b, ws, o.get("at"), a_s) for o in b.get("overlays", [])]
        ev += [at_seconds(b, ws, x.get("at"), a_s) for x in b.get("actions", [])]
        ev += [at_seconds(b, ws, x.get("at"), a_s) for x in b.get("shots", [])]
    return sorted(ev)


def event_gap(story: dict, words: list) -> tuple[float, float]:
    """(hueco más largo sin eventos en s, segundo en que empieza); cuenta también hasta el final del video"""
    end = words[-1]["end"] + story["meta"].get("tailS", 1.0)
    ev = event_times(story, words) + [end]
    gap, at = max(((b - a, a) for a, b in zip(ev, ev[1:])), key=lambda g: g[0])
    return gap, at


def validate(story: dict, words: list | None = None, script_lines: list[str] | None = None, require_actions: bool = False,
             closing: str | None = None) -> list[str]:
    cat = load_json(ROOT / "templates" / "catalog.json")
    errs: list[str] = []
    beats = story.get("beats", [])
    if not beats:
        return ["story.json sin beats"]
    if story.get("meta", {}).get("lang") not in ("es", "en"):
        errs.append("meta.lang debe ser es o en")
    for b in beats:
        bid, s = b.get("id", "?"), b.get("scene", {})
        if s.get("env") not in cat["envs"]:
            errs.append(f"{bid}: env '{s.get('env')}' no existe")
        if s.get("light") not in cat["lights"]:
            errs.append(f"{bid}: light '{s.get('light')}' no existe")
        hero = s.get("hero", {})
        h = cat["heroes"].get(hero.get("asset"))
        if not h:
            errs.append(f"{bid}: hero.asset '{hero.get('asset')}' no existe")
        else:
            if hero.get("kind") != h["kind"]:
                errs.append(f"{bid}: hero.kind '{hero.get('kind')}' no corresponde a {hero.get('asset')} ({h['kind']})")
            if hero.get("pose") and hero["pose"] not in h["poses"]:
                errs.append(f"{bid}: pose '{hero['pose']}' no existe para {hero.get('asset')} ({', '.join(h['poses'])})")
        if s.get("camera", {}).get("preset") not in cat["camera"]:
            errs.append(f"{bid}: preset de cámara '{s.get('camera', {}).get('preset')}' no existe")
        cam = s.get("camera", {})
        if cam.get("preset") == "follow_anchor" and (not cam.get("anchor") or (h and cam["anchor"] not in h["anchors"])):
            errs.append(f"{bid}: follow_anchor necesita camera.anchor, un ancla de {hero.get('asset')}")
        if b.get("transition", "glide") not in cat["transitions"]:
            errs.append(f"{bid}: transición '{b.get('transition')}' no existe")
        text = b.get("text", "")
        if b.get("keyword") and not resolves(b["keyword"], text):
            errs.append(f"{bid}: keyword '{b['keyword']}' no está en el texto")
        ovs = b.get("overlays", [])
        if b.get("role") in OVERLAY_ROLES and not ovs:
            errs.append(f"{bid}: beat {b['role']} sin overlay de dato")
        numeric = False
        for o in ovs:
            d = cat["overlays"].get(o.get("type"))
            if not d:
                errs.append(f"{bid}: overlay '{o.get('type')}' no existe")
                continue
            numeric |= bool(d.get("numeric"))
            if not resolves(o.get("at"), text):
                errs.append(f"{bid}: {o['type']} con at '{o.get('at')}' que no es una palabra del beat")
            if "anchor" in o and (not d["anchored"] or (h and o["anchor"] not in h["anchors"])):
                errs.append(f"{bid}: {o['type']} con anchor '{o['anchor']}' no válido")
            if o.get("type") == "Insert":
                if b.get("role") == "hook":
                    errs.append(f"{bid}: un Insert no va en el gancho (tapa el primer segundo)")
                if not isinstance(o.get("hold", 36), int) or o.get("hold", 36) > MAX_INSERT_HOLD or o.get("hold", 36) < 15:
                    errs.append(f"{bid}: Insert con hold {o.get('hold')} (entre 15 y {MAX_INSERT_HOLD} frames)")
                if len(str(o.get("text", ""))) > MAX_INSERT_TEXT or not o.get("text"):
                    errs.append(f"{bid}: el texto del Insert debe tener entre 1 y {MAX_INSERT_TEXT} letras")
                if o.get("icon", "star") not in cat["icons"]:
                    errs.append(f"{bid}: Insert con icono '{o.get('icon')}' que no existe")
            if o.get("type") == "FlowArrow" and (not o.get("to") or (h and o["to"] not in h["anchors"])):
                errs.append(f"{bid}: FlowArrow necesita 'to', un ancla de {hero.get('asset')}")
        if numeric and not b.get("sources"):
            errs.append(f"{bid}: overlay con número sin 'sources'")
        acts = b.get("actions", [])
        if len(acts) > MAX_ACTIONS:
            errs.append(f"{bid}: {len(acts)} acciones (máximo {MAX_ACTIONS} por beat)")
        own = (h or {}).get("actions", {})
        for a in acts:
            t = a.get("type")
            if t not in cat.get("actions", {}) and t not in own:
                errs.append(f"{bid}: acción '{t}' no existe (ni genérica ni de {hero.get('asset')}; propias: {', '.join(own) or 'ninguna'})")
            if a.get("anchor") and h and a["anchor"] not in h["anchors"]:
                errs.append(f"{bid}: acción {t} con anchor '{a['anchor']}' no válido")
            if not resolves(a.get("at"), text):
                errs.append(f"{bid}: acción {t} con at '{a.get('at')}' que no es una palabra del beat")
            if a.get("dur") is not None and not isinstance(a["dur"], int):
                errs.append(f"{bid}: acción {t} con dur que no es un entero de frames")
        shots = b.get("shots", [])
        if len(shots) > MAX_SHOTS:
            errs.append(f"{bid}: {len(shots)} sub-planos (máximo {MAX_SHOTS})")
        prev = b.get("scene", {}).get("camera", {})
        for x in shots:
            cp = x.get("camera", {})
            if cp.get("preset") not in cat["camera"]:
                errs.append(f"{bid}: shot con cámara '{cp.get('preset')}' que no existe")
            if not resolves(x.get("at"), text):
                errs.append(f"{bid}: shot con at '{x.get('at')}' que no es una palabra del beat")
            if cp.get("preset") == prev.get("preset") and cp.get("deg") == prev.get("deg") and cp.get("dir") == prev.get("dir"):
                errs.append(f"{bid}: un sub-plano repite la cámara anterior ({cp.get('preset')}): cambia de preset para que se note")
            prev = cp
        for x in b.get("sfx", []):
            if x.get("type") not in cat["sfx"]:
                errs.append(f"{bid}: sfx '{x.get('type')}' no existe")
            if not resolves(x.get("at"), text):
                errs.append(f"{bid}: sfx con at '{x.get('at')}' que no es una palabra del beat")
    n_ins = sum(1 for b in beats for o in b.get("overlays", []) if o.get("type") == "Insert")
    if n_ins > MAX_INSERTS:
        errs.append(f"{n_ins} Insert en el video (máximo {MAX_INSERTS}): son cortes, no decoración")
    # variedad visual: un mismo protagonista no puede ocupar casi todo el video
    assets = [b.get("scene", {}).get("hero", {}).get("asset") for b in beats]
    run = best = 1
    for a, b in zip(assets, assets[1:]):
        run = run + 1 if a == b else 1
        best = max(best, run)
    if best > MAX_HERO_RUN:
        errs.append(f"el mismo objeto protagonista sale en {best} beats seguidos (máximo {MAX_HERO_RUN}): usa otro del catálogo "
                    f"(tools/catalog_search.py) o apunta el hueco en 05_gaps.md")
    top, n = max(((a, assets.count(a)) for a in set(assets)), key=lambda t: t[1])
    if len(beats) >= 5 and n / len(beats) > MAX_HERO_SHARE:
        errs.append(f"'{top}' es el protagonista de {n} de {len(beats)} beats (máximo {MAX_HERO_SHARE:.0%}): reparte los objetos")
    if require_actions:
        with_actions = sum(1 for b in beats if b.get("actions"))
        need = -(-len(beats) // 2)
        if with_actions < need:
            errs.append(f"solo {with_actions} de {len(beats)} beats llevan acciones (hacen falta al menos {need}): que el objeto reaccione a lo que dice la voz "
                        f"(ver 'Acciones' en templates/prompts/story_es_en.md)")
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
        elif beats:
            # F16 · gancho: se dice en ≤3 s y el primer segundo ya tiene movimiento (acción) en una cámara que no sea suave
            w1 = [w for w in words if w["beat"] == beats[0]["id"]]
            if w1[-1]["end"] > HOOK_MAX_S:
                errs.append(f"el gancho dura {w1[-1]['end']:.1f} s hablado (máximo {HOOK_MAX_S:.1f} s): acórtalo (unas 8–9 palabras)")
            acts = [at_seconds(beats[0], w1, x.get("at"), 0.0) for x in beats[0].get("actions", [])]
            if not acts or min(acts) > HOOK_ACTION_S:
                errs.append(f"el primer beat no tiene una acción antes de {HOOK_ACTION_S:.0f} s: abre con movimiento (ej. punch, pulse, "
                            f"lift con at en la 1.ª o 2.ª palabra)")
            cam = beats[0].get("scene", {}).get("camera", {}).get("preset")
            if cam in HOOK_STATIC_CAMERAS:
                errs.append(f"el primer beat usa la cámara '{cam}', demasiado suave para el gancho: usa push_in, spiral_in u orbit_slow")
            # F16 · ritmo: algo cambia en pantalla al menos cada 3,5 s
            gap, at = event_gap(story, words)
            if gap > MAX_EVENT_GAP_S:
                errs.append(f"{gap:.1f} s sin ningún cambio en pantalla desde el segundo {at:.1f} (máximo {MAX_EVENT_GAP_S} s): "
                            f"añade una acción o un overlay en ese tramo")
    # F17 · bucle visual: el último beat vuelve al entorno y al objeto del primero
    if closing == "bucle" and len(beats) > 1:
        s0, s1 = beats[0].get("scene", {}), beats[-1].get("scene", {})
        if s0.get("env") != s1.get("env") or s0.get("hero", {}).get("asset") != s1.get("hero", {}).get("asset"):
            errs.append(f"el cierre es `bucle`: el último beat debe volver al entorno ({s0.get('env')}) y al objeto ({s0.get('hero', {}).get('asset')}) del primero")
    # F16 · bucle: con cierre `bucle` el video acaba casi sobre la última palabra
    if closing == "bucle" and story["meta"].get("tailS", 1.0) > LOOP_TAIL_MAX_S:
        errs.append(f"el cierre es `bucle` y meta.tailS vale {story['meta'].get('tailS', 1.0)} (por defecto 1.0): pon meta.tailS = 0.2 "
                    f"para que el final empalme con el inicio")
    if script_lines is not None:
        texts = [b.get("text", "") for b in beats]
        if texts != script_lines:
            for k, (a, c) in enumerate(zip(texts, script_lines)):
                if a != c:
                    errs.append(f"beat {k + 1} no coincide con la línea {k + 1} del guion: {a[:40]!r} vs {c[:40]!r}")
                    break
            if len(texts) != len(script_lines):
                errs.append(f"{len(texts)} beats para {len(script_lines)} líneas de guion")
    return errs


def script_closing(md: str) -> str | None:
    m = re.search(r"^closing:\s*(\w+)", md, re.M)
    return m.group(1) if m else None


def script_lines(md: str) -> list[str]:
    return [re.sub(r"^\[\w+\]\s*", "", l.strip()) for l in md.splitlines() if re.match(r"^\s*\[\w+\]", l)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("story", type=Path)
    ap.add_argument("--words", type=Path)
    ap.add_argument("--script", type=Path)
    ap.add_argument("--require-actions", action="store_true", help="exige acciones en al menos la mitad de los beats")
    a = ap.parse_args()
    errs = validate(load_json(a.story), load_json(a.words) if a.words else None,
                    script_lines(a.script.read_text(encoding="utf-8")) if a.script else None, a.require_actions,
                    script_closing(a.script.read_text(encoding="utf-8")) if a.script else None)
    print(f"{'PASA' if not errs else 'FALLA'}: {a.story}")
    for e in errs:
        print(f"  - {e}")
    sys.exit(0 if not errs else 1)


if __name__ == "__main__":
    run_main(main)
