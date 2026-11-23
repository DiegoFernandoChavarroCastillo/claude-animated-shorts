"""Valida el guion de un video largo horizontal (`pacing: longform`, skill long-video, docs/PLAN_LONG_VIDEO.md).

    .venv/bin/python pipeline/validate_longform.py out/<id>/02_SCRIPT.md [--json]

(validate_script.py lo llama solo cuando la cabecera dice `pacing: longform`.)

Formato:

    # Título
    lang: es
    pacing: longform
    genre: resumen                (resumen | historia | biografia | mito | caso; ver templates/pacing_longform.json → genres)
    guion_autor: usuario          (opcional, D127)

    ## Ángulo
    - pregunta: la pregunta que tira de todo el video
    - promesa: lo que el espectador se lleva si llega al final (dicho en el gancho)
    - analisis: lo propio, más allá de contar (ciencia, contexto, lecturas); obligatorio en `resumen`
    - final: la imagen o el dato con el que se cierra

    ## Guion
    ### gancho | Una hora, siete años
    [hook] Una hora en ese planeta eran siete años en la Tierra.
    [escena] …
    ### cap1 | La Tierra se muere
    [escena] …                    (roles: hook escena dato analisis puente climax twist cta)
    [puente] …                    (la última línea de cada capítulo empuja al siguiente)
    ### cierre | Lo que nos deja
    [cta] ¿Tú habrías bajado?

    ## Fuentes
    - siete años, veintitrés años: https://…

Cada línea del guion es un beat del story (5–15 s de voz). Comprueba: palabras y duración estimada del perfil, número de
capítulos y duración de cada uno, gancho (primera frase corta, sin saludos ni «en este video», con la promesa en los
primeros 45 s), un `[puente]` al final de cada capítulo intermedio, cierre con pregunta o invitación, cada número con su
fuente, frases ≤22 palabras y los choques ll/y de la voz.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, run_main  # noqa: E402
from validate_script import fold, is_cta, ll_clashes, numbers, sentences, source_values  # noqa: E402

LONG = json.loads((ROOT / "templates" / "pacing_longform.json").read_text(encoding="utf-8"))
SCRIPT, VOICE = LONG["script"], LONG["voice"]
GENRES = tuple(k for k in LONG["genres"] if not k.startswith("_"))
ROLES = ("hook", "escena", "dato", "analisis", "puente", "climax", "twist", "cta")
ANGLE_KEYS = ("pregunta", "promesa", "final")
WPS = VOICE["wps"][2]   # palabras por segundo esperadas (para estimar duraciones antes de la voz)
LINE_WORDS_MAX = 45     # una línea = un beat; más de ~17 s de voz en un solo plano cansa (se parte en dos líneas)


@dataclass
class Chapter:
    id: str
    title: str
    lines: list[tuple[str, str]] = field(default_factory=list)

    @property
    def words(self) -> int:
        return sum(len(t.split()) for _, t in self.lines)


@dataclass
class LongScript:
    lang: str = ""
    pacing: str = ""
    genre: str = ""
    guion_autor: str = ""
    angle: dict[str, str] = field(default_factory=dict)
    chapters: list[Chapter] = field(default_factory=list)
    sources: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)

    @property
    def lines(self) -> list[tuple[str, str]]:
        return [x for c in self.chapters for x in c.lines]


def parse(md: str) -> LongScript:
    s, section = LongScript(), None
    for raw in md.splitlines():
        line = raw.strip()
        if not line:
            continue
        m = re.fullmatch(r"(lang|pacing|genre|genero|género|guion_autor|ritmo):\s*(\w+)", line, re.I)
        if m and section is None:
            key = {"genero": "genre", "género": "genre", "ritmo": "pacing"}.get(m.group(1).lower(), m.group(1).lower())
            setattr(s, key, m.group(2).lower())
            continue
        if line.startswith("### ") and section == "guion":
            m = re.fullmatch(r"###\s*(\w+)\s*[|:·-]\s*(.+)", line)
            if not m:
                s.errors.append(f"capítulo sin formato '### id | Título': {line[:60]!r}")
                continue
            s.chapters.append(Chapter(m.group(1).lower(), m.group(2).strip()))
            continue
        if line.startswith("## "):
            name = fold(line[3:]).strip()
            section = ("guion" if name.startswith(("guion", "script")) else "fuentes" if name.startswith(("fuentes", "sources"))
                       else "angulo" if name.startswith(("angulo", "angle")) else "otra")
            continue
        if section == "guion":
            m = re.fullmatch(r"\[(\w+)\]\s*(.+)", line)
            if not s.chapters:
                s.errors.append("la primera línea de '## Guion' debe ser un capítulo: '### gancho | Título'")
            elif not m:
                s.errors.append(f"línea del guion sin rol entre corchetes: {line[:60]!r}")
            elif m.group(1) not in ROLES:
                s.errors.append(f"rol desconocido [{m.group(1)}] (válidos: {', '.join(ROLES)})")
            else:
                s.chapters[-1].lines.append((m.group(1), m.group(2).strip()))
        elif section == "fuentes" and line.startswith(("-", "*")):
            s.sources.append(line.lstrip("-* ").strip())
        elif section == "angulo" and (m := re.fullmatch(r"[-*]\s*`?([\w ]+?)`?\s*:\s*(.+)", line)):
            s.angle[fold(m.group(1)).strip().replace(" ", "_")] = m.group(2).strip()
    s.errors = list(dict.fromkeys(s.errors))
    if s.lang not in ("es", "en"):
        s.errors.append("falta 'lang: es' o 'lang: en' antes de las secciones")
    if not s.chapters:
        s.errors.append("falta la sección '## Guion' con capítulos '### id | Título' y líneas [rol] texto")
    return s


def validate(md: str) -> tuple[list[str], dict]:
    s = parse(md)
    errs = list(s.errors)
    if errs:
        return errs, {}
    lang, user = s.lang, s.guion_autor == "usuario"
    if s.pacing != "longform":
        errs.append("falta 'pacing: longform' en la cabecera")
    if s.genre not in GENRES:
        errs.append(f"género '{s.genre or '—'}' desconocido (válidos: {', '.join(GENRES)})")
    for k in ANGLE_KEYS + (("analisis",) if s.genre == "resumen" else ()):
        if not s.angle.get(k):
            errs.append(f"'## Ángulo' sin '- {k}:' (se decide antes de escribir; ver templates/prompts/longform_script_es.md)")

    nwords = sum(c.words for c in s.chapters)
    w0, w1 = SCRIPT["words"]
    if not w0 <= nwords <= w1:
        errs.append(f"{nwords} palabras: el perfil pide {w0}–{w1} (≈{w0 / WPS / 60:.1f}–{w1 / WPS / 60:.1f} min a {WPS} pal/s)")
    c0, c1 = SCRIPT["chapters"]
    mid = s.chapters[1:-1]
    if not c0 <= len(mid) <= c1:
        errs.append(f"{len(mid)} capítulos entre el gancho y el cierre: el perfil pide {c0}–{c1}")
    ids = [c.id for c in s.chapters]
    if len(set(ids)) != len(ids):
        errs.append("hay dos capítulos con el mismo id")
    if ids[0] != "gancho":
        errs.append("el primer capítulo es '### gancho | …'")
    if ids[-1] != "cierre":
        errs.append("el último capítulo es '### cierre | …'")

    # gancho: la primera frase pega (corta, sin saludos), dura 20–45 s y dice la promesa
    g = s.chapters[0]
    if not g.lines or g.lines[0][0] != "hook":
        errs.append("el gancho empieza con una línea [hook]")
    else:
        first = sentences(g.lines[0][1])[0]
        if len(first.split()) > SCRIPT["hookMax"] and not user:
            errs.append(f"la primera frase del gancho tiene {len(first.split())} palabras (máx. {SCRIPT['hookMax']}): {first[:60]!r}")
        soft = [o for o in SCRIPT["softOpeners"] if o in fold(" ".join(t for _, t in g.lines))]
        if soft and not user:
            errs.append(f"el gancho tiene una apertura suave ({', '.join(soft)}): entra directo en la imagen o el dato")
    h0, h1 = SCRIPT["hookS"]
    if not h0 <= g.words / WPS <= h1:
        errs.append(f"el gancho dura ≈{g.words / WPS:.0f} s ({g.words} palabras): el perfil pide {h0}–{h1} s")

    cs0, cs1 = SCRIPT["chapterS"]
    for c in mid:
        est = c.words / WPS
        if not cs0 <= est <= cs1:
            errs.append(f"capítulo '{c.id}' ≈{est:.0f} s ({c.words} palabras): el perfil pide {cs0}–{cs1} s por capítulo (parte o junta capítulos)")
        if c.lines and c.lines[-1][0] != "puente" and c is not mid[-1]:
            errs.append(f"capítulo '{c.id}': la última línea es un [puente] que deja una pregunta o una promesa para el siguiente")
    last = s.chapters[-1].lines[-1] if s.chapters[-1].lines else ("", "")
    if last[0] != "cta" or not is_cta(last[1], lang):
        errs.append("el cierre acaba en [cta] con una pregunta para los comentarios o una invitación")

    for r, t in s.lines:
        if len(t.split()) > LINE_WORDS_MAX:
            errs.append(f"línea de {len(t.split())} palabras (máx. {LINE_WORDS_MAX}: es un beat; pártela en dos): [{r}] {t[:50]}…")
        for sent in sentences(t):
            if len(sent.split()) > SCRIPT["sentenceMax"]:
                errs.append(f"frase de {len(sent.split())} palabras (máx. {SCRIPT['sentenceMax']}): {sent[:60]!r}…")
        if lang == "es":
            for pair in ll_clashes(t):
                errs.append(f"'{pair}': dos sonidos ll/y seguidos; la voz hace una pausa. Reescribe ([{r}] {t[:50]}…)")

    srcs = [source_values(x, lang) for x in s.sources]
    for x in s.sources:
        if "http" not in x:
            errs.append(f"fuente sin URL: {x[:60]!r}")
    found = []
    for r, t in s.lines:
        for expr, val in numbers(t, lang):
            found.append(expr)
            if not any(expr in left or val in vals for left, vals in srcs):
                errs.append(f"número sin fuente: '{expr}' ([{r}] {t[:50]}…)")

    stats = {"lang": lang, "genre": s.genre, "words": nwords, "estS": round(nwords / WPS), "chapters": [
        {"id": c.id, "title": c.title, "words": c.words, "estS": round(c.words / WPS), "lines": len(c.lines)} for c in s.chapters],
        "numbers": found, "sources": len(s.sources), "angle": s.angle, "hook_words": len(sentences(g.lines[0][1])[0].split()) if g.lines else 0}
    return list(dict.fromkeys(errs)), stats


def report(errs: list[str], stats: dict, path: Path) -> None:
    print(f"{'PASA' if not errs else 'FALLA'}: {path}")
    for e in errs:
        print(f"  - {e}")
    if stats:
        print(f"  ({stats['words']} palabras, ≈{stats['estS'] // 60}:{stats['estS'] % 60:02d} min)")
        for c in stats["chapters"]:
            print(f"    {c['id']:<8} {c['estS']:>4} s  {c['words']:>4} pal  {c['lines']:>2} beats  {c['title']}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script", type=Path)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    errs, stats = validate(a.script.read_text(encoding="utf-8"))
    if a.json:
        print(json.dumps({"ok": not errs, "errors": errs, "stats": stats}, ensure_ascii=False, indent=1))
    else:
        report(errs, stats, a.script)
    sys.exit(0 if not errs else 1)


if __name__ == "__main__":
    run_main(main)
