import React, { useState, useRef, useEffect } from 'react';
import { 
  ToolType, 
  GlassCrack, 
  Droplet, 
  WipeTrail, 
  CatBreed, 
  CoachPersonality 
} from '../types';
import { sound } from '../utils/audio';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Laptop,
  Tv,
  CheckCircle2,
  Clock,
  Zap,
  Cat,
  Flame,
  Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CompactCompanionViewProps {
  currentTool: ToolType;
  onSelectTool: (t: ToolType) => void;
  punchPower: number;
  onSelectPunchPower: (p: number) => void;
  paintColor: string;
  onSelectPaintColor: (c: string) => void;
  onCleanAll: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  catBreed: CatBreed;
  onSelectCatBreed: (b: CatBreed) => void;
  coachPersonality: CoachPersonality;
  onSelectCoachPersonality: (p: CoachPersonality) => void;
  onExpandToFull: () => void;
  onLaunchPip: () => void;
  isPipActive: boolean;
  onOpenDesktopModal: () => void;
  onOpenBubbleWrap: () => void;
}

export const CompactCompanionView: React.FC<CompactCompanionViewProps> = ({
  currentTool,
  onSelectTool,
  punchPower,
  onSelectPunchPower,
  paintColor,
  onSelectPaintColor,
  onCleanAll,
  isMuted,
  onToggleMute,
  catBreed,
  onSelectCatBreed,
  coachPersonality,
  onSelectCoachPersonality,
  onExpandToFull,
  onLaunchPip,
  isPipActive,
  onOpenDesktopModal,
  onOpenBubbleWrap,
}) => {
  // Mini Screen Target State
  const [miniCracks, setMiniCracks] = useState<GlassCrack[]>([]);
  const [miniDroplets, setMiniDroplets] = useState<Droplet[]>([]);
  const [miniShake, setMiniShake] = useState(false);
  const [punchCount, setPunchCount] = useState(0);
  const [catHappiness, setCatHappiness] = useState(90);
  const [catThought, setCatThought] = useState("I'm watching your screen! Work hard! 🐾");
  const [coachQuote, setCoachQuote] = useState("Stay in this tab and ship that code!");
  const [laserPos, setLaserPos] = useState<{ x: number; y: number } | null>(null);

  // Quick 1-Min Focus Sprint Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Coach periodic check-ins
  useEffect(() => {
    const quotes = {
      boss: [
        "Did YouTube write that spreadsheet? Back to work!",
        "I'm keeping an eye on your mouse clicks! Keep going!",
        "Every tab you close is a step closer to shipping.",
        "Smash this glass if stressed, then complete the task!",
      ],
      sensei: [
        "Take one deep breath. Return your focus to this moment.",
        "A single task completed is worth ten started and abandoned.",
        "Do not fight distraction; simply let it pass and write.",
      ],
      alarm: [
        "⏰ DEADLINE INCOMING! NO SLACKING OFF!",
        "🚨 STOP HOVERING OVER OTHER TABS! CODE NOW!",
        "⚡ DOPAMINE FROM SHIPPING > DOPAMINE FROM SCROLLING!",
      ],
      duck: [
        "Quack! Tell me what function you're writing right now!",
        "Rubber duck says: explain your bug out loud!",
        "Quack! Don't open Reddit, tell me the problem!",
      ],
      cat: [
        "Purrrr... If you finish your task, I will let you pet me! 🐾",
        "Meow! Humans who finish work early buy better treats.",
        "zZz... I'm sleeping right here, don't wake me with video games!",
      ],
    };

    const interval = setInterval(() => {
      const activeQuotes = quotes[coachPersonality] || quotes.boss;
      const nextQuote = activeQuotes[Math.floor(Math.random() * activeQuotes.length)];
      setCoachQuote(nextQuote);
    }, 25000);

    return () => clearInterval(interval);
  }, [coachPersonality]);

  // Pomodoro countdown
  useEffect(() => {
    let t: any;
    if (isTimerRunning && timerSeconds > 0) {
      t = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sound.playFocusGong();
      confetti({ particleCount: 50, spread: 60 });
      setCoachQuote("🎉 Focus sprint finished! Take a quick 5-min punch break!");
    }
    return () => clearInterval(t);
  }, [isTimerRunning, timerSeconds]);

  // Mini canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Cracks
    miniCracks.forEach((crack) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(crack.x, crack.y, crack.holeRadius || 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      // Spiderweb rays
      crack.branches.forEach((b) => {
        const endX = crack.x + Math.cos(b.angle) * b.length;
        const endY = crack.y + Math.sin(b.angle) * b.length;

        // Glow line
        ctx.beginPath();
        ctx.moveTo(crack.x, crack.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Sharp crack line
        ctx.beginPath();
        ctx.moveTo(crack.x, crack.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Sub branches
        b.subBranches?.forEach((sb) => {
          const startRatio = 0.4;
          const sX = crack.x + Math.cos(b.angle) * (b.length * startRatio);
          const sY = crack.y + Math.sin(b.angle) * (b.length * startRatio);
          const eX = sX + Math.cos(sb.angle) * sb.length;
          const eY = sY + Math.sin(sb.angle) * sb.length;

          ctx.beginPath();
          ctx.moveTo(sX, sY);
          ctx.lineTo(eX, eY);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });

      // Rings
      for (let r = 1; r <= crack.rings; r++) {
        ctx.beginPath();
        ctx.arc(crack.x, crack.y, r * 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw Droplets
    miniDroplets.forEach((drop) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fillStyle = drop.color;
      ctx.fill();

      if (drop.dripLength > 0) {
        ctx.beginPath();
        ctx.moveTo(drop.x - drop.radius * 0.4, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.dripLength);
        ctx.lineTo(drop.x + drop.radius * 0.4, drop.y);
        ctx.fillStyle = drop.color;
        ctx.fill();
      }
      ctx.restore();
    });

    // Laser pointer
    if (laserPos) {
      ctx.beginPath();
      ctx.arc(laserPos.x, laserPos.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(laserPos.x, laserPos.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    }
  }, [miniCracks, miniDroplets, laserPos]);

  // Mini canvas interaction
  const handleMiniCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'punch') {
      if (punchPower === 3) sound.playGlassShatter();
      else {
        sound.playPunch(punchPower === 2 ? 1.0 : 0.6);
        sound.playGlassCrack();
      }
      setMiniShake(true);
      setTimeout(() => setMiniShake(false), 300);
      setPunchCount((c) => c + 1);

      // Add crack
      const radius = 25 + punchPower * 20;
      const count = 5 + punchPower * 2;
      const branches = Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + (Math.random() * 0.4 - 0.2),
        length: radius * (0.6 + Math.random() * 0.5),
        subBranches: [
          { angle: (i / count) * Math.PI * 2 + 0.3, length: radius * 0.3 },
          { angle: (i / count) * Math.PI * 2 - 0.3, length: radius * 0.25 },
        ],
      }));

      setMiniCracks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          x,
          y,
          radius,
          severity: punchPower,
          rings: 2 + punchPower,
          branches,
          holeRadius: punchPower === 3 ? 12 : 6,
          shatteredShards: [],
          createdAt: Date.now(),
        },
      ]);
    } else if (currentTool === 'mop' || currentTool === 'squeegee') {
      sound.playMopSwish();
      setMiniCracks((prev) => prev.filter((c) => Math.hypot(c.x - x, c.y - y) > 45));
      setMiniDroplets((prev) => prev.filter((d) => Math.hypot(d.x - x, d.y - y) > 45));
    } else if (currentTool === 'water') {
      sound.playWaterDrip();
      setMiniDroplets((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          x,
          y,
          radius: 4 + Math.random() * 5,
          color: 'rgba(180, 225, 255, 0.7)',
          type: 'water',
          dripLength: 10 + Math.random() * 25,
          maxDripLength: 40,
          speed: 1,
          opacity: 0.8,
        },
      ]);
    } else if (currentTool === 'paint') {
      sound.playPaintSplat();
      setMiniDroplets((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          x,
          y,
          radius: 8 + Math.random() * 8,
          color: paintColor,
          type: 'paint',
          dripLength: 8 + Math.random() * 20,
          maxDripLength: 35,
          speed: 1,
          opacity: 0.95,
        },
      ]);
    } else if (currentTool === 'laser') {
      setLaserPos({ x, y });
    }
  };

  const handlePetCat = () => {
    sound.playCatPurr();
    sound.playCatMeow(true);
    setCatHappiness((h) => Math.min(100, h + 10));
    setCatThought("❤️ *Purrrrrr* Thank you! Now let's crush your work goals!");
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { x: 0.8, y: 0.85 },
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 md:p-6 bg-slate-950/90 text-slate-100 select-none overflow-y-auto">
      {/* Sleek Floating Companion Card */}
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl animate-in zoom-in-95 duration-200">
        
        {/* Top Mini Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-sm font-bold">
              🎯
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                DeskToy Companion
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-semibold border border-indigo-500/30">
                  Side Widget
                </span>
              </h2>
              <p className="text-[10px] text-slate-400">Keep next to your work tab</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pop out always on top */}
            <button
              onClick={onLaunchPip}
              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
              title="Float as native Always-on-Top OS widget over all apps"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">Float PiP</span>
            </button>

            {/* Mute audio */}
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Expand to Full Sandbox */}
            <button
              onClick={onExpandToFull}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand to Fullscreen Screen Sandbox"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Focus Coach Live Message Banner */}
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 flex items-start gap-2.5">
          <div className="text-base mt-0.5">
            {coachPersonality === 'boss' ? '👔' : coachPersonality === 'sensei' ? '🍵' : coachPersonality === 'alarm' ? '⏰' : '🦆'}
          </div>
          <div className="flex-1 text-[11px] leading-snug">
            <span className="font-bold text-indigo-300 mr-1.5">
              {coachPersonality === 'boss' ? 'Boss Bob:' : coachPersonality === 'sensei' ? 'Sensei:' : coachPersonality === 'alarm' ? 'Alarm:' : 'Rubber Duck:'}
            </span>
            <span className="text-slate-200">{coachQuote}</span>
          </div>
        </div>

        {/* Center Interactive Punchable Screen Box */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <span>👊</span> Punch Target (Click to Shatter / Clean)
            </span>
            <span className="text-[10px] text-indigo-400 font-mono">
              Shatters: {miniCracks.length} | Power: {punchPower === 1 ? 'Low' : punchPower === 2 ? 'Med' : 'MAX'}
            </span>
          </div>

          <div
            className={`relative w-full h-44 rounded-2xl border-2 border-slate-700/80 bg-slate-950 overflow-hidden shadow-inner cursor-crosshair transition-transform ${
              miniShake ? 'scale-98 rotate-1' : ''
            }`}
            style={{
              backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #090d16 100%)',
            }}
          >
            {/* Fake Desktop Screen Details in the Box */}
            <div className="absolute inset-0 p-3 pointer-events-none opacity-40 flex flex-col justify-between font-mono text-[9px] text-slate-400">
              <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                <span>● IDE: DeepWorkSession.ts</span>
                <span className="text-emerald-400">● 100% Flow</span>
              </div>
              <div className="space-y-1 text-slate-500">
                <div>function finishProject() &#123;</div>
                <div className="pl-3 text-indigo-400">const urge = resistDistraction();</div>
                <div className="pl-3 text-emerald-400">return deployCode();</div>
                <div>&#125;</div>
              </div>
              <div className="text-center text-[10px] text-slate-600 font-sans">
                {miniCracks.length === 0 ? '👈 Tap / Click here to Punch Glass' : '🧹 Select Sapu / Mop to clean'}
              </div>
            </div>

            {/* Canvas for Cracks & Droplets */}
            <canvas
              ref={canvasRef}
              width={380}
              height={176}
              onClick={handleMiniCanvasClick}
              className="absolute inset-0 w-full h-full z-10"
            />
          </div>

          {/* Quick Tool Selector Bar */}
          <div className="flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            {/* Punch */}
            <button
              onClick={() => {
                onSelectTool('punch');
                sound.playPunch(0.5);
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentTool === 'punch'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>👊</span>
              <span>Punch</span>
            </button>

            {/* Cycle Power */}
            <button
              onClick={() => onSelectPunchPower(punchPower >= 3 ? 1 : punchPower + 1)}
              className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-400 border border-slate-700 transition-colors"
              title="Cycle Punch Force (Light / Heavy / Sledge)"
            >
              {punchPower === 1 ? '⚡ 1x' : punchPower === 2 ? '⚡ 2x' : '💥 MAX'}
            </button>

            {/* Mop / Sapu */}
            <button
              onClick={() => {
                onSelectTool('mop');
                sound.playMopSwish();
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                currentTool === 'mop'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🧹</span>
              <span>Sapu</span>
            </button>

            {/* Water Gun */}
            <button
              onClick={() => onSelectTool('water')}
              className={`p-1.5 rounded-xl text-xs transition-all ${
                currentTool === 'water'
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Water Gun"
            >
              🔫
            </button>

            {/* Paint */}
            <button
              onClick={() => onSelectTool('paint')}
              className={`p-1.5 rounded-xl text-xs transition-all ${
                currentTool === 'paint'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Paint Splatter"
            >
              🎨
            </button>

            {/* Reset / Clean All */}
            <button
              onClick={() => {
                sound.playMopSwish();
                setMiniCracks([]);
                setMiniDroplets([]);
                onCleanAll();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
              title="Emergency Clean All"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Loaf Cat Area */}
          <div
            onClick={handlePetCat}
            className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                {catBreed === 'orange_tabby' ? '🐱' : catBreed === 'void_black' ? '🐈‍⬛' : catBreed === 'snow_white' ? '🤍' : '🐾'}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Desk Loaf Cat</span>
                  <span className="text-[10px] text-emerald-400 font-mono">({catHappiness}% Happy)</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-200 transition-colors">
                  {catThought}
                </div>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-indigo-400 group-hover:text-indigo-300 bg-indigo-950/50 px-2 py-1 rounded-lg border border-indigo-900/40">
              Pet Me!
            </span>
          </div>

          {/* Focus Sprint Timer & Bubble Wrap Row */}
          <div className="grid grid-cols-2 gap-2">
            {/* Pomodoro Timer */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Deep Focus Sprint</div>
                <div className="text-sm font-mono font-bold text-indigo-300">
                  {formatTime(timerSeconds)}
                </div>
              </div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
            </div>

            {/* Bubble Wrap Popper Trigger */}
            <button
              onClick={onOpenBubbleWrap}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between group transition-all"
            >
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Fidget Popper</div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  🫧 Bubble Wrap
                </div>
              </div>
              <span className="text-xs">👉</span>
            </button>
          </div>
        </div>

        {/* Bottom Footer Action Hub */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={onOpenDesktopModal}
            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>KMP & Real Screen Overlay</span>
          </button>

          <button
            onClick={onExpandToFull}
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white font-medium"
          >
            <span>Full Sandbox</span>
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
