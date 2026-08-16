import React from 'react';
import { 
  Github, 
  Download, 
  Heart, 
  ShieldCheck, 
  Radio, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { GITHUB_REPO_URL, GITHUB_ZIP_URL, EXTENSION_VERSION, ADMIN_EMAIL } from '../firebase/config';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPrivacy, onOpenTerms }) => {
  return (
    <footer className="border-t border-white/10 bg-[#05050a] text-slate-400 text-xs relative overflow-hidden">
      {/* Background neon strip */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌙</span>
              <span className="font-display font-bold text-white text-base tracking-wider">
                LUNA TRACKER
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                v{EXTENSION_VERSION}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Modern cyberpunk anime nyomkövető Chrome bővítmény és felhő alapú webalkalmazás MagyarAnime és OniAnime támogatással.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>Google Cloud Firestore Online</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3">
              Navigáció
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-cyan-400 transition-colors">
                  Főoldal & Áttekintés
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('tracker')} className="hover:text-cyan-400 transition-colors">
                  Követett Animék Adatbázisa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('features')} className="hover:text-cyan-400 transition-colors">
                  Főbb Funkciók
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('install')} className="hover:text-cyan-400 transition-colors">
                  Telepítési Útmutató
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('code-viewer')} className="hover:text-cyan-400 transition-colors">
                  Bővítmény Forráskód
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Supported Sites & Tech */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3">
              Technológia & Támogatás
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>MagyarAnime.hu integráció</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>OniAnime.hu integráció</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Google Firebase Auth & Firestore</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Chrome Manifest V3 szabvány</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                <span>Tailwind CSS & Cyber UI</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Links & GitHub */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-xs mb-3">
              Nyílt Forráskód
            </h4>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
            >
              <Github className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-bold text-xs">GitHub Repository</div>
                <div className="text-[10px] text-slate-400 font-mono">h1mfzap3-beep/anime</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 ml-auto" />
            </a>

            <a
              href={GITHUB_ZIP_URL}
              download
              className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="font-bold text-xs">Közvetlen Letöltés</div>
                <div className="text-[10px] text-cyan-400 font-mono">v{EXTENSION_VERSION} (main.zip)</div>
              </div>
            </a>
          </div>

        </div>

        {/* Bottom copyright & legal buttons */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300">Luna Anime Tracker</strong>. Nyílt forráskódú projekt MIT licenc alatt.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacy}
              className="hover:text-cyan-400 transition-colors"
            >
              Adatvédelmi Tájékoztató
            </button>
            <span>•</span>
            <button
              onClick={onOpenTerms}
              className="hover:text-cyan-400 transition-colors"
            >
              Általános Szerződési Feltételek
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
