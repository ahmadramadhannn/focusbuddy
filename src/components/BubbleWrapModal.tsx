import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { RotateCcw, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BubbleWrapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BubbleWrapModal: React.FC<BubbleWrapModalProps> = ({ isOpen, onClose }) => {
  const TOTAL_BUBBLES = 48;
  const [popped, setPopped] = useState<boolean[]>(new Array(TOTAL_BUBBLES).fill(false));
  const [popScore, setPopScore] = useState(0);

  if (!isOpen) return null;

  const handlePop = (index: number) => {
    if (popped[index]) return;
    const next = [...popped];
    next[index] = true;
    setPopped(next);
    setPopScore((s) => s + 1);
    sound.playBubblePop();

    // If all popped, celebrate!
    if (next.every((p) => p)) {
      sound.playFocusGong();
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.5 } });
    }
  };

  const handleReset = () => {
    setPopped(new Array(TOTAL_BUBBLES).fill(false));
    sound.playWhistle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl custom-glass-panel border border-slate-700 p-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🫧</span>
            <div>
              <h2 className="text-sm font-bold text-white">Infinite Bubble Wrap Pop Sheet</h2>
              <p className="text-xs text-slate-400">Pop bubbles to release stress & sharpen your focus</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bubble Grid */}
        <div className="grid grid-cols-8 gap-2.5 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4">
          {popped.map((isPopped, idx) => (
            <button
              key={idx}
              onClick={() => handlePop(idx)}
              className={`w-10 h-10 rounded-full transition-all duration-150 relative flex items-center justify-center select-none ${
                isPopped
                  ? 'bg-slate-900 border border-slate-800 scale-90 opacity-40 shadow-inner'
                  : 'bg-gradient-to-br from-emerald-400/40 via-teal-500/30 to-cyan-500/20 border-2 border-emerald-400/60 shadow-md hover:scale-105 active:scale-95'
              }`}
            >
              {!isPopped && (
                <div className="w-2.5 h-2.5 rounded-full bg-white/70 absolute top-1 left-1.5 pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Popped: <strong className="text-emerald-400 font-mono text-sm">{popped.filter(Boolean).length}</strong> / {TOTAL_BUBBLES}</span>
          <span>Total Satisfying Pops: <strong className="text-indigo-400 font-mono text-sm">{popScore}</strong></span>
        </div>
      </div>
    </div>
  );
};
