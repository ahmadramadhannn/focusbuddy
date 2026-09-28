import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CatBreed, CatState } from '../types';
import { sound } from '../utils/audio';
import { Heart, Sparkles, Move, Moon, Music } from 'lucide-react';

interface InteractiveCatProps {
  laserPos: { x: number; y: number } | null;
  onCatPurr?: () => void;
  onPet?: (petCount: number) => void;
  selectedBreed?: CatBreed;
  externalPetTrigger?: number;
}

const CAT_QUIPS = [
  "Meow. Did that YouTube video finish your work? 🐾",
  "Pet me 3 times, then write 10 lines of code.",
  "Purrrrr... nice pet! Now back to your task.",
  "I am inspecting your focus level. Currently: 100% flow.",
  "Napping is my job. Working is yours! 😸",
  "Don't click that gaming tab... I am watching! 😼",
  "A happy cat brings 100% focus power!",
  "Meowww~ you can do this!",
];

const POSITIVE_PET_RESPONSES = [
  "Purrrrrrr! 💖 That feels amazing!",
  "Mew! 🥰 Focus power restored +10!",
  "Purrrrr... Good human! Now ship that code! ✨",
  "Aww yiss, chin scritches! 🐾",
  "Purrrrrr~ Stress eliminated! 💆",
  "Mew mew! Ready for 25 minutes of deep work! 🚀",
];

