"""Busca en templates/catalog.json los objetos, entornos y overlays que encajan con un tema (por 'tags', id y 'when').

    python tools/catalog_search.py garganta dolor virus
    python tools/catalog_search.py "agujero negro" --top 8

Si un concepto del guion no devuelve ningún objeto con puntuación alta, es un hueco: anótalo en out/<id>/05_gaps.md.
"""
from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalog_io import load  # noqa: E402


def norm(t: str) -> str:
    return unicodedata.normalize("NFKD", t.lower()).encode("ascii", "ignore").decode()


def stem(w: str) -> str:
    return re.sub(r"(es|s)$", "", w) if len(w) > 4 else w


def score(entry: dict, ident: str, terms: list[str]) -> int:
    tags = {stem(w) for t in entry.get("tags", []) for w in norm(t).split()}
    when = {stem(w) for w in re.findall(r"\w+", norm(entry.get("when", "")))}
    ids = {stem(w) for w in norm(ident).split("_")}
    return sum(3 * (t in tags) + 3 * (t in ids) + (t in when) for t in map(stem, terms))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("terms", nargs="+")
    ap.add_argument("--top", type=int, default=6)
    a = ap.parse_args()
    terms = [w for t in a.terms for w in re.findall(r"\w+", norm(t))]
    c = load()
    for section, n in (("heroes", a.top), ("envs", 3), ("overlays", 4)):
        rows = sorted(((score(e if isinstance(e, dict) else {"when": e}, i, terms), i, e) for i, e in c[section].items()), key=lambda r: -r[0])
        print(f"\n## {section}")
        for s, i, e in [r for r in rows if r[0] > 0][:n] or [(0, "(nada)", {})]:
            extra = f" poses={e.get('poses')} anchors={e.get('anchors')}" if section == "heroes" and e else ""
            print(f"  {s:>2}  {i}{extra}\n      {e.get('when', '') if isinstance(e, dict) else e}")


if __name__ == "__main__":
    main()
