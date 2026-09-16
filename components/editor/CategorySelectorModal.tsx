'use client';

import React from 'react';
import { useDesignStore } from '../../store/desginStore';
import { ObjectCategory } from '../../types/design';
import { Lightbulb, Armchair, Table, Package, Grid, Layout, ArrowRight, X } from 'lucide-react';

export const CATEGORIES: {
  id: ObjectCategory;
  name: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}[] = [
    {
      id: 'lamp',
      name: ' Lamp',
      tagline: 'Procedural Sculptural Floor Lamp',
      icon: Lightbulb,
      description: 'Curved sheet-metal skin canopy with standing conical pedestal and warm interior lighting.',
      badge: 'Core Engine Ready',
    },
    {
      id: 'seating',
      name: 'Seating / Chair',
      tagline: 'Modular Sheet Metal Lounge Chair',
      icon: Armchair,
      description: 'Ergonomic curved metal seat & backrest panels connected by mechanical joinery brackets.',
      badge: 'New Template',
    },
    {
      id: 'partition',
      name: 'Partition Screen',
      tagline: 'Curved Sheet Metal Room Divider',
      icon: Grid,
      description: 'Self-standing curved perforated metal screen panels with repeating joinery logic.',
      badge: 'New Template',
    },
    {
      id: 'table',
      name: 'Table',
      tagline: 'Parametric Sheet Metal Work Table',
      icon: Table,
      description: 'Folded sheet-metal tabletop with parametric leg flanges and perimeter structural stiffeners.',
      badge: 'New Template',
    },
    {
      id: 'storage',
      name: 'Storage',
      tagline: 'Modular Metal Credenza & Shelving',
      icon: Package,
      description: 'Parametric sheet-metal box modules, door panels, and L-bracket structural frame.',
      badge: 'New Template',
    },
    {
      id: 'wall_mounted',
      name: 'Wall-Mounted Object',
      tagline: 'Sculptural Wall Sconce & Shelf',
      icon: Layout,
      description: 'Folded sheet-metal wall-hung lighting sconce and floating architectural shelving unit.',
      badge: 'New Template',
    },
  ];

export const CategorySelectorModal: React.FC = () => {
  const isCategoryModalOpen = useDesignStore((s) => s.isCategoryModalOpen);
  const setIsCategoryModalOpen = useDesignStore((s) => s.setIsCategoryModalOpen);
  const activeCategory = useDesignStore((s) => s.activeCategory);
  const setActiveCategory = useDesignStore((s) => s.setActiveCategory);
  const theme = useDesignStore((s) => s.theme);

  if (!isCategoryModalOpen) return null;

  const isDark = theme === 'dark';

  const handleSelect = (id: ObjectCategory) => {
    setActiveCategory(id);
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight uppercase">Select Template</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Choose a design template to open in the 3D studio
            </p>
          </div>

          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
              isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-black'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Grid Options */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`group relative p-3 sm:p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'border-white bg-zinc-900 shadow-md ring-1 ring-white/20'
                      : 'border-black bg-zinc-100 shadow-md ring-1 ring-black/20'
                    : isDark
                      ? 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-600 hover:bg-zinc-900'
                      : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-400 hover:bg-zinc-100'
                }`}
              >
                <div>
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2.5 sm:mb-3 transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-white text-black font-bold'
                          : 'bg-black text-white font-bold'
                        : isDark
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-white border border-zinc-200 text-zinc-700'
                    }`}
                  >
                    <cat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>

                  <h3 className={`text-xs sm:text-sm font-bold transition-colors line-clamp-1 ${
                    isSelected ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-800 group-hover:text-black')
                  }`}>
                    {cat.name}
                  </h3>
                  <p className={`text-[10px] sm:text-xs mt-1 leading-tight sm:leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {cat.tagline}
                  </p>
                </div>

                <div className={`mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'border-zinc-800' : 'border-zinc-200'
                }`}>
                  <span className={isSelected ? (isDark ? 'text-white font-black' : 'text-black font-black') : isDark ? 'text-zinc-500' : 'text-zinc-400'}>
                    {isSelected ? 'Active' : 'Select'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${
                    isSelected ? (isDark ? 'text-white' : 'text-black') : isDark ? 'text-zinc-500' : 'text-zinc-400'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className={`px-4 sm:px-6 py-3 sm:py-4 border-t flex items-center justify-end ${
          isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-50'
        }`}>
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className={`px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95 ${
              isDark
                ? 'bg-white text-black hover:bg-zinc-200 shadow-md'
                : 'bg-black text-white hover:bg-zinc-800 shadow-md'
            }`}
          >
            Open Studio
          </button>
        </div>
      </div>
    </div>
  );
};
