'use client';

import React, { useMemo } from 'react';
import { useDesignStore } from '../../store/desginStore';
import { generateCanopyGeometry } from '../../geometry/panels';
import { MATERIAL_PRESETS } from '../scene/MetalObject';
import { Info, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const parameters = useDesignStore((s) => s.parameters);
  const controlPoints = useDesignStore((s) => s.controlPoints);
  const theme = useDesignStore((s) => s.theme);

  const isDark = theme === 'dark';

  const meshData = useMemo(() => {
    return generateCanopyGeometry(parameters, controlPoints);
  }, [parameters, controlPoints]);

  const matConfig = MATERIAL_PRESETS[parameters.materialType] || MATERIAL_PRESETS.galvanized;

  const volumeMm3 = meshData.surfaceAreaMm2 * parameters.thickness;
  const weightKg = (volumeMm3 * 0.00785) / 1000;

  const isWidthValid = meshData.boundingWidth <= 1500;
  const isDepthValid = meshData.boundingDepth <= 1000;
  const isCurvatureSafe = parameters.curveDepth <= 180;

  return (
    <div
      className={`w-72 h-full flex flex-col select-none z-10 transition-colors border-l ${
        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center gap-2 ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
        <Cpu className="w-4 h-4 text-emerald-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wider">Fabrication Specs</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Physical Metrics */}
        <div className="space-y-3">
          <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-zinc-400' : 'text-slate-500'
          }`}>
            <Info className="w-3.5 h-3.5" /> Calculated Geometry
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Bounding Width</div>
              <div className="font-mono font-bold mt-0.5">{Math.round(meshData.boundingWidth)} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Bounding Depth</div>
              <div className="font-mono font-bold mt-0.5">{Math.round(meshData.boundingDepth)} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Peak Height (Z)</div>
              <div className="font-mono font-bold mt-0.5">{Math.round(meshData.boundingHeight)} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Est. Weight</div>
              <div className="font-mono text-emerald-500 font-bold mt-0.5">{weightKg.toFixed(2)} kg</div>
            </div>
          </div>
        </div>

        {/* Selected Material Summary */}
        <div className={`p-3 border rounded-xl space-y-2 ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className="text-xs font-semibold">Active Material</div>
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>{matConfig.name}</span>
            <span className="font-mono text-emerald-500 font-bold">{parameters.thickness} mm</span>
          </div>
        </div>

        {/* Fabrication Validation Checks */}
        <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Fabrication Checks
          </h3>

          <div className="space-y-2 text-xs">
            <div className={`flex items-center justify-between p-2 rounded-lg border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span>Sheet Width Fit (&lt;1500mm)</span>
              {isWidthValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
            </div>

            <div className={`flex items-center justify-between p-2 rounded-lg border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span>Sheet Depth Fit (&lt;1000mm)</span>
              {isDepthValid ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
            </div>

            <div className={`flex items-center justify-between p-2 rounded-lg border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span>Bending Limits</span>
              {isCurvatureSafe ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
            </div>
          </div>
        </div>

        {/* Object Hierarchy */}
        <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Generated Components
          </h3>
          <div className="space-y-1 text-xs">
            <div className={`px-2.5 py-1.5 rounded flex items-center justify-between ${
              isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-slate-100 text-slate-700'
            }`}>
              <span>● Procedural Canopy Panel</span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>1.0mm GI</span>
            </div>
            <div className={`px-2.5 py-1.5 rounded flex items-center justify-between ${
              isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-slate-100 text-slate-700'
            }`}>
              <span>● Internal Light Fixture</span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>Socket</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
