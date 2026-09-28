import React, { useState, useEffect, useCallback } from 'react';
import { CoachPersonality } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Briefcase, 
  Sparkles, 
  Flame, 
  Volume2, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Play, 
  Pause,
  AlertTriangle,
  X,
  Target,
  Smile
} from 'lucide-react';

interface FocusCoachProps {
  onEmergencyClean: () => void;
  personality: CoachPersonality;
  onSelectPersonality: (p: CoachPersonality) => void;
}

const COACH_QUOTES: Record<CoachPersonality, string[]> = {
  boss: [
    "Did YouTube approve your pull request?! Back to work! 👔",
    "I don't pay in video game scores, Jenkins! Ship that feature!",
    "That deadline is breathing heavily on your neck right now.",
    "Alt+Tab won't save you from quarterly review! Focus!",
    "One more YouTube search and you're doing weekend spreadsheets.",
    "Good! You punched the screen, now punch through your task backlog!",
  ],
  sensei: [
    "Notice the urge to browse. Breathe in peace, exhale distraction. 🍵",
    "A single focused hour is worth ten hours of divided attention.",
    "The river flows steadily without checking notifications. Flow with it.",
    "Return gently to your craft. Mastery lives in the present moment.",
    "Clean the screen, calm the mind, begin the next task.",
  ],
  alarm: [
    "⏰ TICK TOCK! DOPAMINE IS CHEAP, SHIPPING IS PRICELESS!",
    "⚡ 10 MINUTES SPRINT STARTS NOW! NO CLICKING AWAY!",
    "🚨 YOUTUBE IS A TRAP! STEP AWAY FROM THE SEARCH BAR!",
    "🔥 PUSH THE CODE! WIN THE DAY! LET'S GO!",
  ],
  duck: [
    "Quack! 🦆 Tell me: what specific problem are you solving right now?",
    "Quack! Don't switch tabs, explain the logic to me instead!",
    "Quack! Break the task into 3 tiny steps. What is step 1?",
    "Quack! Even senior engineers get distracted. Refocus!",
  ],
  cat: [
    "Meow! Humans who finish tasks buy the best cat treats. 🐾",
    "Purrr... pet me once, then write that document.",
    "If you finish your work early, we can play with the laser longer!",
  ],
};

