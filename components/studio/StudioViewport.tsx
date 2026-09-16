'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStudioStore, CameraPreset } from '../../store/studioStore';
import { Upload, Box, AlertCircle, Loader2, Grid3X3, Sun, SunMedium, SunDim, PanelLeftOpen, PanelRightOpen } from 'lucide-react';

const MATERIAL_CONFIGS = {
  galvanized: {
    color: '#8e9399',
    metalness: 0.95,
    roughness: 0.2,
    clearcoat: 0.4,
  },
  mild_steel: {
    color: '#2a2a2d',
    metalness: 0.85,
    roughness: 0.4,
    clearcoat: 0.2,
  },
  aluminum: {
    color: '#d4d4d8',
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 0.6,
  },
  obsidian_black: {
    color: '#111113',
    metalness: 0.92,
    roughness: 0.12,
    clearcoat: 1.0,
  },
  gold: {
    color: '#d4af37',
    metalness: 0.96,
    roughness: 0.16,
    clearcoat: 0.8,
  },
};

const CameraPresetController: React.FC = () => {
  const cameraPreset = useStudioStore((s) => s.cameraPreset);
  const metadata = useStudioStore((s) => s.metadata);
  const initialScale = useStudioStore((s) => s.initialScale);
  const scaleY = useStudioStore((s) => s.scaleY);
  const uniformScale = useStudioStore((s) => s.uniformScale);
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Compute model's vertical center so camera targets the center of geometry
  const targetY = Math.max(0.35, ((metadata?.dimensions.height || 100) * initialScale * scaleY * uniformScale) / 2);

  useEffect(() => {
    if (!controlsRef.current) return;

    const dist = 2.4;
    let pos: [number, number, number] = [1.8, 1.2, dist];

    switch (cameraPreset) {
      case 'front':
        pos = [0, targetY, dist + 0.6];
        break;
      case 'back':
        pos = [0, targetY, -dist - 0.6];
        break;
      case 'left':
        pos = [-dist - 0.6, targetY, 0];
        break;
      case 'right':
        pos = [dist + 0.6, targetY, 0];
        break;
      case 'top':
        pos = [0.0001, targetY + 3.2, 0];
        break;
      case 'perspective':
      default:
        pos = [1.8, targetY + 0.7, dist];
        break;
    }

    camera.position.set(...pos);
    controlsRef.current.target.set(0, targetY, 0);
    controlsRef.current.update();
  }, [cameraPreset, camera, targetY]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      minDistance={0.2}
      maxDistance={15}
      target={[0, targetY, 0]}
    />
  );
};

// Model Renderer with Material Overrides & Dynamic Transform
const ModelRenderer: React.FC = () => {
  const loadedModel = useStudioStore((s) => s.loadedModel);
  const initialScale = useStudioStore((s) => s.initialScale);
  const scaleX = useStudioStore((s) => s.scaleX);
  const scaleY = useStudioStore((s) => s.scaleY);
  const scaleZ = useStudioStore((s) => s.scaleZ);
  const uniformScale = useStudioStore((s) => s.uniformScale);
  const rotationX = useStudioStore((s) => s.rotationX);
  const rotationY = useStudioStore((s) => s.rotationY);
  const rotationZ = useStudioStore((s) => s.rotationZ);
  const viewMode = useStudioStore((s) => s.viewMode);
  const materialOverride = useStudioStore((s) => s.materialOverride);
  const appliedSkin = useStudioStore((s) => s.appliedSkin);
  const skinScale = useStudioStore((s) => s.skinScale);
  const theme = useStudioStore((s) => s.theme);

  const isDark = theme === 'dark';
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!loadedModel) return;

    if (appliedSkin?.texture) {
      appliedSkin.texture.repeat.set(skinScale, skinScale);
      appliedSkin.texture.needsUpdate = true;
    }

    loadedModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Auto-generate box UVs if the mesh lacks UV coordinates
        if (mesh.geometry && !mesh.geometry.attributes.uv) {
          const pos = mesh.geometry.attributes.position;
          if (pos) {
            const uvs = new Float32Array(pos.count * 2);
            for (let i = 0; i < pos.count; i++) {
              uvs[i * 2] = pos.getX(i);
              uvs[i * 2 + 1] = pos.getY(i);
            }
            mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
          }
        }

        if (viewMode === 'wireframe') {
          if (!mesh.userData._originalMaterial) {
            mesh.userData._originalMaterial = mesh.material;
          }
          mesh.material = new THREE.MeshBasicMaterial({
            wireframe: true,
            color: isDark ? 0xffffff : 0x000000,
          });
        } else if (viewMode === 'xray') {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: isDark ? 0x60a5fa : 0x3b82f6,
            transparent: true,
            opacity: 0.35,
            wireframe: true,
            side: THREE.DoubleSide,
          });
        } else if (appliedSkin && appliedSkin.texture) {
          if (!mesh.userData._originalMaterial) {
            mesh.userData._originalMaterial = mesh.material;
          }
          mesh.material = new THREE.MeshPhysicalMaterial({
            map: appliedSkin.texture,
            color: 0xffffff,
            roughness: 0.35,
            metalness: 0.15,
            clearcoat: 0.3,
            side: THREE.DoubleSide,
          });
        } else if (materialOverride !== 'original' && MATERIAL_CONFIGS[materialOverride as keyof typeof MATERIAL_CONFIGS]) {
          const cfg = MATERIAL_CONFIGS[materialOverride as keyof typeof MATERIAL_CONFIGS];
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: cfg.color,
            metalness: cfg.metalness,
            roughness: cfg.roughness,
            clearcoat: cfg.clearcoat,
            side: THREE.DoubleSide,
          });
        } else if (mesh.userData._originalMaterial) {
          mesh.material = mesh.userData._originalMaterial;
        }
      }
    });
  }, [loadedModel, viewMode, materialOverride, appliedSkin, skinScale, isDark]);

  if (!loadedModel) return null;

  const totalScaleX = scaleX * uniformScale * initialScale;
  const totalScaleY = scaleY * uniformScale * initialScale;
  const totalScaleZ = scaleZ * uniformScale * initialScale;

  const rotRadX = (rotationX * Math.PI) / 180;
  const rotRadY = (rotationY * Math.PI) / 180;
  const rotRadZ = (rotationZ * Math.PI) / 180;

  return (
    <group
      ref={groupRef}
      scale={[totalScaleX, totalScaleY, totalScaleZ]}
      rotation={[rotRadX, rotRadY, rotRadZ]}
    >
      <primitive object={loadedModel} />
    </group>
  );
};

