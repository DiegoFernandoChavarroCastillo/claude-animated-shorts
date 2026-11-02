"""Comprobaciones geométricas de subtítulos sobre stills (criterios de F1).

  python tools/qa/caption_check.py layout <still.jpg> [...]        centro de la 1.ª línea (% alto), n.º de líneas, ancho máx (% ancho)
  python tools/qa/caption_check.py appear <antes.jpg> <despues.jpg>  píxeles de texto nuevos entre dos frames

Texto = píxeles claros y poco saturados (blanco #FFFFFF o gris #8E929B) en el 45 % superior del frame.
La caja azul de la palabra clave queda fuera por saturación.
"""
import sys
import numpy as np
from scipy.ndimage import binary_dilation
from PIL import Image


def text_mask(path):
    im = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    h = im.shape[0]
    top = im[: int(h * 0.45)]
    mx, mn = top.max(-1), top.min(-1)
    text = (mx > 110) & (mx - mn < 45)
    # los aros blancos de los tiradores tocan el relleno azul; el texto queda a >= 9 px del borde de la caja
    blue = (top[..., 2] > 150) & (top[..., 2] - top[..., 0] > 80)
    return text & ~binary_dilation(blue, iterations=4), im.shape[1], h


def lines_of(mask, min_gap):
    rows = np.flatnonzero(mask.sum(1) > 2)
    if not len(rows):
        return []
    out, a = [], rows[0]
    for p, q in zip(rows, rows[1:]):
        if q - p > min_gap:
            out.append((a, p)); a = q
    out.append((a, rows[-1]))
    return out


def layout(path):
    m, w, h = text_mask(path)
    ls = lines_of(m, min_gap=max(3, int(h * 0.004)))
    if not ls:
        return dict(file=path, lines=0)
    a, b = ls[0]
    cols = np.flatnonzero(m.sum(0) > 0)
    return dict(file=path.split("/")[-1].split("\\")[-1], lines=len(ls), first_center_pct=round((a + b) / 2 / h * 100, 2),
                max_width_pct=round((cols[-1] - cols[0] + 1) / w * 100, 1))


if __name__ == "__main__":
    mode, *files = sys.argv[1:]
    if mode == "layout":
        for f in files:
            print(layout(f))
    elif mode == "appear":
        a, _, _ = text_mask(files[0]); b, _, _ = text_mask(files[1])
        print(dict(before=int(a.sum()), after=int(b.sum()), new=int((b & ~a).sum())))
