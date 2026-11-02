// Escena 3D de un beat: entorno + objeto protagonista + luces + cámara, y la cadena de post del puente sin tinta:
// lens pre -> lens main -> bloom -> tone map NEUTRAL -> grade, MSAA 4 (plan §4, Explainer.tsx).
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { DOF, LIGHTS, POST } from "./style";
import type { Timeline } from "./timeline";
import { camAt, meanView } from "./camera";
import { envDef } from "./envs";
import { heroDef } from "./heroes";
import { LensBlur } from "./world/lensblur";
import { GradeEffect, GRADES, gradeFor } from "./world/grade";

/** bloom solo de fuentes muy brillantes; su cadena MIP parte siempre de 540x960 para que el halo no cambie con la escala */
const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: POST.bloom.intensity, luminanceThreshold: POST.bloom.threshold,
    luminanceSmoothing: POST.bloom.smoothing, mipmapBlur: true, levels: POST.bloom.levels, radius: POST.bloom.radius });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};

const rad = (d: number) => (d * Math.PI) / 180;

export const Scene: React.FC<{ tl: Timeline; i: number }> = ({ tl, i }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const bt = tl.beats[i], sc = bt.beat.scene, L = LIGHTS[sc.light];

  const world = useMemo(() => {
    const env = envDef(sc.env).build(sc.light, i * 7 + 3);
    const hero = heroDef(sc.hero.asset).build(L, sc.hero.pose);
    const root = new THREE.Group();
    root.add(env.root, hero.root);
    const hemi = new THREE.HemisphereLight(L.hemiSky, L.hemiGround, L.hemi);
    const key = new THREE.DirectionalLight(L.key, L.keyI), rim = new THREE.DirectionalLight(L.rim, L.rimI);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004;
    const sc2 = key.shadow.camera; sc2.left = sc2.bottom = -6; sc2.right = sc2.top = 6; sc2.near = 1; sc2.far = 80;
    // luz relativa a la cámara y congelada por beat: key a keyAz grados de la vista media, rim desde detrás
    const [vx, vz] = meanView(tl, i), c = heroDef(sc.hero.asset).center;
    const dirAt = (az: number, el: number) => {
      const a = rad(az), x = -vx * Math.cos(a) + vz * Math.sin(a), z = -vz * Math.cos(a) - vx * Math.sin(a);
      return new THREE.Vector3(x * Math.cos(rad(el)), Math.sin(rad(el)), z * Math.cos(rad(el))).multiplyScalar(30);
    };
    key.position.copy(dirAt(L.keyAz, L.keyEl)).add(new THREE.Vector3(...c)); key.target.position.set(...c);
    rim.position.copy(dirAt(180 + L.keyAz * 0.5, 20)).add(new THREE.Vector3(...c)); rim.target.position.set(...c);
    root.add(hemi, key, key.target, rim, rim.target);
    return { root, env, hero };
  }, [tl, i, sc, L]);
  useEffect(() => () => { world.env.dispose(); world.hero.dispose(); }, [world]);

  const fx = useMemo(() => ({
    lens: new LensBlur({ maxCoC: DOF.maxCoC, nearScale: DOF.nearScale }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES[sc.light], 1),
  }), [sc.light]);

  const cam = camera as THREE.PerspectiveCamera, c = camAt(tl, i, f);
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
  cam.fov = c.fov; cam.near = 0.1; cam.far = 2000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  scene.fog = world.env.fog; scene.background = null;
  world.env.update(f, cam); world.hero.update(f);
  // foco de lente fina: distancia sobre el eje de vista hasta el centro del objeto protagonista
  const fwd = new THREE.Vector3(); cam.getWorldDirection(fwd);
  fx.lens.focus = Math.max(0.3, new THREE.Vector3(...heroDef(sc.hero.asset).center).sub(cam.position).dot(fwd));
  fx.lens.cInf = sc.dof ?? DOF.medium;
  gradeFor(fx.grade, sc.light);

  return (
    <>
      <primitive object={world.root} dispose={null} />
      <EffectComposer multisampling={POST.msaa}>
        {[
          <primitive key="pre" object={fx.lens.pre} dispose={null} />,
          <primitive key="lens" object={fx.lens.main} dispose={null} />,
          <primitive key="bloom" object={fx.bloom} dispose={null} />,
          <primitive key="tone" object={fx.tone} dispose={null} />,
          <primitive key="grade" object={fx.grade} dispose={null} />,
        ]}
      </EffectComposer>
    </>
  );
};
