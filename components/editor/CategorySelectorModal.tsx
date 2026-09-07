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
      id: 'partition',
      name: 'Partition Screen',
      tagline: 'Curved Sheet Metal Room Divider',
      icon: Grid,
      description: 'Self-standing curved perforated metal screen panels with repeating joinery logic.',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-xl overflow-hidden flex flex-col max-h-[85vh] transition-colors ${isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-zinc-800' : 'border-slate-200'}`}>
          <div>
            <h2 className="text-xl font-bold">Select Template</h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Choose a design template to open in the 3D studio
            </p>
          </div>

          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className={`p-2 rounded-lg border transition-colors ${isDark ? 'border-zinc-800 hover:bg-zinc-900 text-zinc-400' : 'border-slate-200 hover:bg-slate-100 text-slate-500'
              }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Grid Options */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = activeCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className={`group relative p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${isSelected
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                    : isDark
                      ? 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100'
                  }`}
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${isSelected
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : isDark
                          ? 'bg-zinc-800 text-emerald-400'
                          : 'bg-white border border-slate-200 text-emerald-600'
                      }`}
                  >
                    <cat.icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-sm font-bold group-hover:text-emerald-500 transition-colors">
                    {cat.name}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {cat.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-zinc-800/50 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-emerald-500 font-bold' : isDark ? 'text-zinc-500' : 'text-slate-400'}>
                    {isSelected ? 'Active' : 'Select'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-emerald-500' : isDark ? 'text-zinc-500' : 'text-slate-400'
                    }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-end ${isDark ? 'border-zinc-800 bg-zinc-900/30' : 'border-slate-200 bg-slate-50'
          }`}>
          <button
            onClick={() => setIsCategoryModalOpen(false)}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
          >
            Open Studio
          </button>
        </div>
      </div>
    </div>
  );
};
