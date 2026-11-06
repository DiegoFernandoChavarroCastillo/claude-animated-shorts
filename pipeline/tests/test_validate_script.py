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
        "orden roto": (cadena.replace("[twist] El cielo rojo no es otro cielo: es el mismo, visto a través de más aire.\n", "").replace("[layer2]", "[twist] El cielo rojo no es otro cielo: es el mismo, visto a través de más aire.\n[layer2]"), "los beats no siguen el orden"),
    }


def main() -> int:
    fails = 0
    # F14: el rango de palabras es de 60–120 s (175–300). Los ejemplos (55–62 s) y los guiones rotos tienen otro largo:
    # las pruebas de forma lo ajustan y una prueba aparte comprueba el rango real.
    real = (validate_script.WORDS_MIN, validate_script.WORDS_MAX)
    short = read("templates/examples/hielo-flota/02_SCRIPT.md")
    errs, st = validate(short)
    ok = any("longitud" in e for e in errs)
    fails += not ok
    print(f"{'OK ' if ok else 'MAL'} falla  guion de {st.get('words')} palabras (< {real[0]}): {[e for e in errs if 'longitud' in e]}")
    cur = read("templates/examples/bluetooth-wifi/02_SCRIPT.md")
    errs, st = validate(cur)
    ok = not errs
    fails += not ok
    print(f"{'OK ' if ok else 'MAL'} pasa   ejemplo vigente bluetooth-wifi con el rango real ({st.get('words')} palabras, 175–300)" + ("" if ok else f"  {errs}"))
    validate_script.WORDS_MIN, validate_script.WORDS_MAX = 100, 400
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
