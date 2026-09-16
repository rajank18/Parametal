'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useDesignStore } from '../../store/desginStore';
import { ObjectCategory } from '../../types/design';
import { Lightbulb, Armchair, Grid, Table, Package, Layout, ArrowRight, Layers } from 'lucide-react';

interface CatalogItem {
  id: ObjectCategory;
  name: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  specs: { label: string; value: string }[];
  tag: string;
}

const CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'lamp',
    name: 'Floor Lamp',
    subtitle: 'Procedural Sculptural Light',
    description: 'Double-curved sheet metal canopy skin with conical standing pedestal and warm integrated lighting.',
    icon: Lightbulb,
    specs: [
      { label: 'Height', value: '1335 mm' },
      { label: 'Canopy Width', value: '700 mm' },
      { label: 'Sheet Thickness', value: '1.0 mm' },
      { label: 'Material', value: 'Galvanized Steel' },
    ],
    tag: 'Core Ready',
  },
  {
    id: 'seating',
    name: 'Lounge Chair',
    subtitle: 'Sculptural Ribbon Seating',
    description: 'Continuous ergonomic seat shell and backrest formed with bend angles, top return lip curl, and floor contact.',
    icon: Armchair,
    specs: [
      { label: 'Width', value: '940 mm' },
      { label: 'Depth', value: '1500 mm' },
      { label: 'Back Angle', value: '20°' },
      { label: 'Gauge', value: '1.5 mm' },
    ],
    tag: 'Ergonomic CAD',
  },
  {
    id: 'partition',
    name: 'Partition Screen',
    subtitle: 'Modular Architectural Array',
    description: 'Self-standing matrix of curved perforated metal screen panels with structural posts and ambient light nodes.',
    icon: Grid,
    specs: [
      { label: 'Columns × Rows', value: '4 × 4 Panels' },
      { label: 'Sagitta Curve', value: '120 mm' },
      { label: 'Post Radius', value: '8.0 mm' },
      { label: 'Bulb Nodes', value: 'Warm Amber' },
    ],
    tag: 'Modular Architecture',
  },
  {
    id: 'table',
    name: 'Work Table',
    subtitle: 'Parametric Sheet Metal Table',
    description: 'Folded sheet-metal tabletop slab with parametric cylindrical or blade leg supports and perimeter stiffeners.',
    icon: Table,
    specs: [
      { label: 'Dimensions', value: '1200 × 700 mm' },
      { label: 'Leg Height', value: '750 mm' },
      { label: 'Corner Radius', value: '15 mm' },
      { label: 'Leg Types', value: '4-Corner / Blade' },
    ],
    tag: 'Industrial Table',
  },
  {
    id: 'storage',
    name: 'Storage Credenza',
    subtitle: 'Modular Metal Enclosure',
    description: 'Parametric sheet-metal box modules, hinged door panels, and L-bracket structural perimeter framework.',
    icon: Package,
    specs: [
      { label: 'Dimensions', value: '1000 × 400 mm' },
      { label: 'Height', value: '500 mm' },
      { label: 'Door Gauge', value: '1.2 mm' },
      { label: 'Finish', value: 'Matte Powdercoat' },
    ],
    tag: 'Modular Storage',
  },
  {
    id: 'wall_mounted',
    name: 'Wall Sconce',
    subtitle: 'Architectural Sconce & Shelf',
    description: 'Folded sheet-metal wall-hung lighting sconce paired with a floating cantilevered architectural shelf.',
    icon: Layout,
    specs: [
      { label: 'Sconce Width', value: '600 mm' },
      { label: 'Shelf Depth', value: '300 mm' },
      { label: 'Light Decay', value: '2.0' },
      { label: 'Mounting', value: 'Rear Flush Flange' },
    ],
    tag: 'Wall Mount',
  },
];

export const ObjectCatalogGrid: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const router = useRouter();
  const setActiveCategory = useDesignStore((s) => s.setActiveCategory);

  const handleLaunchCategory = (category: ObjectCategory) => {
    setActiveCategory(category);
    router.push('/objects');
  };

  return (
    <section id="catalog" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-widest mb-4 border ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
        }`}>
          <Layers className="w-3.5 h-3.5" />
          <span>Object Catalog</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 sm:mb-4">
          PARAMETRIC FAMILIES
        </h2>
        <p className={`max-w-2xl text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Engineered templates tailored for sheet metal fabrication. Modify dimensions, curve tangents, and joinery parameters in real time.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {CATALOG_ITEMS.map((item, idx) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              onClick={() => handleLaunchCategory(item.id)}
              className={`group relative rounded-xl border p-5 sm:p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-500 hover:bg-zinc-900/60'
                  : 'bg-white border-zinc-200 hover:border-black hover:bg-zinc-50'
              }`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-lg border transition-colors ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-100 border-zinc-200 text-black'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}>
                    {item.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold mb-0.5 tracking-tight group-hover:text-white transition-colors">
                  {item.name}
                </h3>
                <p className={`text-[11px] font-mono mb-2.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {item.subtitle}
                </p>
                <p className={`text-xs leading-relaxed mb-5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {item.description}
                </p>

                {/* Specs List */}
                <div className={`grid grid-cols-2 gap-2 pt-3.5 border-t mb-5 ${isDark ? 'border-zinc-800/80' : 'border-zinc-100'}`}>
                  {item.specs.map((spec) => (
                    <div key={spec.label} className="flex flex-col">
                      <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        {spec.label}
                      </span>
                      <span className="text-xs font-mono font-medium">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="flex items-center justify-between pt-2 text-xs font-mono font-bold group-hover:translate-x-1 transition-transform">
                <span className="uppercase tracking-wider">Customize in 3D</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
