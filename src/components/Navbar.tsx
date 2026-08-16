import React, { useState } from 'react';
import { 
  Tv, 
  Download, 
  Github, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Menu, 
  X, 
  Sparkles,
  Layers,
  Code2,
  HelpCircle,
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GITHUB_REPO_URL, GITHUB_ZIP_URL, EXTENSION_VERSION } from '../firebase/config';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeSection, 
  onNavigate,
  onOpenAdminModal 
}) => {
  const { user, isAdmin, isLoggingIn, loginWithGoogle, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Áttekintés', icon: Sparkles },
    { id: 'tracker', label: 'Animék', icon: Tv },
    { id: 'features', label: 'Funkciók', icon: Layers },
    { id: 'install', label: 'Telepítési Útmutató', icon: Download },
    { id: 'code-viewer', label: 'Forráskód', icon: Code2 },
    { id: 'faq', label: 'GYIK', icon: HelpCircle },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07070d]/85 backdrop-blur-xl transition-all">
      {/* Top micro-banner */}
      <div className="w-full bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-cyan-950/40 border-b border-cyan-500/15 py-1 px-4 text-xs flex justify-between items-center text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-cyan-400 font-mono font-medium">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            LUNA ENGINE v{EXTENSION_VERSION}
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            MagyarAnime & OniAnime Automatikus Szinkronizáció
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href={GITHUB_REPO_URL}
            target="_blank" 
            rel="noreferrer" 
            className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#07070d] rounded-[11px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                🌙
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                LUNA
              </span>
              <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold">
                TRACKER
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider -mt-0.5">
              ANIME CLOUD EXTENSION
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Quick ZIP download button */}
          <a
            href={GITHUB_ZIP_URL}
            id="navbar-download-zip-btn"
            download
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-cyan-500/10 text-slate-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all"
            title="Közvetlen Letöltés (.zip formátumban)"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>v{EXTENSION_VERSION} .ZIP</span>
          </a>

          {/* Admin Auth State */}
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="font-mono">FŐADMIN</span>
              </div>
              <button
                onClick={onOpenAdminModal}
                id="navbar-admin-panel-btn"
                className="text-xs px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 transition-colors font-medium"
              >
                Kezelőpult
              </button>
              <button
                onClick={() => logout()}
                id="navbar-logout-btn"
                className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                title="Kijelentkezés"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              disabled={isLoggingIn}
              id="navbar-google-login-btn"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-[#07070d] font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5 text-black" />
              <span>{isLoggingIn ? 'Hitelesítés...' : 'Admin Belépés'}</span>
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          {isAdmin ? (
            <button
              onClick={onOpenAdminModal}
              className="text-xs px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono"
            >
              Admin
            </button>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="text-xs px-2.5 py-1 rounded bg-cyan-500 text-black font-bold font-mono"
            >
              Belépés
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Menü megnyitása"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#07070d] px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <a
              href={GITHUB_ZIP_URL}
              download
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-white/10 text-white"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Bővítmény Letöltése (.ZIP)</span>
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-white/5 text-slate-300 border border-white/10"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Forráskód</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
