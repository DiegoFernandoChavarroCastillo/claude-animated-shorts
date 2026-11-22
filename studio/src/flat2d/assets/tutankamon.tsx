// tutankamon · personaje: Tutankamón, el rey niño, de pie y mirando a la derecha: tocado nemes a rayas de oro y lapislázuli con la cobra
// (ureo) en la frente (o la corona azul jepresh con `opts.corona: "azul"`), collar usekh de bandas de colores, brazaletes de oro, torso
// desnudo y delgado, faldellín de lino blanco con cinturón y delantal de oro, sandalias. Respira y parpadea siempre. Pies en y ≈ 155.
// opts: `corona` nemes | azul; `baston` (bastón en la mano derecha, apoyado en el suelo); `cetros` (cayado y mayal cruzados sobre el
// pecho); `sentado` (muslos horizontales a y ≈ 118: va sobre `trono_oro`); `grande` (corona enorme para un niño, le tapa media frente).
// Acciones propias: `limp` cojea mientras dura (apoya el bastón, el cuerpo cae del lado malo); `slip` la corona le resbala sobre los ojos
// (se queda); `fall` se desploma hacia atrás hasta el suelo (se queda); `raise` alza los brazos (se queda); `talk` mueve la boca.
import React from "react";
import { type AssetFC, clamp01, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Vol, dark, lite, url } from "./shade";

