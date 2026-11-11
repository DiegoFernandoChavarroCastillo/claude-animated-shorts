"""Prueba de la etapa `review` (pipeline/review_story.py): veredicto, caducidad por huella, rondas y modo manual.
Sin llamar a ningún modelo. Sin pytest: python pipeline/tests/test_review_story.py  (código 0 = todo bien)."""
from __future__ import annotations

import json
import shutil
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import review_story as rs  # noqa: E402
from common import PipelineError  # noqa: E402

EX = HERE.parents[1] / "templates/examples/solipsismo-viral"
bad = 0


def check(name: str, ok: bool, extra: str = "") -> None:
    global bad
    bad += not ok
    print(("OK  " if ok else "MAL ") + name + (f" ({extra})" if extra and not ok else ""))


def sandbox() -> Path:
    d = Path(tempfile.mkdtemp())
    for n in ("02_SCRIPT.md", "05_story.json"):
        shutil.copy(EX / n, d / n)
    story, words, t = json.loads((d / "05_story.json").read_text(encoding="utf-8")), [], 0.1
    for b in story["beats"]:
        for w in b["text"].split():
            words.append({"w": w, "start": round(t, 3), "end": round(t + 0.25, 3), "beat": b["id"]})
            t += 0.27
    (d / "04_words.json").write_text(json.dumps(words), encoding="utf-8")
    return d


def scores(**kw):
    base = {k: 8 for k in rs.DIMS}
    base.update(kw)
    return base


def raises(fn, frag: str) -> bool:
    try:
        fn()
    except PipelineError as e:
        return frag in str(e)
    return False


# veredicto
v = rs.verdict({"scores": scores()})
check("todo 8 pasa con total 8", v["pass"] and v["total"] == 8.0, str(v))
check("gancho bajo (6) devuelve aunque el total pase", not rs.verdict({"scores": scores(gancho=6, retencion=10, narrativa=10)})["pass"])
check("total bajo (6) devuelve", not rs.verdict({"scores": {k: 6 for k in rs.DIMS}})["pass"])
check("una dimensión por debajo del mínimo devuelve", not rs.verdict({"scores": scores(cierre_bucle=4)})["pass"])
check("calificación incompleta falla", raises(lambda: rs.verdict({"scores": {"gancho": 9}}), "incompleta"))
check("nota fuera de 0–10 falla", raises(lambda: rs.verdict({"scores": scores(gancho=11)}), "fuera de 0–10"))
check("el `pass` del agente no cuenta", not rs.verdict({"scores": {k: 3 for k in rs.DIMS}, "pass": True})["pass"])

# lectura de la respuesta del crítico
check("parse_review con ```json", rs.parse_review('texto\n```json\n{"scores": {"gancho": 9}}\n```')["scores"]["gancho"] == 9)
check("parse_review sin JSON falla", raises(lambda: rs.parse_review("no hay nada"), "JSON"))

# etapa completa en modo manual
d = sandbox()
check("sin 06_review.json en modo manual pide la calificación", raises(lambda: rs.evaluate(d, "manual"), "falta la calificación"))
check("se escribe la petición con la restricción de 35–59 s (D121)", "35–59 s" in (d / "06_review_request.md").read_text(encoding="utf-8"))
fp = rs.fingerprint(d)
(d / "06_review.json").write_text(json.dumps({"scores": scores(gancho=5), "fingerprint": fp, "problems": [{"beat": "b01", "dimension": "gancho", "issue": "flojo", "fix": "otro"}]}), encoding="utf-8")
check("story devuelto: lanza con las correcciones", raises(lambda: rs.evaluate(d, "manual"), "b01 (gancho)"))
check("el story devuelto deja 06_review.md", "DEVUELTO" in (d / "06_review.md").read_text(encoding="utf-8"))
(d / "06_review.json").write_text(json.dumps({"scores": scores(), "fingerprint": fp}), encoding="utf-8")
check("un 06_review.json vigente y bueno aprueba", rs.evaluate(d, "manual")["verdict"]["pass"])
(d / "02_SCRIPT.md").write_text((d / "02_SCRIPT.md").read_text(encoding="utf-8") + "\n", encoding="utf-8")
check("si el story cambia, la calificación caduca", raises(lambda: rs.evaluate(d, "manual"), "falta la calificación"))

# rondas máximas
d2 = sandbox()
hist = [{"round": i, "fingerprint": "x", "scores": scores(), "verdict": {"pass": False, "total": 5, "why": []}} for i in range(1, rs.CFG["maxRounds"] + 1)]
(d2 / "06_review.history.json").write_text(json.dumps(hist), encoding="utf-8")
check(f"tras {rs.CFG['maxRounds']} devoluciones se para y se consulta al usuario", raises(lambda: rs.evaluate(d2, "manual"), "consulta con el usuario"))

# ---- crítico de guion (etapa review-script, antes de la voz)
check("el crítico de guion usa sus propias dimensiones", "fidelidad" in rs.SCRIPT_DIMS and "drama" in rs.SCRIPT_DIMS and "coherencia_visual" not in rs.SCRIPT_DIMS)
sc_ok = {k: 8 for k in rs.SCRIPT_DIMS}
check("guion todo 8 pasa", rs.verdict({"scores": sc_ok}, "script")["pass"])
check("guion con fidelidad 4 devuelve", not rs.verdict({"scores": {**sc_ok, "fidelidad": 4}}, "script")["pass"])
check("las notas del story no sirven para el guion", raises(lambda: rs.verdict({"scores": scores()}, "script"), "incompleta"))
d3 = sandbox()
req = rs.build_request_script(d3)
check("la petición de guion no lleva tiempos ni plan visual", "Se ve" not in req and "Cámara" not in req and "[hook]" in req and "Palabras:" in req)
check("sin calificación el gate no deja generar voz", not rs.script_gate(d3)[0])
check("modo manual pide la calificación del guion", raises(lambda: rs.evaluate(d3, "manual", "script"), "critico_guion.md"))
fp3 = rs.fingerprint(d3, "script")
(d3 / "06a_script_review.json").write_text(json.dumps({"scores": {**sc_ok, "gancho": 5}, "fingerprint": fp3}), encoding="utf-8")
check("guion devuelto: lanza y el gate sigue cerrado", raises(lambda: rs.evaluate(d3, "manual", "script"), "voz aún no se ha generado") and not rs.script_gate(d3)[0])
(d3 / "06a_script_review.json").write_text(json.dumps({"scores": sc_ok, "fingerprint": fp3}), encoding="utf-8")
check("guion aprobado abre el gate", rs.evaluate(d3, "manual", "script")["verdict"]["pass"] and rs.script_gate(d3)[0])
(d3 / "05_story.json").write_text((d3 / "05_story.json").read_text(encoding="utf-8") + " ", encoding="utf-8")
check("cambiar el story no caduca la calificación del guion", rs.script_gate(d3)[0])
(d3 / "02_SCRIPT.md").write_text((d3 / "02_SCRIPT.md").read_text(encoding="utf-8") + "\n", encoding="utf-8")
check("cambiar el guion cierra el gate", not rs.script_gate(d3)[0])
check("el reporte marca los cambios de texto", "regenerar" in rs.md_report({"scores": scores(), "verdict": {"pass": True, "total": 8}, "round": 1,
      "problems": [{"beat": "b01", "dimension": "gancho", "issue": "x", "fix": "y", "text_change": True}]}))
sys.exit(1 if bad else 0)
