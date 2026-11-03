# Herramientas de medición

Scripts usados para medir los 5 videos de referencia. Sirven para dos cosas:
1. Medir más referencias y ampliar la biblia de estilo.
2. Medir los videos que genere el pipeline y compararlos con los rangos objetivo (QA de estilo).

Requisitos: Python 3.11+, `pip install opencv-python numpy pytesseract`, ffmpeg en el PATH y,
para el OCR, Tesseract con el idioma `spa` (en Windows: instalador UB-Mannheim, marcar "Spanish").

| Script | Qué hace | Uso |
|---|---|---|
| `measure.py` | Luma (p5/mediana/p95), saturación, paleta (k-means, 8 colores, excluye la banda del subtítulo), % de frames con movimiento global de cámara, % con zoom, racha estática más larga | `python measure.py video.mp4` |
| `audio.py` | Piso de ruido, pausas >250 ms, % de tiempo en silencio (detecta si hay cama musical) | `python audio.py video.mp4` |
| `ocr_caps.py` | Lee la banda del subtítulo 6 veces por segundo con OCR (y = 165–345 en 720x1280) | `python ocr_caps.py video.mp4 salida.json` |
| `chunks.py` | Agrupa el OCR en bloques de subtítulo con tiempos aproximados | `python chunks.py salida.json` |

`medidas_referencias.json` tiene la salida de `measure.py` para los 5 videos.

`tools/qa/style_check.py` reúne todo esto en un solo informe con los rangos objetivo (F8, D57).

Métricas que se miden directamente con ffmpeg (PowerShell; en bash cambia `Select-String` por `grep`):

```powershell
# cortes duros (cuenta las líneas)
ffmpeg -i video.mp4 -vf "select='gt(scene,0.4)',showinfo" -an -f null - 2>&1 | Select-String "pts_time"
# frames únicos (el último "frame=" dividido entre el total de frames)
ffmpeg -i video.mp4 -vf mpdecimate -an -f null - 2>&1 | Select-String "frame="
# loudness integrado y pico
ffmpeg -i video.mp4 -af ebur128=peak=true -vn -f null - 2>&1 | Select-String "I:|Peak:"
```

Limitaciones conocidas:
- El flujo óptico no ve empujes de cámara muy lentos (< ~0,08 %/frame), así que "estático" puede incluir empujes lentos.
- El OCR falla sobre fondos muy brillantes; úsalo para tiempos y estructura, no como transcripción exacta.
- `measure.py` excluye el 28 % superior del frame (zona del subtítulo) para la paleta y la luz.