export const FocusCoach: React.FC<FocusCoachProps> = ({
  onEmergencyClean,
  personality,
  onSelectPersonality,
}) => {
  // Focus Timer States
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 min default
  const [isRunning, setIsRunning] = useState(false);
  const [breakLength] = useState(5 * 60); // 5 min break
  const [focusLength] = useState(25 * 60);

  // Focus Goals / Todo items
  const [goals, setGoals] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Finish primary task without switching to YouTube', done: false },
  ]);
  const [newGoalText, setNewGoalText] = useState('');

  // Coach Quote state
  const [currentQuote, setCurrentQuote] = useState(COACH_QUOTES[personality][0]);
  const [isNagging, setIsNagging] = useState(false);
  const [tabSwitchAlert, setTabSwitchAlert] = useState<string | null>(null);

  // Switch quotes periodically or on interaction
  const triggerNewQuote = useCallback(() => {
    const list = COACH_QUOTES[personality];
    const quote = list[Math.floor(Math.random() * list.length)];
    setCurrentQuote(quote);
    setIsNagging(true);
    setTimeout(() => setIsNagging(false), 8000);
  }, [personality]);

  // Tab switch anti-distraction monitor!
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left tab!
      } else {
        // User came back!
        sound.playWhistle();
        const alerts = [
          "👀 Caught you switching tabs! Welcome back, let's get into flow!",
          "🚨 Tab switcher detected! Boss Bob saw that. Refocus!",
          "🌿 Welcome back! Breathe, let go of the other tabs, and continue.",
        ];
        const chosen = alerts[Math.floor(Math.random() * alerts.length)];
        setTabSwitchAlert(chosen);
        triggerNewQuote();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerNewQuote]);

  // Timer Tick
  useEffect(() => {
    let interval: number | null = null;
    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (timerMode === 'focus') {
        sound.playFocusGong();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setTimerMode('break');
        setTimeLeft(breakLength);
        setCurrentQuote("🎉 Focus sprint complete! Take a 5-min screen punch & cat break!");
      } else {
        sound.playWhistle();
        setTimerMode('focus');
        setTimeLeft(focusLength);
        setCurrentQuote("⚡ Break over! Time to get back to work and crush it!");
        onEmergencyClean();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, timerMode, breakLength, focusLength, onEmergencyClean]);

  const toggleTimer = () => {
    if (!isRunning) {
      sound.playFocusGong();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMode === 'focus' ? focusLength : breakLength);
  };

  const start1MinStressBreak = () => {
    setIsRunning(true);
    setTimerMode('break');
    setTimeLeft(60); // 1 min quick smash break
    sound.playPunch(1.0);
    setCurrentQuote("🥊 60-Second Rage Break active! Punch the screen, pop bubbles, pet cat!");
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    setGoals((prev) => [...prev, { id: Date.now().toString(), text: newGoalText.trim(), done: false }]);
    setNewGoalText('');
  };

  const toggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const updated = !g.done;
          if (updated) {
            sound.playFocusGong();
            confetti({ particleCount: 40, spread: 60 });
          }
          return { ...g, done: updated };
        }
        return g;
      })
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tab Switch Alert Banner */}
      {tabSwitchAlert && (
        <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="font-medium">{tabSwitchAlert}</p>
          </div>
          <button
            onClick={() => setTabSwitchAlert(null)}
            className="p-1 hover:bg-amber-500/30 rounded-md transition-colors text-amber-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Focus Coach Card */}
      <div className="p-4 rounded-2xl custom-glass-panel border border-slate-700/60 shadow-2xl relative overflow-hidden">
        {/* Header with Personality Switcher */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
              {personality === 'boss' && <Briefcase className="w-4 h-4" />}
              {personality === 'sensei' && <Sparkles className="w-4 h-4" />}
              {personality === 'alarm' && <Flame className="w-4 h-4" />}
              {personality === 'duck' && <Smile className="w-4 h-4" />}
              {personality === 'cat' && <Smile className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                Focus Accountability Buddy
              </h3>
              <p className="text-[11px] text-slate-400">
                {personality === 'boss' && 'Boss Bob (Strict & Sarcastic)'}
                {personality === 'sensei' && 'Zen Flow Sensei (Gentle & Mindful)'}
                {personality === 'alarm' && 'Raging Alarm Clock (High Energy)'}
                {personality === 'duck' && 'Rubber Duck (Logic Assistant)'}
                {personality === 'cat' && 'Neko Coach (Cute & Demanding)'}
              </p>
            </div>
          </div>

          {/* Personality Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {(['boss', 'sensei', 'alarm', 'duck'] as CoachPersonality[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  onSelectPersonality(p);
                  sound.playWhistle();
                }}
                className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                  personality === p
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {p === 'boss' ? '👔 Boss' : p === 'sensei' ? '🍵 Zen' : p === 'alarm' ? '⏰ Alarm' : '🦆 Duck'}
              </button>
            ))}
          </div>
        </div>

        {/* Coach Live Dialogue Bubble */}
        <div 
          onClick={triggerNewQuote}
          className="p-3 mb-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 cursor-pointer hover:border-indigo-500/60 transition-all group relative"
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-950 border border-indigo-400/40 flex items-center justify-center text-xl shadow-inner">
                {personality === 'boss' ? '👔' : personality === 'sensei' ? '🧘‍♂️' : personality === 'alarm' ? '⏰' : '🦆'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-indigo-200 leading-relaxed group-hover:text-indigo-100 transition-colors">
                "{currentQuote}"
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">Click coach for fresh motivation</span>
            </div>
          </div>
        </div>

        {/* Pomodoro & Stress Timer Section */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${timerMode === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'} ${isRunning ? 'animate-pulse' : ''}`} />
              <span className="font-semibold text-slate-200">
                {timerMode === 'focus' ? 'Deep Work Sprint' : 'Fidget & Play Break'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={start1MinStressBreak}
                className="px-2 py-0.5 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[10px] font-medium transition-colors"
                title="1-Minute Quick Rage & Punch Break"
              >
                ⚡ 1m Punch Break
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-mono font-bold tracking-tight text-slate-100 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTimer}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-md ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button
                onClick={resetTimer}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Task Tracker / "What I'm supposed to be doing" */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              Current Work Commitment
            </span>
            <span className="text-[11px] text-slate-400">
              {goals.filter((g) => g.done).length}/{goals.length} done
            </span>
          </div>

          {/* Goal List */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-all ${
                  goal.done
                    ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 line-through'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    goal.done ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{goal.text}</span>
              </div>
            ))}
          </div>

          {/* Add Goal Input */}
          <form onSubmit={handleAddGoal} className="flex items-center gap-1.5 mt-2">
            <input
              type="text"
              placeholder="Add task to stay accountable..."
              value={newGoalText}
              onChange={(e) => setNewGoalText(e.target.value)}
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
              title="Add task"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Emergency Refocus Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Stressed / Screen cluttered?</span>
          <button
            onClick={() => {
              onEmergencyClean();
              sound.playFocusGong();
              sound.playWhistle();
              setCurrentQuote("✨ Screen wiped spotless! Full focus activated!");
            }}
            className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Emergency Refocus & Clean</span>
          </button>
        </div>
      </div>
    </div>
  );
};
