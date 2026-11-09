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
