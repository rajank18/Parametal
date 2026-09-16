'use client';

import React, { useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Download, Sliders, Box, Layers, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

interface ModelViewerShowcaseProps {
  isDark: boolean;
}

// 3 Interlocking Torus Rings Scene
function InterlockingRings({
  isDark,
  wireframe,
  materialType,
}: {
  isDark: boolean;
  wireframe: boolean;
  materialType: 'black' | 'chrome' | 'gold';
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });

  const getMaterialProps = () => {
    if (wireframe) {
      return {
        wireframe: true,
        color: isDark ? '#ffffff' : '#000000',
      };
    }

    if (materialType === 'chrome') {
      return {
        color: '#e4e4e7',
        metalness: 0.98,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      };
    }

    if (materialType === 'gold') {
      return {
        color: '#d4af37',
        metalness: 0.95,
        roughness: 0.18,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
      };
    }

    // Default: Piano Obsidian Glossy Black (matching user's screenshot)
    return {
      color: '#111113',
      metalness: 0.92,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
    };
  };

  const matProps = getMaterialProps();

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.8}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Ring 1 - Vertical Base */}
        <mesh position={[0, 0, 0]} rotation={[0.4, 0.2, 0]} castShadow receiveShadow>
          <torusGeometry args={[1.05, 0.28, 36, 72]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>

        {/* Ring 2 - Interlocked Angled Right */}
        <mesh position={[0.45, 0.35, 0.25]} rotation={[1.3, 0.6, 0.8]} castShadow receiveShadow>
          <torusGeometry args={[1.05, 0.28, 36, 72]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>

        {/* Ring 3 - Interlocked Angled Left */}
        <mesh position={[-0.45, -0.3, -0.2]} rotation={[-0.8, 0.9, 0.4]} castShadow receiveShadow>
          <torusGeometry args={[1.05, 0.28, 36, 72]} />
          <meshPhysicalMaterial {...matProps} />
        </mesh>
      </group>
    </Float>
  );
}

