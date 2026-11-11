"""Historias dramatizadas (D118): estructura `drama`, cabeceras `ficcion`/`pov` y muletillas de crónica en validate_script.py
(python pipeline/tests/test_drama.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT  # noqa: E402
import validate_script  # noqa: E402
from validate_script import validate  # noqa: E402

validate_script.WORDS_MIN, validate_script.WORDS_MAX = 100, 400   # el ejemplo es de formato (anterior a D121, 242 palabras)

md = (ROOT / "templates" / "examples" / "mito-caverna" / "02_SCRIPT.md").read_text(encoding="utf-8")
FIC = "\n## Ficción\n- ancla: los prisioneros ven sombras\n- inventado: el frío de la cueva\n"
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


def header(text, extra):
    return text.replace("closing: bucle", "closing: bucle\n" + extra, 1)


assert "closing: bucle" in md
check("sin `ficcion` no cambia nada", not validate(md)[0], validate(md)[0])
dram = header(md, "ficcion: dramatizada\npov: cercano") + FIC
check("dramatizada con pov y sección Ficción pasa", not validate(dram)[0], validate(dram)[0])
# 11 nov: «Eres Cleopatra» y las estructuras conceptuales no gustaron; en historias reales se rechazan
errs = validate(header(md, "ficcion: dramatizada\npov: tu") + FIC)[0]
check("pov tu en una historia real falla", any("`pov: tu`" in e for e in errs), errs)
check("pov tu con ficcion libre pasa", not validate(header(md, "ficcion: libre\npov: tu") + FIC)[0])
errs = validate(header(md, "ficcion: dramatizada"))[0]
check("dramatizada sin pov ni Ficción falla", any("pov" in e for e in errs) and any("## Ficción" in e for e in errs), errs)
check("nivel desconocido falla", any("nivel de ficción" in e for e in validate(header(md, "ficcion: novela\npov: tu") + FIC)[0]))
check("pov desconocido falla", any("punto de vista" in e for e in validate(header(md, "ficcion: libre\npov: dron") + FIC)[0]))
lines = dram.splitlines()
k = next(i for i, l in enumerate(lines) if l.startswith("[scene]"))
lines[k] += " Según dicen, cuentan que nadie salió."
errs = validate("\n".join(lines))[0]
check("dos muletillas de crónica fallan con dramatizada", any("suena a documental" in e for e in errs), errs)
check("con fiel las muletillas no cuentan", not any("documental" in e for e in validate("\n".join(lines).replace("ficcion: dramatizada", "ficcion: fiel"))[0]))
# estructura drama: el giro va antes del regreso
lines = md.splitlines()
ret = [l for l in lines if l.startswith("[return]")]
body = [l for l in lines if not l.startswith("[return]")]
t = max(i for i, l in enumerate(body) if l.startswith("[twist]"))
drama = "\n".join(body[:t + 1] + ret + body[t + 1:]).replace("structure: alegoria", "structure: drama")
errs, stats = validate(header(drama, "ficcion: dramatizada\npov: testigo") + FIC)
check("estructura drama (twist → return) pasa", not errs and stats.get("structure") == "drama", errs)
check("drama sin `ficcion` falla", any("pide `ficcion:`" in e for e in validate(drama)[0]))
check("drama con el orden de alegoria falla", any("orden" in e for e in validate(header(md.replace("structure: alegoria", "structure: drama"), "ficcion: dramatizada\npov: tu") + FIC)[0]))
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
