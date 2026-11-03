"""Proceso de Chatterbox (D64). Corre con .venv-chatterbox (PyTorch distinto del de Kokoro), NO con el .venv principal.

    .venv-chatterbox/bin/python pipeline/tts/chatterbox_worker.py <carpeta del modelo>

Carga el modelo una vez y atiende peticiones por stdin, una por línea en JSON:
    {"text": "...", "lang": "es", "out": "/ruta/frase.wav", "cfg_weight": 0.5, "voice": null | "/ruta/muestra.wav"}
y responde por stdout una línea JSON: {"ok": "/ruta/frase.wav"} o {"error": "..."}. Lo lanza tts/chatterbox_tts.py.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path


def main() -> None:
    ckpt = Path(sys.argv[1])
    t3 = (ckpt / "t3.txt").read_text().strip()        # nombre del archivo T3 de esta carpeta (lo escribe el setup)
    import torch
    import torchaudio
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    torch.set_num_threads(max(1, torch.get_num_threads()))
    m = ChatterboxMultilingualTTS.from_local(ckpt, "cuda" if torch.cuda.is_available() else "cpu", t3_model=t3)
    print(json.dumps({"ready": True, "sr": m.sr}), flush=True)
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            r = json.loads(line)
            w = m.generate(r["text"], language_id=r["lang"], audio_prompt_path=r.get("voice") or None,
                           cfg_weight=float(r.get("cfg_weight", 0.5)))
            torchaudio.save(r["out"], w, m.sr)
            print(json.dumps({"ok": r["out"]}), flush=True)
        except Exception as e:  # noqa: BLE001 - el error vuelve al pipeline como mensaje
            print(json.dumps({"error": f"{type(e).__name__}: {e}"}), flush=True)


if __name__ == "__main__":
    main()
