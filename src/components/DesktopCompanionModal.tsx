import React, { useState } from 'react';
import { 
  X, 
  Monitor, 
  Tv, 
  Copy, 
  Check, 
  Terminal, 
  Layers, 
  ExternalLink,
  Laptop,
  Sparkles,
  ArrowRight,
  Cat,
  Zap
} from 'lucide-react';

interface DesktopCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScreenShare: () => void;
  isScreenSharing: boolean;
  onStopScreenShare: () => void;
  onLaunchPip: () => void;
  isPipActive: boolean;
}

export const DesktopCompanionModal: React.FC<DesktopCompanionModalProps> = ({
  isOpen,
  onClose,
  onStartScreenShare,
  isScreenSharing,
  onStopScreenShare,
  onLaunchPip,
  isPipActive,
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'pip' | 'kmp'>('stream');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const kmpRunCommand = `./gradlew :composeApp:run`;
  const kmpPackageMac = `./gradlew :composeApp:packageDmg`;
  const kmpPackageWin = `./gradlew :composeApp:packageMsi`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Desktop Screen Overlay & Companion
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                  Live Options
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Play, punch, and focus over your real desktop apps, tabs, and windows.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 p-2 bg-slate-950/40 border-b border-slate-800 gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stream')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'stream'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>1. Stream Real Screen</span>
          </button>
          <button
            onClick={() => setActiveTab('pip')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'pip'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Always-on-Top PiP</span>
          </button>
          <button
            onClick={() => setActiveTab('kmp')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all ${
              activeTab === 'kmp'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Kotlin Multiplatform</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: Stream Real Desktop Screen */}
          {activeTab === 'stream' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-200 space-y-1">
                  <p className="font-semibold text-white">Instant Real-Desktop Overlay in 1 Click</p>
                  <p className="leading-relaxed text-indigo-300">
                    Select your entire monitor, IDE, or browser window. Your live screen will stream in real-time under the punch fractures, sapu broom, water drips, and cat companion!
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 border border-slate-700">
                    <Monitor className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      Live Screen Mirror
                      {isScreenSharing && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          Streaming Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      {isScreenSharing
                        ? 'Your screen is live underneath. Punch, spray, or mop over it!'
                        : 'Capture entire screen, VS Code, or YouTube window.'}
                    </p>
                  </div>
                </div>

                {isScreenSharing ? (
                  <button
                    onClick={() => {
                      onStopScreenShare();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30"
                  >
                    Stop Screen Stream
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onStartScreenShare();
                      onClose();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                  >
                    <Tv className="w-4 h-4" />
                    Start Screen Stream
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <span>👊</span> Punch Live Tabs
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Shatter screen glass directly over YouTube or games whenever you feel distracted.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <span>🧹</span> Sapu & Clean
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Use the mop or squeegee to wipe away cracks and reset your focus back to work.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Always-on-Top PiP Widget */}
          {activeTab === 'pip' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                <Layers className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                <div className="text-xs text-amber-200 space-y-1">
                  <p className="font-semibold text-white">OS Always-On-Top Floating Widget (Document PiP)</p>
                  <p className="leading-relaxed text-amber-300/90">
                    Pops out a native operating system floating window. It stays on top of all your applications (VS Code, games, Discord, Chrome) even when you change tabs or switch apps!
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <Cat className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Floating Focus & Cat Widget</div>
                    <p className="text-xs text-slate-400">
                      Loaf cat, coach reminders, bubble wrap, and punch button on top of your desktop.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onLaunchPip();
                    onClose();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" />
                  {isPipActive ? 'Re-focus Floating Widget' : 'Pop Out Floating Widget'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">💡 Supported Browsers:</p>
                <p className="text-[11px]">
                  Chrome, Edge, Brave (v116+) fully support the native Document Picture-in-Picture API. You can resize and drag the floating companion anywhere on your monitors.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Kotlin Multiplatform (KMP) Desktop Codebase */}
          {activeTab === 'kmp' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
                <Terminal className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <div className="text-xs text-purple-200 space-y-1">
                  <p className="font-semibold text-white">Native Kotlin Multiplatform (Compose Desktop)</p>
                  <p className="leading-relaxed text-purple-300/90">
                    We generated the complete Kotlin Multiplatform source code in your workspace directory at <code className="text-white font-mono bg-purple-900/60 px-1 py-0.5 rounded">/desktop-kmp/</code> with transparent window overlay (<code className="text-white font-mono bg-purple-900/60 px-1 py-0.5 rounded">Window(undecorated = true, transparent = true, alwaysOnTop = true)</code>).
                  </p>
                </div>
              </div>

              {/* Code Snippet 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Run Desktop App Locally</span>
                  <button
                    onClick={() => copyToClipboard(kmpRunCommand, 'run')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedCode === 'run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'run' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                  cd desktop-kmp && {kmpRunCommand}
                </pre>
              </div>

              {/* Code Snippet 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Package Native Installers (.dmg / .msi)</span>
                  <button
                    onClick={() => copyToClipboard(`${kmpPackageMac}\n${kmpPackageWin}`, 'pkg')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedCode === 'pkg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode === 'pkg' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto space-y-1">
                  <div><span className="text-slate-500"># macOS DMG:</span></div>
                  <div className="text-purple-400">{kmpPackageMac}</div>
                  <div><span className="text-slate-500"># Windows MSI / EXE:</span></div>
                  <div className="text-indigo-400">{kmpPackageWin}</div>
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-200">📂 Project Structure in this Workspace:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400 font-mono">
                  <li>desktop-kmp/settings.gradle.kts</li>
                  <li>desktop-kmp/composeApp/build.gradle.kts</li>
                  <li>desktop-kmp/composeApp/src/desktopMain/kotlin/Main.kt (Transparent Overlay Window)</li>
                  <li>desktop-kmp/README.md</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Choose either Web Stream, Floating PiP, or Native KMP.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
