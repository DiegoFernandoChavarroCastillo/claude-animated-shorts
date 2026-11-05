// Prueba del culling (criterio F4): para cada entorno, con tres tamaños de protagonista y todos los presets de
// cámara y transiciones, cuenta las posiciones de cámara que quedan dentro de un objeto ANTES y DESPUÉS del culling,
// y las que caen bajo el suelo. Se renderiza como una tabla (un still) y también se escribe en la consola.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { ENVS } from "./envs";
import { camPositions, camsInside, cullSight, sightLines } from "./envs/cull";
import { buildTimeline } from "./timeline";
import { CAMERA_PRESETS, TRANSITIONS, type Story, type WordT } from "./schema";
import { PALETTE } from "./style";
import { CAPTION_FAMILY } from "./fonts";

const HEROES = [["telefono", "primitive"], ["cubo_hielo", "primitive"], ["avion", "primitive"]] as const;
type CamSpec = Story["beats"][number]["scene"]["camera"];
const CAMS: CamSpec[] = CAMERA_PRESETS.flatMap((p): CamSpec[] =>
  p === "drift" ? [{ preset: p, dir: "left" }, { preset: p, dir: "right" }] : p === "orbit_slow" ? [{ preset: p, deg: 45 }, { preset: p, deg: -45 }] : [{ preset: p }]);

/** story sintético: un beat por (protagonista, cámara), transiciones rotando, 5 s por beat */
const testStory = (env: string, light: Story["beats"][number]["scene"]["light"]) => {
  const beats: Story["beats"] = [], words: WordT[] = [];
  let k = 0;
  for (const [asset, kind] of HEROES) for (const camera of CAMS) {
    const id = `t${k}`;
    beats.push({ id, role: "mechanism", text: "a b c d", scene: { env, light, hero: { kind, asset }, camera }, overlays: [], actions: [], sfx: [], transition: TRANSITIONS[k % TRANSITIONS.length] });
    for (let w = 0; w < 4; w++) words.push({ w: "a", start: k * 5 + w * 0.5 + 0.2, end: k * 5 + w * 0.5 + 0.6, beat: id });
    k++;
  }
  const story: Story = { meta: { id: "cull", lang: "es", title: "cull", fps: 30, width: 1080, height: 1920, voice: { engine: "-", voice: "-", speed: 1 }, music: false, captionEmphasis: "box", tailS: 1 }, beats };
  return { story, words };
};

type Row = { env: string; beats: number; cams: number; before: number; after: number; hidden: number; under: number; control: number };

export const CullTest: React.FC = () => {
  const rows = useMemo<Row[]>(() => Object.entries(ENVS).map(([id, def]) => {
    const { story, words } = testStory(id, def.lights[0]);
    const tl = buildTimeline(story, words, 30);
    const env = def.build(def.lights[0], 3);
    const cullable: THREE.Object3D[] = [];
    env.root.traverse((o) => { if (o.userData.cull) cullable.push(o); });
    const r: Row = { env: id, beats: tl.beats.length, cams: 0, before: 0, after: 0, hidden: 0, under: 0, control: 0 };
    const groundY = id === "cielo_atardecer" ? -9 : id === "macro_corte" ? -10 : 0;
    tl.beats.forEach((_, i) => {
      cullable.forEach((o) => { o.visible = true; });
      const cams = camPositions(tl, i);
      r.cams += cams.length;
      r.before += camsInside(env.root, cams);
      r.hidden += cullSight(env.root, sightLines(tl, i), cams);
      r.after += camsInside(env.root, cams);
      r.under += cams.filter((c) => c.y < groundY + 0.2).length;
    });
    // control: dos obstáculos puestos a propósito en el beat 0 (uno a mitad de la línea de visión, otro rodeando la
    // primera posición de cámara); el culling tiene que ocultar los dos
    cullable.forEach((o) => { o.visible = true; });
    const cams0 = camPositions(tl, 0), hero = new THREE.Vector3(0, 1.1, 0);
    const box = (p: THREE.Vector3) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8)); m.position.copy(p); m.userData.cull = true; env.root.add(m); return m; };
    const tests = [box(cams0[Math.floor(cams0.length / 2)].clone().lerp(hero, 0.5)), box(cams0[0])];
    cullSight(env.root, sightLines(tl, 0), cams0);
    r.control = tests.filter((m) => !m.visible).length;
    env.dispose();
    console.log(`[cull] ${JSON.stringify(r)}`);
    return r;
  }), []);
  const ok = rows.every((r) => r.after === 0 && r.under === 0 && r.control === 2);
  const cell: React.CSSProperties = { padding: "14px 6px", textAlign: "right", borderBottom: `1px solid ${PALETTE.ui.track}` };
  return (
    <AbsoluteFill style={{ background: PALETTE.bg.night1, color: PALETTE.light.white, fontFamily: CAPTION_FAMILY, padding: 40, fontSize: 26 }}>
      <div style={{ fontSize: 52, fontWeight: 700, marginBottom: 10 }}>Prueba de culling (F4)</div>
      <div style={{ color: PALETTE.ui.muted, marginBottom: 30 }}>
        {HEROES.length} protagonistas × {CAMS.length} cámaras por entorno, transiciones rotando; cámara muestreada cada 3 frames. Control: 2 obstáculos puestos a propósito en la línea de visión y en la cámara.
      </div>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead><tr style={{ color: PALETTE.ui.muted }}>
          {["entorno", "beats", "posiciones", "dentro sin culling", "ocultados", "dentro con culling", "bajo el suelo", "control"].map((h, i) =>
            <th key={h} style={{ ...cell, textAlign: i ? "right" : "left", fontWeight: 600, fontSize: 20 }}>{h}</th>)}
        </tr></thead>
        <tbody>{rows.map((r) => (
          <tr key={r.env}>
            <td style={{ ...cell, textAlign: "left" }}>{r.env}</td>
            <td style={cell}>{r.beats}</td><td style={cell}>{r.cams}</td>
            <td style={{ ...cell, color: r.before ? PALETTE.warm.gold : PALETTE.ui.muted }}>{r.before}</td>
            <td style={cell}>{r.hidden}</td>
            <td style={{ ...cell, color: r.after ? PALETTE.ui.red : PALETTE.ui.green, fontWeight: 700 }}>{r.after}</td>
            <td style={{ ...cell, color: r.under ? PALETTE.ui.red : PALETTE.ui.green, fontWeight: 700 }}>{r.under}</td>
            <td style={{ ...cell, color: r.control === 2 ? PALETTE.ui.green : PALETTE.ui.red, fontWeight: 700 }}>{r.control}/2</td>
          </tr>))}
        </tbody>
      </table>
      <div style={{ marginTop: 40, fontSize: 44, fontWeight: 700, color: ok ? PALETTE.ui.green : PALETTE.ui.red }}>
        {ok ? "CUMPLE: ninguna cámara dentro de un objeto ni bajo el suelo, y el culling oculta los obstáculos de control" : "NO CUMPLE"}
      </div>
    </AbsoluteFill>
  );
};
