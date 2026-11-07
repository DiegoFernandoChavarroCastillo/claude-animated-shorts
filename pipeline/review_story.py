"""Etapa `review`: un agente independiente califica el story (gancho, retención, narrativa…) y lo devuelve si no llega al umbral.

    python pipeline/review_story.py --id <id> [--reviewer claude|manual]

Entradas: out/<id>/02_SCRIPT.md, 05_story.json y 04_words.json. Salidas: 06_review_request.md (lo que ve el crítico),
06_review.json (calificación + veredicto + huella de lo calificado), 06_review.history.json (una entrada por ronda) y 06_review.md.
El veredicto lo calcula este módulo con templates/review.json (pesos, umbrales, rondas): no se fía del `pass` del agente.
Con `--reviewer claude` lanza `claude -p` sin herramientas y sin sesión (contexto limpio: no sabe nada del autor); con `manual`
solo prepara la petición y espera un 06_review.json escrito por otro agente (p. ej. un subagente de Claude Code con templates/prompts/critico_story.md).
Si el story cambia después de calificarlo, la calificación caduca (la huella ya no coincide) y hay que volver a pedirla."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import ROOT, PipelineError, load_json, run_main, write_json  # noqa: E402
from validate_story import event_gap  # noqa: E402

CFG = load_json(ROOT / "templates" / "review.json")
DIMS = tuple(CFG["weights"])


def fingerprint(d: Path) -> str:
    h = hashlib.sha1()
    for n in ("02_SCRIPT.md", "05_story.json"):
        h.update((d / n).read_bytes())
    return h.hexdigest()[:16]


def build_request(d: Path) -> str:
    """lo único que ve el crítico: guion con tiempos, qué se ve, acciones y métricas"""
    story, words = load_json(d / "05_story.json"), load_json(d / "04_words.json")
    meta, rows = story["meta"], []
    for b in story["beats"]:
        ws = [w for w in words if w["beat"] == b["id"]]
        t0, t1 = (ws[0]["start"], ws[-1]["end"]) if ws else (0, 0)
        acts = ", ".join(a["type"] for a in b.get("actions", [])) or "—"
        ovs = ", ".join(o["type"] for o in b.get("overlays", [])) or "—"
        rows.append(f"### {b['id']} [{b['role']}] {t0:.1f}–{t1:.1f} s\n- Voz: {b['text']}\n- Se ve: {b.get('shows', '—')}\n"
                    f"- Cámara: {b['scene']['camera']['preset']} · sub-planos: {len(b.get('shots', []))} · acciones: {acts} · overlays: {ovs}")
    dur = words[-1]["end"] if words else 0
    gap, at = event_gap(story, words)
    hook = [w for w in words if w["beat"] == story["beats"][0]["id"]]
    stats = (f"- Duración: {dur:.1f} s · palabras: {len(words)} ({len(words) / max(dur, 1):.2f} pal/s)\n"
             f"- Gancho dicho en: {hook[-1]['end']:.1f} s\n- Hueco máximo sin cambio visual: {gap:.1f} s (desde el s {at:.1f})\n"
             f"- Restricción: el video debe durar 60–80 s (monetización); no lo acortes por debajo de 60 s\n"
             f"- Perfil: {meta.get('pacing', 'clásico')} · cierre: {'bucle' if story['beats'][-1]['role'] == 'cta' else '—'}")
    return f"# Story a calificar: {meta.get('title', d.name)}\n\n## Métricas\n{stats}\n\n## Beats\n\n" + "\n\n".join(rows) + "\n"


def parse_review(text: str) -> dict:
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S) or re.search(r"(\{.*\})", text, re.S)
    if not m:
        raise PipelineError("la respuesta del crítico no contiene un bloque JSON")
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        raise PipelineError(f"el JSON del crítico no se puede leer: {e}")


def verdict(review: dict) -> dict:
    """total ponderado y si pasa, calculados aquí con templates/review.json"""
    sc = review.get("scores", {})
    miss = [k for k in DIMS if not isinstance(sc.get(k), (int, float)) or isinstance(sc.get(k), bool) or not 0 <= sc[k] <= 10]
    if miss:
        raise PipelineError(f"calificación incompleta o fuera de 0–10: {', '.join(miss)}")
    w = CFG["weights"]
    total = round(sum(sc[k] * w[k] for k in DIMS) / sum(w.values()), 2)
    why = []
    if total < CFG["minTotal"]:
        why.append(f"total {total} < {CFG['minTotal']}")
    if sc["gancho"] < CFG["minGancho"]:
        why.append(f"gancho {sc['gancho']} < {CFG['minGancho']}")
    why += [f"{k} {sc[k]} < {CFG['minDimension']}" for k in DIMS if sc[k] < CFG["minDimension"] and k != "gancho"]
    return {"total": total, "pass": not why, "why": why}


def ask_claude(request: str) -> dict:
    exe = shutil.which("claude")
    if not exe:
        raise PipelineError("no hay `claude` en el PATH: usa --reviewer manual y pide la crítica a otro agente (templates/prompts/critico_story.md)")
    system = (ROOT / "templates" / "prompts" / "critico_story.md").read_text(encoding="utf-8")
    r = subprocess.run([exe, "-p", "--no-session-persistence", "--tools", "", "--model", CFG["model"], "--system-prompt", system],
                       input=request, capture_output=True, text=True, encoding="utf-8", timeout=600)
    if r.returncode != 0:
        raise PipelineError(f"`claude -p` falló ({r.returncode}): {(r.stderr or r.stdout)[-300:]}")
    return parse_review(r.stdout)


def md_report(rev: dict) -> str:
    v, sc = rev["verdict"], rev["scores"]
    out = [f"# Calificación del story · ronda {rev['round']}/{CFG['maxRounds']}", "",
           f"**{'APROBADO' if v['pass'] else 'DEVUELTO'}**: total {v['total']} (mínimo {CFG['minTotal']}), gancho {sc['gancho']} (mínimo {CFG['minGancho']}).", "",
           "| dimensión | peso | nota |", "|---|---|---|", *[f"| {k} | {CFG['weights'][k]} | {sc[k]} |" for k in DIMS], ""]
    if rev.get("summary"):
        out += [rev["summary"], ""]
    if rev.get("drop_off"):
        out += [f"Un espectador se iría hacia el s {rev['drop_off'].get('second')}: {rev['drop_off'].get('why')}", ""]
    if rev.get("problems"):
        out += ["## Correcciones pedidas", *[f"- **{p.get('beat', '?')}** ({p.get('dimension', '')}): {p.get('issue', '')} → {p.get('fix', '')}" for p in rev["problems"]], ""]
    if rev.get("hook_alternatives"):
        out += ["## Ganchos alternativos", *[f"- {h}" for h in rev["hook_alternatives"]], ""]
    return "\n".join(out)


def evaluate(d: Path, reviewer: str = "claude") -> dict:
    """califica (o reutiliza la calificación vigente) y devuelve el veredicto; lanza PipelineError si el story se devuelve"""
    fp, rp = fingerprint(d), d / "06_review.json"
    hist_p = d / "06_review.history.json"
    hist = load_json(hist_p) if hist_p.exists() else []
    cur = load_json(rp) if rp.exists() else None
    if not cur or cur.get("fingerprint") != fp:   # sin calificación, o caducada porque el story cambió
        if len([h for h in hist if h["verdict"]["pass"] is False]) >= CFG["maxRounds"]:
            raise PipelineError(f"el story ya fue devuelto {CFG['maxRounds']} veces (06_review.history.json): para y consulta con el usuario antes de seguir")
        request = build_request(d)
        (d / "06_review_request.md").write_text(request, encoding="utf-8")
        if reviewer == "manual":
            if cur and cur.get("fingerprint") != fp:
                rp.unlink()
            raise PipelineError("falta la calificación vigente: lanza un agente independiente con templates/prompts/critico_story.md sobre "
                                f"{d / '06_review_request.md'} y guarda su JSON en {rp} (campo `fingerprint` = {fp}), o usa --reviewer claude")
        raw = ask_claude(request)
        cur = {**raw, "fingerprint": fp, "round": len(hist) + 1}
        cur["verdict"] = verdict(cur)
        write_json(rp, cur)
        hist.append({"round": cur["round"], "fingerprint": fp, "scores": cur["scores"], "verdict": cur["verdict"]})
        write_json(hist_p, hist)
    elif "verdict" not in cur:   # lo escribió a mano otro agente: se completa aquí
        cur["verdict"], cur["round"] = verdict(cur), len(hist) + 1
        write_json(rp, cur)
        hist.append({"round": cur["round"], "fingerprint": fp, "scores": cur["scores"], "verdict": cur["verdict"]})
        write_json(hist_p, hist)
    (d / "06_review.md").write_text(md_report(cur), encoding="utf-8")
    if not cur["verdict"]["pass"]:
        fixes = "\n".join(f"  - {p.get('beat', '?')} ({p.get('dimension', '')}): {p.get('issue', '')} -> {p.get('fix', '')}" for p in cur.get("problems", []))
        raise PipelineError(f"story DEVUELTO por el crítico (ronda {cur['round']}/{CFG['maxRounds']}; {'; '.join(cur['verdict']['why'])}).\n"
                            f"Corrige el guion/story, vuelve a validar y relanza la etapa. Detalle en {d / '06_review.md'}:\n{fixes}")
    return cur


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--reviewer", choices=["claude", "manual"], default="claude")
    a = ap.parse_args()
    cur = evaluate(ROOT / "out" / a.id, a.reviewer)
    print(f"[review] APROBADO: total {cur['verdict']['total']}, gancho {cur['scores']['gancho']} (ronda {cur['round']})")


if __name__ == "__main__":
    run_main(main)
