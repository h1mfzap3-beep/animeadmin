import { CustomMonitoredSite } from '../types';

export const DEFAULT_MONITORED_SITES: CustomMonitoredSite[] = [
  {
    id: 'magyaranime',
    name: 'MagyarAnime (EU & HU)',
    domain: 'magyaranime.eu, magyaranime.hu, magyaranime.org',
    urlPattern: '*://*.magyaranime.eu/*, *://*.magyaranime.hu/*, *://*.magyaranime.org/*',
    titleSelector: 'h1.entry-title, h1.anime-title, .video-info h1, h1',
    episodeSelector: '.episode-current, .epizod-valaszto option:checked',
    badgeColor: '#06b6d4',
    enabled: true,
    isBuiltIn: true,
    notes: 'Közvetlen epizód és anime cím felismerés a lejátszó felett.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'animek',
    name: 'Animek.hu',
    domain: 'animek.hu, animek.net',
    urlPattern: '*://*.animek.hu/*, *://*.animek.net/*',
    titleSelector: '.anime-title h1, .video-title, h1.title, h1',
    episodeSelector: '.episode-number, .current-ep, .ep-active',
    badgeColor: '#0ea5e9',
    enabled: true,
    isBuiltIn: true,
    notes: 'Animek.hu online streaming lejátszási felismerés.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'onianime',
    name: 'OniAnime',
    domain: 'onianime.hu, onianime.net',
    urlPattern: '*://*.onianime.hu/*, *://*.onianime.net/*',
    titleSelector: '.anime-data h1, .header-title, h1.title, .play-title, h1',
    episodeSelector: '.epizodok a.active, .episode-btn.active',
    badgeColor: '#a855f7',
    enabled: true,
    isBuiltIn: true,
    notes: 'Teljes körű OniAnime SPA támogatás dinamikus epizódváltással.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'animegun',
    name: 'AnimeGun',
    domain: 'animegun.hu',
    urlPattern: '*://*.animegun.hu/*',
    titleSelector: 'h1.anime-title, .post-title h1, h1',
    episodeSelector: '.current-part, .ep-number',
    badgeColor: '#e11d48',
    enabled: true,
    isBuiltIn: true,
    notes: 'AnimeGun portál anime és epizód felismerés.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'animedrive',
    name: 'AnimeDrive',
    domain: 'animedrive.hu',
    urlPattern: '*://*.animedrive.hu/*',
    titleSelector: '.anime-title, .player-container h1, .video-header h1, h1',
    episodeSelector: '.episode-badge, .active-episode, .episode-select option:checked',
    badgeColor: '#3b82f6',
    enabled: true,
    isBuiltIn: true,
    notes: 'AnimeDrive.hu közvetlen streaming szinkronizáció.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sorozatbarat',
    name: 'SorozatBarát',
    domain: 'sorozatbarat.club, sorozatbarat.hu, sorozat-barat.club',
    urlPattern: '*://*.sorozatbarat.club/*, *://*.sorozatbarat.hu/*, *://*.sorozat-barat.club/*',
    titleSelector: '.series-title, .video-title, h1',
    episodeSelector: '.active-episode, .episode-link.active',
    badgeColor: '#f97316',
    enabled: true,
    isBuiltIn: true,
    notes: 'SorozatBarát anime sorozatok és részek követése.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'uraharashop',
    name: 'UraharaShop Fansub',
    domain: 'uraharashop.hu',
    urlPattern: '*://*.uraharashop.hu/*',
    titleSelector: '.entry-title, .post-title, h1.page-title, h1',
    episodeSelector: '.episode-num, .resz-szam',
    badgeColor: '#f59e0b',
    enabled: true,
    isBuiltIn: true,
    notes: 'UraharaShop fansub kiadások és online videók figyelése.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'narutokun',
    name: 'Naruto-Kun',
    domain: 'naruto-kun.hu',
    urlPattern: '*://*.naruto-kun.hu/*',
    titleSelector: '.content-box h1, h1.content-title, .title-box h1, h1',
    episodeSelector: '.epizodok a.active, .ep-active',
    badgeColor: '#ef4444',
    enabled: true,
    isBuiltIn: true,
    notes: 'Naruto-kun.hu anime és manga epizódkövetés.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'dragonhall',
    name: 'DragonHall',
    domain: 'dragonhall.hu, dragonhallplus.hu',
    urlPattern: '*://*.dragonhall.hu/*, *://*.dragonhallplus.hu/*',
    titleSelector: '.video-title, h1.title, h1',
    episodeSelector: '.episode-select option:checked, .active-ep',
    badgeColor: '#84cc16',
    enabled: true,
    isBuiltIn: true,
    notes: 'DragonHall anime portál szinkronizáció.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'animesziget',
    name: 'AnimeSziget',
    domain: 'animesziget.com, animesziget.hu',
    urlPattern: '*://*.animesziget.com/*, *://*.animesziget.hu/*',
    titleSelector: 'h1.title, .entry-title, h1',
    episodeSelector: '.current-episode, .ep-active',
    badgeColor: '#065f46',
    enabled: true,
    isBuiltIn: true,
    notes: 'AnimeSziget közösségi portál figyelése.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'animecenter',
    name: 'AnimeCenter',
    domain: 'animecenter.hu',
    urlPattern: '*://*.animecenter.hu/*',
    titleSelector: '.anime-title, h1',
    episodeSelector: '.ep-item.active',
    badgeColor: '#6366f1',
    enabled: true,
    isBuiltIn: true,
    notes: 'AnimeCenter stream követés.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mutekifansub',
    name: 'Muteki Fansub',
    domain: 'mutekifansub.hu',
    urlPattern: '*://*.mutekifansub.hu/*',
    titleSelector: 'article h1.entry-title, .post-title, h1',
    episodeSelector: '.entry-content strong',
    badgeColor: '#10b981',
    enabled: true,
    isBuiltIn: true,
    notes: 'Muteki Fansub blog és videóbejegyzések szinkronja.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'indavideo_videa',
    name: 'Indavideo & Videa Lejátszók',
    domain: 'indavideo.hu, videa.hu, videakid.hu',
    urlPattern: '*://*.indavideo.hu/*, *://*.videa.hu/*, *://*.videakid.hu/*',
    titleSelector: 'h1.title, .video-title, #video-title, h1',
    episodeSelector: '',
    badgeColor: '#8b5cf6',
    enabled: true,
    isBuiltIn: true,
    notes: 'Magyar videómegosztók beágyazott és közvetlen lejátszói.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'hianime',
    name: 'HiAnime / AniWatch / Zoro',
    domain: 'hianime.to, aniwatch.to, zoro.to, zoro.vc',
    urlPattern: '*://*.hianime.to/*, *://*.aniwatch.to/*, *://*.zoro.to/*, *://*.zoro.vc/*',
    titleSelector: '.film-name, .film-name a, h2.film-name',
    episodeSelector: '.ssl-item.ep-item.active',
    badgeColor: '#ec4899',
    enabled: true,
    isBuiltIn: true,
    notes: 'HiAnime és nemzetközi partnerek lejátszóinak követése.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'aniwave',
    name: '9Anime / AniWave',
    domain: '9animetv.to, aniwave.to, 9anime.to, 9anime.se',
    urlPattern: '*://*.9animetv.to/*, *://*.aniwave.to/*, *://*.9anime.to/*, *://*.9anime.se/*',
    titleSelector: 'h1.title, .film-title, h1',
    episodeSelector: '.episodes .active, .ep-item.active',
    badgeColor: '#a855f7',
    enabled: true,
    isBuiltIn: true,
    notes: '9Anime és AniWave nemzetközi portálok támogatása.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    domain: 'crunchyroll.com',
    urlPattern: '*://*.crunchyroll.com/*',
    titleSelector: 'h1.show-title, .current-media-parent-title, h1',
    episodeSelector: '.episode-number, h1.title',
    badgeColor: '#f97316',
    enabled: true,
    isBuiltIn: true,
    notes: 'Crunchyroll hivatalos anime streaming követés.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'gogoanime',
    name: 'GogoAnime / AniTaku',
    domain: 'gogoanime3.co, anitaku.to, gogoanime.pe, gogoanime.to',
    urlPattern: '*://*.gogoanime3.co/*, *://*.anitaku.to/*, *://*.gogoanime.pe/*, *://*.gogoanime.to/*',
    titleSelector: '.anime_video_body h1, .title_name h2, h1',
    episodeSelector: '#episode_page a.active',
    badgeColor: '#14b8a6',
    enabled: true,
    isBuiltIn: true,
    notes: 'GogoAnime és AniTaku epizód felismerés.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'animepahe',
    name: 'AnimePahe',
    domain: 'animepahe.ru, animepahe.org, animepahe.com',
    urlPattern: '*://*.animepahe.ru/*, *://*.animepahe.org/*, *://*.animepahe.com/*',
    titleSelector: '.the-title, .title-wrapper h1, h1',
    episodeSelector: '.episode-menu-title',
    badgeColor: '#f43f5e',
    enabled: true,
    isBuiltIn: true,
    notes: 'AnimePahe gyors stream követés.',
    createdAt: new Date().toISOString()
  }
];

