// Protagonistas de clase "card": animales y personas pintados (chars/) como tarjetas en el mundo 3D.
import type { HeroDef } from "./types";
import { poseOf } from "./types";
import { buildCard } from "../chars/card";
import { drawDog, drawPerson, DOG, PERSON } from "../chars/draw";
import { PALETTE } from "../style";

export const perro: HeroDef = {
  kind: "card",
  when: "Perro (o mascota): olfato, comportamiento animal, vínculo con personas.",
  poses: ["perfil", "perfil_oscuro"],
  center: [0, 1.0, 0], radius: 1.45,
  anchors: { hero: [0.2, 1.1, 0], top: [0.55, 1.9, 0], nariz: [1.35, 1.55, 0], base: [0, 0.05, 0] },
  build: (_L, pose) => {
    const p = poseOf(perro, pose, "perro");
    const c = buildCard({ ...DOG, heightM: 2.35, draw: (pen) => drawDog(pen, p === "perfil_oscuro" ? "#3A2E2A" : PALETTE.warm.gold) });
    return { root: c.root, update: (f, cam) => c.face(f, cam), dispose: c.dispose };
  },
};

export const persona: HeroDef = {
  kind: "card",
  when: "Persona genérica de espaldas: 'tú', usuario, gente en la calle o en casa (personaje secundario).",
  poses: ["espaldas"],
  center: [0, 1.25, 0], radius: 1.15,
  anchors: { hero: [0, 1.3, 0], top: [0, 2.45, 0], cabeza: [0, 2.05, 0], base: [0, 0.05, 0] },
  build: (_L, pose) => {
    poseOf(persona, pose, "persona");
    const c = buildCard({ ...PERSON, heightM: 2.5, draw: (pen) => drawPerson(pen) });
    return { root: c.root, update: (f, cam) => c.face(f, cam), dispose: c.dispose };
  },
};
