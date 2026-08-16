import React, { useState, useEffect } from 'react';
import { 
  CustomMonitoredSite 
} from '../types';
import {
  getMonitoredSites,
  addCustomMonitoredSite,
  toggleSiteEnabled,
  deleteCustomSite,
  DEFAULT_MONITORED_SITES
} from '../services/customSitesService';
import { TAMPERMONKEY_USERSCRIPT_CODE } from '../data/tampermonkeyScript';
import { 
  Globe, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Sliders, 
  Code2, 
  Sparkles, 
  Search, 
  Play, 
  AlertCircle,
  HelpCircle,
  Eye,
  Settings2
} from 'lucide-react';

export const MonitoredSitesManager: React.FC = () => {
  const [sites, setSites] = useState<CustomMonitoredSite[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sites' | 'script' | 'tester'>('sites');

  // Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [urlPattern, setUrlPattern] = useState('');
  const [titleSelector, setTitleSelector] = useState('');
  const [episodeSelector, setEpisodeSelector] = useState('');
  const [badgeColor, setBadgeColor] = useState('#06b6d4');
  const [notes, setNotes] = useState('');

  // Tester State
  const [testUrl, setTestUrl] = useState('https://magyaranime.eu/anime/naruto-shippuuden-15-resz');
  const [testTitle, setTestTitle] = useState('Naruto Shippuuden 15. Rész Magyar Felirattal');
  const [testResult, setTestResult] = useState<{ matchedSite?: string; parsedTitle: string; parsedEpisode: number } | null>(null);

  useEffect(() => {
    setSites(getMonitoredSites());
  }, []);

  const handleToggle = (id: string, current: boolean) => {
    const updated = toggleSiteEnabled(id, !current);
    setSites(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Biztosan törölni szeretnéd ezt a megfigyelt oldalt?')) {
      const updated = deleteCustomSite(id);
      setSites(updated);
    }
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;

    let pattern = urlPattern.trim();
    if (!pattern) {
      pattern = `*://*.${domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')}/*`;
    }

    const updated = addCustomMonitoredSite({
      name: name.trim(),
      domain: domain.trim(),
      urlPattern: pattern,
      titleSelector: titleSelector.trim() || undefined,
      episodeSelector: episodeSelector.trim() || undefined,
      badgeColor,
      notes: notes.trim() || undefined,
      enabled: true
    });

    setSites(updated);
    setIsAddModalOpen(false);
    // Reset form
    setName('');
    setDomain('');
    setUrlPattern('');
    setTitleSelector('');
    setEpisodeSelector('');
    setNotes('');
  };

  const userscriptCode = TAMPERMONKEY_USERSCRIPT_CODE;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userscriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadUserscript = () => {
    const blob = new Blob([userscriptCode], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Luna-Anime-Tracker.user.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick live test simulator
  const runTester = () => {
    let matchedName = 'Egyéb / Általános Felismerő';
    for (const site of sites) {
      if (site.domain.split(',').some(d => testUrl.toLowerCase().includes(d.trim().toLowerCase()))) {
        matchedName = site.name;
        break;
      }
    }

    // Clean title
    let clean = testTitle
      .replace(/(\d+)[\.\s_-]*(rész|resz|ep|episode|fejezet).*/i, '')
      .replace(/magyar felirattal.*/i, '')
      .replace(/magyar szinkronnal.*/i, '')
      .replace(/online.*/i, '')
      .trim();

    // Parse ep
    const epMatch = (testTitle + ' ' + testUrl).match(/(?:rész|resz|ep|episode)[\.\s_:-]*(\d+)/i)
      || (testTitle + ' ' + testUrl).match(/(\d+)[\.\s_:-]*(?:rész|resz|ep|episode)/i)
      || testUrl.match(/-(\d+)-resz/i)
      || testUrl.match(/resz-(\d+)/i);

    const episode = epMatch && epMatch[1] ? parseInt(epMatch[1], 10) : 1;

    setTestResult({
      matchedSite: matchedName,
      parsedTitle: clean || testTitle,
      parsedEpisode: isNaN(episode) ? 1 : episode
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-950/50 via-purple-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Dinamikus Megfigyelő Rendszer
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {sites.filter(s => s.enabled).length} Aktív Oldal
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              Figyelt Anime Oldalak & Tampermonkey Motor
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Közvetlen automatikus felismerés OniAnime, MagyarAnime (.eu/.hu), AnimeDrive, UraharaShop, Naruto-Kun, MutekiFansub és általad hozzáadott egyéni portálokhoz.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Új Oldal Hozzáadása
            </button>
            <button
              onClick={handleDownloadUserscript}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Szkript Letöltése (.user.js)
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sites'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            Oldalak Listája ({sites.length})
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'script'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Generált Userscript Kód
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tester'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className="w-4 h-4" />
            Felismerő Szimulátor & Teszt
          </button>
        </div>
      </div>

      {/* TAB 1: SITES LIST */}
      {activeTab === 'sites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className={`p-5 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-sm ${
                site.enabled
                  ? 'bg-slate-900/80 border-slate-700/70 hover:border-cyan-500/40 shadow-lg shadow-black/40'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: site.badgeColor || '#06b6d4', boxShadow: `0 0 10px ${site.badgeColor || '#06b6d4'}` }}
                  />
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {site.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      {site.domain}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggle(site.id, site.enabled)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      site.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    title={site.enabled ? 'Megfigyelés aktív' : 'Megfigyelés kikapcsolva'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        site.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  {!site.isBuiltIn && (
                    <button
                      onClick={() => handleDelete(site.id)}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Egyéni oldal törlése"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {site.notes && (
                <p className="text-xs text-slate-300 mb-3 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/40">
                  {site.notes}
                </p>
              )}

              <div className="space-y-1.5 text-xs font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Minta:</span>
                  <span className="text-cyan-400 truncate max-w-[170px]" title={site.urlPattern}>
                    {site.urlPattern}
                  </span>
                </div>
                {site.titleSelector && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cím Szelektor:</span>
                    <span className="text-purple-400 truncate max-w-[170px]" title={site.titleSelector}>
                      {site.titleSelector}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-500">Típus:</span>
                  <span className={site.isBuiltIn ? 'text-amber-400' : 'text-emerald-400'}>
                    {site.isBuiltIn ? 'Beépített Szabály' : 'Egyéni Hozzáadott'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: GENERATED USERSCRIPT */}
      {activeTab === 'script' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                Kanonikus Luna Userscript (v6.0.0)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ez ugyanaz a kanonikus szkript, amit minden letöltési ponton (Dashboard, Telepítési útmutató) kapsz — megbízható sor-alapú felhőszinkronizációval. Az egyéni oldalaidat a szkript menüparancsával adhatod hozzá közvetlenül a böngészőben.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {isCopied ? 'Másolva a Vágólapra!' : 'Kód Másolása'}
              </button>
              <button
                onClick={handleDownloadUserscript}
                className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Letöltés (.user.js)
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-96 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
            <pre>{userscriptCode}</pre>
          </div>

          <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block mb-1">Hogyan telepítheted 10 másodperc alatt?</span>
              1. Nyisd meg a böngésződben a <strong>Tampermonkey</strong> kiegészítőt.<br />
              2. Kattints az <strong>Új szkript hozzáadása (+)</strong> lehetőségre.<br />
              3. Másold be a fenti kódot, majd nyomd meg a <strong>Mentés (Ctrl+S)</strong> gombot.<br />
              4. Amikor megnyitsz bármelyik támogatott anime oldalt, a jobb alsó sarokban automatikusan megjelenik a lebegő Luna panel!
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TESTER */}
      {activeTab === 'tester' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Felismerő Szabály Tesztelő
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Teszteld le, hogyan ismeri fel a Tampermonkey script a különböző URL-eket és anime címeket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Teszt URL Cím:
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://onianime.hu/anime/bleach-tybw-2-resz"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Teszt Oldalcím / H1 Elem:
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Bleach TYBW 2. Rész Magyar Felirattal"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={runTester}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Felismerés Szimulálása
          </button>

          {testResult && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Check className="w-4 h-4" />
                Sikeres Elemzés és Felismerés!
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Azonosított Forrás:</span>
                  <span className="font-bold text-cyan-400 text-sm">{testResult.matchedSite}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Tisztított Anime Cím:</span>
                  <span className="font-bold text-white text-sm">{testResult.parsedTitle}</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Kivont Epizódszám:</span>
                  <span className="font-bold text-amber-400 text-sm">{testResult.parsedEpisode}. Epizód</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOM SITE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-t-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Új Oldal Hozzáadása</h3>
                  <p className="text-xs text-slate-400">Add meg az anime stream weboldal adatait</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Oldal Neve *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pl. DragonBall.hu vagy AnimeGun"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Domain Cím *
                </label>
                <input
                  type="text"
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="dragonball.hu (vesszővel elválasztva több is)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Cím CSS Szelektor (Opcionális)
                </label>
                <input
                  type="text"
                  value={titleSelector}
                  onChange={(e) => setTitleSelector(e.target.value)}
                  placeholder="Pl. h1.anime-title, .video-header h1"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Epizód Szelektor vagy Megjegyzés (Opcionális)
                </label>
                <input
                  type="text"
                  value={episodeSelector}
                  onChange={(e) => setEpisodeSelector(e.target.value)}
                  placeholder="Pl. .epizod-valaszto option:checked"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  Jelvény Színe
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-10 h-10 rounded-xl bg-transparent border border-slate-700 cursor-pointer p-0.5"
                  />
                  <span className="text-xs text-slate-400 font-mono">{badgeColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white font-medium text-xs cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  Oldal Mentése & Szkript Frissítése
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
