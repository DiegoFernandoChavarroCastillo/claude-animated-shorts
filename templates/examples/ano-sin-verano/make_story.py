"""Genera 05_story.json de ano-sin-verano (piloto D123: enigma, remate_cta, tema drama_oscuro con vivo de segundo).
python out/ano-sin-verano/make_story.py"""
import json
from pathlib import Path

D = Path(__file__).resolve().parent
lines = [l for l in (D / "02_SCRIPT.md").read_text(encoding="utf-8").split("## Guion")[1].split("## ")[0].splitlines() if l.startswith("[")]
TXT = [(l[1:l.index("]")], l[l.index("]") + 2:]) for l in lines]


def L(asset, id, z=0, at=None, scale=None, opts=None, init=None, **kw):
    d = {"asset": asset, "id": id, "z": z}
    if at: d["at"] = at
    if scale: d["scale"] = scale
    if opts: d["opts"] = opts
    if init: d["init"] = init
    d.update(kw)
    return d


def cam(preset, f, t):
    return {"preset": preset, "from": f, "to": t}


def A(type, at, target=None, dur=None, **kw):
    d = {"type": type, "at": at}
    if target: d["target"] = target
    if dur: d["dur"] = dur
    d.update(kw)
    return d


def shot(at, preset, f, t):
    return {"at": at, "camera": cam(preset, f, t)}


def FIG(id, x, y, s, z=5, **o):
    return L("figura", id, z, [x, y], s, opts=o)


SC = lambda pal, light, layers, camera, lights=None: {"palette": pal, "light": light, "layers": layers, "camera": camera, **({"lights": lights} if lights else {})}
NIEVE = lambda id="nieve", z=8, n=60: L("particulas", id, z, opts={"kind": "nieve", "n": n})
LLUVIA = lambda id="lluvia", z=8, n=110: L("particulas", id, z, opts={"kind": "lluvia", "n": n})
SALA = [L("sala_arcos", "sala", 1, opts={"estilo": "piedra", "cortinas": True}), L("particulas", "lluvia_fuera", 0, par=0.3, opts={"kind": "lluvia", "n": 80})]
VELAS = L("vela", "velas", 6, [0.5, 0.635], 0.06, repeat={"n": 5, "cols": 5, "dx": 0.2, "jitter": 0.3})
CANDLE_LIGHTS = [{"at": [0.5, 0.56], "r": 0.55, "a": 0.6, "color": "#FFB060", "flicker": True}, {"at": [0.15, 0.6], "r": 0.25, "a": 0.5, "color": "#FFB060", "flicker": True}]

