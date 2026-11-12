- Análisis Avanzado y Detallado de Videos IA (Instrucciones para Claude)

# 1. La Fórmula Maestra: Patrón General y Estilo Compartido {#la-fórmula-maestra-patrón-general-y-estilo-compartido}

Al analizar la colección completa de videos, es evidente que todos siguen una arquitectura de retención de audiencia estrictamente calculada. Claude debe programar plantillas que sigan este \"esqueleto\" narrativo y visual:

## Estructura del Guion (Storytelling de Retención)

- **El Hook de Curiosidad (0-5s):** Invariablemente, todos los videos inician con una pregunta en pantalla (\"¿Por qué\...\", \"¿Sabías que\...\"). El texto es masivo, centrado y aparece de forma sincronizada (palabra por palabra). Nunca hay introducciones lentas ni saludos.

- **Contexto / Conflicto (5-20s):** Se plantea un escenario ilógico o un problema (Ej. Ballenas nadando 8500 km sin comer; avión volando sin combustible; Bogotá ahogada en humo en 1974).

- **Metáforas Visuales y Cuantificación (20-40s):** El estilo se niega a dar datos abstractos. Todo se visualiza. Si se habla de 11.000 kg, aparecen dos elefantes; si se habla de 71 muertos, aparece un contador subiendo y 71 velas encendiéndose; si se habla del tamaño de una cría, se compara con un modelo 3D de un carro.

- **El Clímax Visual (40-50s):** Un momento de expansión donde la cámara suele alejarse (zoom out) para mostrar un mapa del mundo (viajes de ballenas, expansión de la ciclovía a 200 ciudades) o una vista panorámica (estadio completo iluminado).

- **Call to Action (CTA) Integrado y Gamificado (50s - Fin):** El CTA nunca es un fondo negro estático. Se utilizan simulaciones de interfaces de usuario (UI). Vemos avatares redondos uniendo caras de amigos, chats falsos de WhatsApp escribiéndose solos, lluvia de confeti y punteros de ratón interactuando con los botones de \"Seguir\" y \"Compartir\", todo superpuesto en el escenario temático del video.

## Dirección de Arte (Estética y Componentes)

- **Estética \"Flat 2.5D\":** Uso de vectores planos sin texturas realistas, pero iluminados con gradientes suaves y ubicados en un entorno 3D (Cámaras ortográficas o isométricas) para generar paralaje (Parallax).

- **Kinetic Typography:** Fuente Sans-serif gruesa (ej. Montserrat, Poppins). Cada palabra brilla, escala, cambia de color o recibe un *bounding box* (caja de contorno) en el milisegundo exacto en que la voz la pronuncia.

- **Data-Binding Visual:** Elementos que reaccionan a los datos del guion. Termómetros para los grados, medidores analógicos para el combustible, relojes digitales avanzando horas en segundos, calendarios arrancando hojas.

# 2. Análisis Detallado por Video {#análisis-detallado-por-video}

## A. Video 1: Las Ballenas Jorobadas (01:02) {#a.-video-1-las-ballenas-jorobadas-0102}

### Desglose Narrativo:

- **Gancho:** \"¿Por qué las ballenas viajan desde la Antártida hasta Colombia?\"

- **Desarrollo:** Contraste extremo. Antártida (Comida) vs Colombia (Nada). Viaje de 8.500 km representado en un mapa del mundo con una línea de ruta brillante.

- **Clímax:** Metáforas visuales (grasa quemada = 2 elefantes, tamaño = 1 carro, temperatura = agua tibia de ducha).

- **Cierre:** \"Colombia no es su restaurante, es su sala de partos\".

### Detalles Técnicos para Claude (Implementación):

- **Parallax Submarino:** Implementar múltiples capas de Z-index. Rayos de luz estáticos en el fondo, krill (usando un algoritmo de bandada/Boids) en el medio, y las ballenas articuladas en primer plano.

- **Transiciones Geográficas:** Un globo terráqueo interactivo (Three.js SphereGeometry) con interpolación de puntos geodésicos dibujando una línea de trayectoria emisiva (Glow).

## B. Video 2: Chapecoense (01:10) {#b.-video-2-chapecoense-0110}

### Desglose Narrativo:

- **Gancho:** \"¿Sabías que un equipo pidió que su rival fuera campeón sin jugar?\"

- **Desarrollo:** Viaje de Bolivia a Medellín. Animación de un medidor de combustible (Fuel Low). Accidente sutil mostrando la caída en las montañas (uso de neblina paramétrica).

- **Clímax:** El estadio iluminado con decenas de miles de velas. El contador numérico sincronizado (1 a 71).

- **Cierre:** El mapa de Colombia compuesto de luces abrazando a Chapecoense.

### Detalles Técnicos para Claude (Implementación):

- **Instanciación Masiva (InstancedMesh):** El estadio lleno de velas requiere optimización extrema en WebGL. Claude debe usar instanciamiento para renderizar miles de mallas cilíndricas idénticas con diferentes posiciones y un material emisivo variante.

- **Librería de UI Falsa:** Creación de componentes modulares para el CTA que animen avatares apareciendo en círculos, simulando la interfaz nativa de compartir de Instagram/TikTok.

## C. Video 3: Día de las Velitas (00:59) {#c.-video-3-día-de-las-velitas-0059}

### Desglose Narrativo:

- **Gancho:** Calendario dinámico pasando rápidamente hasta el \"7 de Diciembre\".

- **Desarrollo:** Salto temporal histórico a 1854 en Roma. Uso de paletas oscuras/sepia contrastadas con luces para denotar el pasado.

- **Clímax:** Regreso al presente, encendido simultáneo de cuadras enteras con familias minimalistas.

- **Cierre:** CTA que simula unirse a un grupo de WhatsApp escribiendo la palabra \"GRUPO\".

### Detalles Técnicos para Claude (Implementación):

- **Sistemas de Iluminación Global Dinámica:** Animaciones de atardecer a noche manipulando la luz ambiente (AmbientLight) y encendiendo fuentes de luz puntuales (PointLights) cerca de cada vela para teñir los edificios cercanos.

- **Motor de Simulación UI (Smart UI):** Claude debe programar un parser que reciba \[{user: \"yo\", msg: \"GRUPO\", typing: true}, {user: \"bot\", msg: \"Te uniste al grupo\"}\] y lo convierta automáticamente en animaciones de burbujas de chat subiendo con sonido de teclado.

## D. Video 4: La Ciclovía (00:55) {#d.-video-4-la-ciclovía-0055}

### **Desglose Narrativo:**

- **Gancho:** \"¿Sabías que la ciclovía se inventó en Colombia?\"

- **Desarrollo:** Conflicto visual del smog y tráfico en 1974. La manifestación del pedal y el bloqueo de carros durante 3 horas (reloj digital acelerado de 11:57 a 12:00).

- **Clímax:** La ciudad vaciándose de carros (siendo expulsados de la vía hacia arriba) y llenándose de ciclistas. El mapa mundial iluminando más de 200 ciudades.

- **Cierre:** Animación de la cámara moviéndose en primera persona (POV) en bicicleta por la calle vacía de autos.

### **Detalles Técnicos para Claude (Implementación):**

- **Motor de Físicas 2D:** Implementar Matter.js o Rapier.js. Cuando los ciclistas invaden la vía, los modelos de carros deben recibir un \"impulso\" físico para ser expulsados con gravedad hacia los lados, dando un toque cómico y gamificado.

- **SVG Path Tracing y Mapas Urbanos:** Generar grillas estilo \"SimCity\" usando texturas tileables y animar trazados SVG (stroke-dashoffset) para simular los 140km de calles bloqueadas, iluminando las arterias principales progresivamente.

- **Instanciación de Multitudes (Crowd Rendering):** Renderizado de docenas de bicicletas moviéndose simultáneamente usando InstancedMesh (en Three.js) para duplicar la misma geometría con variaciones de color de camiseta, sin saturar la memoria.

# 3. Recomendaciones Arquitectónicas para la Herramienta CLI de Claude {#recomendaciones-arquitectónicas-para-la-herramienta-cli-de-claude}

Para que tu skill de línea de comandos replique esta magia procedimental, exige a Claude lo siguiente:

- **ParticleSystem.tsx:** Una clase global para manejar emisiones de partículas (krill, palomas, hojas de calendario, chispas).

- **AnimatedData.tsx:** Un motor que tome variables numéricas y genere relojes (11:57 -\> 12:00), distancias (0 -\> 8.500km), o contadores de bajas (71), sincronizados con la línea de tiempo de Remotion.

- **SmartCaptions.tsx:** Un componente avanzado que consuma el JSON de tiempos de ElevenLabs o tu motor TTS, mapeando no solo el texto, sino dibujando rectángulos dinámicos y cambiando colores con animaciones fluidas tipo resorte (spring animations).

- **UIMocker.tsx:** Colección de componentes que simulen teclados de Android/iOS escribiendo solos, notificaciones push, y chats flotantes, para usar exclusivamente en los CTA de los últimos 10 segundos.
