"""Alineación: una palabra que Whisper estira tras saltarse un tramo no se come el tramo (python pipeline/tests/test_align.py). Sin modelo."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from align import align  # noqa: E402

fails = 0


def check(name, ok):
    global fails
    print("OK " if ok else "MAL", name)
    fails += not ok


# «Así, un segundo era el día dividido entre ochenta y seis mil cuatrocientos.»: Whisper oye hasta «el» y lo estira 2,9 s
txt = "Así, un segundo era el día dividido entre ochenta y seis mil cuatrocientos.".split()
script = [{"w": w, "beat": "b01", "seg": 0} for w in txt]
heard = [{"w": "Así,", "start": 0.0, "end": 0.4}, {"w": "un", "start": 1.1, "end": 1.2}, {"w": "segundo", "start": 1.2, "end": 1.6},
         {"w": "era", "start": 1.6, "end": 1.9}, {"w": "el", "start": 1.9, "end": 4.8}]
out = align(script, heard, [(0.0, 4.8)])
t = {x["w"]: x for x in out}
check("la palabra estirada se recorta", t["el"]["end"] < 2.5)
check("el tramo perdido se reparte (día empieza tras «el»)", 1.9 < t["día"]["start"] < 2.5)
check("las palabras perdidas no se apilan en el final", len({round(x["start"], 2) for x in out}) == len(out))
check("tiempos monótonos", all(out[i]["start"] >= out[i - 1]["start"] for i in range(1, len(out))))
# una palabra normal no cambia
out2 = align([{"w": "hola", "beat": "b01", "seg": 0}], [{"w": "hola", "start": 0.1, "end": 0.5}], [(0.0, 1.0)])
check("una palabra normal conserva su tiempo", out2[0]["start"] == 0.1 and out2[0]["end"] == 0.5)
print("TODO BIEN" if not fails else f"{fails} FALLOS")
sys.exit(1 if fails else 0)
