'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Interactive3DTextProps {
  isDark: boolean;
}

// Letter definitions with CAD vertex points and triangulation wireframe edges
interface LetterData {
  char: string;
  id: string;
  points: { x: number; y: number }[]; // Normalized [0-100] coordinates
  edges: [number, number][]; // Line connections between point indices
  internalMesh: [number, number][]; // Diagonal triangulation lines
}

const LETTERS: LetterData[] = [
  {
    char: 'P',
    id: 'p1',
    points: [
      { x: 15, y: 10 }, { x: 75, y: 10 }, { x: 88, y: 25 }, { x: 88, y: 45 },
      { x: 75, y: 60 }, { x: 40, y: 60 }, { x: 40, y: 90 }, { x: 15, y: 90 },
      { x: 40, y: 28 }, { x: 65, y: 28 }, { x: 65, y: 44 }, { x: 40, y: 44 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
      [8, 9], [9, 10], [10, 11], [11, 8]
    ],
    internalMesh: [
      [0, 8], [1, 9], [2, 10], [3, 10], [4, 11], [5, 11], [0, 4], [7, 5]
    ]
  },
  {
    char: 'A',
    id: 'a1',
    points: [
      { x: 50, y: 8 }, { x: 88, y: 90 }, { x: 65, y: 90 }, { x: 57, y: 68 },
      { x: 43, y: 68 }, { x: 35, y: 90 }, { x: 12, y: 90 },
      { x: 50, y: 32 }, { x: 55, y: 52 }, { x: 45, y: 52 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],
      [7, 8], [8, 9], [9, 7]
    ],
    internalMesh: [
      [0, 7], [3, 8], [4, 9], [2, 8], [5, 9], [6, 4], [1, 3]
    ]
  },
  {
    char: 'R',
    id: 'r1',
    points: [
      { x: 15, y: 10 }, { x: 75, y: 10 }, { x: 88, y: 26 }, { x: 88, y: 45 },
      { x: 70, y: 56 }, { x: 88, y: 90 }, { x: 62, y: 90 }, { x: 45, y: 58 },
      { x: 40, y: 58 }, { x: 40, y: 90 }, { x: 15, y: 90 },
      { x: 40, y: 26 }, { x: 64, y: 26 }, { x: 64, y: 42 }, { x: 40, y: 42 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [8, 9], [9, 10], [10, 0], [11, 12], [12, 13], [13, 14], [14, 11]
    ],
    internalMesh: [
      [0, 11], [1, 12], [2, 13], [3, 13], [4, 7], [8, 14], [10, 8], [7, 9]
    ]
  },
  {
    char: 'A',
    id: 'a2',
    points: [
      { x: 50, y: 8 }, { x: 88, y: 90 }, { x: 65, y: 90 }, { x: 57, y: 68 },
      { x: 43, y: 68 }, { x: 35, y: 90 }, { x: 12, y: 90 },
      { x: 50, y: 32 }, { x: 55, y: 52 }, { x: 45, y: 52 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],
      [7, 8], [8, 9], [9, 7]
    ],
    internalMesh: [
      [0, 7], [3, 8], [4, 9], [2, 8], [5, 9], [6, 4], [1, 3]
    ]
  },
  {
    char: 'M',
    id: 'm1',
    points: [
      { x: 12, y: 10 }, { x: 36, y: 10 }, { x: 50, y: 50 }, { x: 64, y: 10 },
      { x: 88, y: 10 }, { x: 88, y: 90 }, { x: 68, y: 90 }, { x: 68, y: 40 },
      { x: 50, y: 76 }, { x: 32, y: 40 }, { x: 32, y: 90 }, { x: 12, y: 90 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [8, 9], [9, 10], [10, 11], [11, 0]
    ],
    internalMesh: [
      [0, 11], [1, 9], [3, 7], [4, 6], [1, 8], [3, 8], [0, 9], [4, 7]
    ]
  },
  {
    char: 'E',
    id: 'e1',
    points: [
      { x: 15, y: 10 }, { x: 85, y: 10 }, { x: 85, y: 28 }, { x: 42, y: 28 },
      { x: 42, y: 42 }, { x: 78, y: 42 }, { x: 78, y: 58 }, { x: 42, y: 58 },
      { x: 42, y: 72 }, { x: 85, y: 72 }, { x: 85, y: 90 }, { x: 15, y: 90 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [8, 9], [9, 10], [10, 11], [11, 0]
    ],
    internalMesh: [
      [0, 3], [1, 3], [4, 7], [5, 7], [8, 11], [9, 11], [0, 11]
    ]
  },
  {
    char: 'T',
    id: 't1',
    points: [
      { x: 10, y: 10 }, { x: 90, y: 10 }, { x: 90, y: 28 }, { x: 62, y: 28 },
      { x: 62, y: 90 }, { x: 38, y: 90 }, { x: 38, y: 28 }, { x: 10, y: 28 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0]
    ],
    internalMesh: [
      [0, 6], [1, 3], [7, 3], [6, 4], [0, 3], [7, 5]
    ]
  },
  {
    char: 'A',
    id: 'a3',
    points: [
      { x: 50, y: 8 }, { x: 88, y: 90 }, { x: 65, y: 90 }, { x: 57, y: 68 },
      { x: 43, y: 68 }, { x: 35, y: 90 }, { x: 12, y: 90 },
      { x: 50, y: 32 }, { x: 55, y: 52 }, { x: 45, y: 52 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0],
      [7, 8], [8, 9], [9, 7]
    ],
    internalMesh: [
      [0, 7], [3, 8], [4, 9], [2, 8], [5, 9], [6, 4], [1, 3]
    ]
  },
  {
    char: 'L',
    id: 'l1',
    points: [
      { x: 15, y: 10 }, { x: 40, y: 10 }, { x: 40, y: 72 }, { x: 85, y: 72 },
      { x: 85, y: 90 }, { x: 15, y: 90 }
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]
    ],
    internalMesh: [
      [0, 2], [1, 5], [2, 5], [3, 5]
    ]
  }
];

export const Interactive3DText: React.FC<Interactive3DTextProps> = ({ isDark }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, relX: 50, relY: 50 });
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Smooth mouse move tracking inside the hero text bounds
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const relX = (x / rect.width) * 100;
    const relY = (y / rect.height) * 100;

    setMousePos({ x, y, relX, relY });
  };

  // 3D tilt calculation based on cursor offset from center
  const tiltX = isHovered ? (mousePos.relY - 50) * -0.22 : 0;
  const tiltY = isHovered ? (mousePos.relX - 50) * 0.28 : 0;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveLetter(null);
      }}
      onMouseMove={handleMouseMove}
      className={`relative w-full max-w-5xl mx-auto py-8 sm:py-12 px-2 sm:px-6 rounded-3xl select-none transition-all duration-300 overflow-hidden cursor-crosshair ${isDark ? 'hover:bg-zinc-950/40' : 'hover:bg-zinc-100/60'
        }`}
      style={{
        perspective: '1200px',
      }}
    >
      {/* 1. Dynamic Cursor Spotlight Glow Background */}
      {/* Dark theme: Glowing white spotlight; Light theme: Glowing black/charcoal spotlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: isDark
            ? `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.03) 45%, transparent 70%)`
            : `radial-gradient(420px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.02) 45%, transparent 70%)`,
        }}
      />

      {/* 2. Precision CAD Crosshair HUD Cursor Indicator (Active on Hover) */}
      {isHovered && (
        <div
          className="pointer-events-none absolute z-30 flex items-center gap-1.5 transition-transform duration-75"
          style={{
            transform: `translate(${mousePos.x + 16}px, ${mousePos.y + 16}px)`,
          }}
        >
          {/* Coordinate Readout */}
          <div
            className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold tracking-widest uppercase border backdrop-blur-md shadow-lg ${isDark
              ? 'bg-black/90 text-white border-zinc-700 shadow-white/5'
              : 'bg-white/90 text-black border-zinc-300 shadow-black/10'
              }`}
          >
            <span>+</span> X:{(mousePos.relX * 10).toFixed(0)} Y:{(mousePos.relY * 10).toFixed(0)}
            {activeLetter && ` [${activeLetter}]`}
          </div>
        </div>
      )}

      {/* 3. 3D Architectural Container with Tilt */}
      <motion.div
        animate={{
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 25 }}
        className="relative z-10 flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {LETTERS.map((item, idx) => {
          const isCurrentHovered = activeLetter === item.id;

          return (
            <div
              key={`${item.id}-${idx}`}
              onMouseEnter={() => setActiveLetter(item.id)}
              className="relative group flex items-center justify-center transition-transform duration-200"
              style={{
                transform: isHovered
                  ? `translateZ(${isCurrentHovered ? '28px' : '10px'})`
                  : 'translateZ(0px)',
              }}
            >
              {/* Layer A: Base Solid 3D Architectural Letterform */}
              <div
                className={`relative font-black tracking-tighter transition-all duration-300 text-4xl ms:text-6xl md:text-8xl  font-['Helvetica_Neue',Helvetica,Arial,sans-serif] ${isDark ? 'text-white' : 'text-zinc-950'
                  } ${isHovered
                    ? isDark
                      ? 'opacity-25'
                      : 'opacity-20'
                    : 'opacity-100'
                  }`}
                style={{
                  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                  textShadow: isDark
                    ? '0 4px 18px rgba(255,255,255,0.18), 0 1px 2px rgba(255,255,255,0.4)'
                    : '0 4px 18px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                {item.char}
              </div>

              {/* Layer B: CAD Wireframe Topology & Vertex Mesh (Revealed on Hover) */}
              <div
                className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none transition-all duration-300 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-95'
                  }`}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full overflow-visible"
                  style={{
                    filter: isDark
                      ? 'drop-shadow(0 0 4px rgba(255,255,255,0.6))'
                      : 'drop-shadow(0 0 3px rgba(0,0,0,0.4))',
                  }}
                >
                  {/* Mesh Facet Triangulation Lines */}
                  {item.internalMesh.map(([p1Idx, p2Idx], lineIdx) => {
                    const p1 = item.points[p1Idx];
                    const p2 = item.points[p2Idx];
                    if (!p1 || !p2) return null;

                    return (
                      <line
                        key={`mesh-${lineIdx}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isDark ? '#ffffff' : '#09090b'}
                        strokeWidth="0.8"
                        strokeDasharray="2,2"
                        strokeOpacity={isCurrentHovered ? 0.85 : 0.4}
                      />
                    );
                  })}

                  {/* Outer CAD Perimeter Edges */}
                  {item.edges.map(([p1Idx, p2Idx], edgeIdx) => {
                    const p1 = item.points[p1Idx];
                    const p2 = item.points[p2Idx];
                    if (!p1 || !p2) return null;

                    return (
                      <line
                        key={`edge-${edgeIdx}`}
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isDark ? '#ffffff' : '#09090b'}
                        strokeWidth={isCurrentHovered ? '2' : '1.4'}
                        strokeOpacity={isCurrentHovered ? 1 : 0.8}
                      />
                    );
                  })}

                  {/* Precision CAD Vertex Nodes / Points */}
                  {item.points.map((pt, ptIdx) => (
                    <g key={`pt-${ptIdx}`}>
                      {/* Vertex Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isCurrentHovered ? 2.5 : 1.8}
                        fill={isDark ? '#ffffff' : '#09090b'}
                        stroke={isDark ? '#000000' : '#ffffff'}
                        strokeWidth="0.7"
                      />
                      {/* Crosshair on primary corner vertices */}
                      {ptIdx % 3 === 0 && (
                        <path
                          d={`M ${pt.x - 3} ${pt.y} L ${pt.x + 3} ${pt.y} M ${pt.x} ${pt.y - 3} L ${pt.x} ${pt.y + 3}`}
                          stroke={isDark ? '#ffffff' : '#09090b'}
                          strokeWidth="0.6"
                          strokeOpacity={0.9}
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </div>

              {/* Letter Bottom Coordinate Badge on direct letter hover */}
              {isCurrentHovered && (
                <div
                  className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-1 py-0.5 rounded font-mono text-[8px] tracking-tighter whitespace-nowrap border ${isDark
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-800'
                    }`}
                >
                  V:{item.points.length} E:{item.edges.length}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* 4. Bottom Micro-Hint Status Bar */}
      {/* <div className="mt-4 flex items-center justify-center gap-3">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[9px] sm:text-[10px] uppercase tracking-widest transition-colors ${isDark
            ? 'text-zinc-400 bg-zinc-900/60 border border-zinc-800/80'
            : 'text-zinc-600 bg-zinc-100 border border-zinc-200'
            }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>[ Hover letters to reveal CAD topology & vertex mesh ]</span>
        </div>
      </div> */}
    </div>
  );
};
