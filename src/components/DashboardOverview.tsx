import React, { useState } from 'react';
import { 
  Tv, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Star, 
  Plus, 
  ExternalLink, 
  Zap, 
  Sparkles, 
  ChevronRight,
  TrendingUp,
  Activity,
  Play,
  ArrowUpRight,
  MonitorPlay
} from 'lucide-react';
import { AnimeTrack } from '../types';
import { incrementEpisode } from '../services/firestoreService';

interface DashboardOverviewProps {
  tracks: AnimeTrack[];
  onOpenAddModal: () => void;
  onOpenEditModal: (track: AnimeTrack) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tracks,
  onOpenAddModal,
  onOpenEditModal,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'watching' | 'plan_to_watch' | 'all'>('watching');

  const watchingTracks = tracks.filter((t) => t.status === 'watching');
  const completedTracks = tracks.filter((t) => t.status === 'completed');
  const planToWatchTracks = tracks.filter((t) => t.status === 'plan_to_watch' || t.status === 'planned');

  const displayedTracks = activeTab === 'watching' 
    ? (watchingTracks.length > 0 ? watchingTracks : tracks.slice(0, 6))
    : activeTab === 'plan_to_watch'
      ? planToWatchTracks
      : tracks;

  const totalEpisodesWatched = tracks.reduce((acc, curr) => acc + (curr.episode || 0), 0);
  const avgRating = tracks.length > 0 
    ? (tracks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / tracks.length).toFixed(1)
    : '0.0';

