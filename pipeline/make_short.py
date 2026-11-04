"""Orquestador del explainer (plan §7, F7): todas las etapas deterministas, con checkpoints por artefacto.

    python pipeline\\make_short.py init --id hielo-flota --from templates\\examples\\hielo-flota
    python pipeline\\make_short.py all --id hielo-flota [--scale 1] [--review] [--force tts,render | --force all]
    python pipeline\\make_short.py <etapa> --id hielo-flota      (validate-script, tts, align, validate-story, stills,
                                                                render, mix, mux, qa)

Cada etapa escribe su artefacto en out/<id>/ y SE SALTA si ya existe y está al día (más nuevo que sus entradas).
--force <etapas> la rehace aunque exista. Un render interrumpido no deja 07_video.mp4 (escribe .part.mp4 y renombra
al final), así que al relanzar se saltan las etapas anteriores y el render empieza de nuevo. --review para tras
validar el guion. Cada ejecución se apunta en out/<id>/log.md: qué etapa corrió, cuánto tardó y qué falló.

Los artefactos creativos (02_SCRIPT.md y 05_story.json) los escribe Claude, o los copia `init` desde un ejemplo.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, PipelineError, load_json, write_json  # noqa: E402

PY = sys.executable
STUDIO = ROOT / "studio"
# Fuera de Windows, en el home: /tmp suele ser tmpfs (RAM) y cada bundle copia public/
TMP = os.environ.get("REMOTION_TMP") or ("C:/remotion-tmp" if os.name == "nt" else str(Path.home() / "remotion-tmp"))
BUNDLE = f"{TMP}/bundle"
VOICE_DEFAULT = {"es": ("chatterbox", "diego"), "en": ("chatterbox", "default")}   # D64 (antes Kokoro, D46)
STAGES = ["validate-script", "tts", "align", "validate-story", "stills", "render", "mix", "mux", "qa"]


class Run:
    def __init__(self, oid: str, a):
        self.id, self.a = oid, a
        self.d = ROOT / "out" / oid
        self.d.mkdir(parents=True, exist_ok=True)
        self.log_rows: list[tuple[str, str, float, str]] = []
        f = a.force or ""
        self.force = set(STAGES) if f == "all" else {x.strip() for x in f.split(",") if x.strip()}

    # ------------------------------------------------------------ utilidades
    def p(self, name: str) -> Path:
        return self.d / name

    def fresh(self, out: Path, inputs: list[Path]) -> bool:
        """el artefacto existe y es más nuevo que todas sus entradas"""
        if not out.exists():
            return False
        t = out.stat().st_mtime
        return all((not i.exists()) or i.stat().st_mtime <= t for i in inputs)

    def sh(self, cmd: list[str], cwd: Path | None = None, tag: str = "") -> str:
        env = dict(os.environ, TEMP=TMP, TMP=TMP, REMOTION_TMP=TMP, PYTHONIOENCODING="utf-8")
        Path(TMP).mkdir(parents=True, exist_ok=True)
        proc = subprocess.Popen(cmd, cwd=cwd or ROOT, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
                                encoding="utf-8", errors="replace")
        lines = []
        for line in proc.stdout:  # type: ignore[union-attr]
            line = line.rstrip()
            lines.append(line)
            if tag and line and not line.startswith(("[Tab", "[warning]")):
                print(f"  {tag}| {line}")
        proc.wait()
        if proc.returncode != 0:
            tail = "\n".join(l for l in lines[-12:] if l.strip())
            raise PipelineError(f"{' '.join(cmd[:3])}… salió con código {proc.returncode}:\n{tail}")
        return "\n".join(lines)

    def stage(self, name: str, out: Path, inputs: list[Path], fn, always=False):
        t0 = time.time()
        if not always and name not in self.force and self.fresh(out, inputs):
            self.log_rows.append((name, "saltada (al día)", 0.0, out.name))
            print(f"[{name}] saltada: {out.name} ya existe y está al día")
            return
        missing = [i.name for i in inputs if not i.exists()]
        if missing:
            self.log_rows.append((name, "FALLÓ", 0.0, f"faltan {', '.join(missing)}"))
            raise PipelineError(f"[{name}] faltan entradas en {self.d}: {', '.join(missing)}")
        if name in self.force and out.is_file():
            # una etapa forzada borra antes su artefacto: si se interrumpe, no queda el viejo pasando por bueno
            out.unlink()
        print(f"[{name}] …")
        try:
            detail = fn() or out.name
        except Exception as e:
            self.log_rows.append((name, "FALLÓ", time.time() - t0, str(e).splitlines()[0][:160]))
            raise
        self.log_rows.append((name, "hecha", time.time() - t0, detail))
        print(f"[{name}] hecha en {time.time() - t0:.1f} s")

    def write_log(self, cmd: str, ok: bool):
        lines = [f"\n## {dt.datetime.now():%Y-%m-%d %H:%M:%S} · `{cmd}` · {'OK' if ok else 'FALLÓ'}\n",
                 "| etapa | estado | tiempo | detalle |", "|---|---|---|---|"]
        for n, st, sec, det in self.log_rows:
            lines.append(f"| {n} | {st} | {sec / 60:.1f} min | {det.replace('|', '/')} |" if sec >= 60 else f"| {n} | {st} | {sec:.1f} s | {det.replace('|', '/')} |")
        log = self.p("log.md")
        if not log.exists():
            log.write_text(f"# Registro de {self.id}\n", encoding="utf-8")
        with log.open("a", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")

    # ------------------------------------------------------------ fuente de la voz
    def voice_story(self) -> Path:
        """story mínimo para la voz y la alineación: el 05_story.json si existe; si no, uno derivado del guion
        (una línea = un beat b01, b02…), con la voz por defecto del idioma"""
        story_p = self.p("05_story.json")
        if story_p.exists():
            return story_p
        from validate_script import parse
        s = parse(self.p("02_SCRIPT.md").read_text(encoding="utf-8"))
        if s.errors:
            raise PipelineError("02_SCRIPT.md no se puede leer: " + "; ".join(s.errors))
        st = {"meta": {"id": self.id, "lang": s.lang, "title": self.id, "voice": {"engine": VOICE_DEFAULT[s.lang][0], "voice": VOICE_DEFAULT[s.lang][1], "speed": 1.0}},
              "beats": [{"id": f"b{k + 1:02d}", "role": r, "text": t} for k, (r, t) in enumerate(s.lines)]}
        p = self.p("_voice_story.json")
        write_json(p, st)
        return p

    def props(self) -> Path:
        p = self.p("props.json")
        write_json(p, {"story": load_json(self.p("05_story.json")), "words": load_json(self.p("04_words.json"))}, indent=None)
        return p

    # ------------------------------------------------------------ etapas
    def validate_script(self):
        out = self.p("02_SCRIPT.validation.json")

        def run():
            r = subprocess.run([PY, "pipeline/validate_script.py", str(self.p("02_SCRIPT.md")), "--json"], cwd=ROOT,
                               capture_output=True, text=True, encoding="utf-8", env=dict(os.environ, PYTHONIOENCODING="utf-8"))
            res = json.loads(r.stdout)
            if not res["ok"]:
                raise PipelineError("el guion no pasa la validación:\n- " + "\n- ".join(res["errors"]))
            write_json(out, res)
            return f"{res['stats']['words']} palabras"
        self.stage("validate-script", out, [self.p("02_SCRIPT.md")], run)

    def tts(self):
        out = self.p("03_voice.wav")
        self.stage("tts", out, [self.p("02_SCRIPT.md")], lambda: self.sh(
            [PY, "pipeline/voice.py", "--story", str(self.voice_story()), "--out", str(self.d), "--force"], tag="tts").splitlines()[-1])

    def align(self):
        out = self.p("04_words.json")
        self.stage("align", out, [self.p("03_voice.wav")], lambda: self.sh(
            [PY, "pipeline/align.py", "--story", str(self.voice_story()), "--wav", str(self.p("03_voice.wav")), "--out", str(out),
             "--model", self.a.whisper], tag="align").splitlines()[-1])

    def validate_story(self):
        out = self.p("05_story.validation.txt")

        def run():
            r = subprocess.run([PY, "pipeline/validate_story.py", str(self.p("05_story.json")), "--words", str(self.p("04_words.json")),
                                "--script", str(self.p("02_SCRIPT.md")), "--require-actions"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8",
                               env=dict(os.environ, PYTHONIOENCODING="utf-8"))
            out.write_text(r.stdout, encoding="utf-8")
            if r.returncode != 0:
                out.unlink()
                raise PipelineError("05_story.json no pasa la validación:\n" + r.stdout)
            return "PASA"
        self.stage("validate-story", out, [self.p("05_story.json"), self.p("04_words.json"), self.p("02_SCRIPT.md")], run)

    def stills(self):
        out = self.p("06_stills")
        stamp = out / ".done"

        def run():
            from sfx_plan import beat_frames
            bts, _ = beat_frames(load_json(self.p("05_story.json")), load_json(self.p("04_words.json")))
            frames = ",".join(str((b["a"] + b["b"]) // 2) for b in bts)
            shutil.rmtree(out, ignore_errors=True)
            self.sh(["node", "scripts/job.mjs", "stills", BUNDLE, str(self.props()), str(out), frames, "--scale", str(self.a.stills_scale)],
                    cwd=STUDIO, tag="stills")
            stamp.write_text(frames, encoding="utf-8")
            return f"{len(bts)} stills (frames {frames})"
        self.stage("stills", stamp, [self.p("05_story.json"), self.p("04_words.json")], run)

    def render(self):
        out = self.p("07_video.mp4")
        self.stage("render", out, [self.p("05_story.json"), self.p("04_words.json")], lambda: self.sh(
            ["node", "scripts/job.mjs", "render", BUNDLE, str(self.props()), str(out), "--scale", str(self.a.scale),
             "--concurrency", str(self.a.concurrency)], cwd=STUDIO, tag="render").splitlines()[-1])

    def mix(self):
        plan, out = self.p("08_sfx_plan.json"), self.p("08_mix.wav")

        def run():
            self.sh([PY, "pipeline/sfx_plan.py", "--story", str(self.p("05_story.json")), "--words", str(self.p("04_words.json")), "--out", str(plan)], tag="sfx")
            return self.sh([PY, "pipeline/mix.py", "--voice", str(self.p("03_voice.wav")), "--plan", str(plan), "--out", str(out)], tag="mix").splitlines()[-1]
        self.stage("mix", out, [self.p("03_voice.wav"), self.p("05_story.json"), self.p("04_words.json")], run)

    def mux(self):
        out = self.p("09_final.mp4")

        def run():
            tmp = self.p("09_final.part.mp4")
            self.sh(["ffmpeg", "-v", "error", "-y", "-i", str(self.p("07_video.mp4")), "-i", str(self.p("08_mix.wav")), "-map", "0:v:0",
                     "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(tmp)])
            tmp.replace(out)
        self.stage("mux", out, [self.p("07_video.mp4"), self.p("08_mix.wav")], run)

    def qa(self):
        out = self.p("10_qa.md")

        def run():
            from qa_basic import report
            ok, md = report(self.d)
            out.write_text(md, encoding="utf-8")
            return "QA " + ("OK" if ok else "con avisos")
        self.stage("qa", out, [self.p("09_final.mp4"), self.p("07_video.mp4"), self.p("04_words.json")], run)

    def run(self, stages: list[str]):
        fns = {"validate-script": self.validate_script, "tts": self.tts, "align": self.align, "validate-story": self.validate_story,
               "stills": self.stills, "render": self.render, "mix": self.mix, "mux": self.mux, "qa": self.qa}
        for s in stages:
            fns[s]()
            if s == "validate-script" and self.a.review:
                print("\n--review: guion validado. Revísalo y relanza sin --review para seguir.")
                return


def init(a):
    src = (ROOT / a.from_dir) if not Path(a.from_dir).is_absolute() else Path(a.from_dir)
    d = ROOT / "out" / a.id
    d.mkdir(parents=True, exist_ok=True)
    copied = []
    for name in ("01_research.md", "02_SCRIPT.md", "05_story.json"):
        s = src / name
        if s.exists():
            if (d / name).exists() and not a.force:
                print(f"ya existe {d / name} (usa --force all para sobrescribir)")
                continue
            shutil.copy2(s, d / name)
            copied.append(name)
    if not copied and not (d / "02_SCRIPT.md").exists():
        raise PipelineError(f"{src} no tiene 02_SCRIPT.md")
    print(f"init: {', '.join(copied) or 'nada nuevo'} -> {d}")


def main():
    ap = argparse.ArgumentParser(description="Orquestador del explainer")
    ap.add_argument("cmd", choices=["init", "all"] + STAGES)
    ap.add_argument("--id", required=True)
    ap.add_argument("--from", dest="from_dir", default=None, help="init: carpeta con 02_SCRIPT.md y 05_story.json")
    ap.add_argument("--force", default=None, help="etapas a rehacer separadas por comas, o 'all'")
    ap.add_argument("--review", action="store_true", help="parar tras validar el guion")
    ap.add_argument("--scale", type=float, default=1.0, help="escala del render final (1 = 1080x1920)")
    ap.add_argument("--stills-scale", type=float, default=0.5)
    ap.add_argument("--concurrency", type=int, default=1)
    ap.add_argument("--whisper", default="medium")
    a = ap.parse_args()
    if a.cmd == "init":
        if not a.from_dir:
            raise PipelineError("init necesita --from <carpeta>")
        return init(a)
    r = Run(a.id, a)
    ok = False
    try:
        r.run(STAGES if a.cmd == "all" else [a.cmd])
        ok = True
    finally:
        r.write_log(" ".join(sys.argv[1:]), ok)
    print(f"\nlisto: {r.d / '09_final.mp4'}" if a.cmd == "all" and r.p("09_final.mp4").exists() else "")


if __name__ == "__main__":
    try:
        main()
    except PipelineError as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        sys.exit(2)
