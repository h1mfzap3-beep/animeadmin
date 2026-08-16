import React from 'react';
import { 
  Zap, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Layers, 
  Globe, 
  Sparkles,
  ExternalLink,
  Cpu,
  Lock
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      icon: Zap,
      title: 'Automatikus Epizód Detektálás',
      description: 'Amint elindítasz egy videót a MagyarAnime vagy OniAnime felületén, a Luna Chrome bővítmény automatikusan azonosítja az anime címét és az aktuális rész sorszámát.',
      tag: 'Manifest V3',
      color: 'cyan'
    },
    {
      icon: RefreshCw,
      title: 'Élő Firestore Szinkronizáció',
      description: 'A Google Cloud Firestore valós idejű WebSocket adatkapcsolatán (onSnapshot) keresztül minden eszközöd azonnal, késleltetés nélkül értesül az új részekről.',
      tag: 'Real-time sync',
      color: 'purple'
    },
    {
      icon: Database,
      title: 'Helyi & Felhő Kettős Tárolás',
      description: 'A böngésző local storage tárhelye biztosítja a villámgyors betöltést offline módban is, míg a felhő biztonsági másolatot készít a gyűjteményedről.',
      tag: 'Zero Data Loss',
      color: 'pink'
    },
    {
      icon: Globe,
      title: 'MagyarAnime & OniAnime Támogatás',
      description: 'Speciálisan a legnépszerűbb magyar anime streamelő portálok HTML5 és beágyazott videólejátszóihoz (Indavideo, Videa stb.) optimalizált DOM figyelő.',
      tag: 'Magyar Közösség',
      color: 'emerald'
    },
    {
      icon: Lock,
      title: 'Google Firebase Hitelesítés',
      description: 'Biztonságos Google Popup hitelesítés és szigorú adminisztrátori ellenőrzés védi a nyilvános adatbázist a jogosulatlan módosításoktól.',
      tag: 'RBAC Security',
      color: 'amber'
    },
    {
      icon: Cpu,
      title: 'Minimális Erőforrás-használat',
      description: 'Pehelysúlyú háttérfolyamat (Service Worker), amely nem lassítja a böngészőt, nem tartalmaz hirdetéseket és nem használ felesleges követőkódokat.',
      tag: '< 2MB RAM',
      color: 'cyan'
    }
  ];

  return (
    <section id="features" className="py-20 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>FŐBB KÉPESSÉGEK</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Minden, amire szükséged van az anime epizódjaid követéséhez
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Felejtsd el a kézi jegyzetelést és az elveszett részeket. A Luna automatizálja a folyamatot.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-white group-hover:bg-cyan-500 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Luna Engine</span>
                  <span className="text-cyan-400/60 group-hover:text-cyan-400 transition-colors">0{idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
