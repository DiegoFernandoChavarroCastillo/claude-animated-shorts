"""Etapa 2b: valida un guion 02_SCRIPT.md con la fórmula del plan (§3.10, F6).

    python pipeline\\validate_script.py <02_SCRIPT.md> [--json]

Formato del guion:

    # Título
    lang: es                      (es | en)
    hook: pregunta                (opcional: tipo de gancho; ver templates/formulas.json)
    structure: mito               (opcional, por defecto "mito": mito | lista | versus | historia | cadena)
    closing: pregunta             (opcional: pregunta | envia | sigue | bucle | reto_casa)

    ## Guion
    [hook] ¿Te has preguntado por qué flota el hielo?
    [tension] ...
    [mechanism] ...               (una o varias líneas por rol, en el orden de la estructura)
    [layer2] ...                  (opcional)
    [twist] ...
    [cta] ...                     (los roles de cada estructura están en templates/formulas.json)

    ## Fuentes
    - nueve por ciento: https://...      (el número tal como aparece en el guion, en cifras o en palabras)

Comprueba: 140–185 palabras; gancho ≤12 palabras y en 2.ª persona (y, si se declara `hook:`, que tenga la forma de ese
tipo); los roles, su orden y cuántas líneas lleva cada uno según la estructura; la última línea es el cierre (y, si se
declara `closing:`, que tenga la forma de ese cierre); cada número del guion tiene una línea en "## Fuentes"; ninguna frase pasa de 22 palabras;
en español, no hay dos palabras seguidas unidas por el mismo sonido ll/y ("botella llena").
Sale con código 0 si pasa y 1 si falla, con un motivo por línea.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, run_main  # noqa: E402

FORMULAS = json.loads((ROOT / "templates" / "formulas.json").read_text(encoding="utf-8"))
STRUCTURES = FORMULAS["structures"]
ROLES = tuple(dict.fromkeys(r for st in STRUCTURES.values() for r in st["orden"]))   # unión de todas las estructuras
HOOKS, CLOSINGS = tuple(FORMULAS["hooks"]), tuple(FORMULAS["closings"])
# Kokoro (es) alarga la palabra y mete una pausa cuando una termina en sílaba ll/y + vocal y la siguiente empieza por
# ll/y + vocal: "botella llena" suena "botella, llena" (2 nov, tras F8). "y" sola (conjunción), "muy" u "hoy" no cuentan.
LL_END = re.compile(r"(ll|y)[aeiouáéíóú]$", re.I)
LL_START = re.compile(r"^(ll|y[aeiouáéíóú])", re.I)
WORDS_MIN, WORDS_MAX, HOOK_MAX, SENTENCE_MAX = 140, 185, 12, 22


def fold(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def tokens(s: str) -> list[str]:
    return re.findall(r"[\w']+|\d+(?:[.,]\d+)*", fold(s))


# ---------------------------------------------------------------- 2.ª persona
SECOND_ES = {"tu", "tus", "te", "ti", "contigo", "usted", "ustedes", "os", "vosotros", "vosotras", "vuestro", "vuestra"}
SECOND_ES_VERBS = {"llevas", "sabias", "sabes", "has", "eres", "estas", "puedes", "crees", "imaginas", "quieres", "tienes", "haces",
                   "ves", "duermes", "usas", "piensas", "notas", "vives", "comes", "bebes", "miras", "preguntaste", "dormiste"}
SECOND_EN = {"you", "your", "you're", "yours", "yourself", "you've", "you'll", "you'd", "ya"}


def second_person(text: str, lang: str) -> bool:
    t = tokens(text)
    if lang == "en":
        return any(w in SECOND_EN for w in t)
    # tuteo y ustedeo: pronombres y posesivos, verbos frecuentes en 2.ª persona, pretéritos en -aste / -iste
    return any(w in SECOND_ES or w in SECOND_ES_VERBS or re.fullmatch(r"\w+(aste|iste)", w) for w in t)


# ---------------------------------------------------------------- llamada a la acción
CTA_ES = r"coment|envia|envíal|siguem|sigue|guarda|comparte|cuentam|dime|dejam|suscrib|etiqueta"
CTA_EN = r"comment|send|follow|share|tell me|save|subscribe|tag|let me know"


def is_cta(text: str, lang: str) -> bool:
    return bool(re.search(CTA_EN if lang == "en" else CTA_ES, fold(text))) or "?" in text


# ---------------------------------------------------------------- números (cifras y palabras)
NUM_ES = {
    "cero": 0, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
    "once": 11, "doce": 12, "trece": 13, "catorce": 14, "quince": 15, "dieciseis": 16, "diecisiete": 17,
    "dieciocho": 18, "diecinueve": 19, "veinte": 20, "veintiuno": 21, "veintiun": 21, "veintidos": 22,
    "veintitres": 23, "veinticuatro": 24, "veinticinco": 25, "veintiseis": 26, "veintisiete": 27, "veintiocho": 28,
    "veintinueve": 29, "treinta": 30, "cuarenta": 40, "cincuenta": 50, "sesenta": 60, "setenta": 70, "ochenta": 80,
    "noventa": 90, "cien": 100, "ciento": 100, "doscientos": 200, "doscientas": 200, "trescientos": 300,
    "trescientas": 300, "cuatrocientos": 400, "cuatrocientas": 400, "quinientos": 500, "quinientas": 500,
    "seiscientos": 600, "seiscientas": 600, "setecientos": 700, "setecientas": 700, "ochocientos": 800,
    "ochocientas": 800, "novecientos": 900, "novecientas": 900, "mil": 1000, "millon": 10 ** 6, "millones": 10 ** 6,
    "billon": 10 ** 12, "billones": 10 ** 12,
}
NUM_EN = {
    "zero": 0, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15, "sixteen": 16, "seventeen": 17,
    "eighteen": 18, "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70,
    "eighty": 80, "ninety": 90, "hundred": 100, "thousand": 1000, "million": 10 ** 6, "millions": 10 ** 6,
    "billion": 10 ** 9,
}
# "un", "una", "uno", "one", "a" solo cuentan como número si van pegados a otra palabra numérica ("un millón")
WEAK = {"es": {"un", "una", "uno"}, "en": {"one", "a"}}
JOIN = {"es": {"y"}, "en": {"and"}}
SCALE = {10 ** 3, 10 ** 6, 10 ** 9, 10 ** 12}


def words_value(ws: list[str], table: dict) -> float:
    total, cur = 0.0, 0.0
    for w in ws:
        v = table.get(w, 1 if w in ("un", "una", "uno", "one", "a") else None)
        if v is None:
            continue
        if v in SCALE:
            total += (cur or 1) * v
            cur = 0
        elif v == 100 and cur and w in ("hundred",):
            cur *= 100
        else:
            cur += v
    return total + cur


def numbers(text: str, lang: str) -> list[tuple[str, float]]:
    """expresiones numéricas del texto: (texto, valor). Cifras ('917', '4,5') y palabras ('novecientos diecisiete')"""
    table = NUM_EN if lang == "en" else NUM_ES
    weak, join = WEAK[lang], JOIN[lang]
    # "un", "a", "one" solo se unen a una palabra de escala: "un millón", "a thousand" (no "un nueve por ciento")
    big = lambda k: k < len(t) and t[k] in table and (table[t[k]] in SCALE or table[t[k]] == 100)  # noqa: E731
    t = tokens(text)
    out, i = [], 0
    while i < len(t):
        w = t[i]
        if re.fullmatch(r"\d+(?:[.,]\d+)*", w):
            # "3.000" (miles con punto) -> 3000; "4,5" o "4.5" (decimales) -> 4.5
            v = w.replace(".", "") if re.fullmatch(r"\d{1,3}(\.\d{3})+", w) else w.replace(",", ".")
            out.append((w, float(v)))
            i += 1
            continue
        if w == "ciento" and i and t[i - 1] == "por":   # "por ciento" es porcentaje, no el número 100
            i += 1
            continue
        if w in table or (w in weak and big(i + 1)):
            j = i
            while j < len(t) and (t[j] in table or (t[j] in weak and big(j + 1))
                                  or (t[j] in join and j + 1 < len(t) and t[j + 1] in table and j > i)):
                j += 1
            ws = t[i:j]
            out.append((" ".join(ws), words_value(ws, table)))
            i = j
            continue
        i += 1
    return out


def source_values(line: str, lang: str) -> tuple[str, set[float]]:
    left = fold(line.split("http")[0])
    vals = {v for _, v in numbers(left, lang)}
    return left, vals


# ---------------------------------------------------------------- lectura del guion
@dataclass
class Script:
    lang: str = ""
    hook: str = ""
    structure: str = ""
    closing: str = ""
    lines: list[tuple[str, str]] = field(default_factory=list)  # (rol, texto)
    sources: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def parse(md: str) -> Script:
    s, section = Script(), None
    for raw in md.splitlines():
        line = raw.strip()
        if not line:
            continue
        m = re.fullmatch(r"(lang|hook|structure|closing|gancho|estructura|cierre):\s*(\w+)", line, re.I)
        if m and section is None:
            key = {"gancho": "hook", "estructura": "structure", "cierre": "closing"}.get(m.group(1).lower(), m.group(1).lower())
            setattr(s, key, m.group(2).lower())
            continue
        if line.startswith("## "):
            name = fold(line[3:]).strip()
            section = "guion" if name.startswith(("guion", "script")) else "fuentes" if name.startswith(("fuentes", "sources")) else "otra"
            continue
        if section == "guion":
            m = re.fullmatch(r"\[(\w+)\]\s*(.+)", line)
            if not m:
                s.errors.append(f"línea del guion sin rol entre corchetes: {line[:60]!r}")
            elif m.group(1) not in ROLES:
                s.errors.append(f"rol desconocido [{m.group(1)}] (válidos: {', '.join(ROLES)})")
            else:
                s.lines.append((m.group(1), m.group(2).strip()))
        elif section == "fuentes" and line.startswith(("-", "*")):
            s.sources.append(line.lstrip("-* ").strip())
    if s.lang not in ("es", "en"):
        s.errors.append("falta 'lang: es' o 'lang: en' antes de las secciones")
    if not s.lines:
        s.errors.append("falta la sección '## Guion' con líneas [rol] texto")
    return s


# ---------------------------------------------------------------- tipos de gancho y de cierre (F12)
# Cada tipo declarado (`hook: mito`) debe tener la forma que lo define. Son marcas mínimas, no un detector de calidad.
HOOK_MARKS = {
    "mito": (r"mito|mintier|mentira|falso|te dijeron|te han dicho|te contaron|crees|creias|creen|creyendo|te enseñaron|te enseñaron",
             r"myth|lied|false|told you|you told|were told|you think|you believe|you've been told|taught you|do you really"),
    "y_si": (r"que pasaria|que ocurriria|y si |imagina|que sucederia", r"what if|what would happen|imagine|what happens if"),
    "reto": (r"apuesto|te reto|a que no|reto|desafio|adivina|seguro que no", r"bet you|bet i|challenge|i dare|dare you|guess|i bet"),
    "error": (r"llevas|toda la vida|equivoc|erroneamente|mal |error", r"wrong|mistake|been doing|your whole life|you've been"),
}
CLOSING_MARKS = {
    "envia": (r"envia|enviasel|compart|etiqueta|mandas|mandaselo", r"send|share|tag|forward"),
    "sigue": (r"sigue|siguem|suscrib|siguenos", r"follow|subscribe"),
    "reto_casa": (r"prueba|probalo|intentalo|inténtalo|esta noche|hoy |la proxima vez|observa|fijate|mira como", r"try|tonight|next time|today|look for|notice|check"),
}
STOP = {"es": {"cuando", "cuanto", "porque", "entonces", "sobre", "tambien", "ahora", "aunque", "donde", "porque", "tienes", "tiene"},
        "en": {"when", "about", "because", "their", "there", "would", "could", "which", "these", "those", "other"}}


def hook_error(kind: str, hook: str, lang: str) -> str | None:
    """None si el gancho tiene la forma del tipo declarado; si no, qué le falta"""
    t = fold(hook) + " "
    if kind == "pregunta":
        return None if "?" in hook else "un gancho 'pregunta' debe ser una pregunta (llevar '?')"
    if kind == "dato":
        return None if numbers(hook, lang) else "un gancho 'dato' debe llevar una cifra concreta (con su fuente)"
    if kind == "escena":
        return "un gancho 'escena' es una afirmación en presente, no una pregunta" if "?" in hook else None
    pat = HOOK_MARKS.get(kind)
    if pat and not re.search(pat[1 if lang == "en" else 0], t):
        return f"el gancho no tiene la forma de '{kind}' ({FORMULAS['hooks'][kind]['patron']})"
    return None


def shared_words(a: str, b: str, lang: str) -> set[str]:
    sig = lambda x: {w for w in tokens(x) if len(w) >= 5 and w not in STOP[lang]}  # noqa: E731
    return sig(a) & sig(b)


def closing_error(kind: str, cta: str, hook: str, lang: str) -> str | None:
    t = fold(cta) + " "
    if kind == "pregunta":
        return None if "?" in cta else "un cierre 'pregunta' debe ser una pregunta (llevar '?')"
    if kind == "bucle":
        return None if shared_words(hook, cta, lang) else "un cierre 'bucle' debe retomar una palabra del gancho (de 5 letras o más)"
    pat = CLOSING_MARKS.get(kind)
    if pat and not re.search(pat[1 if lang == "en" else 0], t):
        return f"el cierre no tiene la forma de '{kind}' ({FORMULAS['closings'][kind]['patron']})"
    return None


def ll_clashes(text: str) -> list[str]:
    """pares de palabras seguidas, sin puntuación entre ellas, unidas por el sonido ll/y"""
    ws = text.split()
    return [f"{a} {b}" for a, b in zip(ws, ws[1:])
            if re.fullmatch(r"[\wáéíóúüñ]+", a, re.I) and LL_END.search(a) and LL_START.match(b.strip("¿¡\"«“"))]


def sentences(text: str) -> list[str]:
    return [p for p in re.split(r"(?<=[.?!…:;])\s+", text) if p.strip()]


def validate(md: str) -> tuple[list[str], dict]:
    s = parse(md)
    errs = list(s.errors)
    if errs:
        return errs, {}
    lang = s.lang
    text = " ".join(t for _, t in s.lines)
    nwords = len(text.split())
    if not WORDS_MIN <= nwords <= WORDS_MAX:
        errs.append(f"longitud: {nwords} palabras (debe estar entre {WORDS_MIN} y {WORDS_MAX})")
    roles = [r for r, _ in s.lines]
    structure = s.structure or "mito"
    if structure not in STRUCTURES:
        return [f"estructura desconocida '{structure}' (válidas: {', '.join(STRUCTURES)})"], {}
    spec = STRUCTURES[structure]
    for kind, what, kinds in ((s.hook, "gancho", HOOKS), (s.closing, "cierre", CLOSINGS)):
        if kind and kind not in kinds:
            errs.append(f"tipo de {what} desconocido '{kind}' (válidos: {', '.join(kinds)})")
    if roles[0] != "hook":
        errs.append("la primera línea debe ser el gancho [hook]")
    hook = " ".join(t for r, t in s.lines if r == "hook")
    if len(hook.split()) > HOOK_MAX:
        errs.append(f"gancho de {len(hook.split())} palabras (máximo {HOOK_MAX}): {hook!r}")
    if not second_person(hook, lang):
        errs.append(f"el gancho no está en 2.ª persona: {hook!r}")
    if s.hook in HOOKS and (e := hook_error(s.hook, hook, lang)):
        errs.append(e)
    names = {"tension": "tensión", "twist": "giro"}
    for need in spec["requeridos"]:
        if need not in roles:
            errs.append(f"falta el beat de {names.get(need, need)} [{need}]")
    bad = [r for r in dict.fromkeys(roles) if r not in spec["orden"]]
    if bad:
        errs.append(f"la estructura '{structure}' no usa los roles [{'], ['.join(bad)}] (usa: {', '.join(spec['orden'])})")
    for r, n in spec["min"].items():
        if roles.count(r) < n:
            errs.append(f"la estructura '{structure}' pide al menos {n} líneas [{r}] (hay {roles.count(r)})")
    for r, n in spec["max"].items():
        if roles.count(r) > n:
            errs.append(f"la estructura '{structure}' admite como mucho {n} líneas [{r}] (hay {roles.count(r)})")
    last = s.lines[-1][1]
    free = s.closing in ("bucle", "reto_casa")   # estos cierres no tienen por qué pedir un comentario
    if roles[-1] != "cta" or not (free or is_cta(last, lang)):
        errs.append(f"la última línea no es una llamada a la acción [cta]: {last!r}")
    elif s.closing in CLOSINGS and (e := closing_error(s.closing, last, hook, lang)):
        errs.append(e)
    order = [spec["orden"].index(r) for r in roles if r in spec["orden"]]
    if any(b < a for a, b in zip(order, order[1:])):
        errs.append("los beats no siguen el orden " + " → ".join(spec["orden"]))
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
    for r, t in s.lines:
        for sent in sentences(t):
            n = len(sent.split())
            if n > SENTENCE_MAX:
                errs.append(f"frase de {n} palabras (máximo {SENTENCE_MAX}): {sent[:60]!r}…")
    if lang == "es":
        for r, t in s.lines:
            for pair in ll_clashes(t):
                errs.append(f"'{pair}': dos sonidos ll/y seguidos; la voz hace una pausa como si hubiera una coma. "
                            f"Reescribe para separarlos ([{r}] {t[:50]}…)")
    stats = {"lang": lang, "structure": structure, "hook": s.hook, "closing": s.closing, "words": nwords, "hook_words": len(hook.split()), "roles": roles, "numbers": found, "sources": len(s.sources)}
    return errs, stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script", type=Path)
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    errs, stats = validate(a.script.read_text(encoding="utf-8"))
    if a.json:
        print(json.dumps({"ok": not errs, "errors": errs, "stats": stats}, ensure_ascii=False, indent=1))
    else:
        print(f"{'PASA' if not errs else 'FALLA'}: {a.script}")
        for e in errs:
            print(f"  - {e}")
        if stats:
            print(f"  ({stats['words']} palabras, gancho {stats['hook_words']}, números: {', '.join(stats['numbers']) or 'ninguno'})")
    sys.exit(0 if not errs else 1)


if __name__ == "__main__":
    run_main(main)
