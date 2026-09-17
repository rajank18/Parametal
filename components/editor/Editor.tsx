'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from './Toolbar';
import { ParameterPanel } from './ParameterPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CategorySelectorModal } from './CategorySelectorModal';
import { useDesignStore } from '../../store/desginStore';
import { Sliders, Cpu, Eye, X } from 'lucide-react';

const DynamicViewport = dynamic(() => import('./Viewport').then((mod) => mod.Viewport), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono">Initializing Parametal 3D Engine...</span>
    </div>
  ),
});

export const Editor: React.FC = () => {
  const theme = useDesignStore((s) => s.theme);
  const leftSidebarOpen = useDesignStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useDesignStore((s) => s.rightSidebarOpen);
  const isDark = theme === 'dark';

  // Mobile drawer state: 'viewport' | 'params' | 'specs'
  const [mobileTab, setMobileTab] = useState<'viewport' | 'params' | 'specs'>('viewport');

  return (
    <div
      className={`w-screen h-[100dvh] flex flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      }`}
    >
      {/* Top Navbar */}
      <Toolbar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative pb-14 md:pb-0">
        {/* Full-bleed Center 3D Viewport */}
        <main className="absolute inset-0 w-full h-full relative overflow-hidden">
          <DynamicViewport />
        </main>

        {/* Mobile Backdrop Overlay */}
        {(mobileTab === 'params' || mobileTab === 'specs') && (
          <div
            onClick={() => setMobileTab('viewport')}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          />
        )}

        {/* Left Parameter Panel: Desktop sidebar / Mobile Drawer */}
        <div
          className={`
            fixed md:absolute inset-y-0 left-0 h-full z-50 md:z-20 w-[88vw] max-w-[340px] md:w-80
            transition-transform duration-300 ease-in-out
            ${leftSidebarOpen ? 'md:translate-x-0 md:pointer-events-auto' : 'md:-translate-x-full md:pointer-events-none'}
            ${mobileTab === 'params' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="h-full relative shadow-2xl md:shadow-none pb-14 md:pb-0 pointer-events-auto">
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setMobileTab('viewport')}
              className={`md:hidden absolute top-3.5 right-3 z-30 p-1.5 rounded-lg border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
              }`}
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
            <ParameterPanel />
          </div>
        </div>

        {/* Right Properties Panel: Desktop sidebar / Mobile Drawer */}
        <div
          className={`
            fixed md:absolute inset-y-0 right-0 h-full z-50 md:z-20 w-[88vw] max-w-[320px] md:w-72
            transition-transform duration-300 ease-in-out
            ${rightSidebarOpen ? 'md:translate-x-0 md:pointer-events-auto' : 'md:translate-x-full md:pointer-events-none'}
            ${mobileTab === 'specs' ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          `}
        >
          <div className="h-full relative shadow-2xl md:shadow-none pb-14 md:pb-0 pointer-events-auto">
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setMobileTab('viewport')}
              className={`md:hidden absolute top-3.5 right-3 z-40 p-1.5 rounded-lg border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
              }`}
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
            <PropertiesPanel />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Docking Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around h-14 border-t z-50 px-2 transition-colors ${
        isDark ? 'bg-zinc-950/95 border-zinc-800 text-zinc-400 backdrop-blur-md' : 'bg-white/95 border-zinc-200 text-zinc-600 backdrop-blur-md'
      }`}>
        <button
          onClick={() => setMobileTab('params')}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'params'
              ? isDark ? 'text-white bg-zinc-900' : 'text-black bg-zinc-100'
              : isDark ? 'hover:text-white' : 'hover:text-black'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parameters</span>
        </button>

        <button
          onClick={() => setMobileTab('viewport')}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'viewport'
              ? isDark ? 'text-white bg-zinc-900' : 'text-black bg-zinc-100'
              : isDark ? 'hover:text-white' : 'hover:text-black'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3D View</span>
        </button>

        <button
          onClick={() => setMobileTab('specs')}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'specs'
              ? isDark ? 'text-white bg-zinc-900' : 'text-black bg-zinc-100'
              : isDark ? 'hover:text-white' : 'hover:text-black'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Specs</span>
        </button>
      </nav>

      {/* Object Family Selection Modal */}
      <CategorySelectorModal />
    </div>
  );
};
