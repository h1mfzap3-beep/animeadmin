import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#090a14] border border-cyan-500/30 p-6 shadow-2xl text-slate-200 overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-lg text-white">Adatvédelmi Tájékoztató (Privacy Policy)</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <p><strong>Utolsó frissítés:</strong> 2026. augusztus</p>

            <h4 className="font-bold text-white text-sm">1. Milyen adatokat kezelünk?</h4>
            <p>
              A <strong>Luna - Anime Tracker</strong> kizárólag a követett animék címét, az aktuális és megtekintett epizódok számát, a forrásoldalt (MagyarAnime, OniAnime) és a frissítések időpontját tárolja a Google Cloud Firestore adatbázisban és a böngésződ helyi tárhelyén (chrome.storage.local).
            </p>

            <h4 className="font-bold text-white text-sm">2. Személyes adatok és harmadik felek</h4>
            <p>
              Nem gyűjtünk és nem továbbítunk semmilyen személyes azonosításra alkalmas adatot (PII), jelszavakat, bankkártya információkat vagy böngészési előzményeket. A bővítmény kizárólag a támogatott weboldalakon futtatja a tartalom szkriptet az aktív videólejátszó állapotának felmérésére.
            </p>

            <h4 className="font-bold text-white text-sm">3. Firebase Hitelesítés</h4>
            <p>
              Az adminisztrációs felület a Google Firebase Auth szolgáltatását használja a Főadmin (h1mfzap3@gmail.com) azonosítására. Vendég felhasználóktól semmilyen hitelesítési adat nem kerül rögzítésre.
            </p>

            <h4 className="font-bold text-white text-sm">4. Kapcsolat</h4>
            <p>
              Adatvédelmi kérdésekben a hivatalos GitHub repository-n keresztül nyithatsz Issue jegyet: <a href="https://github.com/h1mfzap3-beep/anime" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">github.com/h1mfzap3-beep/anime</a>.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};
