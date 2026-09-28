import React, { useState, useRef, useEffect } from 'react';
import { WallpaperTheme, DesktopWindow } from '../types';
import { 
  Code2, 
  Table, 
  StickyNote, 
  Terminal, 
  Play, 
  RotateCcw, 
  Minus, 
  Square, 
  X, 
  Layers,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  Clock,
  Monitor,
  Tv,
  Laptop
} from 'lucide-react';
import { sound } from '../utils/audio';

interface VirtualDesktopProps {
  wallpaper: WallpaperTheme;
  onChangeWallpaper: (w: WallpaperTheme) => void;
  cozyWallpaperUrl: string;
  natureWallpaperUrl: string;
  onOpenFocusHub: () => void;
  onOpenDesktopModal: () => void;
  screenStream: MediaStream | null;
  isScreenSharing: boolean;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
}

const INITIAL_CODE_SNIPPET = `// 🚀 High-Priority Work Task
import { FocusEngine, DeepWork } from '@productivity/core';

async function executeDailyTasks(developer: Engineer) {
  const tasks = await fetchBacklog();
  
  for (const task of tasks) {
    if (task.urgeToWatchYouTube) {
      console.warn("⚠️ Distraction urge detected! Activating DeskToy shield...");
      punchVirtualMonitor({ force: 'MAXIMUM' });
      await petDeskCat(3);
    }
    
    // Deep work flow session
    await DeepWork.sprint({ minutes: 25, goal: task.title });
    console.log(\`✅ \${task.title} deployed with 0 bugs!\`);
  }
}

executeDailyTasks({ name: 'Focus Champion', caffeineLevel: 98 });
`;

const INITIAL_SPREADSHEET_DATA = [
  { id: '101', item: 'Feature: Anti-Distraction Screen Punch', owner: 'Me', progress: '100%', priority: 'CRITICAL', status: 'Shipped' },
  { id: '102', item: 'Refactor Focus Timer & Cat Loaf Physics', owner: 'Me', progress: '90%', priority: 'HIGH', status: 'In Review' },
  { id: '103', item: 'Ignore 10-hour Cat Video Recommendation', owner: 'Me', progress: '100%', priority: 'URGENT', status: 'Resisted' },
  { id: '104', item: 'Q3 Productivity Metrics Optimization', owner: 'Boss Bob', progress: '85%', priority: 'MEDIUM', status: 'Pending' },
  { id: '105', item: 'Daily Work-Life Balance Synchronization', owner: 'Sensei', progress: '95%', priority: 'HIGH', status: 'Active' },
];

