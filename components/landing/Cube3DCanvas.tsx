'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function RotatingCubeMesh({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Continuous smooth rotation
    meshRef.current.rotation.y += delta * 0.45;
    meshRef.current.rotation.x += delta * 0.3;
    meshRef.current.rotation.z += delta * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.8, 1.8]} />
        <meshPhysicalMaterial
          color={isDark ? '#e4e4e7' : '#27272a'}
          roughness={isDark ? 0.15 : 0.2}
          metalness={isDark ? 0.95 : 0.9}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
          transmission={0.35}
          opacity={0.82}
          transparent={true}
          reflectivity={0.9}
          ior={1.5}
        />
      </mesh>
    </Float>
  );
}

export const Cube3DCanvas: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <div className="w-full h-full relative pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isDark ? 0.7 : 1.0} />
        <directionalLight position={[5, 6, 5]} intensity={isDark ? 3.5 : 2.5} color="#ffffff" />
        <directionalLight position={[-5, -4, -3]} intensity={isDark ? 1.8 : 1.2} color="#a1a1aa" />
        <pointLight position={[0, 3, 2]} intensity={2.0} color="#ffffff" />

        <RotatingCubeMesh isDark={isDark} />

        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={isDark ? 0.5 : 0.25}
          scale={5.5}
          blur={2.5}
          far={3}
          color={isDark ? '#000000' : '#27272a'}
        />
      </Canvas>
    </div>
  );
};
