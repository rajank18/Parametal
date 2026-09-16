'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, ChevronDown, Box } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';

export const ModelUploadDropdown: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadModelFromFile = useStudioStore((s) => s.loadModelFromFile);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOpen(false);
      await loadModelFromFile(file);
      router.push('/studio');
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".obj,.stl,.glb,.gltf,.fbx,.step,.stp,.ply"
        className="hidden"
      />

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-500 shadow-xl shadow-black/40 backdrop-blur-md'
            : 'bg-white/90 border-zinc-300 text-black hover:bg-zinc-100 hover:border-black shadow-lg shadow-zinc-300/40 backdrop-blur-md'
        }`}
      >
        <Upload className="w-3.5 h-3.5 shrink-0" />
        <span>View 3D Model</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown / Dropzone Panel */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-[300px] sm:w-[340px] rounded-xl border p-4 shadow-2xl z-50 transition-all animate-fade-in ${
            isDark
              ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 backdrop-blur-2xl'
              : 'bg-white/95 border-zinc-200 text-zinc-900 shadow-2xl backdrop-blur-2xl'
          }`}
        >
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                3D File Viewer
              </span>
            </div>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
            }`}>
              Upcoming
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDark
                ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900/80'
                : 'border-zinc-300 bg-zinc-50 hover:border-black hover:bg-zinc-100'
            }`}
          >
            <div className={`p-2.5 rounded-full mb-2 ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'}`}>
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold mb-1">
              Drop 3D file or click to browse
            </p>
            <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              .OBJ, .GLB, .GLTF, .STL, .FBX, .STEP, .PLY
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-400 leading-relaxed">
            Universal client-side multi-format CAD mesh visualizer with wireframe, lighting & measurement inspection.
          </div>
        </div>
      )}
    </div>
  );
};
