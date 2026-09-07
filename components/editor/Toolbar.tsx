'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDesignStore, CameraPreset } from '../../store/desginStore';
import { ObjectCategory } from '../../types/design';
import { Box, Image as ImageIcon, Download, Target, Camera, Sun, Moon, ChevronDown, Lightbulb, Armchair, Table, Package, Grid, Layout } from 'lucide-react';

export const CATEGORY_ICONS: Record<ObjectCategory, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
    lamp: { name: ' Lamp', icon: Lightbulb },
    seating: { name: 'Seating / Chair', icon: Armchair },
    table: { name: 'Table', icon: Table },
    storage: { name: 'Storage Unit', icon: Package },
    partition: { name: 'Partition Screen', icon: Grid },
    wall_mounted: { name: 'Wall-Mounted', icon: Layout },
};

export const Toolbar: React.FC = () => {
    const wireframe = useDesignStore((s) => s.wireframe);
    const setWireframe = useDesignStore((s) => s.setWireframe);
    const showHandles = useDesignStore((s) => s.showHandles);
    const setShowHandles = useDesignStore((s) => s.setShowHandles);
    const showReferenceOverlay = useDesignStore((s) => s.showReferenceOverlay);
    const setShowReferenceOverlay = useDesignStore((s) => s.setShowReferenceOverlay);
    const cameraPreset = useDesignStore((s) => s.cameraPreset);
    const setCameraPreset = useDesignStore((s) => s.setCameraPreset);
    const theme = useDesignStore((s) => s.theme);
    const setTheme = useDesignStore((s) => s.setTheme);
    const activeCategory = useDesignStore((s) => s.activeCategory);
    const setActiveCategory = useDesignStore((s) => s.setActiveCategory);
    const setIsCategoryModalOpen = useDesignStore((s) => s.setIsCategoryModalOpen);
    const parameters = useDesignStore((s) => s.parameters);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isDark = theme === 'dark';
    const ActiveIcon = CATEGORY_ICONS[activeCategory]?.icon || Lightbulb;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const presets: { id: CameraPreset; label: string }[] = [
        { id: 'perspective', label: 'Perspective' },
        { id: 'front', label: 'Front' },
        { id: 'left', label: 'Left' },
        { id: 'right', label: 'Right' },
        { id: 'back', label: 'Back' },
        { id: 'top', label: 'Top' },
    ];

    const handleExportPNG = () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataUrl);
        downloadAnchor.setAttribute('download', `parametal_${activeCategory}_render.png`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    return (
        <header
            className={`h-12 sm:h-14 px-2 sm:px-4 flex items-center justify-between select-none z-40 transition-colors border-b ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
        >
            {/* Brand & Object Category Selector Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-3">
                <div
                    onClick={() => setIsCategoryModalOpen(true)}
                    className={` flex items-center justify-center cursor-pointer transition-colors overflow-hidden
                        }`}
                    title="Open Object Catalog"
                >
                    <img src="/logo.ico" alt="Parametal Logo" className="w-9 h-9 md:w-13 md:h-13 object-contain rounded-sm" />
                </div>

                {/* Object Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-xs font-bold transition-all ${isDark
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700'
                            : 'bg-slate-100 border-slate-200 text-slate-900 hover:bg-slate-200'
                            }`}
                    >
                        <ActiveIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[85px] sm:max-w-none">{CATEGORY_ICONS[activeCategory]?.name}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div
                            className={`absolute top-full left-0 mt-1 sm:mt-1.5 w-48 sm:w-56 rounded-xl border shadow-2xl p-1 sm:p-1.5 z-50 transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
                                }`}
                        >
                            <div className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                                Object Families
                            </div>
                            {(Object.keys(CATEGORY_ICONS) as ObjectCategory[]).map((catId) => {
                                const item = CATEGORY_ICONS[catId];
                                const ItemIcon = item.icon;
                                const isSelected = activeCategory === catId;

                                return (
                                    <button
                                        key={catId}
                                        onClick={() => {
                                            setActiveCategory(catId);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected
                                            ? 'bg-emerald-500/10 text-emerald-500 font-bold'
                                            : isDark
                                                ? 'hover:bg-zinc-800 text-zinc-300'
                                                : 'hover:bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        <ItemIcon className="w-3.5 h-3.5" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}

                            <div className={`mt-1 pt-1 border-t ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsCategoryModalOpen(true);
                                    }}
                                    className="w-full text-left px-2 py-1 text-[11px] text-emerald-500 hover:underline font-semibold"
                                >
                                    Catalog →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Presets Selector */}
            <div
                className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-colors ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'
                    }`}
            >
                <Camera className={`w-3.5 h-3.5 ml-2 mr-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} />
                {presets.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setCameraPreset(p.id)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${cameraPreset === p.id
                            ? isDark
                                ? 'bg-zinc-800 text-emerald-400 shadow-sm font-semibold border border-zinc-700'
                                : 'bg-white text-emerald-600 shadow-sm font-semibold border border-slate-300'
                            : isDark
                                ? 'text-zinc-400 hover:text-zinc-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* View Toggles, Theme Toggle & Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
                <div
                    className={`flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border transition-colors ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-100 border-slate-200'
                        }`}
                >
                    <button
                        onClick={() => setWireframe(!wireframe)}
                        className={`p-1 sm:px-2.5 sm:py-1 text-xs rounded-md sm:rounded-lg font-medium transition-all ${wireframe
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : isDark
                                ? 'text-zinc-400 hover:text-zinc-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="Toggle Wireframe Topology"
                    >
                        <Box className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Wireframe</span>
                    </button>

                    <button
                        onClick={() => setShowHandles(!showHandles)}
                        className={`p-1 sm:px-2.5 sm:py-1 text-xs rounded-lg font-medium transition-all ${showHandles
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : isDark
                                ? 'text-zinc-400 hover:text-zinc-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="Toggle 3D Control Point Gizmos"
                    >
                        <Target className="w-3.5 h-3.5" /> <span className="hidden sm:inline">3D Handles</span>
                    </button>

                    <button
                        onClick={() => setShowReferenceOverlay(!showReferenceOverlay)}
                        className={`p-1 sm:px-2.5 sm:py-1 text-xs rounded-lg font-medium transition-all ${showReferenceOverlay
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                            : isDark
                                ? 'text-zinc-400 hover:text-zinc-200'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                        title="Toggle Reference Photo Blueprint"
                    >
                        <ImageIcon className="w-3.5 h-3.5" /> <span className="hidden md:inline">Reference Blueprint</span>
                    </button>
                </div>

                {/* Theme Mode Toggle Button */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                        }`}
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                    {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />}
                </button>

                <button
                    onClick={handleExportPNG}
                    className={`p-1.5 sm:px-3 sm:py-1.5 border text-xs font-semibold rounded-lg transition-colors ${isDark
                        ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200'
                        : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                        }`}
                    title="Download 3D View Image (PNG)"
                >
                    <Download className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`} /> <span className="hidden sm:inline">Save Image</span>
                </button>
            </div>
        </header>
    );
};
