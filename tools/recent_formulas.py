"""Muestra qué gancho, estructura y cierre usaron los últimos videos (out/*/02_SCRIPT.md), para no repetirlos.

    python tools/recent_formulas.py [N]      # por defecto, los 5 más recientes
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def header(md: str) -> dict:
    out = {}
    for line in md.splitlines():
        m = re.fullmatch(r"(lang|hook|structure|closing):\s*(\w+)", line.strip(), re.I)
        if m:
            out[m.group(1).lower()] = m.group(2).lower()
        if line.startswith("## "):
            break
    return out


def main() -> None:
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    rows = sorted((ROOT / "out").glob("*/02_SCRIPT.md"), key=lambda p: p.stat().st_mtime, reverse=True)[:n]
    if not rows:
        print("(sin videos anteriores en out/)")
    for p in rows:
        h = header(p.read_text(encoding="utf-8"))
        print(f"{p.parent.name:<28} gancho={h.get('hook', '(sin declarar)'):<10} estructura={h.get('structure', 'mito (por defecto)'):<10} cierre={h.get('closing', '(sin declarar)')}")


if __name__ == "__main__":
    main()
