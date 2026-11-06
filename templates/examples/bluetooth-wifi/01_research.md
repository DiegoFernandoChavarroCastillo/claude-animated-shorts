# Investigación: ¿Cómo funciona el bluetooth frente al wifi?

Tema: comparar bluetooth y wifi (versus). Lo visible: ondas de radio, un router, un teléfono, canales que saltan, una autopista de datos.
Nota: las fuentes son blogs técnicos, apuntes de curso y notas de aplicación; ninguna es la norma IEEE 802.11 ni la especificación del Bluetooth SIG.

## Hechos con ≥2 fuentes

1. **Los dos usan la misma banda de 2,4 GHz** (el wifi además usa 5 GHz).
   - https://telecomtrainer.com/frequency-of-wifi-and-bluetooth
   - https://www.savemyexams.co.uk/igcse/ict/cie/23/revision-notes/2-networks/2-1-networks/wi-fi-and-bluetooth/
   - https://blog.zositech.com/bluetooth-vs-2-4ghz/?amp=1
2. **Bluetooth salta entre 79 canales de 1 MHz, hasta 1600 veces por segundo** (salto de frecuencia); la secuencia la marca el reloj del dispositivo principal.
   - https://www.telecomtrainer.com/frequency-of-bluetooth-and-wifi/
   - https://dejazzer.com/coen4720_old/lecture_notes/lec08_bluetooth.pdf
   - https://rfessentials.com/resources/rf-glossary/frequency-hopping/
3. **Un canal wifi de 2,4 GHz mide unos 20 MHz de ancho** (22 MHz en el wifi antiguo); por eso solo caben tres canales que no se pisan: 1, 6 y 11.
   - https://notes.networklessons.com/wireless-wi-fi-24ghz-frequency-band-and-channels
   - https://www.purple.ai/guides/how-to-fix-wifi-channel-overlap
   - https://blog.spacehuhn.com/wifi-channels-explained
4. **Velocidad:** el wifi 6 llega a 9,6 gigabits por segundo en teoría; el bluetooth 5 llega a 2 megabits por segundo (modo LE 2M). Son máximos teóricos.
   - https://www.delock.com/infothek/Wifi_Bluetooth/wifi-bluetooth_e.html
   - https://seller.alibaba.com/blogs/2026/southeast-asia/consumer-electronics/bluetooth-5-vs-wifi-6-connectivity-guide-alibaba-b2b
5. **Energía:** el bluetooth gasta mucho menos que el wifi (envía poco y cerca; el wifi mueve mucho más y más lejos). Sin cifra.
   - https://seller.alibaba.com/blogs/2026/southeast-asia/consumer-electronics/bluetooth-5-vs-wifi-6-connectivity-guide-alibaba-b2b
   - https://blog.usro.net/2024/10/bluetooth-vs-wi-fi/
6. **Comparten banda y pueden estorbarse; el bluetooth se defiende con salto de frecuencia adaptativo**, que deja de usar los canales ocupados por el wifi.
   - https://scdn.rohde-schwarz.com/ur/pws/dl_downloads/dl_application/application_notes/1c108/1C108_0e_Bluetooth_BR_EDR_AFH.pdf
   - https://ch.mathworks.com/help/bluetooth/ug/end-to-end-bluetooth-br-edr-phy-simulation-with-wlan-interference-and-adaptive-frequency-hopping.html

## Datos que NO se usan (las fuentes se contradicen)
- Alcance exacto del bluetooth (10 m, 30 m, 100 m o 200 m según la fuente y la clase): solo se dice «corto alcance» sin número.
- Número de canales wifi en 2,4 GHz (11 o 14 según la región).
