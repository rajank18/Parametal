'use client';

import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { MetalObject } from '../scene/MetalObject';
import { Handles } from '../scene/Handles';
import { useDesignStore } from '../../store/desginStore';

const CameraPresetController: React.FC = () => {
    const cameraPreset = useDesignStore((s) => s.cameraPreset);
    const activeCategory = useDesignStore((s) => s.activeCategory);
    const { camera } = useThree();
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const [autoRotate, setAutoRotate] = React.useState(true);

    const isSeating = activeCategory === 'seating';
    const targetY = isSeating ? 0.45 : 0.75;
    const initDist = isSeating ? 2.1 : 1.9;

    // Reset auto-rotate whenever the object category changes
    useEffect(() => {
        setAutoRotate(true);
    }, [activeCategory]);

    useEffect(() => {
        if (!controlsRef.current) return;

        const target: [number, number, number] = [0, targetY, 0];
        let pos: [number, number, number] = [1.6, 1.0, initDist];

        switch (cameraPreset) {
            case 'front':
                pos = [0, targetY, initDist + 0.4];
                break;
            case 'back':
                pos = [0, targetY, -initDist - 0.4];
                break;
            case 'left':
                pos = [-initDist - 0.4, targetY, 0];
                break;
            case 'right':
                pos = [initDist + 0.4, targetY, 0];
                break;
            case 'top':
                pos = [0.0001, 2.8, 0];
                break;
            case 'perspective':
            default:
                pos = [1.6, 1.0, initDist];
                break;
        }

        camera.position.set(...pos);
        controlsRef.current.target.set(...target);
        controlsRef.current.update();
    }, [cameraPreset, activeCategory, camera, targetY, initDist]);

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            minDistance={0.5}
            maxDistance={5}
            target={[0, targetY, 0]}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            onStart={() => setAutoRotate(false)}
        />
    );
};

export const Viewport: React.FC = () => {
    const showReferenceOverlay = useDesignStore((s) => s.showReferenceOverlay);
    const activeCategory = useDesignStore((s) => s.activeCategory);
    const theme = useDesignStore((s) => s.theme);
    const studioLightRotation = useDesignStore((s) => s.studioLightRotation || 45);

    const isDark = theme === 'dark';
    const isSeating = activeCategory === 'seating';

    // 360-Degree Studio Light Rig Position Calculations
    const rad = (studioLightRotation * Math.PI) / 180;
    const lightRadius = 4.2;
    const keyX = Math.cos(rad) * lightRadius;
    const keyZ = Math.sin(rad) * lightRadius;
    const fillX = -keyX * 0.8;
    const fillZ = -keyZ * 0.8;

    return (
        <div
            className={`relative w-full h-full select-none overflow-hidden transition-colors ${isDark ? 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-black' : 'bg-gradient-to-b from-slate-100 via-slate-50 to-white'
                }`}
        >
            {/* 3D Canvas */}
            <Canvas
                shadows
                camera={{ position: [1.6, 1.0, 2.1], fov: 45 }}
                gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
            >
                <color attach="background" args={[isDark ? '#09090b' : '#ffffff']} />

                {/* 360° Studio Lighting Rig with Bright White Lights */}
                <hemisphereLight
                    color="#ffffff"
                    groundColor={isDark ? '#09090b' : '#e2e8f0'}
                    intensity={isDark ? 0.6 : 0.9}
                />

                {/* Dynamic 360° Bright White Key Light with High-Resolution Blender-Quality Shadows */}
                <directionalLight
                    position={[keyX, 4.5, keyZ]}
                    intensity={isDark ? 2.6 : 2.0}
                    color="#ffffff"
                    castShadow
                    shadow-mapSize={[4096, 4096]}
                    shadow-camera-near={0.5}
                    shadow-camera-far={12}
                    shadow-camera-left={-2.5}
                    shadow-camera-right={2.5}
                    shadow-camera-top={2.5}
                    shadow-camera-bottom={-2.5}
                    shadow-bias={-0.00005}
                />

                {/* 360° Opposite Soft Fill & Rim Lights */}
                <directionalLight position={[fillX, 2.5, fillZ]} intensity={isDark ? 0.8 : 0.7} color="#ffffff" />
                <directionalLight position={[0, 6, 0]} intensity={isDark ? 0.6 : 0.5} color="#ffffff" />

                <Suspense fallback={null}>
                    {/* Floor Object */}
                    <group position={[0, 0, 0]}>
                        <MetalObject />
                        <Handles />
                    </group>

                    {/* Pure White/Dark Studio Ground Plane */}
                    <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[100, 100]} />
                        <meshBasicMaterial color={isDark ? '#09090b' : '#ffffff'} />
                    </mesh>

                    {/* Studio Floor Directional Shadow Receiver Plane */}
                    <mesh position={[0, -0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[20, 20]} />
                        <shadowMaterial opacity={isDark ? 0.75 : 0.35} />
                    </mesh>

                    {/* Floor Grid at Y=0 */}
                    <Grid
                        position={[0, -0.001, 0]}
                        args={[20, 20]}
                        cellSize={0.1}
                        cellThickness={0.8}
                        cellColor={isDark ? '#27272a' : '#e2e8f0'}
                        sectionSize={0.5}
                        sectionThickness={1.2}
                        sectionColor={isDark ? '#3f3f46' : '#cbd5e1'}
                        fadeDistance={12}
                        infiniteGrid
                    />
                </Suspense>

                <CameraPresetController />
            </Canvas>

            {/* Reference Image Overlay Modal */}
            {showReferenceOverlay && (
                <div
                    className={`absolute top-4 right-4 z-20 w-80 rounded-xl border backdrop-blur-md p-3 shadow-2xl transition-all ${isDark ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100' : 'bg-white/90 border-slate-300 text-slate-900'
                        }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            {isSeating ? 'Reference Seating Blueprint' : 'Reference Lamp Blueprint'}
                        </span>
                    </div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-zinc-800 bg-black">
                        <img
                            src={isSeating ? '/images/references/seating.png' : '/images/references/lamp.png'}
                            alt="Parametal Reference Blueprint"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
