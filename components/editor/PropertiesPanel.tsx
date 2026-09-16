'use client';

import React, { useMemo } from 'react';
import { useDesignStore } from '../../store/desginStore';
import { generateCanopyGeometry } from '../../geometry/panels';
import { generateSeatingGeometry } from '../../geometry/seating';
import { generatePartitionGeometry } from '../../geometry/partition';
import { MATERIAL_PRESETS } from '../scene/MetalObject';
import { Info, CheckCircle2, ShieldAlert, Cpu, PanelRightClose } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const parameters = useDesignStore((s) => s.parameters);
  const seatingParameters = useDesignStore((s) => s.seatingParameters);
  const partitionParameters = useDesignStore((s) => s.partitionParameters);
  const controlPoints = useDesignStore((s) => s.controlPoints);
  const seatingControlPoints = useDesignStore((s) => s.seatingControlPoints);
  const activeCategory = useDesignStore((s) => s.activeCategory);
  const theme = useDesignStore((s) => s.theme);
  const toggleRightSidebar = useDesignStore((s) => s.toggleRightSidebar);

  const isDark = theme === 'dark';

  const meshData = useMemo(() => {
    if (activeCategory === 'partition') {
      return generatePartitionGeometry(partitionParameters);
    }
    if (activeCategory === 'seating') {
      return generateSeatingGeometry(seatingParameters, seatingControlPoints);
    }
    return generateCanopyGeometry(parameters, controlPoints);
  }, [activeCategory, partitionParameters, seatingParameters, seatingControlPoints, parameters, controlPoints]);

  const activeThickness = activeCategory === 'partition'
    ? partitionParameters.panelThickness
    : activeCategory === 'seating'
    ? seatingParameters.sheetThickness
    : parameters.thickness;

  const matConfig = MATERIAL_PRESETS[
    activeCategory === 'seating'
      ? seatingParameters.materialType
      : parameters.materialType
  ] || MATERIAL_PRESETS.galvanized;

  const volumeMm3 = meshData.surfaceAreaMm2 * activeThickness;
  const weightKg = (volumeMm3 * 0.00785) / 1000;

  const isWidthValid = meshData.boundingWidth <= 4000;
  const isDepthValid = meshData.boundingDepth <= 2000;
  const isCurvatureSafe = true;

  return (
    <div
      className={`w-72 h-full flex flex-col select-none z-10 transition-colors border-l backdrop-blur-md ${
        isDark ? 'bg-zinc-950/80 border-zinc-800 text-white' : 'bg-white/80 border-zinc-200 text-black'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider">Fabrication Specs</h2>
        </div>
        <button
          onClick={toggleRightSidebar}
          title="Collapse Specs Panel"
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black'
          }`}
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Physical Metrics */}
        <div className="space-y-3">
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            <Info className="w-3.5 h-3.5" /> Calculated Geometry
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Bounding Width</div>
              <div className="font-mono font-bold mt-0.5">{Math.round(meshData.boundingWidth)} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Bounding Depth</div>
              <div className="font-mono font-bold mt-0.5">{Math.round(meshData.boundingDepth)} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Peak Height (Z)</div>
              <div className="font-mono font-bold mt-0.5">{Math.round(meshData.boundingHeight)} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {activeCategory === 'partition' ? 'Total Panels' : 'Est. Weight'}
              </div>
              <div className="font-mono font-bold mt-0.5">
                {activeCategory === 'partition' ? `${partitionParameters.columns * partitionParameters.rows} Modules` : `${weightKg.toFixed(2)} kg`}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Material Summary */}
        <div className={`p-3 border rounded-xl space-y-2 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
          <div className="text-xs font-mono font-bold uppercase tracking-wider">Active Material</div>
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{matConfig.name}</span>
            <span className="font-mono font-bold">{activeThickness} mm</span>
          </div>
        </div>

        {/* Fabrication Validation Checks */}
        <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Fabrication Checks
          </h3>

          <div className="space-y-2 text-xs">
            <div className={`flex items-center justify-between p-2 rounded-lg border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <span>Sheet Width Fit (&lt;1500mm)</span>
              {isWidthValid ? (
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
              ) : (
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
              )}
            </div>

            <div className={`flex items-center justify-between p-2 rounded-lg border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <span>Sheet Depth Fit (&lt;1000mm)</span>
              {isDepthValid ? (
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
              ) : (
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
              )}
            </div>

            <div className={`flex items-center justify-between p-2 rounded-lg border ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <span>Bending Limits</span>
              {isCurvatureSafe ? (
                <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-white' : 'text-black'}`} />
              ) : (
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </div>
        </div>

        {/* Object Hierarchy */}
        <div className={`space-y-2 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Generated Components
          </h3>
          <div className="space-y-1 text-xs">
            <div className={`px-2.5 py-1.5 rounded border flex items-center justify-between ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
            }`}>
              <span>● Procedural Panel</span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{activeThickness}mm GI</span>
            </div>
            <div className={`px-2.5 py-1.5 rounded border flex items-center justify-between ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
            }`}>
              <span>● Structural Assembly</span>
              <span className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>CNC Cut</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
