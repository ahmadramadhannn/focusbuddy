import React from 'react';
import { ToolType } from '../types';
import { 
  Sparkles, 
  Droplets, 
  Paintbrush, 
  CircleDot, 
  Trash2, 
  Zap, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  Brush,
  Radio,
  Stamp,
  Music
} from 'lucide-react';

interface ToyToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  paintColor: string;
  onSelectPaintColor: (color: string) => void;
  punchPower: number;
  onSelectPunchPower: (power: number) => void;
  onCleanAll: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  ambientSound: 'off' | 'rain' | 'lofi' | 'brown_noise';
  onSelectAmbient: (ambient: 'off' | 'rain' | 'lofi' | 'brown_noise') => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  activeStickerText: string;
  onSelectStickerText: (text: string) => void;
}

const PAINT_COLORS = [
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#a3e635', // Slime Lime
  '#f8fafc', // Clean White
];

const STICKER_PRESETS = [
  { text: 'NO YOUTUBE!', emoji: '🚫', color: 'bg-rose-600' },
  { text: 'DO NOT DISTRACT', emoji: '⛔', color: 'bg-amber-600' },
  { text: 'WORK IN PROGRESS', emoji: '⚡', color: 'bg-indigo-600' },
  { text: 'COFFEE FUEL', emoji: '☕', color: 'bg-yellow-700' },
  { text: '100% FOCUS MODE', emoji: '🎯', color: 'bg-emerald-600' },
  { text: 'DEADLINE AHEAD', emoji: '🔥', color: 'bg-red-700' },
];

