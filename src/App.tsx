import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ToolType, 
  GlassCrack, 
  Droplet, 
  WipeTrail, 
  ScreenSticker, 
  CatBreed,
  CoachPersonality 
} from './types';
import { sound } from './utils/audio';
import { ScreenCanvas } from './components/ScreenCanvas';
import { InteractiveCat } from './components/InteractiveCat';
import { FocusCoach } from './components/FocusCoach';
import { ScreenCursorOverlay } from './components/ScreenCursorOverlay';
import { BubbleWrapModal } from './components/BubbleWrapModal';
import { DesktopCompanionModal } from './components/DesktopCompanionModal';
import { 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Maximize,
  Minimize,
  Sliders,
  Laptop,
  Tv,
  ChevronUp,
  ChevronDown,
  Layers,
  Cat,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react';

export default function App() {
  // Active Tool state
  const [currentTool, setCurrentTool] = useState<ToolType>('punch');
  const [punchPower, setPunchPower] = useState<number>(2);
  const [paintColor, setPaintColor] = useState<string>('#ef4444');
  const [activeStickerText, setActiveStickerText] = useState<string>('NO YOUTUBE!');

  // Screen effects physics state
  const [cracks, setCracks] = useState<GlassCrack[]>([]);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [wipeTrails, setWipeTrails] = useState<WipeTrail[]>([]);
  const [stickers, setStickers] = useState<ScreenSticker[]>([]);
  const [shockwaves, setShockwaves] = useState<
    { x: number; y: number; radius: number; maxRadius: number; opacity: number }[]
  >([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Mouse & Laser tracking
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Floating Objects & Coach
  const [catBreed, setCatBreed] = useState<CatBreed>('orange_tabby');
  const [coachPersonality, setCoachPersonality] = useState<CoachPersonality>('boss');
  const [isFocusPanelOpen, setIsFocusPanelOpen] = useState(false);
  const [isBubbleWrapOpen, setIsBubbleWrapOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);

  // Floating Coach Dialog roaming bubble
  const [floatingCoachPos, setFloatingCoachPos] = useState({ x: window.innerWidth - 300, y: 50 });
  const [coachThought, setCoachThought] = useState("Hey! Don't switch tabs! Back to work! 🎯");
  const [isCoachVisible, setIsCoachVisible] = useState(true);

  // Audio Settings & Fullscreen
  const [isMuted, setIsMuted] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'lofi' | 'brown_noise'>('off');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Real Screen Stream
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Background style: Pure Transparent vs Live Screen Stream vs Translucent Tint
  const [backdropMode, setBackdropMode] = useState<'transparent' | 'stream' | 'glass_dark'>('transparent');

  // Track global mouse position for custom boxing glove / broom cursor
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (currentTool === 'laser') {
        setLaserPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleGlobalMouseDown = () => setIsMouseDown(true);
    const handleGlobalMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mousedown', handleGlobalMouseDown);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mousedown', handleGlobalMouseDown);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [currentTool]);

  // Hook live screen stream if active
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
      videoRef.current.play().catch(() => {});
    }
  }, [screenStream]);

  // Periodic coach reminder check-ins
  useEffect(() => {
    const quotes = [
      "🚨 Hey! Did that YouTube video solve your task?",
      "👊 Punch the screen if stressed, then write 5 lines of code!",
      "🐱 The cat is judging your distraction level. Focus!",
      "⚡ Dopamine is cheap, shipping working code is priceless!",
      "⏱️ 25 minutes of deep focus right now. You can do it!",
      "🛑 Stop checking other tabs! Your future self is watching!",
    ];

    const interval = setInterval(() => {
      const nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setCoachThought(nextQuote);
      setIsCoachVisible(true);
      sound.playCatMeow(false);
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Erase effects within radius
  const eraseInRadius = useCallback((x: number, y: number, radius: number) => {
    setCracks((prev) => prev.filter((c) => Math.hypot(c.x - x, c.y - y) > radius + c.radius * 0.5));
    setDroplets((prev) => prev.filter((d) => Math.hypot(d.x - x, d.y - y) > radius + d.radius));
    setStickers((prev) => prev.filter((s) => Math.hypot(s.x - x, s.y - y) > radius + 30));
  }, []);

  // Helper to generate realistic glass crack geometry
  const createCrack = (x: number, y: number, power: number): GlassCrack => {
    const radius = 35 + power * 35 + Math.random() * 25;
    const branchesCount = 6 + power * 3;
    const rings = 2 + power;
    const holeRadius = power === 3 ? 18 : power === 2 ? 10 : 5;

    const branches = [];
    for (let i = 0; i < branchesCount; i++) {
      const angle = (i / branchesCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const length = radius * (0.6 + Math.random() * 0.6);
      const subBranches = [
        { angle: angle + (Math.random() * 0.6 - 0.3), length: length * 0.45 },
        { angle: angle - (Math.random() * 0.6 - 0.3), length: length * 0.35 },
      ];
      branches.push({ angle, length, subBranches });
    }

    const shardsCount = 3 + power * 2;
    const shards = [];
    for (let s = 0; s < shardsCount; s++) {
      const shardAngle = Math.random() * Math.PI * 2;
      const shardDist = Math.random() * (radius * 0.4);
      const shardSize = 8 + Math.random() * 14;
      shards.push({
        points: [
          { x: 0, y: 0 },
          { x: Math.cos(shardAngle) * shardSize, y: Math.sin(shardAngle) * shardSize },
          { x: Math.cos(shardAngle + 0.6) * (shardSize * 0.8), y: Math.sin(shardAngle + 0.6) * (shardSize * 0.8) },
        ],
        offset: {
          x: Math.cos(shardAngle) * shardDist,
          y: Math.sin(shardAngle) * shardDist,
        },
        alpha: 0.85,
        color: 'rgba(230, 245, 255, 0.55)',
      });
    }

    return {
      id: Date.now().toString() + Math.random(),
      x,
      y,
      radius,
      severity: power,
      rings,
      branches,
      holeRadius,
      shatteredShards: shards,
      createdAt: Date.now(),
    };
  };

  // Trigger Screen Shake
  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 360);
  };

  // Tool Click Handler
  const handleScreenClick = (x: number, y: number) => {
    switch (currentTool) {
      case 'punch': {
        if (punchPower === 3) {
          sound.playGlassShatter();
        } else {
          sound.playPunch(punchPower === 2 ? 1.0 : 0.6);
          sound.playGlassCrack();
        }
        triggerScreenShake();

        const newCrack = createCrack(x, y, punchPower);
        setCracks((prev) => [...prev, newCrack]);

        setShockwaves((prev) => [
          ...prev,
          { x, y, radius: 10, maxRadius: 110 * punchPower, opacity: 0.9 },
        ]);
        break;
      }

      case 'mop':
      case 'squeegee': {
        if (currentTool === 'mop') sound.playMopSwish();
        else sound.playSqueegeeSqueak();
        const brushRadius = currentTool === 'mop' ? 75 : 55;
        setWipeTrails((prev) => [...prev, { x, y, radius: brushRadius }]);
        eraseInRadius(x, y, brushRadius);
        break;
      }

      case 'water': {
        sound.playWaterDrip();
        const count = 3 + Math.floor(Math.random() * 4);
        const newDrops: Droplet[] = [];
        for (let i = 0; i < count; i++) {
          const offsetX = (Math.random() - 0.5) * 45;
          const offsetY = (Math.random() - 0.5) * 35;
          newDrops.push({
            id: Date.now().toString() + Math.random() + i,
            x: x + offsetX,
            y: y + offsetY,
            radius: 5 + Math.random() * 8,
            color: 'rgba(180, 225, 255, 0.75)',
            type: 'water',
            dripLength: 0,
            maxDripLength: 40 + Math.random() * 120,
            speed: 0.8 + Math.random() * 1.5,
            opacity: 0.85,
          });
        }
        setDroplets((prev) => [...prev, ...newDrops]);
        break;
      }

      case 'paint': {
        sound.playPaintSplat();
        const splatRadius = 14 + Math.random() * 18;
        const splatPoints = [];
        const pts = 10;
        for (let p = 0; p < pts; p++) {
          const theta = (p / pts) * Math.PI * 2;
          const r = splatRadius * (0.6 + Math.random() * 0.8);
          splatPoints.push({ x: Math.cos(theta) * r, y: Math.sin(theta) * r });
        }

        const newPaint: Droplet = {
          id: Date.now().toString() + Math.random(),
          x,
          y,
          radius: splatRadius,
          color: paintColor,
          type: 'paint',
          dripLength: 0,
          maxDripLength: 30 + Math.random() * 80,
          speed: 0.6 + Math.random() * 1.2,
          opacity: 0.95,
          splatPoints,
        };
        setDroplets((prev) => [...prev, newPaint]);
        break;
      }

      case 'bubble_wrap': {
        setIsBubbleWrapOpen(true);
        break;
      }

      case 'sticker': {
        sound.playPunch(0.4);
        const newSticker: ScreenSticker = {
          id: Date.now().toString(),
          x: x - 50,
          y: y - 20,
          text: activeStickerText,
          emoji: activeStickerText.includes('YOUTUBE') ? '🚫' : activeStickerText.includes('COFFEE') ? '☕' : '⚡',
          color: 'bg-amber-500',
          rotation: (Math.random() - 0.5) * 20,
        };
        setStickers((prev) => [...prev, newSticker]);
        break;
      }

      case 'laser': {
        setLaserPos({ x, y });
        break;
      }
    }
  };

  // Continuous drag handler for broom / mop / spray
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'laser') {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }

    if (isMouseDown && (currentTool === 'mop' || currentTool === 'squeegee')) {
      const radius = currentTool === 'mop' ? 70 : 50;
      setWipeTrails((prev) => [...prev, { x: e.clientX, y: e.clientY, radius }]);
      eraseInRadius(e.clientX, e.clientY, radius);
      if (Math.random() < 0.2) {
        if (currentTool === 'mop') sound.playMopSwish();
        else sound.playSqueegeeSqueak();
      }
    } else if (isMouseDown && currentTool === 'water') {
      if (Math.random() < 0.25) {
        handleScreenClick(e.clientX, e.clientY);
      }
    }
  };

  // Start Screen Share to project real desktop under transparent overlay
  const handleStartScreenShare = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
          } as MediaTrackConstraints,
          audio: false,
        });

        setScreenStream(stream);
        setBackdropMode('stream');

        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setBackdropMode('transparent');
        };
      }
    } catch (err) {
      console.warn('Screen share canceled:', err);
    }
  };

  const handleStopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setBackdropMode('transparent');
    }
  };

  // Clean all fractures & droplets
  const handleCleanAll = () => {
    sound.playMopSwish();
    setCracks([]);
    setDroplets([]);
    setWipeTrails([]);
    setStickers([]);
  };

  // Physics animation loop
  useEffect(() => {
    let animId: number;
    const updatePhysics = () => {
      setDroplets((prev) =>
        prev.map((drop) => {
          if (drop.dripLength < drop.maxDripLength) {
            return {
              ...drop,
              dripLength: drop.dripLength + drop.speed,
            };
          }
          return drop;
        })
      );

      setShockwaves((prev) =>
        prev
          .map((sw) => ({
            ...sw,
            radius: sw.radius + 6,
            opacity: sw.opacity - 0.04,
          }))
          .filter((sw) => sw.opacity > 0 && sw.radius < sw.maxRadius)
      );

      setWipeTrails((prev) =>
        prev
          .map((t) => ({ ...t, radius: Math.max(0, t.radius - 1.5) }))
          .filter((t) => t.radius > 5)
      );

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden select-none transition-colors duration-300 ${
        isScreenShaking ? 'animate-screen-shake' : ''
      } ${
        backdropMode === 'transparent'
          ? 'bg-slate-950/20 backdrop-blur-[0.5px]'
          : backdropMode === 'glass_dark'
          ? 'bg-slate-950/70 backdrop-blur-sm'
          : 'bg-black'
      }`}
      style={{
        cursor: 'none', // ScreenCursorOverlay renders custom boxing glove / broom / laser
      }}
    >
      {/* 1. Live Real Screen Feed (If user captures real desktop/window) */}
      {screenStream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none filter brightness-95 contrast-105"
        />
      )}

      {/* 2. Top Ultra-Slim Translucent Overlay Header */}
      <header className="absolute top-2 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full shadow-lg text-xs text-slate-200">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="text-rose-400">🥊</span> DeskToy Transparent Screen Overlay
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Transparent Work Mode
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Real Screen Mirror Toggle */}
          {screenStream ? (
            <button
              onClick={handleStopScreenShare}
              className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg transition-colors flex items-center gap-1.5 animate-pulse"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Stop Screen Mirror</span>
            </button>
          ) : (
            <button
              onClick={handleStartScreenShare}
              className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-medium backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5"
              title="Stream your active desktop/IDE/browser directly behind the punch effects"
            >
              <Tv className="w-3.5 h-3.5 text-indigo-400" />
              <span>📺 Mirror Real Desktop</span>
            </button>
          )}

          {/* Desktop KMP Guide */}
          <button
            onClick={() => setIsDesktopModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>💻 Kotlin Multiplatform</span>
          </button>

          {/* Focus Coach Hub */}
          <button
            onClick={() => setIsFocusPanelOpen(true)}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold backdrop-blur-md shadow-lg transition-all flex items-center gap-1.5"
          >
            <span>🎯</span>
            <span>Focus Hub</span>
          </button>

          {/* Clean All */}
          <button
            onClick={handleCleanAll}
            className="px-3 py-1.5 rounded-full bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold backdrop-blur-md shadow-lg transition-all flex items-center gap-1"
            title="Clean all fractures and paint immediately"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clean All</span>
          </button>
        </div>
      </header>

      {/* 3. Screen Physics Canvas (Cracks, Paint, Water, Wipe Trails) */}
      <ScreenCanvas
        cracks={cracks}
        droplets={droplets}
        wipeTrails={wipeTrails}
        stickers={stickers}
        laserPos={currentTool === 'laser' ? laserPos : null}
        shockwaves={shockwaves}
        onCanvasMouseDown={(e) => handleScreenClick(e.clientX, e.clientY)}
        onCanvasMouseMove={handleCanvasMouseMove}
        onCanvasMouseUp={() => setIsMouseDown(false)}
      />

      {/* 4. Screen Stickers */}
      {stickers.map((st) => (
        <div
          key={st.id}
          style={{
            transform: `translate3d(${st.x}px, ${st.y}px, 0) rotate(${st.rotation}deg)`,
          }}
          className="absolute z-35 px-3.5 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-display font-black text-xs shadow-2xl border-2 border-amber-300 pointer-events-none select-none flex items-center gap-1.5 animate-in zoom-in-75"
        >
          <span className="text-sm">{st.emoji}</span>
          <span>{st.text}</span>
        </div>
      ))}

      {/* 5. Free-Roaming Interactive Desk Cat Mascot */}
      <InteractiveCat
        laserPos={currentTool === 'laser' ? laserPos : null}
        selectedBreed={catBreed}
      />

      {/* 6. Floating Roaming Focus Coach Object (Come Back to Work Drone) */}
      {isCoachVisible && (
        <div
          style={{
            transform: `translate3d(${floatingCoachPos.x}px, ${floatingCoachPos.y}px, 0)`,
          }}
          className="absolute z-40 pointer-events-auto transition-transform duration-500 ease-out select-none"
        >
          <div className="relative group flex items-start gap-2.5">
            {/* Coach Drone Avatar */}
            <div
              onClick={() => {
                sound.playLaserSound();
                setCoachThought("🚀 Focus Mode Activated! 0 distractions permitted!");
              }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-2xl border-2 border-white/40 cursor-pointer hover:scale-110 active:scale-95 transition-transform animate-bounce"
            >
              {coachPersonality === 'alarm' ? '⏰' : coachPersonality === 'duck' ? '🦆' : coachPersonality === 'sensei' ? '🍵' : '👔'}
            </div>

            {/* Speech Bubble Object Telling User to Come Back to Work */}
            <div className="bg-slate-900/90 backdrop-blur-md border border-indigo-400/40 rounded-2xl p-3 shadow-2xl max-w-xs text-xs text-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <span>🚨</span> Focus Alarm
                </span>
                <button
                  onClick={() => setIsCoachVisible(false)}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="font-medium leading-snug">{coachThought}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <button
                  onClick={() => {
                    handleScreenClick(window.innerWidth / 2, window.innerHeight / 2);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
                >
                  👊 Punch 1x
                </button>
                <button
                  onClick={() => {
                    sound.playFocusGong();
                    setIsCoachVisible(false);
                  }}
                  className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors"
                >
                  I'm Working!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Bottom Floating Transparent Toy Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300">
        <div className="bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl p-2 flex items-center gap-2">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title={isToolbarCollapsed ? 'Expand toolbar' : 'Minimize toolbar'}
          >
            {isToolbarCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {!isToolbarCollapsed && (
            <>
              {/* Tool Selector Buttons */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                {/* 1. Boxing Glove (Punch) */}
                <button
                  onClick={() => {
                    setCurrentTool('punch');
                    sound.playPunch(0.8);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentTool === 'punch'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🥊</span>
                  <span>Boxing Glove</span>
                </button>

                {/* Punch Force Level Switcher */}
                {currentTool === 'punch' && (
                  <button
                    onClick={() => {
                      const next = punchPower >= 3 ? 1 : punchPower + 1;
                      setPunchPower(next);
                      sound.playGlassCrack();
                    }}
                    className="px-2 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/60 text-[10px] font-bold"
                    title="Switch punching power (1x, 2x, 💥MAX)"
                  >
                    {punchPower === 1 ? '1x Tap' : punchPower === 2 ? '2x Punch' : '💥 SLEDGE'}
                  </button>
                )}

                {/* 2. Sapu / Mop Broom */}
                <button
                  onClick={() => {
                    setCurrentTool('mop');
                    sound.playMopSwish();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentTool === 'mop'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🧹</span>
                  <span>Sapu / Broom</span>
                </button>

                {/* 3. Water Gun */}
                <button
                  onClick={() => {
                    setCurrentTool('water');
                    sound.playWaterDrip();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentTool === 'water'
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🔫</span>
                  <span>Water Gun</span>
                </button>

                {/* 4. Paint Cannon */}
                <button
                  onClick={() => {
                    setCurrentTool('paint');
                    sound.playPaintSplat();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentTool === 'paint'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🎨</span>
                  <span>Paint</span>
                </button>

                {/* 5. Laser Pointer (Chase with cat) */}
                <button
                  onClick={() => {
                    setCurrentTool('laser');
                    sound.playLaserSound();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    currentTool === 'laser'
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 scale-105'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🔴</span>
                  <span>Laser Pointer</span>
                </button>

                {/* 6. Bubble Wrap */}
                <button
                  onClick={() => setIsBubbleWrapOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <span>🫧</span>
                  <span>Bubble Wrap</span>
                </button>
              </div>

              {/* Sound & Mute Toggle */}
              <button
                onClick={() => {
                  const next = !isMuted;
                  setIsMuted(next);
                  sound.setMuted(next);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isMuted ? 'Unmute audio' : 'Mute audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 8. Custom Boxing Glove / Sapu Cursor Overlay */}
      <ScreenCursorOverlay
        currentTool={currentTool}
        mousePos={mousePos}
        isMouseDown={isMouseDown}
        punchPower={punchPower}
        paintColor={paintColor}
      />

      {/* 9. Focus Coach Settings Drawer */}
      {isFocusPanelOpen && (
        <div className="fixed top-14 right-4 bottom-24 w-80 md:w-96 z-50 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-y-auto p-5 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Focus Accountability
              </h2>
            </div>
            <button
              onClick={() => setIsFocusPanelOpen(false)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <FocusCoach
            onEmergencyClean={handleCleanAll}
            personality={coachPersonality}
            onSelectPersonality={setCoachPersonality}
          />

          {/* Desk Cat Customizer */}
          <div className="mt-5 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-2.5">Desk Cat Fur Coat</h4>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(
                [
                  ['orange_tabby', '🐱 Ginger'],
                  ['calico', '🐾 Calico'],
                  ['tuxedo', '🎩 Tuxedo'],
                  ['void_black', '🐈‍⬛ Void'],
                  ['snow_white', '🤍 Snow'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setCatBreed(id);
                    sound.playCatMeow(true);
                  }}
                  className={`p-2 rounded-xl border text-center font-semibold transition-all ${
                    catBreed === id
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. Bubble Wrap Modal */}
      <BubbleWrapModal
        isOpen={isBubbleWrapOpen}
        onClose={() => setIsBubbleWrapOpen(false)}
      />

      {/* 11. Desktop Companion Modal (Stream / PiP / Kotlin Multiplatform) */}
      <DesktopCompanionModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        onStartScreenShare={handleStartScreenShare}
        isScreenSharing={!!screenStream}
        onStopScreenShare={handleStopScreenShare}
        onLaunchPip={() => {}}
        isPipActive={false}
      />
    </div>
  );
}
