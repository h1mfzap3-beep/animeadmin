import React from 'react';
import { 
  Search, 
  Plus, 
  Radio, 
  Bell, 
  Zap, 
  SlidersHorizontal,
  ExternalLink,
  ShieldCheck,
  Menu,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onOpenMobileMenu?: () => void;
  title: string;
  subtitle: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenMobileMenu,
  title,
  subtitle,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#07070d]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      
      {/* Title & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="font-display font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Search Bar */}
        <div className="relative w-36 sm:w-48 md:w-64 lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Keresés..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddModal}
          className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-black font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">Új Anime</span>
        </button>

        {/* User Info & Quick Logout in Header */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/[0.03] border border-white/5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full border border-cyan-500/40"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                <UserIcon className="w-3 h-3" />
              </div>
            )}
            <span className="text-xs text-slate-300 max-w-[120px] truncate font-mono">
              {user?.displayName || user?.email?.split('@')[0] || 'Felhasználó'}
            </span>
          </div>

          <button
            onClick={logout}
            title="Kijelentkezés"
            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-[11px] font-bold">Kilépés</span>
          </button>
        </div>

      </div>

    </header>
  );
};

