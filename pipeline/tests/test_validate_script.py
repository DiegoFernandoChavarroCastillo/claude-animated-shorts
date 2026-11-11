"""Prueba del validador de guion (criterio F6): los guiones de ejemplo pasan y cada guion roto falla SOLO por su
motivo. Sin pytest: python pipeline\\tests\\test_validate_script.py  (código 0 = todo bien)."""
from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import validate_script  # noqa: E402
from validate_script import validate  # noqa: E402

ROOT = HERE.parents[1]
GOOD = [ROOT / "templates/examples/hielo-flota/02_SCRIPT.md", ROOT / "templates/examples/cielo-azul/02_SCRIPT.md",
        ROOT / "templates/examples/hielo-flota-en/02_SCRIPT.md",
        # una por estructura / tipo de gancho / tipo de cierre (F12)
        ROOT / "templates/examples/agua-rara-lista/02_SCRIPT.md", ROOT / "templates/examples/agua-contra-hielo/02_SCRIPT.md",
        ROOT / "templates/examples/dedos-historia/02_SCRIPT.md", ROOT / "templates/examples/atardecer-cadena/02_SCRIPT.md"]
# guion roto -> fragmento que debe aparecer en el ÚNICO error
BAD = {
    "bad_gancho_sin_tu.md": "no está en 2.ª persona",
    "bad_numero_sin_fuente.md": "número sin fuente: 'trescientos millones'",
    "bad_sin_giro.md": "falta el beat de giro",
    "bad_frase_larga.md": "frase de",
    "bad_ll_seguidas.md": "'calle llena': dos sonidos ll/y seguidos",
}


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def nueva(cadena: str) -> str:
    """atardecer-cadena reescrito con gancho y estructura nuevos (D120)"""
    return (cadena.replace("hook: reto", "hook: viaje_del_foton").replace("structure: cadena", "structure: diario_luz\nbeats: hook > salida > choque > llegada > twist > cta")
            .replace("[tension]", "[salida]").replace("[chain] Todo", "[salida] Todo").replace("[chain] Esa", "[choque] Esa").replace("[chain] Pero", "[choque] Pero")
            .replace("[chain] Por eso", "[llegada] Por eso").replace("[chain] Al", "[llegada] Al").replace("[layer2]", "[llegada]")
            + "\n## Fórmulas nuevas\n- viaje_del_foton: reta a seguir una partícula de luz\n- diario_luz: el viaje de un fotón en tres paradas\n")


def variants() -> dict[str, tuple[str, str]]:
    """guiones rotos a partir de los buenos: nombre -> (texto, fragmento del ÚNICO error esperado)"""
    lista, cadena, hist = read("templates/examples/agua-rara-lista/02_SCRIPT.md"), read("templates/examples/atardecer-cadena/02_SCRIPT.md"), read("templates/examples/dedos-historia/02_SCRIPT.md")
    en = read("templates/examples/hielo-flota-en/02_SCRIPT.md")
    item2 = "[item] Segundo: el hielo pesa novecientos diecisiete gramos por litro, y el agua líquida, mil. Por eso el hielo flota sobre ella.\n"
    return {
        "lista con 2 items": (lista.replace(item2, "").replace("[item] Primero: se expande", "[item] Primero, y esto lo saben muy bien los ingenieros y cualquiera que haya dejado una bebida demasiado tiempo en el congelador: se expande"), "al menos 3 líneas [item]"),
        "rol de otra estructura": (read("templates/examples/hielo-flota/02_SCRIPT.md").replace("[mechanism] La culpa", "[item] La culpa"), "no usa los roles [item]"),
        "estructura desconocida": (lista.replace("structure: lista", "structure: poema"), "estructura desconocida 'poema'"),
        "tipo de gancho desconocido": (lista.replace("hook: dato", "hook: gritar"), "tipo de gancho desconocido 'gritar'"),
        "gancho dato sin cifra": (lista.replace("Al congelarse, el agua de tu botella crece un nueve por ciento.", "Al congelarse, el agua de tu botella crece mucho."), "debe llevar una cifra"),
        "gancho pregunta sin ?": (hist.replace("hook: escena", "hook: pregunta"), "debe ser una pregunta"),
        "gancho reto sin reto": (cadena.replace("Apuesto a que no sabes por qué el atardecer es rojo.", "Te cuento por qué el atardecer es rojo."), "no tiene la forma de 'reto'"),
        "cierre bucle sin gancho": (cadena.replace("Así que cuando veas el próximo atardecer, recuerda que el azul sigue ahí, solo que lejos.", "Y así termina todo lo que quería contarte hoy."), "debe retomar una palabra del gancho"),
        "cierre bucle con despedida": (cadena.replace("Así que cuando veas el próximo atardecer, recuerda que el azul sigue ahí, solo que lejos.", "Gracias por mirar, nos vemos pronto con más cosas del atardecer."), "no puede despedirse"),
        "gancho negativo sin forma": (cadena.replace("hook: reto", "hook: negativo"), "no tiene la forma de 'negativo'"),
        "gancho coste sin forma": (cadena.replace("hook: reto", "hook: coste"), "no tiene la forma de 'coste'"),
        "cierre envia sin enviar": (lista.replace("Envíaselo a quien todavía deja una botella cerrada en el congelador.", "¿Qué otra rareza quieres?"), "no tiene la forma de 'envia'"),
        "cierre sin cta": (hist.replace("Pruébalo esta noche en la ducha y cuéntame qué notas.", "Y así termina la historia de los dedos."), "no tiene la forma de 'reto_casa'"),
        # fórmulas nuevas (D120)
        "estructura nueva sin describir": (nueva(cadena).replace("- diario_luz: el viaje de un fotón en tres paradas\n", ""), "estructura desconocida 'diario_luz'"),
        "gancho nuevo sin describir": (nueva(cadena).replace("- viaje_del_foton: reta a seguir una partícula de luz\n", ""), "tipo de gancho desconocido 'viaje_del_foton'"),
        "estructura nueva sin beats": (nueva(cadena).replace("beats: hook > salida > choque > llegada > twist > cta\n", "").replace("[salida]", "[tension]").replace("[choque]", "[chain]").replace("[llegada]", "[chain]"), "necesita `beats:`"),
        "beats sin twist": (nueva(cadena).replace("> twist >", ">").replace("[twist]", "[llegada]"), "llevar twist"),
        "beats cortos": (nueva(cadena).replace("hook > salida > choque > llegada", "hook > salida").replace("[choque]", "[salida]").replace("[llegada]", "[salida]"), "al menos 5"),
        "rol nuevo sin declarar": (nueva(cadena).replace("[choque] Esa", "[rebote] Esa"), "rol desconocido [rebote]"),
        "rol declarado sin usar": (nueva(cadena).replace("[choque]", "[salida]"), "falta el beat de choque"),
        "orden de beats nuevo roto": (nueva(cadena).replace("[salida] Todo", "[llegada] Todo"), "los beats no siguen el orden hook → salida"),
        "beats con estructura del catálogo": (cadena.replace("structure: cadena", "structure: cadena\nbeats: hook > a > b > twist > cta"), "solo va con una estructura nueva"),
        "gancho revelacion como pregunta": (hist.replace("hook: escena", "hook: revelacion").replace("Estás en la ducha y tus dedos parecen pasas.", "¿Por qué tus dedos parecen pasas en la ducha?"), "afirma el resultado"),
        "orden roto": (cadena.replace("[twist] El cielo rojo no es otro cielo: es el mismo, visto a través de más aire.\n", "").replace("[layer2]", "[twist] El cielo rojo no es otro cielo: es el mismo, visto a través de más aire.\n[layer2]"), "los beats no siguen el orden"),
    }


