'use client';

import React, { useState, useRef } from 'react';
import { useDesignStore } from '../../store/desginStore';
import { Sparkles, Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

export const ImageToDesignModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme = useDesignStore((s) => s.theme);
  const isDark = theme === 'dark';

  const setActiveCategory = useDesignStore((s) => s.setActiveCategory);
  const updateParameters = useDesignStore((s) => s.updateParameters);
  const updateSeatingParameters = useDesignStore((s) => s.updateSeatingParameters);
  const updatePartitionParameters = useDesignStore((s) => s.updatePartitionParameters);
  const updateSculpturalParameters = useDesignStore((s) => s.updateSculpturalParameters);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: selectedImage }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to analyze image with AI model.');
      }

      const { activeCategory, parameters, seatingParameters, partitionParameters, sculpturalParameters } = resData.data;

      if (activeCategory) {
        setActiveCategory(activeCategory);
      }

      if (parameters) {
        updateParameters(parameters);
      }
      if (seatingParameters) {
        updateSeatingParameters(seatingParameters);
      }
      if (partitionParameters) {
        updatePartitionParameters(partitionParameters);
      }
      if (sculpturalParameters) {
        updateSculpturalParameters(sculpturalParameters);
      }

      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error('AI Image Analysis error:', err);
      setErrorMsg(err.message || 'Error communicating with OpenRouter AI vision model.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Image to 3D Parametric</h2>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Upload a photo to extract structured parameters & render immediately
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900/30 hover:border-emerald-500/50 hover:bg-zinc-900/60'
                  : 'border-slate-300 bg-slate-50 hover:border-emerald-500/50 hover:bg-slate-100'
              }`}
            >
              <div className={`p-3 rounded-full mb-3 ${isDark ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold mb-1">Click or drag image to analyze</p>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
                Supports PNG, JPG, WEBP photos of lamps, chairs, dividers & furniture
              </p>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-black/40 group max-h-64 flex items-center justify-center">
              <img src={selectedImage} alt="Selected preview" className="object-contain max-h-64 w-full" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-4 border-t flex items-center justify-between ${
            isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-colors ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleAnalyzeImage}
            disabled={!selectedImage || isLoading}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate 3D Model</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
