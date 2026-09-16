'use client';

import React, { useRef, useState } from 'react';
import { useStudioStore } from '../../store/studioStore';
import { Upload, Box, X, Layers, Sparkles, FileCode, CheckCircle2 } from 'lucide-react';

export const StudioInitialUploadModal: React.FC = () => {
  const loadedModel = useStudioStore((s) => s.loadedModel);
  const isInitialUploadModalOpen = useStudioStore((s) => s.isInitialUploadModalOpen);
  const setInitialUploadModalOpen = useStudioStore((s) => s.setInitialUploadModalOpen);
  const loadModelFromFile = useStudioStore((s) => s.loadModelFromFile);
  const loadSampleModel = useStudioStore((s) => s.loadSampleModel);
  const theme = useStudioStore((s) => s.theme);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const isDark = theme === 'dark';

  if (!isInitialUploadModalOpen) return null;

  const handleClose = () => {
    if (!loadedModel) {
      loadSampleModel('torus');
    }
    setInitialUploadModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadModelFromFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      loadModelFromFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".obj,.stl,.glb,.gltf,.fbx,.ply,.step,.stp"
        className="hidden"
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-lg rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${isDark
          ? 'bg-zinc-950 border-zinc-800 text-white shadow-black/80'
          : 'bg-white border-zinc-200 text-black shadow-2xl'
          }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`absolute top-5 right-5 p-2 rounded-xl border transition-colors ${isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
            : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-200'
            }`}
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
              }`}
          >
            <Box className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-mono font-black uppercase tracking-wider">
            Universal 3D Studio
          </h2>
          <p className={`text-xs font-mono mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Drop your 3D CAD model or select a file from your computer
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${isDragOver
            ? isDark
              ? 'border-white bg-zinc-900'
              : 'border-black bg-zinc-100'
            : isDark
              ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/80'
              : 'border-zinc-300 bg-zinc-50 hover:border-zinc-500 hover:bg-zinc-100'
            }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'
              }`}
          >
            <Upload className="w-5 h-5" />
          </div>
          <div className="font-mono text-xs font-bold uppercase tracking-wider mb-1">
            Drop 3D model file here
          </div>
          <div className={`text-[11px] font-mono mb-4 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            or click to browse your PC
          </div>
        </div>

        {/* Formats Pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {['.OBJ', '.STL', '.GLB', '.GLTF', '.FBX', '.PLY', '.STEP'].map((ext) => (
            <span
              key={ext}
              className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider border ${isDark
                ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                }`}
            >
              {ext}
            </span>
          ))}
        </div>

        {/* Sample Templates Divider */}
        <div className={`my-5 pt-4 border-t flex flex-col items-center ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className={`text-[10px] font-mono uppercase tracking-wider mb-2.5 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
            Or load a demo template
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            {[
              { id: 'torus', label: 'Torus Rings' },
              { id: 'bracket', label: 'L-Bracket' },
              { id: 'cylinder', label: 'Housing CAD' },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => loadSampleModel(tmpl.id)}
                className={`py-2 px-2 rounded-xl border text-center font-mono text-[10px] font-bold uppercase tracking-wider transition-all ${isDark
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-white'
                  : 'bg-zinc-50 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100 text-black'
                  }`}
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
