'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useStudioStore, CameraPreset } from '../../store/studioStore';
import { Box, Upload, Camera, Sun, Moon, Download, Eye, RotateCcw, ArrowLeft, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Sliders, Cpu } from 'lucide-react';

export const StudioNavbar: React.FC = () => {
  const metadata = useStudioStore((s) => s.metadata);
  const theme = useStudioStore((s) => s.theme);
  const setTheme = useStudioStore((s) => s.setTheme);
  const cameraPreset = useStudioStore((s) => s.cameraPreset);
  const setCameraPreset = useStudioStore((s) => s.setCameraPreset);
  const viewMode = useStudioStore((s) => s.viewMode);
  const setViewMode = useStudioStore((s) => s.setViewMode);
  const showBoundingBox = useStudioStore((s) => s.showBoundingBox);
  const setShowBoundingBox = useStudioStore((s) => s.setShowBoundingBox);
  const loadModelFromFile = useStudioStore((s) => s.loadModelFromFile);
  const resetTransform = useStudioStore((s) => s.resetTransform);
  const setInitialUploadModalOpen = useStudioStore((s) => s.setInitialUploadModalOpen);
  const leftSidebarOpen = useStudioStore((s) => s.leftSidebarOpen);
  const rightSidebarOpen = useStudioStore((s) => s.rightSidebarOpen);
  const toggleLeftSidebar = useStudioStore((s) => s.toggleLeftSidebar);
  const toggleRightSidebar = useStudioStore((s) => s.toggleRightSidebar);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const presets: { id: CameraPreset; label: string }[] = [
    { id: 'perspective', label: 'Perspective' },
    { id: 'front', label: 'Front' },
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
    { id: 'top', label: 'Top' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadModelFromFile(file);
    }
  };

  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUrl);
    downloadAnchor.setAttribute('download', `${metadata?.fileName || '3d_model'}_render.png`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <header
      className={`h-14 sm:h-16 px-2.5 sm:px-6 flex items-center justify-between select-none z-30 transition-colors backdrop-blur-xl w-full max-w-full overflow-x-hidden ${
        isDark ? 'bg-black/85 text-white' : 'bg-white/85 text-black'
      }`}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".obj,.stl,.glb,.gltf,.fbx,.ply,.step,.stp"
        className="hidden"
      />

      {/* Brand & File Upload Launcher */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
          title="Return to Landing Page"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
            <img src="/logo.ico" alt="Parametal Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-mono text-base sm:text-2xl font-black uppercase">
            PARAMETAL
          </span>
        </Link>

        {/* Upload File Button */}
        <button
          onClick={() => setInitialUploadModalOpen(true)}
          className={`flex items-center gap-1 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-95 border shrink-0 ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-200 text-black hover:bg-zinc-200'
          }`}
          title="Upload or Change 3D Model File"
        >
          <Upload className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Upload 3D File</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </div>

      {/* Camera Presets Selector (Desktop) */}
      <div
        className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-colors ${
          isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}
      >
        <Camera className={`w-3.5 h-3.5 ml-2 mr-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setCameraPreset(p.id)}
            className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-lg font-medium transition-all ${
              cameraPreset === p.id
                ? isDark
                  ? 'bg-white text-black shadow-sm font-bold'
                  : 'bg-black text-white shadow-sm font-bold'
                : isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-zinc-600 hover:text-black'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* View Toggles & Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div
          className={`flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border transition-colors ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          {/* Wireframe Mode Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'wireframe' ? 'solid' : 'wireframe')}
            className={`p-1 sm:px-2.5 sm:py-1 text-xs font-mono uppercase tracking-wider rounded-md sm:rounded-lg font-medium transition-all ${
              viewMode === 'wireframe'
                ? isDark
                  ? 'bg-white text-black font-bold'
                  : 'bg-black text-white font-bold'
                : isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-zinc-600 hover:text-black'
            }`}
            title="Toggle Wireframe Mode"
          >
            <Eye className="w-3.5 h-3.5 inline sm:mr-1" />
            <span className="hidden md:inline">Wireframe</span>
          </button>

          {/* Bounding Box Toggle */}
          <button
            onClick={() => setShowBoundingBox(!showBoundingBox)}
            className={`p-1 sm:px-2.5 sm:py-1 text-xs font-mono uppercase tracking-wider rounded-md sm:rounded-lg font-medium transition-all ${
              showBoundingBox
                ? isDark
                  ? 'bg-white text-black font-bold'
                  : 'bg-black text-white font-bold'
                : isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-zinc-600 hover:text-black'
            }`}
            title="Toggle Bounding Box"
          >
            <Box className="w-3.5 h-3.5 inline sm:mr-1" />
            <span className="hidden md:inline">Bounds</span>
          </button>

          {/* Reset Transform */}
          <button
            onClick={resetTransform}
            className={`p-1 sm:p-1.5 text-xs rounded-md sm:rounded-lg transition-all ${
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'
            }`}
            title="Reset Transform & Scale"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-200'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />}
        </button>

        {/* Capture PNG Snapshot */}
        <button
          onClick={handleExportPNG}
          className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 border text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-colors ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white'
              : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-black'
          }`}
          title="Capture 3D View Render"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">Capture</span>
        </button>
      </div>
    </header>
  );
};
