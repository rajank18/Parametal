'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useDesignStore } from '../../store/desginStore';
import { generateCanopyGeometry, generateBodyGeometry } from '../../geometry/panels';
import { generateSeatingGeometry } from '../../geometry/seating';
import { generatePartitionGeometry } from '../../geometry/partition';
import { MaterialConfig, MaterialType } from '../../types/design';

export const MATERIAL_PRESETS: Record<MaterialType, MaterialConfig> = {
  galvanized: {
    type: 'galvanized',
    name: 'Galvanized Steel (GI)',
    color: '#8b94a0',
    roughness: 0.32,
    metalness: 0.88,
    clearcoat: 0.25,
    clearcoatRoughness: 0.2,
  },
  mild_steel: {
    type: 'mild_steel',
    name: 'Mild Steel',
    color: '#475467',
    roughness: 0.45,
    metalness: 0.75,
  },
  aluminum: {
    type: 'aluminum',
    name: 'Brushed Aluminum',
    color: '#d1d5db',
    roughness: 0.22,
    metalness: 0.95,
    clearcoat: 0.4,
  },
  custom: {
    type: 'custom',
    name: 'Custom Matte Black Metal',
    color: '#1d2939',
    roughness: 0.4,
    metalness: 0.9,
  },
};

export const MetalObject: React.FC = () => {
  const parameters = useDesignStore((s) => s.parameters);
  const seatingParameters = useDesignStore((s) => s.seatingParameters);
  const partitionParameters = useDesignStore((s) => s.partitionParameters);
  const controlPoints = useDesignStore((s) => s.controlPoints);
  const seatingControlPoints = useDesignStore((s) => s.seatingControlPoints);
  const wireframe = useDesignStore((s) => s.wireframe);
  const activeCategory = useDesignStore((s) => s.activeCategory);

  // Lamp Geometry
  const canopyData = useMemo(() => {
    return generateCanopyGeometry(parameters, controlPoints);
  }, [parameters, controlPoints]);

  const bodyGeometry = useMemo(() => {
    return generateBodyGeometry(parameters, controlPoints);
  }, [parameters, controlPoints]);

  // Seating (Lounge Chair) Geometry
  const seatingData = useMemo(() => {
    return generateSeatingGeometry(seatingParameters, seatingControlPoints);
  }, [seatingParameters, seatingControlPoints]);

  // Partition Screen Geometry
  const partitionData = useMemo(() => {
    return generatePartitionGeometry(partitionParameters);
  }, [partitionParameters]);

  const matConfig = MATERIAL_PRESETS[parameters.materialType] || MATERIAL_PRESETS.galvanized;
  const seatingMatConfig = MATERIAL_PRESETS[seatingParameters.materialType] || MATERIAL_PRESETS.galvanized;

  const centerHeightM = (parameters.centerHeight || 1335) * 0.001;
  const lightPos: [number, number, number] = [-0.22, centerHeightM - 0.12, 0.02];

  // Render Seating (Continuous Sculptural Sheet Lounge Chair)
  if (activeCategory === 'seating') {
    return (
      <group position={[0, 0, 0]}>
        {/* Main Continuous Sculptural Shell Surface */}
        <mesh geometry={seatingData.geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={seatingMatConfig.color}
            roughness={seatingMatConfig.roughness}
            metalness={seatingMatConfig.metalness}
            clearcoat={seatingMatConfig.clearcoat || 0.2}
            clearcoatRoughness={seatingMatConfig.clearcoatRoughness || 0.15}
            wireframe={wireframe}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>
    );
  }

  // Render Table
  if (activeCategory === 'table') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.02, 0.7]} />
          <meshStandardMaterial color={matConfig.color} roughness={matConfig.roughness} metalness={matConfig.metalness} wireframe={wireframe} />
        </mesh>
        {[-0.52, 0.52].map((x) =>
          [-0.28, 0.28].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.37, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.02, 0.03, 0.74, 16]} />
              <meshStandardMaterial color="#2d3748" roughness={0.3} metalness={0.85} />
            </mesh>
          ))
        )}
      </group>
    );
  }

  // Render Storage Credenza
  if (activeCategory === 'storage') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.6, 0.4]} />
          <meshStandardMaterial color={matConfig.color} roughness={matConfig.roughness} metalness={matConfig.metalness} wireframe={wireframe} />
        </mesh>
        <mesh position={[-0.24, 0.5, 0.205]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.56, 0.01]} />
          <meshStandardMaterial color="#475467" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0.24, 0.5, 0.205]} castShadow receiveShadow>
          <boxGeometry args={[0.46, 0.56, 0.01]} />
          <meshStandardMaterial color="#475467" roughness={0.4} metalness={0.8} />
        </mesh>
        {[-0.42, 0.42].map((x) => (
          <mesh key={x} position={[x, 0.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.04, 0.2, 0.38]} />
            <meshStandardMaterial color="#1f2937" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
      </group>
    );
  }

  // Render Architectural Partition Screen Array
  if (activeCategory === 'partition') {
    return (
      <group position={[0, 0, 0]}>
        {/* Vertical Structural Posts/Rods */}
        <mesh geometry={partitionData.postsGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#9a5832"
            roughness={0.35}
            metalness={0.85}
          />
        </mesh>

        {/* Arrayed Double-Curved Sheet Metal Panels */}
        {partitionData.panels.map((p) => (
          <group key={p.id} position={p.position} rotation={[0, (p.rotationY * Math.PI) / 180, 0]}>
            <mesh geometry={p.geometry} castShadow receiveShadow>
              <meshPhysicalMaterial
                color="#b86b35"
                roughness={0.4}
                metalness={0.75}
                clearcoat={0.3}
                clearcoatRoughness={0.2}
                wireframe={wireframe}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Internal Warm Ambient Light Node */}
            {partitionParameters.lightBulbs && (
              <group position={[0, 0, 0]}>
                <mesh position={[0, 0, 0.02]}>
                  <sphereGeometry args={[0.015, 12, 12]} />
                  <meshBasicMaterial color="#ffc107" />
                </mesh>
                <pointLight color="#ffab00" intensity={1.8} distance={0.7} decay={2} />
              </group>
            )}
          </group>
        ))}
      </group>
    );
  }

  // Render Wall-Mounted Shelf & Sconce
  if (activeCategory === 'wall_mounted') {
    return (
      <group position={[0, 0, 0]}>
        <mesh position={[0, 1.2, -0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.4, 0.01]} />
          <meshStandardMaterial color="#374151" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 1.05, 0.15]} castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.015, 0.3]} />
          <meshStandardMaterial color={matConfig.color} roughness={matConfig.roughness} metalness={matConfig.metalness} wireframe={wireframe} />
        </mesh>
        <pointLight position={[0, 1.25, 0.1]} color="#ffeaad" intensity={12} distance={3} />
      </group>
    );
  }

  // Default: PERFECT LAMP (100% UNTOUCHED & EXACT)
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Closed Base Body Pedestal */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={matConfig.color}
          roughness={matConfig.roughness}
          metalness={matConfig.metalness}
          wireframe={wireframe}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 2. Top Sculptural Asymmetric Hood Canopy */}
      <mesh geometry={canopyData.geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={matConfig.color}
          roughness={matConfig.roughness}
          metalness={matConfig.metalness}
          wireframe={wireframe}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* 3. Underneath Warm Golden Light Source Fixture (Outside body, under canopy) */}
      <group position={lightPos}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.02, 0.025, 0.035, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.8} />
        </mesh>

        <mesh position={[0, -0.01, 0]}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color={parameters.lightColor || '#ffd166'} />
        </mesh>

        <spotLight
          position={[0, 0, 0]}
          target-position={[0, -1, 0]}
          color={parameters.lightColor || '#ffd166'}
          intensity={(parameters.lightIntensity / 100) * 25}
          angle={Math.PI / 2.5}
          penumbra={0.8}
          distance={3.5}
          decay={1.8}
        />

        <pointLight
          color={parameters.lightColor || '#ffe89c'}
          intensity={(parameters.lightIntensity / 100) * 12}
          distance={2.5}
          decay={2.0}
        />
      </group>
    </group>
  );
};
