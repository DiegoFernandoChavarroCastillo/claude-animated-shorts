"""Etapa 5b: valida 05_story.json contra el catálogo y el contrato (plan §6).

    python pipeline\\validate_story.py <05_story.json> [--words 04_words.json] [--script 02_SCRIPT.md]

Falla si: un env / luz / hero (kind, asset, pose) / overlay / ancla / preset de cámara / transición / sfx no existe en
templates/catalog.json; un "at" no resuelve a una palabra del beat; un beat mechanism no tiene overlay; hay más de 3
"cut" por minuto; un beat con overlay numérico no tiene "sources"; la keyword no está en el texto. Con --script,
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
WPS = 2.8  # para estimar la duración si no hay words.json


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


def validate(story: dict, words: list | None = None, script_lines: list[str] | None = None) -> list[str]:
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
        if b.get("role") == "mechanism" and not ovs:
            errs.append(f"{bid}: beat mechanism sin overlay de dato")
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
            if o.get("type") == "FlowArrow" and (not o.get("to") or (h and o["to"] not in h["anchors"])):
                errs.append(f"{bid}: FlowArrow necesita 'to', un ancla de {hero.get('asset')}")
        if numeric and not b.get("sources"):
            errs.append(f"{bid}: overlay con número sin 'sources'")
        for x in b.get("sfx", []):
            if x.get("type") not in cat["sfx"]:
                errs.append(f"{bid}: sfx '{x.get('type')}' no existe")
            if not resolves(x.get("at"), text):
                errs.append(f"{bid}: sfx con at '{x.get('at')}' que no es una palabra del beat")
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


def script_lines(md: str) -> list[str]:
    return [re.sub(r"^\[\w+\]\s*", "", l.strip()) for l in md.splitlines() if re.match(r"^\s*\[\w+\]", l)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("story", type=Path)
    ap.add_argument("--words", type=Path)
    ap.add_argument("--script", type=Path)
    a = ap.parse_args()
    errs = validate(load_json(a.story), load_json(a.words) if a.words else None,
                    script_lines(a.script.read_text(encoding="utf-8")) if a.script else None)
    print(f"{'PASA' if not errs else 'FALLA'}: {a.story}")
    for e in errs:
        print(f"  - {e}")
    sys.exit(0 if not errs else 1)


if __name__ == "__main__":
    run_main(main)
