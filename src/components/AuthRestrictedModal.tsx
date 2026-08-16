import React from 'react';
import { ShieldAlert, Lock, ArrowRight, CheckCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_EMAIL } from '../firebase/config';

export const AuthRestrictedModal: React.FC = () => {
  const { unauthorizedEmail, clearUnauthorizedError, loginWithGoogle } = useAuth();

  if (!unauthorizedEmail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0e1b] border border-red-500/40 p-6 shadow-2xl text-slate-200 overflow-hidden">
        
        {/* Top glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Adminisztrátori Hozzáférés Korlátozva
            </h3>
            <span className="text-xs text-red-400 font-mono">
              Jogosultsági Ellenőrzés
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs text-slate-300 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
          <p>
            A megkísérelt bejelentkezési fiók: <strong className="text-white font-mono">{unauthorizedEmail}</strong>.
          </p>
          <p className="leading-relaxed">
            A <strong>Luna - Anime Tracker</strong> rendszerben a Főadmin jogosultság (új anime felvétele, adatbázis módosítása és törlése) szigorúan kizárólag a projekt tulajdonosának engedélyezett:
          </p>
          <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono text-center font-bold">
            {ADMIN_EMAIL}
          </div>
          <p className="text-slate-400 text-[11px]">
            A rendszer automatikusan kijelentkeztette a fiókot a biztonsági szabályzatnak megfelelően. A publikus funkciókat és az anime listát továbbra is korlátlanul böngészheted vendég módban!
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={clearUnauthorizedError}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors"
          >
            Rendben, Megértettem (Vendég Nézet)
          </button>
        </div>

      </div>
    </div>
  );
};
