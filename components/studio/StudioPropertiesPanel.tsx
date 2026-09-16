'use client';

import React, { useState } from 'react';
import { useStudioStore } from '../../store/studioStore';
import { Cpu, Info, Download, CheckCircle2, FileCode, Check, PanelRightClose } from 'lucide-react';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter.js';

export const StudioPropertiesPanel: React.FC = () => {
  const metadata = useStudioStore((s) => s.metadata);
  const loadedModel = useStudioStore((s) => s.loadedModel);
  const scaleX = useStudioStore((s) => s.scaleX);
  const scaleY = useStudioStore((s) => s.scaleY);
  const scaleZ = useStudioStore((s) => s.scaleZ);
  const uniformScale = useStudioStore((s) => s.uniformScale);
  const theme = useStudioStore((s) => s.theme);
  const toggleRightSidebar = useStudioStore((s) => s.toggleRightSidebar);

  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const origW = metadata?.dimensions.width || 100;
  const origH = metadata?.dimensions.height || 100;
  const origD = metadata?.dimensions.depth || 100;

  const currentW = Math.round(origW * scaleX * uniformScale);
  const currentH = Math.round(origH * scaleY * uniformScale);
  const currentD = Math.round(origD * scaleZ * uniformScale);

  // Approximate sheet metal / solid weight calculation
  const volumeMm3 = currentW * currentH * currentD * 0.08; // average shell density
  const weightKg = (volumeMm3 * 0.00785) / 1000;

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: 'obj' | 'stl' | 'glb' | 'ply') => {
    if (!loadedModel) return;

    const baseName = metadata?.fileName.replace(/\.[^/.]+$/, '') || 'parametal_model';

    try {
      if (format === 'obj') {
        const exporter = new OBJExporter();
        const result = exporter.parse(loadedModel);
        const blob = new Blob([result], { type: 'text/plain' });
        triggerDownload(blob, `${baseName}_exported.obj`);
      } else if (format === 'stl') {
        const exporter = new STLExporter();
        const result = exporter.parse(loadedModel, { binary: true });
        const blob = new Blob([result], { type: 'application/octet-stream' });
        triggerDownload(blob, `${baseName}_exported.stl`);
      } else if (format === 'glb') {
        const exporter = new GLTFExporter();
        exporter.parse(
          loadedModel,
          (gltf) => {
            const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
            triggerDownload(blob, `${baseName}_exported.glb`);
          },
          (error) => console.error('GLTF Export Error:', error),
          { binary: true }
        );
      } else if (format === 'ply') {
        const exporter = new PLYExporter();
        exporter.parse(
          loadedModel,
          (result) => {
            const blob = new Blob([result as any], { type: 'application/octet-stream' });
            triggerDownload(blob, `${baseName}_exported.ply`);
          },
          { binary: true }
        );
      }

      setDownloadSuccess(format.toUpperCase());
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error(`Export failed for ${format}:`, err);
    }
  };

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
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider">Model Inspection</h2>
        </div>
        <button
          onClick={toggleRightSidebar}
          title="Collapse Inspection Panel"
          className={`p-1.5 rounded-lg border transition-colors ${
            isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black'
          }`}
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Calculated Geometry Dimensions */}
        <div className="space-y-3">
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            <Info className="w-3.5 h-3.5" /> Dimensions & Bounds
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Width (X)</div>
              <div className="font-mono font-bold mt-0.5">{currentW} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Depth (Z)</div>
              <div className="font-mono font-bold mt-0.5">{currentD} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Height (Y)</div>
              <div className="font-mono font-bold mt-0.5">{currentH} mm</div>
            </div>

            <div className={`p-2.5 border rounded-lg ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className={`text-[10px] font-mono uppercase ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Est. Weight</div>
              <div className="font-mono font-bold mt-0.5">{weightKg.toFixed(2)} kg</div>
            </div>
          </div>
        </div>

        {/* 3D Mesh Topology Details */}
        {metadata && (
          <div className={`p-3 border rounded-xl space-y-2.5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
            <div className="text-xs font-mono font-bold uppercase tracking-wider">File Metadata</div>
            
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>File Format:</span>
                <span className="font-bold">{metadata.format}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Vertices:</span>
                <span className="font-bold">{metadata.vertexCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Triangles:</span>
                <span className="font-bold">{metadata.triangleCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Mesh Nodes:</span>
                <span className="font-bold">{metadata.meshCount}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>File Size:</span>
                <span className="font-bold">{(metadata.fileSize / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Format File Export Suite */}
        <div className={`space-y-3 pt-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-between ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            <span>Export Updated CAD</span>
            <FileCode className="w-3.5 h-3.5" />
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'obj', label: '.OBJ Mesh', desc: 'Wavefront' },
              { id: 'stl', label: '.STL Mesh', desc: '3D Print' },
              { id: 'glb', label: '.GLB Model', desc: 'Binary GLTF' },
              { id: 'ply', label: '.PLY Point/Mesh', desc: 'Stanford' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => handleExport(fmt.id as any)}
                className={`p-2.5 rounded-xl border text-left font-mono transition-all active:scale-95 ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 text-white'
                    : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 hover:border-zinc-400 text-black'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{fmt.label}</span>
                  <Download className="w-3 h-3 text-zinc-400" />
                </div>
                <div className={`text-[9px] mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                  {fmt.desc}
                </div>
              </button>
            ))}
          </div>

          {downloadSuccess && (
            <div className={`p-2 rounded-lg border text-center font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-300 text-black'
            }`}>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Downloaded {downloadSuccess} File</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