def main() -> int:
    fails = 0
    # D121: formato YouTube Shorts, 95–160 palabras (35–59 s). Los ejemplos de formato y los guiones rotos tienen otro largo:
    # las pruebas de forma lo ajustan y estas dos comprueban el rango real.
    real = (validate_script.WORDS_MIN, validate_script.WORDS_MAX)
    errs, st = validate(read("templates/examples/hielo-flota/02_SCRIPT.md"))
    ok = not errs
    fails += not ok
    print(f"{'OK ' if ok else 'MAL'} pasa   hielo-flota con el rango real ({st.get('words')} palabras, {real[0]}–{real[1]})" + ("" if ok else f"  {errs}"))
    errs, st = validate(read("templates/examples/bluetooth-wifi/02_SCRIPT.md"))
    ok = any("longitud" in e for e in errs)
    fails += not ok
    print(f"{'OK ' if ok else 'MAL'} falla  guion de {st.get('words')} palabras (> {real[1]}): {[e for e in errs if 'longitud' in e]}")
    validate_script.WORDS_MIN, validate_script.WORDS_MAX = 100, 400
    errs, st = validate(nueva(read("templates/examples/atardecer-cadena/02_SCRIPT.md")))
    ok = not errs and st["beats"][1] == "salida" and set(st["new"]) == {"viaje_del_foton", "diario_luz"}
    fails += not ok
    print(f"{'OK ' if ok else 'MAL'} pasa   gancho y estructura nuevos descritos en '## Fórmulas nuevas' (D120)" + ("" if ok else f"  {errs}"))
    for p in GOOD:
        errs, st = validate(p.read_text(encoding="utf-8"))
        ok = not errs
        fails += not ok
        print(f"{'OK ' if ok else 'MAL'} pasa   {p.relative_to(ROOT)}  ({st.get('lang')}, {st.get('words')} palabras)" + ("" if ok else f"  {errs}"))
    for name, want in BAD.items():
        errs, _ = validate((HERE / "scripts" / name).read_text(encoding="utf-8"))
        ok = len(errs) == 1 and want in errs[0]
        fails += not ok
        print(f"{'OK ' if ok else 'MAL'} falla  {name}: {errs}")
    for name, (text, want) in variants().items():
        errs, _ = validate(text)
        ok = len(errs) == 1 and want in errs[0]
        fails += not ok
        print(f"{'OK ' if ok else 'MAL'} falla  {name}: {errs}")
    # inglés: ganchos y cierres con su forma
    en = read("templates/examples/hielo-flota-en/02_SCRIPT.md")
    hook_en = [l for l in en.splitlines() if l.startswith("[hook]")][0]
    for tipo, hook, ok_want in (("mito", "Were you told the sky is blue because it reflects the ocean?", True), ("reto", "Bet you can't explain why your ice floats.", True),
                                ("reto", "Here is why your ice floats.", False), ("y_si", "What if ice sank in your glass?", True), ("dato", "Your water bottle grows nine percent when it freezes.", True)):
        errs, _ = validate(en.replace(hook_en, "[hook] " + hook).replace("lang: en", f"lang: en\nhook: {tipo}"))
        hook_errs = [e for e in errs if "forma de" in e or "cifra" in e]
        ok = (not hook_errs) == ok_want
        fails += not ok
        print(f"{'OK ' if ok else 'MAL'} en gancho {tipo} {'pasa' if ok_want else 'falla'}: {hook_errs}")
    print("TODO BIEN" if not fails else f"{fails} PRUEBAS MAL")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
