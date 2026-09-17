'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Box, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { useStudioStore } from '../../store/studioStore';

export const ModelUploadDropdown: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadModelFromFile = useStudioStore((s) => s.loadModelFromFile);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadModelFromFile(file);
      router.push('/studio');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await loadModelFromFile(file);
      router.push('/studio');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="relative inline-flex items-center justify-center" ref={cardRef}>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".obj,.stl,.glb,.gltf,.fbx,.step,.stp,.ply"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* Button State */
          <motion.button
            key="upload-btn"
            layoutId="model-uploader"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={() => setIsOpen(true)}
            className={`flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border cursor-pointer ${
              isDark
                ? 'bg-zinc-900/90 border-zinc-700 text-white hover:bg-zinc-800 hover:border-zinc-500 shadow-xl shadow-black/40 backdrop-blur-md'
                : 'bg-white/90 border-zinc-300 text-black hover:bg-zinc-100 hover:border-black shadow-lg shadow-zinc-300/40 backdrop-blur-md'
            }`}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>View 3D Model</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
            }`}>
              Any 3D
            </span>
          </motion.button>
        ) : (
          /* In-Place Morphed Card State */
          <motion.div
            key="upload-card"
            layoutId="model-uploader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`w-[320px] sm:w-[380px] rounded-2xl border p-4 sm:p-5 shadow-2xl z-30 transition-colors text-left ${
              isDark
                ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-black/80 backdrop-blur-2xl'
                : 'bg-white/95 border-zinc-300 text-zinc-900 shadow-xl backdrop-blur-2xl'
            }`}
          >
            {/* Header with Title & Close (X) */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
                }`}>
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider block">
                    3D Model Viewer
                  </span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Drop or pick any 3D asset
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white'
                    : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black'
                }`}
                title="Close and return to button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? isDark
                    ? 'border-white bg-zinc-900'
                    : 'border-black bg-zinc-100'
                  : isDark
                  ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900/70'
                  : 'border-zinc-300 bg-zinc-50 hover:border-black hover:bg-zinc-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'
              }`}>
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold font-mono uppercase tracking-wide mb-1">
                Drop 3D file or browse
              </p>
              <p className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Supports .OBJ, .GLB, .GLTF, .STL, .FBX, .STEP, .PLY
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 py-2 px-3 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800'
                }`}
              >
                <span>Select From Device</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

