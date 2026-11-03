"""Piezas comunes del pipeline de audio (plan §7): rutas, lectura de story.json, frases y pausas del guion.

Las palabras se separan igual que los subtítulos (por espacios, con la puntuación pegada), para que words.json y el
texto de los beats coincidan palabra a palabra.
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO_KIT = ROOT / "templates" / "audio"          # dsp.py y sfx_gen.py del repo original (se reutilizan)
if str(AUDIO_KIT) not in sys.path:
    sys.path.insert(0, str(AUDIO_KIT))

FPS = 30
SR = 48000

# pausas entre frases (plan §7.4): 300–600 ms entre frases, 800–1000 ms antes del beat twist
PAUSE_SENTENCE_MS = 640    # D64: variante B elegida de oído (antes 380/560/950)
PAUSE_BEAT_MS = 940
PAUSE_TWIST_MS = 1600
LEAD_MS = 150      # silencio al empezar
TAIL_MS = 1000     # cola tras la última palabra (= TAIL_S de timeline.ts)


class PipelineError(Exception):
    """error esperado con mensaje claro para el usuario (sin traceback)"""


def load_json(p: Path):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def write_json(p: Path, data, indent=1):
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    Path(p).write_text(json.dumps(data, ensure_ascii=False, indent=indent), encoding="utf-8")


def words_of(text: str) -> list[str]:
    return text.split()


def norm(w: str) -> str:
    """palabra sin tildes ni puntuación, en minúsculas (igual que norm() de timeline.ts)"""
    import unicodedata
    s = unicodedata.normalize("NFD", w.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^\w]", "", s)


def sentences(text: str) -> list[str]:
    """frases de un beat: se corta tras . ? ! … (la puntuación se queda en la frase)"""
    parts = re.split(r"(?<=[.?!…])\s+", text.strip())
    return [p for p in parts if p]


@dataclass
class Segment:
    beat: str
    role: str
    text: str
    pause_after_ms: int


def segments(story: dict) -> list[Segment]:
    """frases del guion en orden, con la pausa que va después de cada una"""
    beats = story["beats"]
    out: list[Segment] = []
    for i, b in enumerate(beats):
        ss = sentences(b["text"])
        for k, s in enumerate(ss):
            if k < len(ss) - 1:
                pause = PAUSE_SENTENCE_MS
            elif i + 1 < len(beats):
                pause = PAUSE_TWIST_MS if beats[i + 1]["role"] == "twist" else PAUSE_BEAT_MS
            else:
                pause = 0
            out.append(Segment(b["id"], b["role"], s, pause))
    return out


def example_dir(ex_id: str) -> Path:
    d = ROOT / "templates" / "examples" / ex_id
    if not d.exists():
        raise PipelineError(f"no existe {d}")
    return d


def run_main(fn):
    """ejecuta fn() y convierte PipelineError en un mensaje limpio con código de salida 2"""
    try:
        fn()
    except PipelineError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(2)
