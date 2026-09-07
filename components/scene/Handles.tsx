'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { useDesignStore } from '../../store/desginStore';

export const Handles: React.FC = () => {
  const controlPoints = useDesignStore((s) => s.controlPoints);
  const seatingControlPoints = useDesignStore((s) => s.seatingControlPoints);
  const selectedPointId = useDesignStore((s) => s.selectedPointId);
  const setSelectedPoint = useDesignStore((s) => s.setSelectedPoint);
  const showHandles = useDesignStore((s) => s.showHandles);
  const activeCategory = useDesignStore((s) => s.activeCategory);

  if (!showHandles) return null;

  const isSeating = activeCategory === 'seating';
  const activePoints = isSeating ? seatingControlPoints : controlPoints;

  // Key design constraint handles
  const keyPointIds = isSeating
    ? ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7', 'SP8', 'SP9']
    : ['C1', 'C4', 'C7', 'F3', 'B3', 'B1', 'B5', 'F1', 'F5'];

  return (
    <group>
      {activePoints.map((pt) => {
        const isSelected = selectedPointId === pt.id;
        const isKeyPoint = keyPointIds.includes(pt.id);

        if (!isKeyPoint && !isSelected) return null;

        // Map parametric [x, y, z] -> Three.js [x*0.001, z*0.001, y*0.001]
        const threePos: [number, number, number] = [
          pt.position[0] * 0.001,
          pt.position[2] * 0.001,
          pt.position[1] * 0.001,
        ];

        return (
          <group key={pt.id} position={threePos}>
            {/* 3D Sphere Handle */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoint(isSelected ? null : pt.id);
              }}
            >
              <sphereGeometry args={[isSelected ? 0.022 : 0.014, 16, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#ef4444' : '#10b981'}
                depthTest={false}
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Subtle Label Badge */}
            <Html distanceFactor={4} center>
              <div
                onClick={() => setSelectedPoint(isSelected ? null : pt.id)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-transform select-none shadow-md ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold scale-110 ring-2 ring-red-400'
                    : 'bg-zinc-950/90 text-zinc-200 border border-zinc-700 hover:text-emerald-400 hover:border-emerald-500'
                }`}
              >
                {pt.id}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
