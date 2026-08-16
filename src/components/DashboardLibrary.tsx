import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  Star, 
  Flame, 
  CheckCircle2, 
  Clock, 
  PauseCircle, 
  XCircle, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { AnimeTrack, WatchStatus, AnimeSource } from '../types';
import { incrementEpisode, deleteAnimeTrack } from '../services/firestoreService';

interface DashboardLibraryProps {
  tracks: AnimeTrack[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (track: AnimeTrack) => void;
}

export const DashboardLibrary: React.FC<DashboardLibraryProps> = ({
  tracks,
  searchQuery,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'rating' | 'episode'>('updated');

  const filteredTracks = tracks.filter((track) => {
    // Search query filter
    const matchesSearch = searchQuery === '' || 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (track.notes && track.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (track.genres && track.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())));

    // Status filter
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'plan_to_watch'
        ? (track.status === 'plan_to_watch' || track.status === 'planned')
        : track.status === statusFilter;

    // Source filter
    const matchesSource = sourceFilter === 'all' || track.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Sort
  const sortedTracks = [...filteredTracks].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'episode') {
      return (b.episode || 0) - (a.episode || 0);
    }
    return 0;
  });

  const handleIncrement = async (track: AnimeTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await incrementEpisode(track.id, track.episode, track.totalEpisodes);
    } catch (err: any) {
      alert(`Hiba a léptetésnél: ${err.message}`);
    }
  };

  const handleDelete = async (track: AnimeTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Biztosan törölni szeretnéd a(z) "${track.title}" bejegyzést?`)) {
      try {
        await deleteAnimeTrack(track.id);
      } catch (err: any) {
        alert(`Hiba a törlésnél: ${err.message}`);
      }
    }
  };

  const getStatusBadge = (status: WatchStatus) => {
    switch (status) {
      case 'watching':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono flex items-center gap-1">
            <Flame className="w-2.5 h-2.5" />
            <span>Nézem</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Befejezve</span>
          </span>
        );
      case 'plan_to_watch':
      case 'planned':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>Tervezett</span>
          </span>
        );
      case 'on_hold':
        return (
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono flex items-center gap-1">
            <PauseCircle className="w-2.5 h-2.5" />
            <span>Szünetel</span>
          </span>
        );
      case 'dropped':
        return (
          <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono flex items-center gap-1">
            <XCircle className="w-2.5 h-2.5" />
            <span>Félbehagyva</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10 text-[10px] font-mono">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Control Bar: Filters, Source Selector, View Mode */}
      <div className="p-4 rounded-2xl bg-[#090a14] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Összes', count: tracks.length },
            { id: 'watching', label: 'Folyamatban', count: tracks.filter(t => t.status === 'watching').length },
            { id: 'completed', label: 'Befejezve', count: tracks.filter(t => t.status === 'completed').length },
            { id: 'plan_to_watch', label: 'Tervezett', count: tracks.filter(t => t.status === 'plan_to_watch' || t.status === 'planned').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Secondary Controls: Source, Sort, View toggle */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Source Filter Dropdown */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="all">Minden Forrás</option>
            <option value="MagyarAnime">MagyarAnime.hu</option>
            <option value="OniAnime">OniAnime.hu</option>
            <option value="AnimeGun">AnimeGun</option>
            <option value="Indavideo">Indavideo</option>
            <option value="Egyéb">Egyéb</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="updated">Rendezés: Legutóbbi</option>
            <option value="title">Rendezés: Név (A-Z)</option>
            <option value="rating">Rendezés: Értékelés</option>
            <option value="episode">Rendezés: Epizód</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-white'
              }`}
              title="Kártyás nézet"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'table' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-white'
              }`}
              title="Táblázatos nézet"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Empty State */}
      {sortedTracks.length === 0 && (
        <div className="p-12 rounded-3xl bg-[#090a14] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-white text-base">Nem található anime a megadott szűrőkkel</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Próbáld módosítani a keresési kifejezést vagy válassz másik kategóriát.
          </p>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Új Anime Hozzáadása</span>
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && sortedTracks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTracks.map((track) => {
            const progressPct = track.totalEpisodes && track.totalEpisodes > 0
              ? Math.min(100, Math.round((track.episode / track.totalEpisodes) * 100))
              : null;

            return (
              <div
                key={track.id}
                onClick={() => onOpenEditModal(track)}
                className="group relative rounded-2xl bg-[#090a14] border border-white/10 hover:border-cyan-500/50 p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer overflow-hidden shadow-lg hover:shadow-cyan-950/40"
              >
                <div>
                  {/* Top Image & Badge Overlay */}
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 border border-white/10 bg-black/40">
                    <img
                      src={track.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

                    {/* Top corner pills */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                        {track.source}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      {getStatusBadge(track.status)}
                    </div>

                    {/* Bottom overlay episode count */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs font-mono">
                      <span className="text-white font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur-md border border-white/10">
                        {track.episode}. Rész {track.totalEpisodes ? `/ ${track.totalEpisodes}` : ''}
                      </span>
                      {track.rating && (
                        <span className="text-amber-300 font-bold bg-black/70 px-2 py-0.5 rounded backdrop-blur-md border border-white/10 flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{track.rating}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Notes */}
                  <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1" title={track.title}>
                    {track.title}
                  </h4>

                  {track.genres && track.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {track.genres.slice(0, 3).map((g, i) => (
                        <span key={i} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  {track.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                      {track.notes}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  
                  {progressPct !== null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Haladás</span>
                        <span className="text-cyan-400">{progressPct}%</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleIncrement(track, e)}
                      className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-bold text-xs flex items-center justify-center gap-1 transition-all border border-cyan-500/30 cursor-pointer"
                      title="Epizód léptetése"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+1 Rész</span>
                    </button>

                    {track.sourceUrl && (
                      <a
                        href={track.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
                        title="Megnyitás"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditModal(track);
                      }}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/10 transition-colors"
                      title="Szerkesztés"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(track, e)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-red-950/50 text-slate-500 hover:text-red-400 border border-white/10 transition-colors"
                      title="Törlés"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && sortedTracks.length > 0 && (
        <div className="rounded-2xl bg-[#090a14] border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/50 border-b border-white/10 text-slate-400 font-mono">
                <tr>
                  <th className="py-3 px-4">Anime Címe</th>
                  <th className="py-3 px-4">Állapot</th>
                  <th className="py-3 px-4">Epizód</th>
                  <th className="py-3 px-4">Forrás</th>
                  <th className="py-3 px-4">Értékelés</th>
                  <th className="py-3 px-4">Frissítve</th>
                  <th className="py-3 px-4 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {sortedTracks.map((track) => (
                  <tr
                    key={track.id}
                    onClick={() => onOpenEditModal(track)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={track.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=150&q=80'}
                        alt=""
                        className="w-8 h-10 object-cover rounded-lg border border-white/10"
                      />
                      <div>
                        <div className="font-bold text-white hover:text-cyan-300">{track.title}</div>
                        {track.genres && (
                          <div className="text-[10px] text-slate-500 font-mono">{track.genres.join(', ')}</div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(track.status)}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                      {track.episode} {track.totalEpisodes ? `/ ${track.totalEpisodes}` : ''}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">
                      {track.source}
                    </td>

                    <td className="py-3 px-4 font-mono text-amber-400">
                      ★ {track.rating || 'N/A'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {new Date(track.updatedAt).toLocaleDateString('hu-HU')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleIncrement(track, e)}
                          className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black font-bold text-[11px] transition-colors"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => onOpenEditModal(track)}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(track, e)}
                          className="p-1 rounded bg-white/5 hover:bg-red-950/50 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
