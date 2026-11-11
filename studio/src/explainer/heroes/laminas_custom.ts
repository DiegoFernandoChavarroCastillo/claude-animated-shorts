// Dioramas 2.5D (clase "lamina") creados para videos concretos: como custom.ts, pero con láminas pintadas (heroes/laminas.ts).
import * as THREE from "three";
import type { HeroDef } from "./types";
import { poseOf } from "./types";
import { buildLaminas, drawSeated, fillPath, vgrad } from "./laminas";

const ease = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
const pop = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x < 1 ? ease(x) * (1 + 0.25 * Math.sin(Math.PI * x)) : 1; };

/** pared con ventana a una meseta del desierto a mediodía (Los Álamos, 1950) */
const drawPared = (g: CanvasRenderingContext2D) => {
  g.fillStyle = vgrad(g, 0, 900, "#8C7A6A", "#5E4C42"); g.fillRect(0, 0, 1400, 900);
  for (let x = 0; x < 1400; x += 70) { g.fillStyle = x % 140 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)"; g.fillRect(x, 0, 70, 640); } // troncos de la pared (lodge)
  g.fillStyle = vgrad(g, 640, 900, "#4F3926", "#3A2A1E"); g.fillRect(0, 640, 1400, 260);                                                  // zócalo de madera
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, 636, 1400, 10);
  // ventana: cielo, mesetas rojizas, pinos y marco con travesaños
  const wx = 300, wy = 120, ww = 800, wh = 440;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  g.fillStyle = vgrad(g, wy, wy + wh, "#6F8DB0", "#D9B78E"); g.fillRect(wx, wy, ww, wh);
  fillPath(g, `M${wx} ${wy + 300} L${wx + 120} ${wy + 300} L${wx + 150} ${wy + 250} L${wx + 380} ${wy + 245} L${wx + 410} ${wy + 290} L${wx + 560} ${wy + 285} L${wx + 590} ${wy + 230} L${wx + 760} ${wy + 228} L${wx + ww} ${wy + 280} L${wx + ww} ${wy + wh} L${wx} ${wy + wh} Z`, vgrad(g, wy + 220, wy + wh, "#C98A5E", "#8A5238"));
  fillPath(g, `M${wx} ${wy + 360} C${wx + 200} ${wy + 340} ${wx + 500} ${wy + 370} ${wx + ww} ${wy + 350} L${wx + ww} ${wy + wh} L${wx} ${wy + wh} Z`, "#6E7A4A");
  for (let i = 0; i < 22; i++) { const x = wx + 10 + i * 37 + (i % 3) * 7, h = 50 + ((i * 37) % 40); fillPath(g, `M${x} ${wy + wh} L${x + 13} ${wy + wh - h} L${x + 26} ${wy + wh} Z`, "#2F3A2A"); }
  g.restore();
  g.strokeStyle = "#E9E3C8"; g.lineWidth = 16; g.strokeRect(wx, wy, ww, wh);
  g.lineWidth = 9; g.beginPath(); g.moveTo(wx + ww / 3, wy); g.lineTo(wx + ww / 3, wy + wh); g.moveTo(wx + (2 * ww) / 3, wy); g.lineTo(wx + (2 * ww) / 3, wy + wh); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke();
  g.fillStyle = "#3A2A1E"; g.fillRect(wx - 30, wy + wh + 8, ww + 60, 22);                                                                   // alféizar
};

