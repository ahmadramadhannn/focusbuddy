import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ToolType, 
  GlassCrack, 
  Droplet, 
  WipeTrail, 
  ScreenSticker, 
  WallpaperTheme, 
  CatBreed,
  CoachPersonality 
} from './types';
import { sound } from './utils/audio';
import { ScreenCanvas } from './components/ScreenCanvas';
import { InteractiveCat } from './components/InteractiveCat';
import { FocusCoach } from './components/FocusCoach';
import { ToyToolbar } from './components/ToyToolbar';
import { VirtualDesktop } from './components/VirtualDesktop';
import { BubbleWrapModal } from './components/BubbleWrapModal';
import { DesktopCompanionModal } from './components/DesktopCompanionModal';
import { CompactCompanionView } from './components/CompactCompanionView';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Zap,
  Laptop,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function App() {
  // View mode: 'compact_companion' (default side-by-side widget) vs 'full_desk' (full screen sandbox)
  const [viewMode, setViewMode] = useState<'compact_companion' | 'full_desk'>('compact_companion');

  // Tool state
  const [currentTool, setCurrentTool] = useState<ToolType>('punch');
  const [paintColor, setPaintColor] = useState<string>('#ef4444');
  const [punchPower, setPunchPower] = useState<number>(2);
  const [activeStickerText, setActiveStickerText] = useState<string>('NO YOUTUBE!');

  // Screen effect state
  const [cracks, setCracks] = useState<GlassCrack[]>([]);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [wipeTrails, setWipeTrails] = useState<WipeTrail[]>([]);
  const [stickers, setStickers] = useState<ScreenSticker[]>([]);
  const [shockwaves, setShockwaves] = useState<
    { x: number; y: number; radius: number; maxRadius: number; opacity: number }[]
  >([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Laser Pointer Position
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Cat & Coach Settings
  const [catBreed, setCatBreed] = useState<CatBreed>('orange_tabby');
  const [coachPersonality, setCoachPersonality] = useState<CoachPersonality>('boss');
  const [isFocusPanelOpen, setIsFocusPanelOpen] = useState(false);
  const [isBubbleWrapOpen, setIsBubbleWrapOpen] = useState(false);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  // Live Screen Sharing State
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isPipActive, setIsPipActive] = useState(false);
  const pipWindowRef = useRef<Window | null>(null);

  // Desktop & Audio Settings
  const [wallpaper, setWallpaper] = useState<WallpaperTheme>('cozy_desk');
  const [isMuted, setIsMuted] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'lofi' | 'brown_noise'>('off');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mouse drag state for continuous wiping / spraying
  const [isMouseDown, setIsMouseDown] = useState(false);
  const lastMousePos = useRef<{ x: number; y: number } | null>(null);

  // Generated wallpaper URLs
  const cozyWallpaperUrl = '/src/assets/images/desktop_cozy_1790555602390.jpg';
  const natureWallpaperUrl = '/src/assets/images/desktop_nature_1790555612571.jpg';

  // Request browser desktop notification permissions for anti-distraction alerts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Screen Share Handler (Capture real desktop or window)
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

        // Switch to full desk so they can see their live screen underneath
        setViewMode('full_desk');

        // Listen for user stopping stream via browser UI
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
        };
      }
    } catch (err) {
      console.warn('Screen share canceled or not supported:', err);
    }
  };

  const handleStopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
  };

  // Document Picture-in-Picture (Always-on-Top OS mini desktop widget)
  const handleLaunchPip = async () => {
    try {
      // @ts-ignore - Document Picture-in-Picture API
      if ('documentPictureInPicture' in window) {
        // @ts-ignore
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 360,
          height: 520,
        });
        pipWindowRef.current = pipWindow;
        setIsPipActive(true);

        // Copy styles to PiP window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch (e) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = styleSheet.type;
            link.media = styleSheet.media.toString();
            link.href = styleSheet.href || '';
            pipWindow.document.head.appendChild(link);
          }
        });

        // Render PiP Widget Container
        const container = pipWindow.document.createElement('div');
        container.id = 'pip-root';
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.background = '#090d16';
        pipWindow.document.body.style.fontFamily = 'Inter, sans-serif';
        pipWindow.document.body.appendChild(container);

        container.innerHTML = `
          <div style="padding: 14px; color: white; display: flex; flex-direction: column; gap: 10px; height: 100vh; box-sizing: border-box; justify-content: space-between;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
              <div style="font-weight: 800; font-size: 13px; color: #818cf8; display: flex; align-items: center; gap: 6px;">
                <span>🎯</span> Desk Companion
              </div>
              <div style="font-size: 9px; background: #059669; color: white; padding: 2px 6px; border-radius: 9999px; font-weight: bold;">
                ALWAYS ON TOP
              </div>
            </div>

            <!-- Mascot & Quote -->
            <div style="background: rgba(30, 41, 59, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 10px; text-align: center;">
              <div style="font-size: 36px; margin-bottom: 2px;">🐱</div>
              <div style="font-size: 12px; font-weight: 700; color: #f1f5f9;">Desk Loaf Cat</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;" id="pip-quote">
                "Keep working! Stop switching tabs! 🐾"
              </div>
            </div>

            <!-- Mini Punch Screen Target inside PiP -->
            <div id="pip-punch-target" style="height: 100px; background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%); border: 2px solid #475569; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: crosshair; font-size: 11px; color: #94a3b8; font-weight: 600; text-align: center; padding: 6px;">
              👊 Click this box to Punch Glass!
            </div>

            <!-- Quick Action Triggers -->
            <div style="display: flex; gap: 6px;">
              <button id="pip-punch-btn" style="flex: 1; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 10px; font-weight: bold; font-size: 11px; cursor: pointer;">
                👊 Punch
              </button>
              <button id="pip-clean-btn" style="flex: 1; background: #10b981; color: white; border: none; padding: 8px; border-radius: 10px; font-weight: bold; font-size: 11px; cursor: pointer;">
                🧹 Sapu / Clean
              </button>
              <button id="pip-bubble-btn" style="flex: 1; background: #6366f1; color: white; border: none; padding: 8px; border-radius: 10px; font-weight: bold; font-size: 11px; cursor: pointer;">
                🫧 Bubbles
              </button>
            </div>

            <div style="font-size: 9px; color: #64748b; text-align: center;">
              Floats alongside VS Code, Chrome, YouTube & Games
            </div>
          </div>
        `;

        // Bind interactive events in the PiP native OS window
        const punchBtn = pipWindow.document.getElementById('pip-punch-btn');
        const cleanBtn = pipWindow.document.getElementById('pip-clean-btn');
        const bubbleBtn = pipWindow.document.getElementById('pip-bubble-btn');
        const punchTarget = pipWindow.document.getElementById('pip-punch-target');

        let pipCracks = 0;
        const triggerPipPunch = () => {
          pipCracks++;
          sound.playPunch(0.6);
          sound.playGlassCrack();
          if (punchTarget) {
            punchTarget.style.borderColor = '#ef4444';
            punchTarget.style.transform = 'scale(0.97)';
            punchTarget.innerHTML = `💥 Glass Fractured! (${pipCracks} cracks)<br><span style="font-size: 9px; color: #cbd5e1;">Click to shatter more</span>`;
            setTimeout(() => {
              if (punchTarget) punchTarget.style.transform = 'scale(1)';
            }, 100);
          }
        };

        if (punchBtn) punchBtn.onclick = triggerPipPunch;
        if (punchTarget) punchTarget.onclick = triggerPipPunch;

        if (cleanBtn) {
          cleanBtn.onclick = () => {
            pipCracks = 0;
            sound.playMopSwish();
            if (punchTarget) {
              punchTarget.style.borderColor = '#475569';
              punchTarget.innerHTML = `✨ Monitor Cleaned!<br><span style="font-size: 9px; color: #94a3b8;">Click to Punch Glass</span>`;
            }
          };
        }
        if (bubbleBtn) {
          bubbleBtn.onclick = () => {
            setIsBubbleWrapOpen(true);
          };
        }

        pipWindow.addEventListener('pagehide', () => {
          setIsPipActive(false);
          pipWindowRef.current = null;
        });
      } else {
        // Fallback info modal
        setIsDesktopModalOpen(true);
      }
    } catch (err) {
      console.warn('PiP error:', err);
      setIsDesktopModalOpen(true);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Sound Mute Toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Ambient Sound Toggle
  const handleSelectAmbient = (type: 'off' | 'rain' | 'lofi' | 'brown_noise') => {
    setAmbientSound(type);
    sound.setAmbient(type);
  };

  // Clean Screen
  const handleCleanAll = () => {
    sound.playMopSwish();
    setCracks([]);
    setDroplets([]);
    setWipeTrails([]);
    setStickers([]);
  };

  // Trigger Screen Shake
  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 360);
  };

  // Physics animation loop for dripping water/paint and expanding shockwaves
  useEffect(() => {
    let animId: number;
    const updatePhysics = () => {
      // 1. Update Droplet Drips
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

      // 2. Update Shockwave Rings
      setShockwaves((prev) =>
        prev
          .map((sw) => ({
            ...sw,
            radius: sw.radius + 6,
            opacity: sw.opacity - 0.04,
          }))
          .filter((sw) => sw.opacity > 0 && sw.radius < sw.maxRadius)
      );

      // 3. Fade out Wipe Trails
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

  // Erase effects within a radius (used by Mop and Squeegee)
  const eraseInRadius = useCallback((x: number, y: number, radius: number) => {
    setCracks((prev) => prev.filter((c) => Math.hypot(c.x - x, c.y - y) > radius + c.radius * 0.5));
    setDroplets((prev) => prev.filter((d) => Math.hypot(d.x - x, d.y - y) > radius + d.radius));
    setStickers((prev) => prev.filter((s) => Math.hypot(s.x - x, s.y - y) > radius + 30));
  }, []);

  // Helper to generate realistic glass crack geometry
  const createCrack = (x: number, y: number, power: number): GlassCrack => {
    const radius = 35 + power * 35 + Math.random() * 25;
    const branchesCount = 5 + power * 2;
    const rings = 2 + power;
    const holeRadius = power === 3 ? 16 : power === 2 ? 8 : 4;

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

    // Shards
    const shardsCount = 3 + power * 2;
    const shards = [];
    for (let s = 0; s < shardsCount; s++) {
      const shardAngle = Math.random() * Math.PI * 2;
      const shardDist = Math.random() * (radius * 0.4);
      const shardSize = 8 + Math.random() * 12;
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
        color: 'rgba(230, 245, 255, 0.45)',
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

  // Handle Tool Click / Interaction
  const handleInteraction = (x: number, y: number) => {
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

        // Shockwave
        setShockwaves((prev) => [
          ...prev,
          { x, y, radius: 10, maxRadius: 100 * punchPower, opacity: 0.9 },
        ]);
        break;
      }

      case 'mop': {
        sound.playMopSwish();
        const brushRadius = 75;
        setWipeTrails((prev) => [...prev, { x, y, radius: brushRadius }]);
        eraseInRadius(x, y, brushRadius);
        break;
      }

      case 'squeegee': {
        sound.playSqueegeeSqueak();
        const brushRadius = 55;
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
            color: 'rgba(180, 225, 255, 0.7)',
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

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsMouseDown(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    handleInteraction(e.clientX, e.clientY);
  };

  // Canvas Mouse Move (Drag cleaning or laser moving)
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
        handleInteraction(e.clientX, e.clientY);
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsMouseDown(false);
  };

  // If in Compact Companion mode (Default side-by-side mode)
  if (viewMode === 'compact_companion') {
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col">
        <CompactCompanionView
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          punchPower={punchPower}
          onSelectPunchPower={setPunchPower}
          paintColor={paintColor}
          onSelectPaintColor={setPaintColor}
          onCleanAll={handleCleanAll}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          catBreed={catBreed}
          onSelectCatBreed={setCatBreed}
          coachPersonality={coachPersonality}
          onSelectCoachPersonality={setCoachPersonality}
          onExpandToFull={() => setViewMode('full_desk')}
          onLaunchPip={handleLaunchPip}
          isPipActive={isPipActive}
          onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
          onOpenBubbleWrap={() => setIsBubbleWrapOpen(true)}
        />

        {/* Bubble Wrap Popper Modal */}
        <BubbleWrapModal
          isOpen={isBubbleWrapOpen}
          onClose={() => setIsBubbleWrapOpen(false)}
        />

        {/* Desktop Companion & Kotlin Multiplatform Modal */}
        <DesktopCompanionModal
          isOpen={isDesktopModalOpen}
          onClose={() => setIsDesktopModalOpen(false)}
          onStartScreenShare={handleStartScreenShare}
          isScreenSharing={!!screenStream}
          onStopScreenShare={handleStopScreenShare}
          onLaunchPip={handleLaunchPip}
          isPipActive={isPipActive}
        />
      </div>
    );
  }

  // Full Screen Sandbox Mode
  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${
        isScreenShaking ? 'animate-screen-shake' : ''
      }`}
      style={{
        cursor:
          currentTool === 'punch'
            ? 'crosshair'
            : currentTool === 'mop' || currentTool === 'squeegee'
            ? 'cell'
            : currentTool === 'laser'
            ? 'none'
            : 'default',
      }}
    >
      {/* 1. Virtual Desktop OS Background & Live Real Screen Mirror */}
      <VirtualDesktop
        wallpaper={wallpaper}
        onChangeWallpaper={setWallpaper}
        cozyWallpaperUrl={cozyWallpaperUrl}
        natureWallpaperUrl={natureWallpaperUrl}
        onOpenFocusHub={() => setIsFocusPanelOpen(true)}
        onOpenDesktopModal={() => setIsDesktopModalOpen(true)}
        screenStream={screenStream}
        isScreenSharing={!!screenStream}
        onStartScreenShare={handleStartScreenShare}
        onStopScreenShare={handleStopScreenShare}
      />

      {/* Mode Switcher Button (Top Right Floating) */}
      <div className="absolute top-12 left-4 z-40">
        <button
          onClick={() => setViewMode('compact_companion')}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 text-xs font-semibold shadow-xl flex items-center gap-1.5 transition-all"
        >
          <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Switch to Side Companion Widget</span>
        </button>
      </div>

      {/* 2. Interactive Screen Physics Canvas (Cracks, Paint, Water, Laser) */}
      <ScreenCanvas
        cracks={cracks}
        droplets={droplets}
        wipeTrails={wipeTrails}
        stickers={stickers}
        laserPos={currentTool === 'laser' ? laserPos : null}
        shockwaves={shockwaves}
        onCanvasMouseDown={handleCanvasMouseDown}
        onCanvasMouseMove={handleCanvasMouseMove}
        onCanvasMouseUp={handleCanvasMouseUp}
      />

      {/* 3. Screen Stickers Layer */}
      {stickers.map((st) => (
        <div
          key={st.id}
          style={{
            transform: `translate3d(${st.x}px, ${st.y}px, 0) rotate(${st.rotation}deg)`,
          }}
          className="absolute z-35 px-3 py-1.5 rounded-lg bg-amber-400 text-amber-950 font-display font-extrabold text-xs shadow-2xl border-2 border-amber-300 pointer-events-none select-none flex items-center gap-1.5 animate-in zoom-in-75"
        >
          <span className="text-sm">{st.emoji}</span>
          <span>{st.text}</span>
        </div>
      ))}

      {/* 4. Interactive Desktop Cat Companion */}
      <InteractiveCat
        laserPos={currentTool === 'laser' ? laserPos : null}
        selectedBreed={catBreed}
      />

      {/* 5. Bottom Toy Dock */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <ToyToolbar
          currentTool={currentTool}
          onSelectTool={(t) => {
            setCurrentTool(t);
            if (t === 'bubble_wrap') setIsBubbleWrapOpen(true);
          }}
          paintColor={paintColor}
          onSelectPaintColor={setPaintColor}
          punchPower={punchPower}
          onSelectPunchPower={setPunchPower}
          onCleanAll={handleCleanAll}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          ambientSound={ambientSound}
          onSelectAmbient={handleSelectAmbient}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          activeStickerText={activeStickerText}
          onSelectStickerText={setActiveStickerText}
        />
      </div>

      {/* 6. Focus Coach Drawer / Side Panel */}
      {isFocusPanelOpen && (
        <div className="fixed top-12 right-4 bottom-24 w-80 md:w-96 z-50 flex flex-col custom-glass-panel border border-slate-700/80 rounded-2xl shadow-2xl overflow-y-auto p-4 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Focus Control Center
              </h2>
            </div>
            <button
              onClick={() => setIsFocusPanelOpen(false)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <FocusCoach
            onEmergencyClean={handleCleanAll}
            personality={coachPersonality}
            onSelectPersonality={setCoachPersonality}
          />

          {/* Desktop Mode Shortcuts */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Live Overlay Options</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleLaunchPip}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition-colors text-left flex flex-col gap-1"
              >
                <span className="font-bold flex items-center gap-1">
                  <span>📌</span> Always-on-Top PiP
                </span>
                <span className="text-[10px] text-amber-400/80">Float over all OS apps</span>
              </button>
              <button
                onClick={() => {
                  setIsDesktopModalOpen(true);
                  setIsFocusPanelOpen(false);
                }}
                className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-medium transition-colors text-left flex flex-col gap-1"
              >
                <span className="font-bold flex items-center gap-1">
                  <span>💻</span> Kotlin Desktop
                </span>
                <span className="text-[10px] text-purple-400/80">Source in /desktop-kmp</span>
              </button>
            </div>
          </div>

          {/* Cat Customizer in Focus Panel */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Desk Cat Fur Coat</h4>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
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
                  className={`p-1.5 rounded-lg border text-center font-medium transition-all ${
                    catBreed === id
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. Bubble Wrap Popper Modal */}
      <BubbleWrapModal
        isOpen={isBubbleWrapOpen}
        onClose={() => setIsBubbleWrapOpen(false)}
      />

      {/* 8. Desktop Companion & Kotlin Multiplatform Modal */}
      <DesktopCompanionModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        onStartScreenShare={handleStartScreenShare}
        isScreenSharing={!!screenStream}
        onStopScreenShare={handleStopScreenShare}
        onLaunchPip={handleLaunchPip}
        isPipActive={isPipActive}
      />
    </div>
  );
}
