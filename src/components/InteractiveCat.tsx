import React, { useState, useEffect, useRef } from 'react';
import { CatBreed, CatState } from '../types';
import { sound } from '../utils/audio';
import { Heart, Sparkles, Move, Moon } from 'lucide-react';

interface InteractiveCatProps {
  laserPos: { x: number; y: number } | null;
  onCatPurr?: () => void;
  selectedBreed?: CatBreed;
}

const CAT_QUIPS = [
  "Meow. Did that YouTube video finish your work? 🐾",
  "Pet me 3 times, then write 10 lines of code.",
  "Purrrrr... nice pet! Now back to your task.",
  "I am inspecting your focus level. Currently: 42%.",
  "Napping is my job. Working is yours! 😸",
  "Don't click that gaming tab... I am watching! 😼",
  "A happy cat brings 100% focus power!",
  "Meowww~ you can do this!",
];

export const InteractiveCat: React.FC<InteractiveCatProps> = ({
  laserPos,
  selectedBreed = 'orange_tabby',
}) => {
  const [pos, setPos] = useState({ x: 120, y: window.innerHeight - 200 });
  const [state, setState] = useState<CatState>('loaf');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [petCount, setPetCount] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [thought, setThought] = useState<string>("Meow! I'm your desktop focus buddy 🐾");
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Laser chasing AI behavior
  useEffect(() => {
    if (!laserPos) {
      if (state === 'pounce' || state === 'stalk') {
        setState('loaf');
      }
      return;
    }

    const dx = laserPos.x - (pos.x + 40);
    const dy = laserPos.y - (pos.y + 40);
    const dist = Math.hypot(dx, dy);

    setFacing(dx > 0 ? 'right' : 'left');

    if (dist > 80) {
      setState('stalk');
      const step = Math.min(dist * 0.15, 14);
      setPos((prev) => ({
        x: Math.max(20, Math.min(window.innerWidth - 120, prev.x + (dx / dist) * step)),
        y: Math.max(50, Math.min(window.innerHeight - 150, prev.y + (dy / dist) * step)),
      }));
    } else if (dist <= 80 && dist > 20) {
      setState('pounce');
      sound.playCatMeow(true);
    }
  }, [laserPos, pos.x, pos.y, state]);

  // Periodic random idle behavior & quips
  useEffect(() => {
    const timer = setInterval(() => {
      if (laserPos || isDragging) return;

      const rand = Math.random();
      if (rand < 0.3) {
        setState('sleep');
      } else if (rand < 0.6) {
        setState('loaf');
      } else if (rand < 0.8) {
        setState('groom');
      }

      if (Math.random() < 0.35) {
        const quip = CAT_QUIPS[Math.floor(Math.random() * CAT_QUIPS.length)];
        setThought(quip);
      }
    }, 12000);

    return () => clearInterval(timer);
  }, [laserPos, isDragging]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 120, e.clientX - dragOffset.current.x)),
        y: Math.max(40, Math.min(window.innerHeight - 120, e.clientY - dragOffset.current.y)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle Petting
  const handlePet = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playCatPurr();
    sound.playCatMeow(true);
    setState('purr');

    const newPetCount = petCount + 1;
    setPetCount(newPetCount);

    // Spawn heart particles
    const heartId = Date.now() + Math.random();
    setHearts((prev) => [...prev, { id: heartId, x: 20 + Math.random() * 40, y: -10 }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1400);

    if (newPetCount % 3 === 0) {
      setThought("Purrrrrr! 💖 That's 3 pets! Now 15 minutes of solid focus!");
    } else {
      setThought(["Purrrrr...", "Mew! 🥰", "So soft...", "Aww yiss!"][newPetCount % 4]);
    }
  };

  const breedColors = {
    orange_tabby: {
      body: 'bg-amber-400',
      stripe: 'bg-amber-600',
      innerEar: 'bg-rose-300',
      eyes: 'bg-emerald-400',
      accent: 'border-amber-500',
    },
    calico: {
      body: 'bg-amber-100',
      stripe: 'bg-stone-800',
      innerEar: 'bg-rose-300',
      eyes: 'bg-amber-500',
      accent: 'border-amber-400',
    },
    tuxedo: {
      body: 'bg-slate-900',
      stripe: 'bg-slate-100',
      innerEar: 'bg-rose-300',
      eyes: 'bg-yellow-300',
      accent: 'border-slate-800',
    },
    void_black: {
      body: 'bg-zinc-900',
      stripe: 'bg-zinc-800',
      innerEar: 'bg-zinc-700',
      eyes: 'bg-yellow-400',
      accent: 'border-zinc-700',
    },
    snow_white: {
      body: 'bg-slate-100',
      stripe: 'bg-sky-100',
      innerEar: 'bg-rose-200',
      eyes: 'bg-sky-400',
      accent: 'border-slate-200',
    },
  }[selectedBreed];

  return (
    <div
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
      className="absolute top-0 left-0 z-40 select-none cursor-pointer"
      onMouseDown={handleMouseDown}
      onClick={handlePet}
    >
      {/* Floating Hearts when petted */}
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
          className="absolute pointer-events-none animate-float text-rose-400 flex items-center gap-1 text-xs font-semibold"
        >
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
        </div>
      ))}

      {/* Thought Bubble */}
      {thought && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-amber-400/30 text-slate-100 text-xs shadow-xl pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-center font-medium leading-tight">{thought}</p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-amber-400/30 rotate-45" />
        </div>
      )}

      {/* Interactive Cat Mascot Body */}
      <div
        className={`relative w-24 h-20 transition-transform duration-200 ${
          facing === 'left' ? 'scale-x-[-1]' : ''
        } ${state === 'purr' ? 'animate-purr' : ''}`}
      >
        {/* Cat Ears */}
        <div className="absolute -top-3 left-3 w-5 h-6 bg-amber-500 rotate-[-20deg] rounded-tl-lg clip-triangle shadow-sm overflow-hidden flex items-center justify-center">
          <div className="w-2.5 h-4 bg-rose-300 rounded-sm" />
        </div>
        <div className="absolute -top-3 right-5 w-5 h-6 bg-amber-500 rotate-[20deg] rounded-tr-lg clip-triangle shadow-sm overflow-hidden flex items-center justify-center">
          <div className="w-2.5 h-4 bg-rose-300 rounded-sm" />
        </div>

        {/* Cat Body (Chubby Loaf) */}
        <div
          className={`w-24 h-16 rounded-3xl ${breedColors.body} shadow-lg border-2 ${breedColors.accent} relative flex items-center justify-center overflow-hidden transition-all duration-300`}
        >
          {/* Subtle Tabby Pattern Stripes */}
          {selectedBreed === 'orange_tabby' && (
            <>
              <div className="absolute top-1 left-7 w-2 h-4 bg-amber-600/60 rounded-full" />
              <div className="absolute top-1 left-11 w-2 h-5 bg-amber-600/60 rounded-full" />
              <div className="absolute top-1 left-15 w-2 h-4 bg-amber-600/60 rounded-full" />
            </>
          )}

          {/* Tuxedo White Chest */}
          {selectedBreed === 'tuxedo' && (
            <div className="absolute bottom-0 left-6 w-10 h-9 bg-slate-100 rounded-t-full" />
          )}

          {/* Face Elements */}
          <div className="absolute top-3 right-3 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex items-center gap-3">
              {state === 'sleep' ? (
                <>
                  <span className="text-xs text-slate-800 font-bold">^</span>
                  <span className="text-xs text-slate-800 font-bold">^</span>
                </>
              ) : (
                <>
                  <div className={`w-2.5 h-3 ${breedColors.eyes} rounded-full border border-black/40 relative flex items-center justify-center`}>
                    <div className="w-1 h-1.5 bg-black rounded-full" />
                    <div className="absolute top-0.5 right-0.5 w-0.8 h-0.8 bg-white rounded-full" />
                  </div>
                  <div className={`w-2.5 h-3 ${breedColors.eyes} rounded-full border border-black/40 relative flex items-center justify-center`}>
                    <div className="w-1 h-1.5 bg-black rounded-full" />
                    <div className="absolute top-0.5 right-0.5 w-0.8 h-0.8 bg-white rounded-full" />
                  </div>
                </>
              )}
            </div>

            {/* Nose & Mouth */}
            <div className="w-1.5 h-1 bg-rose-400 rounded-full mt-1" />
            <div className="text-[10px] leading-none text-slate-700 -mt-0.5 font-mono">3</div>
          </div>

          {/* Paws */}
          <div className="absolute -bottom-1 left-5 w-4 h-3 bg-amber-200 rounded-full border border-amber-600/30" />
          <div className="absolute -bottom-1 left-11 w-4 h-3 bg-amber-200 rounded-full border border-amber-600/30" />

          {/* Sleep Indicator */}
          {state === 'sleep' && (
            <div className="absolute -top-4 right-1 flex items-center gap-1 text-sky-400 font-mono text-xs animate-float">
              <Moon className="w-3 h-3" />
              <span>zZz</span>
            </div>
          )}
        </div>

        {/* Tail */}
        <div className="absolute bottom-1 -left-4 w-6 h-3 bg-amber-500 rounded-full rotate-[-25deg] origin-right animate-pulse" />
      </div>

      {/* Floating Mini Action Bar on Hover */}
      <div className="opacity-0 hover:opacity-100 transition-opacity absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-full text-[10px] text-slate-300 border border-slate-700 whitespace-nowrap">
        <Move className="w-2.5 h-2.5" />
        <span>Drag me · Click to pet ({petCount})</span>
      </div>
    </div>
  );
};
