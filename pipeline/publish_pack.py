"""Etapa 10: paquete de publicación -> 11_publish.md, 11_cover.png y meta.json (F16, F17).

    python pipeline/publish_pack.py --id <id>

Saca del guion, del plan visual y del video lo que se puede sin inventar: título (el gancho), descripción (el guion y las
fuentes), hashtags (de las etiquetas del catálogo de los objetos usados), comentario fijado (la pregunta del cierre) y la portada
(un fotograma del gancho). Claude lo revisa y lo afina antes de entregar; los límites por plataforma son orientativos
(no vienen de documentación oficial: compruébalos al publicar).
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, PipelineError, load_json, run_main  # noqa: E402
from validate_script import parse  # noqa: E402

MAX_HASHTAGS = 5
GENERIC = {"explicacion", "curiosidad"}


def hashtags(story: dict, lang: str) -> list[str]:
    """etiquetas de los dos objetos más usados (las 2 primeras de cada uno) más dos genéricas del idioma"""
    two_d = story.get("meta", {}).get("engine") == "2d"
    cat = load_json(ROOT / "templates" / ("catalog2d.json" if two_d else "catalog.json"))
    if two_d:   # motor 2D: los assets más usados por capa
        # D123: ni fondos ni capas de ambiente ni el personaje genérico del kit dicen de qué trata el video
        assets = [ly["asset"] for b in story["beats"] for ly in b["scene"]["layers"]
                  if cat["assets"].get(ly["asset"], {}).get("kind") not in ("fondo", "ambiente") and ly["asset"] not in ("figura", "vela")]
    else:
        assets = [b.get("scene", {}).get("hero", {}).get("asset") for b in story["beats"]]
    top = sorted(set(assets), key=lambda x: -assets.count(x))[:2]
    tags: list[str] = []
    for asset in top:
        for t in cat["assets" if two_d else "heroes"].get(asset, {}).get("tags", [])[:2]:
            t = re.sub(r"[^a-z0-9]", "", unicodedata.normalize("NFD", t.lower()))
            if t and t not in tags and t not in GENERIC and len(t) > 3:
                tags.append(t)
    generic = (["#filosofia", "#historia"] if lang == "es" else ["#philosophy", "#story"]) if two_d else (["#sabiasque", "#ciencia"] if lang == "es" else ["#didyouknow", "#science"])
    return ["#" + t for t in tags[: MAX_HASHTAGS - 2]] + generic


def cover(d: Path, words: list[dict]) -> str:
    """fotograma del gancho: un segundo después de la primera palabra (ya hay movimiento y el subtítulo del gancho)"""
    t = min(words[0]["start"] + 1.0, words[-1]["end"])
    out = d / "11_cover.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(d / "09_final.mp4"), "-frames:v", "1", str(out)], check=True)
    return out.name


def yt_title(topic: str | None, hook: str) -> str:
    """título de YouTube (D121): los Shorts también salen en la búsqueda, así que la palabra clave del tema (`meta.topic`) va primero,
    y detrás el gancho; sin tema, el gancho tal cual. Tope de 100 caracteres sin cortar palabras."""
    t = f"{topic.strip()}: {hook}" if topic and topic.strip() else hook
    if len(t) <= 100:
        return t
    return t[:100].rsplit(" ", 1)[0].rstrip(",;:") + "…"


def script_sources(md: str) -> str:
    """las líneas de «## Fuentes» del guion, hasta la sección siguiente (Ficción, Fórmulas nuevas)"""
    m = re.search(r"^## Fuentes\s*(.*?)(?=^## |\Z)", md, re.S | re.M)
    return "\n".join(x for x in (m.group(1).strip().splitlines() if m else []) if x.startswith("-"))


