"""Etapa 4: alineación por palabra (plan §7.5) -> 04_words.json.

    python pipeline\\align.py --story <05_story.json> --wav <03_voice.wav> --out <04_words.json> [--model medium]

faster-whisper (CPU, int8, word_timestamps) y después alineación con el texto EXACTO del guion (difflib a nivel de
palabra normalizada), para que los subtítulos usen la ortografía y la puntuación del guion. Las palabras sin pareja
toman tiempos interpolados entre sus vecinas (repartidos por número de letras) y nunca salen de su frase: los tiempos
de cada frase vienen de <wav>.segments.json, que escribe la etapa de voz.

Validación: cero palabras sin tiempo, tiempos monótonos, dentro del WAV (±50 ms).
"""
from __future__ import annotations

import argparse
import difflib
import sys
import wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import PipelineError, load_json, norm, run_main, segments, words_of, write_json  # noqa: E402


def transcribe(wav: Path, lang: str, model: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError as e:
        raise PipelineError("faster-whisper no está instalado. Ejecuta pipeline\\setup_audio.ps1") from e
    m = WhisperModel(model, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(str(wav), language=lang, word_timestamps=True, beam_size=5, vad_filter=False)
    out = []
    for s in segs:
        for w in s.words or []:
            out.append({"w": w.word.strip(), "start": float(w.start), "end": float(w.end)})
    return out


MAX_WORD_S, PER_LETTER_S = 0.35, 0.09   # duración máxima creíble de una palabra hablada


def align(script: list[dict], heard: list[dict], spans: list[tuple[float, float]]) -> list[dict]:
    """script: [{w, beat, seg}] ; heard: [{w, start, end}] ; spans: (inicio, fin) de cada frase"""
    a = [norm(x["w"]) for x in script]
    b = [norm(x["w"]) for x in heard]
    times: list[tuple[float, float] | None] = [None] * len(script)
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            h = heard[blk.b + k]
            i = blk.a + k
            s0, s1 = spans[script[i]["seg"]]
            # una pareja que cae fuera de su frase es un falso emparejamiento (palabra repetida en otra frase)
            if s0 - 0.25 <= h["start"] <= s1 + 0.25:
                # Whisper a veces se salta un tramo (p. ej. un número largo) y estira la palabra anterior hasta el
                # siguiente silencio: se limita su duración para que el tramo perdido se reparta al interpolar
                times[i] = (h["start"], min(h["end"], h["start"] + MAX_WORD_S + PER_LETTER_S * len(a[i])))
    # huecos: interpolar dentro de la frase, repartiendo por número de letras
    n = len(script)
    i = 0
    while i < n:
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < n and times[j] is None and script[j]["seg"] == script[i]["seg"]:
            j += 1
        seg = script[i]["seg"]
        s0, s1 = spans[seg]
        left = times[i - 1][1] if i > 0 and times[i - 1] is not None and script[i - 1]["seg"] == seg else s0
        right = times[j][0] if j < n and times[j] is not None and script[j]["seg"] == seg else s1
        if right <= left:
            right = left + 0.08 * (j - i)
        lens = [max(1, len(norm(script[k]["w"]))) for k in range(i, j)]
        tot, t = sum(lens), left
        for k, L in zip(range(i, j), lens):
            d = (right - left) * L / tot
            times[k] = (t, t + d)
            t += d
        i = j
    out = []
    prev = 0.0
    for x, t in zip(script, times):
        # Whisper alarga a veces la última palabra de una frase hasta el silencio siguiente (o adelanta la primera
        # al inicio del audio): los tiempos se recortan al tramo real de la frase, que conocemos por la síntesis
        s0, s1 = spans[x["seg"]]
        t = (min(max(t[0], s0 - 0.05), s1), min(max(t[1], s0), s1 + 0.05))
        s, e = max(t[0], prev), max(t[1], t[0], prev)
        if e - s < 0.04:
            e = s + 0.04
        out.append({"w": x["w"], "start": round(s, 3), "end": round(e, 3), "beat": x["beat"]})
        prev = s
    return out


def validate(words: list[dict], dur: float) -> list[str]:
    errs = []
    for i, w in enumerate(words):
        if w.get("start") is None or w.get("end") is None:
            errs.append(f"palabra {i} '{w['w']}' sin tiempo")
        elif w["end"] < w["start"]:
            errs.append(f"palabra {i} '{w['w']}' termina antes de empezar")
        if i and w["start"] < words[i - 1]["start"]:
            errs.append(f"palabra {i} '{w['w']}' no es monótona")
    if words and (words[0]["start"] < 0 or words[-1]["end"] > dur + 0.05):
        errs.append(f"tiempos fuera del WAV: {words[0]['start']}..{words[-1]['end']} s, WAV {dur:.3f} s")
    return errs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--story", required=True, type=Path)
    ap.add_argument("--wav", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--model", default="medium")
    a = ap.parse_args()
    story = load_json(a.story)
    segs_meta = load_json(Path(str(a.wav) + ".segments.json"))["segments"]
    segs = segments(story)
    if len(segs) != len(segs_meta):
        raise PipelineError("el WAV no corresponde a este story.json (número de frases distinto): regenera la voz")
    spans = [(m["start"], m["end"]) for m in segs_meta]
    script = [{"w": w, "beat": s.beat, "seg": k} for k, s in enumerate(segs) for w in words_of(s.text)]
    heard = transcribe(a.wav, story["meta"]["lang"], a.model)
    words = align(script, heard, spans)
    with wave.open(str(a.wav), "rb") as w:
        dur = w.getnframes() / w.getframerate()
    errs = validate(words, dur)
    if errs:
        raise PipelineError("words.json no válido:\n- " + "\n- ".join(errs[:20]))
    matched = sum(1 for x in script if norm(x["w"]) in {norm(h["w"]) for h in heard})
    write_json(a.out, words)
    print(f"[align] {len(words)} palabras ({matched} reconocidas por Whisper), {words[-1]['end']:.2f} s de {dur:.2f} s -> {a.out}")


if __name__ == "__main__":
    run_main(main)