export const ToyToolbar: React.FC<ToyToolbarProps> = ({
  currentTool,
  onSelectTool,
  paintColor,
  onSelectPaintColor,
  punchPower,
  onSelectPunchPower,
  onCleanAll,
  isMuted,
  onToggleMute,
  ambientSound,
  onSelectAmbient,
  isFullscreen,
  onToggleFullscreen,
  activeStickerText,
  onSelectStickerText,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 pointer-events-auto select-none">
      {/* Tool-specific Secondary Bar (e.g. Paint colors, Punch power, Stickers) */}
      {currentTool === 'paint' && (
        <div className="flex items-center gap-1.5 p-1.5 rounded-full custom-glass-panel border border-slate-700/80 shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <span className="text-[11px] text-slate-300 font-medium px-2">Paint:</span>
          {PAINT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onSelectPaintColor(c)}
              style={{ backgroundColor: c }}
              className={`w-5 h-5 rounded-full transition-transform ${
                paintColor === c ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110 opacity-80'
              }`}
            />
          ))}
        </div>
      )}

      {currentTool === 'punch' && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full custom-glass-panel border border-slate-700/80 shadow-xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2">
          <span className="font-semibold text-rose-300">Punch Force:</span>
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              onClick={() => onSelectPunchPower(level)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                punchPower === level
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {level === 1 ? '👊 Light Tap' : level === 2 ? '🥊 Heavy Punch' : '🔨 SLEDGEHAMMER'}
            </button>
          ))}
        </div>
      )}

      {currentTool === 'sticker' && (
        <div className="flex items-center gap-1.5 p-1.5 rounded-full custom-glass-panel border border-slate-700/80 shadow-xl animate-in fade-in slide-in-from-bottom-2 max-w-full overflow-x-auto">
          <span className="text-[11px] text-slate-300 font-medium px-2 shrink-0">Sticker:</span>
          {STICKER_PRESETS.map((st) => (
            <button
              key={st.text}
              onClick={() => onSelectStickerText(st.text)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white transition-all shrink-0 flex items-center gap-1 ${st.color} ${
                activeStickerText === st.text ? 'ring-2 ring-white scale-105 shadow-md' : 'opacity-85 hover:opacity-100'
              }`}
            >
              <span>{st.emoji}</span>
              <span>{st.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Dock Bar */}
      <div className="flex items-center gap-1.5 p-2 rounded-2xl custom-glass-panel border border-slate-700/70 shadow-2xl">
        {/* Punch Tool */}
        <button
          onClick={() => onSelectTool('punch')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'punch'
              ? 'bg-rose-600 text-white shadow-lg scale-105 ring-2 ring-rose-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Punch the monitor (Glass shatter effects)"
        >
          <span className="text-xl">👊</span>
          <span className="text-[10px] mt-0.5">Punch</span>
        </button>

        {/* Mop & Broom (Sapu) */}
        <button
          onClick={() => onSelectTool('mop')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'mop'
              ? 'bg-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Mop & Broom (Sapu) to sweep screen clean"
        >
          <span className="text-xl">🧹</span>
          <span className="text-[10px] mt-0.5">Sapu/Mop</span>
        </button>

        {/* Squeegee Wiper */}
        <button
          onClick={() => onSelectTool('squeegee')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'squeegee'
              ? 'bg-sky-600 text-white shadow-lg scale-105 ring-2 ring-sky-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Squeegee Wiper (Crystal clean glass wipe)"
        >
          <span className="text-xl">🧽</span>
          <span className="text-[10px] mt-0.5">Wiper</span>
        </button>

        {/* Water Gun / Spray */}
        <button
          onClick={() => onSelectTool('water')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'water'
              ? 'bg-cyan-600 text-white shadow-lg scale-105 ring-2 ring-cyan-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Water squirt gun with gravity dripping physics"
        >
          <span className="text-xl">💦</span>
          <span className="text-[10px] mt-0.5">Water</span>
        </button>

        {/* Paint Splatter */}
        <button
          onClick={() => onSelectTool('paint')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'paint'
              ? 'bg-purple-600 text-white shadow-lg scale-105 ring-2 ring-purple-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Paint splatter gun with dripping physics"
        >
          <span className="text-xl">🎨</span>
          <span className="text-[10px] mt-0.5">Paint</span>
        </button>

        {/* Bubble Wrap Popper */}
        <button
          onClick={() => onSelectTool('bubble_wrap')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'bubble_wrap'
              ? 'bg-emerald-600 text-white shadow-lg scale-105 ring-2 ring-emerald-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Infinite Bubble Wrap Pop Sheet"
        >
          <span className="text-xl">🫧</span>
          <span className="text-[10px] mt-0.5">Bubbles</span>
        </button>

        {/* Laser Pointer */}
        <button
          onClick={() => onSelectTool('laser')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'laser'
              ? 'bg-red-600 text-white shadow-lg scale-105 ring-2 ring-red-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Laser Pointer (Play with your desk cat!)"
        >
          <span className="text-xl">🔴</span>
          <span className="text-[10px] mt-0.5">Laser</span>
        </button>

        {/* Slap Sticker */}
        <button
          onClick={() => onSelectTool('sticker')}
          className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl text-xs font-medium transition-all ${
            currentTool === 'sticker'
              ? 'bg-yellow-600 text-white shadow-lg scale-105 ring-2 ring-yellow-400'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
          title="Slap funny work accountability stickers"
        >
          <span className="text-xl">🏷️</span>
          <span className="text-[10px] mt-0.5">Sticker</span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-9 bg-slate-700/80 mx-1" />

        {/* Ambient Sound Selector */}
        <div className="flex flex-col items-center gap-1 px-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSelectAmbient(ambientSound === 'rain' ? 'off' : 'rain')}
              className={`p-2 rounded-lg text-xs transition-all ${
                ambientSound === 'rain' ? 'bg-sky-600 text-white shadow' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Cozy Rain Soundscape"
            >
              🌧️
            </button>
            <button
              onClick={() => onSelectAmbient(ambientSound === 'lofi' ? 'off' : 'lofi')}
              className={`p-2 rounded-lg text-xs transition-all ${
                ambientSound === 'lofi' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Chill Lofi Study Pad"
            >
              🎵
            </button>
          </div>
          <span className="text-[9px] text-slate-400 font-medium">Ambient</span>
        </div>

        {/* Mute Audio */}
        <button
          onClick={onToggleMute}
          className={`p-2.5 rounded-xl transition-all ${
            isMuted ? 'bg-rose-900/50 text-rose-300 border border-rose-700/50' : 'bg-slate-800/80 text-slate-300 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Clean All Reset Button */}
        <button
          onClick={onCleanAll}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700/50 text-xs font-semibold transition-all ml-1"
          title="Clean entire screen (remove all cracks & splatters)"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clean All</span>
        </button>
      </div>
    </div>
  );
};