export const VirtualDesktop: React.FC<VirtualDesktopProps> = ({
  wallpaper,
  onChangeWallpaper,
  cozyWallpaperUrl,
  natureWallpaperUrl,
  onOpenFocusHub,
  onOpenDesktopModal,
  screenStream,
  isScreenSharing,
  onStartScreenShare,
  onStopScreenShare,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Hook live video stream
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.play().catch(() => {});
    }
  }, [screenStream]);

  // Windows state
  const [windows, setWindows] = useState<DesktopWindow[]>([
    {
      id: 'code',
      title: 'VS Studio — FocusEngine.ts (Active Project)',
      isOpen: !isScreenSharing,
      isMinimized: false,
      x: 60,
      y: 70,
      width: 580,
      height: 420,
      zIndex: 10,
    },
    {
      id: 'spreadsheet',
      title: 'Q3_Work_Deliverables_Final.xlsx',
      isOpen: false,
      isMinimized: false,
      x: 320,
      y: 120,
      width: 620,
      height: 380,
      zIndex: 9,
    },
    {
      id: 'notes',
      title: 'Work Priority Sticky Note',
      isOpen: !isScreenSharing,
      isMinimized: false,
      x: window.innerWidth > 1100 ? window.innerWidth - 380 : 700,
      y: 70,
      width: 320,
      height: 260,
      zIndex: 8,
    },
  ]);

  // Code runner state
  const [code, setCode] = useState(INITIAL_CODE_SNIPPET);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Spreadsheet state
  const [spreadsheetData, setSpreadsheetData] = useState(INITIAL_SPREADSHEET_DATA);

  // Sticky note state
  const [stickyNoteText, setStickyNoteText] = useState(
    "🎯 TODAY'S MISSION:\n1. Complete work items without tab switching\n2. If overwhelmed, punch monitor 3 times\n3. Pet the desk cat for moral support!"
  );

  const bringToFront = (id: DesktopWindow['id']) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 10);
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    });
  };

  const toggleWindow = (id: DesktopWindow['id']) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const isOpen = !w.isOpen;
          return { ...w, isOpen, isMinimized: false, zIndex: 15 };
        }
        return w;
      })
    );
  };

  const closeWindow = (id: DesktopWindow['id']) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    sound.playFocusGong();
    setTerminalOutput(['[Running] ts-node FocusEngine.ts ...', 'Compiling modules...']);
    setTimeout(() => {
      setTerminalOutput((prev) => [
        ...prev,
        '✨ Focus Engine: 100% Flow State achieved.',
        '🛡️ Anti-YouTube shield armed and operational.',
        '🎉 All 5 tests passed successfully in 12ms.',
      ]);
      setIsRunningCode(false);
    }, 900);
  };

  const getWallpaperBackground = () => {
    if (isScreenSharing) {
      return { backgroundColor: '#020617' };
    }
    switch (wallpaper) {
      case 'cozy_desk':
        return {
          backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.4), rgba(10, 15, 30, 0.65)), url(${cozyWallpaperUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'nature_twilight':
        return {
          backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.3), rgba(10, 15, 30, 0.6)), url(${natureWallpaperUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'cyber_neon':
        return {
          backgroundImage: `radial-gradient(circle at 50% 50%, #1e1b4b 0%, #030712 100%)`,
        };
      case 'matrix_green':
        return {
          backgroundImage: `radial-gradient(circle at 50% 50%, #064e3b 0%, #022c22 60%, #020617 100%)`,
        };
      case 'dark_slate':
      default:
        return {
          backgroundImage: `radial-gradient(circle at top right, #1e293b 0%, #0f172a 50%, #020617 100%)`,
        };
    }
  };

  const codeWin = windows.find((w) => w.id === 'code');
  const sheetWin = windows.find((w) => w.id === 'spreadsheet');
  const noteWin = windows.find((w) => w.id === 'notes');

  return (
    <div
      style={getWallpaperBackground()}
      className="absolute inset-0 overflow-hidden select-none transition-all duration-700"
    >
      {/* Live Desktop Video Screen Stream Background */}
      {isScreenSharing && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none filter brightness-95 contrast-105"
        />
      )}

      {/* Desktop Top Status Bar / OS Menu */}
      <header className="absolute top-0 left-0 right-0 h-10 custom-glass-panel border-b border-white/10 z-20 flex items-center justify-between px-4 text-xs text-slate-200">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <span className="font-display font-bold tracking-tight text-white flex items-center gap-1.5 text-sm">
            <span className="text-indigo-400">DeskToy</span> Focus Sanctuary
          </span>

          {/* Desktop Overlay & KMP Guide Button */}
          <button
            onClick={onOpenDesktopModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all hover:scale-105"
          >
            <Laptop className="w-3.5 h-3.5 text-indigo-400" />
            <span>💻 Desktop Overlay & KMP</span>
          </button>
        </div>

        {/* Zone 2: Navigation / Window Toggle Shortcuts */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-300">
          <button
            onClick={() => toggleWindow('code')}
            className={`flex items-center gap-1.5 transition-colors ${
              codeWin?.isOpen ? 'text-indigo-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Editor</span>
          </button>
          <button
            onClick={() => toggleWindow('spreadsheet')}
            className={`flex items-center gap-1.5 transition-colors ${
              sheetWin?.isOpen ? 'text-emerald-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Spreadsheet</span>
          </button>
          <button
            onClick={() => toggleWindow('notes')}
            className={`flex items-center gap-1.5 transition-colors ${
              noteWin?.isOpen ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>Sticky Note</span>
          </button>
        </nav>

        {/* Zone 3: Live Stream Toggle & Actions */}
        <div className="flex items-center gap-2">
          {/* Real Screen Mirror Quick Button */}
          {isScreenSharing ? (
            <button
              onClick={onStopScreenShare}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold text-[11px] shadow-sm hover:bg-rose-500 transition-colors animate-pulse"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Streaming Screen (Stop)</span>
            </button>
          ) : (
            <button
              onClick={onStartScreenShare}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-[11px] transition-colors"
              title="Stream real screen/window under the punch fractures"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>Stream Real Screen</span>
            </button>
          )}

          {/* Wallpaper selector menu */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => onChangeWallpaper('cozy_desk')}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                wallpaper === 'cozy_desk' && !isScreenSharing ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Cozy Room"
            >
              ☕ Cozy
            </button>
            <button
              onClick={() => onChangeWallpaper('nature_twilight')}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                wallpaper === 'nature_twilight' && !isScreenSharing ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Serene Mountain"
            >
              🌲 Mountain
            </button>
            <button
              onClick={() => onChangeWallpaper('dark_slate')}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                wallpaper === 'dark_slate' && !isScreenSharing ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Dark Slate OS"
            >
              🌌 Slate
            </button>
          </div>

          <button
            onClick={onOpenFocusHub}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            Focus Coach
          </button>
        </div>
      </header>

      {/* Desktop Windows */}

      {/* 1. Fake Code Editor Window */}
      {codeWin?.isOpen && !isScreenSharing && (
        <div
          style={{
            transform: `translate3d(${codeWin.x}px, ${codeWin.y}px, 0)`,
            width: `${codeWin.width}px`,
            zIndex: codeWin.zIndex,
          }}
          onClick={() => bringToFront('code')}
          className="absolute rounded-xl custom-glass-panel border border-slate-700/80 shadow-2xl overflow-hidden pointer-events-auto"
        >
          {/* Window Titlebar */}
          <div className="h-8 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3 cursor-move">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => closeWindow('code')}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors"
                />
                <button
                  onClick={() => toggleWindow('code')}
                  className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors"
                />
                <button className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono ml-2">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>FocusEngine.ts — Workspace</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunningCode}
                className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium transition-colors shadow-sm"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{isRunningCode ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Editor Body */}
          <div className="p-3 bg-slate-950/85 font-mono text-xs text-slate-200">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-44 bg-transparent resize-none focus:outline-none leading-relaxed text-indigo-200 selection:bg-indigo-600/40"
            />

            {/* Terminal Output */}
            <div className="mt-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span>TERMINAL OUTPUT</span>
              </div>
              <div className="bg-black/50 p-2 rounded text-[11px] font-mono text-emerald-300 min-h-[50px] max-h-[80px] overflow-y-auto">
                {terminalOutput.length === 0 ? (
                  <span className="text-slate-500">// Click "Run Code" or type code here...</span>
                ) : (
                  terminalOutput.map((out, idx) => <div key={idx}>{out}</div>)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fake Spreadsheet Window */}
      {sheetWin?.isOpen && !isScreenSharing && (
        <div
          style={{
            transform: `translate3d(${sheetWin.x}px, ${sheetWin.y}px, 0)`,
            width: `${sheetWin.width}px`,
            zIndex: sheetWin.zIndex,
          }}
          onClick={() => bringToFront('spreadsheet')}
          className="absolute rounded-xl custom-glass-panel border border-slate-700/80 shadow-2xl overflow-hidden pointer-events-auto"
        >
          {/* Window Titlebar */}
          <div className="h-8 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-3 cursor-move">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => closeWindow('spreadsheet')}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors"
                />
                <button className="w-3 h-3 rounded-full bg-amber-500" />
                <button className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium ml-2">
                <Table className="w-3.5 h-3.5 text-emerald-400" />
                <span>Q3_Sprint_Deliverables.xlsx</span>
              </div>
            </div>
          </div>

          {/* Spreadsheet Table */}
          <div className="p-3 bg-slate-950/85 overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-200 font-mono">
              <thead className="text-[11px] text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="py-1.5 px-2">ID</th>
                  <th className="py-1.5 px-2">Deliverable Item</th>
                  <th className="py-1.5 px-2">Owner</th>
                  <th className="py-1.5 px-2">Progress</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {spreadsheetData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2 px-2 text-slate-400 tabular-nums">{row.id}</td>
                    <td className="py-2 px-2 text-slate-100 font-sans">{row.item}</td>
                    <td className="py-2 px-2 text-slate-300">{row.owner}</td>
                    <td className="py-2 px-2 text-emerald-400 tabular-nums">{row.progress}</td>
                    <td className="py-2 px-2">
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Sticky Notes Window */}
      {noteWin?.isOpen && !isScreenSharing && (
        <div
          style={{
            transform: `translate3d(${noteWin.x}px, ${noteWin.y}px, 0)`,
            width: `${noteWin.width}px`,
            zIndex: noteWin.zIndex,
          }}
          onClick={() => bringToFront('notes')}
          className="absolute rounded-xl bg-amber-300 text-amber-950 shadow-2xl p-3 border border-amber-400 pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-amber-400/60 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <StickyNote className="w-3.5 h-3.5" />
              <span>Today's Work Sticky Note</span>
            </div>
            <button
              onClick={() => closeWindow('notes')}
              className="p-0.5 hover:bg-amber-400/50 rounded transition-colors text-amber-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={stickyNoteText}
            onChange={(e) => setStickyNoteText(e.target.value)}
            className="w-full h-36 bg-transparent text-xs font-sans font-medium resize-none focus:outline-none leading-relaxed text-amber-950 placeholder-amber-800"
          />
        </div>
      )}
    </div>
  );
};