export const ModelViewerShowcase: React.FC<ModelViewerShowcaseProps> = ({ isDark }) => {
  const [wireframe, setWireframe] = useState(false);
  const [materialType, setMaterialType] = useState<'black' | 'chrome' | 'gold'>('black');
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExportSim = (format: string) => {
    setExportedFormat(format);
    setTimeout(() => setExportedFormat(null), 2500);
  };

  const EXPORT_FORMATS = [
    { ext: '.OBJ', name: 'Wavefront OBJ', desc: 'Universal 3D mesh with vertex normals' },
    { ext: '.GLB', name: 'Binary GLTF', desc: 'Web 3D, AR & real-time PBR standard' },
    { ext: '.STL', name: 'Stereolithography', desc: 'Direct 3D printing & CNC slicing' },
    { ext: '.FBX', name: 'Filmbox CAD', desc: 'Autodesk, Blender & game engines' },
    { ext: '.STEP', name: 'STEP / STP', desc: 'Parametric solid boundary CAD model' },
    { ext: '.DXF', name: 'AutoCAD DXF', desc: '2D flat pattern CNC laser cutting' },
  ];

  return (
    <section className={`py-16 sm:py-24 border-t transition-colors ${
      isDark ? 'bg-black border-zinc-900 text-white' : 'bg-white border-zinc-200 text-black'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest mb-4 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
          }`}>
            <Box className="w-3.5 h-3.5" />
            <span>Universal 3D Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 sm:mb-4 uppercase">
            Universal 3D Model Viewer
          </h2>
          <p className={`max-w-2xl text-xs sm:text-sm font-normal leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Inspect geometry topology, adjust dimensions in real time, and export updated models to any standard 3D CAD or 2D manufacturing format.
          </p>
        </div>

        {/* 2-Column Split: Interactive 3D Canvas + Universal Export Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Interactive 3D Rings Canvas Card (Matching User Screenshot) */}
          <div className="lg:col-span-7 flex flex-col items-center w-full">
            <div className={`relative w-full aspect-square max-w-[540px] rounded-3xl border overflow-hidden transition-all shadow-2xl ${
              isDark
                ? 'bg-zinc-950 border-zinc-800 shadow-black/80'
                : 'bg-zinc-50 border-zinc-200 shadow-black/10'
            }`}>
              {/* 3D WebGL Canvas */}
              <Canvas
                shadows
                camera={{ position: [0, 0, 4.2], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={isDark ? 1.0 : 1.6} />
                <directionalLight position={[6, 8, 6]} intensity={isDark ? 3.8 : 3.0} color="#ffffff" castShadow />
                <directionalLight position={[-6, -4, -4]} intensity={isDark ? 1.8 : 1.2} color="#ffffff" />
                <pointLight position={[0, 4, 3]} intensity={2.2} color="#ffffff" />

                <Suspense fallback={null}>
                  <InterlockingRings isDark={isDark} wireframe={wireframe} materialType={materialType} />

                  <ContactShadows
                    position={[0, -1.5, 0]}
                    opacity={isDark ? 0.6 : 0.35}
                    scale={6}
                    blur={2.5}
                    far={3}
                    color={isDark ? '#000000' : '#27272a'}
                  />
                </Suspense>

                <OrbitControls
                  makeDefault
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={1.5}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={(Math.PI * 3) / 4}
                />
              </Canvas>

              {/* Top Controls Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={() => setWireframe(!wireframe)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border backdrop-blur-md transition-all ${
                      wireframe
                        ? isDark
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black text-white border-black font-bold'
                        : isDark
                        ? 'bg-black/60 border-zinc-800 text-zinc-300 hover:text-white'
                        : 'bg-white/80 border-zinc-300 text-zinc-700 hover:text-black'
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    Wireframe
                  </button>

                  <button
                    onClick={() => setMaterialType(materialType === 'black' ? 'chrome' : 'black')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider border backdrop-blur-md transition-all ${
                      materialType === 'chrome'
                        ? isDark
                          ? 'bg-white text-black border-white font-bold'
                          : 'bg-black text-white border-black font-bold'
                        : isDark
                        ? 'bg-black/60 border-zinc-800 text-zinc-300 hover:text-white'
                        : 'bg-white/80 border-zinc-300 text-zinc-700 hover:text-black'
                    }`}
                  >
                    <Layers className="w-3 h-3 inline mr-1" />
                    {materialType === 'chrome' ? 'Chrome' : 'Obsidian'}
                  </button>
                </div>
              </div>

              {/* Bottom Badges Matching Screenshot: "Interactive 3D (Orbit)" & "Open Studio →" */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div
                  className={`px-2.5 py-1 rounded-md border font-mono text-[10px] tracking-wider uppercase pointer-events-auto backdrop-blur-md ${
                    isDark
                      ? 'bg-black/80 border-zinc-800 text-zinc-400'
                      : 'bg-white/90 border-zinc-200 text-zinc-600 shadow-xs'
                  }`}
                >
                  Interactive 3D (Orbit)
                </div>

                <Link
                  href="/studio"
                  className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-transform hover:translate-x-1 pointer-events-auto px-2.5 py-1 rounded-md ${
                    isDark ? 'text-white hover:text-zinc-200' : 'text-black hover:text-zinc-800'
                  }`}
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: All File Exports & Universal Viewer Capabilities */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Multi-Format CAD Pipeline
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase mb-3">
                All File Exports & Parametric Geometry
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Open and modify models with instant dimensional constraints. When done, download production-ready 3D solid meshes or 2D unfolding flat patterns with a single click.
              </p>
            </div>

            {/* Export Format Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider">
                <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>Supported File Formats</span>
                <span className="text-zinc-500 text-[10px]">Instant Export</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EXPORT_FORMATS.map((fmt) => (
                  <button
                    key={fmt.ext}
                    onClick={() => handleExportSim(fmt.ext)}
                    className={`group p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                      isDark
                        ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                        : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-xs font-black tracking-tight ${
                        isDark ? 'text-white' : 'text-black'
                      }`}>
                        {fmt.ext}
                      </span>
                      <Download className="w-3 h-3 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                    <div className={`text-[9px] font-mono truncate ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {fmt.name}
                    </div>
                  </button>
                ))}
              </div>

              {exportedFormat && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2 rounded-lg border text-center font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Prepared sample {exportedFormat} CAD bundle for download</span>
                </motion.div>
              )}
            </div>

            {/* Core Feature Bullet Points */}
            <div className={`space-y-2 pt-3 border-t ${isDark ? 'border-zinc-900' : 'border-zinc-100'}`}>
              {[
                'Load any 3D model: .OBJ, .GLB, .STL, .FBX, .STEP, .PLY',
                'Live parametric dimension & gauge adjustment engine',
                'Simulate real metals: GI Steel, Mild Steel, Brushed Aluminum',
                'Full 3D CAD Studio with multi-view perspective cameras',
              ].map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-xs">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`} />
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{feat}</span>
                </div>
              ))}
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <Link
                href="/studio"
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xl ${
                  isDark
                    ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5'
                    : 'bg-black text-white hover:bg-zinc-800 shadow-black/15'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Launch 3D Model Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