/** mesa de comedor de frente: mantel, platos, tazas, vasos y pan (borde superior a 0,6 m) */
const drawMesa = (g: CanvasRenderingContext2D) => {
  fillPath(g, "M40 170 L1260 170 L1240 420 L60 420 Z", vgrad(g, 170, 420, "#E9E3C8", "#B9AE92"));
  for (let x = 110; x < 1240; x += 110) fillPath(g, `M${x} 200 C${x + 8} 300 ${x - 6} 360 ${x + 4} 420 L${x + 16} 420 C${x + 6} 360 ${x + 20} 300 ${x + 12} 200 Z`, "rgba(80,60,50,0.12)");
  fillPath(g, "M20 140 L1280 140 L1260 176 L40 176 Z", "#F3EEDB"); fillPath(g, "M40 172 L1260 172 L1260 180 L40 180 Z", "rgba(60,40,30,0.25)");
  const plate = (x: number) => { g.beginPath(); g.ellipse(x, 150, 74, 16, 0, 0, Math.PI * 2); g.fillStyle = "#FFFFFF"; g.fill(); g.beginPath(); g.ellipse(x, 150, 50, 10, 0, 0, Math.PI * 2); g.fillStyle = "#E3DCCB"; g.fill(); };
  const cup = (x: number) => { fillPath(g, `M${x - 22} 106 L${x + 22} 106 L${x + 18} 146 L${x - 18} 146 Z`, "#F6F2E6"); g.beginPath(); g.ellipse(x, 106, 22, 6, 0, 0, Math.PI * 2); g.fillStyle = "#5A3A26"; g.fill(); g.strokeStyle = "#F6F2E6"; g.lineWidth = 6; g.beginPath(); g.arc(x + 26, 124, 10, -1.2, 1.2); g.stroke(); };
  const glass = (x: number) => { fillPath(g, `M${x - 14} 84 L${x + 14} 84 L${x + 11} 146 L${x - 11} 146 Z`, "rgba(200,225,240,0.55)", "rgba(255,255,255,0.7)", 2); fillPath(g, `M${x - 12} 112 L${x + 12} 112 L${x + 11} 146 L${x - 11} 146 Z`, "rgba(170,205,230,0.6)"); };
  [230, 520, 800, 1080].forEach((x, i) => { plate(x); i % 2 ? cup(x + 110) : glass(x + 100); });
  fillPath(g, "M600 140 C600 112 690 104 708 130 C716 142 700 150 650 150 Z", "#C98A4E"); fillPath(g, "M622 128 L630 120 M650 122 L658 116", "none", "#8A5A30", 3); // pan
  fillPath(g, "M930 120 L940 70 L948 120 Z", "#E9E3C8"); g.beginPath(); g.ellipse(939, 66, 6, 9, 0, 0, Math.PI * 2); g.fillStyle = "#FFD27A"; g.fill(); // vela de sobremesa
};

/** antebrazo levantado de Fermi: hombro en el centro del borde inferior, la mano arriba con el índice */
const drawBrazo = (g: CanvasRenderingContext2D) => {
  fillPath(g, "M84 200 C76 160 80 130 96 104 L118 112 C108 136 106 166 116 200 Z", "#2A3350");
  fillPath(g, "M96 108 C100 80 104 54 110 34 L130 38 C126 60 122 86 118 112 Z", "#2A3350");
  fillPath(g, "M106 40 C104 26 112 14 124 16 C134 18 136 30 132 40 Z", "#E2B48C");
  fillPath(g, "M122 18 L126 -2 L132 -1 L130 20 Z", "#E2B48C");
  fillPath(g, "M100 44 L134 44 L134 52 L100 52 Z", "#E9E3C8");
};

