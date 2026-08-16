import React, { useState } from 'react';
import { 
  Zap, 
  Download, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Chrome, 
  Flame, 
  ShieldCheck, 
  Sliders, 
  Upload, 
  Play, 
  Sparkles,
  Info,
  ArrowRight,
  Radio,
  FileCode2,
  Check,
  MonitorPlay
} from 'lucide-react';
import { GITHUB_ZIP_URL, GITHUB_REPO_URL, EXTENSION_VERSION } from '../firebase/config';
import { TAMPERMONKEY_USERSCRIPT_CODE } from '../data/tampermonkeyScript';

interface DashboardIntegrationsProps {
  onNavigateTab?: (tab: any) => void;
}

export const DashboardIntegrations: React.FC<DashboardIntegrationsProps> = ({ onNavigateTab }) => {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [installSuccessToast, setInstallSuccessToast] = useState(false);

  const copyUserscript = () => {
    navigator.clipboard.writeText(TAMPERMONKEY_USERSCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Automatic 1-click Tampermonkey Install Handler
  const handleAutoInstallTampermonkey = () => {
    // 1. Trigger navigation to .user.js which Tampermonkey intercepts automatically
    const userscriptUrl = window.location.origin + '/Luna-Anime-Tracker.user.js';
    window.open(userscriptUrl, '_blank');

    // 2. Also copy to clipboard as seamless backup
    navigator.clipboard.writeText(TAMPERMONKEY_USERSCRIPT_CODE);

    // 3. Show instant visual confirmation
    setInstallSuccessToast(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner with 1-Click Auto Install */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/50 via-cyan-950/40 to-black border border-amber-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-start gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/30 shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#090a14] flex items-center justify-center text-amber-400">
              <Zap className="w-7 h-7 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Automatikus Tampermonkey Telepítés
              </h3>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                1-Kattintásos Auto-Hook
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Csak kattints az alábbi gombra! A böngésződben futó <strong>Tampermonkey</strong> automatikusan elkapja a szkriptet, és megnyitja a beépített <strong>Telepítés (Install)</strong> ablakot.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto z-10">
          <a
            href="/Luna-Anime-Tracker.user.js"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAutoInstallTampermonkey}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Automatikus Telepítés a Tampermonkey-ba</span>
          </a>

          <button
            onClick={copyUserscript}
            className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-white/10"
          >
            {copiedScript ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedScript ? 'Kód Másolva!' : 'Kód Másolása'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification Box when clicked */}
      {installSuccessToast && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-500/40 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>A Tampermonkey telepítő megnyílt az új lapon!</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Kattints az újonnan megnyílt böngészőlapon a Tampermonkey fekete/szürke <strong>"Telepítés" (Install)</strong> gombjára a jóváhagyáshoz! A vágólapodra is bemásoltuk a forráskódot.
              </p>
            </div>
          </div>
          <button
            onClick={() => setInstallSuccessToast(false)}
            className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-white/5"
          >
            Értem ✕
          </button>
        </div>
      )}

      {/* Interactive Visual Guide: How Tampermonkey Works on Anime Sites */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#090a14] border border-cyan-500/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>SZEMLÉLTETŐ ÚTMUTATÓ & SZIMULÁTOR</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
              Hogyan működik a Tampermonkey, miután feltelepítetted?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Nincs szükség semmilyen kézi beállításra! Így néz ki a működése a támogatott anime oldalakon:
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/[0.03] border border-white/5 text-xs font-mono text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Támogatott: MagyarAnime • OniAnime • Indavideo</span>
          </div>
        </div>

        {/* 3 Step Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center border border-cyan-500/30">
                1
              </div>
              <div className="font-bold text-white text-xs">Nyiss meg egy Anime részt</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Menj el a <strong className="text-cyan-300">MagyarAnime.hu</strong> vagy <strong className="text-cyan-300">OniAnime.hu</strong> weboldalra, és indíts el egy tetszőleges videót vagy epizódot.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold font-mono text-xs flex items-center justify-center border border-amber-500/30">
                2
              </div>
              <div className="font-bold text-white text-xs">Megjelenik a Lebegő Panel</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A videólejátszó alatt / a képernyő jobb alsó sarkában azonnal feltűnik a diszkrét, sötétkék <strong className="text-amber-300">🌙 Luna Tracker widget</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold font-mono text-xs flex items-center justify-center border border-emerald-500/30">
                3
              </div>
              <div className="font-bold text-white text-xs">Automatikus Szinkronizáció</div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Amikor megnézed a részt, a widget automatikusan frissíti a haladásodat a Luna adatbázisodban. Nem kell ide visszajönnöd beírni!
            </p>
          </div>

        </div>

        {/* Live Visual Widget Mockup */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c0d1c] to-[#060710] border border-cyan-500/20 relative overflow-hidden">
          <div className="text-xs font-mono text-slate-400 mb-3 flex items-center justify-between">
            <span>ÍGY JELENIK MEG A LEBEGŐ WIDGET AZ ANIME OLDALAKON:</span>
            <span className="text-[10px] text-cyan-400">Élő minta</span>
          </div>

          {/* Sample Floating Widget Card */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#0a0b16]/95 border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌙</span>
                <span className="font-bold text-xs text-white tracking-wider">LUNA TRACKER</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                MagyarAnime Live
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/50 border border-cyan-500/30 overflow-hidden flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-white truncate">Solo Leveling Season 2</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span className="text-amber-400 font-bold">19. Rész</span>
                  <span>•</span>
                  <span className="text-emerald-400">Észlelve & Szinkronizálva</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => alert('Ez a gomb az anime oldalon növeli a megnézett részek számát!')}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] cursor-pointer"
                >
                  +1 Rész
                </button>
              </div>
            </div>
          </div>

          {/* Direct Link to Virtual Script Simulator */}
          {onNavigateTab && (
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => onNavigateTab('virtualpanel')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
              >
                <MonitorPlay className="w-4 h-4" />
                <span>Interaktív Virtuális Panel & Lejátszó Szimulátor Megnyitása</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 2 Main Integration Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Option 1: Tampermonkey Auto-Sync */}
        <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">Tampermonkey Automata Módszer</h4>
                  <div className="text-[11px] text-slate-400 font-mono">Leggyorsabb & legstabilabb megoldás</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                Ajánlott
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-mono font-bold flex items-center justify-center text-[10px]">1</span>
                    Tampermonkey megléte a böngésződben
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Ha még nincs feltelepítve a Tampermonkey kiegészítő, add hozzá a Chrome / Brave / Edge böngésződhöz:
                </p>
                <div className="pl-7 pt-1">
                  <a
                    href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30"
                  >
                    <Chrome className="w-3.5 h-3.5" />
                    <span>Tampermonkey Telepítése a Chrome Webáruházból</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-black font-mono font-bold flex items-center justify-center text-[10px]">2</span>
                    Automatikus hozzáadás 1 kattintással
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Kattints az alábbi közvetlen .user.js gombra. A Tampermonkey azonnal felismeri a szkriptet és felajánlja a telepítést:
                </p>
                <div className="pl-7 pt-1 flex flex-wrap gap-2">
                  <a
                    href="/Luna-Anime-Tracker.user.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAutoInstallTampermonkey}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Telepítés (.user.js megnyitása)</span>
                  </a>
                  
                  <a
                    href="https://raw.githubusercontent.com/h1mfzap3-beep/anime/main/Luna-Anime-Tracker.user.js"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-mono text-[11px] transition-all"
                  >
                    <span>GitHub Raw Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-400 text-black font-mono font-bold flex items-center justify-center text-[10px]">3</span>
                    Kész! Indíts el egy animét
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Nyiss meg egy részt a <strong>MagyarAnime.hu</strong> vagy <strong>OniAnime.hu</strong> oldalon. A jobb alsó sarokban megjelenik a lebegő Luna panel, és valós időben szinkronizál!
                </p>
              </div>

            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 font-mono flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Tipp: A szkript a böngésződ beépített BroadcastChannel csatornáján keresztül automatikusan küldi a megtekintési adatokat a webes felületnek.</span>
          </div>
        </div>

        {/* Option 2: Chrome Unpacked ZIP Extension */}
        <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Chrome className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base">Chrome Bővítmény (ZIP)</h4>
                  <div className="text-[11px] text-slate-400 font-mono">Önálló Manifest V3 bővítmény</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                v{EXTENSION_VERSION}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-mono font-bold flex items-center justify-center text-[10px]">1</span>
                    Forrásfájlok letöltése (ZIP)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Töltsd le a bővítmény forrásarchívumát, majd csomagold ki egy tetszőleges mappába a gépeden.
                </p>
                <div className="pl-7 pt-1">
                  <a
                    href={GITHUB_ZIP_URL}
                    download
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black font-bold text-[11px] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Luna-Anime-Tracker-Extension.zip Letöltése</span>
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-mono font-bold flex items-center justify-center text-[10px]">2</span>
                    chrome://extensions megnyitása
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Másold ki az útvonalat és illeszd be egy új lap címsorába a bővítménykezelőhöz:
                </p>
                <div className="pl-7 pt-1 flex items-center gap-2">
                  <code className="bg-black/60 px-2.5 py-1 rounded-lg text-cyan-300 font-mono text-[11px] border border-white/10">chrome://extensions</code>
                  <button
                    onClick={copyChromeUrl}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                    title="Cím másolása"
                  >
                    {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <div className="font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-400 text-black font-mono font-bold flex items-center justify-center text-[10px]">3</span>
                    Kicsomagolt bővítmény betöltése
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7">
                  Kapcsold be a <strong>Fejlesztői mód</strong> kapcsolót a jobb felső sarokban, majd kattints a <strong>"Kicsomagolt bővítmény betöltése"</strong> gombra és válaszd ki a mappát!
                </p>
              </div>

            </div>
          </div>

          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300/90 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>A bővítmény 100%-ban nyílt forráskódú, biztonságos és nem gyűjt személyes adatokat.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