export const InteractiveCat: React.FC<InteractiveCatProps> = ({
  laserPos,
  onCatPurr,
  onPet,
  selectedBreed = 'orange_tabby',
  externalPetTrigger,
}) => {
  const [pos, setPos] = useState({ x: 120, y: window.innerHeight - 200 });
  const [state, setState] = useState<CatState>('loaf');
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [petCount, setPetCount] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; icon: 'heart' | 'sparkle' | 'music' }[]>([]);
  const [purrWaves, setPurrWaves] = useState<{ id: number }[]>([]);
  const [thought, setThought] = useState<string>("Meow! Click me to pet me 🐾");
  const [isDragging, setIsDragging] = useState(false);
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const purrTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dedicated 'pet' function: triggers purr animation, sound, and positive feedback
  const pet = useCallback(() => {
    // 1. Play positive feedback sound: comforting purr rumble + uplifting major chord chime
    sound.playCatPetPositiveFeedback();
    setState('purr');

    // Reset back to loaf after purring duration
    if (purrTimeoutRef.current) clearTimeout(purrTimeoutRef.current);
    purrTimeoutRef.current = setTimeout(() => {
      setState('loaf');
    }, 1800);

    const newPetCount = petCount + 1;
    setPetCount(newPetCount);
    onCatPurr?.();
    onPet?.(newPetCount);

    // 2. Spawn expanding purr vibration ring
    const waveId = Date.now();
    setPurrWaves((prev) => [...prev, { id: waveId }]);
    setTimeout(() => {
      setPurrWaves((prev) => prev.filter((w) => w.id !== waveId));
    }, 1200);

    // 3. Spawn floating heart, sparkle, and music note particles
    const particleTypes: ('heart' | 'sparkle' | 'music')[] = ['heart', 'sparkle', 'music'];
    const newParticles = [0, 1, 2].map((i) => ({
      id: Date.now() + i + Math.random(),
      x: 15 + Math.random() * 65,
      y: -5 - i * 8,
      icon: particleTypes[i % particleTypes.length],
    }));

    setHearts((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newParticles.some((np) => np.id === h.id)));
    }, 1500);

    // 4. Update thought bubble with uplifting positive reinforcement
    const response = POSITIVE_PET_RESPONSES[newPetCount % POSITIVE_PET_RESPONSES.length];
    setThought(response);
  }, [petCount, onCatPurr, onPet]);

  // Handle external pet triggers (e.g. from bottom toolbar)
  useEffect(() => {
    if (externalPetTrigger && externalPetTrigger > 0) {
      pet();
    }
  }, [externalPetTrigger]);

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

  // Periodic random idle behavior & quips when not being petted
  useEffect(() => {
    const timer = setInterval(() => {
      if (laserPos || isDragging || state === 'purr') return;

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
  }, [laserPos, isDragging, state]);

  // Handle Drag & Click differentiation
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const movedDist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (movedDist > 5) {
        hasMovedRef.current = true;
      }
      setPos({
        x: Math.max(10, Math.min(window.innerWidth - 120, e.clientX - dragOffset.current.x)),
        y: Math.max(40, Math.min(window.innerHeight - 120, e.clientY - dragOffset.current.y)),
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // If user simply clicked without significant drag, trigger pet!
        if (!hasMovedRef.current) {
          pet();
        }
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, pet]);

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

  const isPurring = state === 'purr';

  return (
    <div
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
      }}
      className="absolute top-0 left-0 z-40 select-none cursor-pointer group"
      onMouseDown={handleMouseDown}
      title="Click to pet cat 🐾 (Purr + Positive Focus Boost)"
    >
      {/* Purr Sound Wave Rings Expanding */}
      {purrWaves.map((w) => (
        <div
          key={w.id}
          className="absolute inset-0 -m-3 rounded-full border-2 border-rose-400/50 pointer-events-none animate-purr-ring"
        />
      ))}

      {/* Floating Hearts, Sparkles & Notes when petted */}
      {hearts.map((h) => (
        <div
          key={h.id}
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
          className="absolute pointer-events-none animate-heart-rise flex items-center gap-1 text-xs font-bold"
        >
          {h.icon === 'heart' && (
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500 filter drop-shadow-md animate-pulse" />
          )}
          {h.icon === 'sparkle' && (
            <Sparkles className="w-4 h-4 fill-amber-300 text-amber-400 filter drop-shadow-md" />
          )}
          {h.icon === 'music' && (
            <Music className="w-4 h-4 text-sky-400 filter drop-shadow-md" />
          )}
        </div>
      ))}

      {/* Thought Bubble */}
      {thought && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-60 p-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-amber-400/40 text-slate-100 text-xs shadow-2xl pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <p className="text-center font-medium leading-tight">{thought}</p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-amber-400/40 rotate-45" />
        </div>
      )}

      {/* Interactive Cat Mascot Body */}
      <div
        className={`relative w-24 h-20 transition-transform duration-200 ${
          facing === 'left' ? 'scale-x-[-1]' : ''
        } ${isPurring ? 'animate-purr-pulse' : ''}`}
      >
        {/* Cat Ears */}
        <div className={`absolute -top-3 left-3 w-5 h-6 bg-amber-500 rotate-[-20deg] rounded-tl-lg clip-triangle shadow-sm overflow-hidden flex items-center justify-center transition-transform ${isPurring ? 'rotate-[-25deg]' : ''}`}>
          <div className="w-2.5 h-4 bg-rose-300 rounded-sm" />
        </div>
        <div className={`absolute -top-3 right-5 w-5 h-6 bg-amber-500 rotate-[20deg] rounded-tr-lg clip-triangle shadow-sm overflow-hidden flex items-center justify-center transition-transform ${isPurring ? 'rotate-[25deg]' : ''}`}>
          <div className="w-2.5 h-4 bg-rose-300 rounded-sm" />
        </div>

        {/* Cat Body (Chubby Loaf) */}
        <div
          className={`w-24 h-16 rounded-3xl ${breedColors.body} shadow-xl border-2 ${breedColors.accent} relative flex items-center justify-center overflow-hidden transition-all duration-300 ${
            isPurring ? 'ring-4 ring-rose-400/50 shadow-rose-500/30' : ''
          }`}
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

          {/* Blushing Cheeks when purring */}
          {isPurring && (
            <>
              <div className="absolute top-6 right-8 w-3 h-2 bg-rose-400/80 rounded-full blur-[0.5px] animate-pulse" />
              <div className="absolute top-6 right-2 w-3 h-2 bg-rose-400/80 rounded-full blur-[0.5px] animate-pulse" />
            </>
          )}

          {/* Face Elements */}
          <div className="absolute top-3 right-3 flex flex-col items-center">
            {/* Eyes */}
            <div className="flex items-center gap-3">
              {isPurring ? (
                // Happy curved purring eyes ^  ^
                <>
                  <span className="text-sm text-slate-800 font-extrabold leading-none -mt-1 select-none">^</span>
                  <span className="text-sm text-slate-800 font-extrabold leading-none -mt-1 select-none">^</span>
                </>
              ) : state === 'sleep' ? (
                <>
                  <span className="text-xs text-slate-800 font-bold leading-none -mt-0.5">_</span>
                  <span className="text-xs text-slate-800 font-bold leading-none -mt-0.5">_</span>
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
            <div className="text-[10px] leading-none text-slate-700 -mt-0.5 font-mono select-none">3</div>
          </div>

          {/* Paws */}
          <div className="absolute -bottom-1 left-5 w-4 h-3 bg-amber-200 rounded-full border border-amber-600/30" />
          <div className="absolute -bottom-1 left-11 w-4 h-3 bg-amber-200 rounded-full border border-amber-600/30" />

          {/* Sleep Indicator */}
          {state === 'sleep' && !isPurring && (
            <div className="absolute -top-4 right-1 flex items-center gap-1 text-sky-400 font-mono text-xs animate-float">
              <Moon className="w-3 h-3" />
              <span>zZz</span>
            </div>
          )}

          {/* Purring Indicator */}
          {isPurring && (
            <div className="absolute -top-5 right-0 flex items-center gap-0.5 text-rose-400 font-bold text-[10px] bg-slate-900/90 px-1.5 py-0.5 rounded-full border border-rose-400/40">
              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span>purr~</span>
            </div>
          )}
        </div>

        {/* Tail (Wags happily when purring) */}
        <div
          className={`absolute bottom-1 -left-4 w-6 h-3 bg-amber-500 rounded-full origin-right transition-transform ${
            isPurring
              ? 'animate-bounce rotate-[-40deg]'
              : 'rotate-[-25deg] animate-pulse'
          }`}
        />
      </div>

      {/* Floating Mini Action Bar on Hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-rose-300 border border-rose-500/30 whitespace-nowrap shadow-lg">
        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" />
        <span>Click to pet cat ({petCount})</span>
      </div>
    </div>
  );
};
