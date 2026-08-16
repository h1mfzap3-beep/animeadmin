import React, { useState } from 'react';
import { 
  Tv, 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Radio, 
  Zap, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExtensionMockupProps {
  onQuickTrackDemo?: (title: string, episode: number, source: string) => void;
}

export const ExtensionMockup: React.FC<ExtensionMockupProps> = ({ onQuickTrackDemo }) => {
  const [activeTab, setActiveTab] = useState<'magyaranime' | 'onianime'>('magyaranime');
  const [magyarAnimeEp, setMagyarAnimeEp] = useState(18);
  const [oniAnimeEp, setOniAnimeEp] = useState(9);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Épp most szinkronizálva');

  const handleIncrement = (type: 'magyaranime' | 'onianime') => {
    setIsSyncing(true);
    if (type === 'magyaranime') {
      const next = magyarAnimeEp + 1;
      setMagyarAnimeEp(next);
      if (onQuickTrackDemo) onQuickTrackDemo('Solo Leveling: Arise', next, 'MagyarAnime');
    } else {
      const next = oniAnimeEp + 1;
      setOniAnimeEp(next);
      if (onQuickTrackDemo) onQuickTrackDemo('Jujutsu Kaisen Season 3', next, 'OniAnime');
    }

    try {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncText('Felhőbe mentve ✓');
    }, 600);
  };

  return (
    <div className="relative mx-auto w-full max-w-[360px] rounded-2xl p-[1px] bg-gradient-to-b from-cyan-500/40 via-purple-500/20 to-transparent shadow-2xl shadow-cyan-500/10">
      {/* Decorative cyber corners */}
      <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
      <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-purple-400"></div>
      <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-purple-400"></div>

      <div className="w-full rounded-2xl bg-[#0b0c16] p-4 text-slate-200 border border-white/10 font-sans">
        {/* Browser extension top bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xs">
              🌙
            </div>
            <div>
              <div className="font-display font-bold text-xs tracking-wide text-white flex items-center gap-1.5">
                <span>Luna Tracker</span>
                <span className="text-[10px] text-cyan-400 font-mono">v1.0.0</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Online</span>
          </div>
        </div>

        {/* Source Switcher simulation */}
        <div className="flex rounded-lg bg-black/40 p-1 mb-3 border border-white/5 text-xs">
          <button
            onClick={() => setActiveTab('magyaranime')}
            className={`flex-1 py-1 px-2 rounded-md font-medium transition-all ${
              activeTab === 'magyaranime'
                ? 'bg-cyan-500 text-black font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MagyarAnime.hu
          </button>
          <button
            onClick={() => setActiveTab('onianime')}
            className={`flex-1 py-1 px-2 rounded-md font-medium transition-all ${
              activeTab === 'onianime'
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OniAnime.hu
          </button>
        </div>

        {/* Active streaming detection card */}
        <div className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-cyan-500/30 p-3.5 mb-3 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>AKTÍV LEJÁTSZÓ DETEKTÁLVA</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">HTML5 Stream</span>
          </div>

          {activeTab === 'magyaranime' ? (
            <div>
              <div className="font-semibold text-sm text-white mb-1">
                Solo Leveling S2: Arise
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mb-3">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                  MagyarAnime
                </span>
                <span>• Magyar felirattal</span>
              </div>

              <div className="flex items-center justify-between bg-black/50 rounded-lg p-2 border border-white/5">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Jelenlegi Rész
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-400 flex items-baseline gap-1">
                    <span>{magyarAnimeEp}</span>
                    <span className="text-xs text-slate-500 font-normal">/ 24</span>
                  </div>
                </div>

                <button
                  onClick={() => handleIncrement('magyaranime')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+1 Rész</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-semibold text-sm text-white mb-1">
                Jujutsu Kaisen Season 3
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mb-3">
                <span className="px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
                  OniAnime
                </span>
                <span>• 1080p HD Stream</span>
              </div>

              <div className="flex items-center justify-between bg-black/50 rounded-lg p-2 border border-white/5">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Jelenlegi Rész
                  </div>
                  <div className="text-lg font-bold font-mono text-purple-400 flex items-baseline gap-1">
                    <span>{oniAnimeEp}</span>
                    <span className="text-xs text-slate-500 font-normal">/ 24</span>
                  </div>
                </div>

                <button
                  onClick={() => handleIncrement('onianime')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>+1 Rész</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sync status footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-1">
            {isSyncing ? (
              <>
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                <span className="text-cyan-400 font-mono">Firestore szinkron...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-slate-400">{lastSyncText}</span>
              </>
            )}
          </div>
          <span className="font-mono text-[10px] text-slate-500">Firebase Live</span>
        </div>
      </div>
    </div>
  );
};