export const StudioViewport: React.FC = () => {
  const loadedModel = useStudioStore((s) => s.loadedModel);
  const metadata = useStudioStore((s) => s.metadata);
  const theme = useStudioStore((s) => s.theme);
  const showGrid = useStudioStore((s) => s.showGrid);
  const setShowGrid = useStudioStore((s) => s.setShowGrid);
  const lightLevel = useStudioStore((s) => s.lightLevel);
  const cycleLightLevel = useStudioStore((s) => s.cycleLightLevel);
  const isProcessing = useStudioStore((s) => s.isProcessing);
  const processingMessage = useStudioStore((s) => s.processingMessage);
  const errorMessage = useStudioStore((s) => s.errorMessage);
  const loadModelFromFile = useStudioStore((s) => s.loadModelFromFile);
  const leftSidebarOpen = useStudioStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useStudioStore((s) => s.rightSidebarOpen);
  const toggleLeftSidebar = useStudioStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useStudioStore((s) => s.toggleRightSidebar);

  const [isDragOver, setIsDragOver] = useState(false);
  const isDark = theme === 'dark';

  // Light Multiplier according to lightLevel (low = 0.45x, med = 1.0x, high = 1.8x)
  const lightMult = lightLevel === 'low' ? 0.45 : lightLevel === 'high' ? 1.8 : 1.0;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadModelFromFile(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full h-full select-none overflow-hidden transition-colors ${isDark ? 'bg-zinc-950' : 'bg-zinc-50'
        }`}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [1.8, 1.4, 2.4], fov: 45 }}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={[isDark ? '#141417' : '#f4f4f6']} />

        {/* Dynamic Studio Lighting with Low/Med/High Controls */}
        <ambientLight intensity={(isDark ? 0.9 : 1.3) * lightMult} />
        <directionalLight
          position={[6, 9, 6]}
          intensity={(isDark ? 2.8 : 2.4) * lightMult}
          color="#ffffff"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={15}
          shadow-bias={-0.0001}
        />
        <directionalLight
          position={[-6, 4, -4]}
          intensity={(isDark ? 1.4 : 1.0) * lightMult}
          color="#ffffff"
        />
        <directionalLight
          position={[0, 8, -6]}
          intensity={(isDark ? 1.0 : 0.8) * lightMult}
          color="#ffffff"
        />
        <pointLight
          position={[0, 4, 3]}
          intensity={1.5 * lightMult}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <ModelRenderer />

          {/* Seamless Floor Shadow Receiver Plane (No square box border) */}
          <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={isDark ? 0.55 : 0.25} transparent />
          </mesh>

          {/* Seamless Ground Grid */}
          {showGrid && (
            <Grid
              position={[0, -0.002, 0]}
              args={[40, 40]}
              cellSize={0.15}
              cellThickness={0.9}
              cellColor={isDark ? '#27272c' : '#e4e4e7'}
              sectionSize={0.75}
              sectionThickness={1.4}
              sectionColor={isDark ? '#4b4b54' : '#a1a1aa'}
              fadeDistance={28}
              fadeStrength={1.2}
              infiniteGrid
            />
          )}
        </Suspense>

        <CameraPresetController />
      </Canvas>

      {/* Floating Expand Left Sidebar Button (visible when left sidebar is collapsed on desktop) */}
      {!leftSidebarOpen && (
        <div className="hidden md:flex absolute top-4 left-4 z-30">
          <button
            onClick={toggleLeftSidebar}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center backdrop-blur-xl transition-all active:scale-95 shadow-lg ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 shadow-md'
                : 'bg-white/95 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100 shadow-md'
            }`}
            title="Expand Parameters Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        </div>
      )}

      {/* Canvas Right Floating Controls (Vertically stacked outside the Model Inspection panel) */}
      <div className={`absolute top-4 z-30 flex flex-col items-center gap-2.5 transition-all duration-300 ${
        rightSidebarOpen ? 'right-4 md:right-[19.5rem]' : 'right-4 md:right-4'
      }`}>
        {/* Expand Right Sidebar Button (visible when right sidebar is collapsed on desktop) */}
        {!rightSidebarOpen && (
          <button
            onClick={toggleRightSidebar}
            className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full border items-center justify-center backdrop-blur-xl transition-all active:scale-95 shadow-lg ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 shadow-md'
                : 'bg-white/95 border-zinc-300 text-zinc-700 hover:text-black hover:bg-zinc-100 shadow-md'
            }`}
            title="Expand Inspection Sidebar"
          >
            <PanelRightOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>
        )}

        {/* 1st Circular Icon: Ground Grid Toggle */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center backdrop-blur-xl transition-all active:scale-95 shadow-lg ${showGrid
            ? isDark
              ? 'bg-white text-black border-white shadow-white/10 ring-2 ring-white/20'
              : 'bg-black text-white border-black shadow-black/20 ring-2 ring-black/20'
            : isDark
              ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-md'
              : 'bg-white/95 border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-100 shadow-md'
            }`}
          title={showGrid ? 'Hide Ground Grid' : 'Show Ground Grid'}
        >
          <Grid3X3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* 2nd Circular Icon: Light Intensity Cycle (Low -> Med -> High, No text, monochrome) */}
        <button
          onClick={cycleLightLevel}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center backdrop-blur-xl transition-all active:scale-95 shadow-lg ${isDark
            ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-white shadow-md'
            : 'bg-white/95 border-zinc-300 hover:border-zinc-400 hover:bg-zinc-100 text-black shadow-md'
            }`}
          title={`Lighting: ${lightLevel.toUpperCase()} (Click to cycle Low / Medium / High)`}
        >
          {lightLevel === 'low' ? (
            <SunDim className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
          ) : lightLevel === 'med' ? (
            <SunMedium className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-white' : 'text-black'}`} />
          ) : (
            <Sun className={`w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4] ${isDark ? 'text-white' : 'text-black'}`} />
          )}
        </button>
      </div>

      {/* Drag & Drop File HUD Overlay */}
      {isDragOver && (
        <div className="absolute inset-4 z-50 rounded-2xl border-2 border-dashed border-white bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-white gap-3 pointer-events-none animate-fade-in">
          <Upload className="w-12 h-12 text-white animate-bounce" />
          <h3 className="text-xl font-mono font-black uppercase tracking-wider">
            Drop 3D Model File to Load
          </h3>
          <p className="text-xs font-mono text-zinc-400">
            Supports: .OBJ, .STL, .GLB, .GLTF, .FBX, .PLY, .STEP
          </p>
        </div>
      )}

      {/* Processing Spinner Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-3 animate-fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            {processingMessage || 'Parsing 3D CAD Geometry...'}
          </span>
        </div>
      )}

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md px-4 py-2.5 rounded-xl border border-red-800 bg-red-950/90 text-red-200 text-xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Floating Model Info HUD in Viewport */}
      {metadata && !isProcessing && (
        <div className="absolute bottom-3 left-3 z-30 pointer-events-none">
          <div
            className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] uppercase tracking-wider backdrop-blur-md flex items-center gap-3 ${isDark
              ? 'bg-black/80 border-zinc-800 text-zinc-300'
              : 'bg-white/90 border-zinc-200 text-zinc-700 shadow-xs'
              }`}
          >
            <span className="font-bold">{metadata.format}</span>
            <span>•</span>
            <span>{metadata.vertexCount.toLocaleString()} Vertices</span>
            <span>•</span>
            <span>{metadata.triangleCount.toLocaleString()} Polys</span>
          </div>
        </div>
      )}
    </div>
  );
};
