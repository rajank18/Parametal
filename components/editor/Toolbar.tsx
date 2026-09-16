'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDesignStore, CameraPreset } from '../../store/desginStore';
import { ObjectCategory } from '../../types/design';
import { Box, Image as ImageIcon, Download, Target, Camera, Sun, Moon, ChevronDown, Lightbulb, Armchair, Table, Package, Grid, Layout, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

export const CATEGORY_ICONS: Record<ObjectCategory, { name: string; icon: React.ComponentType<{ className?: string }> }> = {
    lamp: { name: ' Lamp', icon: Lightbulb },
    seating: { name: 'Seating / Chair', icon: Armchair },
    partition: { name: 'Partition Screen', icon: Grid },
    table: { name: 'Table', icon: Table },
    storage: { name: 'Storage Unit', icon: Package },
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
    const leftSidebarOpen = useDesignStore((s) => s.leftSidebarOpen);
    const rightSidebarOpen = useDesignStore((s) => s.rightSidebarOpen);
    const toggleLeftSidebar = useDesignStore((s) => s.toggleLeftSidebar);
    const toggleRightSidebar = useDesignStore((s) => s.toggleRightSidebar);

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
            className={`h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between select-none z-40 transition-colors backdrop-blur-xl ${
                isDark ? 'bg-black/85 text-white' : 'bg-white/85 text-black'
            }`}
        >
            {/* Brand & Object Category Selector Dropdown */}
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Left Sidebar Collapse Toggle */}
                <button
                    onClick={toggleLeftSidebar}
                    className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                        leftSidebarOpen
                            ? isDark
                                ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
                                : 'bg-zinc-100 border-zinc-200 text-black hover:bg-zinc-200'
                            : isDark
                            ? 'bg-black border-zinc-800 text-zinc-500 hover:text-white'
                            : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'
                    }`}
                    title={leftSidebarOpen ? 'Collapse Parameters Sidebar' : 'Expand Parameters Sidebar'}
                >
                    {leftSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                </button>

                <a
                    href="/"
                    className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
                    title="Return to Landing Page"
                >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                        <img src="/logo.ico" alt="Parametal Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-mono text-xl sm:text-2xl font-black uppercase">
                        PARAMETAL
                    </span>
                </a>

                {/* Object Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase transition-all ${isDark
                            ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-100 border-zinc-200 text-black hover:bg-zinc-200 hover:border-zinc-300'
                            }`}
                    >
                        <ActiveIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[90px] sm:max-w-none">{CATEGORY_ICONS[activeCategory]?.name}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div
                            className={`absolute top-full left-0 mt-1.5 w-52 sm:w-60 rounded-xl border shadow-2xl p-1.5 z-50 transition-all ${isDark ? 'bg-zinc-950 border-zinc-800 text-white shadow-black/80' : 'bg-white border-zinc-200 text-black shadow-black/10'
                                }`}
                        >
                            <div className={`px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Object Templates
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
                                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-mono font-medium tracking-wide transition-colors ${isSelected
                                            ? isDark
                                                ? 'bg-white text-black font-bold'
                                                : 'bg-black text-white font-bold'
                                            : isDark
                                                ? 'hover:bg-zinc-900 text-zinc-300'
                                                : 'hover:bg-zinc-100 text-zinc-700'
                                            }`}
                                    >
                                        <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}

                            <div className={`mt-1.5 pt-1.5 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        setIsCategoryModalOpen(true);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
                                        isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-black'
                                    }`}
                                >
                                    Browse Catalog Grid →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Camera Presets Selector */}
            <div
                className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border transition-colors ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                    }`}
            >
                <Camera className={`w-3.5 h-3.5 ml-2 mr-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
                {presets.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setCameraPreset(p.id)}
                        className={`px-2.5 py-1 text-xs font-mono uppercase tracking-wider rounded-lg font-medium transition-all ${cameraPreset === p.id
                            ? isDark
                                ? 'bg-white text-black shadow-sm font-bold'
                                : 'bg-black text-white shadow-sm font-bold'
                            : isDark
                                ? 'text-zinc-400 hover:text-white'
                                : 'text-zinc-600 hover:text-black'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* View Toggles, Theme Toggle & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                    className={`flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border transition-colors ${isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                        }`}
                >
                    <button
                        onClick={() => setWireframe(!wireframe)}
                        className={`p-1 sm:px-2.5 sm:py-1 text-xs font-mono uppercase tracking-wider rounded-md sm:rounded-lg font-medium transition-all ${wireframe
                            ? isDark
                                ? 'bg-white text-black font-bold'
                                : 'bg-black text-white font-bold'
                            : isDark
                                ? 'text-zinc-400 hover:text-white'
                                : 'text-zinc-600 hover:text-black'
                            }`}
                        title="Toggle Wireframe Topology"
                    >
                        <Box className="w-3.5 h-3.5 inline mr-1" /> <span className="hidden sm:inline">Wireframe</span>
                    </button>

                    <button
                        onClick={() => setShowHandles(!showHandles)}
                        className={`p-1 sm:px-2.5 sm:py-1 text-xs font-mono uppercase tracking-wider rounded-lg font-medium transition-all ${showHandles
                            ? isDark
                                ? 'bg-white text-black font-bold'
                                : 'bg-black text-white font-bold'
                            : isDark
                                ? 'text-zinc-400 hover:text-white'
                                : 'text-zinc-600 hover:text-black'
                            }`}
                        title="Toggle 3D Control Point Gizmos"
                    >
                        <Target className="w-3.5 h-3.5 inline mr-1" /> <span className="hidden sm:inline">3D Handles</span>
                    </button>

                    <button
                        onClick={() => setShowReferenceOverlay(!showReferenceOverlay)}
                        className={`p-1 sm:px-2.5 sm:py-1 text-xs font-mono uppercase tracking-wider rounded-lg font-medium transition-all ${showReferenceOverlay
                            ? isDark
                                ? 'bg-white text-black font-bold'
                                : 'bg-black text-white font-bold'
                            : isDark
                                ? 'text-zinc-400 hover:text-white'
                                : 'text-zinc-600 hover:text-black'
                            }`}
                        title="Toggle Reference Photo Blueprint"
                    >
                        <ImageIcon className="w-3.5 h-3.5 inline mr-1" /> <span className="hidden md:inline">Reference</span>
                    </button>
                </div>

                {/* Theme Mode Toggle Button */}
                <button
                    onClick={() => setTheme(isDark ? 'light' : 'dark')}
                    className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-all ${isDark
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-200'
                        }`}
                    title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                    {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />}
                </button>

                <button
                    onClick={handleExportPNG}
                    className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 border text-xs font-mono uppercase tracking-wider font-bold rounded-lg transition-colors ${isDark
                        ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white'
                        : 'bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-black'
                        }`}
                    title="Download 3D View Image (PNG)"
                >
                    <Download className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">Capture</span>
                </button>

                {/* Right Sidebar Collapse Toggle */}
                <button
                    onClick={toggleRightSidebar}
                    className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                        rightSidebarOpen
                            ? isDark
                                ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
                                : 'bg-zinc-100 border-zinc-200 text-black hover:bg-zinc-200'
                            : isDark
                            ? 'bg-black border-zinc-800 text-zinc-500 hover:text-white'
                            : 'bg-white border-zinc-200 text-zinc-400 hover:text-black'
                    }`}
                    title={rightSidebarOpen ? 'Collapse Properties Sidebar' : 'Expand Properties Sidebar'}
                >
                    {rightSidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                </button>
            </div>
        </header>
    );
};
