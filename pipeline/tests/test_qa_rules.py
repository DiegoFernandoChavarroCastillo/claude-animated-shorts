"""F18: reglas de calidad del QA (qa_rules.py) y el cierre de calidad de make_short (python pipeline/tests/test_qa_rules.py)."""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import qa_rules  # noqa: E402

fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


def make(hook_end=2.5, hook_act_at="Te", cam="push_in", closing="bucle", tail=0.2, last_env=None, gap_ok=True, accents=(), beat_len=2.4, title=True):
    d = Path(tempfile.mkdtemp())
    beats, words, t = [], [], 0.1
    for i in range(6):
        L = hook_end - 0.1 if i == 0 else beat_len
        ids = f"b{i + 1:02d}"
        ws = ["Te", "dijeron", "que", "el", "bluetooth"] if i == 0 else ["una", "dos", "tres", "cuatro", "cinco"]
        for k, w in enumerate(ws):
            words.append({"w": w, "start": round(t + L * k / 5, 2), "end": round(t + L * (k + 1) / 5, 2), "beat": ids})
        t += L
        acts = [{"type": "pulse", "at": ws[0]}] if gap_ok and (i or hook_act_at) else []
        if i == 0 and hook_act_at and hook_act_at != "Te":
            acts = [{"type": "pulse", "at": hook_act_at}]
        beats.append({"id": ids, "role": "hook" if i == 0 else "chain", "text": " ".join(ws), "scene": {"env": "e1" if i != 5 or not last_env else last_env, "light": "tech",
                      "hero": {"kind": "primitive", "asset": "x"}, "camera": {"preset": cam if i == 0 else "push_in"}}, "overlays": [], "actions": acts})
    (d / "05_story.json").write_text(json.dumps({"meta": {"tailS": tail, **({"hookTitle": "Te lo cuento"} if title else {})}, "beats": beats}), encoding="utf-8")
    (d / "04_words.json").write_text(json.dumps(words), encoding="utf-8")
    (d / "02_SCRIPT.md").write_text(f"# T\nlang: es\nclosing: {closing}\n", encoding="utf-8")
    ev = [{"type": a[0], "t": a[1], "why": "x"} for a in accents]
    (d / "08_sfx_plan.json").write_text(json.dumps({"duration_s": 60.0, "events": ev}), encoding="utf-8")
    return d


def res(d):
    return {r[0]: r[3] for r in qa_rules.rows(d)}


r = res(make())
check("un plan correcto pasa todas las reglas", all(r.values()), [k for k, v in r.items() if not v])
check("gancho largo falla", not res(make(hook_end=4.0))["gancho dicho en (s)"])
check("sin titular del gancho (meta.hookTitle) falla (D121)", not res(make(title=False))["titular del gancho en el fotograma 0 (meta.hookTitle)"])
check("gancho sin acción pronto falla", not res(make(hook_act_at=None))["primera acción del gancho (s)"])
check("cámara drift en el gancho falla", not res(make(cam="drift"))["cámara del gancho"])
check("hueco largo sin eventos falla", not res(make(gap_ok=False, beat_len=5.0))["hueco máximo sin cambios en pantalla (s)"])
check("bucle con cola de 1 s falla", not res(make(tail=1.0))["cola tras la última palabra con bucle (s)"])
check("otro cierre no exige cola corta", "cola tras la última palabra con bucle (s)" not in res(make(closing="reto_casa", tail=1.0)))
check("bucle que no vuelve al entorno falla", not res(make(last_env="e2"))["el último beat vuelve al entorno y objeto del primero"])
check("dos acentos pegados fallan", not res(make(accents=[("zap", 10.0), ("blip", 10.5)]))["separación mínima entre acentos (s)"])
check("demasiados acentos fallan", not res(make(accents=[("zap", 5.0 + 2 * k) for k in range(25)]))["acentos de sonido por cada 3 s"])
check("acentos bien repartidos pasan", res(make(accents=[("zap", 5.0), ("blip", 12.0), ("ding", 30.0)]))["acentos de sonido por cada 3 s"])
sys.exit(1 if fails else 0)
