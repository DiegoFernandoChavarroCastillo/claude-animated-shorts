"""Etapa 3: TTS del guion (plan §7.2/§7.4) -> 03_voice.wav (+ .segments.json).

    python pipeline\\voice.py --story templates\\examples\\hielo-flota\\05_story.json --out out\\hielo-flota
                              [--engine kokoro] [--voice em_alex] [--speed 1.0] [--force]

Ritmo: tras sintetizar mide palabras/s (palabras del guion / duración del WAV). Si la media sale de 2,6–3,0,
reajusta la velocidad hacia 2,8 y repite una vez.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import PipelineError, load_json, segments, words_of, run_main, write_json  # noqa: E402

WPS_LO, WPS_HI, WPS_TARGET = 2.6, 3.0, 2.8


def wav_seconds(p: Path) -> float:
    import wave
    with wave.open(str(p), "rb") as w:
        return w.getnframes() / w.getframerate()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--story", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--engine", default=None)
    ap.add_argument("--voice", default=None)
    ap.add_argument("--speed", type=float, default=None)
    ap.add_argument("--name", default="03_voice.wav")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    from tts import synth
    story = load_json(a.story)
    meta = story["meta"]
    eng = a.engine or meta["voice"]["engine"]
    voice = a.voice or meta["voice"]["voice"]
    speed = a.speed or float(meta["voice"].get("speed", 1.0))
    out = a.out / a.name
    if out.exists() and not a.force:
        print(f"ya existe {out} (usa --force para regenerar)")
        return
    segs = segments(story)
    nwords = sum(len(words_of(b["text"])) for b in story["beats"])
    report = []
    for attempt in range(2):
        synth([s.text for s in segs], meta["lang"], voice, speed, [s.pause_after_ms for s in segs], out, eng,
              [{"beat": s.beat, "role": s.role} for s in segs])
        dur = wav_seconds(out)
        wps = nwords / dur
        report.append({"speed": round(speed, 3), "dur_s": round(dur, 2), "wps": round(wps, 3)})
        print(f"[voz] {eng}/{voice} speed {speed:.3f}: {dur:.2f} s, {nwords} palabras, {wps:.2f} pal/s")
        if WPS_LO <= wps <= WPS_HI or attempt == 1:
            break
        speed = max(0.7, min(1.4, speed * WPS_TARGET / wps))
    write_json(a.out / (a.name + ".report.json"), {"engine": eng, "voice": voice, "attempts": report, "words": nwords})


if __name__ == "__main__":
    run_main(main)
