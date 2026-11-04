"""Lee y escribe templates/catalog.json con el formato manual del repo (una entrada por línea), para que los cambios
masivos (nuevos packs de objetos, cámaras, overlays) dejen un diff pequeño.

    from catalog_io import load, save
"""
from __future__ import annotations

import json
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "templates" / "catalog.json"


def _inline(v) -> str:
    if isinstance(v, dict):
        return "{}" if not v else "{ " + ", ".join(f"{json.dumps(k, ensure_ascii=False)}: {_inline(x)}" for k, x in v.items()) + " }"
    if isinstance(v, list):
        return "[" + ", ".join(_inline(x) for x in v) + "]"
    return json.dumps(v, ensure_ascii=False)


def dumps(c: dict) -> str:
    out = []
    for k, v in c.items():
        if k == "notes":
            body = "[\n" + ",\n".join(f"    {json.dumps(n, ensure_ascii=False)}" for n in v) + "\n  ]"
        elif isinstance(v, dict) and k != "overlay_common":
            body = "{\n" + ",\n".join(f"    {json.dumps(n, ensure_ascii=False)}: {_inline(x)}" for n, x in v.items()) + "\n  }"
        else:
            body = _inline(v)
        out.append(f"  {json.dumps(k)}: {body}")
    return "{\n" + ",\n".join(out) + "\n}\n"


def load(path: Path = PATH) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save(c: dict, path: Path = PATH) -> None:
    path.write_text(dumps(c), encoding="utf-8")
