'use client';

import React from 'react';
import { useDesignStore } from '../../store/desginStore';
import { Sliders, Maximize2, Layers, Sun, RotateCcw, PanelLeftClose } from 'lucide-react';

export const ParameterPanel: React.FC = () => {
  const parameters = useDesignStore((s) => s.parameters);
  const seatingParameters = useDesignStore((s) => s.seatingParameters);
  const partitionParameters = useDesignStore((s) => s.partitionParameters);
  const updateParameters = useDesignStore((s) => s.updateParameters);
  const updateSeatingParameters = useDesignStore((s) => s.updateSeatingParameters);
  const updatePartitionParameters = useDesignStore((s) => s.updatePartitionParameters);
  const resetToDefaults = useDesignStore((s) => s.resetToDefaults);
  const activeTab = useDesignStore((s) => s.activeTab);
  const setActiveTab = useDesignStore((s) => s.setActiveTab);
  const selectedPointId = useDesignStore((s) => s.selectedPointId);
  const controlPoints = useDesignStore((s) => s.controlPoints);
  const seatingControlPoints = useDesignStore((s) => s.seatingControlPoints);
  const updateControlPoint = useDesignStore((s) => s.updateControlPoint);
  const updateSeatingControlPoint = useDesignStore((s) => s.updateSeatingControlPoint);
  const activeCategory = useDesignStore((s) => s.activeCategory);
  const theme = useDesignStore((s) => s.theme);
  const toggleLeftSidebar = useDesignStore((s) => s.toggleLeftSidebar);

  const isDark = theme === 'dark';
  const isSeating = activeCategory === 'seating';

  const activePoints = isSeating ? seatingControlPoints : controlPoints;
  const selectedPoint = activePoints.find((p) => p.id === selectedPointId);

  const sliderClasses = `w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
    isDark ? 'bg-zinc-800 accent-white' : 'bg-zinc-200 accent-black'
  }`;

  return (
    <div
      className={`w-full h-full flex flex-col select-none z-10 transition-colors border-r backdrop-blur-md ${
        isDark ? 'bg-zinc-950/80 border-zinc-800 text-white' : 'bg-white/80 border-zinc-200 text-black'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider">
            {isSeating ? 'Seating Engine' : 'Canopy Engine'}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={resetToDefaults}
            title="Reset to Factory Dimensions"
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

      {/* Tabs */}
      <div className={`flex border-b p-1 gap-1 ${isDark ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-100'}`}>
        <button
          onClick={() => setActiveTab('parameters')}
          className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'parameters'
              ? isDark
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-black text-white shadow-sm font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Maximize2 className="w-3 h-3" /> Shape
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
          <Layers className="w-3 h-3" /> Material
        </button>

        <button
          onClick={() => setActiveTab('lighting')}
          className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'lighting'
              ? isDark
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-black text-white shadow-sm font-bold'
              : isDark
              ? 'text-zinc-400 hover:text-white'
              : 'text-zinc-600 hover:text-black'
          }`}
        >
          <Sun className="w-3 h-3" /> Light
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Selected Point Inspector Callout */}
        {selectedPoint && (
          <div
            className={`p-3 border rounded-xl space-y-2 ${
              isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-100 border-zinc-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-mono font-bold uppercase tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
                Control Point: {selectedPoint.id} ({selectedPoint.label})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['X', 'Y', 'Z'] as const).map((axis, idx) => (
                <div key={axis} className="flex flex-col">
                  <label className={`text-[10px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{axis} (mm)</label>
                  <input
                    type="number"
                    value={Math.round(selectedPoint.position[idx])}
                    onChange={(e) => {
                      const newPos: [number, number, number] = [...selectedPoint.position];
                      newPos[idx] = Number(e.target.value);
                      if (isSeating) {
                        updateSeatingControlPoint(selectedPoint.id, newPos);
                      } else {
                        updateControlPoint(selectedPoint.id, newPos);
                      }
                    }}
                    className={`w-full border rounded px-2 py-1 text-xs font-mono outline-none ${
                      isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'parameters' && isSeating && (
          <>
            {/* Overall Chair Proportions */}
            <div className="space-y-4">
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Overall Proportions
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Overall Width</span>
                  <span className="font-mono font-bold">{seatingParameters.overallWidth} mm</span>
                </div>
                <input
                  type="range"
                  min="480"
                  max="1400"
                  step="20"
                  value={seatingParameters.overallWidth}
                  onChange={(e) => updateSeatingParameters({ overallWidth: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Overall Depth</span>
                  <span className="font-mono font-bold">{seatingParameters.overallDepth} mm</span>
                </div>
                <input
                  type="range"
                  min="750"
                  max="2250"
                  step="20"
                  value={seatingParameters.overallDepth}
                  onChange={(e) => updateSeatingParameters({ overallDepth: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Overall Height</span>
                  <span className="font-mono font-bold">{seatingParameters.overallHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="460"
                  max="1380"
                  step="20"
                  value={seatingParameters.overallHeight}
                  onChange={(e) => updateSeatingParameters({ overallHeight: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>
            </div>

            {/* Seat & Backrest Controls */}
            <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Ergonomics & Curvature
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Seat Curvature</span>
                  <span className="font-mono font-bold">{seatingParameters.seatCurvature} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="160"
                  step="5"
                  value={seatingParameters.seatCurvature}
                  onChange={(e) => updateSeatingParameters({ seatCurvature: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Backrest Recess</span>
                  <span className="font-mono font-bold">{seatingParameters.backCurvature} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="5"
                  value={seatingParameters.backCurvature}
                  onChange={(e) => updateSeatingParameters({ backCurvature: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Transverse Width Dish</span>
                  <span className="font-mono font-bold">{seatingParameters.leftRightCurvature} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={seatingParameters.leftRightCurvature}
                  onChange={(e) => updateSeatingParameters({ leftRightCurvature: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Top Edge Lip Curl</span>
                  <span className="font-mono font-bold">{seatingParameters.topLipCurl} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="2"
                  value={seatingParameters.topLipCurl}
                  onChange={(e) => updateSeatingParameters({ topLipCurl: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Top Tail Fold Angle</span>
                  <span className="font-mono font-bold">{seatingParameters.topFoldAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={seatingParameters.topFoldAngle}
                  onChange={(e) => updateSeatingParameters({ topFoldAngle: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>
            </div>
          </>
        )}

        {/* Partition Screen Controls */}
        {activeTab === 'parameters' && activeCategory === 'partition' && (
          <div className="space-y-6">
            {/* Grid Array & Repetition */}
            <div className="space-y-4">
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Array & Structure Grid
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Columns</span>
                  <span className="font-mono font-bold">{partitionParameters.columns}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={partitionParameters.columns}
                  onChange={(e) => updatePartitionParameters({ columns: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Rows</span>
                  <span className="font-mono font-bold">{partitionParameters.rows}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={partitionParameters.rows}
                  onChange={(e) => updatePartitionParameters({ rows: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Column Spacing</span>
                  <span className="font-mono font-bold">{partitionParameters.columnSpacing} mm</span>
                </div>
                <input
                  type="range"
                  min="300"
                  max="800"
                  step="10"
                  value={partitionParameters.columnSpacing}
                  onChange={(e) => updatePartitionParameters({ columnSpacing: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Row Spacing</span>
                  <span className="font-mono font-bold">{partitionParameters.rowSpacing} mm</span>
                </div>
                <input
                  type="range"
                  min="350"
                  max="900"
                  step="10"
                  value={partitionParameters.rowSpacing}
                  onChange={(e) => updatePartitionParameters({ rowSpacing: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>
            </div>

            {/* Panel Curvature & Variations */}
            <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Sculptural Panel Curvature
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Panel Depth Bulge</span>
                  <span className="font-mono font-bold">{partitionParameters.panelDepth} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="5"
                  value={partitionParameters.panelDepth}
                  onChange={(e) => updatePartitionParameters({ panelDepth: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Horizontal Curve</span>
                  <span className="font-mono font-bold">{partitionParameters.horizontalCurve} mm</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={partitionParameters.horizontalCurve}
                  onChange={(e) => updatePartitionParameters({ horizontalCurve: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Rotation Variation</span>
                  <span className="font-mono font-bold">{partitionParameters.rotationVariation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  step="1"
                  value={partitionParameters.rotationVariation}
                  onChange={(e) => updatePartitionParameters({ rotationVariation: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'parameters' && !isSeating && activeCategory !== 'partition' && (
          <>
            <div className="space-y-4">
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Overall Dimensions
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Canopy Width</span>
                  <span className="font-mono font-bold">{parameters.width} mm</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  step="10"
                  value={parameters.width}
                  onChange={(e) => updateParameters({ width: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Canopy Depth</span>
                  <span className="font-mono font-bold">{parameters.depth} mm</span>
                </div>
                <input
                  type="range"
                  min="250"
                  max="800"
                  step="10"
                  value={parameters.depth}
                  onChange={(e) => updateParameters({ depth: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>
            </div>

            <div className={`space-y-4 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Canopy Curvature & Tips
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Center Peak (C4)</span>
                  <span className="font-mono font-bold">{parameters.centerHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="1100"
                  max="1600"
                  step="5"
                  value={parameters.centerHeight}
                  onChange={(e) => updateParameters({ centerHeight: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Left Tip Height (C1)</span>
                  <span className="font-mono font-bold">{parameters.leftTipHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="1500"
                  step="5"
                  value={parameters.leftTipHeight}
                  onChange={(e) => updateParameters({ leftTipHeight: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span>Right Tip Height (C7)</span>
                  <span className="font-mono font-bold">{parameters.rightTipHeight} mm</span>
                </div>
                <input
                  type="range"
                  min="900"
                  max="1400"
                  step="5"
                  value={parameters.rightTipHeight}
                  onChange={(e) => updateParameters({ rightTipHeight: Number(e.target.value) })}
                  className={sliderClasses}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'material' && (
          <div className="space-y-4">
            <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Sheet Metal Options
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase">Material Grade</label>
              <select
                value={isSeating ? seatingParameters.materialType : parameters.materialType}
                onChange={(e) => {
                  if (isSeating) updateSeatingParameters({ materialType: e.target.value as any });
                  else updateParameters({ materialType: e.target.value as any });
                }}
                className={`w-full border rounded-lg p-2 text-xs font-mono outline-none ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-300 text-black'
                }`}
              >
                <option value="galvanized">Galvanized Steel (GI)</option>
                <option value="mild_steel">Mild Steel</option>
                <option value="aluminum">Brushed Aluminum</option>
                <option value="custom">Custom Matte Black</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase">Sheet Thickness (mm)</label>
              <div className="grid grid-cols-4 gap-2">
                {[0.8, 1.0, 1.2, 1.5].map((val) => {
                  const currentVal = isSeating ? seatingParameters.sheetThickness : parameters.thickness;
                  const isSelected = currentVal === val;
                  return (
                    <button
                      key={val}
                      onClick={() => {
                        if (isSeating) updateSeatingParameters({ sheetThickness: val });
                        else updateParameters({ thickness: val });
                      }}
                      className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                        isSelected
                          ? isDark
                            ? 'border-white bg-white text-black font-bold'
                            : 'border-black bg-black text-white font-bold'
                          : isDark
                          ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-black'
                      }`}
                    >
                      {val}mm
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lighting' && (
          <div className="space-y-6">
            {/* Internal Lamp Fixture (Lamp Category Only) */}
            {!isSeating && activeCategory === 'lamp' && (
              <div className="space-y-4">
                <h3 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Internal Light Fixture
                </h3>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span>Fixture Intensity</span>
                    <span className="font-mono font-bold">{parameters.lightIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={parameters.lightIntensity}
                    onChange={(e) => updateParameters({ lightIntensity: Number(e.target.value) })}
                    className={sliderClasses}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase">Warmth / Color</label>
                  <input
                    type="color"
                    value={parameters.lightColor}
                    onChange={(e) => updateParameters({ lightColor: e.target.value })}
                    className={`w-full h-8 border rounded-lg cursor-pointer p-1 ${
                      isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-300'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
