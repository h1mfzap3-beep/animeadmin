import React from 'react';
import { 
  Download, 
  Github, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Database,
  Chrome
} from 'lucide-react';
import { ExtensionMockup } from './ExtensionMockup';
import { GITHUB_REPO_URL, GITHUB_ZIP_URL, EXTENSION_VERSION } from '../firebase/config';

interface HeroProps {
  onExploreClick: () => void;
  onInstallGuideClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onInstallGuideClick }) => {
  return (
    <section id="hero" className="relative pt-8 pb-20 overflow-hidden cyber-grid">
      {/* Aurora glowing orbs in background */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-60 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Version & Badge pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm shadow-cyan-500/10">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>CHROME BŐVÍTMÉNY v{EXTENSION_VERSION} ELÉRHETŐ</span>
              <span className="text-slate-500">•</span>
              <span className="text-purple-400 font-semibold">MagyarAnime & OniAnime</span>
            </div>

            {/* Main title */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Kövesd animéid <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">
                automatikusan és élőben
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              A <strong className="text-white font-medium">Luna Anime Tracker</strong> egy új generációs, cyberpunk esztétikájú Chrome bővítmény és webalkalmazás. Felismeri a megtekintett részeket a <span className="text-cyan-300 font-medium">MagyarAnime</span> és <span className="text-purple-300 font-medium">OniAnime</span> videólejátszóin, és valós időben menti a felhőbe a Google Cloud Firestore segítségével.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Direct ZIP download button */}
              <a
                href={GITHUB_ZIP_URL}
                id="hero-download-main-zip-btn"
                download
                className="flex items-center gap-3 px-5 py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-[#07070d] shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Download className="w-5 h-5 text-black stroke-[2.5]" />
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-black/70">Közvetlen Letöltés</div>
                  <div className="text-sm font-bold text-black">Bővítmény (.ZIP)</div>
                </div>
              </a>

              {/* Tampermonkey Quick 1-Click Action */}
              <button
                onClick={onInstallGuideClick}
                id="hero-tampermonkey-cta-btn"
                className="flex items-center gap-2.5 px-5 py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <div className="text-left leading-none">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80">1-Kattintásos Automata</div>
                  <div className="text-sm font-bold text-amber-300">Tampermonkey</div>
                </div>
              </button>

              {/* Install Guide CTA */}
              <button
                onClick={onInstallGuideClick}
                id="hero-install-guide-btn"
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-xs sm:text-sm bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
              >
                <Chrome className="w-4 h-4 text-cyan-400" />
                <span>Útmutató</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* GitHub Link */}
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer"
                id="hero-github-link-btn"
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-black/40 hover:bg-black/60 border border-white/10 transition-all"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>

            {/* Quick Feature Metric Counters */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div className="p-2">
                <div className="font-display font-bold text-2xl text-cyan-400">100%</div>
                <div className="text-xs text-slate-400 font-mono">Automata Követés</div>
              </div>
              <div className="p-2">
                <div className="font-display font-bold text-2xl text-purple-400">0 ms</div>
                <div className="text-xs text-slate-400 font-mono">Firestore Élő Sync</div>
              </div>
              <div className="p-2">
                <div className="font-display font-bold text-2xl text-emerald-400">MIT</div>
                <div className="text-xs text-slate-400 font-mono">Nyílt Forráskód</div>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Extension Mockup & Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md">
              
              {/* Subtle background glow frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-lg opacity-30"></div>
              
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Interaktív Előnézet</span>
              </div>

              {/* The Live Interactive Extension Card */}
              <ExtensionMockup />
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 font-mono">
              💡 Kattints a fenti <strong className="text-cyan-400">+1 Rész</strong> gombra a működés azonnali kipróbálásához!
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
