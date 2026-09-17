'use client';

import React, { useState, useRef } from 'react';
import { useStudioStore, ViewMode, MaterialOverride, SkinItem } from '../../store/studioStore';
import { Sliders, Maximize2, Layers, RotateCcw, Box, Plus, Image as ImageIcon, Check, Trash2, Sparkles, PanelLeftClose } from 'lucide-react';

export const StudioParameterPanel: React.FC = () => {
  const metadata = useStudioStore((s) => s.metadata);
  const scaleX = useStudioStore((s) => s.scaleX);
  const scaleY = useStudioStore((s) => s.scaleY);
  const scaleZ = useStudioStore((s) => s.scaleZ);
  const uniformScale = useStudioStore((s) => s.uniformScale);
  const rotationX = useStudioStore((s) => s.rotationX);
  const rotationY = useStudioStore((s) => s.rotationY);
  const rotationZ = useStudioStore((s) => s.rotationZ);
  const viewMode = useStudioStore((s) => s.viewMode);
  const materialOverride = useStudioStore((s) => s.materialOverride);
  const appliedSkin = useStudioStore((s) => s.appliedSkin);
  const customSkins = useStudioStore((s) => s.customSkins);
  const skinScale = useStudioStore((s) => s.skinScale);
  const theme = useStudioStore((s) => s.theme);
  const toggleLeftSidebar = useStudioStore((s) => s.toggleLeftSidebar);

  const setScaleX = useStudioStore((s) => s.setScaleX);
  const setScaleY = useStudioStore((s) => s.setScaleY);
  const setScaleZ = useStudioStore((s) => s.setScaleZ);
  const setUniformScale = useStudioStore((s) => s.setUniformScale);
  const setRotationX = useStudioStore((s) => s.setRotationX);
  const setRotationY = useStudioStore((s) => s.setRotationY);
  const setRotationZ = useStudioStore((s) => s.setRotationZ);
  const setViewMode = useStudioStore((s) => s.setViewMode);
  const setMaterialOverride = useStudioStore((s) => s.setMaterialOverride);
  const addSkinFromFile = useStudioStore((s) => s.addSkinFromFile);
  const applySkin = useStudioStore((s) => s.applySkin);
  const removeSkin = useStudioStore((s) => s.removeSkin);
  const setSkinScale = useStudioStore((s) => s.setSkinScale);
  const resetTransform = useStudioStore((s) => s.resetTransform);

  const [activeTab, setActiveTab] = useState<'dimensions' | 'material' | 'skin'>('dimensions');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const sliderClasses = `w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
    isDark ? 'bg-zinc-800 accent-white' : 'bg-zinc-200 accent-black'
  }`;

  const MATERIALS: { id: MaterialOverride; label: string }[] = [
    { id: 'original', label: 'Original 3D Material' },
    { id: 'galvanized', label: 'Galvanized Steel (GI)' },
    { id: 'mild_steel', label: 'Mild Steel' },
    { id: 'aluminum', label: 'Brushed Aluminum' },
    { id: 'obsidian_black', label: 'Obsidian Black Metal' },
    { id: 'gold', label: 'Gold Finish' },
  ];

  const VIEW_MODES: { id: ViewMode; label: string }[] = [
    { id: 'solid', label: 'Solid Mesh' },
    { id: 'wireframe', label: 'Wireframe' },
    { id: 'xray', label: 'X-Ray CAD' },
  ];

  const handleSkinFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await addSkinFromFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col select-none z-10 transition-colors border-r backdrop-blur-md ${
        isDark ? 'bg-zinc-950/80 border-zinc-800 text-white' : 'bg-white/80 border-zinc-200 text-black'
      }`}
    >
      {/* Hidden Skin File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSkinFileSelect}
        accept=".bmp,.png,.jpg,.jpeg,.webp,.tga"
        className="hidden"
      />

      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
            Model Parameters
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetTransform}
            title="Reset Transforms"
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleLeftSidebar}
            title="Collapse Parameters Panel"
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black'
            }`}
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs: Scale | Finish | Skin */}
      <div className={`flex border-b p-1 gap-1 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-100'}`}>
        <button
          onClick={() => setActiveTab('dimensions')}
          className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'dimensions'
              ? isDark
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-black text-white shadow-sm font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Maximize2 className="w-3 h-3" /> Scale
        </button>
        <button
          onClick={() => setActiveTab('material')}
          className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'material'
              ? isDark
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-black text-white shadow-sm font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Layers className="w-3 h-3" /> Finish
        </button>
        <button
          onClick={() => setActiveTab('skin')}
          className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'skin'
              ? isDark
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-black text-white shadow-sm font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          <ImageIcon className="w-3 h-3" /> Skin
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* SCALE TAB */}
        {activeTab === 'dimensions' && (
          <>
            {/* Uniform Scale */}
            <div className="space-y-4">
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Overall Scale
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Uniform Scale Factor</span>
                  <span className="font-mono font-bold">{(uniformScale * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={uniformScale}
                  onChange={(e) => setUniformScale(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>
            </div>

            {/* Dimensional Scaling */}
            <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Axis Scaling (X, Y, Z)
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Width (X-Scale)</span>
                  <span className="font-mono font-bold">{scaleX.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={scaleX}
                  onChange={(e) => setScaleX(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Height (Y-Scale)</span>
                  <span className="font-mono font-bold">{scaleY.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={scaleY}
                  onChange={(e) => setScaleY(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Depth (Z-Scale)</span>
                  <span className="font-mono font-bold">{scaleZ.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.05"
                  value={scaleZ}
                  onChange={(e) => setScaleZ(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>
            </div>

            {/* Model Rotation Angles */}
            <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Orientation Angles
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Pitch (X-Axis)</span>
                  <span className="font-mono font-bold">{rotationX}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={rotationX}
                  onChange={(e) => setRotationX(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Yaw (Y-Axis)</span>
                  <span className="font-mono font-bold">{rotationY}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={rotationY}
                  onChange={(e) => setRotationY(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Roll (Z-Axis)</span>
                  <span className="font-mono font-bold">{rotationZ}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="5"
                  value={rotationZ}
                  onChange={(e) => setRotationZ(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>
            </div>
          </>
        )}

        {/* FINISH TAB */}
        {activeTab === 'material' && (
          <>
            {/* View Mode */}
            <div className="space-y-3">
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Render Mode
              </h3>

              <div className="grid grid-cols-3 gap-1.5">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`py-1.5 px-2 text-[11px] font-mono uppercase tracking-wider rounded-lg border transition-all ${
                      viewMode === mode.id
                        ? isDark
                          ? 'border-white bg-white text-black font-bold'
                          : 'border-black bg-black text-white font-bold'
                        : isDark
                        ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                        : 'border-zinc-200 bg-zinc-100 text-zinc-600 hover:text-black'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Material Overrides */}
            <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Metal Surface Finishes
              </h3>

              <div className="space-y-1.5">
                {MATERIALS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setMaterialOverride(mat.id)}
                    className={`w-full py-2 px-3 text-xs font-mono uppercase tracking-wider text-left rounded-lg border transition-all flex items-center justify-between ${
                      materialOverride === mat.id && !appliedSkin
                        ? isDark
                          ? 'border-white bg-zinc-900 text-white font-bold ring-1 ring-white/20'
                          : 'border-black bg-zinc-100 text-black font-bold ring-1 ring-black/20'
                        : isDark
                        ? 'border-zinc-800/80 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-black'
                    }`}
                  >
                    <span>{mat.label}</span>
                    {materialOverride === mat.id && !appliedSkin && (
                      <span className="w-2 h-2 rounded-full bg-white dark:bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SKIN TAB */}
        {activeTab === 'skin' && (
          <div className="space-y-5">
            <div>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Apply 3D Object Skin (.BMP)
              </h3>
              <p className={`text-[11px] font-mono mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Upload bitmap texture skins to map directly onto the 3D model geometry.
              </p>
            </div>

            {/* Add Skin Button (+) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                isDark
                  ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-500 hover:bg-zinc-900 text-white'
                  : 'border-zinc-300 bg-zinc-50 hover:border-black hover:bg-zinc-100 text-black'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-black'
                }`}
              >
                <Plus className="w-5 h-5" />
              </div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider">
                Add .BMP / Image Skin
              </div>
              <div className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Supports .BMP, .PNG, .JPG, .WEBP
              </div>
            </button>

            {/* Texture UV Repeat Scale Slider */}
            {appliedSkin && (
              <div className={`p-3 rounded-xl border space-y-2 ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex justify-between text-xs font-mono">
                  <span>Skin Texture Repeat</span>
                  <span className="font-bold">{skinScale}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  step="1"
                  value={skinScale}
                  onChange={(e) => setSkinScale(Number(e.target.value))}
                  className={sliderClasses}
                />
              </div>
            )}

            {/* List of Loaded Skins */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono uppercase tracking-wider font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Loaded Skins ({customSkins.length})
                </span>
                {appliedSkin && (
                  <button
                    onClick={() => applySkin(null)}
                    className="text-[10px] font-mono uppercase text-zinc-400 hover:text-white underline"
                  >
                    Clear Active Skin
                  </button>
                )}
              </div>

              {customSkins.length === 0 ? (
                <div className={`p-4 rounded-xl border text-center font-mono text-xs ${isDark ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'}`}>
                  No skins uploaded yet. Click + to add your first .BMP texture.
                </div>
              ) : (
                <div className="space-y-2">
                  {customSkins.map((skin) => {
                    const isSelected = appliedSkin?.id === skin.id;
                    return (
                      <div
                        key={skin.id}
                        className={`group relative p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'border-white bg-zinc-900 shadow-md ring-1 ring-white/20'
                              : 'border-black bg-zinc-100 shadow-md ring-1 ring-black/20'
                            : isDark
                            ? 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-700'
                            : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400'
                        }`}
                        onClick={() => applySkin(skin)}
                      >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 shrink-0">
                          <img
                            src={skin.url}
                            alt={skin.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title / Details */}
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs font-bold truncate">
                            {skin.name}
                          </div>
                          <div className={`text-[10px] font-mono truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {skin.fileName}
                          </div>
                        </div>

                        {/* Status / Delete Button */}
                        <div className="flex items-center gap-1.5">
                          {isSelected && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                              isDark ? 'bg-white text-black' : 'bg-black text-white'
                            }`}>
                              Applied
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSkin(skin.id);
                            }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-red-400' : 'hover:bg-zinc-200 text-zinc-600 hover:text-red-600'
                            }`}
                            title="Delete Skin"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
