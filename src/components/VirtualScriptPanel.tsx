import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Radio, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  Tv, 
  Globe, 
  Copy, 
  ArrowRight, 
  ExternalLink, 
  Flame, 
  Plus, 
  Minus, 
  Sliders, 
  Send, 
  Layers, 
  Eye, 
  Check, 
  X,
  Edit2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { syncRealtimeAnimeTrack } from '../services/firestoreService';
import { getMonitoredSites } from '../services/customSitesService';
import { CustomMonitoredSite } from '../types';

interface PresetSite {
  id: string;
  name: string;
  domain: string;
  sampleUrl: string;
  sampleTitle: string;
  sampleEp: number;
  totalEp: number;
  badgeColor: string;
  coverImage: string;
}

const PRESET_SITES: PresetSite[] = [
  {
    id: 'magyaranime',
    name: 'MagyarAnime.eu',
    domain: 'magyaranime.eu',
    sampleUrl: 'https://magyaranime.eu/solo-leveling-season-2-19-resz',
    sampleTitle: 'Solo Leveling Season 2: Arise',
    sampleEp: 19,
    totalEp: 24,
    badgeColor: '#06b6d4',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'onianime',
    name: 'OniAnime.hu',
    domain: 'onianime.hu',
    sampleUrl: 'https://onianime.hu/anime/jujutsu-kaisen-3-resz-8',
    sampleTitle: 'Jujutsu Kaisen Season 3: The Culling Game',
    sampleEp: 8,
    totalEp: 24,
    badgeColor: '#a855f7',
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'animedrive',
    name: 'AnimeDrive.hu',
    domain: 'animedrive.hu',
    sampleUrl: 'https://animedrive.hu/nez/chainsaw-man-movie-1-resz',
    sampleTitle: 'Chainsaw Man: Reze Arc',
    sampleEp: 1,
    totalEp: 1,
    badgeColor: '#3b82f6',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'uraharashop',
    name: 'UraharaShop.hu',
    domain: 'uraharashop.hu',
    sampleUrl: 'https://uraharashop.hu/bleach-tybw-part-3-resz-14',
    sampleTitle: 'Bleach: Thousand-Year Blood War Part 3',
    sampleEp: 14,
    totalEp: 26,
    badgeColor: '#f59e0b',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'narutokun',
    name: 'Naruto-Kun.hu',
    domain: 'naruto-kun.hu',
    sampleUrl: 'https://www.naruto-kun.hu/boruto-two-blue-vortex-resz-5',
    sampleTitle: 'Boruto: Two Blue Vortex',
    sampleEp: 5,
    totalEp: 20,
    badgeColor: '#ef4444',
    coverImage: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=400&q=80'
  }
];

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'event';
  message: string;
}

