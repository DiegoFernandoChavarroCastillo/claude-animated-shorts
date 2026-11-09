"""F20: estilos 3D / 2.5D / 2D. Cámara 2D de los planos, anclas en pantalla, catálogo y frames de los cortes en los stills,
ejecutando el código real (python pipeline/tests/test_styles.py)."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline"))
from make_short import cut_frames  # noqa: E402

js = (ROOT / "pipeline/tests/js/styles_check.mjs").read_text(encoding="utf-8")
r = subprocess.run(["node", "--input-type=module"], input=js, cwd=ROOT / "studio", capture_output=True, text=True)
if r.returncode:
    print("MAL no se pudo ejecutar el código TypeScript:", r.stderr[-600:])
    sys.exit(1)
m = json.loads(r.stdout.strip().splitlines()[-1])
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


check("plano: push_in acerca (el zoom crece durante el beat)", m["pushZoom"][1] > m["pushZoom"][0] * 1.05, m["pushZoom"])
check("plano: pull_out aleja (el zoom baja)", m["pullZoom"][1] < m["pullZoom"][0], m["pullZoom"])
check("plano: dolly_side desplaza en x hacia su lado", m["dollyX"][1] - m["dollyX"][0] > 40, m["dollyX"])
check("plano: follow_anchor va hacia el ancla (filtro, a la derecha)", m["follow"][1] - m["follow"][0] > 100, m["follow"])
check("plano: a mitad de beat el encuadre es el base (zoom ≈ 1, sin giro)", abs(m["mid"]["zoom"] - 1) < 0.05 and abs(m["mid"]["roll"]) < 1e-6, m["mid"])
bad = [(h, a, p) for h, a, p in m["anchors"] if not p or not (0 <= p[0] <= 1080 and 300 <= p[1] <= 1600)]
check("plano: todas las anclas caen dentro del cuadro", not bad, bad)
check("plano: cada objeto plano tiene su ilustración (flat)", m["flatHaveComp"])
check("catálogo y código coinciden (entornos, objetos, overlays)", not m["catalog"], m["catalog"])
st = {"beats": [{"id": "b1", "overlays": [{"type": "Cutaway", "at": "dos", "hold": 60}, {"type": "Pill", "at": "una"}]},
                {"id": "b2", "overlays": [{"type": "Insert", "at": "tres"}]}]}
w = [{"w": "una", "start": 0, "beat": "b1"}, {"w": "dos,", "start": 1.0, "beat": "b1"}, {"w": "tres", "start": 3.0, "beat": "b2"}]
check("stills: un frame a 2/3 de cada Cutaway e Insert, dentro de su beat", cut_frames(st, w, [{"a": 0, "b": 80}, {"a": 80, "b": 200}]) == [70, 114])
sys.exit(1 if fails else 0)