const STORAGE_CUSTOM_SITES_KEY = 'luna_monitored_sites_config';

export function getMonitoredSites(): CustomMonitoredSite[] {
  if (typeof window === 'undefined') return DEFAULT_MONITORED_SITES;
  try {
    const saved = localStorage.getItem(STORAGE_CUSTOM_SITES_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_CUSTOM_SITES_KEY, JSON.stringify(DEFAULT_MONITORED_SITES));
      return DEFAULT_MONITORED_SITES;
    }
    const parsed: CustomMonitoredSite[] = JSON.parse(saved);
    // Ensure all built-in sites exist
    const merged = [...parsed];
    for (const defSite of DEFAULT_MONITORED_SITES) {
      if (!merged.some(s => s.id === defSite.id)) {
        merged.push(defSite);
      }
    }
    return merged;
  } catch (e) {
    console.error('Error loading custom monitored sites:', e);
    return DEFAULT_MONITORED_SITES;
  }
}

export function saveMonitoredSites(sites: CustomMonitoredSite[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_CUSTOM_SITES_KEY, JSON.stringify(sites));
  } catch (e) {
    console.error('Error saving monitored sites:', e);
  }
}

export function addCustomMonitoredSite(site: Omit<CustomMonitoredSite, 'id' | 'createdAt'>): CustomMonitoredSite[] {
  const current = getMonitoredSites();
  const newSite: CustomMonitoredSite = {
    ...site,
    id: 'custom_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    createdAt: new Date().toISOString(),
    isBuiltIn: false
  };
  const updated = [newSite, ...current];
  saveMonitoredSites(updated);
  return updated;
}

