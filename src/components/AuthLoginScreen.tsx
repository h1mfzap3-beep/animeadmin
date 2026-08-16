import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Radio
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthLoginScreen: React.FC = () => {
  const { loginWithGoogle, isLoggingIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#06060c] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Background Cyber Ambient Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(6,182,212,0.15),transparent_60%)] pointer-events-none"></div>
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      
      {/* Top Bar / Status */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center text-xl shadow-lg shadow-cyan-500/20">
            🌙
          </div>
          <div>
            <div className="font-display font-black text-white text-base tracking-wider flex items-center gap-2">
              <span>LUNA DASHBOARD</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                v2.5
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              <span>Google Cloud Firestore Adatbázis</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/[0.03] border border-white/10 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Biztonságos Google Hitelesítés</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">
        <div className="w-full max-w-md">
          
          {/* Main Login Card */}
          <div className="relative rounded-3xl bg-[#0b0c16]/90 border border-cyan-500/30 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-cyan-950/50 overflow-hidden text-center">
            
            {/* Top Glow Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500"></div>

            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>BEJELENTKEZÉS</span>
              </div>
              
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Luna Anime Dashboard
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                Lépj be a Google fiókoddal a személyes anime könyvtárad, statisztikáid és valós idejű szinkronizációid eléréséhez.
              </p>
            </div>

            {/* Sign In with Google Button */}
            <button
              onClick={() => loginWithGoogle()}
              disabled={isLoggingIn}
              id="google-signin-main-btn"
              className="w-full py-4 px-6 rounded-2xl font-display font-bold text-sm sm:text-base bg-white hover:bg-slate-100 text-[#07070d] flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Bejelentkezés folyamatban...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93z"
                    />
                  </svg>
                  <span>Bejelentkezés Google Fiókkal</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Help Footer */}
          <div className="text-center mt-6 text-xs text-slate-500 font-mono">
            <span>Luna Anime Tracker • Biztonságos felhő alapú adatbázis</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-slate-600 text-xs border-t border-white/5 z-10">
        © {new Date().getFullYear()} Luna Anime Dashboard
      </footer>

    </div>
  );
};

