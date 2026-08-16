import React from 'react';
import { 
  LayoutDashboard, 
  Tv, 
  PlusCircle, 
  BarChart3, 
  Zap, 
  Code2, 
  LogOut, 
  Radio, 
  ShieldCheck,
  Flame,
  Globe,
  Cloud,
  RefreshCw,
  GitMerge,
  MonitorPlay
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../firebase/config';

export type DashboardTab = 
  | 'overview' 
  | 'library' 
  | 'quickadd' 
  | 'sites' 
  | 'virtualpanel'
  | 'malsync' 
  | 'conflicts' 
  | 'cloudsync' 
  | 'analytics' 
  | 'integrations' 
  | 'code';

interface DashboardSidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  totalTracks: number;
  watchingCount: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  currentTab,
  onSelectTab,
  totalTracks,
  watchingCount,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'overview' as DashboardTab,
      label: 'Vezérlőpult',
      sublabel: 'Áttekintés & Folytatás',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'library' as DashboardTab,
      label: 'Anime Könyvtár',
      sublabel: 'Összes követett cím',
      icon: Tv,
      badge: totalTracks,
    },
    {
      id: 'virtualpanel' as DashboardTab,
      label: 'Virtuális Szkript Panel',
      sublabel: 'Élő Szimulátor & Tesztelő',
      icon: MonitorPlay,
      badge: 'Élő HUD',
    },
    {
      id: 'sites' as DashboardTab,
      label: 'Figyelt Anime Oldalak',
      sublabel: 'OniAnime, MagyarAnime + Új',
      icon: Globe,
      badge: 'Bővített',
    },
    {
      id: 'malsync' as DashboardTab,
      label: 'AniList & MyAnimeList',
      sublabel: 'Kétirányú Szinkron & Import',
      icon: RefreshCw,
      badge: 'Auto',
    },
    {
      id: 'conflicts' as DashboardTab,
      label: 'Konfliktuskezelés',
      sublabel: 'Auto-feloldás & Előzmények',
      icon: GitMerge,
      badge: null,
    },
    {
      id: 'quickadd' as DashboardTab,
      label: 'Új Anime Rögzítése',
      sublabel: 'Manuális hozzáadás',
      icon: PlusCircle,
      badge: null,
    },
    {
      id: 'cloudsync' as DashboardTab,
      label: 'Drive & Dropbox',
      sublabel: 'Felhőmentés & Live Bridge',
      icon: Cloud,
      badge: null,
    },
    {
      id: 'analytics' as DashboardTab,
      label: 'Statisztikák',
      sublabel: 'Elemzés & Megoszlás',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'integrations' as DashboardTab,
      label: 'Tampermonkey Központ',
      sublabel: 'Telepítő & Használat',
      icon: Zap,
      badge: 'v3.1',
    },
    {
      id: 'code' as DashboardTab,
      label: 'Forráskód Betekintő',
      sublabel: 'Userscript & Manifest',
      icon: Code2,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[#090a14] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-2xl bg-[#090a14] flex items-center justify-center text-xl">
              🌙
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-white tracking-wider flex items-center gap-2">
              <span>LUNA DASHBOARD</span>
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
              <span>Google Cloud Firestore</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 p-4 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Navigáció & Funkciók
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 border border-cyan-500/40 text-white shadow-lg shadow-cyan-500/10'
                  : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-cyan-500 text-black font-bold' : 'bg-white/5 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm tracking-wide">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive 
                    ? 'bg-cyan-400 text-black' 
                    : item.badge === 'Új'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/10 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Live Quick Counter Card */}
        <div className="mt-6 p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Nézés alatt</span>
            </span>
            <span className="text-amber-400 font-bold">{watchingCount} cím</span>
          </div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalTracks > 0 ? (watchingCount / totalTracks) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Admin User Footer & Logout */}
      <div className="p-4 border-t border-white/10 bg-black/30 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Admin"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-cyan-500/50"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
              H1
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                {user?.displayName || 'Admin Felhasználó'}
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              {user?.email || ADMIN_EMAIL}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Biztonságos Kijelentkezés</span>
        </button>
      </div>

    </aside>
  );
};
