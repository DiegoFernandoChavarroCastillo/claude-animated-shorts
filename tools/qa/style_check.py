"""QA de estilo (plan F8): compara un video con los rangos medidos en las referencias y comprueba los subtítulos por OCR.

  python tools/qa/style_check.py <video.mp4> [--words 04_words.json] [--lang es] [--md informe.md]
  python tools/qa/style_check.py --refs                    calibración: R1, R3 y R4 cuentan, R5 es informativa (D57)

Métricas (§F8): luz y color, racha estática (tools/medicion/measure.py), cortes duros por minuto y % de frames
únicos (ffmpeg), loudness (ebur128), % de silencio (tools/medicion/audio.py) y palabras/s. Las palabras salen de
--words; en las referencias, de una transcripción con Whisper medium guardada en references_local/medidas/.

Con --words, además, saca de --frames-from (por defecto el mismo video) un frame por bloque de subtítulo y busca por
OCR (Tesseract spa/eng) la última palabra del bloque y su posición dentro de la banda reservada.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import subprocess
import sys
import tempfile
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REFS = ROOT / "references_local" / "videos"
MEDIDAS = ROOT / "references_local" / "medidas"

# (nombre, clave, rango). Rangos del plan F8, calibrados con las referencias (D57)
METRICS = [
    ("Luma p5", "luma_p5", (0.05, 0.19)),
    ("Luma mediana", "luma_med", (0.14, 0.38)),
    ("Saturación mediana", "sat_med", (0.40, 0.62)),
    ("Cortes duros por minuto", "cuts_per_min", (0, 3.5)),       # D57: R4 tiene 3 cortes reales en 58,6 s
    ("Racha estática más larga (frames)", "longest_static_run_frames", (0, 100)),
    ("% de frames únicos", "pct_unique", (85, 100)),
    ("Loudness (LUFS)", "lufs", (-14.5, -13.5)),
    ("% de silencio", "pct_quiet", (22, 32)),
    ("Palabras/s", "words_per_s", (2.5, 3.0)),               # D57: Whisper da 2,57 en R3
]
# referencias de la calibración (D1, D57): las que cuentan y la informativa
REF_SET = [("R1", "video5", True), ("R3", "video4", True), ("R4", "video2", True), ("R5", "video1", False)]
PASS_RATE = 0.8


def apply_pacing(pacing: str | None) -> dict | None:
    """perfil `viral` (templates/pacing_viral.json): subtítulos de 1–3 palabras en la franja baja-central; fija las constantes del OCR"""
    global BAND, OCR_ROWS, MIN_WORDS, MAX_WORDS
    if pacing != "viral":
        return None
    prof = json.loads((ROOT / "templates" / "pacing_viral.json").read_text(encoding="utf-8"))
    BAND = tuple(prof["qa"]["captionBand"])
    OCR_ROWS = (BAND[0] - 0.06, BAND[1] + 0.06)
    MIN_WORDS, MAX_WORDS = prof["captions"]["minWords"], prof["captions"]["maxWords"]
    return prof


def metrics_for(engine: str = "3d", prof: dict | None = None) -> list:
    """rangos de las métricas: los del 3D vienen de las referencias; los del 2D, de templates/qa2d_ranges.json (calibración propia, plan story-2d F6)"""
    if engine != "2d":
        return METRICS
    ov = json.loads((ROOT / "templates" / "qa2d_ranges.json").read_text(encoding="utf-8"))["ranges"]
    if prof:   # perfil viral: casi sin pausas y locución más rápida
        ov = {**ov, "pct_quiet": prof["qa"]["pct_quiet"], "words_per_s": prof["qa"]["words_per_s"]}
    return [(n, k, tuple(ov.get(k, rng))) for n, k, rng in METRICS]

# reglas de corte de bloques de studio/src/explainer/captions/chunker.ts y CAPTION en style.ts (sin el corte por ancho)
SENTENCE_END = re.compile(r"[.?!…][\"»”)]*$")
SOFT_END = re.compile(r"[,;:][\"»”)]*$")
MIN_WORDS, MAX_WORDS, BREAK_PAUSE_S = 3, 6, 0.35
BAND = (0.12, 0.30)
OCR_ROWS = (0.08, 0.36)   # franja que se pasa al OCR: la banda con margen, para ver si algo se sale
TESS_LANG = {"es": "spa", "en": "eng"}


def run(*a: str) -> subprocess.CompletedProcess:
    return subprocess.run(a, capture_output=True, text=True, encoding="utf-8", errors="replace")


def probe(video: Path) -> dict:
    r = json.loads(run("ffprobe", "-v", "error", "-show_entries", "stream=codec_type,r_frame_rate,nb_frames:format=duration",
                       "-of", "json", str(video)).stdout)
    v = next(s for s in r["streams"] if s["codec_type"] == "video")
    num, den = v["r_frame_rate"].split("/")
    return {"dur": float(r["format"]["duration"]), "fps": float(num) / float(den),
            "audio": any(s["codec_type"] == "audio" for s in r["streams"])}


def tool_json(script: str, video: Path) -> dict:
    r = run(sys.executable, str(ROOT / "tools/medicion" / script), str(video))
    if r.returncode != 0:
        raise RuntimeError(f"{script} falló: {r.stderr.strip()[-300:]}")
    return json.loads(r.stdout.strip().splitlines()[-1])


def cuts(video: Path) -> int:
    e = run("ffmpeg", "-hide_banner", "-i", str(video), "-vf", "select='gt(scene,0.4)',showinfo", "-an", "-f", "null", "-").stderr
    return len(re.findall(r"pts_time:", e))


def unique_frames(video: Path) -> int:
    e = run("ffmpeg", "-hide_banner", "-i", str(video), "-vf", "mpdecimate", "-an", "-f", "null", "-").stderr
    n = re.findall(r"frame=\s*(\d+)", e)
    return int(n[-1]) if n else 0


def lufs(video: Path) -> float | None:
    e = run("ffmpeg", "-hide_banner", "-nostats", "-i", str(video), "-af", "ebur128", "-vn", "-f", "null", "-").stderr
    m = re.search(r"I:\s+(-?[\d.]+) LUFS", e[e.rfind("Summary:"):])
    return float(m.group(1)) if m else None


def whisper_words(video: Path) -> list[dict]:
    """Transcribe una referencia (una vez; se guarda en references_local/medidas/)."""
    cache = MEDIDAS / f"{video.stem}.words.json"
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    from faster_whisper import WhisperModel
    m = WhisperModel("medium", device="cpu", compute_type="int8")
    segs, _ = m.transcribe(str(video), word_timestamps=True, beam_size=5)
    words = [{"w": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)} for s in segs for w in s.words]
    MEDIDAS.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(words, ensure_ascii=False, indent=1), encoding="utf-8")
    return words


def measure(video: Path, words: list[dict] | None) -> dict:
    """Todas las métricas de METRICS (None si no se pueden medir, p. ej. sin audio)."""
    p = probe(video)
    m = tool_json("measure.py", video)
    out = {k: m[k] for k in ("luma_p5", "luma_med", "sat_med", "longest_static_run_frames", "frames")}
    out["cuts_per_min"] = round(cuts(video) / (p["dur"] / 60), 2)
    out["pct_unique"] = round(unique_frames(video) / m["frames"] * 100, 1)
    out["lufs"] = lufs(video) if p["audio"] else None
    out["pct_quiet"] = tool_json("audio.py", video)["pct_time_quiet"] if p["audio"] else None
    out["words_per_s"] = round(len(words) / p["dur"], 2) if words else None
    return out


def grade(m: dict, metrics: list | None = None) -> list[tuple[str, str, object, tuple, bool | None]]:
    rows = []
    for name, k, rng in (metrics or METRICS):
        v = m.get(k)
        rows.append((name, k, v, rng, None if v is None else rng[0] <= v <= rng[1]))
    return rows


# ---------------- subtítulos por OCR ----------------

def caption_blocks(words: list[dict]) -> list[list[int]]:
    groups, cur = [], []
    for i, w in enumerate(words):
        if cur and w["beat"] != words[cur[0]]["beat"]:
            groups.append(cur); cur = []
        cur.append(i)
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = nxt["start"] - w["end"] if nxt else float("inf")
        hard = bool(SENTENCE_END.search(w["w"])) or not nxt or nxt["beat"] != w["beat"]
        soft = len(cur) >= MIN_WORDS and (bool(SOFT_END.search(w["w"])) or gap > BREAK_PAUSE_S)
        if hard or soft or len(cur) >= MAX_WORDS:
            groups.append(cur); cur = []
    if cur:
        groups.append(cur)
    return groups


SHORT_WORD = 3   # F16: palabras de ≤3 letras no se comprueban con OCR (falsos negativos en reloj-pulso)


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if c.isalnum() and not unicodedata.combining(c))


def caption_ocr(video: Path, words: list[dict], lang: str) -> dict:
    import numpy as np
    import pytesseract
    from PIL import Image

    fps = probe(video)["fps"]
    blocks = caption_blocks(words)
    # frame a mitad de la última palabra: el bloque está completo y esa palabra es la activa (blanco 700)
    frames = [round((words[b[-1]]["start"] + words[b[-1]]["end"]) / 2 * fps) for b in blocks]
    res = []
    with tempfile.TemporaryDirectory() as td:
        sel = "+".join(f"eq(n\\,{f})" for f in frames)
        run("ffmpeg", "-v", "error", "-i", str(video), "-vf", f"select='{sel}'", "-fps_mode", "passthrough", f"{td}/%04d.png")
        for k, (b, f) in enumerate(zip(blocks, frames)):
            png = Path(td) / f"{k + 1:04d}.png"
            if len(norm(words[b[-1]]["w"])) <= SHORT_WORD:   # F16: «de», «al», «y»… el OCR las pierde aunque se vean; no cuentan
                continue
            if not png.exists():
                res.append({"frame": f, "expect": words[b[-1]]["w"], "found": False, "band": False, "ocr": "(sin frame)"}); continue
            im = np.asarray(Image.open(png).convert("RGB")).astype(np.int16)
            h, wd = im.shape[:2]
            # solo la franja de los subtítulos, y solo casi blanco: la última palabra es la activa (#FFFFFF, 700).
            # Con "claro y poco saturado" entraban bordes de ventanillas y nubes en escenas claras (D58)
            y0 = int(h * OCR_ROWS[0])
            top = im[y0: int(h * OCR_ROWS[1])]
            mx, mn = top.max(-1), top.min(-1)
            white = (mn > 190) & (mx - mn < 40)
            yellow = (top[..., 0] > 200) & (top[..., 1] > 170) & (top[..., 2] < 150)   # palabra clave resaltada del perfil viral
            ink = white | yellow
            img = Image.fromarray(np.where(ink, 0, 255).astype(np.uint8))
            k2 = max(1, round(1080 / wd))
            img = img.resize((wd * k2, top.shape[0] * k2), Image.LANCZOS)
            d = pytesseract.image_to_data(img, lang=TESS_LANG.get(lang, "spa"), config="--psm 6", output_type=pytesseract.Output.DICT)
            toks = [(norm(t), (y0 + (d["top"][i] + d["height"][i] / 2) / k2) / h) for i, t in enumerate(d["text"]) if norm(t)]
            target = norm(words[b[-1]]["w"])
            best = max(toks, key=lambda t: difflib.SequenceMatcher(None, t[0], target).ratio(), default=None)
            found = best is not None and difflib.SequenceMatcher(None, best[0], target).ratio() >= 0.75
            res.append({"frame": f, "expect": words[b[-1]]["w"], "found": found,
                        "band": found and BAND[0] <= best[1] <= BAND[1], "y": round(best[1], 3) if best else None,
                        "ocr": " ".join(t[0] for t in toks)[:60]})
    n = len(res)
    return {"blocks": n, "found_pct": round(sum(r["found"] for r in res) / n * 100, 1) if n else 0,
            "band_pct": round(sum(r["band"] for r in res) / max(1, sum(r["found"] for r in res)) * 100, 1), "items": res}


# ---------------- informes ----------------

def fmt(v) -> str:
    return "n/d" if v is None else str(v)


def table(rows) -> list[str]:
    md = ["| métrica | valor | objetivo | |", "|---|---|---|---|"]
    for name, _, v, rng, ok in rows:
        md.append(f"| {name} | {fmt(v)} | {rng[0]}–{rng[1]} | {'—' if ok is None else '✅' if ok else '❌'} |")
    return md


def caption_md(c: dict) -> list[str]:
    md = [f"**Subtítulos (OCR)**: última palabra encontrada en {c['found_pct']} % de {c['blocks']} bloques (objetivo ≥90 %); "
          f"dentro de la banda {BAND[0]:.0%}–{BAND[1]:.0%} en {c['band_pct']} % de las encontradas (objetivo 100 %).", ""]
    bad = [r for r in c["items"] if not (r["found"] and r["band"])]
    if bad:
        md += ["| frame | palabra esperada | OCR | y |", "|---|---|---|---|"]
        md += [f"| {r['frame']} | {r['expect']} | {r['ocr'] or '(nada)'} | {fmt(r.get('y'))} |" for r in bad]
        md.append("")
    return md


def caption_ok(c: dict) -> bool:
    return c["found_pct"] >= 90 and c["band_pct"] >= 100


def check(video: Path, words_path: Path | None, lang: str, frames_from: Path | None = None, engine: str = "3d",
          pacing: str | None = None) -> tuple[bool, list[str], dict]:
    words = json.loads(words_path.read_text(encoding="utf-8")) if words_path else None
    prof = apply_pacing(pacing)
    m = measure(video, words)
    rows = grade(m, metrics_for(engine, prof))
    rated = [r for r in rows if r[4] is not None]
    passed = sum(r[4] for r in rated)
    md = [f"**Estilo**: {passed}/{len(rated)} métricas en rango ({passed / max(1, len(rated)):.0%}; objetivo ≥{PASS_RATE:.0%}).", "",
          *table(rows), ""]
    ok = passed / max(1, len(rated)) >= PASS_RATE
    if words:
        c = caption_ocr(frames_from or video, words, lang)
        md += caption_md(c)
        ok &= caption_ok(c)
        m["captions"] = {k: c[k] for k in ("blocks", "found_pct", "band_pct")}
    return ok, md, m


def refs() -> int:
    md = ["# Calibración de style_check con las referencias", ""]
    allm, ok_all = {}, True
    for rid, name, counts in REF_SET:
        v = REFS / f"{name}.mp4"
        if not v.exists():
            print(f"FALTA {v}"); return 1
        print(f"{rid} ({name}) …", flush=True)
        m = measure(v, whisper_words(v))
        rows = grade(m)
        rated = [r for r in rows if r[4] is not None]
        passed = sum(r[4] for r in rated)
        ok = passed / len(rated) >= PASS_RATE
        ok_all &= ok or not counts
        allm[rid] = m
        md += [f"## {rid} · `{name}`{'' if counts else ' (informativa)'}: {passed}/{len(rated)} "
               f"({passed / len(rated):.0%}) {'✅' if ok else '❌'}", "", *table(rows), ""]
    MEDIDAS.mkdir(parents=True, exist_ok=True)
    (MEDIDAS / "style_refs.json").write_text(json.dumps(allm, ensure_ascii=False, indent=1), encoding="utf-8")
    md.insert(2, f"Resultado: **{'cumple' if ok_all else 'no cumple'}** (R1, R3 y R4 con ≥{PASS_RATE:.0%} de métricas en rango).\n")
    (MEDIDAS / "style_refs.md").write_text("\n".join(md), encoding="utf-8")
    print("\n".join(md))
    return 0 if ok_all else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", nargs="?", type=Path)
    ap.add_argument("--refs", action="store_true")
    ap.add_argument("--words", type=Path)
    ap.add_argument("--lang", default="es")
    ap.add_argument("--frames-from", type=Path, help="video del que sacar los frames del OCR (p. ej. 07_video.mp4)")
    ap.add_argument("--md", type=Path)
    a = ap.parse_args()
    if a.refs:
        return refs()
    if not a.video:
        ap.error("falta el video (o --refs)")
    ok, md, _ = check(a.video, a.words, a.lang, a.frames_from)
    text = "\n".join(["# QA de estilo", "", *md])
    if a.md:
        a.md.write_text(text, encoding="utf-8")
    print(text)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
