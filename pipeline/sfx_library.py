"""Efectos grabados CC0 con variantes (D130): `templates/sfx_library.json` dice qué grabaciones sirven para cada tipo de efecto del plan.
La mezcla pide `variant(tipo, k)` para el k-ésimo evento de ese tipo y recibe (audio mono a 48 kHz con pico 1, segundos desde el inicio del
audio hasta su punto de sincronía, clave de caché). Las variantes se recorren en un orden barajado distinto en cada vuelta, sin repetir la
misma dos veces seguidas, y cada uso lleva un poco de tono y nivel distinto. Sin `sfx_lib/` o sin entrada para el tipo devuelve None y la
mezcla usa el sonido sintetizado de sfx_synth.py.
"""
from __future__ import annotations

import json
import zlib
from functools import lru_cache
from pathlib import Path

import numpy as np

from common import ROOT, load_json

LIB = ROOT / "sfx_lib"
SR = 48000
PITCH, GAIN_DB = 0.04, 1.5


def _seed(*parts) -> int:
    return zlib.crc32("|".join(map(str, parts)).encode())


@lru_cache(maxsize=1)
def _cfg() -> dict:
    return load_json(ROOT / "templates" / "sfx_library.json")


@lru_cache(maxsize=1)
def _kit() -> dict:
    p = LIB / "sfx-kit" / "sounds.json"
    return {s["id"]: s for s in json.loads(p.read_text(encoding="utf-8"))["sounds"]} if p.exists() else {}


@lru_cache(maxsize=512)
def _load(path: str) -> np.ndarray:
    import soundfile as sf
    x, sr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    if sr != SR:
        n = int(round(len(x) * SR / sr))
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
    return x / max(float(np.abs(x).max()), 1e-9)


def _glob(pat: str) -> list[Path]:
    """«paquete/patrón» busca el patrón en cualquier subcarpeta del paquete (los zips de Kenney traen Audio/ u Ogg/ dentro)"""
    pack, _, rest = pat.partition("/")
    return sorted(set(LIB.glob(f"{pack}/{rest}")) | set(LIB.glob(f"{pack}/**/{rest}")))


def _peak_time(x: np.ndarray) -> float:
    """punto de sincronía de una grabación sin metadatos: donde la envolvente llega a la mitad de su máximo"""
    env = np.convolve(np.abs(x), np.ones(240) / 240, mode="same")
    return float(np.argmax(env >= 0.5 * env.max())) / SR


def _sources(entry) -> list[tuple[str, np.ndarray, float]]:
    """(clave, audio, sincronía) de una entrada del catálogo; una entrada con patrón da varias grabaciones"""
    if isinstance(entry, dict):   # secuencia: n golpes del mismo paquete (pasos)
        files = sorted(p for pat in entry["from"] for p in _glob(pat))
        if not files:
            return []
        rng = np.random.default_rng(_seed(json.dumps(entry, sort_keys=True)))
        gap, out = int(entry["gap"] * SR), []
        picks = [files[i] for i in rng.choice(len(files), entry["seq"], replace=len(files) < entry["seq"])]
        clips = [_load(str(p)) * (1.0 - 0.18 * k) for k, p in enumerate(picks)]
        buf = np.zeros(gap * (len(clips) - 1) + max(len(c) for c in clips), dtype=np.float32)
        for k, c in enumerate(clips):
            buf[k * gap: k * gap + len(c)] += c
        out.append((f"seq:{entry['from'][0]}:{entry['seq']}", buf / max(float(np.abs(buf).max()), 1e-9), _peak_time(clips[0])))
        return out
    if entry.startswith("kit:"):
        s = _kit().get(entry[4:])
        if not s:
            return []
        return [(entry, _load(str(LIB / "sfx-kit" / s["file"])), float(s.get("sync", {}).get("at", 0.0)))]
    return [(str(p.relative_to(LIB)), x, _peak_time(x)) for p in _glob(entry) for x in [_load(str(p))]]


@lru_cache(maxsize=64)
def variants(typ: str) -> tuple:
    if not LIB.exists():
        return ()
    out = []
    for e in _cfg()["types"].get(typ, []):
        out += _sources(e)
    return tuple(out)


def meets(typ: str) -> float:
    return float(_cfg().get("meets", {}).get(typ, 0.0))


def variant(typ: str, k: int, salt: str = "") -> tuple[np.ndarray, float, str] | None:
    """k-ésimo uso del tipo: orden barajado por vuelta y sin repetir la última del ciclo anterior; con tono y nivel ligeramente distintos"""
    vs = variants(typ)
    if not vs:
        return None
    n = len(vs)
    order = list(np.random.default_rng(_seed(typ, salt, k // n)).permutation(n))
    if n > 1 and k // n > 0:
        prev = list(np.random.default_rng(_seed(typ, salt, k // n - 1)).permutation(n))
        if order[0] == prev[-1]:
            order[0], order[1] = order[1], order[0]
    key, x, sync = vs[order[k % n]]
    r = np.random.default_rng(_seed(typ, salt, k, "j"))
    rate = 1.0 + r.uniform(-PITCH, PITCH)
    if abs(rate - 1.0) > 1e-3:   # tono y duración a la vez, como una cinta más rápida o más lenta
        m = int(len(x) / rate)
        x = np.interp(np.arange(m) * rate, np.arange(len(x)), x).astype(np.float32)
        sync /= rate
    return x * 10 ** (r.uniform(-GAIN_DB, GAIN_DB) / 20), sync, key
