"""Resume los huecos del catálogo anotados en out/*/05_gaps.md para decidir qué objetos construir primero (F18).

    python tools/gaps_report.py            # tabla de huecos abiertos y resueltos, y las palabras que más se repiten en los abiertos

Un hueco es una línea «- concepto: qué se usó en su lugar». Se da por resuelto si la línea dice «Prefab nuevo» o «resuelto».
"""
from __future__ import annotations

import os
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("GAPS_OUT", ROOT / "out"))
STOP = {"objeto", "había", "haría", "falta", "usó", "lugar", "pantalla", "sobre", "donde", "entre", "habla", "hueco", "catálogo", "como", "para", "esto"}


def fold(s: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def read(out: Path = OUT) -> list[dict]:
    rows = []
    for f in sorted(out.glob("*/05_gaps.md")):
        for ln in f.read_text(encoding="utf-8").splitlines():
            if ln.startswith("- "):
                text = ln[2:].strip()
                rows.append({"video": f.parent.name, "text": text, "resuelto": bool(re.search(r"prefab nuevo|resuelto", text, re.I))})
    return rows


def words_of_open(rows: list[dict]) -> Counter:
    c: Counter = Counter()
    for r in rows:
        if r["resuelto"]:
            continue
        for w in set(re.findall(r"[a-záéíóúñ]{5,}", r["text"].lower())):
            if w not in STOP:
                c[w] += 1
    return c


def report(rows: list[dict]) -> str:
    out = ["| video | estado | hueco |", "|---|---|---|"]
    for r in rows:
        out.append(f"| {r['video']} | {'✅ resuelto' if r['resuelto'] else '⚠ abierto'} | {r['text'][:140]} |")
    opened = sum(not r["resuelto"] for r in rows)
    out.append(f"\n{len(rows)} huecos: {len(rows) - opened} resueltos con un prefab, {opened} abiertos.")
    top = words_of_open(rows).most_common(8)
    if top:
        out.append("Palabras más repetidas en los abiertos: " + ", ".join(f"{w} ({n})" for w, n in top))
    return "\n".join(out)


if __name__ == "__main__":
    rows = read()
    print(report(rows) if rows else "Sin huecos anotados.")
