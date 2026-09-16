'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Box, Upload, ArrowRight, Layers, Sliders, FileCode, CheckCircle2, Download, Sparkles } from 'lucide-react';

export const CorePillars: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <section className={`py-16 sm:py-24 border-t transition-colors ${
      isDark ? 'bg-black border-zinc-900' : 'bg-zinc-50 border-zinc-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest mb-4 border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
          }`}>
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Overview</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 sm:mb-4 uppercase">
            3D Viewer & Parametric Engine
          </h2>
          <p className={`max-w-2xl text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Load your 3D models in any format, adjust dimensions and geometry in real-time, and export production-ready CAD files.
          </p>
        </div>

        {/* 2-Column Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Pillar 1: Universal 3D Model File Viewer (Primary Purpose) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
              isDark
                ? 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-500'
                : 'bg-white border-zinc-200 hover:border-black shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${
                  isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                }`}>
                  Core Engine
                </span>
              </div>

              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Main Functionality
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-3 uppercase">
                Universal 3D Model Viewer
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                Drop any 3D model file directly into your browser. View wireframe topology, inspect normals, adjust dimensional scales and parametric bounds in real time, and export updated CAD files instantly.
              </p>

              <div className={`space-y-2.5 pt-4 border-t mb-8 ${isDark ? 'border-zinc-900' : 'border-zinc-100'}`}>
                {[
                  'Supports any 3D format: .OBJ, .GLB, .GLTF, .STL, .FBX, .STEP, .PLY',
                  'Dynamic dimensional scaling & parametric geometry adjustments',
                  'Real-time physical materials (GI Steel, Mild Steel, Brushed Aluminum)',
                  'Export updated models to .OBJ, .STL, .GLB, .FBX, and 2D DXF flat patterns',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`p-3 rounded-lg border text-center font-mono text-xs uppercase tracking-wider ${
              isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
            }`}>
              Multi-Format Drag & Drop Viewer Enabled
            </div>
          </motion.div>

          {/* Pillar 2: Premade Parametric Object Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all ${
              isDark
                ? 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-500'
                : 'bg-white border-zinc-200 hover:border-black shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
                }`}>
                  <Box className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}>
                  Working Templates
                </span>
              </div>

              <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Example Templates
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-3 uppercase">
                Premade Object Examples
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                Ready-to-use procedural templates demonstrating the parametric engine. Modify curves, sheet gauges, leg heights, and test real-time CNC unbending & 3D exports.
              </p>

              <div className={`space-y-2.5 pt-4 border-t mb-8 ${isDark ? 'border-zinc-900' : 'border-zinc-100'}`}>
                {[
                  '6 Pre-Engineered Families: Lamps, Chairs, Dividers, Tables, Storage, Sconces',
                  'Live Catmull-Rom spline direct vertex manipulation gizmos',
                  'Automatic 2D sheet metal unfolding with K-factors for CNC press brakes',
                  'Instant download of updated 3D meshes and 2D DXF flat patterns',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
                    <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/objects"
              className={`flex items-center justify-center gap-2 p-3 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                isDark
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-md shadow-white/5'
                  : 'bg-black text-white hover:bg-zinc-800 shadow-md shadow-black/10'
              }`}
            >
              <span>Explore Premade Object Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
