"""Lámina de look (D123): la misma tanda de escenas de prueba por tema visual, para ver de un vistazo si el motor 2D se ve luminoso, con
atmósfera y con vida. Es la prueba previa a tocar paletas, luces o el kit (figura, escenarios, ambiente).

    python tools/look_sheet.py OUT_DIR [tema ...]      # sin temas: todos los que tienen escena de prueba

Deja OUT_DIR/<tema>/sheet.jpg (vía tools/gallery2d.py) y OUT_DIR/look.jpg con todas juntas.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FIG = lambda x, y=0.6, s=0.22, **o: {"asset": "figura", "id": o.pop("id", f"f{int(x * 100)}"), "z": 5, "at": [x, y], "scale": s, "opts": o}  # noqa: E731


def beat(i, text, palette, light, layers, actions=(), overlays=(), camera=None, lights=None, role="scene"):
    sc = {"palette": palette, "light": light, "layers": layers, "camera": camera or {"preset": "push_in", "to": [0.5, 0.5, 1.08]}}
    if lights:
        sc["lights"] = lights
    return {"id": f"b{i:02d}", "role": role, "text": text, "shows": text, "keywords": [text.split()[0].strip(".,")], "scene": sc,
            "overlays": list(overlays), "actions": list(actions), "transition": "cut"}


SCENES = {
    "submarino": [beat(1, "La madre nada despacio junto a su cría bajo la luz.", "submarino", "submarino", [
        {"asset": "rayos_luz", "z": 0, "opts": {"n": 7, "a": 0.3}}, {"asset": "particulas", "id": "fondo", "z": 1, "par": 0.6, "opts": {"kind": "burbujas", "n": 30}},
        {"asset": "ballena", "id": "madre", "z": 3, "at": [0.52, 0.36], "scale": 1.2}, {"asset": "ballena", "id": "cria", "z": 4, "at": [0.4, 0.55], "scale": 0.5},
        {"asset": "particulas", "id": "plancton", "z": 6, "opts": {"kind": "polvo", "n": 70}}],
        actions=[{"type": "call", "at": "nada", "target": "madre", "dur": 40}])],
    "noche_calida": [beat(1, "Esa noche cada familia enciende sus velas en la calle.", "noche_luces", "velas", [
        {"asset": "cielo", "z": 0, "opts": {"astro": "luna", "x": 74, "y": 40, "r": 5}}, {"asset": "estrellas", "z": 1, "opts": {"hasta": 0.4}},
        {"asset": "calle", "z": 2, "opts": {"epoca": "colonial", "guirnalda": True, "faroles": True}},
        FIG(0.3, ropa="actual", color="#E8502E", pelo="corto", mira=0.6), FIG(0.46, s=0.15, ropa="actual", color="#F2C14E", pelo="rizado"),
        FIG(0.6, ropa="vestido", color="#2E8FE0", pelo="largo", mira=-0.6), FIG(0.74, s=0.16, ropa="actual", color="#8A4AD0", pelo="mono", mira=-0.5),
        {"asset": "vela", "id": "velas", "z": 7, "at": [0.5, 0.635], "scale": 0.075, "repeat": {"n": 9, "cols": 9, "dx": 0.105, "jitter": 0.25, "stagger": 4}},
        {"asset": "particulas", "z": 8, "opts": {"kind": "notas", "n": 7}}, {"asset": "bokeh", "z": 9, "opts": {"n": 10, "colores": True}}],
        actions=[{"type": "light", "at": "enciende", "target": "velas", "dur": 20}, {"type": "wave", "at": "familia", "target": "f30", "dur": 40}],
        overlays=[{"type": "Calendar", "at": "noche", "month": "DICIEMBRE", "day": 7, "slot": "top"}]),
        beat(2, "Envíaselo a quien enciende contigo la primera vela del año.", "noche_luces", "velas", [
        {"asset": "cielo", "z": 0, "opts": {"astro": "luna", "x": 74, "y": 40, "r": 5}}, {"asset": "estrellas", "z": 1, "opts": {"hasta": 0.4}},
        {"asset": "calle", "z": 2, "opts": {"epoca": "colonial", "guirnalda": True}},
        {"asset": "vela", "id": "velas", "z": 7, "at": [0.5, 0.635], "scale": 0.075, "repeat": {"n": 9, "cols": 9, "dx": 0.105, "jitter": 0.25}},
        {"asset": "particulas", "z": 8, "opts": {"kind": "confeti", "n": 30}}],
        overlays=[{"type": "ShareCTA", "at": "Envíaselo", "text": "Envíaselo a tu familia", "slot": "upper"}], role="cta")],
    "cosmos": [beat(1, "Luego nadan ocho mil kilómetros hasta el otro lado del mapa.", "cosmos", "ninguna", [
        {"asset": "estrellas", "z": 0, "opts": {"hasta": 1, "n": 120}}, {"asset": "particulas", "z": 4, "opts": {"kind": "polvo", "n": 20}},
        {"asset": "mapa_mundo", "id": "mapa", "z": 2, "scale": 1.3, "opts": {"vista": "globo", "centro": [-75, -22], "ruta": [[-62, -64], [-76, -47], [-81, -20], [-78, 3.5]]}}],
        actions=[{"type": "route", "at": "nadan", "target": "mapa", "dur": 60}],
        overlays=[{"type": "StatCallout", "at": "ocho", "value": 8000, "suffix": " km", "slot": "upper"}], camera={"preset": "reveal", "from": [0.45, 0.62, 1.7]})],
    "pergamino": [beat(1, "La noticia viaja de Roma hasta Alejandría en pocas semanas.", "pergamino", "dia", [
        {"asset": "mapa_mundo", "id": "mapa", "z": 1, "scale": 1.3, "opts": {"centro": [20, 38], "zoom": 5.5, "ruta": [[12.5, 41.9], [15.6, 38.2], [23, 35], [29.9, 31.2]], "puntos": [[12.5, 41.9], [29.9, 31.2], [23.7, 38], [35.2, 31.8]]}},
        {"asset": "particulas", "z": 3, "opts": {"kind": "polvo", "n": 30}}, {"asset": "particulas", "id": "lejos", "z": 0, "par": 0.4, "opts": {"kind": "polvo", "n": 20}}],
        actions=[{"type": "route", "at": "viaja", "target": "mapa", "dur": 50}, {"type": "light_points", "at": "Roma", "target": "mapa", "dur": 40}])],
    "marmol": [beat(1, "Platón levanta el dedo y toda la Academia guarda silencio.", "marmol", "dia", [
        {"asset": "cielo", "z": 0, "opts": {"astro": "sol", "x": 50, "y": 62, "r": 6}}, {"asset": "nubes", "z": 1, "opts": {"n": 4, "hasta": 0.4}},
        {"asset": "sala_arcos", "z": 2}, {"asset": "rayos_luz", "z": 3, "opts": {"desde": "izquierda", "n": 4, "a": 0.16}},
        {"asset": "figura", "id": "alumnos", "z": 4, "at": [0.36, 0.61], "scale": 0.17, "repeat": {"n": 6, "cols": 3, "dx": 0.16, "dy": 0.05, "depth": 0.88, "jitter": 0.15}, "opts": {"vario": True, "ropa": "toga", "pose": "sentado", "mira": 0.8}},
        FIG(0.78, 0.6, 0.26, id="platon", ropa="toga", color="wallLit", color2="accent", barba=True, pelo="rizado", peloColor="#B8B0A8", mira=-0.7, gesto="serio"),
        {"asset": "particulas", "z": 8, "opts": {"kind": "polvo", "n": 40}}],
        actions=[{"type": "point", "at": "levanta", "target": "platon", "dur": 20}, {"type": "talk", "at": "Academia", "target": "platon", "dur": 60}])],
    "drama_oscuro": [beat(1, "El rey ve la cabeza de su enemigo y retrocede de espanto.", "claroscuro", "foco", [
        {"asset": "sala_arcos", "z": 1, "opts": {"estilo": "piedra", "cortinas": True}}, {"asset": "niebla", "z": 2, "opts": {"a": 0.3, "y": 0.6}},
        FIG(0.3, 0.61, 0.27, id="soldado", ropa="armadura", tocado="casco", gesto="serio", mira=0.8),
        FIG(0.68, 0.61, 0.27, id="rey", ropa="toga", color="#F2E6D0", color2="accent", tocado="corona", mira=-0.8),
        {"asset": "particulas", "z": 8, "opts": {"kind": "chispas", "n": 26}}],
        actions=[{"type": "fear", "at": "retrocede", "target": "rey", "dur": 16}], lights=[{"at": [0.5, 0.48], "r": 0.34, "a": 0.5, "flicker": True}])],
    "vivo": [beat(1, "Ese domingo la ciudad entera sale a celebrar al campo.", "dia", "dia", [
        {"asset": "cielo", "z": 0, "opts": {"astro": "sol", "x": 76, "y": 40, "r": 7}}, {"asset": "nubes", "z": 1}, {"asset": "colinas", "z": 2},
        {"asset": "figura", "id": "gente", "z": 4, "at": [0.5, 0.56], "scale": 0.13, "repeat": {"n": 12, "cols": 6, "dx": 0.15, "dy": 0.03, "depth": 0.85, "stagger": 2}, "opts": {"vario": True, "ropa": "actual"}},
        FIG(0.3, 0.62, 0.24, id="ella", ropa="vestido", color="#F2583E", pelo="largo", mira=0.5), FIG(0.66, 0.62, 0.25, id="el", ropa="actual", color="#2FA86B", mira=-0.5),
        {"asset": "particulas", "z": 8, "opts": {"kind": "hojas", "n": 14}}],
        overlays=[{"type": "Equivalence", "at": "entera", "count": 3, "icon": "globe", "label": "3 estadios llenos", "text": "200.000 personas", "slot": "top"}],
        actions=[{"type": "cheer", "at": "celebrar", "target": "ella", "dur": 30}, {"type": "cheer", "at": "celebrar", "target": "el", "dur": 30}, {"type": "cheer", "at": "sale", "target": "gente", "dur": 40}])],
}


def main():
    out = Path(sys.argv[1])
    themes = sys.argv[2:] or list(SCENES)
    sheets = []
    for th in themes:
        d = out / th
        d.mkdir(parents=True, exist_ok=True)
        story = {"meta": {"id": f"look-{th}", "lang": "es", "title": th, "engine": "2d", "tailS": 0.5, "pacing": "viral", "captionEmphasis": "accent", "theme": th}, "beats": SCENES[th]}
        (d / "in.json").write_text(json.dumps(story, ensure_ascii=False), encoding="utf-8")
        r = subprocess.run([sys.executable, str(ROOT / "tools" / "gallery2d.py"), str(d), "--story", str(d / "in.json")], capture_output=True, text=True)
        if r.returncode:
            sys.exit(f"{th}: {r.stdout[-800:]}{r.stderr[-1500:]}")
        sheets.append(Image.open(d / "sheet.jpg"))
    h = max(s.height for s in sheets)
    look = Image.new("RGB", (sum(s.width for s in sheets), h))
    x = 0
    for s in sheets:
        look.paste(s, (x, 0))
        x += s.width
    look.save(out / "look.jpg", quality=88)
    print(out / "look.jpg")


if __name__ == "__main__":
    main()
