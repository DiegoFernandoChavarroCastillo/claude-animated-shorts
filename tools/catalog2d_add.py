"""Añade o reemplaza paletas y assets en templates/catalog2d.json sin cambiar su formato (una línea por entrada).

    .venv/bin/python tools/catalog2d_add.py nuevos.json

nuevos.json: {"palettes": {"id": {...}}, "assets": {"id": {...}}}. Una entrada con un id que ya existe se reemplaza en su línea;
una nueva se añade al final de su sección.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "templates" / "catalog2d.json"


def add(section: str, entries: dict, text: str) -> str:
    lines = text.split("\n")
    start = next(i for i, l in enumerate(lines) if l.startswith(f'  "{section}": {{'))
    end = next(i for i in range(start + 1, len(lines)) if lines[i].startswith("  }"))
    for k, v in entries.items():
        row = f"    {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}"
        hit = next((i for i in range(start + 1, end) if re.match(rf'    "{re.escape(k)}": ', lines[i])), None)
        if hit is not None:
            lines[hit] = row + ("," if lines[hit].rstrip().endswith(",") else "")
        else:
            lines[end - 1] = lines[end - 1].rstrip().rstrip(",") + ","
            lines.insert(end, row)
            end += 1
    return "\n".join(lines)


def main():
    new = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    text = PATH.read_text(encoding="utf-8")
    for section in ("palettes", "assets"):
        if new.get(section):
            text = add(section, new[section], text)
    json.loads(text)   # sigue siendo JSON válido
    PATH.write_text(text, encoding="utf-8")
    print(f"catalog2d: {sum(len(new.get(s, {})) for s in ('palettes', 'assets'))} entradas")


if __name__ == "__main__":
    main()
