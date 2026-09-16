'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { StudioNavbar } from './StudioNavbar';
import { StudioParameterPanel } from './StudioParameterPanel';
import { StudioPropertiesPanel } from './StudioPropertiesPanel';
import { StudioInitialUploadModal } from './StudioInitialUploadModal';
import { useStudioStore } from '../../store/studioStore';
import { Sliders, Cpu, Eye, X } from 'lucide-react';

const DynamicStudioViewport = dynamic(
  () => import('./StudioViewport').then((mod) => mod.StudioViewport),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Initializing Parametal 3D Studio...</span>
      </div>
    ),
  }
);

export const StudioEditor: React.FC = () => {
  const theme = useStudioStore((s) => s.theme);
  const leftSidebarOpen = useStudioStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useStudioStore((s) => s.rightSidebarOpen);
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
      <StudioNavbar />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative pb-14 md:pb-0">
        {/* Full-bleed Center 3D Viewport */}
        <main className="absolute inset-0 w-full h-full relative overflow-hidden">
          <DynamicStudioViewport />
        </main>

        {/* Left Parameter Panel: Desktop translucent sidebar (w-80) / Mobile Drawer */}
        <div
          className={`
            absolute z-20 inset-y-0 left-0 h-full transition-transform duration-300 ease-in-out
            ${leftSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full pointer-events-none'}
            ${mobileTab === 'params' ? 'translate-x-0 w-80' : '-translate-x-full w-80'}
          `}
        >
          <div className="h-full relative shadow-2xl md:shadow-none pb-14 md:pb-0 pointer-events-auto">
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setMobileTab('viewport')}
              className={`md:hidden absolute top-3 right-3 z-30 p-1.5 rounded-lg border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
            <StudioParameterPanel />
          </div>
        </div>

        {/* Right Properties Panel: Desktop translucent sidebar (w-72) / Mobile Drawer */}
        <div
          className={`
            absolute z-20 inset-y-0 right-0 h-full transition-transform duration-300 ease-in-out
            ${rightSidebarOpen ? 'md:translate-x-0' : 'md:translate-x-full pointer-events-none'}
            ${mobileTab === 'specs' ? 'translate-x-0 w-72' : 'translate-x-full w-72'}
          `}
        >
          <div className="h-full relative shadow-2xl md:shadow-none pb-14 md:pb-0 pointer-events-auto">
            {/* Mobile close button inside drawer */}
            <button
              onClick={() => setMobileTab('viewport')}
              className={`md:hidden absolute top-3 right-3 z-40 p-1.5 rounded-lg border ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
            <StudioPropertiesPanel />
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Docking Navigation Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 md:hidden flex items-center justify-around h-14 border-t z-50 px-2 transition-colors ${
          isDark
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-400 backdrop-blur-md'
            : 'bg-white/95 border-zinc-200 text-zinc-600 backdrop-blur-md'
        }`}
      >
        <button
          onClick={() => setMobileTab('params')}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'params'
              ? isDark
                ? 'text-white bg-zinc-900'
                : 'text-black bg-zinc-100'
              : isDark
              ? 'hover:text-white'
              : 'hover:text-black'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Parameters</span>
        </button>

        <button
          onClick={() => setMobileTab('viewport')}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'viewport'
              ? isDark
                ? 'text-white bg-zinc-900'
                : 'text-black bg-zinc-100'
              : isDark
              ? 'hover:text-white'
              : 'hover:text-black'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>3D View</span>
        </button>

        <button
          onClick={() => setMobileTab('specs')}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold py-1 px-4 rounded-xl transition-colors ${
            mobileTab === 'specs'
              ? isDark
                ? 'text-white bg-zinc-900'
                : 'text-black bg-zinc-100'
              : isDark
              ? 'hover:text-white'
              : 'hover:text-black'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Specs</span>
        </button>
      </nav>

      {/* Initial Drop/Upload Modal Popup */}
      <StudioInitialUploadModal />
    </div>
  );
};
