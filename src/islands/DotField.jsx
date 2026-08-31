// Proof-of-concept React Three Fiber island.
//
// Exists to prove the whole chain works end to end — JSX compiles, React
// mounts into plain HTML, and R3F gets a live WebGL context — so any 21st.dev
// component can be dropped in the same way.
//
// A GPU-instanced grid of points that swell in a wave. Deliberately close to
// the canvas background already on the site, so the two read as one system.

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Points({ columns = 46, rows = 26, spacing = 0.42, colour = '#10b981' }) {
  const meshRef = useRef();
  const count = columns * rows;

  // Base positions computed once
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        arr.push([(i - columns / 2) * spacing, (j - rows / 2) * spacing, 0]);
      }
    }
    return arr;
  }, [columns, rows, spacing]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.getElapsedTime();

    for (let k = 0; k < count; k++) {
      const [x, y] = positions[k];
      // Radial wave outward from the centre
      const d = Math.hypot(x, y);
      const wave = Math.sin(d * 1.4 - t * 1.2);
      const s = 0.035 + Math.max(wave, 0) * 0.055;

      dummy.position.set(x, y, wave * 0.12);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={colour} transparent opacity={0.55} />
    </instancedMesh>
  );
}

export default function DotField({ height = 260, colour = '#10b981' }) {
  // Honour the same motion preference the rest of the site does
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div style={{ width: '100%', height, pointerEvents: 'none' }} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <Points colour={colour} />
      </Canvas>
    </div>
  );
}