export const VirtualScriptPanel: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetSite>(PRESET_SITES[0]);
  const [currentUrl, setCurrentUrl] = useState<string>(PRESET_SITES[0].sampleUrl);
  const [currentTitle, setCurrentTitle] = useState<string>(PRESET_SITES[0].sampleTitle);
  const [currentEpisode, setCurrentEpisode] = useState<number>(PRESET_SITES[0].sampleEp);
  const [currentStatus, setCurrentStatus] = useState<string>('watching');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(35); // percentage
  const [isWidgetCollapsed, setIsWidgetCollapsed] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncSuccess, setLastSyncSuccess] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Parser Lab State
  const [testInputString, setTestInputString] = useState<string>('Solo Leveling Season 2 19. rész online magyar felirattal Indavideo');
  const [parsedResult, setParsedResult] = useState<{ title: string; episode: number }>({ title: '', episode: 1 });

  // Floating global test overlay on page
  const [isGlobalOverlayActive, setIsGlobalOverlayActive] = useState<boolean>(false);

  const videoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (type: 'info' | 'success' | 'warn' | 'event', message: string) => {
    const time = new Date().toLocaleTimeString('hu-HU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [
      { id: Math.random().toString(), timestamp: time, type, message },
      ...prev.slice(0, 40)
    ]);
  };

  useEffect(() => {
    addLog('info', 'Virtuális Szkript Panel inicializálva.');
    addLog('event', `Aktív szimulált oldal: ${selectedPreset.name} (${selectedPreset.domain})`);
    runParserTest(testInputString);
  }, []);

  // Update when preset changes
  const handleSelectPreset = (preset: PresetSite) => {
    setSelectedPreset(preset);
    setCurrentUrl(preset.sampleUrl);
    setCurrentTitle(preset.sampleTitle);
    setCurrentEpisode(preset.sampleEp);
    setVideoProgress(15);
    setIsPlaying(false);
    addLog('event', `Váltás oldalra: ${preset.name} -> URL: ${preset.sampleUrl}`);
    addLog('info', `[PARSER] Cím kinyerve: "${preset.sampleTitle}", Epizód: ${preset.sampleEp}`);
  };

  // Video playback simulation
  useEffect(() => {
    if (isPlaying) {
      addLog('info', `[PLAYER] Videó lejátszás elindult: ${currentTitle} - ${currentEpisode}. rész`);
      videoIntervalRef.current = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            addLog('success', `[PLAYER] Epizód véget ért (100%). Következő rész kész.`);
            return 100;
          }
          return prev + 1;
        });
      }, 800);
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isPlaying, currentTitle, currentEpisode]);

  // Episode Change
  const handleEpisodeChange = (delta: number) => {
    const newEp = Math.max(1, currentEpisode + delta);
    setCurrentEpisode(newEp);
    addLog('event', `[HUD] Epizód módosítva: ${currentEpisode} -> ${newEp}`);
    triggerRealtimeBroadcast(currentTitle, newEp, selectedPreset.name, currentUrl);
  };

  // Direct manual title edit
  const handleEditTitle = () => {
    const promptVal = prompt('Anime Cím módosítása a virtuális HUD-on:', currentTitle);
    if (promptVal && promptVal.trim()) {
      setCurrentTitle(promptVal.trim());
      addLog('event', `[HUD] Cím kézileg átírva: "${promptVal.trim()}"`);
      triggerRealtimeBroadcast(promptVal.trim(), currentEpisode, selectedPreset.name, currentUrl);
    }
  };

  // Trigger Real-time broadcast and Firestore sync
  const triggerRealtimeBroadcast = async (title: string, episode: number, source: string, url: string, status: string = currentStatus) => {
    setIsSyncing(true);
    addLog('info', `[BROADCAST] Küldés: BroadcastChannel("luna_anime_realtime_channel") & localStorage (Állapot: ${status})...`);

    const payload = {
      type: 'LUNA_ANIME_PROGRESS',
      anime: {
        title,
        episode,
        source,
        sourceUrl: url,
        status,
        badgeColor: selectedPreset.badgeColor,
        totalEpisodes: selectedPreset.totalEp
      },
      timestamp: Date.now(),
      origin: 'https://' + selectedPreset.domain
    };

    // 1. BroadcastChannel
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('luna_anime_realtime_channel');
        bc.postMessage(payload);
        bc.close();
      }
    } catch (e) {}

    // 2. localStorage event
    try {
      localStorage.setItem('luna_realtime_anime_sync', JSON.stringify(payload));
    } catch (e) {}

    // 3. Firestore Push
    try {
      await syncRealtimeAnimeTrack({
        title,
        episode,
        totalEpisodes: selectedPreset.totalEp,
        source,
        sourceUrl: url,
        status,
        coverImage: selectedPreset.coverImage
      });
      addLog('success', `[FIRESTORE] Adatbázis azonnal frissítve: "${title}" -> ${episode}. rész (${status}) ✓`);
      setLastSyncSuccess(true);
      try {
        confetti({ particleCount: 20, spread: 35, origin: { y: 0.7 } });
      } catch (e) {}
    } catch (err: any) {
      addLog('warn', `[FIRESTORE NOTE] ${err?.message || 'Szinkronizálva helyi csatornán'}`);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setLastSyncSuccess(false);
      }, 1500);
    }
  };

  // Parser Lab extraction logic
  const runParserTest = (input: string) => {
    setTestInputString(input);
    let clean = input
      .replace(/(\d+)[.\s_-]*(rész|resz|ep|episode|fejezet|évad|evad).*/i, '')
      .replace(/magyar felirattal.*/i, '')
      .replace(/magyar szinkronnal.*/i, '')
      .replace(/online magyarul.*/i, '')
      .replace(/online anime.*/i, '')
      .replace(/anime indavideo.*/i, '')
      .replace(/videa.*/i, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\((?:magyar|felirat|1080p|720p).*?\)/gi, '')
      .replace(/\|\s*(?:MagyarAnime|OniAnime|AnimeDrive|UraharaShop|Indavideo|Videa).*/i, '')
      .trim();

    let ep = 1;
    const epMatch = input.match(/(?:rész|resz|ep|episode|epizod)[.\s_:-]*(\d+)/i) ||
                    input.match(/(\d+)[.\s_:-]*(?:rész|resz|ep|episode|epizod)/i) ||
                    input.match(/(\d+)\.\s*rész/i);
    if (epMatch && epMatch[1]) {
      ep = parseInt(epMatch[1], 10);
    }

    setParsedResult({
      title: clean || input,
      episode: isNaN(ep) ? 1 : ep
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-cyan-950/40 to-black border border-purple-500/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-xs font-mono text-purple-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>INTERAKTÍV SZIMULÁTOR & ÉLŐ FEJLESZTŐI PANEL</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Tampermonkey Virtuális Szkript Panel 🌙
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Itt valós időben kipróbálhatod és tesztelheted, hogyan működik a Luna Anime Tracker szkript a MagyarAnime, OniAnime, AnimeDrive és más oldalakon, anélkül, hogy át kellene váltanod másik lapra.
          </p>
        </div>

        {/* Global Floating HUD Toggle Button */}
        <div className="z-10 shrink-0 w-full md:w-auto">
          <button
            onClick={() => {
              setIsGlobalOverlayActive(!isGlobalOverlayActive);
              addLog('event', isGlobalOverlayActive ? 'Globális lebegő HUD kikapcsolva' : 'Globális lebegő HUD bekapcsolva a dashboardon!');
            }}
            className={`w-full md:w-auto px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isGlobalOverlayActive
                ? 'bg-emerald-500 text-black border border-emerald-400 shadow-emerald-500/20'
                : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGlobalOverlayActive ? '✓ Élő HUD Aktív a Dashboardon' : 'Lebegő HUD Bekapcsolása'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Buttons */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Válassz szimulálandó anime portált:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRESET_SITES.map((site) => {
            const isSelected = selectedPreset.id === site.id;
            return (
              <button
                key={site.id}
                onClick={() => handleSelectPreset(site)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-950/80 to-[#0c0e1e] border-cyan-400 text-white shadow-lg shadow-cyan-500/10 scale-102'
                    : 'bg-[#090a14] border-white/10 hover:border-white/20 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ backgroundColor: `${site.badgeColor}20`, color: site.badgeColor }}>
                    {site.name}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>}
                </div>
                <div className="font-bold text-xs truncate text-white">{site.sampleTitle}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">{site.sampleEp}. rész</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dual Grid: Interactive Simulated Viewport + Live Event Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7 Cols: Realistic Simulated Browser & Video Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl bg-[#090a14] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Simulated Browser Address Bar */}
            <div className="p-3 bg-[#06060c] border-b border-white/10 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-1 text-xs font-mono text-slate-300 truncate flex items-center gap-2">
                <span className="text-emerald-400">🔒 https://</span>
                <span className="text-white">{currentUrl.replace(/^https?:\/\//, '')}</span>
              </div>
              <button 
                onClick={() => addLog('event', `Oldal újratöltve: ${selectedPreset.name}`)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                title="Újratöltés szimuláció"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Website Content Canvas */}
            <div className="p-6 relative bg-gradient-to-b from-[#0e1022] via-[#090a14] to-[#06060c] min-h-[420px] flex flex-col justify-between">
              
              {/* Site Header Area */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-wider text-white">
                      {selectedPreset.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      Magyar Feliratos Anime Portál
                    </span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">HD Lejátszó #1</span>
                </div>

                <div className="mb-4">
                  <h1 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>{currentTitle}</span>
                    <span className="text-cyan-400 font-mono text-base">- {currentEpisode}. Rész</span>
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Magyar felirattal | 1080p Full HD | Indavideo & Videa szerver
                  </p>
                </div>

                {/* Simulated HTML5 Video Player */}
                <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 aspect-video flex flex-col justify-between p-4 shadow-2xl group">
                  
                  {/* Video Background Image */}
                  <img
                    src={selectedPreset.coverImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 pointer-events-none"></div>

                  {/* Top video tag */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/70 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                      <span>{isPlaying ? 'ÉLŐ LEJÁTSZÁS' : 'SZÜNETELTETVE'}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                      1080p • 60fps
                    </span>
                  </div>

                  {/* Center Play/Pause Trigger */}
                  <div className="relative z-10 flex items-center justify-center my-auto">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center shadow-xl shadow-cyan-500/30 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
                    </button>
                  </div>

                  {/* Video Controls Bar */}
                  <div className="relative z-10 space-y-2 bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span>{Math.floor((videoProgress / 100) * 24)}:{(Math.floor(videoProgress * 6) % 60).toString().padStart(2, '0')}</span>
                      <span>24:00</span>
                    </div>

                    {/* Progress Bar */}
                    <div 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const pct = Math.round((clickX / rect.width) * 100);
                        setVideoProgress(pct);
                      }}
                      className="w-full h-2 bg-white/20 hover:h-2.5 transition-all rounded-full overflow-hidden cursor-pointer"
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                        style={{ width: `${videoProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING LUNA USERSCRIPT WIDGET (Rendered directly in simulated browser viewport!) */}
              <div 
                className={`absolute bottom-6 right-6 z-30 transition-all duration-300 ${
                  isWidgetCollapsed ? 'w-auto' : 'w-80'
                }`}
              >
                {isWidgetCollapsed ? (
                  <div 
                    onClick={() => setIsWidgetCollapsed(false)}
                    className="p-2.5 px-4 rounded-full bg-black/90 border border-cyan-400/60 shadow-xl shadow-cyan-500/20 text-cyan-300 flex items-center gap-2 cursor-pointer hover:scale-105 transition-all font-mono text-xs font-bold"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>🌙 Luna ({currentEpisode}. rész)</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsWidgetCollapsed(false);
                        setIsEditMode(true);
                      }}
                      className="text-cyan-400 hover:text-white ml-1"
                      title="Szerkesztés ✏️"
                    >
                      ✏️
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl p-4 bg-[#080912]/95 border border-cyan-400 shadow-2xl shadow-cyan-500/30 backdrop-blur-xl space-y-3 font-sans text-slate-100 animate-in zoom-in-95 duration-200">
                    
                    {/* HUD Header */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs text-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>🌙 LUNA TRACKER</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 max-w-[85px] truncate">
                          {selectedPreset.name}
                        </span>
                        {/* ✏️ Ceruza Gomb a kézi beavatkozáshoz */}
                        <button
                          onClick={() => setIsEditMode(!isEditMode)}
                          className={`p-1 px-1.5 rounded text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                            isEditMode
                              ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/40'
                              : 'bg-white/10 hover:bg-white/20 text-cyan-300 hover:text-white'
                          }`}
                          title={isEditMode ? 'Vissza az automatikus nézethez' : '✏️ Kézi felülbírálás / Cím & rész szerkesztése'}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setIsWidgetCollapsed(true)}
                          className="p-1 rounded text-slate-400 hover:text-white text-xs"
                          title="Kicsinyítés"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {!isEditMode ? (
                      /* === ALAPÉRTELMEZETT TISZTA AUTOMATIKUS SZINKRONIZÁCIÓ NÉZET === */
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Auto-Sync Aktív
                            </span>
                            <button
                              onClick={() => setIsEditMode(true)}
                              className="text-[11px] text-cyan-400 hover:text-white flex items-center gap-1 hover:underline cursor-pointer"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Szerkesztés</span>
                            </button>
                          </div>
                          
                          <div className="font-bold text-xs text-white truncate" title={currentTitle}>
                            {currentTitle}
                          </div>
                          
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono font-black text-cyan-400 text-lg">
                              {currentEpisode}. rész
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              • Lejátszás & Szinkron fut
                            </span>
                          </div>
                        </div>

                        {/* Automatikus szinkron sáv */}
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/50 border border-cyan-500/20 text-[11px] text-cyan-300">
                          <div className="flex items-center gap-1.5">
                            <Radio className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
                            <span>{isSyncing ? 'Szinkronizálás...' : 'Minden automatikusan mentve'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Élő</span>
                        </div>
                      </div>
                    ) : (
                      /* === ✏️ CERUZA SZERKESZTŐ NÉZET (KÉZI FELÜLBÍRÁLÁS) === */
                      <div className="space-y-3 animate-in fade-in duration-150">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                            Anime címe (Kézi módosítás)
                          </label>
                          <input
                            type="text"
                            value={currentTitle}
                            onChange={(e) => {
                              setCurrentTitle(e.target.value);
                              setIsManualOverride(true);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/70 border border-cyan-500/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                            Epizód száma
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setCurrentEpisode((prev) => Math.max(1, prev - 5));
                                setIsManualOverride(true);
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-mono font-bold"
                            >
                              -5
                            </button>
                            <button
                              onClick={() => {
                                setCurrentEpisode((prev) => Math.max(1, prev - 1));
                                setIsManualOverride(true);
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-mono font-bold"
                            >
                              -1
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={currentEpisode}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val >= 1) {
                                  setCurrentEpisode(val);
                                  setIsManualOverride(true);
                                }
                              }}
                              className="flex-1 text-center py-1 rounded bg-black/80 border border-cyan-500 font-mono font-bold text-cyan-300 text-sm focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                setCurrentEpisode((prev) => prev + 1);
                                setIsManualOverride(true);
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-mono font-bold"
                            >
                              +1
                            </button>
                            <button
                              onClick={() => {
                                setCurrentEpisode((prev) => prev + 5);
                                setIsManualOverride(true);
                              }}
                              className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-mono font-bold"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                            Állapot (Státusz)
                          </label>
                          <select
                            value={currentStatus}
                            onChange={(e) => {
                              setCurrentStatus(e.target.value);
                              setIsManualOverride(true);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-black/70 border border-cyan-500/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                          >
                            <option value="watching">Nézem (Folyamatban)</option>
                            <option value="plan_to_watch">Tervezett (Plan to Watch)</option>
                            <option value="completed">Befejezve</option>
                            <option value="on_hold">Szüneteltetve</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              setIsEditMode(false);
                              triggerRealtimeBroadcast(currentTitle, currentEpisode, selectedPreset.name, currentUrl, currentStatus);
                              addLog('success', `[KÉZI MENTÉS] Mentve: "${currentTitle}" - ${currentEpisode}. rész (${currentStatus})`);
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                          >
                            💾 Mentés & Kész
                          </button>
                          <button
                            onClick={() => {
                              setIsManualOverride(false);
                              setIsEditMode(false);
                              setCurrentTitle(selectedPreset.sampleTitle);
                              setCurrentEpisode(selectedPreset.sampleEp);
                              setCurrentStatus('watching');
                              addLog('info', `[AUTO REVERT] Visszaállítva a felismert értékekre: "${selectedPreset.sampleTitle}"`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs cursor-pointer"
                            title="Visszaállítás az oldal által automatikusan felismert címre"
                          >
                            🔄 Auto
                          </button>
                        </div>
                      </div>
                    )}

                    {lastSyncSuccess && (
                      <div className="text-[10px] font-mono text-emerald-400 text-center font-bold animate-in fade-in">
                        ✓ Sikeresen mentve a felhőbe!
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Right 5 Cols: Real-time Live Log & Parser Debugger */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Parser Lab & Regex Tester Box */}
          <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-sm text-white">
                  DOM & Cím-kivonó Elemző Labor
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                RegEx v3.1
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Írj be bármilyen anime címet, URL-t vagy fórumbeli szöveget, és a rendszer megmutatja, hogyan tisztítja le a szkript:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={testInputString}
                onChange={(e) => runParserTest(e.target.value)}
                placeholder="Pl: Jujutsu Kaisen 2. évad 12. rész online magyar felirattal"
                className="w-full bg-black/60 border border-white/10 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-mono outline-none"
              />
            </div>

            {/* Parsed Output Result */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Feldolgozott Anime Cím:</span>
                <span className="text-white font-bold">{parsedResult.title || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Detektált Epizód:</span>
                <span className="text-cyan-400 font-bold">{parsedResult.episode}. rész</span>
              </div>
              <button
                onClick={() => {
                  setCurrentTitle(parsedResult.title);
                  setCurrentEpisode(parsedResult.episode);
                  addLog('event', `Teszt eredmény betöltve a lejátszóba: "${parsedResult.title}" (${parsedResult.episode}. rész)`);
                  triggerRealtimeBroadcast(parsedResult.title, parsedResult.episode, selectedPreset.name, currentUrl);
                }}
                className="w-full mt-2 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-bold text-xs transition-all border border-cyan-500/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Alkalmazás a Szimulátoron & Mentés</span>
              </button>
            </div>
          </div>

          {/* Live Debugging Stream Logs */}
          <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <h3 className="font-display font-bold text-sm text-white">
                  Élő Eseménynapló & Kommunikációs Log
                </h3>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
              >
                Napló törlése
              </button>
            </div>

            <div className="h-60 overflow-y-auto space-y-1.5 font-mono text-[11px] bg-black/60 p-3 rounded-2xl border border-white/5">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-6">Még nincs naplózott esemény.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={`
                      ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                      ${log.type === 'event' ? 'text-cyan-300' : ''}
                      ${log.type === 'warn' ? 'text-amber-400' : ''}
                      ${log.type === 'info' ? 'text-slate-300' : ''}
                    `}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Global Fixed Floating HUD on Dashboard (when enabled by the toggle) */}
      {isGlobalOverlayActive && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-80 rounded-2xl p-4 bg-[#080912]/95 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/40 backdrop-blur-2xl space-y-3 font-sans text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-cyan-400">
                <span>🌙</span>
                <span>LUNA HUD (ÉLŐ TESZT)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <button
                onClick={() => setIsGlobalOverlayActive(false)}
                className="p-1 rounded text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="font-bold text-sm text-white truncate">{currentTitle}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{selectedPreset.name}</div>
            </div>

            <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/10">
              <span className="text-xs text-slate-300">Epizód:</span>
              <span className="font-mono font-bold text-cyan-400 text-base">{currentEpisode}. Rész</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEpisodeChange(-1)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
              >
                -1
              </button>
              <button
                onClick={() => handleEpisodeChange(1)}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+1 Rész</span>
              </button>
              <button
                onClick={() => triggerRealtimeBroadcast(currentTitle, currentEpisode, selectedPreset.name, currentUrl)}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                Szinkron
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
