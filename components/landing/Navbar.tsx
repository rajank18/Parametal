'use client';

import React from 'react';
import Link from 'next/link';
import { useDesignStore } from '../../store/desginStore';
import { Sun, Moon, ArrowRight, Box } from 'lucide-react';

export const Navbar: React.FC = () => {
  const theme = useDesignStore((s) => s.theme);
  const setTheme = useDesignStore((s) => s.setTheme);
  const isDark = theme === 'dark';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors backdrop-blur-xl ${isDark ? 'bg-black/85 text-white' : 'bg-white/85 text-black'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-1 sm:gap-2 group">
          <div className="w-7 h-7 sm:w-8 sm:h-8 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="/logo.ico" alt="Parametal Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-2xl  font-black  uppercase">
              PARAMETAL
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase">
          <a
            href="#catalog"
            className={`transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
          >
            Catalog
          </a>
          <a
            href="#fabrication"
            className={`transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
          >
            Fabrication
          </a>
          <a
            href="#exports"
            className={`transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black'}`}
          >
            Exports
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all ${isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-200'
              }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-zinc-100" /> : <Moon className="w-4 h-4 text-zinc-900" />}
          </button>

          {/* Launch Studio Button */}
          <Link
            href="/objects"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isDark
              ? 'bg-white text-black hover:bg-zinc-200 shadow-md shadow-white/5'
              : 'bg-black text-white hover:bg-zinc-800 shadow-md shadow-black/10'
              }`}
          >
            <Box className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">3D Studio</span>
            <span className="sm:hidden">Studio</span>
            <ArrowRight className="w-3 h-3 shrink-0" />
          </Link>
        </div>
      </div>
    </header>
  );
};
