"""F16–F18: paquete de publicación (hashtags, meta.json), estadísticas (ingest_stats) e informe de huecos (python pipeline/tests/test_tools.py)."""
import csv
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "pipeline"))
sys.path.insert(0, str(ROOT / "tools"))
import publish_pack  # noqa: E402

fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


EX = ROOT / "templates/examples/bluetooth-wifi"
d = Path(tempfile.mkdtemp()) / "mi-video"
d.mkdir()
for f in ("02_SCRIPT.md", "04_words.json", "05_story.json"):
    shutil.copy(EX / f, d / f)
story = json.loads((d / "05_story.json").read_text(encoding="utf-8"))
tags = publish_pack.hashtags(story, "es")
check("hashtags: entre 3 y 5, con # y sin acentos ni espacios", 3 <= len(tags) <= 5 and all(t.startswith("#") and t[1:].isascii() and " " not in t for t in tags), tags)
check("hashtags: incluyen los dos genéricos del idioma", {"#sabiasque", "#ciencia"} <= set(tags))
check("hashtags en inglés usan los genéricos en inglés", {"#didyouknow", "#science"} <= set(publish_pack.hashtags(story, "en")))
m = publish_pack.meta(d)
check("meta.json: gancho, estructura y cierre del guion", (m["hook"], m["structure"], m["closing"]) == ("mito", "versus", "bucle"), m)
check("meta.json: gancho dicho en ≤ 3,2 s, duración 60–120 s y hueco ≤ 3,5 s", m["hook_spoken_s"] <= 3.2 and 60 < m["duration_s"] < 120 and m["max_event_gap_s"] <= 3.5, m)
check("meta.json: cuenta los sub-planos y lista los objetos", m["shots"] == 6 and "espectro_canales" in m["heroes"], m)

# ---- ingest_stats
import ingest_stats  # noqa: E402

tmp = Path(tempfile.mkdtemp())
ingest_stats.STORE = tmp / "stats.json"
metas = {"a": {"hook": "mito", "structure": "versus", "closing": "bucle"}, "b": {"hook": "mito", "structure": "cadena", "closing": "bucle"},
         "c": {"hook": "pregunta", "structure": "cadena", "closing": "pregunta"}}
ingest_stats.meta_of = lambda vid: metas.get(vid, {})
with open(tmp / "s.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["id", "platform", "views", "retention_3s", "avg_viewed", "replays"])
    w.writerows([["a", "tiktok", "1000", "70", "95", "0,3"], ["b", "tiktok", "500", "60", "80", ""], ["c", "tiktok", "800", "50", "70", ""], ["zz", "tiktok", "1", "", "", ""]])
rows = ingest_stats.merge(ingest_stats.read_csv(tmp / "s.csv"))
check("ingest: lee 4 filas, acepta alias de columnas y coma decimal", len(rows) == 4 and rows[0]["hook_rate"] == 70 and rows[0]["loops"] == 0.3, rows[0])
rows = ingest_stats.merge([{"id": "a", "platform": "tiktok", "views": 2000.0}])
check("ingest: volver a cargar actualiza la fila sin duplicarla ni borrar sus otros datos", len(rows) == 4 and next(r for r in rows if r["id"] == "a")["views"] == 2000 and next(r for r in rows if r["id"] == "a")["hook_rate"] == 70)
s = ingest_stats.summary(rows)
check("ingest: resume por gancho, estructura y cierre y avisa si hay pocos videos", "## Por hook" in s and "## Por closing" in s and "⚠ pocos" in s and "(sin meta.json)" in s)

# ---- gaps_report
import gaps_report  # noqa: E402

g = Path(tempfile.mkdtemp())
for vid, text in (("v1", "- Auriculares: sin objeto. Se usó un icono.\n- Banda de radio: Prefab nuevo `x`."), ("v2", "- Auriculares y televisión: sin objeto.\n# título\nno es hueco")):
    (g / vid).mkdir()
    (g / vid / "05_gaps.md").write_text(text, encoding="utf-8")
rows = gaps_report.read(g)
check("gaps: 3 huecos, 1 resuelto con un prefab", len(rows) == 3 and sum(r["resuelto"] for r in rows) == 1, rows)
check("gaps: cuenta las palabras repetidas en los abiertos", gaps_report.words_of_open(rows)["auriculares"] == 2)
check("gaps: el informe resume resueltos y abiertos", "1 resueltos con un prefab, 2 abiertos" in gaps_report.report(rows))
sys.exit(1 if fails else 0)
