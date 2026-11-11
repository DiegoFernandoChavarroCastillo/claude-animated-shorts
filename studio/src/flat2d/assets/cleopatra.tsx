// cleopatra · Cleopatra de pie, de cuerpo entero: peluca negra con flequillo, diadema con ureo, collar usekh y vestido de lino con faja de oro.
// `look` gira la cara hacia la derecha y alza el mentón (se queda); `fear` se lleva la mano a la boca con los ojos muy abiertos (se queda);
// `crown` la diadema se le posa en la frente con un destello (se queda); `child` aparece Cesarión niño en su cadera (se queda); `hood` se cubre con un manto oscuro (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { Cleo } from "./ptolomeos";

export const Cleopatra: AssetFC = ({ pal, p, t }) => {
  const lk = p.look ?? 0, fe = p.fear ?? 0, cr = p.crown, ch = p.child ?? 0, hd = p.hood ?? 0;
  const crown = cr === undefined ? 1 : clamp01(cr * 1.6), shine = cr === undefined ? 0 : Math.sin(clamp01(cr) * Math.PI);
  return (
    <g>
      <Cleo x={50} y={128} s={1.9} pal={pal} t={t} turn={lerp(0.1, 0.8, lk) - 0.5 * fe} arm={lk * 0.25} fear={fe} hood={hd} child={ch} crown={crown} shine={shine} />
    </g>
  );
};