# ---------------------------------------------------------------- video largo 16:9 (longform, D128)
def ts(sec: float, srt: bool = False) -> str:
    h, m, x = int(sec // 3600), int(sec % 3600 // 60), sec % 60
    if srt:
        return f"{h:02d}:{m:02d}:{int(x):02d},{int(round((x - int(x)) * 1000)):03d}".replace(",1000", ",999")
    return f"{h}:{m:02d}:{int(x):02d}" if h else f"{m}:{int(x):02d}"


def srt(words: list[dict], max_words: int = 9, max_s: float = 4.5) -> str:
    """subtítulos para los CC de YouTube: bloques de hasta 9 palabras que se cortan al final de frase o en una pausa"""
    blocks, cur = [], []
    for k, w in enumerate(words):
        cur.append(w)
        nxt = words[k + 1] if k + 1 < len(words) else None
        end = re.search(r"[.?!…»]$", w["w"]) or (re.search(r"[,;:]$", w["w"]) and len(cur) >= 4)
        if not nxt or end or len(cur) >= max_words or (nxt["start"] - w["end"] > 0.45) or (w["end"] - cur[0]["start"] > max_s):
            blocks.append(cur)
            cur = []
    out = []
    for i, b in enumerate(blocks, 1):
        end = b[-1]["end"] + 0.15
        if i < len(blocks):   # sin solaparse con el bloque siguiente (YouTube los apila)
            end = min(end, blocks[i][0]["start"] - 0.02)
        out.append(f"{i}\n{ts(b[0]['start'], True)} --> {ts(end, True)}\n{' '.join(x['w'] for x in b)}\n")
    return "\n".join(out)


def chapter_marks(story: dict, words: list[dict]) -> list[tuple[str, str]]:
    """marcas de capítulo de YouTube: la primera empieza en 0:00 y cada una en la primera palabra de su capítulo"""
    out = []
    for k, c in enumerate(story["meta"]["chapters"]):
        t = 0.0 if k == 0 else min(w["start"] for w in words if w["beat"] == c["from"])
        title = "Introducción" if c["id"] == "gancho" else c["title"]
        out.append((ts(max(0.0, t - 0.3)), title))
    return out


def thumbnail(d: Path, story: dict, words: list[dict]) -> str:
    """miniatura 1280x720: el fotograma de `meta.thumb` (id de beat; por defecto el primero) con el título grande encima"""
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
    bid = story["meta"].get("thumb", story["beats"][0]["id"])
    ws = [w for w in words if w["beat"] == bid]
    t = (ws[0]["start"] + ws[-1]["end"]) / 2
    raw = d / "_thumb_raw.png"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(d / "09_final.mp4"), "-frames:v", "1", "-vf", "scale=1280:720", str(raw)], check=True)
    im = Image.open(raw).convert("RGB")
    text = (story["meta"].get("thumbText") or story["meta"]["title"].split(":")[0]).upper()
    lines = text.split("\n") if "\n" in text else [text]
    font_path = next((p for p in ["/usr/share/fonts/TTF/Montserrat-ExtraBold.ttf", "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
                                   "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if Path(p).exists()), None)
    font = ImageFont.truetype(font_path, 92) if font_path else ImageFont.load_default()
    shade = Image.new("L", im.size, 0)
    ImageDraw.Draw(shade).rectangle([0, 0, 1280, 720], fill=0)
    grad = Image.linear_gradient("L").rotate(90).resize(im.size)   # oscurece la izquierda, donde va el texto
    im = Image.composite(Image.new("RGB", im.size, (0, 0, 0)), im, grad.point(lambda v: int(v * 0.65)))
    dr = ImageDraw.Draw(im)
    y = 360 - len(lines) * 55
    for ln in lines:
        for dx, dy in ((-4, 0), (4, 0), (0, -4), (0, 4), (3, 3)):
            dr.text((60 + dx, y + dy), ln, font=font, fill=(0, 0, 0))
        dr.text((60, y), ln, font=font, fill=(255, 225, 77))
        y += 110
    out = d / "11_thumbnail.jpg"
    im.filter(ImageFilter.SMOOTH).save(out, quality=92)
    raw.unlink(missing_ok=True)
    return out.name


def build_long(d: Path) -> str:
    from validate_longform import parse as parse_long
    md = (d / "02_SCRIPT.md").read_text(encoding="utf-8")
    sc = parse_long(md)
    story, words = load_json(d / "05_story.json"), load_json(d / "04_words.json")
    lang = story["meta"]["lang"]
    lines = [t for _, t in sc.lines]
    dur = words[-1]["end"] + story["meta"].get("tailS", 1.0)
    (d / f"11_subtitles.{lang}.srt").write_text(srt(words), encoding="utf-8")
    thumb = thumbnail(d, story, words)
    marks = "\n".join(f"{t} {n}" for t, n in chapter_marks(story, words))
    topic = re.sub(r"[^\w]", "", story["meta"].get("topic", "").lower())
    tags = " ".join(([f"#{topic}"] if topic else []) + [t for t in hashtags(story, lang) if t != f"#{topic}"][:2])   # el tema primero (lo que se busca)
    intro = " ".join(t for _, t in sc.chapters[0].lines)
    return f"""# Publicación: {story['meta']['title']}

Video: `09_final.mp4` ({dur / 60:.1f} min, 1920x1080) · miniatura: `{thumb}` · subtítulos: `11_subtitles.{lang}.srt`
Borrador generado por `pipeline/publish_pack.py` (video largo, D128): revísalo antes de publicar.

## YouTube (video normal, no Short)
- **Título** (≤ 100 caracteres; la palabra clave primero): {yt_title(story['meta'].get('topic'), story['meta']['title'].split(':', 1)[-1].strip())}
- **Miniatura:** `{thumb}` (1280x720)
- **Subtítulos:** sube `11_subtitles.{lang}.srt` en YouTube Studio → Subtítulos ({lang}).
- **Descripción:**

{intro}

Capítulos:
{marks}

Fuentes:
{script_sources(md) or '(sin fuentes)'}

Resumen y análisis con ilustraciones propias; no se usa material de la película.
{tags}

- **Comentario fijado:** {lines[-1]}
"""


def build(d: Path) -> str:
    if load_json(d / "05_story.json")["meta"].get("pacing") == "longform":
        return build_long(d)
    script = parse((d / "02_SCRIPT.md").read_text(encoding="utf-8"))
    story = load_json(d / "05_story.json")
    words = load_json(d / "04_words.json")
    lang = story["meta"]["lang"]
    closing = re.search(r"^closing:\s*(\w+)", (d / "02_SCRIPT.md").read_text(encoding="utf-8"), re.M)
    lines = [t for _, t in script.lines]
    hook, last = lines[0], lines[-1]
    dur = words[-1]["end"] + story["meta"].get("tailS", 1.0)
    tags = " ".join(hashtags(story, lang))
    body = " ".join(lines[1:4])
    src = script_sources((d / "02_SCRIPT.md").read_text(encoding="utf-8"))
    cov = cover(d, words)
    return f"""# Publicación: {story['meta']['title']}

Video: `09_final.mp4` ({dur:.0f} s) · portada: `{cov}` · cierre: `{closing.group(1) if closing else 'n/d'}`
Borrador generado por `pipeline/publish_pack.py`: revísalo y afínalo antes de publicar. Los límites de caracteres son orientativos.

## YouTube Shorts
- **Título** (≤ 100 caracteres; la palabra clave de búsqueda en los primeros 40, D121): {yt_title(story.get("meta", {}).get("topic"), hook)}
- **Descripción:** {body} … Fuentes abajo. #Shorts {tags}
- **Comentario fijado:** {last}

## TikTok
- **Texto** (corto; el gancho en la primera línea): {hook} {tags}
- **Portada:** `{cov}` (o elige otro fotograma en la app)

## Instagram Reels
- **Texto:** {hook}
{body}
{tags}
- **Portada:** `{cov}`

## Facebook Reels
- **Texto:** {hook} {tags}

## Fuentes del guion
{src or '(sin fuentes)'}

## Antes de publicar
- Vista previa del video en cada app: la descripción y los botones tapan la parte baja; los subtítulos van arriba a propósito.
- Si el video es un bucle, no pongas «gracias por ver» ni despedidas en el texto: que el comentario fijado retome el gancho.
"""


def meta(d: Path) -> dict:
    """datos del video para cruzarlos con las estadísticas de las plataformas (tools/ingest_stats.py)"""
    import datetime
    from validate_story import event_gap, script_closing
    md = (d / "02_SCRIPT.md").read_text(encoding="utf-8")
    story, words = load_json(d / "05_story.json"), load_json(d / "04_words.json")
    head = lambda k: (re.search(rf"^{k}:\s*(\w+)", md, re.M) or [None, None])[1]  # noqa: E731
    gap, _ = event_gap(story, words)
    return {"id": d.name, "title": story["meta"]["title"], "lang": story["meta"]["lang"], "date": datetime.date.today().isoformat(),
            "hook": head("hook"), "structure": head("structure") or "mito", "closing": script_closing(md),
            "duration_s": round(words[-1]["end"] + story["meta"].get("tailS", 1.0), 1), "words": len(words),
            "hook_spoken_s": round(max(w["end"] for w in words if w["beat"] == story["beats"][0]["id"]), 1),
            "beats": len(story["beats"]), "max_event_gap_s": round(gap, 1),
            "engine": story["meta"].get("engine", "3d"), "theme": story["meta"].get("theme"),
            "heroes": sorted({b["scene"]["hero"]["asset"] for b in story["beats"]} if story["meta"].get("engine") != "2d" else {ly["asset"] for b in story["beats"] for ly in b["scene"]["layers"]}),
            "shots": sum(len(b.get("shots", [])) for b in story["beats"])}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    a = ap.parse_args()
    d = ROOT / "out" / a.id
    for f in ("02_SCRIPT.md", "04_words.json", "05_story.json", "09_final.mp4"):
        if not (d / f).exists():
            raise PipelineError(f"falta {d / f}")
    (d / "11_publish.md").write_text(build(d), encoding="utf-8")
    (d / "meta.json").write_text(json.dumps(meta(d), ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[publish] {d / '11_publish.md'} y {'11_thumbnail.jpg + .srt' if load_json(d / '05_story.json')['meta'].get('pacing') == 'longform' else '11_cover.png'}")


if __name__ == "__main__":
    run_main(main)
