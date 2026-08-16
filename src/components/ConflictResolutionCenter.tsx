import React, { useState, useEffect } from 'react';
import { AnimeTrack, ConflictItem, ConflictLogEntry, ConflictStrategy } from '../types';
import { 
  getActiveConflictStrategy, 
  setActiveConflictStrategy, 
  getConflictLogs, 
  clearConflictLogs, 
  getPendingConflicts, 
  savePendingConflicts,
  applyAutoConflictStrategy
} from '../services/conflictService';
import { updateAnimeTrack } from '../services/firestoreService';
import { 
  ShieldAlert, 
  Sliders, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  Trash2, 
  Sparkles, 
  Layers, 
  Cpu, 
  Clock, 
  Tv,
  HelpCircle
} from 'lucide-react';

interface ConflictResolutionCenterProps {
  tracks: AnimeTrack[];
  onTrackUpdated?: () => void;
}

export const ConflictResolutionCenter: React.FC<ConflictResolutionCenterProps> = ({
  tracks,
  onTrackUpdated
}) => {
  const [strategy, setStrategy] = useState<ConflictStrategy>('highest_episode');
  const [pendingConflicts, setPendingConflicts] = useState<ConflictItem[]>([]);
  const [logs, setLogs] = useState<ConflictLogEntry[]>([]);

  useEffect(() => {
    setStrategy(getActiveConflictStrategy());
    setPendingConflicts(getPendingConflicts());
    setLogs(getConflictLogs());
  }, []);

  const handleStrategyChange = (newStrategy: ConflictStrategy) => {
    setStrategy(newStrategy);
    setActiveConflictStrategy(newStrategy);
  };

  const handleResolveManual = async (
    conflict: ConflictItem,
    choice: 'keep_current' | 'use_incoming' | 'highest_ep'
  ) => {
    if (conflict.trackId) {
      if (choice === 'use_incoming') {
        await updateAnimeTrack(conflict.trackId, {
          ...conflict.incomingTrack,
          updatedAt: new Date().toISOString()
        });
      } else if (choice === 'highest_ep') {
        const highest = Math.max(
          conflict.currentTrack.episode || 1,
          conflict.incomingTrack.episode || 1
        );
        await updateAnimeTrack(conflict.trackId, {
          episode: highest,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Remove from pending
    const remaining = pendingConflicts.filter((c) => c.id !== conflict.id);
    setPendingConflicts(remaining);
    savePendingConflicts(remaining);
    if (onTrackUpdated) onTrackUpdated();
  };

  const handleClearLogs = () => {
    if (confirm('Biztosan törölni szeretnéd a konfliktus napló előzményeit?')) {
      clearConflictLogs();
      setLogs([]);
    }
  };

  const strategyDescriptions: Record<ConflictStrategy, { title: string; desc: string; icon: string }> = {
    highest_episode: {
      title: 'Legmagasabb Epizódszám Győz (Ajánlott)',
      desc: 'Ha a Tampermonkey, AniList, MAL vagy a felhő eltérő részt mutat, automatikusan a legtovább nézett epizódszám kerül mentésre.',
      icon: '📈'
    },
    newest_timestamp: {
      title: 'Legfrissebb Időpont Győz',
      desc: 'Mindig az a verzió érvényesül, amely a legkésőbbi módosítási időbélyeggel rendelkezik.',
      icon: '⏱️'
    },
    source_priority: {
      title: 'Forrás Prioritás Sorrend',
      desc: 'Tampermonkey Élő Stream (MagyarAnime/OniAnime/AnimeDrive) > AniList > MyAnimeList > Kézi mentés.',
      icon: '⭐'
    },
    manual_review: {
      title: 'Kézi Döntés és Jóváhagyás',
      desc: 'Minden felmerülő eltérést a várakozó konfliktusok listájába helyez, ahol egyenként választhatod ki a kívánt verziót.',
      icon: '🛡️'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                Automatikus Konfliktuskezelő Motor
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Multi-Source Összefésülés
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              Konfliktuskezelési Központ
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Kezeld a több forrásból (Tampermonkey Élő Stream, AniList, MyAnimeList, Dropbox, Google Drive) érkező adatok közötti eltéréseket intelligens szabályokkal.
            </p>
          </div>
        </div>
      </div>

      {/* STRATEGY SELECTOR GRID */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            Aktív Konfliktusfeloldási Stratégia
          </h3>
          <span className="text-xs text-slate-400">
            Kattints a kívánt szabály kiválasztásához
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(strategyDescriptions) as ConflictStrategy[]).map((stratKey) => {
            const item = strategyDescriptions[stratKey];
            const isSelected = strategy === stratKey;
            return (
              <div
                key={stratKey}
                onClick={() => handleStrategyChange(stratKey)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10 scale-[1.01]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{item.icon}</span>
                    <h4 className={`text-sm font-bold ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                      {item.title}
                    </h4>
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 flex items-center gap-1">
                      <Check className="w-3 h-3" /> AKTÍV
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* PENDING CONFLICTS QUEUE */}
      {pendingConflicts.length > 0 && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Döntésre Váró Konfliktusok ({pendingConflicts.length})
            </h3>
            <span className="text-xs text-slate-400">Manuális jóváhagyás szükséges</span>
          </div>

          <div className="space-y-4">
            {pendingConflicts.map((conflict) => (
              <div
                key={conflict.id}
                className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    {conflict.title}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Észlelve: {new Date(conflict.detectedAt).toLocaleTimeString('hu-HU')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Database State */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold text-slate-400 block mb-2">
                      Jelenlegi állapot a Lunában ({conflict.currentTrack.source}):
                    </span>
                    <div className="space-y-1 text-xs text-slate-200">
                      <div>Rész: <strong className="text-cyan-400">{conflict.currentTrack.episode}. Rész</strong></div>
                      <div>Státusz: <strong>{conflict.currentTrack.status}</strong></div>
                    </div>
                  </div>

                  {/* Incoming State */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-300 block mb-2">
                      Bejövő adat ({conflict.incomingSource}):
                    </span>
                    <div className="space-y-1 text-xs text-slate-200">
                      <div>Rész: <strong className="text-amber-400">{conflict.incomingTrack.episode}. Rész</strong></div>
                      <div>Státusz: <strong>{conflict.incomingTrack.status || 'Nem változik'}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleResolveManual(conflict, 'keep_current')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Megtartom a jelenlegit
                  </button>
                  <button
                    onClick={() => handleResolveManual(conflict, 'highest_ep')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer"
                  >
                    Legmagasabb rész érvényesítése
                  </button>
                  <button
                    onClick={() => handleResolveManual(conflict, 'use_incoming')}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    Bejövő elfogadása
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONFLICT RESOLUTION LOGS & HISTORY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Automatikus Konfliktuskezelési Napló & Előzmények
          </h3>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Napló ürítése
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              Nincs feljegyzett konfliktus
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Amikor a Tampermonkey vagy az AniList/MAL szinkronizálás során eltérés merül fel, a rendszer automatikusan naplózza a megoldást ide.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-thin">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="font-bold text-white truncate block">
                      {log.title}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {log.summary} • <span className="text-cyan-400 font-mono">{log.source}</span>
                    </span>
                  </div>
                </div>

                <span className="text-slate-500 text-[11px] shrink-0 font-mono">
                  {new Date(log.resolvedAt).toLocaleTimeString('hu-HU')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
