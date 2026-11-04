"""Un frame por cada elemento nuevo del catálogo F11, en una carpeta: objetos (cada pose), entornos, overlays, iconos
y cámaras (tira de 3 frames: inicio, mitad y final del beat).

    python tools/catalog_stills.py out/catalogo-f11 [--scale 0.75]
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from catalog_io import load  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve(); scale = sys.argv[sys.argv.index("--scale") + 1] if "--scale" in sys.argv else "0.75"
cat = load()
src = ROOT / "studio/src/explainer/heroes/primitive"
ENV_OF = {"body2": "interior_cuerpo", "micro2": "microscopio", "mind2": "mente_abstracta", "chemistry2": "laboratorio", "physics2": "tech_oscuro", "space2": "espacio_profundo", "earth2": "paisaje_natural", "life2": "bosque_dia", "home2": "cocina",
          "body": "interior_cuerpo", "micro": "microscopio", "space": "espacio_profundo", "physics": "tech_oscuro", "chemistry": "laboratorio",
          "earth": "paisaje_natural", "mind": "mente_abstracta", "life": "bosque_dia", "home": "cocina", "generic": "tech_oscuro"}
ENV_OVERRIDE = {"pez": "macro_corte", "puente": "cielo_atardecer", "piramide": "taller_antiguo", "palanca": "taller_antiguo", "bateria": "tech_oscuro",
                "wifi_router": "interior_neutro", "pantalla_led": "tech_oscuro", "numeros_flotantes": "tech_oscuro", "forma_fibonacci": "tech_oscuro",
                "ave_vuelo": "cielo_atardecer", "nube_rayo": "cielo_atardecer", "ola_marea": "cielo_atardecer", "iceberg": "cielo_atardecer",
                "capas_tierra": "tech_oscuro", "medusa": "macro_corte", "murcielago": "espacio_profundo", "candado_cifrado": "tech_oscuro", "engranajes": "taller_antiguo", "catapulta": "taller_antiguo", "pitagoras": "tech_oscuro", "moneda_azar": "tech_oscuro", "arcoiris": "paisaje_natural", "aurora": "paisaje_natural", "ondas_gota": "tech_oscuro", "mitocondria": "microscopio", "tubos_ensayo": "laboratorio", "ojo": "mente_abstracta", "ojo_ilusion": "mente_abstracta", "cohete": "espacio_profundo"}
hero_env = {}
for f, env in ENV_OF.items():
    for m in re.finditer(r"export const (\w+): HeroDef", (src / f"{f}.ts").read_text(encoding="utf-8")):
        hero_env[m.group(1)] = ENV_OVERRIDE.get(m.group(1), env)
for h in ("garganta_corte", "pulmones", "corazon", "estomago", "ojo", "piel_capas"):
    hero_env[h] = "interior_cuerpo" if h != "ojo" else "interior_cuerpo"

beats, jobs = [], []   # jobs: (beat id, destino relativo, [fracciones del beat])


def add(text, env, hero, pose, cam=None, overlays=None, light=None, dest="", fracs=(0.6,), at=None):
    bid = f"b{len(beats) + 1:03d}"
    d = cat["heroes"][hero]
    beats.append({"id": bid, "role": "tension", "text": text,
                  "scene": {"env": env, "light": light or cat["envs"][env]["lights"][0], "hero": {"kind": d["kind"], "asset": hero, **({"pose": pose} if pose else {})},
                            "camera": cam or {"preset": "cut"}, "dof": 6}, "overlays": overlays or [], "sfx": [], "transition": "cut"})
    jobs.append((bid, dest, list(fracs)))


SOLO2 = "--solo2" in sys.argv
SEGUNDA = {m.group(1) for f in ENV_OF if f.endswith("2") for m in re.finditer(r"export const (\w+): HeroDef", (src / f"{f}.ts").read_text(encoding="utf-8"))}
NEW_H = [k for k in cat["heroes"] if k in hero_env and (not SOLO2 or k in SEGUNDA)]
for h in NEW_H:
    for pose in cat["heroes"][h]["poses"]:
        add(f"Así se ve {h.replace('_', ' ')} en la pose {pose} ahora mismo", hero_env[h], h, pose, dest=f"objetos/{h}__{pose}.jpg", fracs=(0.65,))

NEW_E = [] if SOLO2 else ["interior_cuerpo", "microscopio", "espacio_profundo", "paisaje_natural", "bosque_dia", "cocina", "taller_antiguo", "laboratorio", "mente_abstracta"]
ENV_HERO = {"interior_cuerpo": "corazon", "microscopio": "celula", "espacio_profundo": "planeta", "paisaje_natural": "volcan_corte", "bosque_dia": "planta_fotosintesis",
            "cocina": "olla_hierve", "taller_antiguo": "palanca", "laboratorio": "matraz", "mente_abstracta": "cerebro"}
for e in NEW_E:
    for light in cat["envs"][e]["lights"]:
        add(f"Este es el entorno {e.replace('_', ' ')} con luz {light} ahora mismo", e, ENV_HERO[e], None, light=light, dest=f"entornos/{e}__{light}.jpg")

OV = {  # tipo -> (héroe/entorno de fondo, campos)
    "Arrow3D": ("garganta_corte", "interior_cuerpo", {"anchor": "amigdalas", "from": "right", "text": "AMÍGDALAS"}),
    "Highlight": ("garganta_corte", "interior_cuerpo", {"anchor": "amigdalas", "shape": "circle", "r": 100, "color": "ui.red"}),
    "ZoomLens": ("garganta_corte", "interior_cuerpo", {"anchor": "nasofaringe", "icon": "virus", "text": "VIRUS"}),
    "FlowArrow": ("garganta_corte", "interior_cuerpo", {"anchor": "nasofaringe", "to": "laringe", "text": "AIRE"}),
    "Timeline": ("esfera_flotante", "tech_oscuro", {"events": [{"label": "Entra", "time": "0 h"}, {"label": "Copia", "time": "12 h"}, {"label": "Sale", "time": "48 h"}]}),
    "Thermometer": ("esfera_flotante", "tech_oscuro", {"value": 38.5, "min": 30, "max": 42, "unit": " °C", "decimals": 1, "label": "FIEBRE"}),
    "VersusCard": ("esfera_flotante", "tech_oscuro", {"a": {"title": "Virus", "icon": "virus"}, "b": {"title": "Bacteria", "icon": "bug"}}),
    "Checklist": ("esfera_flotante", "tech_oscuro", {"items": ["El frío", "El aire seco", "La alergia"], "crossed": True}),
    "Steps": ("esfera_flotante", "tech_oscuro", {"steps": [{"title": "Entra", "sub": "por la nariz"}, {"title": "Se copia"}, {"title": "Duele"}]}),
    "Equation": ("esfera_flotante", "tech_oscuro", {"text": "v = d / t", "note": "VELOCIDAD"}),
    "ScaleBar": ("esfera_flotante", "tech_oscuro", {"from": "1 nm", "to": "1 m", "pos": 0.4, "label": "VIRUS"}),
    "TrendArrow": ("esfera_flotante", "tech_oscuro", {"dir": "up", "value": "+12 %", "label": "CASOS"}),
    "WarningTag": ("esfera_flotante", "tech_oscuro", {"text": "OJO CON ESTO"}),
}
OV2 = {
    "Speedometer": ("esfera_flotante", "tech_oscuro", {"value": 72, "max": 120, "unit": " km/h", "label": "VELOCIDAD"}),
    "BatteryLevel": ("esfera_flotante", "tech_oscuro", {"value": 0.18, "label": "ENERGÍA"}),
    "ProgressRing": ("esfera_flotante", "tech_oscuro", {"value": 0.64, "label": "COMPLETADO"}),
    "Countdown": ("esfera_flotante", "tech_oscuro", {"from": 10, "unit": " s", "label": "TIEMPO"}),
    "Stopwatch": ("esfera_flotante", "tech_oscuro", {"seconds": 12.4, "label": "REACCIÓN"}),
    "ColorScale": ("esfera_flotante", "tech_oscuro", {"from": "FRÍO", "to": "CALIENTE", "pos": 0.7, "label": "AQUÍ"}),
    "DotGrid": ("esfera_flotante", "tech_oscuro", {"filled": 12, "label": "12 DE CADA 100"}),
    "LineChart": ("esfera_flotante", "tech_oscuro", {"points": [3, 5, 4, 8, 12, 15], "labels": ["1", "2", "3", "4", "5", "6"], "unit": " °C", "label": "TEMPERATURA"}),
    "Compass": ("esfera_flotante", "tech_oscuro", {"deg": 70, "label": "NORTE MAGNÉTICO"}),
    "Venn": ("esfera_flotante", "tech_oscuro", {"a": "Virus", "b": "Bacterias", "both": "Infectan"}),
    "Pyramid": ("esfera_flotante", "tech_oscuro", {"levels": ["Halcón", "Ratón", "Insectos", "Plantas"]}),
    "BigWord": ("esfera_flotante", "tech_oscuro", {"word": "MITO", "sub": "NO ES CIERTO"}),
    "ECG": ("corazon", "interior_cuerpo", {"bpm": 120, "label": "EN CARRERA"}),
    "OrbitDiagram": ("planeta", "espacio_profundo", {"center": "SOL", "orbiter": "TIERRA", "period": "1 AÑO"}),
    "ReactionEq": ("matraz", "laboratorio", {"parts": ["H₂", "+", "O₂", "→", "H₂O"]}),
    "NumberLine": ("esfera_flotante", "tech_oscuro", {"min": 0, "max": 14, "value": 7.4, "marks": [{"v": 7, "label": "AGUA"}, {"v": 2, "label": "LIMÓN"}], "label": "pH"}),
    "ForceArrows": ("esfera_flotante", "tech_oscuro", {"center": "BOLA", "arrows": [{"label": "PESO", "dir": "down"}, {"label": "EMPUJE", "dir": "up"}, {"label": "ROCE", "dir": "left", "size": 0.7}]}),
    "DepthScale": ("esfera_flotante", "tech_oscuro", {"top": "SUPERFICIE", "bottom": "11 000 m", "marks": [{"at": 0.2, "label": "LUZ"}, {"at": 0.55, "label": "OSCURIDAD"}, {"at": 0.95, "label": "ABISMO"}], "marker": 0.55}),
    "ThoughtBubble": ("persona", "mente_abstracta", {"text": "¿Dónde dejé las llaves?", "icon": "brain"}),
    "FoodChain": ("esfera_flotante", "tech_oscuro", {"nodes": [{"label": "SOL", "icon": "sun"}, {"label": "PLANTA", "icon": "leaf"}, {"label": "INSECTO", "icon": "bug"}, {"label": "AVE", "icon": "fish"}]}),
}
for t, (h, e, f) in (OV2 if SOLO2 else OV).items():
    add("Mira este dato clave sobre el tema ahora mismo", e, h, None, overlays=[{"type": t, "at": "clave", **f}], dest=f"overlays/{t}.jpg", fracs=(0.8,))

CAMS = {"pull_out": {}, "orbit_fast": {"deg": 60}, "crane_up": {}, "crane_down": {}, "dolly_side": {"dir": "right"}, "whip_pan": {"dir": "left"},
        "dutch_tilt": {"deg": 8}, "follow_anchor": {"anchor": "ventriculo"}, "spiral_in": {"deg": 40}, "arc_over": {"deg": 25}}
for c, p in ({} if SOLO2 else CAMS).items():
    add("Esta es la cámara " + c.replace("_", " ") + " mirando el corazón con calma", "interior_cuerpo", "corazon", "latido", cam={"preset": c, **p}, dest=f"camaras/{c}.jpg", fracs=(0.03, 0.5, 0.97))

ICONS = "virus cell atom planet thermo arrow warning bolt flask leaf dna lungs bone magnet wave rocket globe star fire cloud mountain fish bug bulb gear scale book hourglass pill cross sound".split()
for i in range(0, 0 if SOLO2 else len(ICONS), 4):
    ch = ICONS[i:i + 4]
    add("Estos son los iconos nuevos del catálogo ahora mismo", "tech_oscuro", "esfera_flotante", "orbe",
        overlays=[{"type": "IconFlow", "at": "iconos", "steps": [{"label": n.upper(), "icon": n} for n in ch]}], dest=f"iconos/iconos_{i // 4 + 1:02d}__{'_'.join(ch)}.jpg", fracs=(0.8,))

work = out / "_trabajo"; work.mkdir(parents=True, exist_ok=True)
story = {"meta": {"id": "catalogo", "lang": "es", "title": "catalogo", "fps": 30, "width": 1080, "height": 1920, "voice": {"engine": "kokoro", "voice": "x", "speed": 1}, "music": False, "captionEmphasis": "box"}, "beats": beats}
(work / "story.json").write_text(json.dumps(story, ensure_ascii=False), encoding="utf-8")
subprocess.run(["node", "scripts/fake_words.mjs", "story", str(work / "story.json"), str(work / "words.json")], cwd=ROOT / "studio", check=True, capture_output=True)
words = json.loads((work / "words.json").read_text(encoding="utf-8"))
frames, plan = [], []
for bid, dest, fr in jobs:
    ws = [w for w in words if w["beat"] == bid]
    a, b = ws[0]["start"], ws[-1]["end"]
    fs = [int((a + (b - a) * x) * 30) for x in fr]
    frames += fs; plan.append((dest, fs))
print(len(beats), "beats,", len(frames), "frames")
(work / "props.json").write_text(json.dumps({"story": story, "words": words}, ensure_ascii=False), encoding="utf-8")
env = {**os.environ, "STILLS_PROPS_FILE": str(work / "props.json")}
subprocess.run(["node", "scripts/stills.mjs", str(work / "frames"), "Explainer@" + ",".join(map(str, frames)), "--scale", scale], cwd=ROOT / "studio", env=env, check=True, capture_output=True)
for dest, fs in plan:
    d = out / dest; d.parent.mkdir(parents=True, exist_ok=True)
    files = [work / "frames" / f"Explainer_{f}.jpg" for f in fs]
    if len(files) == 1:
        d.write_bytes(files[0].read_bytes())
    else:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *sum([["-i", str(f)] for f in files], []), "-filter_complex", f"hstack=inputs={len(files)}", str(d)], check=True)
import shutil; shutil.rmtree(work)
print("listo:", out)
