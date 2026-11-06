"""F18: el ejemplo vigente (bluetooth-wifi) pasa TODAS las reglas del plan, con tiempos reales, y las del QA que no necesitan video
(python pipeline/tests/test_examples.py). Si una regla nueva rompe el ejemplo, o se ajusta el ejemplo o la regla."""
import json
import shutil
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import qa_rules  # noqa: E402
from validate_story import script_closing, script_lines, validate  # noqa: E402

EX = HERE.parents[1] / "templates/examples/bluetooth-wifi"
story, words = json.loads((EX / "05_story.json").read_text(encoding="utf-8")), json.loads((EX / "04_words.json").read_text(encoding="utf-8"))
md = (EX / "02_SCRIPT.md").read_text(encoding="utf-8")
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


errs = validate(story, words, script_lines(md), True, script_closing(md))
check("el ejemplo pasa validate_story con --words, --script y --require-actions", not errs, errs)
d = Path(tempfile.mkdtemp())
for f in ("05_story.json", "04_words.json", "02_SCRIPT.md"):
    shutil.copy(EX / f, d / f)
rows = qa_rules.rows(d)
check("el ejemplo pasa todas las reglas de calidad de qa_rules", all(r[3] for r in rows), [r for r in rows if not r[3]])
check("el ejemplo dura entre 60 y 120 s", 60 < words[-1]["end"] + story["meta"]["tailS"] < 120)
check("el ejemplo usa sub-planos de cámara (al menos uno)", any(b.get("shots") for b in story["beats"]))
sys.exit(1 if fails else 0)
