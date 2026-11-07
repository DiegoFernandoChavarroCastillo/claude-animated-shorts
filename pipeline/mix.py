"""Etapa 8: voz + SFX -> 08_mix.wav (plan §7.6). Sin música.

    python pipeline\\mix.py --voice <03_voice.wav> --plan <08_sfx_plan.json> --out <08_mix.wav>

- La voz pasa antes por voice_fx.treat (ecualización, compresión ligera y sala, D62).
- La mezcla dura exactamente lo que el video (duration_s del plan de SFX): la voz se rellena con silencio.
- Cada SFX se nivela a (loudness de la voz − 10 dB + ajuste por tipo): entre 8 y 12 dB por debajo de la voz.
- Master a −14 LUFS integrados con el limitador del repo original (4x sobremuestreo, look-ahead) a −1,2 dBTP, para
  quedar en true peak ≤ −1 dBTP. Comprueba el resultado con ffmpeg ebur128 y lo guarda en <out>.report.json.
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import ndimage, signal

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import PipelineError, load_json, run_main, write_json  # noqa: E402
from dsp import SR, dbg, integrated, momentary_max, ns, read_wav, true_peak, write_wav  # noqa: E402
from sfx_synth import REL_DB, SFX  # noqa: E402
from voice_fx import treat  # noqa: E402

TARGET_LUFS = -14.0
CEIL_DBTP = -1.2
SFX_BELOW_VOICE_DB = 10.0
BED_BELOW_VOICE_DB = 24.0   # F18: la cama (opcional) va 24 dB por debajo de la voz y se agacha 6 dB más mientras habla


def limiter(x, ceil_db=CEIL_DBTP, look=0.003, rel=0.08):
    """portado de templates/audio/mix.py: pico sobremuestreado x4, mínimo con look-ahead, release de un polo"""
    c = dbg(ceil_db)
    n = x.shape[1]
    up = np.abs(signal.resample_poly(x, 4, 1, axis=-1)).max(0)
    pk = np.pad(up, (0, max(0, 4 * n - len(up))))[: 4 * n].reshape(n, 4).max(1)
    gr = np.minimum(1.0, c / np.maximum(pk, 1e-12))
    La = max(1, ns(look))
    g1 = ndimage.minimum_filter1d(gr, 2 * La + 1, mode="nearest")
    g2 = g1.copy()
    idx = np.flatnonzero(g1 < 1.0)
    if len(idx):
        kr = 1 - np.exp(-1 / (rel * SR))
        gap = ns(rel * 8)
        brk = np.flatnonzero(np.diff(idx) > gap)
        for a, b_ in zip(np.concatenate([[idx[0]], idx[brk + 1]]), np.concatenate([idx[brk], [idx[-1]]])):
            e = min(n, b_ + gap)
            seg, out, g = g1[a:e], np.empty(e - a), 1.0
            for k in range(len(seg)):
                g = min(seg[k], g + (1 - g) * kr)
                out[k] = g
            g2[a:e] = out
    g3 = np.minimum(ndimage.uniform_filter1d(g2, 2 * La + 1, mode="nearest"), 1.0)
    return x * g3[None, :], g3


def lufs(x):
    v = integrated(x)
    return v if np.isfinite(v) else -99.0


def ebur128(path: Path) -> dict:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, timeout=600)
    txt = r.stderr[r.stderr.rfind("Summary:"):]
    I = re.search(r"I:\s+(-?[\d.]+) LUFS", txt)
    P = re.search(r"Peak:\s+(-?[\d.]+) dBFS", txt)
    return {"I_lufs": float(I.group(1)) if I else None, "true_peak_dbtp": float(P.group(1)) if P else None}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True, type=Path)
    ap.add_argument("--plan", required=True, type=Path)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--music", choices=["tech", "calm", "warm", "tense"], default=None, help="añade la cama sonora sintetizada (bed_synth.py)")
    a = ap.parse_args()
    if not a.voice.exists():
        raise PipelineError(f"falta la voz: {a.voice}")
    plan = load_json(a.plan)
    v, sr = read_wav(str(a.voice))
    if sr != SR:
        raise PipelineError(f"la voz debe estar a {SR} Hz (está a {sr})")
    v = np.atleast_2d(v)
    v = treat(v.mean(0))[None, :]                     # tratamiento de voz (voice_fx.py, D62)
    v = np.vstack([v, v])
    n = ns(plan["duration_s"])
    if v.shape[1] > n:
        raise PipelineError(f"la voz ({v.shape[1] / SR:.2f} s) es más larga que el video ({plan['duration_s']} s)")
    voice = np.zeros((2, n))
    voice[:, : v.shape[1]] = v
    v_lufs = lufs(voice)
    sfx = np.zeros((2, n))
    cache = {}
    for e in plan["events"]:
        typ = e["type"]
        if typ not in SFX:
            raise PipelineError(f"sfx desconocido: {typ}")
        if typ not in cache:
            x = SFX[typ]()
            x = x * dbg(v_lufs - SFX_BELOW_VOICE_DB + REL_DB[typ] - momentary_max(x))
            # los sonidos muy cortos (tick, pop) miden poco en ventanas de 400 ms y saldrían con picos enormes:
            # ningún SFX supera el pico de la voz − 6 dB
            cap = np.abs(voice).max() * dbg(-6)
            cache[typ] = x * min(1.0, cap / max(np.abs(x).max(), 1e-9))
        x = cache[typ]
        i = ns(e["t"])
        j = min(n, i + len(x))
        if j > i:
            sfx[:, i:j] += x[: j - i]
    s_lufs = lufs(sfx)
    bed_lufs = None
    if a.music:
        from bed_synth import bed, duck_curve
        b = bed(plan["duration_s"], a.music)
        b = b * duck_curve(voice[0]) * dbg(v_lufs - BED_BELOW_VOICE_DB - lufs(np.vstack([b, b])))
        sfx = sfx + np.vstack([b, b])[:, :n]
        bed_lufs = lufs(np.vstack([b, b]))
        s_lufs = lufs(sfx)
    mix0 = voice + sfx
    G = TARGET_LUFS - lufs(mix0)
    for _ in range(6):
        y, g3 = limiter(mix0 * dbg(G))
        L = lufs(y)
        if abs(L - TARGET_LUFS) < 0.02:
            break
        G += TARGET_LUFS - L
    a.out.parent.mkdir(parents=True, exist_ok=True)
    write_wav(str(a.out), y)
    rep = {"voice_lufs_pre": round(v_lufs, 2), "sfx_lufs_pre": round(s_lufs, 2), "master_gain_db": round(G, 2),
           "max_gain_reduction_db": round(float(-20 * np.log10(g3.min())), 2),
           "own": {"I_lufs": round(lufs(y), 2), "true_peak_dbtp": round(true_peak(y), 2)},
           "bed_lufs_pre": None if bed_lufs is None else round(bed_lufs, 2), "bed_below_voice_db": None if bed_lufs is None else round(v_lufs - bed_lufs, 1),
           "ffmpeg_ebur128": ebur128(a.out), "duration_s": plan["duration_s"], "events": len(plan["events"])}
    write_json(Path(str(a.out) + ".report.json"), rep)
    f = rep["ffmpeg_ebur128"]
    ok = f["I_lufs"] is not None and abs(f["I_lufs"] - TARGET_LUFS) <= 0.5 and f["true_peak_dbtp"] <= -1.0
    print(f"[mix] voz {v_lufs:.1f} LUFS, SFX {s_lufs:.1f} LUFS ({v_lufs - s_lufs:.1f} dB bajo la voz); master "
          f"{f['I_lufs']} LUFS, TP {f['true_peak_dbtp']} dBTP -> {'CUMPLE' if ok else 'NO CUMPLE'} -> {a.out}")


if __name__ == "__main__":
    run_main(main)
