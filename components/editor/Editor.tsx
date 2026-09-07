'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from './Toolbar';
import { ParameterPanel } from './ParameterPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CategorySelectorModal } from './CategorySelectorModal';
import { useDesignStore } from '../../store/desginStore';

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

  return (
    <div
      className={`w-screen h-screen flex flex-col overflow-hidden font-sans transition-colors ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <Toolbar />
      <div className="flex-1 flex overflow-hidden relative">
        <ParameterPanel />
        <main className="flex-1 h-full relative">
          <DynamicViewport />
        </main>
        <PropertiesPanel />
      </div>

      {/* Object Family Selection Modal on initial load */}
      <CategorySelectorModal />
    </div>
  );
};
