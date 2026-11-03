"""Prueba de la entonación de pregunta (D61): qué frases reciben el final ascendente.
Sin pytest: python pipeline/tests/test_prosody.py  (código 0 = todo bien)."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tts.prosody import is_yes_no_question  # noqa: E402

CASES = [
    ("¿Te has preguntado por qué flota el hielo, si es agua sólida?", "es", True),
    ("Es un mito. ¿Lo sabías?", "es", True),
    ("¿Qué otro \"porque sí\" quieres que desmonte?", "es", False),
    ("¿Y por qué no es violeta, si el violeta se dispersa todavía más?", "es", False),
    ("¿Cuánto pesa un litro de hielo?", "es", False),
    ("Con el agua pasa justo lo contrario.", "es", False),
    ("Have you ever wondered why ice floats, if it's just solid water?", "en", True),
    ("What other weird thing about water should I explain next?", "en", False),
    ("And why isn't it violet?", "en", False),
]


def main() -> int:
    bad = 0
    for text, lang, want in CASES:
        got = is_yes_no_question(text, lang)
        bad += got != want
        print(f"{'OK ' if got == want else 'MAL'} {'sube ' if got else 'igual'} {text}")
    print("TODO BIEN" if not bad else f"{bad} PRUEBAS MAL")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
