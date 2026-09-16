'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function MonochromeFloatingMesh({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.18 + state.pointer.x * 0.35;
    meshRef.current.rotation.x = Math.sin(t * 0.12) * 0.18 - state.pointer.y * 0.25;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={0.7}>
      <mesh ref={meshRef} position={[0, 0.15, 0]} castShadow receiveShadow>
        <torusKnotGeometry args={[1.05, 0.3, 160, 32, 2, 3]} />
        <MeshDistortMaterial
          color={isDark ? '#e4e4e7' : '#18181b'}
          roughness={isDark ? 0.18 : 0.22}
          metalness={isDark ? 0.95 : 0.88}
          clearcoat={0.7}
          clearcoatRoughness={0.12}
          distort={0.14}
          speed={1.4}
        />
      </mesh>
    </Float>
  );
}

export const Hero3DCanvas: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 3.7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isDark ? 0.6 : 0.9} />
        <directionalLight position={[5, 6, 4]} intensity={isDark ? 3.0 : 2.2} color="#ffffff" castShadow />
        <directionalLight position={[-5, -3, -2]} intensity={isDark ? 1.5 : 1.0} color="#71717a" />
        <pointLight position={[0, 3, 0]} intensity={isDark ? 2.0 : 1.2} color="#ffffff" />

        <MonochromeFloatingMesh isDark={isDark} />

        <ContactShadows
          position={[0, -1.45, 0]}
          opacity={isDark ? 0.65 : 0.35}
          scale={6.5}
          blur={2.4}
          far={3}
          color={isDark ? '#000000' : '#27272a'}
        />
      </Canvas>
    </div>
  );
};