  const handleIncrement = async (track: AnimeTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await incrementEpisode(track.id, track.episode, track.totalEpisodes);
    } catch (err: any) {
      alert(`Hiba a léptetésnél: ${err.message}`);
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'watching') return 'Nézem';
    if (status === 'completed') return 'Befejezve';
    if (status === 'plan_to_watch' || status === 'planned') return 'Tervezett';
    if (status === 'on_hold') return 'Szüneteltetve';
    if (status === 'dropped') return 'Félbehagyva';
    return status;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_70%_50%,rgba(6,182,212,0.15),transparent_70%)] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>VALÓS IDEJŰ ADATBÁZIS & BŐVÍTMÉNY VEZÉRLŐ</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Üdvözlünk a Luna Anime Dashboardon! 🌙
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Itt láthatod a MagyarAnime és OniAnime oldalakon követett animéid aktuális állását, frissítéseit és statisztikáit.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>Új Anime Hozzáadása</span>
            </button>

            <button
              onClick={() => onNavigateTab('virtualpanel')}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <MonitorPlay className="w-3.5 h-3.5 text-purple-200" />
              <span>Virtuális Szkript Panel</span>
            </button>

            <button
              onClick={() => onNavigateTab('integrations')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tampermonkey Auto-Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Animes */}
        <div className="p-5 rounded-2xl bg-[#090a14] border border-white/10 hover:border-cyan-500/30 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Összes Anime</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-white">
            {tracks.length} <span className="text-xs text-slate-500 font-mono font-normal">cím</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400/80 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{watchingTracks.length} aktív lejátszási listán</span>
          </div>
        </div>

        {/* Card 2: Watching Now */}
        <div className="p-5 rounded-2xl bg-[#090a14] border border-white/10 hover:border-amber-500/30 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Éppen Nézem</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-amber-400">
            {watchingTracks.length} <span className="text-xs text-slate-500 font-mono font-normal">sorozat</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            Közvetlen +1 léptetés elérhető
          </div>
        </div>

        {/* Card 3: Total Episodes */}
        <div className="p-5 rounded-2xl bg-[#090a14] border border-white/10 hover:border-purple-500/30 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Megnézett Epizódok</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-purple-300">
            {totalEpisodesWatched} <span className="text-xs text-slate-500 font-mono font-normal">rész</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            ~{Math.round((totalEpisodesWatched * 24) / 60)} óra megtekintési idő
          </div>
        </div>

        {/* Card 4: Average Rating */}
        <div className="p-5 rounded-2xl bg-[#090a14] border border-white/10 hover:border-emerald-500/30 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Átlagos Értékelés</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            </div>
          </div>
          <div className="font-display font-bold text-2xl sm:text-3xl text-emerald-400">
            {avgRating} <span className="text-xs text-slate-500 font-mono font-normal">/ 10</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono">
            {completedTracks.length} befejezett anime
          </div>
        </div>

      </div>

      {/* Currently Watching / Planned Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-base sm:text-lg text-white">
              Animéid & Epizódok
            </h3>
            
            {/* Interactive Sub-tabs */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 ml-2">
              <button
                onClick={() => setActiveTab('watching')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'watching'
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nézem ({watchingTracks.length})
              </button>
              <button
                onClick={() => setActiveTab('plan_to_watch')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'plan_to_watch'
                    ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tervezett ({planToWatchTracks.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Összes ({tracks.length})
              </button>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('library')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Teljes Könyvtár Megnyitása</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayedTracks.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#090a14] border border-white/10 text-center space-y-3">
            <Tv className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              {activeTab === 'plan_to_watch' 
                ? 'Jelenleg nincs tervezett animéd a listában. Rögzíts egy újat "Tervezett" státusszal!' 
                : 'Jelenleg nincs megjeleníthető anime ebben a kategóriában.'}
            </p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Új Anime Felvétele</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTracks.map((track) => {
              const progressPct = track.totalEpisodes && track.totalEpisodes > 0
                ? Math.min(100, Math.round((track.episode / track.totalEpisodes) * 100))
                : null;

              return (
                <div
                  key={track.id}
                  onClick={() => onOpenEditModal(track)}
                  className="rounded-2xl bg-[#090a14] border border-white/10 hover:border-cyan-500/40 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={track.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="w-16 h-20 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {track.source}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          track.status === 'plan_to_watch' || track.status === 'planned'
                            ? 'bg-purple-950/70 text-purple-300 border-purple-500/40'
                            : track.status === 'completed'
                              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                        }`}>
                          {getStatusLabel(track.status)}
                        </span>
                        {track.rating && (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            <span>{track.rating}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors">
                        {track.title}
                      </h4>

                      <div className="text-xs text-slate-400 mt-1 font-mono">
                        <span className="text-cyan-400 font-bold text-sm">{track.episode}. rész</span>
                        {track.totalEpisodes ? <span className="text-slate-500"> / {track.totalEpisodes}</span> : ''}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {progressPct !== null && (
                    <div className="mb-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Haladás</span>
                        <span className="text-cyan-400">{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={(e) => handleIncrement(track, e)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-cyan-500/30 cursor-pointer"
                      title="Epizód növelése +1-gyel"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1 Epizód</span>
                    </button>

                    {track.sourceUrl && (
                      <a
                        href={track.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                        title="Megnyitás a forrásoldalon"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Split Cards: Quick Extension & Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Additions / Updates */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#090a14] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Legutóbbi Bejegyzések</span>
            </h3>
            <button
              onClick={() => onNavigateTab('library')}
              className="text-xs text-slate-400 hover:text-cyan-400 font-mono transition-colors"
            >
              Könyvtár ({tracks.length})
            </button>
          </div>

          {tracks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              Még nincs elmentett anime a valódi Firestore adatbázisban. Rögzíts egy újat, indíts el egyet a lejátszón, vagy állíts vissza egy mentést!
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tracks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => onOpenEditModal(t)}
                  className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80'}
                      alt=""
                      className="w-9 h-11 object-cover rounded-lg border border-white/10"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-white hover:text-cyan-300 transition-colors">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span className="text-cyan-400">{t.episode}. rész</span>
                        <span>•</span>
                        <span>{t.source}</span>
                        <span>•</span>
                        <span className="text-purple-300 font-medium">{getStatusLabel(t.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">★ {t.rating || '9.0'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Tampermonkey Status Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 via-black to-[#090a14] border border-amber-500/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                1-Kattintásos
              </span>
            </div>

            <h3 className="font-display font-bold text-base text-white">
              Tampermonkey Auto-Telepítés
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Kattints a gombra, és a böngésző Tampermonkey kiegészítője automatikusan megnyitja a telepítő ablakot!
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <a
              href="/Luna-Anime-Tracker.user.js"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black text-black" />
              <span>Automatikus Telepítés</span>
            </a>

            <button
              onClick={() => onNavigateTab('virtualpanel')}
              className="w-full py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MonitorPlay className="w-3.5 h-3.5 text-purple-400" />
              <span>Virtuális Szkript Panel & Szimulátor</span>
            </button>

            <button
              onClick={() => onNavigateTab('integrations')}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>További beállítások & Bővítmény</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