export function toggleSiteEnabled(siteId: string, enabled: boolean): CustomMonitoredSite[] {
  const current = getMonitoredSites();
  const updated = current.map(s => s.id === siteId ? { ...s, enabled } : s);
  saveMonitoredSites(updated);
  return updated;
}

export function deleteCustomSite(siteId: string): CustomMonitoredSite[] {
  const current = getMonitoredSites();
  const updated = current.filter(s => s.id !== siteId || s.isBuiltIn);
  saveMonitoredSites(updated);
  return updated;
}

/**
 * Dynamically generates the complete Tampermonkey / Violentmonkey userscript
 * incorporating all built-in and user-added custom monitored sites with a full graphical GUI HUD.
 */
export function generateTampermonkeyUserscript(sites?: CustomMonitoredSite[]): string {
  const activeSites = (sites || getMonitoredSites()).filter(s => s.enabled);
  
  // Build match patterns ensuring both apex and subdomains are included
  const matchDirectives: string[] = [
    '// @match        *://*/*',
    '// @match        *://magyaranime.eu/*',
    '// @match        *://*.magyaranime.eu/*',
    '// @match        *://magyaranime.hu/*',
    '// @match        *://*.magyaranime.hu/*',
    '// @match        *://magyaranime.org/*',
    '// @match        *://*.magyaranime.org/*',
    '// @match        *://onianime.hu/*',
    '// @match        *://*.onianime.hu/*',
    '// @match        *://onianime.net/*',
    '// @match        *://*.onianime.net/*',
    '// @match        *://animedrive.hu/*',
    '// @match        *://*.animedrive.hu/*',
    '// @match        *://uraharashop.hu/*',
    '// @match        *://*.uraharashop.hu/*',
    '// @match        *://naruto-kun.hu/*',
    '// @match        *://*.naruto-kun.hu/*',
    '// @match        *://mutekifansub.hu/*',
    '// @match        *://*.mutekifansub.hu/*',
    '// @match        *://indavideo.hu/*',
    '// @match        *://*.indavideo.hu/*',
    '// @match        *://videa.hu/*',
    '// @match        *://*.videa.hu/*',
    '// @match        *://videakid.hu/*',
    '// @match        *://*.videakid.hu/*'
  ];

  activeSites.forEach(site => {
    const rawDomains = site.domain.split(',').map(d => d.trim()).filter(Boolean);
    rawDomains.forEach(domain => {
      const clean = domain.replace(/^https?:\/\//, '').replace(/^\*\./, '').replace(/\/.*$/, '');
      if (clean) {
        const apex = `// @match        *://${clean}/*`;
        const sub = `// @match        *://*.${clean}/*`;
        if (!matchDirectives.includes(apex)) matchDirectives.push(apex);
        if (!matchDirectives.includes(sub)) matchDirectives.push(sub);
      }
    });
  });

  // Sites JSON payload embedded for dynamic DOM matching inside userscript
  const sitesConfigJson = JSON.stringify(activeSites.map(s => ({
    id: s.id,
    name: s.name,
    domains: s.domain.split(',').map(d => d.trim().toLowerCase()),
    titleSelector: s.titleSelector || '',
    episodeSelector: s.episodeSelector || '',
    badgeColor: s.badgeColor || '#06b6d4'
  })), null, 2);

  return `// ==UserScript==
// @name         Luna Anime Tracker HUD - Valós Idejű Grafikus Panel & Szinkronizáló
// @namespace    https://github.com/h1mfzap3-beep/anime
// @version      4.0.0
// @description  Automatikus anime felismerés, lebegő és húzható grafikus cyberpunk vezérlőpult (HUD), valós idejű szinkronizáció MagyarAnime, OniAnime, AnimeDrive, UraharaShop, Naruto-Kun, Indavideo, Videa és minden egyéb anime streaming oldalhoz.
// @author       Luna Team
${matchDirectives.join('\n')}
// @icon         https://raw.githubusercontent.com/h1mfzap3-beep/anime/main/icons/icon48.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @noframes     false
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // 1. Biztonságos fallback helper a GM API-khoz
  const safeGM = {
    getValue: (key, def) => {
      try {
        if (typeof GM_getValue !== 'undefined') return GM_getValue(key, def);
      } catch (e) {}
      try {
        const val = localStorage.getItem('luna_gm_' + key);
        return val ? JSON.parse(val) : def;
      } catch (e) {
        return def;
      }
    },
    setValue: (key, val) => {
      try {
        if (typeof GM_setValue !== 'undefined') GM_setValue(key, val);
      } catch (e) {}
      try {
        localStorage.setItem('luna_gm_' + key, JSON.stringify(val));
      } catch (e) {}
    },
    notify: (opts) => {
      try {
        if (typeof GM_notification === 'function') {
          GM_notification(opts);
          return;
        }
      } catch (e) {}
    },
    setClipboard: (text) => {
      try {
        if (typeof GM_setClipboard === 'function') {
          GM_setClipboard(text);
          return;
        }
      } catch (e) {}
      try {
        navigator.clipboard.writeText(text);
      } catch (e) {}
    }
  };

  // Konfiguráció & Figyelt oldalak
  const MONITORED_SITES = ${sitesConfigJson};
  const DASHBOARD_URL = safeGM.getValue('luna_dashboard_url', window.location.origin.includes('run.app') ? window.location.origin : 'https://ais-dev-haau57gidvc74j2nnjloyk-452811031712.europe-west2.run.app');

  // Kommunikációs csatornák
  let broadcastChannel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('luna_anime_realtime_channel');
    }
  } catch (e) {}

  // 2. Grafikus Felület Stílusok (Cyberpunk Glassmorphism HUD)
  const HUD_STYLES = \`
    #luna-hud-root {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      position: fixed !important;
      z-index: 2147483647 !important;
      color: #f1f5f9 !important;
      user-select: none !important;
      box-sizing: border-box !important;
    }
    #luna-hud-root * {
      box-sizing: border-box !important;
      font-family: inherit !important;
    }
    
    /* Lebegő Kicsinyített Pill (Mini Mód) */
    .luna-mini-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border-radius: 9999px;
      background: rgba(10, 12, 24, 0.94);
      border: 1px solid rgba(6, 182, 212, 0.6);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8), 0 0 16px rgba(6, 182, 212, 0.35);
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .luna-mini-pill:hover {
      transform: scale(1.04);
      border-color: #38bdf8;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 22px rgba(56, 189, 248, 0.5);
    }
    .luna-mini-text {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      max-width: 170px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .luna-mini-badge {
      font-size: 11px;
      font-weight: 800;
      color: #38bdf8;
      background: rgba(6, 182, 212, 0.15);
      padding: 2px 7px;
      border-radius: 9999px;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }
    .luna-mini-step-btn {
      background: #06b6d4;
      color: #040810;
      border: none;
      border-radius: 9999px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s;
    }
    .luna-mini-step-btn:hover {
      background: #38bdf8;
      transform: scale(1.1);
    }

    /* Teljes Grafikus Panel */
    .luna-full-panel {
      width: 340px;
      background: rgba(8, 10, 20, 0.96);
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-radius: 20px;
      padding: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(6, 182, 212, 0.25);
      backdrop-filter: blur(20px);
      transition: box-shadow 0.2s ease;
      position: relative;
    }
    .luna-full-panel:hover {
      box-shadow: 0 22px 55px rgba(0, 0, 0, 0.95), 0 0 35px rgba(6, 182, 212, 0.35);
    }

    /* Fejléc és Húzás */
    .luna-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: grab;
    }
    .luna-panel-header:active {
      cursor: grabbing;
    }
    .luna-brand-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      font-weight: 900;
      color: #38bdf8;
      letter-spacing: 0.5px;
    }
    .luna-pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
      animation: lunaPulse 1.8s infinite;
    }
    @keyframes lunaPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(1.3); }
    }
    .luna-header-tools {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .luna-icon-btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      border-radius: 8px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .luna-icon-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.2);
    }
    .luna-site-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 6px;
      background: rgba(168, 85, 247, 0.18);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    /* Anime Cím Sáv */
    .luna-anime-card {
      margin-top: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 12px;
    }
    .luna-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 8px;
    }
    .luna-anime-title-input {
      font-size: 13px;
      font-weight: 700;
      color: #ffffff;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      padding: 2px 4px;
      width: 100%;
      outline: none;
      transition: all 0.2s;
    }
    .luna-anime-title-input:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .luna-anime-title-input:focus {
      background: rgba(0, 0, 0, 0.6);
      border-color: #06b6d4;
    }

    /* Epizód Számláló & Léptető Vezérlők */
    .luna-stepper-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      background: rgba(0, 0, 0, 0.4);
      padding: 8px 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .luna-step-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      border-radius: 8px;
      padding: 5px 8px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s;
    }
    .luna-step-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
    }
    .luna-step-btn:active {
      transform: scale(0.94);
    }
    .luna-ep-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
    }
    .luna-ep-number {
      font-size: 18px;
      font-weight: 900;
      color: #38bdf8;
      cursor: pointer;
      line-height: 1.1;
    }
    .luna-ep-label {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Státusz Választó Gombok */
    .luna-status-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      margin-top: 10px;
    }
    .luna-status-btn {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      color: #94a3b8;
      border-radius: 8px;
      padding: 5px 2px;
      font-size: 9px;
      font-weight: 700;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
    }
    .luna-status-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .luna-status-btn.active {
      background: rgba(6, 182, 212, 0.2);
      border-color: #06b6d4;
      color: #38bdf8;
    }

    /* Fő Akció Sáv */
    .luna-action-row {
      display: flex;
      gap: 6px;
      margin-top: 12px;
    }
    .luna-main-sync-btn {
      flex: 1;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: #040810;
      border: none;
      border-radius: 12px;
      padding: 9px 12px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(6, 182, 212, 0.35);
      transition: all 0.2s;
    }
    .luna-main-sync-btn:hover {
      opacity: 0.95;
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(6, 182, 212, 0.5);
    }
    .luna-main-sync-btn:active {
      transform: translateY(0);
    }
    .luna-sub-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      border-radius: 12px;
      padding: 9px 10px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .luna-sub-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
    }

    /* Almenü / Beállítások Drawer */
    .luna-drawer {
      margin-top: 12px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      font-size: 10px;
      color: #94a3b8;
    }
    .luna-drawer input {
      width: 100%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 4px 8px;
      color: #ffffff;
      font-size: 10px;
      margin-top: 4px;
      outline: none;
    }
    .luna-toast {
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: #040810;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      animation: fadeInOut 2s forwards;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, 5px); }
      15%, 85% { opacity: 1; transform: translate(-50%, 0); }
      100% { opacity: 0; transform: translate(-50%, -5px); }
    }
  \`;

  // Stílusok biztonságos injektálása
  function injectStyles() {
    if (document.getElementById('luna-hud-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'luna-hud-styles';
    styleEl.textContent = HUD_STYLES;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  // 3. Intelligens Cím Tisztító
  function cleanAnimeTitle(raw) {
    if (!raw) return "Anime Műsor";
    let clean = raw.trim();
    
    clean = clean
      .replace(/(\\d+)[.\\s_-]*(rész|resz|ep|episode|fejezet|évad|evad).*/i, "")
      .replace(/magyar felirattal.*/i, "")
      .replace(/magyar szinkronnal.*/i, "")
      .replace(/online magyarul.*/i, "")
      .replace(/online anime.*/i, "")
      .replace(/anime indavideo.*/i, "")
      .replace(/videa.*/i, "")
      .replace(/\\[.*?\\]/g, "")
      .replace(/\\((?:magyar|felirat|1080p|720p).*?\\)/gi, "")
      .replace(/\\|\\s*(?:MagyarAnime|OniAnime|AnimeDrive|UraharaShop|Naruto-Kun|Indavideo|Videa).*/i, "")
      .trim();

    return clean || raw.trim();
  }

  // 4. Intelligens Epizód Kivonó
  function extractEpisodeNumber(text, url) {
    const combined = (text || "") + " " + (url || "") + " " + (document.title || "");
    const patterns = [
      /(?:rész|resz|ep|episode|epizod)[.\\s_:-]*(\\d+)/i,
      /(\\d+)[.\\s_:-]*(?:rész|resz|ep|episode|epizod)/i,
      /(?:resz-|ep-)(\\d+)/i,
      /-(\\d+)-resz/i,
      /\\/(\\d+)-resz/i,
      /\\/resz\\/(\\d+)/i,
      /\\/epizod\\/(\\d+)/i,
      /[?&]ep=(\\d+)/i,
      /[?&]resz=(\\d+)/i,
      /(\\d+)\\.\\s*rész/i
    ];

    for (const pat of patterns) {
      const m = combined.match(pat);
      if (m && m[1]) {
        const num = parseInt(m[1], 10);
        if (!isNaN(num) && num > 0 && num < 5000) return num;
      }
    }
    return 1;
  }

  // 5. Cím & Epizód & Portál Kinyerése a DOM-ból
  function parseCurrentPage() {
    const host = window.location.hostname.toLowerCase();
    const url = window.location.href;
    let title = "";
    let episode = 1;
    let sourceName = "Anime Portál";
    let badgeColor = "#06b6d4";

    // 1. Keresés az előre definiált oldalakban
    for (const site of MONITORED_SITES) {
      if (site.domains && site.domains.some(d => host.includes(d))) {
        sourceName = site.name;
        badgeColor = site.badgeColor || badgeColor;

        if (site.titleSelector) {
          try {
            const el = document.querySelector(site.titleSelector);
            if (el && el.innerText && el.innerText.trim()) {
              title = el.innerText.trim();
            }
          } catch (e) {}
        }
        if (site.episodeSelector) {
          try {
            const epEl = document.querySelector(site.episodeSelector);
            if (epEl && epEl.innerText && epEl.innerText.trim()) {
              const epNum = parseInt(epEl.innerText.replace(/\\D/g, ''), 10);
              if (!isNaN(epNum) && epNum > 0) episode = epNum;
            }
          } catch (e) {}
        }
        break;
      }
    }

    // 2. Oldalspecifikus finomhangolások
    if (host.includes("magyaranime")) {
      sourceName = "MagyarAnime";
      const h1 = document.querySelector("h1.entry-title, .video-info h1, .post-title, h1");
      if (h1 && !title) title = h1.innerText.trim();
    } else if (host.includes("onianime")) {
      sourceName = "OniAnime";
      const titleElem = document.querySelector(".anime-data h1, .header-title, h1.title, .play-title, h1");
      if (titleElem && !title) title = titleElem.innerText.trim();
    } else if (host.includes("animedrive")) {
      sourceName = "AnimeDrive";
      const el = document.querySelector(".anime-title, .player-container h1, .video-header h1, h1");
      if (el && !title) title = el.innerText.trim();
    } else if (host.includes("uraharashop")) {
      sourceName = "UraharaShop";
      const el = document.querySelector(".entry-title, .post-title, h1.page-title, h1");
      if (el && !title) title = el.innerText.trim();
    } else if (host.includes("naruto-kun")) {
      sourceName = "Naruto-Kun";
      const el = document.querySelector(".content-box h1, h1.content-title, .title-box h1, h1");
      if (el && !title) title = el.innerText.trim();
    } else if (host.includes("mutekifansub")) {
      sourceName = "MutekiFansub";
      const el = document.querySelector("article h1.entry-title, .post-title, h1");
      if (el && !title) title = el.innerText.trim();
    } else if (host.includes("indavideo") || host.includes("videa")) {
      sourceName = host.includes("indavideo") ? "Indavideo" : "Videa";
      if (!title) title = document.title;
    }

    if (!title) {
      const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
      if (ogTitle) title = ogTitle;
    }
    if (!title) {
      title = document.title;
    }

    if (episode === 1) {
      episode = extractEpisodeNumber(title, url);
    }

    const cleanTitle = cleanAnimeTitle(title);

    return {
      title: cleanTitle || "Anime Műsor",
      episode: isNaN(episode) ? 1 : episode,
      status: "watching",
      source: sourceName,
      sourceUrl: url,
      badgeColor: badgeColor
    };
  }

  // 6. Szinkronizáció & Mentés
  let currentAnime = null;

  function broadcastData(data) {
    const payload = {
      type: "LUNA_ANIME_PROGRESS",
      anime: data,
      timestamp: Date.now(),
      origin: window.location.origin
    };

    // 1. BroadcastChannel (Azonnali lapok közötti kommunikáció)
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch (e) {}
    }

    // 2. localStorage Event
    try {
      localStorage.setItem("luna_realtime_anime_sync", JSON.stringify(payload));
    } catch (e) {}

    // 3. PostMessage
    try {
      window.postMessage(payload, "*");
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }
    } catch (e) {}

    // 4. Helyi lista mentése GM tárhelyre
    const list = safeGM.getValue("luna_tracked_animes", []);
    const idx = list.findIndex(i => i.title.toLowerCase() === data.title.toLowerCase());
    if (idx !== -1) {
      list[idx].episode = data.episode;
      list[idx].status = data.status || list[idx].status || "watching";
      list[idx].updatedAt = new Date().toISOString();
      list[idx].sourceUrl = data.sourceUrl;
    } else {
      list.unshift({
        ...data,
        updatedAt: new Date().toISOString()
      });
    }
    safeGM.setValue("luna_tracked_animes", list);
  }

  // 7. Grafikus Felület (HUD Kezelő)
  let hudContainer = null;
  let isMiniMode = safeGM.getValue('luna_hud_minimized', false);
  let showDrawer = false;

  function showToast(text) {
    if (!hudContainer) return;
    const toast = document.createElement('div');
    toast.className = 'luna-toast';
    toast.innerText = text;
    hudContainer.querySelector('.luna-full-panel, .luna-mini-pill')?.appendChild(toast);
    setTimeout(() => toast.remove(), 2100);
  }

  function renderHUD() {
    injectStyles();

    if (!currentAnime) {
      currentAnime = parseCurrentPage();
    }

    if (!hudContainer) {
      hudContainer = document.createElement('div');
      hudContainer.id = 'luna-hud-root';
      
      // Pozíció betöltése
      const savedPos = safeGM.getValue('luna_hud_pos', { bottom: 24, right: 24 });
      hudContainer.style.bottom = savedPos.bottom + 'px';
      hudContainer.style.right = savedPos.right + 'px';

      document.body.appendChild(hudContainer);
    }

    if (isMiniMode) {
      // Mini Mód Render
      hudContainer.innerHTML = \`
        <div class="luna-mini-pill" id="luna-pill-expand" title="Kattints a Luna teljes grafikus paneljének megnyitásához!">
          <span style="font-size: 14px;">🌙</span>
          <span class="luna-mini-text">\${currentAnime.title}</span>
          <span class="luna-mini-badge">\${currentAnime.episode}. Ep</span>
          <button class="luna-mini-step-btn" id="luna-pill-step" title="+1 Epizód">+1</button>
        </div>
      \`;

      document.getElementById('luna-pill-expand')?.addEventListener('click', (e) => {
        if (e.target.id === 'luna-pill-step') return;
        isMiniMode = false;
        safeGM.setValue('luna_hud_minimized', false);
        renderHUD();
      });

      document.getElementById('luna-pill-step')?.addEventListener('click', (e) => {
        e.stopPropagation();
        currentAnime.episode += 1;
        broadcastData(currentAnime);
        renderHUD();
        safeGM.notify({
          title: "🌙 Luna Tracker",
          text: \`+1 Epizód rögzítve: \${currentAnime.title} (\${currentAnime.episode}. rész)\`,
          timeout: 2000
        });
      });

      return;
    }

    // Teljes Grafikus Panel Render
    hudContainer.innerHTML = \`
      <div class="luna-full-panel" id="luna-panel-box">
        
        <!-- Fejléc (Húzható sáv) -->
        <div class="luna-panel-header" id="luna-drag-handle">
          <div class="luna-brand-title">
            <span>🌙</span>
            <span>LUNA HUD</span>
            <span class="luna-pulse-dot" title="Valós idejű szinkron aktív"></span>
          </div>

          <div class="luna-header-tools">
            <span class="luna-site-badge" style="border-color: \${currentAnime.badgeColor}; color: \${currentAnime.badgeColor}">
              \${currentAnime.source}
            </span>
            <button class="luna-icon-btn" id="luna-btn-drawer" title="Beállítások & Diagnosztika">⚙️</button>
            <button class="luna-icon-btn" id="luna-btn-minimize" title="Kicsinyítés gombbá">➖</button>
            <button class="luna-icon-btn" id="luna-btn-close" title="Panel bezárása (Alt+L a visszahozáshoz)">✕</button>
          </div>
        </div>

        <!-- Anime Kártya -->
        <div class="luna-anime-card">
          <div class="luna-title-row">
            <input 
              type="text" 
              class="luna-anime-title-input" 
              id="luna-input-title" 
              value="\${currentAnime.title}" 
              title="Kattints a cím átírásához!"
            />
          </div>

          <!-- Epizód Léptető Stepper -->
          <div class="luna-stepper-container">
            <button class="luna-step-btn" id="luna-step-m5" title="-5 Rész">-5</button>
            <button class="luna-step-btn" id="luna-step-m1" title="-1 Rész">-1</button>
            
            <div class="luna-ep-display" id="luna-ep-box" title="Kattints az epizódszám kézi beírásához!">
              <span class="luna-ep-number" id="luna-ep-val">\${currentAnime.episode}.</span>
              <span class="luna-ep-label">Epizód</span>
            </div>

            <button class="luna-step-btn" id="luna-step-p1" style="background: rgba(6, 182, 212, 0.25); color: #38bdf8; border-color: rgba(6, 182, 212, 0.4);" title="+1 Rész">+1</button>
            <button class="luna-step-btn" id="luna-step-p5" title="+5 Rész">+5</button>
          </div>

          <!-- Státusz Választó -->
          <div class="luna-status-row">
            <button class="luna-status-btn \${currentAnime.status === 'watching' ? 'active' : ''}" data-status="watching">▶ Nézem</button>
            <button class="luna-status-btn \${currentAnime.status === 'completed' ? 'active' : ''}" data-status="completed">✓ Kész</button>
            <button class="luna-status-btn \${currentAnime.status === 'on_hold' ? 'active' : ''}" data-status="on_hold">⏸ Szünet</button>
            <button class="luna-status-btn \${currentAnime.status === 'plan_to_watch' ? 'active' : ''}" data-status="plan_to_watch">📋 Terv</button>
          </div>
        </div>

        <!-- Akció Gombok -->
        <div class="luna-action-row">
          <button class="luna-main-sync-btn" id="luna-btn-save-sync">
            <span>⚡</span>
            <span>Mentés & Szinkron</span>
          </button>
          <button class="luna-sub-btn" id="luna-btn-open-dash" title="Megnyitás a Luna Dashboardon">
            <span>🚀 Dashboard</span>
          </button>
        </div>

        <!-- Beállítások Drawer -->
        \${showDrawer ? \`
          <div class="luna-drawer">
            <div style="font-weight: 700; color: #f1f5f9; margin-bottom: 4px;">⚙️ Luna Beállítások</div>
            <div>Dashboard Cím:</div>
            <input type="text" id="luna-input-dash-url" value="\${DASHBOARD_URL}" />
            <div style="display: flex; gap: 4px; margin-top: 6px;">
              <button class="luna-step-btn" id="luna-btn-reset-pos" style="flex:1;">Pozíció Visszaállítása</button>
              <button class="luna-step-btn" id="luna-btn-copy-clip" style="flex:1;">📋 Vágólapra Másolás</button>
            </div>
          </div>
        \` : ''}

      </div>
    \`;

    // Eseménykezelők hozzárendelése
    setupHUDEvents();
  }

  function setupHUDEvents() {
    if (!hudContainer) return;

    // Cím módosítása
    const titleInput = document.getElementById('luna-input-title');
    titleInput?.addEventListener('change', (e) => {
      currentAnime.title = e.target.value.trim() || currentAnime.title;
      broadcastData(currentAnime);
      showToast('Cím elmentve!');
    });

    // Epizód léptetők
    document.getElementById('luna-step-m5')?.addEventListener('click', () => {
      currentAnime.episode = Math.max(1, currentAnime.episode - 5);
      broadcastData(currentAnime);
      renderHUD();
      showToast(\`\${currentAnime.episode}. Rész\`);
    });
    document.getElementById('luna-step-m1')?.addEventListener('click', () => {
      currentAnime.episode = Math.max(1, currentAnime.episode - 1);
      broadcastData(currentAnime);
      renderHUD();
      showToast(\`\${currentAnime.episode}. Rész\`);
    });
    document.getElementById('luna-step-p1')?.addEventListener('click', () => {
      currentAnime.episode += 1;
      broadcastData(currentAnime);
      renderHUD();
      showToast(\`\${currentAnime.episode}. Rész (+1)\`);
    });
    document.getElementById('luna-step-p5')?.addEventListener('click', () => {
      currentAnime.episode += 5;
      broadcastData(currentAnime);
      renderHUD();
      showToast(\`\${currentAnime.episode}. Rész (+5)\`);
    });

    // Kézi epizódszám beírás
    document.getElementById('luna-ep-box')?.addEventListener('click', () => {
      const input = prompt("Add meg a jelenlegi epizódszámot:", currentAnime.episode);
      if (input && !isNaN(parseInt(input, 10))) {
        currentAnime.episode = parseInt(input, 10);
        broadcastData(currentAnime);
        renderHUD();
        showToast('Epizód frissítve!');
      }
    });

    // Státusz választó gombok
    document.querySelectorAll('.luna-status-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const st = e.currentTarget.getAttribute('data-status');
        currentAnime.status = st;
        broadcastData(currentAnime);
        renderHUD();
        showToast('Státusz rögzítve!');
      });
    });

    // Fő mentés és szinkron gomb
    document.getElementById('luna-btn-save-sync')?.addEventListener('click', () => {
      broadcastData(currentAnime);
      showToast('✓ Sikeresen szinkronizálva!');
      safeGM.notify({
        title: "🌙 Luna Anime Tracker",
        text: \`Szinkronizálva: \${currentAnime.title} (\${currentAnime.episode}. rész)\`,
        timeout: 2500
      });
    });

    // Dashboard megnyitása
    document.getElementById('luna-btn-open-dash')?.addEventListener('click', () => {
      window.open(DASHBOARD_URL, '_blank');
    });

    // Kicsinyítés
    document.getElementById('luna-btn-minimize')?.addEventListener('click', () => {
      isMiniMode = true;
      safeGM.setValue('luna_hud_minimized', true);
      renderHUD();
    });

    // Bezárás
    document.getElementById('luna-btn-close')?.addEventListener('click', () => {
      hudContainer.style.display = 'none';
      safeGM.notify({
        title: "Luna Panel elrejtve",
        text: "Nyomd le az Alt+L billentyűkombinációt a panel visszahozásához!",
        timeout: 3000
      });
    });

    // Beállítások Drawer toggle
    document.getElementById('luna-btn-drawer')?.addEventListener('click', () => {
      showDrawer = !showDrawer;
      renderHUD();
    });

    // Drawer mentések
    document.getElementById('luna-input-dash-url')?.addEventListener('change', (e) => {
      safeGM.setValue('luna_dashboard_url', e.target.value.trim());
      showToast('Dashboard URL mentve!');
    });

    document.getElementById('luna-btn-reset-pos')?.addEventListener('click', () => {
      safeGM.setValue('luna_hud_pos', { bottom: 24, right: 24 });
      hudContainer.style.bottom = '24px';
      hudContainer.style.right = '24px';
      hudContainer.style.top = '';
      hudContainer.style.left = '';
      showToast('Pozíció visszaállítva!');
    });

    document.getElementById('luna-btn-copy-clip')?.addEventListener('click', () => {
      const text = \`\${currentAnime.title} - \${currentAnime.episode}. rész (\${currentAnime.source})\`;
      safeGM.setClipboard(text);
      showToast('Vágólapra másolva!');
    });

    // Húzás (Drag & Drop) inicializálása
    setupDragging();
  }

  function setupDragging() {
    const handle = document.getElementById('luna-drag-handle');
    if (!handle || !hudContainer) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialRight = 0;
    let initialBottom = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.luna-header-tools')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = hudContainer.getBoundingClientRect();
      initialRight = window.innerWidth - rect.right;
      initialBottom = window.innerHeight - rect.bottom;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newRight = Math.max(10, Math.min(window.innerWidth - 360, initialRight - deltaX));
      const newBottom = Math.max(10, Math.min(window.innerHeight - 200, initialBottom - deltaY));

      hudContainer.style.right = newRight + 'px';
      hudContainer.style.bottom = newBottom + 'px';
    }

    function onMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const rect = hudContainer.getBoundingClientRect();
      const pos = {
        right: Math.round(window.innerWidth - rect.right),
        bottom: Math.round(window.innerHeight - rect.bottom)
      };
      safeGM.setValue('luna_hud_pos', pos);
    }
  }

  // 8. Globális Gyorsbillentyűk (Alt + L / Alt + Nyilak)
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.code === 'KeyL') {
      e.preventDefault();
      if (!hudContainer) {
        renderHUD();
      } else {
        hudContainer.style.display = hudContainer.style.display === 'none' ? 'block' : 'none';
      }
    }
    if (e.altKey && (e.code === 'ArrowRight' || e.code === 'ArrowUp')) {
      e.preventDefault();
      if (currentAnime) {
        currentAnime.episode += 1;
        broadcastData(currentAnime);
        renderHUD();
        showToast(\`+1 Epizód: \${currentAnime.episode}\`);
      }
    }
    if (e.altKey && (e.code === 'ArrowLeft' || e.code === 'ArrowDown')) {
      e.preventDefault();
      if (currentAnime && currentAnime.episode > 1) {
        currentAnime.episode -= 1;
        broadcastData(currentAnime);
        renderHUD();
        showToast(\`-1 Epizód: \${currentAnime.episode}\`);
      }
    }
  });

  // 9. Tampermonkey Menüparancsok
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand("🌙 Luna Grafikus HUD Panel Megnyitása", () => {
      if (hudContainer) hudContainer.style.display = 'block';
      isMiniMode = false;
      renderHUD();
    });
    GM_registerMenuCommand("⚡ Azonnali Mentés a Dashboardra", () => {
      if (!currentAnime) currentAnime = parseCurrentPage();
      broadcastData(currentAnime);
      safeGM.notify({
        title: "🌙 Luna Szinkronizálva",
        text: \`\${currentAnime.title} (\${currentAnime.episode}. rész)\`
      });
    });
  }

  // 10. Videólejátszó & Navigáció Figyelése
  function watchVideoElements() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.addEventListener('play', () => {
        if (!currentAnime) currentAnime = parseCurrentPage();
        broadcastData(currentAnime);
      }, { once: true });
    });
  }

  // SPA URL változás figyelése
  let previousUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== previousUrl) {
      previousUrl = window.location.href;
      currentAnime = parseCurrentPage();
      broadcastData(currentAnime);
      renderHUD();
    }
  }, 1000);

  // Indítás
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        renderHUD();
        watchVideoElements();
      }, 500);
    });
  } else {
    setTimeout(() => {
      renderHUD();
      watchVideoElements();
    }, 500);
  }

  setTimeout(renderHUD, 2000);

})();
`;
}

