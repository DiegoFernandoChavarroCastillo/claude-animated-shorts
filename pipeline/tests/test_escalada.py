"""Escalada de hitos (D126): estructura `escalada` con su rango de palabras (150–215) y `## Ángulo` (python pipeline/tests/test_escalada.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import validate_script  # noqa: E402
from validate_script import validate  # noqa: E402

# ia-frontera es anterior a D132 (202 palabras, 45–59 s); aquí se prueba la estructura, no el rango nuevo (100–160)
validate_script.VIRAL["escalada"]["words"] = [150, 215]
validate_script.VIRAL["escalada"]["hookMax"] = 11
from validate_story2d import validate as validate_story  # noqa: E402

MD = (Path(__file__).resolve().parents[2] / "templates" / "examples" / "ia-frontera" / "02_SCRIPT.md")
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


if MD.exists():
    md = MD.read_text(encoding="utf-8")
    errs, stats = validate(md)
    check("el guion de ia-frontera pasa como escalada", not errs and stats.get("structure") == "escalada", errs)
    errs, _ = validate(md.replace("## Ángulo", "## Otra cosa"))
    check("escalada sin Ángulo falla", any("Ángulo" in e for e in errs), errs)
    short = "\n".join(l for l in md.splitlines() if not l.startswith(("[hito]", "[giro]")) or "Sus aciertos" in l)
    errs, _ = validate(short)
    check("escalada por debajo de 150 palabras falla", any("longitud" in e for e in errs), errs)
    errs, _ = validate(md.replace("[hito]", "[pista]"))
    check("escalada con roles de enigma falla", any("no usa los roles" in e for e in errs), errs)
else:
    print("(sin out/ia-frontera: se omiten las pruebas del guion)")

# D127: guion_autor: usuario implica hook_autor: usuario (no se le aplican las reglas de forma del gancho)
base = """# x
lang: es
hook: escena
structure: mito
guion_autor: usuario

## Guion
"""
from validate_script import parse  # noqa: E402
sc = parse(base + "[hook] Esto era una IA.\n")
check("guion_autor: usuario se lee de la cabecera", sc.guion_autor == "usuario")

story = {"meta": {"engine": "2d", "lang": "es"}, "beats": [{"id": "b1", "role": "hook", "text": "x"}]}
errs = validate_story(story, structure="escalada")
check("escalada sin meta.structure en el story falla", any("meta.structure" in e for e in errs), errs)
story["meta"]["structure"] = "escalada"
errs = validate_story(story, structure="escalada")
check("con meta.structure no se queja de eso", not any("meta.structure" in e for e in errs), errs)
sys.exit(1 if fails else 0)
