"""Fórmula de retención de las historias 2D (D123): sección `## Ángulo`, gancho en pregunta con paradoja, estructura `enigma`
y cierre `remate_cta` en validate_script.py (python pipeline/tests/test_angulo.py)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from validate_script import concrete_question, validate  # noqa: E402

# guion de prueba (no es un video publicado): una curiosidad contada como enigma
MD = """# Ballenas
lang: es
hook: paradoja
structure: enigma
closing: remate_cta
pacing: viral

## Ángulo
- pregunta: ¿por qué una ballena cruza medio planeta hacia un mar donde no hay nada que comer?
- en_juego: meses de ayuno y la vida de la cría
- cifras: ocho mil kilómetros = una línea que cruza el mapa de punta a punta
- climax: el mapa entero con la ruta encendida de la Antártida a Colombia
- remate: Colombia no es su comedor. Es su sala de partos.
- compartir: orgullo de lugar y asombro; se le manda a quien ama el mar

## Guion
[hook] ¿Por qué una ballena nada ocho mil kilómetros sin comer?
[conflicto] La ballena jorobada vive en la Antártida. Allí el agua helada rebosa de comida.
[conflicto] Pasa el verano entero tragando krill. Engorda sin parar, capa sobre capa.
[conflicto] Y entonces hace algo absurdo. Deja el banquete atrás y nada hacia el norte.
[pista] Viaja ocho mil kilómetros por el Pacífico. Bordea toda Suramérica sin detenerse.
[pista] En todo ese camino casi no prueba bocado. Vive de la grasa que guardó.
[pista] Al final la espera el mar de Colombia. Tibio, tranquilo y sin su comida.
[pista] Parece un error enorme. Cambiar un mar repleto por uno vacío.
[pista] Pero mira bien quién nada a su lado. Una cría recién nacida, pegada a ella.
[pista] La cría nace sin grasa suficiente. En el hielo del sur moriría de frío.
[climax] Por eso miles de ballenas repiten la misma ruta cada temporada. De punta a punta del mapa.
[climax] Llegan flacas, agotadas, y aun así se quedan. Aquí el agua tibia cuida a su cría.
[twist] La madre no vino a comer. Vino a que su cría pudiera vivir.
[twist] Colombia no es su comedor. Es su sala de partos.
[cta] Envíaselo a quien todavía cree que vienen a comer.

## Fuentes
- ocho mil kilómetros de migración de la ballena jorobada entre la Antártida y el Pacífico colombiano: https://example.org/migracion y https://example.org/jorobadas
"""
fails = 0


def check(name, ok, extra=""):
    global fails
    print("OK " if ok else "MAL", name, "" if ok else extra)
    fails += not ok


errs, stats = validate(MD)
check("enigma con pregunta-paradoja, ángulo y remate_cta pasa", not errs and stats.get("structure") == "enigma", errs)
check("el ángulo llega a las estadísticas (lo lee el crítico)", stats.get("angle", {}).get("remate", "").startswith("Colombia"))

# gancho en pregunta
check("pregunta con cifra es concreta", concrete_question("¿Por qué una ballena nada ocho mil kilómetros?", "es"))
check("pregunta con nombre propio es concreta", concrete_question("¿Sabías que la ciclovía se inventó en Colombia?", "es"))
check("pregunta con contraste es concreta", concrete_question("¿Sabías que un equipo pidió que su rival fuera campeón sin jugar?", "es"))
check("pregunta vacía no es concreta", not concrete_question("¿Qué hacen las ballenas durante el invierno?", "es"))
errs = validate(MD.replace("[hook] ¿Por qué una ballena nada ocho mil kilómetros sin comer?", "[hook] ¿Qué hacen las ballenas durante el invierno?"))[0]
check("gancho en pregunta sin nada concreto falla", any("nada concreto" in e for e in errs), errs)
errs = validate(MD.replace("[hook] ¿Por qué una ballena", "[hook] ¿Alguna vez te has preguntado por qué una ballena"))[0]
check("la apertura suave sigue prohibida aunque sea pregunta", any("introducción suave" in e for e in errs), errs)

# ángulo
no_angle = MD[:MD.index("## Ángulo")] + MD[MD.index("## Guion"):]
check("historia viral sin `## Ángulo` falla", any("## Ángulo" in e for e in validate(no_angle)[0]))
errs = validate(MD.replace("- climax: el mapa entero con la ruta encendida de la Antártida a Colombia\n", ""))[0]
check("ángulo sin `climax` falla", any("'- climax: …'" in e for e in errs), errs)
errs = validate(MD.replace("- remate: Colombia no es su comedor. Es su sala de partos.", "- remate: El viaje más largo empieza con hambre."))[0]
check("remate que no se dice en el giro falla", any("remate del ángulo" in e for e in errs), errs)

# estructura enigma
errs = validate("\n".join(l for l in MD.splitlines() if not l.startswith("[climax]")))[0]
check("enigma sin clímax falla", any("[climax]" in e for e in errs), errs)
lines = MD.splitlines()
tw = [l for l in lines if l.startswith("[twist]")]
rest = [l for l in lines if not l.startswith("[twist]")]
k = next(i for i, l in enumerate(rest) if l.startswith("[pista]"))
errs = validate("\n".join(rest[:k] + tw + rest[k:]))[0]
check("el remate antes de las pistas falla (la pregunta se cierra tarde)", any("orden" in e for e in errs), errs)

# cierre remate_cta
errs = validate(MD.replace("[cta] Envíaselo a quien todavía cree que vienen a comer.", "[cta] Y así termina el viaje más largo del mar."))[0]
check("remate_cta sin invitación falla", any("llamada a la acción" in e or "remate_cta" in e for e in errs), errs)
long_cta = "[cta] Envíaselo a quien todavía cree que vienen a comer, a tu familia, a tus amigos."
errs = validate(MD.replace("[cta] Envíaselo a quien todavía cree que vienen a comer.", long_cta))[0]
check("remate_cta con invitación larga falla", any("es corta" in e for e in errs), errs)
errs = validate(MD.replace("closing: remate_cta", "closing: envia"))[0]
check("el perfil viral solo admite bucle o remate_cta", any("remate_cta" in e and "exige" in e for e in errs), errs)
print("\nTODO BIEN" if not fails else f"\n{fails} MAL")
sys.exit(1 if fails else 0)
