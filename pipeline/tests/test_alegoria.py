"""La estructura `alegoria` (motor 2D) en validate_script.py (python pipeline/tests/test_alegoria.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT  # noqa: E402
import validate_script  # noqa: E402
from validate_script import validate  # noqa: E402

validate_script.WORDS_MIN, validate_script.WORDS_MAX = 100, 400   # el ejemplo es de formato (anterior a D121, 242 palabras)

md = (ROOT / "templates" / "examples" / "mito-caverna" / "02_SCRIPT.md").read_text(encoding="utf-8")
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


errs, stats = validate(md)
check("el ejemplo del mito de la caverna pasa", not errs, errs)
check("reconoce la estructura alegoria", stats.get("structure") == "alegoria")
bad = md.replace("[ascent]", "[scene]")
check("sin ascenso falla", any("al menos 1 líneas [ascent]" in e for e in validate(bad)[0]), validate(bad)[0])
lines = md.splitlines()
i, j = [k for k, l in enumerate(lines) if l.startswith("[rupture]")][:2]
lines[i], lines[j] = lines[j].replace("[rupture]", "[ascent]"), lines[i]
check("roles fuera de orden fallan", any("orden" in e for e in validate("\n".join(lines))[0]), validate("\n".join(lines))[0])
check("rol de otra estructura falla", any("no usa los roles" in e for e in validate(md.replace("[twist]", "[mechanism]"))[0]))
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
