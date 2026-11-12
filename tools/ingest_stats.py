"""Cruza las estadísticas de las plataformas con lo que usó cada video (gancho, estructura, cierre) para ver qué rinde en TU canal.

    python tools/ingest_stats.py stats.csv          # añade o actualiza filas en out/stats.json y muestra el resumen
    python tools/ingest_stats.py                    # solo el resumen de lo ya guardado

El CSV lleva una fila por video y plataforma. Columnas (se aceptan estos nombres, en minúsculas):
  id            el id de out/<id>/ (obligatoria)
  platform      youtube | tiktok | instagram | facebook (opcional)
  views         vistas
  hook_rate     % de gente que pasa de los 3 primeros segundos (0-100)   [alias: retention_3s, hook]
  avg_view_pct  % medio visto (puede pasar de 100 con bucle)             [alias: avg_viewed, retention]
  loops         repeticiones por vista o % que repite (opcional)         [alias: replays]
Los números salen de YouTube Studio, TikTok Analytics o Instagram Insights: cópialos a mano. Con menos de 10 videos por grupo
las medias son anécdotas; el resumen lo avisa.
"""
from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STORE = ROOT / "out" / "stats.json"
ALIAS = {"retention_3s": "hook_rate", "hook": "hook_rate", "avg_viewed": "avg_view_pct", "retention": "avg_view_pct", "replays": "loops"}
NUM = ("views", "hook_rate", "avg_view_pct", "loops")
MIN_N = 10


def read_csv(path: Path) -> list[dict]:
    rows = []
    with path.open(encoding="utf-8-sig", newline="") as f:
        for r in csv.DictReader(f):
            r = {ALIAS.get(k.strip().lower(), k.strip().lower()): v.strip() for k, v in r.items() if k}
            if not r.get("id"):
                continue
            for k in NUM:
                try:
                    r[k] = float(r[k].replace(",", ".")) if r.get(k) else None
                except ValueError:
                    r[k] = None
            rows.append(r)
    return rows


def merge(rows: list[dict]) -> list[dict]:
    old = json.loads(STORE.read_text(encoding="utf-8")) if STORE.exists() else []
    key = lambda r: (r["id"], r.get("platform", ""))  # noqa: E731
    by = {key(r): r for r in old}
    for r in rows:
        by[key(r)] = {**by.get(key(r), {}), **{k: v for k, v in r.items() if v not in (None, "")}}
    out = list(by.values())
    STORE.parent.mkdir(exist_ok=True)
    STORE.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    return out


def meta_of(vid: str) -> dict:
    p = ROOT / "out" / vid / "meta.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def summary(rows: list[dict]) -> str:
    out = []
    for field in ("hook", "structure", "closing", "theme"):   # `theme`: tema visual de las historias 2D (D123)
        g = defaultdict(list)
        for r in rows:
            m = meta_of(r["id"])
            g[m.get(field) or "(sin meta.json)"].append(r)
        out += [f"\n## Por {field}", "", "| valor | videos | vistas (media) | hook_rate % | % visto | repeticiones |", "|---|---|---|---|---|---|"]
        for val, rs in sorted(g.items(), key=lambda kv: -len(kv[1])):
            avg = lambda k: (lambda xs: f"{sum(xs) / len(xs):.1f}" if xs else "n/d")([r[k] for r in rs if r.get(k) is not None])  # noqa: E731
            warn = " ⚠ pocos" if len({r["id"] for r in rs}) < MIN_N else ""
            out.append(f"| {val} | {len({r['id'] for r in rs})}{warn} | {avg('views')} | {avg('hook_rate')} | {avg('avg_view_pct')} | {avg('loops')} |")
    out.append(f"\nCon menos de {MIN_N} videos por grupo la diferencia puede ser azar: no cambies `elegir` en formulas.json con tan pocos datos.")
    return "\n".join(out)


def main():
    rows = merge(read_csv(Path(sys.argv[1]))) if len(sys.argv) > 1 else (json.loads(STORE.read_text(encoding="utf-8")) if STORE.exists() else [])
    if not rows:
        print("Sin datos: pasa un CSV (ver la cabecera de este archivo).")
        return
    print(f"{len(rows)} filas en {STORE}")
    print(summary(rows))


if __name__ == "__main__":
    main()
