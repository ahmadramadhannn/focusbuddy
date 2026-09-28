import React, { useEffect, useState } from 'react';
import { ToolType } from '../types';

interface ScreenCursorOverlayProps {
  currentTool: ToolType;
  punchPower: number;
  paintColor: string;
  isMouseDown: boolean;
  mousePos: { x: number; y: number };
}

export const ScreenCursorOverlay: React.FC<ScreenCursorOverlayProps> = ({
  currentTool,
  punchPower,
  paintColor,
  isMouseDown,
  mousePos,
}) => {
  const [isPunching, setIsPunching] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    if (isMouseDown && currentTool === 'punch') {
      setIsPunching(true);
      const t = setTimeout(() => setIsPunching(false), 220);
      return () => clearTimeout(t);
    }
    if (isMouseDown && (currentTool === 'mop' || currentTool === 'squeegee')) {
      setIsSweeping(true);
    } else {
      setIsSweeping(false);
    }
  }, [isMouseDown, currentTool]);

  if (mousePos.x < 0 || mousePos.y < 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* 1. BOXING GLOVE CURSOR */}
      {currentTool === 'punch' && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 24}px, ${mousePos.y - 28}px, 0) ${
              isPunching
                ? 'scale(1.4) translate(-8px, -8px) rotate(-20deg)'
                : 'scale(1) rotate(-8deg)'
            }`,
            transition: isPunching ? 'transform 0.08s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'transform 0.15s ease-out',
          }}
          className="relative select-none filter drop-shadow-2xl"
        >
          {/* Punch impact spark when punching */}
          {isPunching && (
            <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
          )}

          {/* Boxing Glove Graphic */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-rose-800 border-2 border-red-300 shadow-xl flex items-center justify-center transform -rotate-12">
              {/* Glove Laces / Wrist Strap */}
              <div className="absolute -bottom-2 left-2 right-2 h-4 rounded bg-slate-900 border border-slate-700 flex items-center justify-around px-1">
                <div className="w-1 h-2 bg-white/70 rounded-full" />
                <div className="w-1 h-2 bg-white/70 rounded-full" />
                <div className="w-1 h-2 bg-white/70 rounded-full" />
              </div>
              {/* Glove Thumb */}
              <div className="absolute -left-2 top-3 w-5 h-7 rounded-full bg-red-600 border border-red-400 -rotate-30" />
              {/* Highlight / Power Badge */}
              <div className="text-white font-black text-xs font-mono tracking-tighter drop-shadow">
                {punchPower === 3 ? '💥MAX' : punchPower === 2 ? '🥊2x' : '🥊1x'}
              </div>
            </div>

            {/* Impact Flash text */}
            {isPunching && (
              <div className="absolute -top-4 -right-6 text-amber-300 font-extrabold text-sm font-display animate-bounce drop-shadow">
                POW!
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SAPU / BROOM & MOP CURSOR */}
      {currentTool === 'mop' && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 20}px, ${mousePos.y - 20}px, 0) ${
              isSweeping ? 'rotate(25deg) scale(1.15)' : 'rotate(0deg) scale(1)'
            }`,
            transition: 'transform 0.12s ease-out',
          }}
          className="relative select-none filter drop-shadow-xl"
        >
          <div className="relative flex flex-col items-center">
            {/* Wooden Handle */}
            <div className="w-2.5 h-12 bg-amber-700 rounded-full border border-amber-900 shadow-inner" />
            {/* Broom Bristles (Sapu) */}
            <div className="w-12 h-8 rounded-b-xl bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-amber-300 shadow-md flex items-end justify-around pb-1">
              <div className="w-0.5 h-4 bg-amber-800/60" />
              <div className="w-0.5 h-4 bg-amber-800/60" />
              <div className="w-0.5 h-4 bg-amber-800/60" />
              <div className="w-0.5 h-4 bg-amber-800/60" />
            </div>
            {isSweeping && (
              <div className="absolute -bottom-2 text-[10px] font-bold text-emerald-300 whitespace-nowrap">
                🧹 Sweeping...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SQUEEGEE WIPER */}
      {currentTool === 'squeegee' && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 30}px, ${mousePos.y - 15}px, 0) ${
              isSweeping ? 'translateY(6px) rotate(-10deg)' : 'rotate(0deg)'
            }`,
            transition: 'transform 0.1s ease-out',
          }}
          className="relative select-none filter drop-shadow-xl"
        >
          <div className="flex flex-col items-center">
            {/* Rubber Blade */}
            <div className="w-16 h-3.5 rounded-t-sm bg-cyan-500 border border-cyan-300 shadow-md" />
            {/* Handle */}
            <div className="w-3 h-10 bg-slate-800 rounded-b-full border border-slate-600 shadow" />
          </div>
        </div>
      )}

      {/* 4. WATER GUN / SPRAY */}
      {currentTool === 'water' && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 15}px, ${mousePos.y - 25}px, 0) ${
              isMouseDown ? 'scale(1.15) rotate(-15deg)' : 'scale(1)'
            }`,
            transition: 'transform 0.1s ease-out',
          }}
          className="relative select-none filter drop-shadow-lg"
        >
          <div className="flex items-center">
            <span className="text-3xl">🔫</span>
            {isMouseDown && (
              <span className="text-sky-300 text-xs font-bold animate-pulse -ml-1">💦 SQUIRT!</span>
            )}
          </div>
        </div>
      )}

      {/* 5. PAINT CANNON */}
      {currentTool === 'paint' && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 15}px, ${mousePos.y - 25}px, 0) ${
              isMouseDown ? 'scale(1.2) rotate(10deg)' : 'scale(1)'
            }`,
            transition: 'transform 0.1s ease-out',
          }}
          className="relative select-none filter drop-shadow-lg flex items-center gap-1"
        >
          <div
            style={{ backgroundColor: paintColor }}
            className="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-xs"
          >
            🎨
          </div>
          {isMouseDown && (
            <span className="text-xs font-black text-white drop-shadow">SPLAT!</span>
          )}
        </div>
      )}

      {/* 6. LASER POINTER */}
      {currentTool === 'laser' && (
        <div
          style={{
            transform: `translate3d(${mousePos.x - 12}px, ${mousePos.y - 12}px, 0)`,
          }}
          className="relative flex items-center justify-center"
        >
          <div className="w-6 h-6 rounded-full bg-red-500/40 animate-ping absolute" />
          <div className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-[0_0_12px_#ef4444]" />
          <div className="w-1.5 h-1.5 rounded-full bg-white absolute" />
        </div>
      )}
    </div>
  );
};
