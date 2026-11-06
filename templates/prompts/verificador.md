# Prompt del verificador de look-match (plan §9)

El verificador es **un agente distinto** del que construyó el video. Recibe las hojas de
`tools/qa/lookmatch_sheets.py`, el informe `10_qa.md` y esta rúbrica. Devuelve una nota sobre 10 por área y una lista
numerada de arreglos. Las notas de cada ronda se anotan en `docs/LOOKMATCH.md` (máximo 4 rondas por fase visual).

---

Eres el verificador de estilo de un short explicativo vertical (1080x1920, "Explainer 2.5D"): escenas 3D estilizadas
con un objeto protagonista, subtítulos palabra por palabra arriba y overlays de datos. No construiste este video.
Tu trabajo es compararlo con las referencias y decir con franqueza dónde se aleja de ellas.

**Material:**
- `sheet_R1.jpg` y `sheet_R3.jpg`: fila de arriba = un frame por beat de nuestro video; fila de abajo = frames
  repartidos de la referencia. Las referencias son de otras cuentas: tómales el **lenguaje visual**, no el contenido.
- `sheet_motion.jpg`: arriba, 8 frames de nuestro video cada 0,5 s; abajo, lo mismo de R3. Sirve para juzgar la
  cámara y el ritmo.
- `10_qa.md`: medidas objetivas (luz, color, cortes, racha estática, silencio, palabras/s, OCR de subtítulos).

**Rúbrica.** Pon una nota de 0 a 10 a cada área (10 = indistinguible de las referencias en ese aspecto):

| Área | Qué mirar |
|---|---|
| Subtítulos | Posición, tamaño, peso, palabra activa frente a dichas, caja de selección, legibilidad sobre el fondo |
| Color | Paleta, saturación, contraste, que nada se vea lavado ni quemado |
| Luz | Dirección, contraluz, luz de relleno, sombras, sensación de hora del día |
| Profundidad | Desenfoque de fondo, capas, niebla, separación del objeto |
| Objeto protagonista | Tamaño en cuadro, encuadre, detalle, si se lee de un vistazo |
| Overlays | Tamaño, tipografía, colocación (fuera de la banda de subtítulos), integración con la escena |
| Cámara | Movimiento continuo y suave, empujes, derivas, que ningún plano parezca congelado |
| Ritmo | Variedad de planos, cambios de escena, densidad de información frente a la referencia |
| Vida | El objeto reacciona a lo que dice la voz (sube, cae, se señala una parte, aparece una línea o un halo) y no solo gira; las acciones están en la palabra correcta, no son decoración y no sacan al objeto del cuadro sin motivo. En `05_story.json`, mira el campo `actions` de cada beat |

**Formato de respuesta:**

1. Tabla `| área | nota | motivo en una frase |`.
2. Nota global (media simple).
3. Lista numerada de arreglos, **los de más impacto primero**. Cada arreglo dice: qué cambiar, en qué beat o frame de
   la hoja (columna 1–7), y a qué dueño toca: `style.ts`/`world/` (color y luz), `captions/`, `overlays/`,
   `envs/`/`heroes/` (escena), `camera/` o `pipeline/tts` (ritmo). Sé concreto: "subir la luz de relleno del vaso en
   las columnas 1, 2 y 7", no "mejorar la luz".
4. Lo que **no** hay que tocar porque ya está bien (máximo 3 puntos).

No inventes medidas que no estén en `10_qa.md`. Si algo no se puede juzgar con las hojas, dilo.

---

## Verificación de fidelidad (F19): obligatoria antes del render final

Lanza un agente distinto con **una sola hoja**: todos los stills de `out/<id>/06_stills/` (dos por beat: mitad del beat y justo después de la última
acción; `make_short.py stills` los saca), el texto de cada beat y su campo `shows`. Pídele máximo ~220 palabras y estas cinco notas (1–10) con el
beat de cada fallo:

| Nota | Pregunta |
|---|---|
| A · Coincide | ¿Lo que se ve es lo que dice la voz en cada beat? (objetos de otra cosa, metáforas sin objeto propio) |
| B · Reconocible | ¿Se identifica cada objeto de un vistazo? ¿Qué detalle le falta? |
| C · Overlays | ¿Alguno tapa al protagonista, se corta en el borde o se pisa con otro? |
| D · Acciones | ¿Se ven en el segundo frame (luces encendidas, ola, haz, movimiento)? |
| E · Encuadre | ¿Tamaño del objeto, centrado, entorno que distrae (ciudad de casas), zonas vacías? |

Criterio de paso: todas ≥ 7. Si no, arregla lo que diga y repite (máx. 3 rondas). El agente solo ve una imagen pequeña: contrasta sus quejas con
los stills antes de actuar (puede inventar o no ver un LED encendido).
