# Explainer short (skill de Claude Code)

Skill de Claude Code que hace **shorts verticales explicativos de 55–62 s** (1080x1920) en **español o inglés** con un
solo prompt:
- escenas 3D estilizadas con un objeto protagonista;
- subtítulos palabra por palabra con caja de selección;
- overlays de datos con su fuente;
- voz local gratuita (Chatterbox, con Kokoro como respaldo rápido) y efectos de sonido sintetizados.

Todo se renderiza con three.js dentro de Remotion en tu PC. No usa ningún generador de video por IA ni claves de API.

Claude hace la parte creativa: investigación con fuentes, guion, plan visual y revisión. `pipeline/make_short.py`
hace el resto (voz, alineación por palabra, validaciones, render, mezcla a −14 LUFS y QA de estilo).

## Qué hay dentro

| Ruta | Qué es |
|---|---|
| `SKILL.md` | El skill `explainer-short`: pipeline, reglas y errores conocidos |
| `studio/` | Proyecto Remotion: composición `Explainer`, 17 entornos, 126 objetos protagonistas, 51 overlays, 16 cámaras, subtítulos |
| `pipeline/` | Orquestador y etapas en Python (TTS, alineación, SFX, mezcla, validadores, QA) |
| `templates/` | Prompts (guion es/en, story, verificador), catálogo cerrado y ejemplos completos |
| `tools/` | Medición de referencias y QA de estilo (`style_check.py`, hojas lado a lado), `catalog_search.py` (buscar objetos por tema) y `gallery.py` (probar objetos) |
| `docs/` | Plan, decisiones (D1–D64), progreso y notas del look-match |
| `legacy/` | El skill anterior (`cartoon-3d-short`, el video del puente) y sus referencias |

## Instalación

### 1. Programas

**Windows** (PowerShell como administrador):

```powershell
winget install --id Git.Git -e
winget install --id Python.Python.3.11 -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Gyan.FFmpeg -e
winget install --id Microsoft.VCRedist.2015+.x64 -e   # sin él, PyTorch (Kokoro) no carga
winget install --id UB-Mannheim.TesseractOCR -e       # OCR de subtítulos en el QA (añade el idioma Spanish)
git config --global core.longpaths true
```

**Linux** (Arch/CachyOS; en Debian/Ubuntu, los equivalentes con `apt`):

```bash
sudo pacman -S git ffmpeg espeak-ng nodejs-lts-krypton npm tesseract tesseract-data-spa tesseract-data-eng uv
```

### 2. Código y entorno

```bash
git clone https://github.com/DiegoFernandoChavarroCastillo/claude-animated-shorts
cd claude-animated-shorts
```

Python (3.11) y dependencias:

- **Windows:** `powershell -ExecutionPolicy Bypass -File pipeline\setup_audio.ps1`. Crea `.venv`, instala
  `requirements.txt` y comprueba PyTorch, ffmpeg, espeak-ng y Kokoro.
- **Linux** (PyTorch en versión CPU; con GPU NVIDIA usa el índice CUDA):

  ```bash
  uv python install 3.11 && uv venv --python 3.11 .venv
  uv pip install --python .venv/bin/python torch==2.15.0 --index-url https://download.pytorch.org/whl/cpu
  uv pip install --python .venv/bin/python -r requirements.txt \
      --extra-index-url https://download.pytorch.org/whl/cpu --index-strategy unsafe-best-match
  ```

Remotion: `cd studio && npm ci && npx tsc --noEmit` (debe salir sin errores).

Voz (Chatterbox, el motor por defecto): `.venv/bin/python pipeline/setup_chatterbox.py` (Windows:
`.venv\Scripts\python.exe pipeline\setup_chatterbox.py`; con GPU NVIDIA añade `--cuda`). Crea su propio entorno
`.venv-chatterbox` y descarga ~6 GB de modelos. En CPU genera la voz de un video en ~13 min. Sin él, pon
`"engine": "kokoro"` en el story para usar el motor rápido.

La primera ejecución descarga Kokoro (~330 MB) y Whisper medium (~1,5 GB).

### Tu voz (recomendado para español)

Chatterbox imita la voz de una muestra. La que trae el modelo es de una persona que habla inglés, y en español suena
con acento extranjero. Graba 15–25 s con el celular, en un cuarto sin eco y con el tono de narrador que quieras.
Guárdala como `voices_local/<nombre>.wav` (o `.m4a` y conviértela con
`ffmpeg -i voz.m4a -ac 1 -ar 24000 voices_local/<nombre>.wav`) y pon `"voice": "<nombre>"` en el story.
`voices_local/` no se sube a Git.

### 3. Instalar el skill en Claude Code

Claude Code busca los skills en `~/.claude/skills/<nombre>/SKILL.md`. Enlaza la carpeta del repo para no duplicarla:

```bash
# Linux / macOS
ln -s "$(pwd)" ~/.claude/skills/explainer-short
```

```powershell
# Windows (cmd o PowerShell; un "junction" no necesita permisos de administrador)
cmd /c mklink /J "%USERPROFILE%\.claude\skills\explainer-short" "%CD%"
```

También puedes clonar el repo directamente en esa carpeta.

### 4. Referencias para el QA visual (opcional)

El look-match compara tus frames con videos de referencia que **no van en Git** (son de otras cuentas, solo para
estudio). Ponlos en `references_local/videos/` (`video4.mp4` = R3, `video5.mp4` = R1). Sin ellos, el video se hace
igual, pero no hay hojas lado a lado.

### 5. Prueba de humo

```bash
.venv/bin/python pipeline/tests/test_validate_script.py
.venv/bin/python pipeline/tests/test_prosody.py
.venv/bin/python pipeline/make_short.py init --id hielo-flota --from templates/examples/hielo-flota
.venv/bin/python pipeline/make_short.py all --id hielo-flota --scale 0.5
```

(En Windows, `.venv\Scripts\python.exe` y rutas con `\`.) Deja `out/hielo-flota/09_final.mp4` y `10_qa.md` con todo ✅.

## Uso

En Claude Code, desde cualquier carpeta:

> Usa el skill explainer-short: video sobre por qué el hielo flota, en español.

> Use the explainer skill: a short about why the sky is blue, in English.

Claude investiga el tema, escribe el guion, lo valida, hace el plan visual, lanza el pipeline, revisa el resultado con
un agente verificador y te entrega `out/<id>/09_final.mp4` con el informe de QA y las fuentes. Si quieres aprobar el
guion antes del render, añade "para tras el guion" (o `--review`).

## Notas

- **Temporales de Remotion:** cada bundle copia `public/`. Por defecto van a `C:/remotion-tmp` (Windows) o
  `~/remotion-tmp` (Linux/macOS); se cambia con `REMOTION_TMP`.
- **Voces:** Chatterbox es MIT y marca cada audio con una marca de agua inaudible (Perth); Kokoro es Apache-2.0.
  Revisa la licencia de cualquier otra voz antes de monetizar.
- **Remotion:** gratis para personas y equipos de hasta 3 personas, incluso para uso comercial. A partir de 4 personas
  necesita licencia de empresa.
- **Contenido:** la historia, los datos y la voz son siempre propios. Las referencias sirven para el lenguaje visual,
  no para el contenido.

## Licencia

El código y la documentación son MIT (ver `LICENSE`). Los frames de `legacy/references/` se incluyen solo para estudio
de estilo.