/** bocadillo de pensamiento con un ? que brilla (lámina con luz propia) */
const drawBocadillo = (g: CanvasRenderingContext2D) => {
  const gr = g.createRadialGradient(150, 110, 10, 150, 110, 150); gr.addColorStop(0, "rgba(255,226,160,0.55)"); gr.addColorStop(1, "rgba(255,226,160,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 300, 260);
  g.beginPath(); g.ellipse(150, 105, 100, 80, 0, 0, Math.PI * 2); g.fillStyle = "rgba(255,248,232,0.95)"; g.fill();
  [[70, 200, 18], [44, 236, 10]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = "#C2552E"; g.font = "bold 120px serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", 150, 112);
};

export const comida_fermi: HeroDef = {
  kind: "lamina",
  when: "La comida de 1950 en Los Álamos en la que Enrico Fermi preguntó «¿dónde está todo el mundo?»: cuatro científicos sentados a una mesa junto a una ventana al desierto; anécdota histórica, una pregunta en una conversación, almuerzo entre colegas.",
  poses: ["mesa"],
  actions: {
    pregunta: "Fermi levanta la mano y le aparece encima un bocadillo con un «?» que brilla: pregunta, se pregunta, ¿dónde están?, lo resumió.",
    charla: "Los comensales se inclinan hacia el centro de la mesa como en plena conversación: hablaban, discutían, comentaban.",
  },
  center: [-0.35, 0.85, -0.3], radius: 1.1,
  anchors: { hero: [-0.35, 0.85, -0.3], top: [0, 1.6, -0.4], base: [0, 0.05, 0], fermi: [-1.15, 0.95, -0.45], pregunta: [-1.0, 1.5, -0.4], mesa: [0, 0.6, 0.05], ventana: [0, 2.0, -1.6] },
  build: (_L, pose) => {
    poseOf(comida_fermi, pose, "comida_fermi");
    const seatW = 380, seatH = 520, hM = 1.45;
    const L = buildLaminas([
      { name: "pared", w: 1400, h: 900, heightM: 4.6, pos: [0, -0.6, -1.6], face: 0.12, draw: drawPared },
      { name: "luz", w: 800, h: 440, heightM: 2.3, pos: [0, 0.3, -1.57], face: 0.12, glow: true, draw: (g) => { const gr = g.createRadialGradient(400, 220, 20, 400, 220, 420); gr.addColorStop(0, "rgba(255,236,190,0.35)"); gr.addColorStop(1, "rgba(255,236,190,0)"); g.fillStyle = gr; g.fillRect(0, 0, 800, 440); } },
      { name: "der", w: 760, h: seatH, heightM: hM, pos: [0.8, 0, -0.45], contact: 1.7, draw: (g) => {
        drawSeated(g, 260, 380, 1, { suit: "#5B5E70", skin: "#E8BE98", hair: "#2A2220", tie: "#7A2E2E", flip: true });
        drawSeated(g, 560, 380, 1, { suit: "#4A4A3A", skin: "#DDB08A", hair: "#6A5A48", tie: "#2E4A7A", flip: true, bald: 0.3 });
      } },
      { name: "teller", w: seatW, h: seatH, heightM: hM, pos: [-0.42, 0, -0.45], contact: 0.9, draw: (g) => drawSeated(g, 150, 380, 1, { suit: "#4F3926", skin: "#E2B48C", hair: "#1E1A1A", tie: "#C2552E" }) },
      { name: "fermi", w: seatW, h: seatH, heightM: hM, pos: [-1.2, 0, -0.45], contact: 0.9, draw: (g) => drawSeated(g, 150, 380, 1, { suit: "#2A3350", skin: "#E2B48C", hair: "#3A302A", tie: "#B98A3A", bald: 0.6, arm: false }) },
      { name: "brazo", w: 200, h: 200, heightM: 0.56, pos: [-1.284, 0.76, -0.43], face: 0.35, draw: drawBrazo },
      { name: "mesa", w: 1300, h: 420, heightM: 1.0, pos: [0, 0, 0.05], face: 0.2, contact: 3.2, draw: drawMesa },
      { name: "bocadillo", w: 300, h: 260, heightM: 0.6, pos: [-0.95, 1.12, -0.4], face: 0.8, unlit: true, draw: drawBocadillo },
    ]);
    const st = { pregunta: 0, charla: 0 }, arm = L.parts.brazo.children[0] as THREE.Mesh;
    let lf = 0;
    const paint = (f: number) => {
      const q = st.pregunta, c = ease(st.charla);
      arm.rotation.z = -1.75 + 1.5 * ease(q / 0.6);
      const s = Math.max(0.0001, pop((q - 0.25) / 0.6)); L.parts.bocadillo.scale.setScalar(s);
      L.parts.bocadillo.position.y = 1.12 + 0.03 * Math.sin(f * 0.08) * s;
      // respiración leve de cada comensal (escala en y) e inclinación hacia la mesa al conversar
      (["der", "teller", "fermi"] as const).forEach((n, i) => {
        const m = L.parts[n].children[0];
        m.scale.y = 1 + 0.006 * Math.sin(f * 0.09 + i * 1.7);
        m.rotation.z = (n === "der" ? 1 : -1) * 0.05 * c * (1 + 0.3 * Math.sin(f * 0.12 + i));
      });
    };
    return {
      root: L.root, dispose: L.dispose,
      update: (f, cam) => { lf = f; L.face(cam); paint(f); },
      act: (name, u) => { if (name in st) st[name as keyof typeof st] = u; paint(lf); },
    };
  },
};

// ---------------------------------------------------------------- mensaje_casa (mudanza-planeta)
/** cielo de un planeta de enana roja: degradado, un sol rojo enorme y montes lejanos */
const drawCieloRojo = (g: CanvasRenderingContext2D) => {
  g.fillStyle = vgrad(g, 0, 900, "#3A1430", "#C8603A"); g.fillRect(0, 0, 1400, 900);
  const gr = g.createRadialGradient(980, 330, 40, 980, 330, 420); gr.addColorStop(0, "rgba(255,200,150,0.95)"); gr.addColorStop(0.35, "rgba(255,90,50,0.85)"); gr.addColorStop(1, "rgba(255,60,40,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 1400, 900);
  g.beginPath(); g.arc(980, 330, 190, 0, Math.PI * 2); g.fillStyle = "#FF6A3E"; g.fill();
  for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(900 + ((i * 53) % 170), 230 + ((i * 37) % 200), 22, 12, i, 0, Math.PI * 2); g.fillStyle = "rgba(170,30,20,0.25)"; g.fill(); }
  for (let i = 0; i < 70; i++) { g.beginPath(); g.arc((i * 211) % 1400, (i * 97) % 380, 1.6, 0, Math.PI * 2); g.fillStyle = "rgba(255,240,230,0.6)"; g.fill(); }
  fillPath(g, "M0 640 L160 560 L300 610 L470 520 L640 600 L800 540 L980 610 L1150 550 L1400 620 L1400 900 L0 900 Z", "#6A2A2A");
  fillPath(g, "M0 720 L220 660 L420 700 L700 650 L960 710 L1200 670 L1400 720 L1400 900 L0 900 Z", "#4A1E24");
};
/** cápsula de aterrizaje con la escotilla abierta y luz dentro */
const drawCapsula = (g: CanvasRenderingContext2D) => {
  fillPath(g, "M80 560 L130 140 C150 70 350 70 370 140 L420 560 Z", vgrad(g, 80, 560, "#D9DCE6", "#8A90A2"));
  fillPath(g, "M80 560 L130 140 C140 110 170 92 200 84 L170 560 Z", "rgba(255,120,80,0.22)");
  fillPath(g, "M175 300 L325 300 L335 520 L165 520 Z", "#FFE6B0");
  fillPath(g, "M175 300 L325 300 L335 520 L165 520 Z", "none", "#4A5068", 8);
  fillPath(g, "M335 300 L420 280 L428 500 L340 520 Z", "#B8BCC9", "#4A5068", 5);
  [[60, 560, 20, 620], [440, 560, 480, 620]].forEach(([x1, y1, x2, y2]) => fillPath(g, `M${x1} ${y1} L${x2} ${y2} L${x2 + 14} ${y2} L${x1 + 14} ${y1} Z`, "#5A6078"));
  g.beginPath(); g.arc(250, 190, 34, 0, Math.PI * 2); g.fillStyle = "#3A4A70"; g.fill(); g.strokeStyle = "#4A5068"; g.lineWidth = 8; g.stroke();
};
/** astronauta de pie, de tres cuartos, con el teléfono en alto (mano derecha) */
const drawAstronauta = (g: CanvasRenderingContext2D) => {
  const suit = "#EEF0F5", sh = "#B9BECB", dark = "#3A3F55";
  fillPath(g, "M120 520 L132 380 L162 380 L168 520 Z", suit); fillPath(g, "M178 520 L184 380 L214 380 L222 520 Z", suit);
  fillPath(g, "M112 520 L172 520 L172 540 L108 540 Z", dark); fillPath(g, "M176 520 L230 520 L234 540 L176 540 Z", dark);
  fillPath(g, "M110 390 C100 300 110 230 170 214 C230 230 240 300 228 390 Z", suit);
  fillPath(g, "M110 390 C100 300 110 230 170 214 L160 390 Z", sh);
  fillPath(g, "M140 270 L200 270 L200 320 L140 320 Z", "#C9CEDA"); [150, 166, 182].forEach((x, i) => { g.beginPath(); g.arc(x, 295, 5, 0, Math.PI * 2); g.fillStyle = ["#D9444E", "#4AC4FF", "#7BD88F"][i]; g.fill(); });
  fillPath(g, "M106 240 C80 280 76 330 92 380 L116 372 C108 330 112 290 128 256 Z", suit);
  fillPath(g, "M220 236 C250 210 262 170 258 120 L236 116 C236 160 226 196 204 222 Z", suit);
  g.save(); g.translate(246, 96); g.rotate(-0.15); fillPath(g, "M-16 -42 L16 -42 L18 30 L-14 30 Z", "#1A1E30"); fillPath(g, "M-12 -36 L12 -36 L13 22 L-10 22 Z", "#7FE0FF"); g.restore();
  g.beginPath(); g.arc(170, 168, 62, 0, Math.PI * 2); g.fillStyle = suit; g.fill();
  g.beginPath(); g.ellipse(184, 168, 44, 36, 0, 0, Math.PI * 2); g.fillStyle = vgrad(g, 130, 205, "#FFB07A", "#5A2A40"); g.fill();
  g.beginPath(); g.ellipse(170, 156, 16, 8, -0.5, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.6)"; g.fill();
  fillPath(g, "M120 372 C140 384 200 384 222 372", "none", sh, 4);
  fillPath(g, "M58 250 L106 240 L110 360 L62 368 Z", "#C9CEDA", dark, 4);
};
/** bocadillo de mensaje con «Llegué bien ✓» (luz propia) */
const drawMensaje = (g: CanvasRenderingContext2D) => {
  const gr = g.createRadialGradient(260, 110, 10, 260, 110, 260); gr.addColorStop(0, "rgba(120,220,255,0.45)"); gr.addColorStop(1, "rgba(120,220,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 520, 260);
  g.fillStyle = "rgba(245,252,255,0.97)"; g.beginPath(); g.roundRect(40, 40, 440, 130, 40); g.fill();
  fillPath(g, "M110 166 L90 220 L160 168 Z", "rgba(245,252,255,0.97)");
  g.fillStyle = "#1A2240"; g.font = "800 60px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("Llegué bien", 240, 106);
  g.strokeStyle = "#2FB36A"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(410, 104); g.lineTo(428, 124); g.lineTo(458, 86); g.stroke();
};
/** sala de estar de noche: pared, ventana con la ciudad, cuadro y lámpara */
const drawSala = (g: CanvasRenderingContext2D) => {
  g.fillStyle = vgrad(g, 0, 900, "#4A3F5E", "#2A2238"); g.fillRect(0, 0, 1400, 900);
  for (let x = 0; x < 1400; x += 90) { g.fillStyle = x % 180 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"; g.fillRect(x, 0, 90, 660); }
  const wx = 820, wy = 140, ww = 420, wh = 360;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); g.fillStyle = vgrad(g, wy, wy + wh, "#0E1438", "#2A2A5A"); g.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(wx + ((i * 97) % ww), wy + ((i * 53) % 180), 1.6, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.7)"; g.fill(); }
  for (let i = 0; i < 9; i++) { const x = wx + i * 48, h = 80 + ((i * 41) % 120); g.fillStyle = "#151A3A"; g.fillRect(x, wy + wh - h, 44, h); for (let k = 0; k < 6; k++) if ((i + k) % 3) { g.fillStyle = "rgba(255,210,120,0.75)"; g.fillRect(x + 8 + (k % 2) * 18, wy + wh - h + 12 + Math.floor(k / 2) * 22, 8, 10); } }
  g.restore(); g.strokeStyle = "#D9D2C0"; g.lineWidth = 14; g.strokeRect(wx, wy, ww, wh); g.lineWidth = 7; g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
  // cuadro con la foto de alguien joven con casco (el que se fue) y calendario
  g.fillStyle = "#6B4A32"; g.fillRect(250, 170, 230, 280); g.fillStyle = "#9FB8D8"; g.fillRect(268, 188, 194, 244);
  g.beginPath(); g.arc(365, 290, 52, 0, Math.PI * 2); g.fillStyle = "#EEF0F5"; g.fill(); g.beginPath(); g.ellipse(372, 290, 36, 30, 0, 0, Math.PI * 2); g.fillStyle = "#E2B48C"; g.fill();
  fillPath(g, "M300 432 C310 370 420 370 430 432 Z", "#EEF0F5");
  g.fillStyle = "#3A2A1E"; g.fillRect(0, 640, 1400, 260);
  const lg = g.createRadialGradient(120, 260, 10, 120, 260, 300); lg.addColorStop(0, "rgba(255,214,140,0.55)"); lg.addColorStop(1, "rgba(255,214,140,0)"); g.fillStyle = lg; g.fillRect(0, 0, 500, 640);
  fillPath(g, "M80 640 L110 300 L130 300 L160 640 Z", "#2A2030"); fillPath(g, "M60 300 L180 300 L150 220 L90 220 Z", "#E8C890");
};
/** sofá de frente con dos ancianos sentados mirando el teléfono (de perfil, uno hacia el otro) */
const drawSofa = (g: CanvasRenderingContext2D) => {
  fillPath(g, "M60 380 L60 170 C60 140 90 130 120 130 L780 130 C810 130 840 140 840 170 L840 380 Z", vgrad(g, 130, 380, "#7A4A5A", "#4A2A38"));
  drawSeated(g, 300, 380, 1.3, { suit: "#5A6A8A", skin: "#E8BE98", hair: "#E9E9EE", shirt: "#D9D2C0", bald: 0.7 });
  drawSeated(g, 600, 380, 1.3, { suit: "#8A5A6A", skin: "#E2B48C", hair: "#F2F2F6", shirt: "#E9E3C8", flip: true });
  fillPath(g, "M20 470 L20 250 C20 220 50 210 80 214 L80 470 Z", "#5A3444"); fillPath(g, "M820 470 L820 214 C850 210 880 220 880 250 L880 470 Z", "#5A3444");
  fillPath(g, "M40 380 L860 380 L860 470 L40 470 Z", "#3E2230");
};
/** teléfono en el centro, entre los dos, con la pantalla encendida */
const drawTelefono = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#1A1E30"; g.beginPath(); g.roundRect(20, 10, 120, 220, 18); g.fill();
  g.fillStyle = "#8FE4FF"; g.beginPath(); g.roundRect(30, 26, 100, 186, 10); g.fill();
  g.fillStyle = "#F5FCFF"; g.beginPath(); g.roundRect(38, 90, 84, 40, 12); g.fill(); g.fillStyle = "#1A2240"; g.font = "800 14px sans-serif"; g.textAlign = "center"; g.fillText("Llegué bien", 80, 115);
};

export const mensaje_casa: HeroDef = {
  kind: "lamina",
  when: "Un mensaje que cruza el espacio: «llegada», un astronauta junto a su cápsula en un planeta de sol rojo levanta el teléfono y envía «Llegué bien»; «lectura», dos ancianos en el sofá de su sala leen ese mensaje en el teléfono, décadas después. Despedirse, mudarse lejos, la familia que se queda, mensajes que tardan años.",
  poses: ["llegada", "lectura"],
  actions: {
    enviar: "Aparece el bocadillo «Llegué bien» y una chispa de luz sale del teléfono hacia el cielo: mandas un mensaje, enviar, avisar.",
    leer: "La pantalla del teléfono se enciende, aparece el bocadillo y los dos se inclinan hacia ella: lo lee, recibe el mensaje, tu familia.",
  },
  center: [0, 0.95, -0.35], radius: 1.0,
  anchors: { hero: [0, 0.95, -0.35], top: [0, 2.0, -0.4], base: [0, 0.05, 0], mensaje: [0.3, 1.65, -0.25], persona: [0.2, 0.9, -0.2], cielo: [0.9, 2.4, -1.6] },
  build: (_L, pose) => {
    const p = poseOf(mensaje_casa, pose, "mensaje_casa"), llegada = p === "llegada";
    const L = buildLaminas(llegada ? [
      { name: "cielo", w: 1400, h: 900, heightM: 4.8, pos: [0, -0.4, -1.8], face: 0.12, draw: drawCieloRojo },
      { name: "capsula", w: 500, h: 640, heightM: 1.75, pos: [-0.75, 0, -0.75], contact: 1.2, draw: drawCapsula },
      { name: "astronauta", w: 300, h: 560, heightM: 1.45, pos: [0.25, 0, -0.3], contact: 0.6, draw: drawAstronauta },
      { name: "mensaje", w: 520, h: 260, heightM: 0.62, pos: [0.55, 1.5, -0.25], face: 0.8, unlit: true, draw: drawMensaje },
      { name: "chispa", w: 120, h: 120, heightM: 0.25, pos: [0.42, 1.4, -0.2], face: 1, glow: true, draw: (g) => { const gr = g.createRadialGradient(60, 60, 2, 60, 60, 60); gr.addColorStop(0, "rgba(180,240,255,1)"); gr.addColorStop(1, "rgba(120,220,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 120, 120); } },
    ] : [
      { name: "sala", w: 1400, h: 900, heightM: 4.4, pos: [0, -0.5, -1.6], face: 0.12, draw: drawSala },
      { name: "sofa", w: 900, h: 480, heightM: 1.3, pos: [0, 0, -0.5], contact: 2.2, draw: drawSofa },
      { name: "telefono", w: 160, h: 240, heightM: 0.3, pos: [0.0, 0.66, -0.36], face: 0.6, unlit: true, draw: drawTelefono },
      { name: "mensaje", w: 520, h: 260, heightM: 0.55, pos: [0.1, 1.3, -0.3], face: 0.8, unlit: true, draw: drawMensaje },
      { name: "chispa", w: 120, h: 120, heightM: 0.5, pos: [0.0, 0.62, -0.36], face: 1, glow: true, draw: (g) => { const gr = g.createRadialGradient(60, 60, 2, 60, 60, 60); gr.addColorStop(0, "rgba(160,230,255,0.9)"); gr.addColorStop(1, "rgba(120,220,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 120, 120); } },
    ]);
    // suelo propio que tapa el del entorno: roca roja o tarima de madera
    const floorCv = document.createElement("canvas"); floorCv.width = floorCv.height = 256; const fg = floorCv.getContext("2d")!;
    fg.fillStyle = llegada ? "#6A2C26" : "#5A3A28"; fg.fillRect(0, 0, 256, 256);
    for (let i = 0; i < (llegada ? 60 : 8); i++) { fg.fillStyle = llegada ? (i % 2 ? "rgba(40,14,14,0.35)" : "rgba(170,80,60,0.3)") : "rgba(30,18,10,0.45)"; if (llegada) { fg.beginPath(); fg.ellipse((i * 97) % 256, (i * 53) % 256, 6 + (i % 5) * 4, 3 + (i % 3) * 2, 0, 0, Math.PI * 2); fg.fill(); } else fg.fillRect(0, i * 32, 256, 3); }
    const ft = new THREE.CanvasTexture(floorCv); ft.colorSpace = THREE.SRGBColorSpace; ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(6, 6);
    const floorGeo = new THREE.CircleGeometry(9, 48), floorMat = new THREE.MeshStandardMaterial({ map: ft, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.006; floor.receiveShadow = true; L.root.add(floor);
    const st = { enviar: 0, leer: 0 }; let lf = 0;
    const paint = (f: number) => {
      const u = llegada ? st.enviar : st.leer, s = Math.max(0.0001, pop(u / 0.5));
      L.parts.mensaje.scale.setScalar(s); L.parts.mensaje.position.y = (llegada ? 1.5 : 1.3) + 0.03 * Math.sin(f * 0.08) * s;
      const sp = L.parts.chispa, m = L.mats.chispa;
      if (llegada) {
        const fly = Math.max(0, Math.min(1, (u - 0.45) / 0.55));
        sp.position.set(0.42 + 0.6 * fly, 1.4 + 1.6 * ease(fly), -0.2 - 1.0 * fly); m.opacity = u > 0.4 && u < 1 ? 1 - fly * 0.7 : 0;
        L.parts.astronauta.children[0].rotation.z = 0.02 * Math.sin(f * 0.05);
      } else {
        m.opacity = 0.12 + 0.3 * ease(u); sp.scale.setScalar(0.7 + 0.2 * ease(u) + 0.03 * Math.sin(f * 0.2));
        L.parts.sofa.children[0].scale.y = 1 + 0.004 * Math.sin(f * 0.09);
      }
    };
    return {
      root: L.root, dispose: () => { floorGeo.dispose(); floorMat.dispose(); ft.dispose(); L.dispose(); },
      update: (f, cam) => { lf = f; L.face(cam); paint(f); },
      act: (name, u) => { if (name in st) st[name as keyof typeof st] = u; paint(lf); },
    };
  },
};
