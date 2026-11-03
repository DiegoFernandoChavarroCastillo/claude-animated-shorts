# Bucle de look-match (plan §9)

Cada ronda: hojas de `tools/qa/lookmatch_sheets.py` (un frame por beat frente a R1 y R3, y una tira temporal frente a
R3), revisadas por un agente verificador distinto con `templates/prompts/verificador.md`. Máximo 4 rondas por fase.

## F8 · Ronda 1 (2 nov) · `hielo-flota`, escala 0,5, tras D58

QA objetivo: estilo 9/9, OCR de subtítulos 100 %, racha estática 30 frames.

| área | nota | motivo |
|---|---|---|
| Subtítulos | 7 | Posición, peso, palabra activa y caja coinciden con R1/R3; el texto cae sobre los marcos y nubes de las ventanillas |
| Color | 6 | En rango, pero 5 de 7 beats comparten el mismo violeta y azul; falta color de acento |
| Luz | 5 | Poca luz direccional, sin contraluz en el vaso ni en el tanque; dorado y atardecer solo se ven dentro de las ventanillas |
| Profundidad | 5 | Suelo y ventanillas tan nítidos como el protagonista; sin niebla en el interior |
| Objeto protagonista | 5 | Vaso casi transparente; el corte del lago parece una caja; las moléculas no muestran la red hexagonal |
| Overlays | 6 | El "9 %" está bien; una línea del suelo tech lo cruza; pocos overlays frente a R3 |
| Cámara | 6 | Deriva suave como R3; alejamiento brusco al empezar b04 (frames 589→604) |
| Ritmo | 4 | 7 beats con 3 decorados y encuadres casi idénticos (col. 1, 2 y 7; col. 5 y 6) |

**Global: 5,5/10.**

Arreglos propuestos (por impacto): 1) moléculas en red hexagonal visible (`heroes/`); 2) corte del lago con hielo
arriba y distinto entre b05 y b06 (`heroes/`); 3) que la luz dorada y la de atardecer lleguen a la escena
(`world/`); 4) encuadres distintos por beat (`camera/`, `envs/`); 5) ventanillas por debajo de la banda de
subtítulos (`envs/interior_neutro.ts`); 6) vaso más legible y algo mayor (`heroes/`, luces); 7) profundidad en el
interior (`world/`, desenfoque); 8) suavizar el salto b03→b04 (`camera/`); 9) apartar la línea tech del "9 %" y
añadir etiquetas de dato (`overlays/`, `envs/`); 10) color de acento por escena (`style.ts`).

No tocar: el sistema de subtítulos, el entorno tech y las métricas de audio y ritmo de voz.

Qué se aplicó: *pendiente de decidir con Diego.*
