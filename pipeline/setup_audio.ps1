# Instala lo necesario para el audio del explainer (plan F5): venv, Kokoro, Piper y faster-whisper, y comprueba
# espeak-ng y ffmpeg. Si falta algo, dice qué y dónde conseguirlo, sin trazas de Python.
#   powershell -ExecutionPolicy Bypass -File pipeline\setup_audio.ps1
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$venv = Join-Path $root ".venv"
$py = Join-Path $venv "Scripts\python.exe"

function Fail($msg) { Write-Host "FALTA: $msg" -ForegroundColor Red; exit 1 }
function Ok($msg) { Write-Host "OK   $msg" -ForegroundColor Green }

# 1. Python 3.11 y el venv
if (-not (Test-Path $py)) {
  if (-not (Get-Command py -ErrorAction SilentlyContinue)) { Fail "Python 3.11. Instálalo con: winget install Python.Python.3.11" }
  & py -3.11 -m venv $venv
  if (-not (Test-Path $py)) { Fail "no se pudo crear el venv en $venv (¿está instalado Python 3.11? winget install Python.Python.3.11)" }
}
Ok "venv: $venv"

# 2. dependencias (requirements.txt incluye las de audio)
& $py -m pip install --disable-pip-version-check -q -r (Join-Path $root "requirements.txt")
if ($LASTEXITCODE -ne 0) { Fail "pip install -r requirements.txt falló (revisa la conexión a internet)" }
Ok "paquetes de Python (kokoro, piper-tts, faster-whisper, soundfile, numpy, scipy)"

# 2b. PyTorch necesita el Visual C++ Redistributable actual (vcruntime140_1.dll)
& $py -c "import torch" 2>$null
if ($LASTEXITCODE -ne 0) { Fail "Visual C++ Redistributable actual (PyTorch no carga). Instálalo con: winget install --id Microsoft.VCRedist.2015+.x64 -e" }
Ok "PyTorch carga"

# 3. ffmpeg (mezcla y verificación de loudness)
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) { Fail "ffmpeg. Instálalo con: winget install Gyan.FFmpeg  (y abre una terminal nueva)" }
Ok "ffmpeg"

# 4. espeak-ng: Kokoro lo usa para el español. El paquete espeakng-loader trae su propia copia; si no carga, hace
#    falta el instalador oficial.
$probe = @'
import sys
try:
    import espeakng_loader, phonemizer  # noqa
    from phonemizer.backend.espeak.wrapper import EspeakWrapper
    EspeakWrapper.set_library(espeakng_loader.get_library_path())
    EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
    from phonemizer import phonemize
    print(phonemize("hola", language="es", backend="espeak"))
except Exception as e:
    print("ERR", e); sys.exit(1)
'@
$out = $probe | & $py - 2>&1
if ($LASTEXITCODE -ne 0) {
  Fail "espeak-ng ($out). Descárgalo de https://github.com/espeak-ng/espeak-ng/releases (espeak-ng.msi) o: winget install eSpeak-NG.eSpeak-NG"
}
Ok "espeak-ng (español): $out"

# 5. prueba corta de Kokoro (descarga el modelo la primera vez, ~330 MB)
$k = @'
from kokoro import KPipeline
p = KPipeline(lang_code="e", repo_id="hexgrad/Kokoro-82M")
n = sum(len(a) for _, _, a in p("Hola.", voice="em_alex"))
print(n)
'@
$out = $k | & $py - 2>&1 | Select-Object -Last 1
if ($LASTEXITCODE -ne 0) { Fail "Kokoro no arranca: $out" }
Ok "Kokoro sintetiza ($out muestras)"
Write-Host "Listo. Prueba: $py pipeline\voice.py --story templates\examples\hielo-flota\05_story.json --out out\hielo-flota"
