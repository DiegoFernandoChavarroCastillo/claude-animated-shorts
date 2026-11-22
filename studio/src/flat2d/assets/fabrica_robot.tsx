// fabrica_robot · escenario: una línea de montaje de autos con un robot humanoide con IA trabajando: a la izquierda un contenedor con
// soportes de metal revueltos, a la derecha una bandeja ordenada por casillas; detrás pasa la carrocería de un auto por la cinta y
// cuelgan lámparas de nave industrial. El robot (blanco y gris, visor negro con ojos de luz cian, manos articuladas) coge una pieza,
// gira el torso y la deja en su casilla, en bucle. Lienzo 100 × 100, anclaje abajo al centro. Acciones propias: `sort` acelera el
// ciclo y enciende un ✓ verde en cada casilla que se llena (se queda); `stop` el robot se queda quieto mirando al frente.
import React from "react";
import { type AssetFC, clamp01, idle, lerp } from "./common";
import { Grad, Halo, Vol, ContactShadow, dark, lite, url } from "./shade";

export const FabricaRobot: AssetFC = ({ pal, t, seed, p }) => {
  const id = `fr${seed}`, I = idle(t, seed), so = clamp01(p.sort ?? 0), still = clamp01(p.stop ?? 0);
  const period = lerp(70, 46, so), ph = ((t % period) / period);
  // 0–0.35 baja a coger · 0.35–0.65 gira con la pieza · 0.65–1 la deja y vuelve
  const reach = ph < 0.35 ? Math.sin((ph / 0.35) * Math.PI / 2) : ph < 0.65 ? 1 - (ph - 0.35) / 0.3 * 2 : -Math.sin(((ph - 0.65) / 0.35) * Math.PI);
  const turn = (1 - still) * reach, holding = ph > 0.3 && ph < 0.8;
  const filled = Math.min(8, Math.floor(t / period) % 9 + Math.round(so * 4));
  const white = lite("#E8ECF2", pal, 0.05), grey = "#8A93A4", car = "#C8D2E0", belt = (t * 0.4) % 8;
  const hx = 50 + turn * 22, hy = 62 + Math.abs(turn) * 4;
  return (
    <g>
      <Vol id={`${id}w`} c={white} pal={pal} k={0.9} lx={0.3} ly={0.25} /><Grad id={`${id}c`} a={lite(car, pal, 0.2)} b={dark(car, pal, 0.35)} />
      <Grad id={`${id}f`} a={dark(pal.wall, pal, 0.1)} b={dark(pal.rock, pal, 0.4)} />
      {/* nave: vigas y lámparas */}
      <rect x={0} y={0} width={100} height={100} fill={url(`${id}f`)} />
      {[10, 30, 50, 70, 90].map((x) => <rect key={x} x={x - 0.6} y={0} width={1.2} height={70} fill={dark(pal.wall, pal, 0.35)} />)}
      <rect x={0} y={6} width={100} height={1.6} fill={dark(pal.wall, pal, 0.3)} />
      {[20, 50, 80].map((x) => (
        <g key={x}><rect x={x - 0.3} y={6} width={0.6} height={8} fill={grey} /><path d={`M${x - 5} 17 L${x + 5} 17 L${x + 3} 14 L${x - 3} 14 Z`} fill={grey} />
          <Halo id={`${id}l${x}`} cx={x} cy={18} r={18} color={pal.glow} a={0.25} /></g>
      ))}
      {/* cinta y carrocería que pasa */}
      <rect x={0} y={46} width={100} height={6} fill={dark(pal.rock, pal, 0.2)} />
      {[...Array(14)].map((_, i) => <rect key={i} x={i * 8 - belt} y={47} width={4} height={4} fill={dark(pal.rock, pal, 0.45)} />)}
      <g transform={`translate(${((t * 0.15) % 140) - 40} 0)`} opacity={0.85}>
        <path d="M6 46 L8 38 Q14 31 26 30 L38 30 Q46 31 50 38 L56 40 L56 46 Z" fill={url(`${id}c`)} />
        <path d="M14 37 Q18 32 26 32 L34 32 L38 37 Z" fill={dark(pal.ink, pal, 0.1)} opacity={0.7} />
        <circle cx={16} cy={46} r={4} fill={dark(pal.ink, pal, 0.2)} /><circle cx={46} cy={46} r={4} fill={dark(pal.ink, pal, 0.2)} />
      </g>
      {/* mesa de trabajo */}
      <rect x={4} y={72} width={92} height={4} rx={1} fill={lite(pal.rock, pal, 0.15)} /><rect x={8} y={76} width={3} height={24} fill={dark(pal.rock, pal, 0.3)} /><rect x={89} y={76} width={3} height={24} fill={dark(pal.rock, pal, 0.3)} />
      {/* contenedor con soportes revueltos */}
      <path d="M8 72 L10 62 L32 62 L34 72 Z" fill="#2F6AC8" /><path d="M10 62 L32 62 L31 64 L11 64 Z" fill={lite("#2F6AC8", pal, 0.3)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${12 + (i % 5) * 4} ${63 - (i > 4 ? 1.6 : 0)} l3 -1.2 l0.6 1.6`} stroke="#B4BCC8" strokeWidth={0.9} fill="none" transform={`rotate(${i * 37} ${13 + (i % 5) * 4} 62)`} />)}
      {/* bandeja ordenada */}
      <rect x={66} y={64} width={28} height={8} rx={0.8} fill={dark(pal.rock, pal, 0.1)} />
      {[...Array(8)].map((_, i) => {
        const x = 67 + (i % 4) * 6.8, y = 64.6 + Math.floor(i / 4) * 3.6, on = i < filled;
        return <g key={i}><rect x={x} y={y} width={6} height={3.2} fill={dark(pal.rock, pal, 0.35)} />
          {on && <path d={`M${x + 0.8} ${y + 2.2} l3 -1.2 l0.6 1.2`} stroke="#B4BCC8" strokeWidth={0.8} fill="none" />}
          {on && so > 0 && <circle cx={x + 5.2} cy={y + 0.6} r={0.9} fill="#2FE08A" />}</g>;
      })}
      <ContactShadow id={`${id}s`} cx={50} cy={99} rx={14} />
      {/* robot humanoide */}
      <g transform={`translate(0 ${I.breath * 0.4})`}>
        <rect x={44} y={74} width={5} height={25} rx={2} fill={url(`${id}w`)} /><rect x={51} y={74} width={5} height={25} rx={2} fill={url(`${id}w`)} />
        <rect x={44.5} y={84} width={4} height={2} fill={grey} /><rect x={51.5} y={84} width={4} height={2} fill={grey} />
        <g transform={`rotate(${turn * 12} 50 72)`}>
          <path d="M40 48 Q50 44 60 48 L59 72 Q50 75 41 72 Z" fill={url(`${id}w`)} />
          <rect x={45} y={52} width={10} height={9} rx={2} fill={grey} opacity={0.7} /><circle cx={50} cy={56.5} r={1.6} fill={pal.rim} opacity={0.6 + 0.4 * Math.sin(t * 0.2)} />
          {/* cabeza con visor */}
          <rect x={48} y={42} width={4} height={4} fill={grey} />
          <g transform={`rotate(${turn * 10 + I.sway * 2} 50 40)`}>
            <path d="M42 36 Q42 26 50 26 Q58 26 58 36 Q58 43 50 43 Q42 43 42 36 Z" fill={url(`${id}w`)} />
            <path d="M43.6 33 Q50 30 56.4 33 L56 38 Q50 40 44 38 Z" fill="#0C1018" />
            {[46.6, 53.4].map((x) => <ellipse key={x} cx={x + turn * 1.4} cy={35} rx={1.5} ry={1.1 - I.blink * 0.9} fill="#5FF0FF" />)}
            <path d="M43.6 33 Q50 30 56.4 33" stroke={pal.rim} strokeWidth={0.4} fill="none" opacity={0.7} />
          </g>
          {/* brazo izquierdo de apoyo */}
          <path d="M41 50 L35 62 L38 64 L43 54" fill={url(`${id}w`)} />
        </g>
        {/* brazo derecho que coge y deja */}
        <path d={`M58 50 Q${lerp(60, hx, 0.5)} ${lerp(54, hy, 0.4)} ${hx} ${hy}`} stroke={white} strokeWidth={4.2} strokeLinecap="round" fill="none" />
        <path d={`M58 50 Q${lerp(60, hx, 0.5)} ${lerp(54, hy, 0.4)} ${hx} ${hy}`} stroke={grey} strokeWidth={1} strokeDasharray="1 4" fill="none" />
        <g transform={`translate(${hx} ${hy})`}>
          <rect x={-2.4} y={-1.6} width={4.8} height={3.6} rx={1} fill={grey} />
          {[-1.8, -0.6, 0.6, 1.8].map((dx) => <rect key={dx} x={dx - 0.35} y={1.6} width={0.7} height={2.4} rx={0.3} fill={white} />)}
          {holding && <path d="M-2 4.6 l3 -1.2 l0.6 1.6" stroke="#D8DEE8" strokeWidth={1} fill="none" />}
        </g>
      </g>
    </g>
  );
};
