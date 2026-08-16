// AUTO-GENERATED from public/Luna-Anime-Tracker.user.js (v6.0.0) — NE SZERKESZD KÉZZEL!
// Ha a userscript változik, a build lépés generálja újra ezt a fájlt.
export const TAMPERMONKEY_USERSCRIPT_CODE_RAW = `// ==UserScript==
// @name         Luna Anime Tracker HUD
// @namespace    https://luna.tracker.local/
// @version      6.1.0
// @description  Intelligens automatikus anime szinkronizálás és lebegő HUD magyar és nemzetközi anime oldalakhoz. Megbízható felhő-szinkron: KOZVETLEN Firestore írás (a weboldal azonnal látja), perzisztens várakozási sor, automatikus újrapróbálás, szerver-tartalék.
// @author       Luna
// @match        *://*.magyaranime.eu/*
// @match        *://*.magyaranime.hu/*
// @match        *://*.magyaranime.org/*
// @match        *://*.animek.hu/*
// @match        *://*.animek.net/*
// @match        *://*.onianime.hu/*
// @match        *://*.onianime.net/*
// @match        *://*.animegun.hu/*
// @match        *://*.animedrive.hu/*
// @match        *://*.sorozatbarat.club/*
// @match        *://*.sorozatbarat.hu/*
// @match        *://*.sorozat-barat.club/*
// @match        *://*.uraharashop.hu/*
// @match        *://*.naruto-kun.hu/*
// @match        *://*.dragonhall.hu/*
// @match        *://*.dragonhallplus.hu/*
// @match        *://*.animesziget.com/*
// @match        *://*.animesziget.hu/*
// @match        *://*.animecenter.hu/*
// @match        *://*.mutekifansub.hu/*
// @match        *://*.indavideo.hu/*
// @match        *://*.videa.hu/*
// @match        *://*.videakid.hu/*
// @match        *://*.hianime.to/*
// @match        *://*.aniwatch.to/*
// @match        *://*.zoro.to/*
// @match        *://*.zoro.vc/*
// @match        *://*.9animetv.to/*
// @match        *://*.aniwave.to/*
// @match        *://*.9anime.to/*
// @match        *://*.9anime.se/*
// @match        *://*.crunchyroll.com/*
// @match        *://*.gogoanime3.co/*
// @match        *://*.anitaku.to/*
// @match        *://*.gogoanime.pe/*
// @match        *://*.gogoanime.to/*
// @match        *://*.animepahe.ru/*
// @match        *://*.animepahe.org/*
// @match        *://*.animepahe.com/*
// @match        *://*.kickassanime.mx/*
// @match        *://*.kickassanime.am/*
// @match        *://*.animixplay.to/*
// @match        *://*/*
// @include      *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
// @connect      firestore.googleapis.com
// @connect      run.app
// @connect      localhost
// @run-at       document-start
// @noframes     false
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ============================================================
   * 0. SZIGORÚAN MEGADOTT OLDALAK WHITELISTJE
   * ============================================================ */
  const BUILTIN_ALLOWED_DOMAINS = [
    'magyaranime.eu',
    'magyaranime.hu',
    'magyaranime.org',
    'animek.hu',
    'animek.net',
    'onianime.hu',
    'onianime.net',
    'animegun.hu',
    'animedrive.hu',
    'sorozatbarat.club',
    'sorozatbarat.hu',
    'sorozat-barat.club',
    'uraharashop.hu',
    'naruto-kun.hu',
    'dragonhall.hu',
    'dragonhallplus.hu',
    'animesziget.com',
    'animesziget.hu',
    'animecenter.hu',
    'mutekifansub.hu',
    'indavideo.hu',
    'videa.hu',
    'videakid.hu',

    // Nemzetközi
    'hianime.to',
    'aniwatch.to',
    'aniwatchtv.to',
    'zoro.to',
    'zoro.vc',
    '9animetv.to',
    'aniwave.to',
    '9anime.to',
    '9anime.se',
    'crunchyroll.com',
    'gogoanime3.co',
    'anitaku.to',
    'gogoanime.pe',
    'gogoanime.to',
    'animepahe.ru',
    'animepahe.org',
    'animepahe.com',
    'kickassanime.mx',
    'kickassanime.am',
    'animixplay.to'
  ];

  /* ============================================================
   * 1. BIZTONSÁGOS TÁROLÓ (GM_* -> localStorage fallback)
   * ============================================================ */
  const Storage = (() => {
    const LS_PREFIX = 'luna_hud_';
    const gmAvailable =
      typeof GM_getValue === 'function' && typeof GM_setValue === 'function';

    function lsGet(key, def) {
      try {
        const raw = localStorage.getItem(LS_PREFIX + key);
        return raw === null ? def : JSON.parse(raw);
      } catch (e) {
        return def;
      }
    }
    function lsSet(key, val) {
      try {
        localStorage.setItem(LS_PREFIX + key, JSON.stringify(val));
      } catch (e) {
        /* csendes fallback */
      }
    }

    return {
      get(key, def) {
        if (gmAvailable) {
          try {
            const v = GM_getValue(key, undefined);
            if (v !== undefined) return v;
          } catch (e) {}
        }
        return lsGet(key, def);
      },
      set(key, val) {
        if (gmAvailable) {
          try {
            GM_setValue(key, val);
            return;
          } catch (e) {}
        }
        lsSet(key, val);
      },
    };
  })();

  function notify(title, text) {
    try {
      if (typeof GM_notification === 'function') {
        GM_notification({ title, text, timeout: 3000 });
        return;
      }
    } catch (e) {}
    console.log('[Luna HUD]', title, '-', text);
  }

  function getAllowedDomains() {
    const custom = Storage.get('custom_allowed_domains', []);
    const merged = new Set([...BUILTIN_ALLOWED_DOMAINS, ...custom]);
    return Array.from(merged);
  }

  const currentHost = (window.location.hostname || '').toLowerCase();
  const isDashboardHost = currentHost.includes('run.app') ||
                          currentHost.includes('localhost') ||
                          window.location.port === '3000' ||
                          currentHost.includes('firebaseapp.com') ||
                          currentHost.includes('web.app');

  if (isDashboardHost) {
    try {
      if (window.location.origin && window.location.origin.startsWith('http')) {
        Storage.set('luna_custom_server_url', window.location.origin);
      }
    } catch (e) {}
  }

  function isCurrentSiteAllowed() {
    if (!currentHost) return false;
    if (isDashboardHost) return true;

    if (window.self !== window.top) {
      const isPlayer = window.location.href.match(/videa|indavideo|embed|player|video|stream/i);
      if (!isPlayer) return false;
    }

    const allowed = getAllowedDomains();
    return allowed.some(domain => {
      const d = domain.toLowerCase().trim();
      return currentHost === d || currentHost.endsWith('.' + d);
    });
  }

  if (!isCurrentSiteAllowed()) {
    try {
      if (typeof GM_registerMenuCommand === 'function') {
        const curHost = window.location.hostname;
        GM_registerMenuCommand(\`➕ \${curHost} engedélyezése a Luna Trackerben\`, () => {
          const custom = Storage.get('custom_allowed_domains', []);
          if (!custom.includes(curHost)) {
            custom.push(curHost);
            Storage.set('custom_allowed_domains', custom);
            notify('🌙 Luna Tracker', \`\${curHost} hozzáadva a megfigyelt oldalakhoz!\`);
            setTimeout(() => location.reload(), 1000);
          }
        });
      }
    } catch (e) {}
    return;
  }

  /* ============================================================
   * 2. INTELLIGENS MAGYAR & NEMZETKÖZI ANIME FELISMERŐ MOTOR
   * ============================================================ */

  const SITE_BRAND_NAMES = [
    'magyaranime', 'magyar anime', 'magyaranime.hu', 'magyaranime.eu', 'magyaranime.org',
    'onianime', 'oni anime', 'onianime.hu', 'onianime.net',
    'animegun', 'anime gun', 'animegun.hu',
    'animedrive', 'anime drive', 'animedrive.hu',
    'dragonhall', 'dragon hall', 'dragonhall+', 'dragon hall+', 'dragonhall.hu', 'dragonhallplus.hu',
    'indavideo', 'indavideo.hu',
    'videa', 'videa.hu', 'videakid', 'videakid.hu',
    'sorozatbarat', 'sorozatbarat.club', 'sorozatbarat.hu', 'sorozat-barat.club',
    'animesziget', 'animesziget.hu', 'animesziget.com',
    'animecenter', 'animecenter.hu',
    'mutekifansub', 'uraharashop', 'naruto-kun',
    'hianime', 'hianime.to', 'aniwatch', 'aniwatch.to', 'aniwatchtv.to',
    'zoro', 'zoro.to', '9anime', '9animetv.to', 'aniwave', 'aniwave.to',
    'crunchyroll', 'crunchyroll.com', 'gogoanime', 'anitaku', 'animepahe',
    'kickassanime', 'animixplay',
    'streamtape', 'uptostream', 'doodstream', 'dood', 'mixdrop', 'voe', 'streamwish', 'supervideo',
    'dailymotion', 'youtube', 'facebook',
    'főoldal', 'fooldal', 'online nézés', 'anime lejátszó'
  ];

  const JUNK_PHRASES = [
    'magyar felirattal',
    'magyar felirat',
    'magyar szinkronnal',
    'magyar szinkron',
    'magyar fel.',
    'magyar fel',
    'magyar szink.',
    'magyar szink',
    'magyarul',
    'felirattal',
    'felirat',
    'szinkronnal',
    'szinkron',
    'online anime',
    'anime online',
    'teljes anime',
    'online sorozat',
    'online reszek',
    'online részek',
    'online nézés',
    'online',
    'ingyen',
    'nézés',
    'nezes',
    'letöltés',
    'letoltes',
    'full hd',
    '1080p',
    '720p',
    '480p',
    '4k',
    'hd',
    'bdrip',
    'web-dl',
    'bluray',
    'dvdrip',
    'eng sub',
    'eng dub',
    'sub',
    'dub',
    'epizódok',
    'epizodok',
    'videó',
    'video'
  ];

  function isSiteBrand(part) {
    if (!part) return true;
    const clean = part.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    if (clean.length < 2) return true;
    return SITE_BRAND_NAMES.some(brand => {
      const b = brand.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
      return clean === b || clean.includes(b);
    });
  }

  function cleanTitle(raw) {
    if (!raw) return '';
    let text = String(raw).trim();

    text = text.replace(/\\[(?:magyar felirat|magyar szinkron|animedrive|dh\\+|hd|1080p|720p|indavideo|videa|sub|dub|[^\\]]{1,20})\\]/gi, ' ');
    text = text.replace(/\\((?:magyar felirat|magyar szinkron|1080p|720p|hd|sub|dub)\\)/gi, ' ');

    const parts = text.split(/\\s*[\\–\\—\\|\\»\\•]\\s*|\\s+-\\s+|\\s+\\/\\s+/);
    if (parts.length > 1) {
      const validCandidates = parts.map(p => p.trim()).filter(p => !isSiteBrand(p) && p.length > 2);
      if (validCandidates.length > 0) {
        text = validCandidates[0];
      } else {
        text = parts[0];
      }
    }

    for (const junk of JUNK_PHRASES) {
      const regex = new RegExp('\\\\b' + junk.replace('.', '\\\\.') + '\\\\b', 'gi');
      text = text.replace(regex, ' ');
    }

    text = text.replace(/\\b\\d{1,4}\\s*[\\.\\-]?\\s*(?:rész|resz|epizód|epizod|episode|ep)\\b/gi, ' ');
    text = text.replace(/(?:rész|resz|epizód|epizod|episode|ep)\\s*[:\\-#]?\\s*\\d{1,4}\\b/gi, ' ');
    text = text.replace(/\\b[eE]\\d{1,4}\\b/g, ' ');

    text = text.replace(/_/g, ' ');
    text = text.replace(/\\s{2,}/g, ' ');
    text = text.replace(/^[\\s\\-\\.\\:\\|,;\\/]+|[\\s\\-\\.\\:\\|,;\\/]+$/g, '');

    return text.trim();
  }

  function detectTitle() {
    const hostname = window.location.hostname.toLowerCase();

    if (hostname.includes('magyaranime')) {
      const el = document.querySelector('.play-title, .anime-title, .entry-title, .film-name, .breadcrumb li:nth-last-child(2) a, .breadcrumb li:last-child');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (hostname.includes('onianime')) {
      const el = document.querySelector('.anime-title, .film-name a, .entry-title, .title-wrapper h1, h1');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (hostname.includes('animegun')) {
      const el = document.querySelector('.anime-header-title, .entry-title, .video-title, h1');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (hostname.includes('videa')) {
      const el = document.querySelector('#video-title, .v-title, .video-info-title, h1.title, h1');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (hostname.includes('indavideo')) {
      const el = document.querySelector('h1.video-title, .video-details h1, .title_container h1, h1');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (hostname.includes('sorozatbarat')) {
      const el = document.querySelector('h1.entry-title, .film-data h1, .breadcrumb a:last-child');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (hostname.includes('hianime') || hostname.includes('aniwatch') || hostname.includes('zoro')) {
      const el = document.querySelector('.anisc-detail .film-name a, .film-name a, .dynamic-name, h2.film-name, .film-name');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2) return { title: c, confident: true };
      }
    }

    if (hostname.includes('crunchyroll')) {
      const el = document.querySelector('h1.title, a.show-title-link, .current-media-parent-title');
      if (el && el.textContent) {
        const c = cleanTitle(el.textContent);
        if (c.length >= 2) return { title: c, confident: true };
      }
    }

    const og = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
    if (og && og.content) {
      const c = cleanTitle(og.content);
      if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
    }

    const genericSelectors = [
      'h1.entry-title',
      'h1.anime-title',
      '.video-info h1',
      'h1.title',
      '.video-title',
      '.anime-header-title',
      '.film-name',
      '.play-title',
      '.anime-data h1',
      'h1'
    ];
    for (const sel of genericSelectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent && el.textContent.trim().length > 2) {
        const c = cleanTitle(el.textContent.trim());
        if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
      }
    }

    if (document.title) {
      const c = cleanTitle(document.title);
      if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: c.length >= 4 };
    }

    return { title: 'Anime Sorozat', confident: false };
  }

  function detectEpisode() {
    const url = location.href;

    try {
      const u = new URL(url);
      for (const key of ['resz', 'ep', 'episode', 'e', 'res', 'epizod', 'part', 'track']) {
        const v = u.searchParams.get(key);
        if (v && /^\\d{1,4}$/.test(v)) {
          return { ep: parseInt(v, 10), found: true };
        }
      }
    } catch (e) {}

    const urlPatterns = [
      /[\\/\\-_](?:ep|episode|resz|rész|epizod|epizód)[\\-_\\/]?(\\d{1,4})/i,
      /[\\/\\-_](\\d{1,4})[\\-_.\\/](?:resz|rész|ep|episode)/i,
      /[\\/\\-_]e(\\d{1,4})(?:[\\/\\-_]|$)/i,
      /s\\d{1,2}e(\\d{1,4})/i,
      /(\\d{1,4})-(?:resz|rész)/i,
      /(?:resz|rész)-(\\d{1,4})/i,
      /(\\d{1,4})\\.(?:resz|rész)/i
    ];
    for (const p of urlPatterns) {
      const m = url.match(p);
      if (m) return { ep: parseInt(m[1], 10), found: true };
    }

    const epSelectors = [
      'select.epizod-valaszto option:checked',
      '.episode-current',
      '.episode-number',
      '.ep-number',
      '[data-episode]',
      '.current-episode',
      '.active .ep-item',
      '.episodes-list .active',
      '.epizodok a.active',
      '.ssl-item.ep-item.active',
      '.ep-item.active'
    ];
    for (const sel of epSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const v = el.getAttribute('data-episode') || el.getAttribute('data-number') || el.value || el.textContent;
        const m = String(v).match(/\\d{1,4}/);
        if (m) return { ep: parseInt(m[0], 10), found: true };
      }
    }

    const text = (document.title || '') + ' ' + (document.body?.innerText?.slice(0, 3000) || '');
    const textPatterns = [
      /(\\d{1,4})\\s*\\.\\s*(?:rész|resz|epizód|epizod)/i,
      /(?:rész|resz|epizód|epizod|episode|ep)\\s*[:\\-]?\\s*(\\d{1,4})/i,
      /\\b(?:0*(\\d{1,4}))\\s*(?:rész|resz)\\b/i,
      /\\bE(?:p)?\\s*(\\d{1,4})\\b/i,
      /\\bs\\d{1,2}e(\\d{1,4})\\b/i
    ];
    for (const p of textPatterns) {
      const m = text.match(p);
      if (m) return { ep: parseInt(m[1], 10), found: true };
    }

    return { ep: 1, found: false };
  }

  /* ============================================================
   * 3. ÁLLAPOT
   * ============================================================ */
  const state = {
    title: 'Anime Sorozat',
    episode: 1,
    totalEpisodes: null,
    status: Storage.get('status', 'watching'),
    minimized: Storage.get('minimized', false),
    hidden: false,
    editMode: false,
    manualOverride: false,
    pos: Storage.get('pos', { right: 20, bottom: 20 }),
    source: location.hostname || 'Anime Oldal',
    sourceUrl: location.href,
    titleConfident: false,
    episodeFound: false,
    lastSync: null,
    syncCount: 0,
    cloudSyncOk: false,
    pendingSync: 0
  };

  /* ============================================================
   * 4. STÍLUSOK (Modern, Letisztult, Zavarmentes)
   * ============================================================ */
  const CSS = \`
    #luna-hud-root {
      position: fixed !important;
      right: 20px;
      bottom: 20px;
      z-index: 2147483647 !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      pointer-events: auto !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      line-height: normal !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    }
    #luna-hud-root * {
      box-sizing: border-box !important;
      font-family: inherit !important;
      margin: 0;
      padding: 0;
    }
    .luna-panel {
      width: 330px !important;
      background: rgba(10, 15, 30, 0.96) !important;
      backdrop-filter: blur(20px) saturate(160%) !important;
      -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
      border: 1.5px solid rgba(56, 189, 248, 0.5) !important;
      border-radius: 18px !important;
      box-shadow: 0 0 32px rgba(6, 182, 212, 0.35),
                  0 14px 44px rgba(0, 0, 0, 0.85),
                  inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
      color: #e2f3ff !important;
      overflow: hidden !important;
      transition: all 0.25s ease !important;
    }
    .luna-panel:hover {
      box-shadow: 0 0 42px rgba(6, 182, 212, 0.55),
                  0 18px 50px rgba(0, 0, 0, 0.9),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
    }
    .luna-header {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 10px 14px !important;
      background: linear-gradient(90deg, rgba(6, 182, 212, 0.25), rgba(56, 189, 248, 0.1)) !important;
      border-bottom: 1px solid rgba(56, 189, 248, 0.3) !important;
      cursor: grab !important;
    }
    .luna-header:active { cursor: grabbing !important; }
    .luna-logo {
      font-size: 13px !important;
      font-weight: 800 !important;
      background: linear-gradient(90deg, #06b6d4, #38bdf8, #a5f3fc) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      white-space: nowrap !important;
      letter-spacing: 0.5px !important;
    }
    .luna-status-dot {
      width: 9px !important;
      height: 9px !important;
      border-radius: 50% !important;
      background: #22c55e !important;
      box-shadow: 0 0 10px #22c55e !important;
      animation: luna-pulse 1.6s ease-in-out infinite !important;
      flex-shrink: 0 !important;
    }
    @keyframes luna-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.45; transform: scale(0.85); }
    }
    .luna-site-badge {
      margin-left: auto !important;
      font-size: 10px !important;
      padding: 2px 7px !important;
      border-radius: 999px !important;
      background: rgba(56, 189, 248, 0.15) !important;
      border: 1px solid rgba(56, 189, 248, 0.4) !important;
      color: #7dd3fc !important;
      max-width: 100px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      font-weight: 600 !important;
    }
    .luna-actions {
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
      flex-shrink: 0 !important;
    }
    .luna-icon-btn {
      background: rgba(56, 189, 248, 0.15) !important;
      border: 1px solid rgba(56, 189, 248, 0.35) !important;
      color: #7dd3fc !important;
      border-radius: 7px !important;
      width: 24px !important;
      height: 24px !important;
      font-size: 12px !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.15s ease !important;
      flex-shrink: 0 !important;
    }
    .luna-icon-btn:hover {
      background: rgba(56, 189, 248, 0.35) !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.6) !important;
      color: #fff !important;
    }
    .luna-icon-btn.active {
      background: #06b6d4 !important;
      color: #04121c !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.8) !important;
    }
    .luna-body {
      padding: 12px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
    }

    .luna-auto-card {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(15, 23, 42, 0.6)) !important;
      border: 1px solid rgba(56, 189, 248, 0.35) !important;
      border-radius: 14px !important;
      padding: 12px !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      position: relative !important;
    }
    .luna-auto-top {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 6px !important;
    }
    .luna-auto-pill-badge {
      display: inline-flex !important;
      align-items: center !important;
      gap: 5px !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      color: #34d399 !important;
      background: rgba(16, 185, 129, 0.15) !important;
      border: 1px solid rgba(16, 185, 129, 0.4) !important;
      padding: 2px 8px !important;
      border-radius: 999px !important;
    }
    .luna-auto-edit-hint {
      font-size: 10px !important;
      color: #7dd3fc !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 3px !important;
      opacity: 0.85 !important;
      transition: opacity 0.15s ease !important;
    }
    .luna-auto-edit-hint:hover {
      opacity: 1 !important;
      color: #fff !important;
      text-decoration: underline !important;
    }
    .luna-anime-title {
      font-size: 14px !important;
      font-weight: 800 !important;
      color: #f0f9ff !important;
      line-height: 1.3 !important;
      word-break: break-word !important;
    }
    .luna-anime-ep-row {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
    }
    .luna-anime-ep-badge {
      display: inline-flex !important;
      align-items: center !important;
      padding: 3px 10px !important;
      border-radius: 8px !important;
      background: #06b6d4 !important;
      color: #04121c !important;
      font-weight: 800 !important;
      font-size: 13px !important;
      font-family: ui-monospace, monospace !important;
      box-shadow: 0 0 12px rgba(6, 182, 212, 0.5) !important;
    }
    .luna-anime-status-tag {
      font-size: 11px !important;
      color: #94a3b8 !important;
      font-weight: 600 !important;
    }
    .luna-sync-bar {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      font-size: 10px !important;
      color: #64748b !important;
      padding: 0 4px !important;
      font-family: ui-monospace, monospace !important;
    }
    .luna-sync-bar-left {
      display: flex !important;
      align-items: center !important;
      gap: 5px !important;
    }
    .luna-sync-dot {
      width: 6px !important;
      height: 6px !important;
      border-radius: 50% !important;
      background: #10b981 !important;
      flex-shrink: 0 !important;
    }
    .luna-sync-dot.pending {
      background: #f59e0b !important;
      box-shadow: 0 0 8px #f59e0b !important;
    }
    .luna-sync-text {
      max-width: 210px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .luna-edit-form {
      display: flex !important;
      flex-direction: column !important;
      gap: 10px !important;
      background: rgba(0, 0, 0, 0.3) !important;
      padding: 10px !important;
      border-radius: 12px !important;
      border: 1px dashed rgba(56, 189, 248, 0.3) !important;
    }
    .luna-label {
      font-size: 10px !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      color: #7dd3fc !important;
      margin-bottom: 3px !important;
    }
    .luna-title-input {
      width: 100% !important;
      padding: 8px 10px !important;
      background: rgba(15, 23, 42, 0.9) !important;
      border: 1px solid rgba(56, 189, 248, 0.4) !important;
      border-radius: 8px !important;
      color: #fff !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      outline: none !important;
    }
    .luna-title-input:focus {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.4) !important;
    }
    .luna-ep-row {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
    }
    .luna-ep-btn {
      padding: 6px 9px !important;
      background: rgba(56, 189, 248, 0.15) !important;
      border: 1px solid rgba(56, 189, 248, 0.3) !important;
      color: #7dd3fc !important;
      border-radius: 6px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
    }
    .luna-ep-btn:hover {
      background: rgba(56, 189, 248, 0.3) !important;
      color: #fff !important;
    }
    .luna-ep-input {
      flex: 1 !important;
      padding: 6px !important;
      background: rgba(15, 23, 42, 0.9) !important;
      border: 1px solid rgba(56, 189, 248, 0.4) !important;
      border-radius: 6px !important;
      color: #67e8f9 !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      text-align: center !important;
      outline: none !important;
      font-family: ui-monospace, monospace !important;
    }
    .luna-status-select {
      width: 100% !important;
      padding: 6px 8px !important;
      background: rgba(15, 23, 42, 0.9) !important;
      border: 1px solid rgba(56, 189, 248, 0.4) !important;
      border-radius: 8px !important;
      color: #bae6fd !important;
      font-size: 11px !important;
      outline: none !important;
      cursor: pointer !important;
    }
    .luna-edit-btns {
      display: flex !important;
      gap: 6px !important;
      margin-top: 4px !important;
    }
    .luna-save-btn {
      flex: 1 !important;
      padding: 8px !important;
      border-radius: 8px !important;
      border: none !important;
      font-size: 12px !important;
      font-weight: 800 !important;
      color: #04121c !important;
      background: linear-gradient(90deg, #06b6d4, #38bdf8) !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      box-shadow: 0 0 14px rgba(6, 182, 212, 0.4) !important;
    }
    .luna-save-btn:hover {
      box-shadow: 0 0 22px rgba(6, 182, 212, 0.8) !important;
      transform: translateY(-1px) !important;
    }
    .luna-revert-btn {
      padding: 8px 12px !important;
      background: rgba(255, 255, 255, 0.08) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      color: #94a3b8 !important;
      border-radius: 8px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
    }
    .luna-revert-btn:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      color: #fff !important;
    }

    .luna-pill {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 7px 12px !important;
      background: rgba(10, 15, 30, 0.94) !important;
      backdrop-filter: blur(16px) !important;
      -webkit-backdrop-filter: blur(16px) !important;
      border: 1.5px solid rgba(56, 189, 248, 0.5) !important;
      border-radius: 999px !important;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.35),
                  0 6px 20px rgba(0, 0, 0, 0.6) !important;
      color: #e2f3ff !important;
      font-size: 12px !important;
      cursor: grab !important;
      max-width: 380px !important;
    }
    .luna-pill:active { cursor: grabbing !important; }
    .luna-pill-dot {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      background: #22c55e !important;
      box-shadow: 0 0 10px #22c55e !important;
      animation: luna-pulse 1.6s ease-in-out infinite !important;
      flex-shrink: 0 !important;
    }
    .luna-pill-dot.pending {
      background: #f59e0b !important;
      box-shadow: 0 0 10px #f59e0b !important;
    }
    .luna-pill-title {
      max-width: 140px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
      font-weight: 700 !important;
      color: #bae6fd !important;
    }
    .luna-pill-ep {
      font-weight: 800 !important;
      color: #67e8f9 !important;
      text-shadow: 0 0 8px rgba(103, 232, 249, 0.8) !important;
      white-space: nowrap !important;
      font-family: ui-monospace, monospace !important;
    }
    .luna-pill-edit {
      background: none !important;
      border: none !important;
      color: #7dd3fc !important;
      cursor: pointer !important;
      font-size: 13px !important;
      padding: 2px !important;
    }
    .luna-pill-edit:hover { color: #fff !important; }
    .luna-pill-expand {
      background: none !important;
      border: none !important;
      color: #7dd3fc !important;
      cursor: pointer !important;
      font-size: 14px !important;
      padding: 2px !important;
      line-height: 1 !important;
    }

    .luna-toast {
      position: fixed !important;
      bottom: 90px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      background: rgba(10, 15, 30, 0.95) !important;
      border: 1px solid rgba(56, 189, 248, 0.6) !important;
      border-radius: 10px !important;
      color: #bae6fd !important;
      padding: 8px 16px !important;
      font-size: 12px !important;
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.5) !important;
      animation: luna-toast-in 0.25s ease !important;
      pointer-events: none !important;
      font-weight: 600 !important;
    }
    @keyframes luna-toast-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  \`;

  function injectCSS() {
    try {
      if (typeof GM_addStyle === 'function') {
        GM_addStyle(CSS);
        return;
      }
    } catch (e) {}
    const s = document.createElement('style');
    s.id = 'luna-hud-styles';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /* ============================================================
   * 5. MEGbíZHATÓ FELHŐ-SZINKRONIZÁCIÓ (v6.1)
   * ------------------------------------------------------------
   * Design:
   *   - ELSŐDLEGES ÚTVONAL: közvetlen Firestore REST írás (API kulccsal,
   *     a firestore.rules az anime_tracks kollekciót auth nélkül engedi).
   *     Így NEM kell hozzá sem Express szerver, sem deploy — a weboldal
   *     élő onSnapshot előfizetése azonnal megkapja az új állapotot.
   *   - TARTALÉK ÚTVONAL: ha a Firestore írás nem megy (pl. a szabályok
   *     megváltoznak), a régi /api/sync szervereket próbálja sorban.
   *   - Minden epizód-frissítés ELŐSZÖR perzisztens várakozási sorba
   *     kerül (GM_setValue / localStorage), és csak utána indul a küldés.
   *     Egy sikertelen küldés így SOSEM vesz el adatot.
   *   - Sikertelen küldésnél exponenciális backoff (15s -> 5 perc),
   *     20 másodpercenkénti automata flush ciklussal.
   *   - 'online' böngésző-eseményre és fül visszaváltásra azonnal
   *     újrapróbálkozik.
   *   - Minden esemény egyedi eventId-vel és clientTimestamp-pel indul;
   *     a Firestore írás is last-write-wins ütközéskezelést végez
   *     (a régebbi esemény nem írja felül az újabbat).
   *   - Ugyanarra a címre vonatkozó sorban álló frissítések összeolvadnak
   *     (coalesce): mindig csak a legfrissebb állapot vár küldésre.
   * ============================================================ */
  const SYNC_VERSION = 6;

  // Ugyanaz a Firebase projekt, amit a weboldal használ (src/firebase/config.ts)
  const FIRESTORE_CONFIG = {
    projectId: 'gen-lang-client-0003317395',
    databaseId: 'ai-studio-lunaanimetracker-5c5a6687-bf5d-4dc5-81e8-b9c87e1f2c97',
    apiKey: 'AIzaSyBT6F3vhAO_P-wb_PosgULeT-D-zwR0Mjo'
  };

  const DEFAULT_CLOUD_SERVERS = [
    'https://ais-dev-haau57gidvc74j2nnjloyk-452811031712.europe-west2.run.app',
    'https://ais-pre-haau57gidvc74j2nnjloyk-452811031712.europe-west2.run.app',
    'http://localhost:3000'
  ];

  const SYNC_KEYS = {
    queue: 'sync_queue_v6',
    activeServer: 'active_server_v6',
    deviceId: 'device_id_v6'
  };

  const SYNC_CONFIG = {
    flushIntervalMs: 20000,   // rendszeres automata újrapróbálás
    debounceMs: 1500,         // ennyi időn belüli változások egy csomagban indulnak
    requestTimeoutMs: 10000,  // egy kérés maximális várakozási ideje
    maxQueueSize: 200,        // várakozási sor felső korlát
    maxAttempts: 240,         // ennyi próbálkozás után dobja el (napokig próbálkozik)
    baseBackoffMs: 15000,     // exponenciális backoff kezdő értéke
    maxBackoffMs: 300000,     // backoff felső korlátja (5 perc)
    maxItemsPerFlush: 10      // egy flush alatt legfeljebb ennyi elemet küld el
  };

  function uid() {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
    } catch (e) {}
    return 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  let bc = null;
  try {
    bc = new BroadcastChannel('luna_anime_realtime_channel');
  } catch (e) {
    bc = null;
  }

  const SyncEngine = (() => {
    let queue = [];
    let debounceTimer = null;
    let loopTimer = null;
    let flushing = false;
    let queueCb = null;
    let ackCb = null;

    function loadQueue() {
      const q = Storage.get(SYNC_KEYS.queue, []);
      queue = Array.isArray(q) ? q.filter(it => it && it.payload && it.payload.title) : [];
    }

    function persistQueue() {
      Storage.set(SYNC_KEYS.queue, queue);
      emitQueue();
    }

    function emitQueue() {
      if (typeof queueCb === 'function') {
        try { queueCb(queue.length); } catch (e) {}
      }
    }

    function serverList() {
      const list = [];
      const custom = String(Storage.get('luna_custom_server_url', '') || '').trim().replace(/\\/+$/, '');
      if (/^https?:\\/\\//i.test(custom) && !list.includes(custom)) list.push(custom);
      for (const s of DEFAULT_CLOUD_SERVERS) {
        const base = s.replace(/\\/+$/, '');
        if (!list.includes(base)) list.push(base);
      }
      return list;
    }

    function activeIndex() {
      const i = parseInt(Storage.get(SYNC_KEYS.activeServer, 0), 10);
      const list = serverList();
      if (isNaN(i) || i < 0 || i >= list.length) return 0;
      return i;
    }

    function setActiveIndex(i) {
      Storage.set(SYNC_KEYS.activeServer, i);
    }

    function getDeviceId() {
      let id = Storage.get(SYNC_KEYS.deviceId, '');
      if (!id) {
        id = 'luna-' + uid();
        Storage.set(SYNC_KEYS.deviceId, id);
      }
      return id;
    }

    function normalizedTitle(t) {
      return String(t || '').toLowerCase().replace(/\\s+/g, ' ').trim();
    }

    function enqueue(payload) {
      loadQueue();

      const item = {
        eventId: payload.eventId || uid(),
        payload: payload,
        attempts: 0,
        nextAttempt: 0,
        createdAt: Date.now()
      };

      // Coalesce: ugyanerre a címre már várakozó (régebbi) frissítést
      // felváltja a legfrissebb állapot, ne duzzadjon a sor.
      const norm = normalizedTitle(payload.title);
      queue = queue.filter(it => normalizedTitle(it.payload && it.payload.title) !== norm);

      queue.push(item);
      if (queue.length > SYNC_CONFIG.maxQueueSize) {
        queue = queue.slice(queue.length - SYNC_CONFIG.maxQueueSize);
      }

      persistQueue();
      scheduleFlush(SYNC_CONFIG.debounceMs);
    }

    // Egy HTTP kérés ígéret formájában. GM_xmlhttpRequest-t használ, ha
    // elérhető (CORS-mentes), különben sima fetch fallbackkel.
    function httpRequest(method, url, payload) {
      return new Promise((resolve) => {
        const body = payload === null || payload === undefined ? null : JSON.stringify(payload);
        const done = (ok, status, data) => resolve({ ok, status, data });

        if (typeof GM_xmlhttpRequest === 'function') {
          try {
            const opts = {
              method: method,
              url: url,
              headers: {
                'Accept': 'application/json'
              },
              timeout: SYNC_CONFIG.requestTimeoutMs,
              onload: function (resp) {
                let data = null;
                try { data = JSON.parse(resp.responseText); } catch (e) {}
                done(resp.status >= 200 && resp.status < 300, resp.status, data);
              },
              onerror: function () { done(false, 0, null); },
              ontimeout: function () { done(false, 0, null); }
            };
            if (body !== null) {
              opts.headers['Content-Type'] = 'application/json';
              opts.data = body;
            }
            GM_xmlhttpRequest(opts);
            return;
          } catch (e) {
            /* esés a fetch fallbackre */
          }
        }

        let signal = undefined;
        let timer = null;
        try {
          if (typeof AbortController !== 'undefined') {
            const ctrl = new AbortController();
            signal = ctrl.signal;
            timer = setTimeout(() => ctrl.abort(), SYNC_CONFIG.requestTimeoutMs);
          }
        } catch (e) {}

        fetch(url, {
          method: method,
          headers: body !== null
            ? { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            : { 'Accept': 'application/json' },
          mode: 'cors',
          body: body === null ? undefined : body,
          signal: signal
        })
          .then(function (res) {
            return res.json().catch(() => null).then(function (data) {
              done(res.ok, res.status, data);
            });
          })
          .catch(function () { done(false, 0, null); })
          .then(function () { if (timer) clearTimeout(timer); });
      });
    }

    /* ---- KOZVETLEN FIRESTORE REST UTVONAL (elsodleges) ---- */

    const FS_ROOT = 'https://firestore.googleapis.com/v1/projects/' +
      FIRESTORE_CONFIG.projectId + '/databases/' +
      encodeURIComponent(FIRESTORE_CONFIG.databaseId) + '/documents';

    let fsTracksCache = { at: 0, list: null };

    // Firestore tipusost (stringValue / integerValue / ...) sima erteke alakit
    function fsUntype(v) {
      if (!v || typeof v !== 'object') return undefined;
      if (typeof v.stringValue === 'string') return v.stringValue;
      if (typeof v.integerValue !== 'undefined') return parseInt(v.integerValue, 10);
      if (typeof v.doubleValue !== 'undefined') return Number(v.doubleValue);
      if (typeof v.booleanValue !== 'undefined') return !!v.booleanValue;
      if (v.timestampValue) return v.timestampValue;
      if (v.arrayValue && Array.isArray(v.arrayValue.values)) {
        return v.arrayValue.values.map(function (x) { return fsUntype(x); });
      }
      return undefined;
    }

    // Sima ertek Firestore tipusost mezo alakit
    function fsTyped(v) {
      if (v === null || v === undefined) return null;
      if (typeof v === 'boolean') return { booleanValue: v };
      if (typeof v === 'number') {
        return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
      }
      if (Array.isArray(v)) {
        return { arrayValue: { values: v.map(function (x) { return fsTyped(x); }) } };
      }
      return { stringValue: String(v) };
    }

    // Ugyanaz a determinisztikus ID, amit a server.ts generateSafeTrackId-je
    function fsSafeTrackId(title) {
      const normalized = String(title || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      return normalized || ('anime_' + Date.now());
    }

    // Ugyanaz a normalizalt cim-osszehasonlitas, mint a szerveren
    function fsNormalizeForCompare(s) {
      return String(s || '').toLowerCase().replace(/[^a-z0-9áéíóöőúüű]/gi, '').trim();
    }

    // Kollekció listázása (60 mp cache) a cím -> docId párosításhoz
    function fsListTracks(force) {
      if (!force && fsTracksCache.list && Date.now() - fsTracksCache.at < 60000) {
        return Promise.resolve(fsTracksCache.list);
      }
      const url = FS_ROOT + '/anime_tracks?pageSize=300&key=' + FIRESTORE_CONFIG.apiKey;
      return httpRequest('GET', url, null).then(function (r) {
        if (!r.ok || !r.data || !Array.isArray(r.data.documents)) {
          return null; // hiba — a hívó a tartalék szerverekre esik vissza
        }
        const list = r.data.documents.map(function (d) {
          const nameParts = String(d.name || '').split('/');
          return {
            docId: nameParts[nameParts.length - 1],
            title: fsUntype(d.fields && d.fields.title) || '',
            lastClientTimestamp: fsUntype(d.fields && d.fields.lastClientTimestamp)
          };
        });
        fsTracksCache = { at: Date.now(), list: list };
        return list;
      });
    }

    // Közvetlen upsert a Firestore-ba. Visszatérési értékek a sendItem
    // konvenciója szerint: 'ack' (created/updated/skipped_stale) vagy 'retry'.
    function fsUpsertTrack(payload) {
      return fsListTracks(false).then(function (list) {
        if (list === null) return { result: 'retry', server: 'firestore' };

        const targetNorm = fsNormalizeForCompare(payload.title);
        const safeId = fsSafeTrackId(payload.title);
        const cleanTitle = String(payload.title || '').toLowerCase().trim();

        let docId = null;
        let existingTs = undefined;
        for (const t of list) {
          const itemNorm = fsNormalizeForCompare(t.title);
          if (t.docId === safeId ||
              (t.title && t.title.toLowerCase().trim() === cleanTitle) ||
              (targetNorm.length > 2 && itemNorm === targetNorm)) {
            docId = t.docId;
            existingTs = t.lastClientTimestamp;
            break;
          }
        }
        const isNew = !docId;
        if (isNew) docId = safeId;

        // Last-write-wins: az 5 s-nél régebbi esemény ne írja felül az újabbat
        if (!isNew && typeof existingTs === 'number' &&
            typeof payload.clientTimestamp === 'number' &&
            existingTs - payload.clientTimestamp > 5000) {
          return {
            result: 'ack',
            server: 'firestore',
            data: { action: 'skipped_stale', title: payload.title, episode: payload.episode }
          };
        }

        let status = payload.status || 'watching';
        if (payload.totalEpisodes && payload.episode >= payload.totalEpisodes) {
          status = 'completed';
        }

        const nowIso = new Date().toISOString();
        const fields = {
          id: docId,
          title: payload.title,
          episode: payload.episode,
          status: status,
          source: payload.source || 'Egyéb',
          sourceUrl: payload.sourceUrl || '',
          lastWatchedUrl: payload.sourceUrl || '',
          updatedAt: nowIso,
          syncedFromExtension: true,
          lastSyncOrigin: payload.origin || 'userscript',
          lastSyncEventId: payload.eventId || '',
          lastClientTimestamp: payload.clientTimestamp || Date.now(),
          syncDeviceId: payload.deviceId || 'unknown',
          syncVersion: payload.syncVersion || SYNC_VERSION
        };
        if (payload.totalEpisodes) {
          fields.totalEpisodes = payload.totalEpisodes;
        }

        if (isNew) {
          fields.createdAt = nowIso;
          fields.coverImage = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
          fields.rating = 9.0;
          fields.notes = 'Automatikusan szinkronizálva: ' + (payload.source || 'ismeretlen forrás') + ' (' + new Date().toLocaleDateString('hu-HU') + ')';
          fields.genres = ['Anime', 'Szinkronizált'];
        }

        const fieldNames = Object.keys(fields);
        const url = FS_ROOT + '/anime_tracks/' + encodeURIComponent(docId) +
          '?key=' + FIRESTORE_CONFIG.apiKey +
          fieldNames.map(function (n) { return '&updateMask.fieldPaths=' + encodeURIComponent(n); }).join('');

        const body = { fields: {} };
        for (const n of fieldNames) {
          body.fields[n] = fsTyped(fields[n]);
        }

        return httpRequest('PATCH', url, body).then(function (r) {
          if (r.ok) {
            fsTracksCache.at = 0; // a következő olvasás friss listát hozzon
            return {
              result: 'ack',
              server: 'firestore',
              data: { action: isNew ? 'created' : 'updated', title: payload.title, episode: payload.episode }
            };
          }
          console.warn('[Luna Sync] Firestore REST válasz:', r.status, r.data && r.data.error && r.data.error.message);
          return { result: 'retry', server: 'firestore', status: r.status };
        });
      });
    }

    // Egy elem kiküldése: először közvetlen Firestore, aztán a /api/sync
    // szerverek sorban. Visszatérési értékek:
    //   'ack'   — visszaigazolva (created/updated/duplicate/skipped_stale)
    //   'drop'  — végleges elutasítás (4xx): nincs értelme újrapróbálni
    //   'retry' — hálózati/szerverhiba: később újra kell próbálni
    function sendItem(item) {
      return fsUpsertTrack(item.payload).then(function (fsOutcome) {
        if (fsOutcome.result === 'ack') return fsOutcome;
        return sendViaServers(item);
      });
    }

    function sendViaServers(item) {
      const list = serverList();
      const start = activeIndex();

      function attemptOn(offset) {
        const idx = (start + offset) % list.length;
        const base = list[idx];
        const url = base.replace(/\\/+$/, '') + '/api/sync';

        return httpRequest('POST', url, item.payload).then(function (r) {
          if (r.ok && r.data && (r.data.success === true || r.data.action)) {
            setActiveIndex(idx);
            return { result: 'ack', server: base, data: r.data };
          }
          if (r.status >= 400 && r.status < 500 && r.status !== 429) {
            return { result: 'drop', server: base, status: r.status };
          }
          return { result: 'retry', server: base, status: r.status };
        });
      }

      let p = attemptOn(0);
      for (let offset = 1; offset < list.length; offset++) {
        const off = offset;
        p = p.then(function (prev) {
          if (prev.result !== 'retry') return prev;
          return attemptOn(off);
        });
      }
      return p;
    }

    async function flushNow() {
      if (flushing) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

      flushing = true;
      try {
        loadQueue();
        const now = Date.now();
        const due = queue
          .filter(it => (it.nextAttempt || 0) <= now)
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
          .slice(0, SYNC_CONFIG.maxItemsPerFlush);

        for (const item of due) {
          const outcome = await sendItem(item);

          loadQueue();
          const idx = queue.findIndex(it => it.eventId === item.eventId);
          if (idx === -1) continue; // közben másik fül már eltávolította

          if (outcome.result === 'ack') {
            queue.splice(idx, 1);
            persistQueue();
            if (typeof ackCb === 'function') {
              try { ackCb(outcome.data || {}, queue.length); } catch (e) {}
            }
          } else if (outcome.result === 'drop') {
            console.warn('[Luna Sync] Véglegesen elutasítva (' + outcome.status + '):', item.payload.title);
            queue.splice(idx, 1);
            persistQueue();
          } else {
            const it = queue[idx];
            it.attempts = (it.attempts || 0) + 1;
            if (it.attempts >= SYNC_CONFIG.maxAttempts) {
              console.warn('[Luna Sync] Maximális próbálkozás elérve, elem elhagyva:', it.payload.title);
              queue.splice(idx, 1);
            } else {
              const backoff = Math.min(
                SYNC_CONFIG.baseBackoffMs * Math.pow(2, Math.min(it.attempts, 10)),
                SYNC_CONFIG.maxBackoffMs
              );
              it.nextAttempt = Date.now() + backoff;
            }
            persistQueue();
          }
        }
      } catch (e) {
        console.warn('[Luna Sync] Flush hiba:', e && e.message);
      } finally {
        flushing = false;
      }
    }

    function scheduleFlush(delay) {
      try { clearTimeout(debounceTimer); } catch (e) {}
      debounceTimer = setTimeout(flushNow, delay);
    }

    function start() {
      if (loopTimer) clearInterval(loopTimer);
      loopTimer = setInterval(flushNow, SYNC_CONFIG.flushIntervalMs);

      window.addEventListener('online', function () {
        scheduleFlush(500);
      });
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) scheduleFlush(500);
      });

      scheduleFlush(1000); // induláskor azonnal kiüríti a maradék sort
      emitQueue();
    }

    return {
      enqueue: enqueue,
      start: start,
      flushNow: flushNow,
      deviceId: getDeviceId,
      activeServer: function () {
        const list = serverList();
        return list[activeIndex()] || list[0] || '';
      },
      pendingCount: function () {
        loadQueue();
        return queue.length;
      },
      clearQueue: function () {
        queue = [];
        persistQueue();
      },
      onQueueChange: function (cb) { queueCb = cb; },
      onAck: function (cb) { ackCb = cb; }
    };
  })();

  function buildPayload() {
    const now = Date.now();
    return {
      title: state.title,
      episode: state.episode,
      totalEpisodes: state.totalEpisodes || null,
      status: state.status,
      source: state.source,
      sourceUrl: window.location.href,
      origin: window.location.hostname,
      timestamp: now,
      eventId: uid(),
      deviceId: SyncEngine.deviceId(),
      clientTimestamp: now,
      syncVersion: SYNC_VERSION
    };
  }

  function broadcast() {
    const payload = buildPayload();

    // 1) Megbízható felhő-szinkron: először sorba, aztán küldés.
    SyncEngine.enqueue(payload);

    // 2) Helyi valós idejű hírcsatornák a website felé (kontraktus változatlan).
    try {
      if (bc) {
        bc.postMessage({ type: 'LUNA_ANIME_PROGRESS', anime: payload, ts: Date.now() });
      }
    } catch (e) {}

    try {
      localStorage.setItem('luna_realtime_anime_sync', JSON.stringify({ type: 'LUNA_ANIME_PROGRESS', anime: payload, ts: Date.now() }));
    } catch (e) {}

    try {
      window.postMessage({ type: 'LUNA_ANIME_PROGRESS', anime: payload, ts: Date.now() }, '*');
    } catch (e) {}

    state.syncCount++;
    updateSyncUI();
  }

  /* ============================================================
   * 6. HUD FELÉPÍTÉSE
   * ============================================================ */
  const root = document.createElement('div');
  root.id = 'luna-hud-root';
  const els = {};

  const STATUS_OPTIONS = [
    { value: 'watching', label: '▶ Nézem' },
    { value: 'completed', label: '✔ Befejezve' },
    { value: 'on_hold', label: '⏸ Szünetel' },
    { value: 'plan_to_watch', label: '📋 Tervezett' },
  ];

  function getStatusLabel(val) {
    if (val === 'planned' || val === 'plan_to_watch') return '📋 Tervezett';
    const found = STATUS_OPTIONS.find((s) => s.value === val);
    return found ? found.label : '▶ Nézem';
  }

  function buildPanel() {
    root.innerHTML = '';
    const panel = document.createElement('div');
    panel.className = 'luna-panel';

    const header = document.createElement('div');
    header.className = 'luna-header';
    header.innerHTML = \`
      <span class="luna-status-dot"></span>
      <span class="luna-logo">🌙 Luna Tracker</span>
      <span class="luna-site-badge" title="\${state.source}">\${state.source}</span>
    \`;

    const actions = document.createElement('div');
    actions.className = 'luna-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'luna-icon-btn' + (state.editMode ? ' active' : '');
    editBtn.title = state.editMode ? 'Vissza az automatikus nézethez' : '✏️ Kézi felülbírálás / Cím & rész szerkesztése';
    editBtn.innerHTML = '✏️';
    editBtn.addEventListener('click', () => {
      state.editMode = !state.editMode;
      render();
      if (state.editMode) {
        toast('Szerkesztő mód megnyitva ✏️');
      }
    });
    actions.appendChild(editBtn);

    const syncNowBtn = document.createElement('button');
    syncNowBtn.className = 'luna-icon-btn';
    syncNowBtn.title = '☁️ Szinkronizálás most (várakozó elemek küldése)';
    syncNowBtn.textContent = '☁';
    syncNowBtn.addEventListener('click', () => {
      toast('Szinkronizálás indítása…');
      SyncEngine.flushNow();
    });
    actions.appendChild(syncNowBtn);

    const minBtn = document.createElement('button');
    minBtn.className = 'luna-icon-btn';
    minBtn.title = 'Kicsinyítés (Mini Pill)';
    minBtn.textContent = '–';
    minBtn.addEventListener('click', () => {
      state.minimized = true;
      Storage.set('minimized', true);
      render();
    });
    actions.appendChild(minBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'luna-icon-btn';
    closeBtn.title = 'Elrejtés (Alt+L-lel visszahozható)';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => {
      state.hidden = true;
      Storage.set('hidden', true);
      render();
      toast('Alt+L billentyűvel újra megnyitható');
    });
    actions.appendChild(closeBtn);

    header.appendChild(actions);
    panel.appendChild(header);

    const body = document.createElement('div');
    body.className = 'luna-body';

    if (!state.editMode) {
      const autoCard = document.createElement('div');
      autoCard.className = 'luna-auto-card';

      const topRow = document.createElement('div');
      topRow.className = 'luna-auto-top';
      topRow.innerHTML = \`
        <span class="luna-auto-pill-badge">
          <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#10b981;"></span>
          Auto-Sync Aktív
        </span>
      \`;

      const editHint = document.createElement('span');
      editHint.className = 'luna-auto-edit-hint';
      editHint.innerHTML = '✏️ Szerkesztés';
      editHint.addEventListener('click', () => {
        state.editMode = true;
        render();
      });
      topRow.appendChild(editHint);
      autoCard.appendChild(topRow);

      const titleEl = document.createElement('div');
      titleEl.className = 'luna-anime-title';
      titleEl.textContent = state.title;
      titleEl.title = state.title;
      autoCard.appendChild(titleEl);

      const epRow = document.createElement('div');
      epRow.className = 'luna-anime-ep-row';
      epRow.innerHTML = \`
        <span class="luna-anime-ep-badge">\${state.episode}. rész</span>
        <span class="luna-anime-status-tag">• \${getStatusLabel(state.status)}</span>
      \`;
      autoCard.appendChild(epRow);

      body.appendChild(autoCard);

      const syncBar = document.createElement('div');
      syncBar.className = 'luna-sync-bar';
      syncBar.innerHTML = \`
        <div class="luna-sync-bar-left">
          <span class="luna-sync-dot"></span>
          <span class="luna-sync-text">Automatikus felhőszinkronizálás aktív</span>
        </div>
        <span class="luna-sync-time"></span>
      \`;
      body.appendChild(syncBar);
      els.syncDot = syncBar.querySelector('.luna-sync-dot');
      els.syncText = syncBar.querySelector('.luna-sync-text');
      els.syncTime = syncBar.querySelector('.luna-sync-time');

    } else {
      const form = document.createElement('div');
      form.className = 'luna-edit-form';

      const titleWrap = document.createElement('div');
      titleWrap.innerHTML = \`<div class="luna-label">Anime címe (Kézi módosítás)</div>\`;
      const titleInput = document.createElement('input');
      titleInput.className = 'luna-title-input';
      titleInput.type = 'text';
      titleInput.value = state.title;
      titleInput.addEventListener('input', () => {
        state.title = titleInput.value.trim() || state.title;
        state.manualOverride = true;
      });
      titleWrap.appendChild(titleInput);
      form.appendChild(titleWrap);

      const epWrap = document.createElement('div');
      epWrap.innerHTML = \`<div class="luna-label">Epizód száma</div>\`;
      const epRow = document.createElement('div');
      epRow.className = 'luna-ep-row';

      function stepBtn(label, delta) {
        const b = document.createElement('button');
        b.className = 'luna-ep-btn';
        b.textContent = label;
        b.addEventListener('click', () => {
          state.episode = Math.max(0, state.episode + delta);
          state.manualOverride = true;
          epInput.value = state.episode;
        });
        return b;
      }

      const epInput = document.createElement('input');
      epInput.className = 'luna-ep-input';
      epInput.type = 'number';
      epInput.min = '0';
      epInput.value = state.episode;
      epInput.addEventListener('input', () => {
        const val = parseInt(epInput.value, 10);
        if (!isNaN(val) && val >= 0) {
          state.episode = val;
          state.manualOverride = true;
        }
      });

      epRow.appendChild(stepBtn('−5', -5));
      epRow.appendChild(stepBtn('−1', -1));
      epRow.appendChild(epInput);
      epRow.appendChild(stepBtn('+1', 1));
      epRow.appendChild(stepBtn('+5', 5));
      epWrap.appendChild(epRow);
      form.appendChild(epWrap);

      const statusWrap = document.createElement('div');
      statusWrap.innerHTML = \`<div class="luna-label">Státusz</div>\`;
      const statusSelect = document.createElement('select');
      statusSelect.className = 'luna-status-select';
      for (const o of STATUS_OPTIONS) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        statusSelect.appendChild(opt);
      }
      statusSelect.value = state.status;
      statusSelect.addEventListener('change', () => {
        state.status = statusSelect.value;
        Storage.set('status', state.status);
      });
      statusWrap.appendChild(statusSelect);
      form.appendChild(statusWrap);

      const btnRow = document.createElement('div');
      btnRow.className = 'luna-edit-btns';

      const saveBtn = document.createElement('button');
      saveBtn.className = 'luna-save-btn';
      saveBtn.textContent = '💾 Mentés & Szinkronizálás';
      saveBtn.addEventListener('click', () => {
        state.editMode = false;
        saveAndSync(true);
        render();
      });

      const autoRevertBtn = document.createElement('button');
      autoRevertBtn.className = 'luna-revert-btn';
      autoRevertBtn.textContent = '🔄 Auto felismerés';
      autoRevertBtn.title = 'Visszatérés az oldal automatikus címéhez és részéhez';
      autoRevertBtn.addEventListener('click', () => {
        state.manualOverride = false;
        state.editMode = false;
        reDetect(true);
        render();
        toast('Automatikusan újrafelismerve ✔');
      });

      btnRow.appendChild(saveBtn);
      btnRow.appendChild(autoRevertBtn);
      form.appendChild(btnRow);

      body.appendChild(form);
    }

    panel.appendChild(body);
    root.appendChild(panel);
    makeDraggable(root, header);
    updateSyncUI();
  }

  function buildPill() {
    root.innerHTML = '';
    const pill = document.createElement('div');
    pill.className = 'luna-pill';

    const dot = document.createElement('span');
    dot.className = 'luna-pill-dot' + ((state.pendingSync || 0) > 0 ? ' pending' : '');
    pill.appendChild(dot);

    const title = document.createElement('span');
    title.className = 'luna-pill-title';
    title.textContent = state.title;
    title.title = state.title;
    pill.appendChild(title);

    const ep = document.createElement('span');
    ep.className = 'luna-pill-ep';
    ep.textContent = (state.pendingSync > 0 ? '⏳' : '') + 'E' + state.episode;
    pill.appendChild(ep);

    const edit = document.createElement('button');
    edit.className = 'luna-pill-edit';
    edit.innerHTML = '✏️';
    edit.title = 'Szerkesztés';
    edit.addEventListener('click', (e) => {
      e.stopPropagation();
      state.minimized = false;
      state.editMode = true;
      Storage.set('minimized', false);
      render();
    });
    pill.appendChild(edit);

    const expand = document.createElement('button');
    expand.className = 'luna-pill-expand';
    expand.textContent = '⤢';
    expand.title = 'Kinyitás';
    expand.addEventListener('click', (e) => {
      e.stopPropagation();
      state.minimized = false;
      Storage.set('minimized', false);
      render();
    });
    pill.appendChild(expand);

    root.appendChild(pill);
    makeDraggable(root, pill);
  }

  function formatTime(ms) {
    const d = new Date(ms);
    return String(d.getHours()).padStart(2, '0') +
      ':' + String(d.getMinutes()).padStart(2, '0') +
      ':' + String(d.getSeconds()).padStart(2, '0');
  }

  function updateSyncUI(customMsg) {
    if (!els.syncText) return;
    const pending = state.pendingSync || 0;

    if (els.syncDot) {
      els.syncDot.className = 'luna-sync-dot' + (pending > 0 ? ' pending' : '');
    }

    if (customMsg) {
      els.syncText.textContent = customMsg;
    } else if (pending > 0) {
      els.syncText.textContent = '⏳ ' + pending + ' szinkron várakozik (auto újrapróbálás)';
    } else if (state.lastSync) {
      els.syncText.textContent = '✓ Szinkronizálva (' + state.title + ')';
      if (els.syncTime) els.syncTime.textContent = formatTime(state.lastSync);
    } else {
      els.syncText.textContent = 'Auto-szinkron készenlétben';
      if (els.syncTime) els.syncTime.textContent = 'Most';
    }
  }

  function applyPosition() {
    const p = state.pos || { right: 20, bottom: 20 };
    root.style.top = '';
    root.style.left = '';
    if (typeof p.left === 'number' && typeof p.top === 'number') {
      root.style.left = p.left + 'px';
      root.style.top = p.top + 'px';
      root.style.right = 'auto';
      root.style.bottom = 'auto';
    } else {
      root.style.right = (p.right ?? 20) + 'px';
      root.style.bottom = (p.bottom ?? 20) + 'px';
      root.style.left = 'auto';
      root.style.top = 'auto';
    }
  }

  function makeDraggable(target, handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let origLeft = 0;
    let origTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, input, select')) return;
      dragging = true;
      const rect = target.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = Math.max(
        0,
        Math.min(window.innerWidth - 60, origLeft + dx)
      );
      const newTop = Math.max(
        0,
        Math.min(window.innerHeight - 40, origTop + dy)
      );
      target.style.left = newLeft + 'px';
      target.style.top = newTop + 'px';
      target.style.right = 'auto';
      target.style.bottom = 'auto';
    });

    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      const rect = target.getBoundingClientRect();
      state.pos = { left: Math.round(rect.left), top: Math.round(rect.top) };
      Storage.set('pos', state.pos);
    });
  }

  function saveAndSync(withNotify) {
    Storage.set('last_anime', {
      title: state.title,
      episode: state.episode,
      status: state.status,
      source: state.source,
      sourceUrl: state.sourceUrl,
    });
    broadcast();
    if (withNotify) {
      notify('🌙 Luna HUD', \`\${state.title} — \${state.episode}. rész mentve!\`);
      toast('Szinkronizálás elküldve ✔ (' + state.title + ' - ' + state.episode + '. rész)');
    }
  }

  let toastTimer = null;
  function toast(msg) {
    const old = document.querySelector('.luna-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'luna-toast';
    t.textContent = msg;
    (document.body || document.documentElement).appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 2500);
  }

  function render() {
    root.innerHTML = '';
    if (state.hidden) {
      root.style.display = 'none';
      return;
    }
    root.style.display = 'block';
    if (state.minimized) buildPill();
    else buildPanel();
    applyPosition();
  }

  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      state.hidden = !state.hidden;
      Storage.set('hidden', state.hidden);
      render();
      if (!state.hidden) toast('🌙 Luna HUD megnyitva');
      return;
    }
  });

  function reDetect(force) {
    if (state.manualOverride && !force) {
      return;
    }

    const t = detectTitle();
    const e = detectEpisode();
    let changed = false;

    if (t.title && t.title !== 'Anime Sorozat' && t.title !== state.title) {
      state.title = t.title;
      state.titleConfident = t.confident;
      changed = true;
    }

    if (e.found && (force || e.ep !== state.episode)) {
      state.episode = e.ep;
      state.episodeFound = true;
      changed = true;
    }

    if (changed) {
      state.sourceUrl = location.href;
      render();
      saveAndSync(false);
    }
  }

  function hookVideos() {
    document.querySelectorAll('video').forEach((v) => {
      if (v.__lunaHooked) return;
      v.__lunaHooked = true;
      v.addEventListener('play', () => {
        reDetect(false);
        saveAndSync(false);
      });
    });
  }

  let lastUrl = location.href;
  function onUrlChange() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    state.sourceUrl = lastUrl;
    state.manualOverride = false;
    setTimeout(() => reDetect(true), 500);
  }

  try {
    const origPush = history.pushState;
    history.pushState = function () {
      origPush.apply(this, arguments);
      setTimeout(onUrlChange, 100);
    };
    const origReplace = history.replaceState;
    history.replaceState = function () {
      origReplace.apply(this, arguments);
      setTimeout(onUrlChange, 100);
    };
  } catch (e) {}

  window.addEventListener('popstate', () => setTimeout(onUrlChange, 100));
  window.addEventListener('hashchange', () => setTimeout(onUrlChange, 100));

  setInterval(() => {
    hookVideos();
    if (!document.getElementById('luna-hud-root')) {
      (document.body || document.documentElement).appendChild(root);
    }
  }, 2000);

  function start() {
    injectCSS();
    (document.body || document.documentElement).appendChild(root);

    // Szinkronmotor bekötése a HUD-ba
    SyncEngine.onQueueChange(function (pending) {
      state.pendingSync = pending;
      updateSyncUI();
      if (state.minimized && !state.hidden) {
        // mini pill frissítése, ha épp az látszik
        render();
      }
    });
    SyncEngine.onAck(function (data, stillPending) {
      state.lastSync = Date.now();
      state.cloudSyncOk = true;
      state.pendingSync = stillPending;
      const label = data && data.title ? data.title : state.title;
      updateSyncUI('✓ Felhőbe mentve: ' + label + ' (E' + (data && typeof data.episode === 'number' ? data.episode : state.episode) + ')');
    });

    SyncEngine.start();

    reDetect(true);
    render();
    hookVideos();
    saveAndSync(false);
    toast('🌙 Luna Tracker v6.1 aktív (Alt+L)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  try {
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('🌙 Luna HUD megjelenítése / elrejtése', () => {
        state.hidden = !state.hidden;
        Storage.set('hidden', state.hidden);
        render();
      });
      GM_registerMenuCommand('✏️ Kézi szerkesztés / Cím módosítása', () => {
        state.editMode = !state.editMode;
        render();
      });
      GM_registerMenuCommand('🔄 Anime újrafelismerése', () => {
        state.manualOverride = false;
        reDetect(true);
        toast('Újrafelismerve ✔');
      });
      GM_registerMenuCommand('☁️ Szinkronizálás most', () => {
        toast('Szinkronizálás indítása…');
        SyncEngine.flushNow();
      });
      GM_registerMenuCommand('📊 Szinkron-sor állapota', () => {
        const pending = SyncEngine.pendingCount();
        const server = SyncEngine.activeServer();
        notify('🌙 Luna Sync v6.1', pending > 0
          ? \`\${pending} várakozó elem. Útvonal: közvetlen Firestore (tartalék: \${server})\`
          : \`Nincs várakozó elem, minden naprakész. Útvonal: közvetlen Firestore (tartalék: \${server})\`);
      });
      GM_registerMenuCommand('🧹 Várakozó szinkronok törlése', () => {
        const pending = SyncEngine.pendingCount();
        if (pending === 0) {
          toast('Nincs várakozó szinkron.');
          return;
        }
        const ok = confirm(\`\${pending} várakozó szinkron törlése? Ezek az adatok el fognak veszni.\`);
        if (ok) {
          SyncEngine.clearQueue();
          toast('Várakozó szinkronok törölve.');
        }
      });
    }
  } catch (e) {}
})();
`;