export const Tutankamon: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `tk${seed}`, I = idle(t, seed);
  const azul = opt(opts, "corona", "nemes") === "azul", baston = opt(opts, "baston", false), cetros = opt(opts, "cetros", false);
  const sentado = opt(opts, "sentado", false), grande = opt(opts, "grande", false);
  const lp = p.limp ?? 0, limping = lp > 0 && lp < 1, sl = clamp01(p.slip ?? 0), fl = clamp01(p.fall ?? 0), ra = clamp01(p.raise ?? 0), tk = p.talk ?? 0;
  const skin = lerpHex(pal.skin, "#8A5230", 0.4), gold = lerpHex("#E8B640", pal.glow, 0.2), lapis = lerpHex("#1F3E8A", pal.ink, 0.15);
  const linen = lerpHex("#F4EEDC", pal.wallLit, 0.3), red = lerpHex("#B8402E", pal.accent, 0.2), teal = lerpHex("#2E8A8A", pal.bg, 0.15);
  const step = limping ? Math.sin(t * 0.32) : 0, dip = limping ? Math.max(0, step) * 3 : 0;   // al cargar el pie malo se hunde
  const by = I.breath * 0.6 + dip, tilt = limping ? step * 3 : I.sway * 0.8;
  const mouth = (tk > 0 && tk < 1) ? Math.abs(Math.sin(t * 0.55)) : 0;
  const crownY = (grande ? 4 : 0) + sl * 7;   // la corona baja sobre los ojos
  const cs = grande ? 1.35 : 1;
  // manos: derecha con el bastón o junto a la cadera; con `raise`, arriba
  const caneX = 74 + (limping ? Math.sin(t * 0.32 + 1.2) * 3 : 0);
  const rh0 = baston ? { x: caneX, y: 98 } : cetros ? { x: 56, y: 86 } : { x: 64, y: 104 };
  const rh = { x: lerp(rh0.x, 70, ra), y: lerp(rh0.y, 44, ra) + by }, lh = { x: lerp(cetros ? 46 : 38, 30, ra), y: lerp(cetros ? 86 : 104, 44, ra) + by };
  const arm = (sx: number, sy: number, x: number, y: number, col: string, wd: number) => {
    const mx = (sx + x) / 2 + (y - sy) * 0.1, my = (sy + y) / 2 + 5;
    return <path d={`M${sx} ${sy} Q${mx} ${my} ${x} ${y}`} stroke={col} strokeWidth={wd} strokeLinecap="round" fill="none" />;
  };
  const band = (x: number, y: number) => <rect x={x - 3} y={y - 1.2} width={6} height={2.4} rx={0.8} fill={gold} />;
  const legs = sentado ? (
    <g>
      <path d={`M40 ${118} L64 ${118}`} stroke={dark(skin, pal, 0.15)} strokeWidth={8} strokeLinecap="round" />
      <path d={`M64 118 L66 153`} stroke={skin} strokeWidth={7} strokeLinecap="round" /><path d={`M58 118 L58 153`} stroke={dark(skin, pal, 0.2)} strokeWidth={6.6} strokeLinecap="round" />
      <ellipse cx={69} cy={154} rx={5} ry={1.8} fill={gold} /><ellipse cx={61} cy={154} rx={4.6} ry={1.7} fill={dark(gold, pal, 0.25)} />
    </g>
  ) : (
    <g>
      <path d={`M45 ${120 + by} L43 153`} stroke={dark(skin, pal, 0.2)} strokeWidth={6.4} strokeLinecap="round" />
      {/* el pie izquierdo, torcido hacia dentro */}
      <path d={`M55 ${120 + by} L57 ${153 - dip * 0.3}`} stroke={skin} strokeWidth={6.8} strokeLinecap="round" />
      <ellipse cx={45} cy={154} rx={4.4} ry={1.7} fill={dark(gold, pal, 0.3)} />
      <path d={`M54 ${154 - dip * 0.3} Q58 ${151 - dip * 0.3} 62 ${153.5}`} stroke={gold} strokeWidth={2.6} strokeLinecap="round" fill="none" />
    </g>
  );
  const body = (
    <g transform={`rotate(${tilt} 50 ${sentado ? 118 : 150})`}>
      {/* brazo izquierdo (detrás) */}
      {arm(42, 76 + by, lh.x, lh.y, dark(skin, pal, 0.2), 5.4)}
      {band(lerp(42, lh.x, 0.45), lerp(76 + by, lh.y, 0.45))}
      {/* torso delgado */}
      <path d={`M38 ${112 + by} Q36 ${90 + by} 39 ${74 + by} Q50 ${69 + by} 61 ${74 + by} Q64 ${92 + by} 61 ${112 + by} Z`} fill={url(`${id}k`)} />
      <path d={`M61 ${75 + by} Q64 ${92 + by} 61 ${110 + by}`} stroke={pal.rim} strokeWidth={0.9} fill="none" opacity={0.6} />
      {/* collar usekh: bandas de lapislázuli, oro, turquesa y cornalina */}
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${38.5 - i * 0.6} ${74 + by + i * 2.2} Q50 ${82 + by + i * 2.6} ${61.5 + i * 0.6} ${74 + by + i * 2.2}`} stroke={[lapis, gold, teal, red][i]} strokeWidth={2.2} fill="none" />
      ))}
      <path d={`M37.6 ${81 + by} Q50 ${91 + by} 62.4 ${81 + by}`} stroke={gold} strokeWidth={0.8} strokeDasharray="0.7 0.9" fill="none" />
      {/* faldellín shendyt con cinturón y delantal de oro */}
      {!sentado && <path d={`M36 ${110 + by} L64 ${110 + by} L67 ${128 + by} L33 ${128 + by} Z`} fill={url(`${id}l`)} />}
      {sentado && <path d={`M36 ${108 + by} L64 ${108 + by} L68 ${120} L36 ${121} Z`} fill={url(`${id}l`)} />}
      <path d={`M47 ${111 + by} L53 ${111 + by} L55 ${sentado ? 121 : 128 + by} L45 ${sentado ? 121 : 128 + by} Z`} fill={url(`${id}g`)} />
      {[46.6, 48.8, 51, 53.2].map((x) => <path key={x} d={`M${x} ${113 + by} l0.3 ${sentado ? 7 : 13}`} stroke={lapis} strokeWidth={0.5} />)}
      <rect x={35} y={107.5 + by} width={30} height={3} rx={0.8} fill={gold} />
      <path d={`M37 ${109 + by} h26`} stroke={red} strokeWidth={0.6} strokeDasharray="1.2 1.2" />
      {/* cayado y mayal cruzados */}
      {cetros && ra < 0.5 && (
        <g opacity={1 - ra * 2}>
          <path d={`M44 ${100 + by} L58 ${70 + by}`} stroke={gold} strokeWidth={1.8} strokeLinecap="round" /><path d={`M58 ${70 + by} q4 -5 0 -7`} stroke={gold} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${44 + i * 2.4} ${100 + by - i * 5} l1.4 1.4`} stroke={lapis} strokeWidth={1.2} />)}
          <path d={`M58 ${100 + by} L44 ${72 + by}`} stroke={gold} strokeWidth={1.5} strokeLinecap="round" />
          {[-1, 0, 1].map((k) => <path key={k} d={`M44 ${72 + by} q${-3 + k * 2} 4 ${-4 + k * 2.4} 10`} stroke={lerpHex(gold, red, 0.4)} strokeWidth={1.1} fill="none" />)}
        </g>
      )}
      {/* cuello y cabeza */}
      <rect x={46} y={62 + by} width={8} height={10} fill={dark(skin, pal, 0.12)} />
      <ellipse cx={51} cy={54 + by} rx={10.5} ry={11.5} fill={url(`${id}k`)} />
      {/* ojo con kohl, ceja, nariz, boca */}
      <path d={`M55.4 ${53.6 + by} q2.6 -1.6 5.2 0 q-2.6 1.4 -5.2 0 Z`} fill={linen} opacity={1 - 0.9 * I.blink} />
      <ellipse cx={58.6} cy={53.6 + by} rx={1} ry={1.2 * (1 - 0.9 * I.blink)} fill={pal.ink} />
      <path d={`M54.8 ${53.6 + by} q3 -2 6.4 -0.2 l2.6 0.6`} stroke={pal.ink} strokeWidth={0.6} fill="none" />
      <path d={`M55.4 ${50 + by} q3 -1.6 6 -0.4`} stroke={dark(skin, pal, 0.55)} strokeWidth={0.8} fill="none" />
      <path d={`M61.2 ${54.4 + by} L63.6 ${58.6 + by} L61.4 ${59.2 + by}`} stroke={dark(skin, pal, 0.3)} strokeWidth={0.7} fill="none" />
      <ellipse cx={59.6} cy={61.6 + by} rx={1.7} ry={0.45 + mouth * 1.1} fill={dark(skin, pal, 0.5)} />
      {/* tocado */}
      <g transform={`translate(51 ${46 + by + crownY}) scale(${cs}) translate(-51 -46)`}>
        {azul ? (
          <g>
            <path d="M39 52 Q37 36 44 31 Q52 26 60 31 Q64 36 63 44 L58 46 Q50 44 44 47 Z" fill={url(`${id}b`)} />
            {[...Array(14)].map((_, i) => <circle key={i} cx={42 + (i % 5) * 4.2 + (Math.floor(i / 5) % 2) * 2} cy={34 + Math.floor(i / 5) * 4} r={0.7} fill={gold} />)}
            <path d="M44 47 Q52 44 60 45.6" stroke={gold} strokeWidth={1.2} fill="none" />
          </g>
        ) : (
          <g>
            {/* nemes: tela a rayas que cae por detrás y sobre los hombros */}
            <path d="M38 47 Q38 34 51 33 Q62 33 63 45 L60 47 Q54 44 46 47 L46 60 Q44 70 40 76 L34 76 Q36 64 38 47 Z" fill={url(`${id}g`)} />
            {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${39 + i * 0.6} ${38 + i * 6.4} Q${48} ${36 + i * 5.4} ${62 - i * 2} ${39 + i * 4.6}`} stroke={lapis} strokeWidth={1.6} fill="none" clipPath={`url(#${id}nc)`} />)}
            <defs><clipPath id={`${id}nc`}><path d="M38 47 Q38 34 51 33 Q62 33 63 45 L60 47 Q54 44 46 47 L46 60 Q44 70 40 76 L34 76 Q36 64 38 47 Z" /></clipPath></defs>
            <path d="M46 47 Q54 43.6 60.5 46.4" stroke={gold} strokeWidth={1.4} fill="none" />
          </g>
        )}
        {/* ureo: la cobra en la frente */}
        <path d={`M60.5 ${azul ? 44 : 45} q2.4 -1 2.2 -4 q-0.2 -2 -1.8 -1.6 q1.2 1.4 -0.4 3`} stroke={gold} strokeWidth={1.1} fill={lerpHex(gold, red, 0.2)} strokeLinecap="round" />
      </g>
      {/* brazo derecho */}
      {arm(58, 76 + by, rh.x, rh.y, skin, 5.8)}
      {band(lerp(58, rh.x, 0.45), lerp(76 + by, rh.y, 0.45))}
      <circle cx={rh.x} cy={rh.y} r={2.7} fill={skin} />
    </g>
  );
  // bastón de ébano con mango curvo y anillos de oro, del suelo a la mano
  const cane = baston && ra < 0.5 && (
    <g opacity={1 - ra * 2}>
      <path d={`M${rh.x + 0.5} ${rh.y - 3} L${rh.x + 1.5} 154`} stroke={lerpHex("#2A1A10", pal.ink, 0.2)} strokeWidth={1.7} strokeLinecap="round" />
      <path d={`M${rh.x + 0.5} ${rh.y - 3} q-1 -4 -4 -3`} stroke={gold} strokeWidth={1.7} fill="none" strokeLinecap="round" />
      {[0.2, 0.45, 0.75].map((k) => <rect key={k} x={rh.x - 0.4} y={lerp(rh.y, 154, k) - 0.6} width={2.8} height={1.2} fill={gold} />)}
    </g>
  );
  return (
    <g>
      <Vol id={`${id}k`} c={skin} pal={pal} k={0.8} /><Grad id={`${id}l`} a={lite(linen, pal, 0.3)} b={dark(linen, pal, 0.18)} />
      <Grad id={`${id}g`} a={lite(gold, pal, 0.35)} b={dark(gold, pal, 0.25)} /><Grad id={`${id}b`} a={lite(lapis, pal, 0.3)} b={dark(lapis, pal, 0.3)} />
      <ContactShadow id={`${id}s`} cx={52} cy={155} rx={22 + fl * 18} />
      <g transform={`translate(${fl * -6} ${fl * 4}) rotate(${-fl * 82} 48 154)`}>
        {legs}{body}{cane}
      </g>
    </g>
  );
};
