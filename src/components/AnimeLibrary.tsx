import React, { useState } from 'react';
import { 
  Tv, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  Clock, 
  Star, 
  CheckCircle, 
  PlayCircle, 
  Bookmark, 
  Trash2, 
  Edit3, 
  Radio,
  Sparkles,
  ChevronRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimeTrack, WatchStatus, AnimeSource } from '../types';
import { useAuth } from '../context/AuthContext';
import { incrementEpisode, deleteAnimeTrack } from '../services/firestoreService';

interface AnimeLibraryProps {
  tracks: AnimeTrack[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (track: AnimeTrack) => void;
}

export const AnimeLibrary: React.FC<AnimeLibraryProps> = ({
  tracks,
  isLoading,
  onOpenAddModal,
  onOpenEditModal
}) => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'progress' | 'rating'>('updated');
  const [selectedAnime, setSelectedAnime] = useState<AnimeTrack | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filter logic
  const filteredTracks = tracks.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.genres && item.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = selectedStatus === 'all' 
      ? true 
      : selectedStatus === 'plan_to_watch'
        ? (item.status === 'plan_to_watch' || item.status === 'planned')
        : item.status === selectedStatus;
    const matchesSource = selectedSource === 'all' || item.source === selectedSource;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Sort logic
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'progress') {
      return b.episode - a.episode;
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const handleQuickIncrement = async (track: AnimeTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setActionLoadingId(track.id);
      await incrementEpisode(track.id, track.episode, track.totalEpisodes);
      try {
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.7 }
        });
      } catch (err) {}
    } catch (err) {
      console.error("Increment error:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (track: AnimeTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Biztosan törölni szeretnéd a(z) "${track.title}" elemet az adatbázisból?`)) {
      try {
        setActionLoadingId(track.id);
        await deleteAnimeTrack(track.id);
      } catch (err) {
        alert("Hiba történt a törlés során.");
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return 'Épp most';
      if (diffMinutes < 60) return `${diffMinutes} perce`;
      if (diffHours < 24) return `${diffHours} órája`;
      if (diffDays === 1) return 'Tegnap';
      if (diffDays < 7) return `${diffDays} napja`;
      return date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Nemrég';
    }
  };

  const getStatusBadge = (status: WatchStatus) => {
    switch (status) {
      case 'watching':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">Nézem</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">Befejezve</span>;
      case 'plan_to_watch':
      case 'planned':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/30">Tervezett</span>;
      case 'on_hold':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/70 text-purple-300 border border-purple-500/30">Szüneteltetve</span>;
      case 'dropped':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-950/70 text-red-300 border border-red-500/30">Félbehagyva</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  const getSourceBadge = (source: AnimeSource) => {
    if (source === 'MagyarAnime') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/20 text-cyan-300 border border-cyan-500/40">MagyarAnime</span>;
    }
    if (source === 'OniAnime') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/20 text-fuchsia-300 border border-purple-500/40">OniAnime</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">{source}</span>;
  };

  return (
    <section id="tracker" className="py-16 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Admin Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>ÉLŐ FIRESTORE ADATBÁZIS</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white tracking-tight">
              Követett Animék & Epizódok
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Valós idejű szinkronizáció a Chrome bővítmény és a webalkalmazás között.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                id="library-add-anime-btn"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Új Anime Felvétele</span>
              </button>
            )}
            
            <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              Összesen: <span className="text-cyan-400 font-bold">{tracks.length} db</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Keresés cím, műfaj vagy jegyzet alapján..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Minden Állapot</option>
                <option value="watching">Csak Folyamatban lévők (Nézem)</option>
                <option value="completed">Befejezettek</option>
                <option value="plan_to_watch">Tervezettek</option>
                <option value="on_hold">Szüneteltetettek</option>
                <option value="dropped">Félbehagyottak</option>
              </select>
            </div>

            {/* Source Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Minden Forrás</option>
                <option value="MagyarAnime">MagyarAnime</option>
                <option value="OniAnime">OniAnime</option>
                <option value="Egyéb">Egyéb forrás</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="updated">Legutóbb frissítve</option>
                <option value="title">Cím szerint (A-Z)</option>
                <option value="progress">Epizód száma</option>
                <option value="rating">Értékelés</option>
              </select>
            </div>

          </div>
        </div>

        {/* Anime Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 font-mono text-sm">Firestore szinkronizáció folyamatban...</p>
          </div>
        ) : sortedTracks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
            <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-slate-200 mb-1">
              Nem található anime a megadott szűrőkkel
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              Próbálj más keresőszót megadni, vagy vegyél fel egy új animét!
            </p>
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 text-black inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Új anime hozzáadása</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedTracks.map((anime) => {
              const progressPercentage = anime.totalEpisodes && anime.totalEpisodes > 0
                ? Math.min(100, Math.round((anime.episode / anime.totalEpisodes) * 100))
                : 50;

              return (
                <div
                  key={anime.id}
                  onClick={() => setSelectedAnime(anime)}
                  className="group relative rounded-2xl overflow-hidden bg-[#0d0e1a] border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:shadow-cyan-500/10"
                >
                  {/* Top Cover / Header Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={anime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e1a] via-[#0d0e1a]/40 to-transparent"></div>

                    {/* Top overlay badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      {getSourceBadge(anime.source)}
                      {getStatusBadge(anime.status)}
                    </div>

                    {/* Rating badge */}
                    {typeof anime.rating === 'number' && (
                      <div className="absolute bottom-2 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-amber-300 text-xs font-bold font-mono border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{anime.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Synced indicator */}
                    {anime.syncedFromExtension && (
                      <div className="absolute bottom-2 right-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/80 backdrop-blur-sm text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                        <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Extension Sync</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base text-white line-clamp-1 group-hover:text-cyan-300 transition-colors mb-1">
                        {anime.title}
                      </h3>

                      {anime.genres && anime.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {anime.genres.slice(0, 3).map((g, i) => (
                            <span key={i} className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.2 rounded">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar & Episode counter */}
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Haladás</span>
                        <span className="text-cyan-400 font-bold">
                          {anime.episode}. Rész {anime.totalEpisodes ? `/ ${anime.totalEpisodes}` : ''}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>

                      {/* Footer info & Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatRelativeTime(anime.updatedAt)}</span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleQuickIncrement(anime, e)}
                            disabled={actionLoadingId === anime.id}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40 transition-all cursor-pointer"
                            title="Epizód növelése eggyel (+1)"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" />
                            <span>+1</span>
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEditModal(anime);
                                }}
                                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                title="Szerkesztés"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(anime, e)}
                                className="p-1 rounded-lg bg-red-950/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                title="Törlés"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Anime Detail Modal */}
      {selectedAnime && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedAnime(null)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl bg-[#0c0d18] border border-cyan-500/30 shadow-2xl p-6 text-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedAnime(null)}
              className="absolute top-4 right-4 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex gap-4 mb-4">
              <img
                src={selectedAnime.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'}
                alt={selectedAnime.title}
                className="w-24 h-32 object-cover rounded-xl border border-white/10"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getSourceBadge(selectedAnime.source)}
                  {getStatusBadge(selectedAnime.status)}
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">
                  {selectedAnime.title}
                </h3>
                <div className="text-xs font-mono text-cyan-400 mb-1">
                  Epizód: <strong>{selectedAnime.episode}</strong> {selectedAnime.totalEpisodes ? `/ ${selectedAnime.totalEpisodes}` : ''}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{selectedAnime.rating ? `${selectedAnime.rating.toFixed(1)} / 10` : 'Nincs értékelve'}</span>
                </div>
              </div>
            </div>

            {selectedAnime.notes && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 mb-4 text-xs text-slate-300">
                <div className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                  Jegyzet & Vélemény
                </div>
                <p className="leading-relaxed">{selectedAnime.notes}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 mb-6 bg-black/40 p-3 rounded-xl">
              <div>Utolsó frissítés:</div>
              <div className="text-right text-slate-200">{new Date(selectedAnime.updatedAt).toLocaleString('hu-HU')}</div>
              <div>Szinkronizáció:</div>
              <div className="text-right text-cyan-400">{selectedAnime.syncedFromExtension ? 'Chrome Bővítmény' : 'Kézi bejegyzés'}</div>
            </div>

            <div className="flex items-center justify-between gap-3">
              {selectedAnime.sourceUrl ? (
                <a
                  href={selectedAnime.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Megnyitás a forrásoldalon ({selectedAnime.source})</span>
                </a>
              ) : (
                <div className="text-xs text-slate-500">Nincs közvetlen forrás link megadva</div>
              )}

              <button
                onClick={(e) => {
                  handleQuickIncrement(selectedAnime, e);
                  setSelectedAnime({
                    ...selectedAnime,
                    episode: selectedAnime.episode + 1
                  });
                }}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+1 Rész</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
