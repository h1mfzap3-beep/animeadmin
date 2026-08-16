import React, { useState } from 'react';
import { 
  Download, 
  FolderArchive, 
  Chrome, 
  Sliders, 
  Upload, 
  Pin, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Sparkles,
  Info,
  Zap,
  Flame,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { GITHUB_ZIP_URL, GITHUB_REPO_URL, EXTENSION_VERSION } from '../firebase/config';
import { TAMPERMONKEY_USERSCRIPT_CODE } from '../data/tampermonkeyScript';

export const InstallGuide: React.FC = () => {
  const [installMethod, setInstallMethod] = useState<'tampermonkey' | 'chrome'>('tampermonkey');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const copyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyUserscript = () => {
    navigator.clipboard.writeText(TAMPERMONKEY_USERSCRIPT_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Triggers direct browser user.js download / Tampermonkey prompt
  const handleDirectUserscriptInstall = () => {
    window.location.href = '/Luna-Anime-Tracker.user.js';
  };

  const chromeSteps = [
    {
      number: '01',
      icon: Download,
      title: 'Bővítmény ZIP Letöltése',
      description: `Kattints a letöltés gombra a legfrissebb v${EXTENSION_VERSION} kiadás ZIP archívumának eléréséhez.`,
      action: (
        <a
          href={GITHUB_ZIP_URL}
          download
          id="guide-download-zip-btn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 transition-all"
        >
          <Download className="w-4 h-4 text-black" />
          <span>Luna-Anime-Tracker-main.zip</span>
        </a>
      )
    },
    {
      number: '02',
      icon: FolderArchive,
      title: 'ZIP Fájl Kicsomagolása',
      description: 'Nyisd meg a letöltött ZIP fájlt, és csomagold ki egy tetszőleges mappába (pl. Dokumentumok / Luna-Extension).',
      tip: 'Ügyelj rá, hogy a mappa tartalmazza a manifest.json fájlt!'
    },
    {
      number: '03',
      icon: Chrome,
      title: 'Nyisd meg a Bővítménykezelőt',
      description: 'Írd be vagy másold be a böngésző címsorába a bővítménykezelő URL-t:',
      action: (
        <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2 rounded-xl text-xs font-mono text-cyan-300">
          <span>chrome://extensions</span>
          <button
            onClick={copyChromeUrl}
            className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="Cím vágólapra másolása"
          >
            {copiedUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )
    },
    {
      number: '04',
      icon: Sliders,
      title: 'Fejlesztői Mód Bekapcsolása',
      description: 'A megnyíló bővítménykezelő oldal jobb felső sarkában kapcsold be a "Fejlesztői mód" (Developer mode) kapcsolót.',
      tip: 'Ez engedélyezi a helyi kiterjesztések futtatását.'
    },
    {
      number: '05',
      icon: Upload,
      title: 'Kicsomagolt Bővítmény Betöltése',
      description: 'Kattints a bal felső sarokban megjelenő "Kicsomagolt bővítmény betöltése" (Load unpacked) gombra, és válaszd ki a kicsomagolt mappát.',
      tip: 'A Luna ikon azonnal megjelenik a telepített kiegészítők között!'
    },
    {
      number: '06',
      icon: Pin,
      title: 'Rögzítés & Használat',
      description: 'Kattints a böngésző jobb felső részén található puzzle ikonra, és tűzd ki (Pin) a Luna Anime Tracker ikont a címsor mellé.',
      tip: 'Nyisd meg a MagyarAnime vagy OniAnime oldalt és indíts el egy videót!'
    }
  ];

  return (
    <section id="install" className="py-20 border-t border-white/10 relative cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-mono text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>EGYSZERŰ & GYORS BEÁLLÍTÁS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Telepítési Lehetőségek & Automatizáció
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Válaszd a számodra legkényelmesebb módszert: az <strong>1-kattintásos Tampermonkey szkriptet</strong> (nem igényel kicsomagolást) vagy a <strong>hagyományos Chrome bővítményt</strong>.
          </p>
        </div>

        {/* Method Switcher Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setInstallMethod('tampermonkey')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                installMethod === 'tampermonkey'
                  ? 'bg-gradient-to-r from-amber-500 to-cyan-500 text-black shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>⚡ Tampermonkey (1-Kattintásos Automata)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">AJÁNLOTT</span>
            </button>

            <button
              onClick={() => setInstallMethod('chrome')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                installMethod === 'chrome'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-black shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Chrome className="w-4 h-4" />
              <span>📦 Chrome Bővítmény (ZIP)</span>
            </button>
          </div>
        </div>

        {/* TAMPERMONKEY METHOD */}
        {installMethod === 'tampermonkey' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Highlight Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-cyan-950/40 to-black border border-amber-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <span>Miért a Tampermonkey a leggyorsabb?</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      0 kicsomagolás
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    A Chrome biztonsági okokból blokkolja, hogy egy weboldal automatikusan fájlokat másoljon a <code className="text-cyan-300">chrome://extensions</code> mappába. A <strong>Tampermonkey Userscript</strong> formátum viszont egyetlen kattintással települ, és közvetlenül a MagyarAnime és OniAnime oldalakon egy kényelmes lebegő cyberpunk anime widgetet jelenít meg!
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={handleDirectUserscriptInstall}
                  id="tampermonkey-install-btn"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-black" />
                  <span>1-Kattintásos Telepítés (.user.js)</span>
                </button>

                <button
                  onClick={copyUserscript}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {copiedScript ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScript ? 'Másolva!' : 'Kód Másolása'}</span>
                </button>
              </div>
            </div>

            {/* 3 Step Guide for Tampermonkey */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Chrome className="w-5 h-5" />
                    </div>
                    <span className="font-display text-2xl font-bold font-mono text-slate-600">01</span>
                  </div>
                  <h4 className="font-display font-bold text-white text-base mb-2">Tampermonkey Bővítmény</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Ha még nincs telepítve, add hozzá a Tampermonkey kiegészítőt a Chrome Webáruházból (ingyenes és nyílt forráskódú).
                  </p>
                </div>
                <a
                  href="https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs border border-white/10 transition-colors"
                >
                  <span>Tampermonkey a Webáruházban</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-cyan-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="font-display text-2xl font-bold font-mono text-cyan-500">02</span>
                  </div>
                  <h4 className="font-display font-bold text-white text-base mb-2">Szkript Telepítése</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Kattints a fenti <strong>"1-Kattintásos Telepítés"</strong> gombra. A Tampermonkey azonnal megnyitja a megerősítő lapot – kattints az <em>"Install / Telepítés"</em> gombra!
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono text-center">
                  ✓ Automatikus felismerés (.user.js)
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-display text-2xl font-bold font-mono text-slate-600">03</span>
                  </div>
                  <h4 className="font-display font-bold text-white text-base mb-2">Azonnali Használat</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Nyisd meg a MagyarAnime vagy OniAnime oldalt! A jobb alsó sarokban automatikusan megjelenik a <strong>🌙 Luna Lebegő Widget</strong>, amely rögzíti az aktuális részt és lehetőséget ad a gyors +1 léptetésre.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono text-center">
                  ✓ Kész, azonnal aktív!
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CHROME UNPACKED METHOD */}
        {installMethod === 'chrome' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {chromeSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative rounded-2xl p-6 bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-display text-2xl font-bold font-mono text-slate-600">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-bold text-white mb-2">
                      {step.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    {step.action && (
                      <div className="mb-4">
                        {step.action}
                      </div>
                    )}
                  </div>

                  {step.tip && (
                    <div className="pt-3 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-slate-400">
                      <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-purple-950/30 to-black border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white">Érdekel a forráskód felépítése?</div>
              <div className="text-xs text-slate-400">Nézd meg a Manifest V3 és a Tampermonkey userscript forráskódját az alábbi kódnézegetőben.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
