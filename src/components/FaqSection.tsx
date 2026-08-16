import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Lehet-e Tampermonkey-val automatizálni a telepítést?',
      answer: 'Igen! Magát a ZIP fájl kicsomagolását a Chrome biztonsági védelme nem engedi automatikusan a háttérben telepíteni, DE készítettünk egy 1-kattintásos Tampermonkey / Violentmonkey Userscriptet (Luna-Tracker.user.js). Ha a Telepítési Útmutatóban a "⚡ Tampermonkey" gombra kattintasz, a böngésződ azonnal felugró ablakban felajánlja a szkript egykattintásos aktiválását – nem kell ZIP-et kicsomagolnod és nincs szükség Fejlesztői Módra sem!'
    },
    {
      question: 'Hogyan ismeri fel a bővítmény a MagyarAnime és OniAnime lejátszókat?',
      answer: 'A Luna Chrome bővítmény egy kifejezetten a magyar anime portálok DOM struktúrájához kifejlesztett tartalom szkriptet (Content Script) használ. Amint elindítasz egy epizódot, a kód beolvassa az anime címét, a videó lejátszó típusát (Indavideo, Videa, közvetlen HTML5) és az URL-ből vagy a fejlécből kinyeri az epizód pontos sorszámát.'
    },
    {
      question: 'Szükséges-e fiókot regisztrálnom a használathoz?',
      answer: 'Nem! A webalkalmazás nyilvános bemutató és követési felülete minden látogató számára szabadon elérhető. A felhő adatbázis tartalmának módosítása, anime hozzáadása és törlése kizárólag a projekt tulajdonosának (h1mfzap3@gmail.com) fenntartott Főadmin funkció, amely Google Firebase Authenticationnel van védve.'
    },
    {
      question: 'Milyen böngészőkkel kompatibilis a Luna Anime Tracker?',
      answer: 'A bővítmény a legújabb Manifest V3 szabványra épül, így 100%-ban kompatibilis minden modern Chromium alapú böngészővel, beleértve: Google Chrome, Microsoft Edge, Brave Browser, Opera, Arc Browser és Vivaldi.'
    },
    {
      question: 'Tartalmaz-e a bővítmény reklámokat vagy követőket?',
      answer: 'Egyáltalán nem. A Luna Anime Tracker 100%-ban nyílt forráskódú (MIT licenc), nulla hirdetést, nulla marketing analitikát és semmilyen felesleges háttérfolyamatot nem tartalmaz. A kódját a fenti "Forráskód" fülön vagy a hivatalos GitHub repository-ban bármikor ellenőrizheted.'
    },
    {
      question: 'Hogyan frissíthetem a bővítményt, ha új verzió jelenik meg?',
      answer: 'Töltsd le újra a legfrissebb ZIP archívumot a GitHubról, csomagold ki a meglévő mappa helyére, majd a böngésző chrome://extensions oldalán kattints a frissítés (Refresh) ikonra.'
    }
  ];

  return (
    <section id="faq" className="py-20 border-t border-white/10 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-mono text-purple-300">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>GYAKRAN ISMÉTELT KÉRDÉSEK</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Minden, amit a Luna projektről tudni érdemes
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Válaszok a leggyakoribb kérdésekre a működéssel, biztonsággal és telepítéssel kapcsolatban.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="font-display font-semibold text-sm sm:text-base text-white">
                    {faq.question}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-300 border-t border-white/5 leading-relaxed bg-black/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
