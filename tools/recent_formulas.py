"""Muestra qué gancho, estructura y cierre usaron los últimos videos (out/*/02_SCRIPT.md), para no repetirlos.

    python tools/recent_formulas.py [N]      # por defecto, los 5 más recientes
    python tools/recent_formulas.py --nuevas # todas las fórmulas nuevas (D120) usadas en out/, con su patrón y en cuántos videos

Las fórmulas que no están en templates/formulas.json salen marcadas con «*». Las que se repiten y funcionan
(tools/ingest_stats.py) son candidatas a entrar en el catálogo.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FORMULAS = json.loads((ROOT / "templates" / "formulas.json").read_text(encoding="utf-8"))
KNOWN = {"hook": FORMULAS["hooks"], "structure": FORMULAS["structures"], "closing": FORMULAS["closings"]}


def header(md: str) -> dict:
    out = {}
    for line in md.splitlines():
        m = re.fullmatch(r"(lang|hook|structure|closing):\s*(\w+)", line.strip(), re.I)
        if m:
            out[m.group(1).lower()] = m.group(2).lower()
        if line.startswith("## "):
            break
    return out


def new_formulas(md: str) -> dict[str, str]:
    """sección «## Fórmulas nuevas»: nombre -> patrón"""
    out, inside = {}, False
    for line in md.splitlines():
        if line.startswith("## "):
            inside = line[3:].strip().lower().startswith(("fórmulas nuevas", "formulas nuevas", "new formulas"))
        elif inside and (m := re.fullmatch(r"[-*]\s*`?(\w+)`?\s*:\s*(.+)", line.strip())):
            out[m.group(1).lower()] = m.group(2).strip()
    return out


def label(field: str, value: str | None, default: str) -> str:
    if not value:
        return default
    return value if value in KNOWN[field] else f"{value}*"


def main() -> None:
    scripts = sorted((ROOT / "out").glob("*/02_SCRIPT.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    if "--nuevas" in sys.argv:
        seen: dict[tuple[str, str], dict] = {}
        for p in scripts:
            md = p.read_text(encoding="utf-8")
            h, new = header(md), new_formulas(md)
            for field in ("hook", "structure", "closing"):
                v = h.get(field)
                if v and v not in KNOWN[field]:
                    row = seen.setdefault((field, v), {"patron": new.get(v, "(sin describir)"), "videos": []})
                    row["videos"].append(p.parent.name)
        if not seen:
            print("(ningún video usa fórmulas nuevas todavía)")
        for (field, v), row in sorted(seen.items(), key=lambda kv: -len(kv[1]["videos"])):
            print(f"{field:<10} {v:<22} {len(row['videos'])} video(s): {', '.join(row['videos'])}\n           {row['patron']}")
        return
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    if not scripts:
        print("(sin videos anteriores en out/)")
    for p in scripts[:n]:
        h = header(p.read_text(encoding="utf-8"))
        sp = p.parent / "05_story.json"   # tema visual de las historias 2D (D123): no repetir el mismo tres veces seguidas
        theme = json.loads(sp.read_text(encoding="utf-8")).get("meta", {}).get("theme") if sp.exists() else None
        print(f"{p.parent.name:<28} gancho={label('hook', h.get('hook'), '(sin declarar)'):<16} "
              f"estructura={label('structure', h.get('structure'), 'mito (por defecto)'):<16} cierre={label('closing', h.get('closing'), '(sin declarar)')}"
              + (f" tema={theme}" if theme else ""))
    print("(* = fórmula nueva, fuera del catálogo; detalle con --nuevas)")


if __name__ == "__main__":
    main()
