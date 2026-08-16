import React from 'react';
import { FileText, X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#090a14] border border-cyan-500/30 p-6 shadow-2xl text-slate-200 overflow-y-auto flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display font-bold text-lg text-white">Általános Szerződési Feltételek (ÁSZF)</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
            <p><strong>Hatályos:</strong> 2026. augusztus</p>

            <h4 className="font-bold text-white text-sm">1. A szolgáltatás célja</h4>
            <p>
              A <strong>Luna - Anime Tracker</strong> egy nyílt forráskódú segédeszköz és webalkalmazás, amely a felhasználó által megtekintett anime epizódok számlálásának és követésének megkönnyítését szolgálja.
            </p>

            <h4 className="font-bold text-white text-sm">2. Szerzői jogok és harmadik felek tartalmai</h4>
            <p>
              A Luna alkalmazás és böngészőbővítmény nem tárol, nem sugároz és nem terjeszt videó fájlokat vagy szerzői jog által védett médiaanyagokat. A megjelenített címek és forrásoldal linkek kizárólag a felhasználó személyes kényelmét és az epizódok nyomon követését segítik.
            </p>

            <h4 className="font-bold text-white text-sm">3. Felelősségkizárás</h4>
            <p>
              A szoftver "ahogy van" (as is) alapon kerül közzétételre MIT licenc alatt. A fejlesztők nem vállalnak felelősséget a külső harmadik fél streamelő weboldalak (MagyarAnime, OniAnime stb.) struktúraváltásaiból vagy leállásaiból eredő esetleges működési hibákért.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
          >
            Elfogadom
          </button>
        </div>
      </div>
    </div>
  );
};