B = [
    # b01 hook: la granja nevada de noche, en junio
    dict(shows="una granja de madera de Nueva Inglaterra cubierta de nieve en plena noche mientras sigue nevando; el humo sale de la chimenea",
         keywords=["junio,", "nevó", "verano?"],
         scene=SC("noche", "luna", [L("cielo", "cielo", 0, opts={"astro": "luna", "x": 74, "y": 30, "r": 5}), L("niebla", "niebla", 1, opts={"y": 0.55, "a": 0.35}),
                                     L("cabana", "casa", 3, [0.5, 0.6], 0.95, opts={"nieve": True}), NIEVE("nieve_fondo", 2, 40), NIEVE()],
                  cam("push_in", [0.5, 0.48, 1.05], [0.5, 0.46, 1.22])),
         actions=[A("pop", "En", "casa", 14, scale=1.04), A("tremble", "apagó", "casa", 18, amp=3)]),
    # b02 el maíz asoma en un junio normal
    dict(shows="campos verdes de Nueva Inglaterra a pleno sol con brotes de maíz recién nacidos en los surcos",
         keywords=["junio,", "Inglaterra.", "maíz"],
         scene=SC("dia", "dia", [L("cielo", "cielo", 0, opts={"astro": "sol", "x": 74, "y": 36, "r": 7}), L("nubes", "nubes", 1), L("colinas", "colinas", 2),
                                  L("campo_maiz", "campo", 3, [0.5, 0.6], 1.15), FIG("granjero", 0.12, 0.6, 0.2, ropa="actual", color="#7A4A2A", color2="#3A3A4A", tocado="sombrero", barba=True, mira=0.6),
                                  L("particulas", "polen", 8, opts={"kind": "polvo", "n": 30})],
                  cam("pan_slow", [0.5, 0.4, 1.1], [0.5, 0.52, 1.18])),
         actions=[A("appear", "maíz", "campo", 18), A("walk", "Es", "granjero", 70), A("slide", "Es", "granjero", 70, dx=0.22)],
         overlays=[{"type": "Pill", "at": "Inglaterra.", "text": "NUEVA INGLATERRA", "slot": "top"}]),
    # b03 el granjero abre la puerta
    dict(shows="por la mañana un granjero abre la puerta de su granja y se lleva las manos a la cara al ver todo nevado",
         keywords=["granjero", "puerta", "helado."],
         scene=SC("dia", "dia", [L("cielo", "cielo", 0, opts={"astro": "ninguno"}), L("cabana", "casa", 2, [0.5, 0.6], 0.95, opts={"nieve": True}),
                                  FIG("granjero", 0.62, 0.62, 0.22, ropa="actual", color="#7A4A2A", color2="#3A3A4A", tocado="sombrero", barba=True, mira=-0.4),
                                  NIEVE(n=45)],
                  cam("push_in", [0.52, 0.5, 1.1], [0.58, 0.5, 1.45])),
         actions=[A("open", "abre", "casa", 18), A("appear", "granjero", "granjero", 12), A("fear", "helado.", "granjero", 14)],
         shots=[shot("Pisa", "pan_slow", [0.62, 0.46, 1.7], [0.62, 0.6, 2.1])]),
    # b04 todo blanco
    dict(shows="el campo de maíz se cubre de escarcha y nieve en pleno verano; una hoja de calendario marca junio",
         keywords=["blanco.", "nevando", "verano."],
         scene=SC("dia", "dia", [L("cielo", "cielo", 0, opts={"astro": "sol", "x": 70, "y": 40, "r": 5}), L("colinas", "colinas", 1, opts={"verde": False}),
                                  L("campo_maiz", "campo", 3, [0.5, 0.6], 1.15), NIEVE(n=80)],
                  cam("pull_out", [0.5, 0.56, 1.3], [0.5, 0.5, 1.08])),
         actions=[A("freeze", "blanco.", "campo", 40)],
         overlays=[{"type": "Calendar", "at": "nevando", "month": "JUNIO", "day": 6, "from": 1, "year": "1816", "slot": "top"}]),
    # b05 la helada vuelve cada mes
    dict(shows="de noche la helada quema los brotes de maíz; las hojas del calendario pasan a julio",
         keywords=["helada", "brotes.", "siguiente."],
         scene=SC("noche", "luna", [L("cielo", "cielo", 0, opts={"astro": "luna", "x": 30, "y": 34, "r": 5}), L("estrellas", "estrellas", 1, opts={"hasta": 0.35}),
                                    L("campo_maiz", "campo", 3, [0.5, 0.6], 1.15), L("niebla", "niebla", 6, opts={"y": 0.6, "a": 0.4})],
                  cam("push_in", [0.5, 0.56, 1.1], [0.5, 0.6, 1.4])),
         actions=[A("freeze", "quema", "campo", 30)],
         overlays=[{"type": "Calendar", "at": "siguiente.", "month": "JULIO", "day": 8, "from": 1, "year": "1816", "slot": "top"}]),
    # b06 Europa: lluvia sin fin
    dict(shows="un pueblo europeo de piedra bajo una lluvia que no para; charcos y niebla en la calle",
         keywords=["Europa", "llueve", "semanas.", "pudre"],
         scene=SC("noche", "luna", [L("calle", "pueblo", 1, opts={"epoca": "antigua", "luces": 0.25}), L("niebla", "niebla", 2, opts={"y": 0.6, "a": 0.4}),
                                    LLUVIA("lluvia_lejos", 0, 60), LLUVIA()],
                  cam("pan_slow", [0.4, 0.48, 1.15], [0.6, 0.5, 1.2])),
         actions=[A("lights_on", "semanas.", "pueblo", 30)],
         overlays=[{"type": "Pill", "at": "Europa", "text": "EUROPA, 1816", "slot": "top"}],
         shots=[shot("pudre", "push_in", [0.5, 0.56, 1.3], [0.5, 0.6, 1.45])]),
    # b07 motín del pan
    dict(shows="frente a una panadería vacía una multitud enfadada levanta los brazos y grita pan o sangre",
         keywords=["panadería", "multitud", "sangre!"],
         scene=SC("claroscuro", "fuego", [L("calle", "pueblo", 1, opts={"epoca": "antigua", "luces": 0.4}),
                                          L("figura", "multitud", 4, [0.5, 0.6], 0.16, opts={"vario": True, "ropa": "tunica", "gesto": "enojado", "pose": "senala"},
                                            repeat={"n": 14, "cols": 7, "dx": 0.13, "dy": 0.035, "depth": 0.86, "stagger": 2}),
                                          L("particulas", "chispas", 8, opts={"kind": "chispas", "n": 20})],
                  cam("push_in", [0.5, 0.52, 1.1], [0.5, 0.5, 1.3]),
                  lights=[{"at": [0.2, 0.5], "r": 0.25, "a": 0.5, "flicker": True}, {"at": [0.82, 0.48], "r": 0.25, "a": 0.5, "flicker": True}]),
         actions=[A("appear", "multitud", "multitud", 16), A("cheer", "grita", "multitud", 30), A("camshake", "sangre!", amp=8)],
         overlays=[{"type": "Pill", "at": "sangre!", "text": "¡PAN O SANGRE!", "slot": "top"}]),
    # b08 atardeceres rojos
    dict(shows="un atardecer rojo intenso sobre las colinas, con nubes en bandas; el sol baja como una brasa",
         keywords=["causa.", "cielo", "rojos", "brasas."],
         scene=SC("atardecer", "atardecer", [L("cielo", "cielo", 0, opts={"astro": "sol", "x": 50, "y": 70, "r": 10}), L("nubes", "nubes", 1, opts={"tipo": "franja", "n": 7, "hasta": 0.55}),
                                              L("colinas", "colinas", 2, opts={"verde": False, "arboles": 4}), FIG("mira", 0.36, 0.61, 0.2, ropa="actual", color="#3A2A3A", mira=0.6, gesto="sorpresa", tocado="sombrero"),
                                              L("particulas", "polvo", 8, opts={"kind": "polvo", "n": 30})],
                  cam("push_in", [0.36, 0.47, 1.9], [0.36, 0.47, 2.1])),
         actions=[A("set", "brasas.", "cielo", 40), A("turn", "cielo", "mira", 14)],
         shots=[shot("cielo", "pan_slow", [0.4, 0.42, 1.6], [0.5, 0.36, 1.4]), shot("como", "pull_out", [0.5, 0.38, 1.4], [0.5, 0.45, 1.05])]),
    # b09 el Tambora revienta
    dict(shows="en Indonesia el volcán Tambora revienta de noche: una columna de ceniza con rayos y lava por las laderas",
         keywords=["Indonesia,", "Tambora.", "erupción"],
         scene=SC("noche", "fuego", [L("estrellas", "estrellas", 0, opts={"hasta": 0.5}), L("volcan", "volcan", 1),
                                     L("particulas", "ceniza", 8, opts={"kind": "chispas", "n": 30})],
                  cam("push_in", [0.52, 0.5, 1.05], [0.52, 0.44, 1.25])),
         actions=[A("erupt", "reventó", "volcan", 60), A("camshake", "Tambora.", amp=12)],
         overlays=[{"type": "Pill", "at": "Indonesia,", "text": "TAMBORA, ABRIL 1815", "slot": "top"}]),
    # b10 la columna: 43 km
    dict(shows="la columna de ceniza del Tambora sube más alta que las nubes; un contador marca cuarenta y tres kilómetros",
         keywords=["columna", "cuarenta", "nubes."],
         scene=SC("noche", "fuego", [L("estrellas", "estrellas", 0, opts={"hasta": 0.6}), L("volcan", "volcan", 1, init={"erupt": 1}),
                                     L("nubes", "nubes", 3, opts={"n": 4, "hasta": 0.55}), L("particulas", "ceniza", 8, opts={"kind": "chispas", "n": 30})],
                  cam("reveal", [0.52, 0.18, 2.0], [0.52, 0.45, 1.0])),
         overlays=[{"type": "Equivalence", "at": "cuarenta", "count": 5, "icon": "mountain", "label": "casi 5 Everest", "text": "43 km de altura", "slot": "center"}],
         actions=[A("tremble", "subió", "volcan", 20, amp=2)],
         shots=[shot("kilómetros,", "pan_slow", [0.52, 0.45, 1.1], [0.52, 0.26, 1.35]), shot("nubes.", "pull_out", [0.52, 0.3, 1.3], [0.52, 0.45, 1.0])]),
    # b11 clímax: el velo da la vuelta al mundo
    dict(shows="la Tierra vista desde el espacio: un velo de azufre nace en Indonesia, se extiende alrededor del planeta y lo oscurece",
         keywords=["velo", "azufre", "mundo.", "meses."],
         scene=SC("noche", "ninguna", [L("estrellas", "estrellas", 0, opts={"hasta": 1, "n": 120}),
                                       L("mapa_mundo", "globo", 2, scale=1.3, opts={"vista": "globo", "centro": [62, 22], "origen": [118, -8.2], "puntos": [[118, -8.2], [6.1, 46.2], [-1.5, 52.5], [2.3, 48.9]]}),
                                       L("particulas", "polvo", 8, opts={"kind": "polvo", "n": 18})],
                  cam("reveal", [0.5, 0.55, 1.8], [0.5, 0.5, 1.0])),
         actions=[A("light_points", "Un", "globo", 12), A("veil", "velo", "globo", 70)],
         shots=[shot("mundo.", "push_in", [0.5, 0.5, 1.0], [0.48, 0.42, 1.25])]),
    # b12 Villa Diodati: encerrados por la lluvia
    dict(shows="en una villa de piedra junto al lago de Ginebra, de noche y con lluvia tras los arcos, Lord Byron y sus amigos encerrados a la luz de las velas",
         keywords=["lluvia", "Suiza.", "Byron", "lago."],
         scene=SC("claroscuro", "velas", [*SALA, VELAS,
                                          FIG("percy", 0.3, 0.6, 0.18, ropa="actual", color="#2A3A5A", color2="#1A1A2A", pelo="rizado", mira=0.5),
                                          FIG("mary", 0.46, 0.6, 0.17, ropa="vestido", color="#4A3A6A", pelo="largo", mira=0.6),
                                          FIG("polidori", 0.58, 0.6, 0.17, ropa="actual", color="#3A2A2A", color2="#1A1A1A", mira=0.6),
                                          FIG("byron", 0.78, 0.6, 0.2, ropa="actual", color="#1A1A2A", color2="#7A1A1A", pelo="rizado", mira=-0.7, gesto="serio"),
                                          L("particulas", "polvo", 9, opts={"kind": "polvo", "n": 24})],
                  cam("push_in", [0.5, 0.5, 1.05], [0.52, 0.48, 1.25]), CANDLE_LIGHTS),
         shots=[shot("Suiza.", "push_in", [0.5, 0.3, 1.6], [0.5, 0.3, 1.75]), shot("encerrados", "push_in", [0.62, 0.46, 1.35], [0.66, 0.44, 1.5])],
         actions=[A("appear", "Byron", "byron", 12), A("appear", "amigos", "percy", 12), A("sit", "encerrados", "polidori", 16)],
         overlays=[{"type": "Pill", "at": "Suiza.", "text": "VILLA DIODATI, 1816", "slot": "top"}]),
    # b13 el reto de Byron
    dict(shows="Byron, aburrido, señala a sus amigos a la luz de las velas y los reta a escribir una historia de fantasmas",
         keywords=["Aburrido,", "reta:", "fantasmas."],
         scene=SC("claroscuro", "velas", [*SALA, VELAS,
                                          FIG("percy", 0.3, 0.6, 0.18, ropa="actual", color="#2A3A5A", color2="#1A1A2A", pelo="rizado", mira=0.5),
                                          FIG("mary", 0.46, 0.6, 0.17, ropa="vestido", color="#4A3A6A", pelo="largo", mira=0.6),
                                          FIG("polidori", 0.58, 0.6, 0.17, ropa="actual", color="#3A2A2A", color2="#1A1A1A", mira=0.6),
                                          FIG("byron", 0.78, 0.6, 0.2, ropa="actual", color="#1A1A2A", color2="#7A1A1A", pelo="rizado", mira=-0.7, gesto="serio"),
                                          L("particulas", "polvo", 9, opts={"kind": "polvo", "n": 24})],
                  cam("push_in", [0.5, 0.5, 1.05], [0.5, 0.5, 1.15]), CANDLE_LIGHTS),
         actions=[A("point", "reta:", "byron", 16), A("talk", "escribirá", "byron", 50), A("nod", "fantasmas.", "mary", 20)],
         shots=[shot("Aburrido,", "push_in", [0.66, 0.46, 1.4], [0.7, 0.44, 1.55]), shot("cada", "pan_slow", [0.7, 0.44, 1.5], [0.4, 0.46, 1.35])]),
    # b13 Mary imagina al monstruo
    dict(shows="Mary Shelley, de dieciocho años, piensa a la luz de una vela; una noche ve en la oscuridad a un estudiante arrodillado junto a un cadáver que empieza a moverse",
         keywords=["Mary", "idea.", "desvelada,", "cadáver"],
         scene=SC("claroscuro", "velas", [*SALA, L("criatura", "criatura", 3, [0.76, 0.6], 0.36),
                                          FIG("mary", 0.3, 0.61, 0.26, z=5, ropa="vestido", color="#4A3A6A", pelo="largo", pose="piensa", mira=0.3, gesto="serio"),
                                          {**FIG("estudiante", 0.56, 0.62, 0.24, z=4, ropa="actual", color="#2A2A3A", pelo="corto", mira=0.7, gesto="sorpresa"), "init": {"sit": 1, "bow": 0.6}},
                                          L("vela", "vela", 6, [0.2, 0.625], 0.09), L("niebla", "niebla", 7, opts={"y": 0.62, "a": 0.3})],
                  cam("push_in", [0.4, 0.46, 1.25], [0.38, 0.44, 1.45]), [{"at": [0.2, 0.5], "r": 0.35, "a": 0.55, "flicker": True}]),
         actions=[A("appear", "estudiante", "estudiante", 14), A("appear", "cadáver", "criatura", 20), A("wake", "mueve.", "criatura", 30)],
         overlays=[{"type": "Pill", "at": "Shelley,", "text": "MARY SHELLEY, 18 AÑOS", "slot": "top"}],
         shots=[shot("idea.", "push_in", [0.3, 0.4, 1.9], [0.3, 0.38, 2.2]), shot("estudiante", "pull_out", [0.6, 0.45, 1.7], [0.56, 0.48, 1.15])]),
    # b14 remate
    dict(shows="la criatura de Frankenstein despierta en la oscuridad: le brillan los ojos, levanta la mano y un relámpago la recorta; el título FRANKENSTEIN",
         keywords=["cosecha.", "Frankenstein."],
         scene=SC("claroscuro", "foco", [L("sala_arcos", "sala", 1, opts={"estilo": "piedra"}), L("criatura", "criatura", 3, [0.5, 0.61], 0.5),
                                         L("niebla", "niebla", 5, opts={"y": 0.62, "a": 0.45}), L("particulas", "polvo", 8, opts={"kind": "polvo", "n": 24})],
                  cam("push_in", [0.5, 0.45, 1.1], [0.5, 0.36, 1.4]), [{"at": [0.5, 0.35], "r": 0.4, "a": 0.4}]),
         actions=[A("wake", "Hubo", "criatura", 40), A("flash", "Frankenstein."), A("camshake", "Frankenstein.", amp=8)],
         overlays=[{"type": "TitlePlaque", "at": "Frankenstein.", "title": "FRANKENSTEIN", "subtitle": "Mary Shelley · 1818", "slot": "center"}]),
    # b15 CTA
    dict(shows="la criatura sigue en pie entre la niebla mientras aparece la invitación a compartir con avatares, botones Seguir y Compartir y confeti",
         keywords=["Envíaselo", "terror."],
         scene=SC("claroscuro", "foco", [L("sala_arcos", "sala", 1, opts={"estilo": "piedra"}), L("criatura", "criatura", 3, [0.5, 0.6], 0.36, init={"wake": 1}),
                                         L("niebla", "niebla", 5, opts={"y": 0.62, "a": 0.45}), L("particulas", "polvo", 8, opts={"kind": "polvo", "n": 24})],
                  cam("pull_out", [0.5, 0.4, 1.35], [0.5, 0.48, 1.1])),
         actions=[A("tremble", "terror.", "criatura", 14, amp=2)],
         overlays=[{"type": "ShareCTA", "at": "Envíaselo", "text": "¿Sabías de dónde salió Frankenstein?", "slot": "center"}]),
]

assert len(B) == len(TXT), (len(B), len(TXT))
old = json.loads((D / "05_story.json").read_text(encoding="utf-8"))
meta = {**old["meta"], "title": "El año sin verano: de la nieve en junio a Frankenstein", "hookTitle": "1816: nieve en junio", "topic": "1816"}
beats = []
for i, ((role, text), b) in enumerate(zip(TXT, B)):
    beats.append({"id": f"b{i + 1:02d}", "role": role, "text": text, **b, "overlays": b.get("overlays", []), "actions": b.get("actions", []),
                  "shots": b.get("shots", []), "transition": "swipe" if i in (8, 10) else "cut" if i in (5, 11) else "crossfade"})
(D / "05_story.json").write_text(json.dumps({"meta": meta, "beats": beats}, ensure_ascii=False, indent=1), encoding="utf-8")
print("05_story.json:", len(beats), "beats")
