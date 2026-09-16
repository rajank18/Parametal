'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDesignStore } from '../store/desginStore';
import { SmoothScroll } from '../components/landing/SmoothScroll';
import { Navbar } from '../components/landing/Navbar';
import { ModelUploadDropdown } from '../components/landing/ModelUploadDropdown';
import { CorePillars } from '../components/landing/CorePillars';
import { ModelViewerShowcase } from '../components/landing/ModelViewerShowcase';
import { ObjectCatalogGrid } from '../components/landing/ObjectCatalogGrid';
import { Footer } from '../components/landing/Footer';
import { Box, ArrowRight, Sparkles } from 'lucide-react';

import { Interactive3DText } from '../components/landing/Interactive3DText';

export default function LandingPage() {
  const theme = useDesignStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <SmoothScroll>
      <div
        className={`min-h-screen flex flex-col font-sans selection:bg-white selection:text-black transition-colors ${isDark ? 'bg-black text-white' : 'bg-white text-black'
          }`}
      >
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col items-center justify-center text-center">
          {/* Subtle Ambient Monochrome Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[220px] sm:h-[320px] bg-white/[0.03] blur-[100px] rounded-full pointer-events-none" />

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center max-w-4xl mx-auto w-full"
          >
            {/* Pill Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest mb-4 sm:mb-6 border ${isDark
                ? 'bg-zinc-950 border-zinc-800 text-zinc-300'
                : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Universal 3D Model Viewer & Editor Studio</span>
            </div>

            {/* Interactive CAD Typography for PARAMETAL (Wireframe/Mesh on hover, + cursor, dynamic spotlight glow) */}
            <div className="w-full mb-3 sm:mb-4">
              <Interactive3DText isDark={isDark} />
            </div>

            {/* 1-Line Core Site Description */}
            <p className={`text-xs sm:text-sm lg:text-base leading-relaxed max-w-3xl mb-8 sm:mb-10 font-normal px-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
              Universal 3D model file viewer to inspect any format, dynamically resize dimensions & parametric variables in real-time, and export updated CAD files — featuring premade architectural objects as working templates.
            </p>

            {/* The 2 Primary Hero Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto mb-10 sm:mb-14">
              {/* Button 1: View 3D Model with File Selector Dropdown */}
              <ModelUploadDropdown isDark={isDark} />

              {/* Button 2: Premade Objects (Direct link to /objects studio) */}
              <Link
                href="/objects"
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-xl ${isDark
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5'
                  : 'bg-black text-white hover:bg-zinc-800 shadow-black/15'
                  }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Premade Objects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className={`grid grid-cols-3 gap-3 sm:gap-8 pt-6 border-t w-full max-w-lg ${isDark ? 'border-zinc-800/80' : 'border-zinc-200'
              }`}>
              <div>
                <div className="text-base sm:text-xl font-black font-mono tracking-tight">Any 3D File</div>
                <div className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  .OBJ .GLB .STL .FBX
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-black font-mono tracking-tight">Parametric</div>
                <div className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Resize & Export
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-black font-mono tracking-tight">6 Templates</div>
                <div className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Premade Objects
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 1: 3D Viewer & Parametric Engine (Platform Overview) */}
        <CorePillars isDark={isDark} />

        {/* Section 2: 3D Model Viewer & Editor with All File Exports (Interactive 3 Rings Orbit Canvas) */}
        <ModelViewerShowcase isDark={isDark} />

        {/* Section 3: PARAMETRIC FAMILIES (Object Catalog Grid) */}
        <ObjectCatalogGrid isDark={isDark} />

        {/* Section 4: Bottom Call to Action Banner */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className={`rounded-2xl border p-6 sm:p-12 text-center relative overflow-hidden flex flex-col items-center ${isDark
            ? 'bg-zinc-950 border-zinc-800 text-white'
            : 'bg-zinc-50 border-zinc-200 text-black shadow-xs'
            }`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center mb-4 sm:mb-6 ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
              }`}>
              <Box className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-2 sm:mb-3 uppercase">
              View Any 3D Model or Customize Premade Templates
            </h2>
            <p className={`max-w-xl text-xs sm:text-sm mb-6 sm:mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Inspect 3D assets, adjust parametric dimensions, and export production-ready 3D CAD (.OBJ, .STL, .GLB, .FBX) or 2D DXF flat patterns.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/objects"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isDark
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5'
                  : 'bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10'
                  }`}
              >
                <span>Launch Premade Objects Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer isDark={isDark} />
      </div>
    </SmoothScroll>
  );
}
