'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileCode, Download, Sparkles, Sun, Wrench, ShieldCheck, Zap } from 'lucide-react';

export const FabricationFeatures: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const features = [
    {
      icon: FileCode,
      title: '2D DXF Flat Patterns',
      description: 'Instant unfolding engine generates clean 2D flat patterns with bend deductions, K-factors, and punch hole locations for CNC press brakes and laser cutters.',
      badge: 'CNC Ready',
    },
    {
      icon: Download,
      title: 'Universal 3D CAD Export',
      description: 'Export clean isolated geometry directly to .OBJ, .STL (binary for 3D printing & CAM), .GLB (glTF 2.0 PBR), and .FBX for Autodesk & Blender workflows.',
      badge: '.OBJ / .STL / .FBX / .GLB',
    },
    {
      icon: Sparkles,
      title: 'Physically Based Shaders',
      description: 'Real-time physically accurate materials with customizable roughness, metalness, and clearcoat for Galvanized Steel (GI), Mild Steel, and Brushed Aluminum.',
      badge: 'PBR Shaders',
    },
    {
      icon: Wrench,
      title: 'Direct Vertex Gizmos',
      description: 'Interactive 3D handles allow smooth direct manipulation of canopy vertices with proportional cosine falloff propagation across neighbor points.',
      badge: 'Interactive CAD',
    },
    {
      icon: Sun,
      title: '360° Studio Lighting Rig',
      description: 'Full-spectrum dual key and fill orbital studio lights with real-time angle controls and directional contact shadows for realistic design previews.',
      badge: 'Studio Rig',
    },
    {
      icon: ShieldCheck,
      title: 'Zero Artifact Geometry',
      description: 'Deterministic geometry compiler guarantees manifold surfaces with uniform sheet gauge, finite bounds, and automatic normal vector recalculation.',
      badge: '100% Manifold',
    },
  ];

  return (
    <section id="fabrication" className={`py-16 sm:py-24 border-t transition-colors ${
      isDark ? 'bg-black/90 border-zinc-900' : 'bg-zinc-50 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest mb-4 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
          }`}>
            <Zap className="w-3.5 h-3.5" />
            <span>Fabrication & Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 sm:mb-4">
            INDUSTRIAL PRECISION
          </h2>
          <p className={`max-w-2xl text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Built from first principles for sheet metal manufacturers, industrial designers, and computational architects.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;

            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-xl border p-5 sm:p-6 flex flex-col justify-between transition-all ${
                  isDark ? 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-600' : 'bg-white border-zinc-200 hover:border-zinc-400 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`p-2.5 rounded-lg border ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
                    }`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold mb-1.5 tracking-tight">
                    {f.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {f.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
