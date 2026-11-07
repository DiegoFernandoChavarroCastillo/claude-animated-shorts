"""F6 (story-2d): el pipeline elige reglas según meta.engine (python pipeline/tests/test_engine2d.py)."""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "tools" / "qa"))
import publish_pack  # noqa: E402
import qa_rules  # noqa: E402
import style_check  # noqa: E402
from common import engine_of  # noqa: E402

fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


def layers(*assets):
    return [{"asset": a, "z": i} for i, a in enumerate(assets)]


def make(pal_last="cueva", assets_last=("cueva_corte", "prisioneros")):
    d = Path(tempfile.mkdtemp())
    beats, words, t = [], [], 0.1
    for i in range(4):
        ids, ws = f"b{i + 1}", ["una", "dos", "tres", "cuatro", "cinco"]
        for k, w in enumerate(ws):
            words.append({"w": w, "start": round(t + 0.4 * k, 2), "end": round(t + 0.4 * (k + 1), 2), "beat": ids})
        t += 2.4
        last = i == 3
        beats.append({"id": ids, "role": "hook" if i == 0 else "scene", "text": " ".join(ws), "actions": [{"type": "pop", "at": "una", "target": "prisioneros"}],
                      "scene": {"palette": pal_last if last else "cueva", "light": "fuego", "layers": layers(*(assets_last if last else ("cueva_corte", "prisioneros"))), "camera": {"preset": "push_in"}}})
    (d / "05_story.json").write_text(json.dumps({"meta": {"engine": "2d", "tailS": 0.2}, "beats": beats}), encoding="utf-8")
    (d / "04_words.json").write_text(json.dumps(words), encoding="utf-8")
    (d / "02_SCRIPT.md").write_text("# T\nlang: es\nclosing: bucle\n", encoding="utf-8")
    return d, {"meta": {"engine": "2d", "lang": "es"}, "beats": beats}


rows = {r[0]: r for r in qa_rules.rows(make()[0])}
check("2D: el bucle visual compara paleta y assets (pasa)", rows.get("el último beat vuelve a la paleta y a los assets del primero", (0, 0, 0, False))[3])
rows = {r[0]: r for r in qa_rules.rows(make(pal_last="exterior")[0])}
check("2D: paleta distinta rompe el bucle visual", not rows["el último beat vuelve a la paleta y a los assets del primero"][3])
rows = {r[0]: r for r in qa_rules.rows(make(assets_last=("exterior_sol",))[0])}
check("2D: assets distintos rompen el bucle visual", not rows["el último beat vuelve a la paleta y a los assets del primero"][3])
check("engine_of: 3d por defecto y 2d si lo dice", engine_of({"meta": {}}) == "3d" and engine_of({"meta": {"engine": "2d"}}) == "2d")
m3, m2 = dict((k, r) for _, k, r in style_check.metrics_for("3d")), dict((k, r) for _, k, r in style_check.metrics_for("2d"))
check("rangos 2D propios y los del 3D intactos", m3["luma_med"] == (0.14, 0.38) and m2["luma_med"][0] < 0.14 and m2["cuts_per_min"] == m3["cuts_per_min"])
tags = publish_pack.hashtags(make()[1], "es")
check("hashtags 2D: del asset y de historias, sin 'ciencia'", "#ciencia" not in tags and "#filosofia" in tags and len(tags) <= 5, tags)
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
