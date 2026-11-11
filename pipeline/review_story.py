"""Etapa `review-script` (antes de la voz) y etapa `review` (después de alinear): un agente independiente califica y devuelve si no llega al umbral.

    python pipeline/review_story.py --id <id> [--kind script|story] [--reviewer claude|manual]

`--kind script` (por defecto `story`) califica SOLO el texto de 02_SCRIPT.md (gancho, retención, narrativa, drama, ritmo verbal, cierre, fidelidad) y se
hace antes de generar la voz: iterar el texto es barato, regenerar la voz de Diego (~20 min) no. Sus archivos son 06a_script_review.* y
`tts` no arranca sin una calificación vigente y aprobada (script_gate). `--kind story` es la crítica de siempre, con tiempos reales y plan visual.

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
SCRIPT_CFG = {**{k: CFG[k] for k in ("model",)}, **CFG["script"]}   # umbrales propios del crítico de guion
DIMS = tuple(CFG["weights"])
TXT = " [cambia el texto: obliga a regenerar esas frases de voz]"
SCRIPT_DIMS = tuple(SCRIPT_CFG["weights"])
KINDS = {   # qué se califica, con qué prompt y dónde se guarda
    "story": dict(cfg=CFG, dims=DIMS, prompt="critico_story.md", pre="06_review", label="story", files=("02_SCRIPT.md", "05_story.json")),
    "script": dict(cfg=SCRIPT_CFG, dims=SCRIPT_DIMS, prompt="critico_guion.md", pre="06a_script_review", label="guion", files=("02_SCRIPT.md",)),
}


def fingerprint(d: Path, kind: str = "story") -> str:
    h = hashlib.sha1()
    for n in KINDS[kind]["files"]:
        h.update((d / n).read_bytes())
    return h.hexdigest()[:16]


def build_request_script(d: Path) -> str:
    """lo único que ve el crítico de guion: cabecera, líneas con su rol y las fuentes; sin tiempos ni plan visual"""
    from validate_script import parse
    sc = parse((d / "02_SCRIPT.md").read_text(encoding="utf-8"))
    if sc.errors:
        raise PipelineError("02_SCRIPT.md no se puede leer: " + "; ".join(sc.errors))
    words = sum(len(t.split()) for _, t in sc.lines)
    hook = sc.lines[0][1]
    rows = [f"{i + 1:02d} [{r}] {t}" for i, (r, t) in enumerate(sc.lines)]
    stats = (f"- Palabras: {words} (≈{words / 3.4:.0f} s a ritmo viral; historia 2D: el video debe durar 60–70 s; si algo sobra, recórtalo)\n"
             f"- Gancho: {len(hook.split())} palabras · tipo declarado: {sc.hook or '—'} · cierre declarado: {sc.closing or '—'} · estructura: {sc.structure or '—'} · perfil: {sc.pacing or 'clásico'}")
    if sc.beats:
        stats += f"\n- Beats de la estructura nueva: {' → '.join(sc.beats)}"
    if sc.ficcion:
        stats += f"\n- Ficción: {sc.ficcion} · punto de vista: {sc.pov or '—'}"
    src = "\n".join(f"- {x}" for x in sc.sources) or "—"
    fic = "\n".join(f"- {x}" for x in sc.fiction)
    fic = f"\n## Ficción que declara el autor (anclas = verificadas; inventado = dramatizado a propósito)\n{fic}\n" if fic else ""
    new = "\n".join(f"- {k}: {v}" for k, v in sc.new.items())
    fic += f"\n## Fórmulas nuevas que declara el autor (fuera del catálogo; júzgalas por su propia promesa)\n{new}\n" if new else ""
    return (f"# Guion a calificar: {d.name}\n\n## Datos\n{stats}\n\n## Guion (una línea por beat)\n" + "\n".join(rows)
            + f"\n\n## Fuentes que declara el autor\n{src}\n{fic}")


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
             f"- Restricción: historia 2D, el video debe durar 60–70 s (35–59 s en el explainer)\n"
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


def verdict(review: dict, kind: str = "story") -> dict:
    """total ponderado y si pasa, calculados aquí con templates/review.json"""
    cfg, DIMS = KINDS[kind]["cfg"], KINDS[kind]["dims"]
    sc = review.get("scores", {})
    miss = [k for k in DIMS if not isinstance(sc.get(k), (int, float)) or isinstance(sc.get(k), bool) or not 0 <= sc[k] <= 10]
    if miss:
        raise PipelineError(f"calificación incompleta o fuera de 0–10: {', '.join(miss)}")
    w = cfg["weights"]
    total = round(sum(sc[k] * w[k] for k in DIMS) / sum(w.values()), 2)
    why = []
    if total < cfg["minTotal"]:
        why.append(f"total {total} < {cfg['minTotal']}")
    if sc["gancho"] < cfg["minGancho"]:
        why.append(f"gancho {sc['gancho']} < {cfg['minGancho']}")
    why += [f"{k} {sc[k]} < {cfg['minDimension']}" for k in DIMS if sc[k] < cfg["minDimension"] and k != "gancho"]
    return {"total": total, "pass": not why, "why": why}


def ask_claude(request: str, kind: str = "story") -> dict:
    exe = shutil.which("claude")
    if not exe:
        raise PipelineError(f"no hay `claude` en el PATH: usa --reviewer manual y pide la crítica a otro agente (templates/prompts/{KINDS[kind]['prompt']})")
    system = (ROOT / "templates" / "prompts" / KINDS[kind]["prompt"]).read_text(encoding="utf-8")
    r = subprocess.run([exe, "-p", "--no-session-persistence", "--tools", "", "--model", KINDS[kind]["cfg"]["model"], "--system-prompt", system],
                       input=request, capture_output=True, text=True, encoding="utf-8", timeout=600)
    if r.returncode != 0:
        raise PipelineError(f"`claude -p` falló ({r.returncode}): {(r.stderr or r.stdout)[-300:]}")
    return parse_review(r.stdout)


def md_report(rev: dict, kind: str = "story") -> str:
    v, sc, cfg, DIMS = rev["verdict"], rev["scores"], KINDS[kind]["cfg"], KINDS[kind]["dims"]
    out = [f"# Calificación del {KINDS[kind]['label']} · ronda {rev['round']}/{cfg['maxRounds']}", "",
           f"**{'APROBADO' if v['pass'] else 'DEVUELTO'}**: total {v['total']} (mínimo {cfg['minTotal']}), gancho {sc['gancho']} (mínimo {cfg['minGancho']}).", "",
           "| dimensión | peso | nota |", "|---|---|---|", *[f"| {k} | {cfg['weights'][k]} | {sc[k]} |" for k in DIMS], ""]
    if rev.get("summary"):
        out += [rev["summary"], ""]
    if rev.get("drop_off"):
        out += [f"Un espectador se iría hacia el s {rev['drop_off'].get('second')}: {rev['drop_off'].get('why')}", ""]
    if rev.get("problems"):
        out += ["## Correcciones pedidas", *[f"- **{p.get('beat', '?')}** ({p.get('dimension', '')}): {p.get('issue', '')} → {p.get('fix', '')}{TXT if p.get('text_change') else ''}" for p in rev["problems"]], ""]
    if rev.get("hook_alternatives"):
        out += ["## Ganchos alternativos", *[f"- {h}" for h in rev["hook_alternatives"]], ""]
    return "\n".join(out)


def evaluate(d: Path, reviewer: str = "claude", kind: str = "story") -> dict:
    """califica (o reutiliza la calificación vigente) y devuelve el veredicto; lanza PipelineError si se devuelve"""
    K = KINDS[kind]
    cfg, pre, label = K["cfg"], K["pre"], K["label"]
    fp, rp = fingerprint(d, kind), d / f"{pre}.json"
    hist_p, req_p = d / f"{pre}.history.json", d / f"{pre}_request.md"
    hist = load_json(hist_p) if hist_p.exists() else []
    cur = load_json(rp) if rp.exists() else None
    if not cur or cur.get("fingerprint") != fp:   # sin calificación, o caducada porque lo calificado cambió
        if len([h for h in hist if h["verdict"]["pass"] is False]) >= cfg["maxRounds"]:
            raise PipelineError(f"el {label} ya fue devuelto {cfg['maxRounds']} veces ({hist_p.name}): para y consulta con el usuario antes de seguir")
        request = build_request_script(d) if kind == "script" else build_request(d)
        req_p.write_text(request, encoding="utf-8")
        if reviewer == "manual":
            if cur and cur.get("fingerprint") != fp:
                rp.unlink()
            raise PipelineError(f"falta la calificación vigente: lanza un agente independiente con templates/prompts/{K['prompt']} sobre "
                                f"{req_p} y guarda su JSON en {rp} (campo `fingerprint` = {fp}), o usa --reviewer claude")
        raw = ask_claude(request, kind)
        cur = {**raw, "fingerprint": fp, "round": len(hist) + 1}
        cur["verdict"] = verdict(cur, kind)
        write_json(rp, cur)
        hist.append({"round": cur["round"], "fingerprint": fp, "scores": cur["scores"], "verdict": cur["verdict"]})
        write_json(hist_p, hist)
    elif "verdict" not in cur:   # lo escribió a mano otro agente: se completa aquí
        cur["verdict"], cur["round"] = verdict(cur, kind), len(hist) + 1
        write_json(rp, cur)
        hist.append({"round": cur["round"], "fingerprint": fp, "scores": cur["scores"], "verdict": cur["verdict"]})
        write_json(hist_p, hist)
    (d / f"{pre}.md").write_text(md_report(cur, kind), encoding="utf-8")
    if not cur["verdict"]["pass"]:
        fixes = "\n".join(f"  - {p.get('beat', '?')} ({p.get('dimension', '')}): {p.get('issue', '')} -> {p.get('fix', '')}" for p in cur.get("problems", []))
        nxt = "Corrige 02_SCRIPT.md, valídalo y relanza la etapa (la voz aún no se ha generado)." if kind == "script" else "Corrige el guion/story, vuelve a validar y relanza la etapa."
        raise PipelineError(f"{label} DEVUELTO por el crítico (ronda {cur['round']}/{cfg['maxRounds']}; {'; '.join(cur['verdict']['why'])}).\n"
                            f"{nxt} Detalle en {d / (pre + '.md')}:\n{fixes}")
    return cur


def script_gate(d: Path) -> tuple[bool, str]:
    """¿puede arrancar la voz? Solo con una calificación de guion vigente (misma huella) y aprobada"""
    rp = d / f"{KINDS['script']['pre']}.json"
    if not rp.exists():
        return False, "el guion no tiene calificación (etapa review-script)"
    cur = load_json(rp)
    if cur.get("fingerprint") != fingerprint(d, "script"):
        return False, "el guion cambió después de calificarlo: relanza review-script"
    if "verdict" not in cur or not cur["verdict"]["pass"]:
        return False, "el guion está devuelto por el crítico"
    return True, f"total {cur['verdict']['total']}, gancho {cur['scores']['gancho']}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--id", required=True)
    ap.add_argument("--kind", choices=list(KINDS), default="story")
    ap.add_argument("--reviewer", choices=["claude", "manual"], default="claude")
    a = ap.parse_args()
    cur = evaluate(ROOT / "out" / a.id, a.reviewer, a.kind)
    print(f"[review] {KINDS[a.kind]['label']} APROBADO: total {cur['verdict']['total']}, gancho {cur['scores']['gancho']} (ronda {cur['round']})")


if __name__ == "__main__":
    run_main(main)
