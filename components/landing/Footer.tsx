'use client';

import React from 'react';
import Link from 'next/link';
import { Box, ExternalLink } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const Footer: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  return (
    <footer className={`py-12 border-t text-xs transition-colors ${isDark ? 'bg-black border-zinc-900 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col space-y-8">
        {/* Top Row: Brand & 1-Line Project Summary */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-zinc-900 dark:border-zinc-900/80 border-zinc-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 overflow-hidden flex items-center justify-center">
                <img src="/logo.ico" alt="Parametal Logo" className="w-full h-full object-contain" />
              </div>
              <span className={`font-mono text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'
                }`}>
                PARAMETAL
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${isDark ? 'border-zinc-800 text-zinc-400 bg-zinc-950' : 'border-zinc-200 text-zinc-600 bg-zinc-50'
                }`}>
                CAD Engine
              </span>
            </div>
            {/* 1-Line About Project */}
            <p className={`text-xs max-w-2xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              An open-source parametric CAD platform and universal 3D model viewer engineered for dynamic dimensional tuning, generative sheet-metal unfolding, and multi-format exports.
            </p>
          </div>

          {/* Quick Studio Launch */}
          {/* <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider">
            <Link
              href="/objects"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 border-zinc-200 text-black hover:bg-zinc-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Studio</span>
            </Link>
          </div> */}

          <div className="flex items-center gap-2 font-mono">
            <span>Developed by</span>
            <a
              href="https://github.com/rajank18"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 font-bold underline underline-offset-4 transition-colors ${isDark ? 'text-white hover:text-zinc-300' : 'text-black hover:text-zinc-700'
                }`}
            >
              <GithubIcon className="w-3.5 h-3.5 inline shrink-0" />
              <span>Rajan (rajank18)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>

        {/* Bottom Row: Developed by Rajan + GitHub link + Copyright */}
        {/* <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] font-mono"> */}
        {/* Developed By Rajan with GitHub */}
        {/* <div className="flex items-center gap-2">
            <span>Developed by</span>
            <a
              href="https://github.com/rajank18"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 font-bold underline underline-offset-4 transition-colors ${isDark ? 'text-white hover:text-zinc-300' : 'text-black hover:text-zinc-700'
                }`}
            >
              <GithubIcon className="w-3.5 h-3.5 inline shrink-0" />
              <span>Rajan (rajank18)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div> */}

        {/* Copyright */}
        {/* <div className="text-zinc-500 text-[10px]">
            &copy; {new Date().getFullYear()} Parametal. All rights reserved.
          </div> */}
        {/* </div> */}
      </div>
    </footer>
  );
};
