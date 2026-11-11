// dictado · El rey Ammurapi de Ugarit (túnica larga con orla, gorro alto, barba) de pie y el escriba sentado con la tablilla en el regazo: el rey dicta, tú escribes, la carta.
// `pace` el rey camina de un lado a otro (vuelve); `dictate` el rey alza la mano y habla (se queda); `write` el escriba escribe con el punzón (se queda); `look_door` los dos miran a la derecha, el escriba tiembla (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { ReyUgarit, Escriba } from "./bronce";

export const Dictado: AssetFC = ({ pal, p, t }) => {
  const pc = p.pace ?? 0, dc = p.dictate ?? 0, wr = p.write ?? 0, ld = p.look_door ?? 0;
  const kx = 30 + Math.sin(pc * Math.PI * 2) * 12, step = pc > 0 && pc < 1 ? Math.sin(t * 0.5) : 0;
  const mouth = dc > 0 ? clamp01(0.5 + 0.5 * Math.sin(t * 0.7)) * (1 - ld) : 0;
  return (
    <g>
      <ellipse cx={50} cy={75} rx={46} ry={2.4} fill={pal.ink} opacity={0.45} />
      <ReyUgarit x={kx} y={75} s={1.1} pal={pal} arm={dc * (1 - ld * 0.6)} mouth={mouth} turn={lerp(0.6, 1, ld)} step={step} />
      <Escriba x={70} y={75} s={1.3} pal={pal} t={t} write={wr} turn={lerp(-0.6, 0.9, ld)} shake={ld} />
    </g>
  );
};
