"""Reglas de retención de la auditoría del 28 nov (D132) en validate_script.py: 25–38 s, gancho sin «Imagina…», sin muro
académico, una sola moraleja, pocas preguntas y pregunta final corta (python pipeline/tests/test_retencion.py)."""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "pipeline"))
from validate_script import VIRAL, validate  # noqa: E402

MD = (ROOT / "templates" / "examples" / "erizo-30s" / "02_SCRIPT.md").read_text(encoding="utf-8")
HOOK = "[hook] Saboteas tus relaciones justo cuando todo empieza a ir bien."
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


def has(errs, frag):
    return any(frag in e for e in errs)


errs, st = validate(MD)
check("el erizo de 30 s pasa", not errs, errs)
check("rango de las historias 2D: 85–125 palabras", VIRAL["story2d"]["words"] == [85, 125] and 85 <= st["words"] <= 125, st.get("words"))
check("rango de duración 2D en el QA: 24–40 s", VIRAL["story2d"]["durationS"] == [24, 40])

errs, _ = validate(MD.replace(HOOK, "[hook] Imagina que tienes frío y abrazas a alguien con púas."))
check("«Imagina que…» falla (D132, antes valía por D124)", has(errs, "«imagina…»"), errs)
errs, _ = validate(MD.replace("guion_autor", "x").replace("pacing: viral", "pacing: viral\nguion_autor: usuario").replace(HOOK, "[hook] Imagina a dos erizos con frío en la nieve."))
check("también en un guion del usuario (Diego pidió que se reescriban)", has(errs, "«imagina…»"), errs)
errs, _ = validate(MD.replace(HOOK, "[hook] La paradoja del erizo explica por qué saboteas tus relaciones."))
check("abrir con el nombre del tema falla", has(errs, "«la paradoja de…»"), errs)

errs, _ = validate(MD.replace("Schopenhauer vio en ellos a la sociedad humana entera.", "Esta es la famosa paradoja del erizo de Schopenhauer."))
check("«Esta es la famosa paradoja…» es muro académico", has(errs, "muro académico"), errs)
errs, _ = validate(MD.replace("Schopenhauer vio en ellos a la sociedad humana entera.", "Una idea propuesta por el filósofo Arthur Schopenhauer."))
check("«propuesta por el filósofo…» es muro académico", has(errs, "muro académico"), errs)

errs, _ = validate(MD.replace("Prueban toda la noche, hasta hallar la distancia justa.", "Quizás la clave es la distancia. Tal vez nunca la encuentren."))
check("dos frases de moraleja fallan", has(errs, "la conclusión se repite"), errs)

errs, _ = validate(MD.replace("Tú haces lo mismo.", "¿Te suena? ¿Haces lo mismo? ¿Seguro?"))
check("tres preguntas en el cuerpo fallan", has(errs, "preguntas entre el gancho"), errs)

cta = "[cta] Y mientras esperas eso, sin darte cuenta, saboteas…"
errs, _ = validate(MD.replace(cta, "[cta] ¿Prefieres arriesgarte a sufrir por acercarte o protegerte hasta quedarte solo y sin relaciones?"))
check("pregunta final de más de 8 palabras falla", has(errs, "pregunta final"), errs)

long_md = MD.replace("[return]", "[ascent] " + " ".join(["La nieve cae despacio sobre ellos."] * 6) + "\n[return]")
errs, _ = validate(long_md)
check("más de 125 palabras falla", has(errs, "longitud"), errs)

# --- tope del gancho en un story 2D viral (D132: 2,5 s para cualquier tipo)
from validate_story import hook_max_s  # noqa: E402
check("gancho y_si en story 2D viral: 2,5 s", hook_max_s("y_si", {"pacing": "viral", "engine": "2d"}) == 2.5)
check("sin story 2D viral sigue el tope del tipo (4 s)", hook_max_s("y_si") == 4.0)

# --- SFX: golpe y corte de música en el clímax, sin huecos de más de 4 s
import numpy as np  # noqa: E402
from sfx_plan import fill_gaps  # noqa: E402
from mix import music_cuts  # noqa: E402
ws = [{"w": "x", "start": t, "end": t + 0.2} for t in np.arange(0, 12, 0.3)]
ev = fill_gaps([{"type": "impact", "t": 0.0, "why": ""}], ws, 12.0, 4.0)
ts = [0.0] + [e["t"] for e in ev] + [12.0]
check("fill_gaps: ningún hueco de más de 4 s", max(b - a for a, b in zip(ts, ts[1:])) <= 4.0, ts)
g = music_cuts({"musicCuts": [{"t": 1.0, "dur": 0.4}]}, 48000 * 3)[0]
check("music_cuts: −30 dB durante el corte y vuelve a 1", g[int(48000 * 1.2)] < 0.05 and g[-1] == 1.0)

# --- QA sobre el video hecho
from qa_rules import retention_rows  # noqa: E402
st = {"meta": {"pacing": "viral", "engine": "2d", "hookTitle": "¿Y si fueras invisible?"},
      "beats": [{"text": "Imagina a dos erizos con frío."}, {"text": "Esta es la famosa paradoja del erizo."}]}
rows_ = {r[0]: r[3] for r in retention_rows(st, [], Path("/no/existe"))}
check("QA: «Imagina…» en el gancho sale ❌", rows_.get("el gancho no abre con «Imagina…» ni con el nombre del tema") is False, rows_)
check("QA: muro académico sale ❌", rows_.get("sin muro académico en la voz («esta es la famosa…»)") is False, rows_)
check("QA: titular del gancho en el tercio superior", rows_.get("titular del gancho en el tercio superior (fracción del alto)") is True, rows_)

sys.exit(1 if fails else 0)
