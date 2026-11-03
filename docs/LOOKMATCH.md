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

Qué se aplicó (decidido con Diego): los arreglos del sistema y los encuadres del ejemplo. Las moléculas, el lago y el
color de acento quedan para F10.

## F8 · Ronda 2 · **6,0/10**

Aplicado: ventanillas más bajas y menores; sala teñida por la hora y luz de ventana como contraluz; niebla 12–60 m;
planeo de 50 frames entre beats del mismo decorado y empuje limitado a ×2,4 por beat; vaso con borde Fresnel, hielo
opaco y encuadre mayor; velo tras el "9 %"; b02 en órbita, b06 en deriva y b07 en glide.

Notas: subtítulos 8 · color 7 · luz 6 · profundidad 5 · protagonista 6 · overlays 6 · cámara 5 · ritmo 5.
Regresión: racha estática de 86 frames (al final de b05, donde el tanque liso llena el cuadro).

## F8 · Ronda 3 · **6,3/10**

Aplicado: deriva de base de hasta ±110 px en beats largos; ventanillas separadas hacia los lados; b05 más ámbar;
velo del "9 %" más opaco; órbita de b02 a 45° y b07 con `zoom_through`. Racha: 51 frames (b04).

Notas: subtítulos 8 · color 7 · luz 6 · profundidad 5 · protagonista 6 · overlays 7 · cámara 6 · ritmo 5.

## F8 · Ronda 4 (final) · **6,8/10**

Aplicado: tope de escala del empuje ×2,6 (b04 deja de estar recortado) y giro algo más rápido del cúmulo; mancha de
luz con el color de la hora en la pared y degradado vertical; en `dorado` la sala usa el oro de la luz principal (su
horizonte es marino). QA completo **OK**: estilo 9/9, OCR 100 %, racha 41 frames (≤45).

| área | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Subtítulos | 7 | 8 | 8 | 8 |
| Color | 6 | 7 | 7 | 8 |
| Luz | 5 | 6 | 6 | 7 |
| Profundidad | 5 | 5 | 5 | 6 |
| Objeto protagonista | 5 | 6 | 6 | 6 |
| Overlays | 6 | 6 | 7 | 7 |
| Cámara | 6 | 5 | 6 | 6 |
| Ritmo | 4 | 5 | 5 | 6 |
| **Global** | **5,5** | **6,0** | **6,3** | **6,8** |

Ninguna área por debajo de 5. **Bloqueantes para F10** según el verificador: moléculas en red hexagonal visible y
corte del lago con el hielo flotando (la imagen no muestra lo que dice la narración). Mejoras no bloqueantes: b07
termina en el mismo encuadre que b01; movimiento poco visible dentro de b04; mancha de luz de noche más fuerte;
profundidad en el suelo; color de acento y más etiquetas de dato.
