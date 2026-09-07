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
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono">Initializing Parametal 3D Engine...</span>
    </div>
  ),
});

export const Editor: React.FC = () => {
  const theme = useDesignStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Mobile drawer state: 'viewport' | 'params' | 'specs'
  const [mobileTab, setMobileTab] = useState<'viewport' | 'params' | 'specs'>('viewport');

  return (
    <div
      className={`w-screen h-[100dvh] flex flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Toolbar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative pb-14 md:pb-0">
        {/* Left Parameter Panel: Desktop sidebar (w-80) / Mobile Drawer */}
        <div
          className={`
            fixed md:relative z-20 inset-y-0 left-0 h-full transition-transform duration-300 ease-in-out md:translate-x-0
            ${mobileTab === 'params' ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 w-80'}
          `}
        >
          <div className="h-full relative shadow-2xl md:shadow-none pb-14 md:pb-0">
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setMobileTab('viewport')}
              className="md:hidden absolute top-3 right-3 z-30 p-1.5 rounded-lg bg-zinc-800 text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
            <ParameterPanel />
          </div>
        </div>

        {/* Center 3D Viewport */}
        <main className="flex-1 h-full relative overflow-hidden">
          <DynamicViewport />
        </main>

        {/* Right Properties Panel: Desktop sidebar (w-72) / Mobile Drawer */}
        <div
          className={`
            fixed md:relative z-20 inset-y-0 right-0 h-full transition-transform duration-300 ease-in-out md:translate-x-0
            ${mobileTab === 'specs' ? 'translate-x-0 w-72' : 'translate-x-full md:translate-x-0 w-72'}
          `}
        >
          <div className="h-full relative shadow-2xl md:shadow-none pb-14 md:pb-0">
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setMobileTab('viewport')}
              className="md:hidden absolute top-3 right-3 z-40 p-1.5 rounded-lg bg-zinc-800 text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
            <PropertiesPanel />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Docking Navigation Bar */}
      <nav className={`fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around h-14 border-t z-50 px-2 transition-colors ${
        isDark ? 'bg-zinc-950/95 border-zinc-800 text-zinc-400 backdrop-blur-md' : 'bg-white/95 border-slate-200 text-slate-600 backdrop-blur-md'
      }`}>
        <button
          onClick={() => setMobileTab('params')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'params' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:text-emerald-500'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parameters</span>
        </button>

        <button
          onClick={() => setMobileTab('viewport')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'viewport' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:text-emerald-500'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3D View</span>
        </button>

        <button
          onClick={() => setMobileTab('specs')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'specs' ? 'text-emerald-500 bg-emerald-500/10' : 'hover:text-emerald-500'
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
