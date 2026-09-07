'use client';

import React from 'react';

interface BoltProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const Bolt: React.FC<BoltProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Hex Bolt Head */}
      <mesh position={[0, 0, 3]}>
        <cylinderGeometry args={[5, 5, 4, 6]} />
        <meshStandardMaterial color="#667085" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Washer */}
      <mesh position={[0, 0, 0.5]}>
        <cylinderGeometry args={[7, 7, 1, 16]} />
        <meshStandardMaterial color="#d0d5dd" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Thread Shaft */}
      <mesh position={[0, 0, -6]}>
        <cylinderGeometry args={[3, 3, 12, 16]} />
        <meshStandardMaterial color="#98a2b3" roughness={0.4} metalness={0.8} />
      </mesh>
    </group>
  );
};
