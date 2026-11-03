"""Instala Chatterbox (D64) en su propio entorno y prepara sus modelos. Se ejecuta con el Python del proyecto:

    .venv/bin/python pipeline/setup_chatterbox.py          (Windows: .venv\\Scripts\\python.exe pipeline\\setup_chatterbox.py)
    ... --cuda                                            (con GPU NVIDIA: PyTorch con CUDA en vez del de CPU)

1. Crea .venv-chatterbox (Python 3.11; con uv si está instalado) e instala Chatterbox fijado a un commit probado.
2. Arma pipeline/models/chatterbox/es-latam (español latinoamericano) y mtl-v3 (multilingüe V3, para `en`). Los
   archivos que no cambian son enlaces a la caché de Hugging Face; el decodificador V3 se copia completado: le faltan
   dos tablas fijas (filtros mel y ventana) que se toman del propio código. Descarga ~6 GB la primera vez.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENV = ROOT / ".venv-chatterbox"
PY = VENV / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
PKG = "chatterbox-tts @ git+https://github.com/resemble-ai/chatterbox@5de7a54aa4e5e2baadb0182dde554908b48b85c2"
MODELS = ROOT / "pipeline/models/chatterbox"

ASSEMBLE = r'''
import os, sys, shutil, torch
from pathlib import Path
from huggingface_hub import hf_hub_download
from chatterbox.models.s3gen import S3Gen
MAIN, LATAM = "ResembleAI/chatterbox", "ResembleAI/Chatterbox-Multilingual-es-mx-latam"
COMMON = ["ve.pt", "conds.pt", "Cangjie5_TC.json", "grapheme_mtl_merged_expanded_v1.json"]
SETS = {"es-latam": (LATAM, "t3_es_mx_latam.safetensors", LATAM), "mtl-v3": (MAIN, "t3_mtl23ls_v3.safetensors", MAIN)}
base = Path(sys.argv[1])
for name, (t3_repo, t3, s3_repo) in SETS.items():
    d = base / name; d.mkdir(parents=True, exist_ok=True)
    def link(repo, f, dst):
        p = d / dst
        if p.exists(): return
        src = hf_hub_download(repo, f)
        try: os.symlink(src, p)
        except OSError: shutil.copy(src, p)            # Windows sin permiso de enlaces
    for f in COMMON: link(MAIN, f, f)
    link(t3_repo, t3, t3)
    s3 = d / "s3gen.pt"
    if not s3.exists():
        sd = torch.load(hf_hub_download(s3_repo, "s3gen_v3.pt"), map_location="cpu", weights_only=True)
        ref = S3Gen().state_dict()
        missing = [k for k in ref if k not in sd]
        assert set(missing) <= {"tokenizer._mel_filters", "tokenizer.window"}, f"faltan pesos en s3gen_v3: {missing}"
        for k in missing: sd[k] = ref[k]
        torch.save(sd, s3)
    (d / "t3.txt").write_text(t3)
    print(f"OK   modelo {name}: {d}")
'''


def run(cmd: list[str]) -> None:
    print("$", " ".join(cmd), flush=True)
    if subprocess.run(cmd).returncode != 0:
        sys.exit(f"FALTA: falló {cmd[0]} (revisa la conexión a internet y el mensaje de arriba)")


def main() -> None:
    cuda = "--cuda" in sys.argv
    index = [] if cuda else ["--extra-index-url", "https://download.pytorch.org/whl/cpu"]
    uv = shutil.which("uv")
    if not PY.exists():
        run([uv, "venv", "--python", "3.11", str(VENV)] if uv else [sys.executable, "-m", "venv", str(VENV)])
    if uv:
        run([uv, "pip", "install", "--python", str(PY), PKG, *index, "--index-strategy", "unsafe-best-match"])
    else:
        run([str(PY), "-m", "pip", "install", "-q", PKG, *index])
    print(f"OK   entorno: {VENV}")
    run([str(PY), "-W", "ignore", "-c", ASSEMBLE, str(MODELS)])
    print("Listo. Prueba: el story con \"voice\": {\"engine\": \"chatterbox\", \"voice\": \"default\"}")


if __name__ == "__main__":
    main()
