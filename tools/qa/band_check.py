"""Comprueba que ningún overlay invade la banda de subtítulos (12–30 % del alto) en stills sobre fondo liso.

  python tools/qa/band_check.py <still.jpg> [...]

Un píxel cuenta como "dibujado" si se aparta más de 24 niveles del color de fondo (la mediana de la imagen).
"""
import sys
import numpy as np
from PIL import Image

bad = 0
for path in sys.argv[1:]:
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    h = im.shape[0]
    bg = np.median(im.reshape(-1, 3), axis=0)
    band = im[int(h * 0.12): int(h * 0.30)]
    n = int((np.abs(band - bg).max(-1) > 24).sum())
    if n:
        bad += 1
    print(f"{path.split(chr(92))[-1]}: {'INVADE' if n else 'ok'} ({n} px en la banda)")
print(f"\n{len(sys.argv) - 1 - bad}/{len(sys.argv) - 1} stills sin invasión")
sys.exit(1 if bad else 0)
