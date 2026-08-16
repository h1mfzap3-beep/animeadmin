import React from 'react';
import { 
  BarChart3, 
  Tv, 
  Flame, 
  CheckCircle2, 
  Star, 
  PieChart, 
  TrendingUp, 
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { AnimeTrack } from '../types';

interface DashboardAnalyticsProps {
  tracks: AnimeTrack[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ tracks }) => {
  const totalEpisodes = tracks.reduce((acc, curr) => acc + (curr.episode || 0), 0);
  const completedCount = tracks.filter((t) => t.status === 'completed').length;
  const watchingCount = tracks.filter((t) => t.status === 'watching').length;
  const planCount = tracks.filter((t) => t.status === 'plan_to_watch').length;

  const totalMinutes = totalEpisodes * 24;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Source breakdown
  const sourceStats = tracks.reduce((acc, curr) => {
    acc[curr.source] = (acc[curr.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Genre breakdown
  const genreStats = tracks.reduce((acc, curr) => {
    if (curr.genres) {
      curr.genres.forEach((g) => {
        acc[g] = (acc[g] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedGenres = Object.entries(genreStats).sort((a, b) => Number(b[1]) - Number(a[1]));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-6 rounded-2xl bg-[#090a14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>ÖSSZESÍTETT MEGTEKINTÉSI IDŐ</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-display font-bold text-3xl text-white">
            {totalHours} <span className="text-sm font-normal text-slate-400 font-mono">óra</span> {remainingMinutes} <span className="text-sm font-normal text-slate-400 font-mono">perc</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {totalEpisodes} db epizód alapján (átlag 24 perc / rész)
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#090a14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>BEFEJEZÉSI ARÁNY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-bold text-3xl text-emerald-400">
            {tracks.length > 0 ? Math.round((completedCount / tracks.length) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {completedCount} / {tracks.length} befejezett sorozat
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#090a14] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>AKTÍV SOROZATOK</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-bold text-3xl text-amber-400">
            {watchingCount} <span className="text-sm font-normal text-slate-400 font-mono">cím</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            {planCount} db tervezett várólistán
          </p>
        </div>

      </div>

      {/* Analytics Charts & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Source Distribution */}
        <div className="p-6 rounded-2xl bg-[#090a14] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white">
              Videótár & Forrás Megoszlás
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(sourceStats).map(([src, count]) => {
              const numCount = Number(count);
              const pct = tracks.length > 0 ? Math.round((numCount / tracks.length) * 100) : 0;
              return (
                <div key={src} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{src}</span>
                    <span className="text-cyan-400 font-mono">{numCount} db ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Genres Breakdown */}
        <div className="p-6 rounded-2xl bg-[#090a14] border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="font-display font-bold text-base text-white">
              Műfajok Eloszlása
            </h3>
          </div>

          {sortedGenres.length === 0 ? (
            <p className="text-xs text-slate-500">Még nincs rögzített műfaj.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedGenres.map(([genre, count]) => (
                <div
                  key={genre}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-xs"
                >
                  <span className="text-white font-medium">{genre}</span>
                  <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
