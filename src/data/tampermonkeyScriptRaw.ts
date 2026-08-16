export const TAMPERMONKEY_USERSCRIPT_CODE_RAW = `// ==UserScript==
// @name         Luna Anime Tracker HUD
// @namespace    https://luna.tracker.local/
// @version      5.3.0
// @description  Intelligens automatikus anime szinkronizálás és lebegő HUD magyar és nemzetközi anime oldalakhoz (MagyarAnime, OniAnime, AnimeGun, Videa, Indavideo stb.).
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
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      *
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

  // Ha a felhasználó a saját Luna Webes Felületén jár, azonnal rögzítjük a felhő szerver URL-t
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

  // Ismert weboldal nevek és logók, amiket ki kell vágni a címből
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

  // Fölösleges felirat/minőség/online címkék
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

    // 1. Zárójeles csoportok törlése ha csak minőséget vagy feliratot jelölnek: pl [AnimeDrive], [Magyar Felirat], [1080p]
    text = text.replace(/\[(?:magyar felirat|magyar szinkron|animedrive|dh\+|hd|1080p|720p|indavideo|videa|sub|dub|[^\]]{1,20})\]/gi, ' ');
    text = text.replace(/\((?:magyar felirat|magyar szinkron|1080p|720p|hd|sub|dub)\)/gi, ' ');

    // 2. Ha van elválasztó karakter (pl "MagyarAnime - Solo Leveling 2. Évad 5. Rész" vagy "Solo Leveling | OniAnime")
    const parts = text.split(/\s*[\–\—\|\»\•]\s*|\s+-\s+|\s+\/\s+/);
    if (parts.length > 1) {
      // Válasszuk ki azt a darabot, ami NEM oldalnév és a leghosszabb / leginkább animére hasonlít
      const validCandidates = parts.map(p => p.trim()).filter(p => !isSiteBrand(p) && p.length > 2);
      if (validCandidates.length > 0) {
        // Válasszuk a legértelmesebb darabot
        text = validCandidates[0];
      } else {
        text = parts[0];
      }
    }

    // 3. Junk szavak kigyomlálása
    for (const junk of JUNK_PHRASES) {
      const regex = new RegExp('\\\\b' + junk.replace('.', '\\\\.') + '\\\\b', 'gi');
      text = text.replace(regex, ' ');
    }

    // 4. Rész megjelölések levágása a cím végéről (pl: "12. Rész", "5.rész", "05. Rész", "Episode 12", "Ep 12")
    text = text.replace(/\b\d{1,4}\s*[\.\-]?\s*(?:rész|resz|epizód|epizod|episode|ep)\b/gi, ' ');
    text = text.replace(/(?:rész|resz|epizód|epizod|episode|ep)\s*[:\-#]?\s*\d{1,4}\b/gi, ' ');
    text = text.replace(/\b[eE]\d{1,4}\b/g, ' ');

    // 5. Megtartjuk az Évadot/Seasont ha van ("2. Évad", "Season 2"), de formázzuk szépen
    text = text.replace(/_/g, ' ');
    text = text.replace(/\s{2,}/g, ' ');
    text = text.replace(/^[\s\-\.\:\|,;\/]+|[\s\-\.\:\|,;\/]+$/g, '');

    return text.trim();
  }

  function detectTitle() {
    const hostname = window.location.hostname.toLowerCase();

    // 1. Oldalspecifikus kiemelt DOM elemek (Magyar és külföldi oldalak)
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

    // 2. OpenGraph / Twitter meta címkék
    const og = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
    if (og && og.content) {
      const c = cleanTitle(og.content);
      if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: true };
    }

    // 3. Általános DOM fejlécek
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

    // 4. document.title feldolgozása
    if (document.title) {
      const c = cleanTitle(document.title);
      if (c.length >= 2 && !isSiteBrand(c)) return { title: c, confident: c.length >= 4 };
    }

    return { title: 'Anime Sorozat', confident: false };
  }

  function detectEpisode() {
    const url = location.href;

    // 1. URL Query paraméterek
    try {
      const u = new URL(url);
      for (const key of ['resz', 'ep', 'episode', 'e', 'res', 'epizod', 'part', 'track']) {
        const v = u.searchParams.get(key);
        if (v && /^\\d{1,4}$/.test(v)) {
          return { ep: parseInt(v, 10), found: true };
        }
      }
    } catch (e) {}

    // 2. URL útvonal minták
    const urlPatterns = [
      /[\\/\\-_](?:ep|episode|resz|rész|epizod|epizód)[\\-_\\/]?(\\d{1,4})/i,
      /[\\/\\-_](\\d{1,4})[\\-_\\.\\/](?:resz|rész|ep|episode)/i,
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

    // 3. Aktív epizódválasztó a DOM-ban
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

    // 4. Szöveges minták a címben és oldalszövegben
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

    /* === AUTO SYNC TISZTA NÉZET === */
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
    }

    /* === ✏️ CERUZA SZERKESZTŐ NÉZET === */
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

    /* ---- MINI PILL ---- */
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
   * 5. LAPKÖZI ÉS FELHŐ ALAPÚ SZINKRONIZÁCIÓ
   * ============================================================ */
  const DEFAULT_CLOUD_SERVERS = [
    'https://ais-dev-haau57gidvc74j2nnjloyk-452811031712.europe-west2.run.app',
    'https://ais-pre-haau57gidvc74j2nnjloyk-452811031712.europe-west2.run.app',
    'http://localhost:3000'
  ];

  function getStoredServerUrl() {
    return Storage.get('luna_custom_server_url', '') || DEFAULT_CLOUD_SERVERS[0];
  }

  let bc = null;
  try {
    bc = new BroadcastChannel('luna_anime_realtime_channel');
  } catch (e) {
    bc = null;
  }

  function buildPayload() {
    return {
      title: state.title,
      episode: state.episode,
      totalEpisodes: state.totalEpisodes || null,
      status: state.status,
      source: state.source,
      sourceUrl: window.location.href,
      origin: window.location.hostname,
      timestamp: Date.now()
    };
  }

  function sendFetchSync(url, payload) {
    try {
      fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && (data.success || data.action)) {
          state.lastSync = Date.now();
          state.cloudSyncOk = true;
          updateSyncUI('✓ Felhőbe mentve: ' + (data.title || state.title) + ' (E' + state.episode + ')');
        }
      })
      .catch(function(err) {
        console.warn('[Luna Tracker] Fetch sync notice:', err.message);
      });
    } catch (err) {}
  }

  function broadcast() {
    const payload = buildPayload();

    // 1. Cross-Domain HTTP Cloud Sync
    const targetServer = getStoredServerUrl();
    const syncUrl = targetServer.replace(/\\/$/, '') + '/api/sync';

    let httpSent = false;
    try {
      if (typeof GM_xmlhttpRequest === 'function') {
        GM_xmlhttpRequest({
          method: 'POST',
          url: syncUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          data: JSON.stringify(payload),
          timeout: 8000,
          onload: function(resp) {
            if (resp.status >= 200 && resp.status < 300) {
              state.lastSync = Date.now();
              state.cloudSyncOk = true;
              updateSyncUI('✓ Felhőbe szinkronizálva (' + state.title + ')');
            } else {
              sendFetchSync(syncUrl, payload);
            }
          },
          onerror: function() {
            sendFetchSync(syncUrl, payload);
          }
        });
        httpSent = true;
      }
    } catch (e) {}

    if (!httpSent) {
      sendFetchSync(syncUrl, payload);
    }

    // 2. BroadcastChannel
    try {
      if (bc) {
        bc.postMessage({ type: 'LUNA_ANIME_PROGRESS', anime: payload, ts: Date.now() });
      }
    } catch (e) {}

    // 3. LocalStorage
    try {
      localStorage.setItem('luna_realtime_anime_sync', JSON.stringify({ type: 'LUNA_ANIME_PROGRESS', anime: payload, ts: Date.now() }));
    } catch (e) {}

    // 4. Window PostMessage
    try {
      window.postMessage({ type: 'LUNA_ANIME_PROGRESS', anime: payload, ts: Date.now() }, '*');
    } catch (e) {}

    state.lastSync = Date.now();
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

    // Fejléc
    const header = document.createElement('div');
    header.className = 'luna-header';
    header.innerHTML = \`
      <span class="luna-status-dot"></span>
      <span class="luna-logo">🌙 Luna Tracker</span>
      <span class="luna-site-badge" title="\${state.source}">\${state.source}</span>
    \`;

    const actions = document.createElement('div');
    actions.className = 'luna-actions';

    // ✏️ Ceruza gomb (Manuális felülbírálás toggle)
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

    // Kicsinyítés gomb
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

    // Bezárás gomb
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

    // Törzs
    const body = document.createElement('div');
    body.className = 'luna-body';

    if (!state.editMode) {
      /* =======================================================
       * ALAPÉRTELMEZETT: TISZTA AUTOMATIKUS SZINKRONIZÁLÁSI NÉZET
       * ======================================================= */
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

      // Anime címe
      const titleEl = document.createElement('div');
      titleEl.className = 'luna-anime-title';
      titleEl.textContent = state.title;
      titleEl.title = state.title;
      autoCard.appendChild(titleEl);

      // Epizód sor
      const epRow = document.createElement('div');
      epRow.className = 'luna-anime-ep-row';
      epRow.innerHTML = \`
        <span class="luna-anime-ep-badge">\${state.episode}. rész</span>
        <span class="luna-anime-status-tag">• \${getStatusLabel(state.status)}</span>
      \`;
      autoCard.appendChild(epRow);

      body.appendChild(autoCard);

      // Szinkronizációs sáv
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
      els.syncText = syncBar.querySelector('.luna-sync-text');
      els.syncTime = syncBar.querySelector('.luna-sync-time');

    } else {
      /* =======================================================
       * ✏️ CERUZA SZERKESZTŐ NÉZET (KÉZI FELÜLBÍRÁLÁS)
       * ======================================================= */
      const form = document.createElement('div');
      form.className = 'luna-edit-form';

      // Cím szerkesztés
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

      // Epizód léptető
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

      // Státusz választó
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

      // Gombok: Mentés & Visszaállítás
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
    dot.className = 'luna-pill-dot';
    pill.appendChild(dot);

    const title = document.createElement('span');
    title.className = 'luna-pill-title';
    title.textContent = state.title;
    title.title = state.title;
    pill.appendChild(title);

    const ep = document.createElement('span');
    ep.className = 'luna-pill-ep';
    ep.textContent = 'E' + state.episode;
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

  /* ============================================================
   * 7. ÁLLAPOTSOROK ÉS SZINKRON UI
   * ============================================================ */
  function updateSyncUI(customMsg) {
    if (!els.syncText) return;
    if (customMsg) {
      els.syncText.textContent = customMsg;
    } else if (state.lastSync) {
      const d = new Date(state.lastSync);
      const time =
        String(d.getHours()).padStart(2, '0') +
        ':' +
        String(d.getMinutes()).padStart(2, '0') +
        ':' +
        String(d.getSeconds()).padStart(2, '0');
      els.syncText.textContent = 'Auto-szinkron aktív (' + state.title + ')';
      if (els.syncTime) {
        els.syncTime.textContent = time;
      }
    } else {
      els.syncText.textContent = 'Auto-szinkron készenlétben';
      if (els.syncTime) els.syncTime.textContent = 'Most';
    }
  }

  /* ============================================================
   * 8. DRAG & DROP + POZÍCIÓ
   * ============================================================ */
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

  /* ============================================================
   * 9. AUTOMATIKUS MENTÉS ÉS SZINKRONIZÁLÁS
   * ============================================================ */
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
      toast('Szinkronizálva ✔ (' + state.title + ' - ' + state.episode + '. rész)');
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

  /* ============================================================
   * 10. RENDER + GYORSBILLENTYŰK
   * ============================================================ */
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

  /* ============================================================
   * 11. DETEKCIÓ & INDÍTÁS (Automatikus Lejátszás & URL Követés)
   * ============================================================ */
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
    reDetect(true);
    render();
    hookVideos();
    saveAndSync(false);
    toast('🌙 Luna Tracker aktív (Alt+L)');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Menüparancsok
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
    }
  } catch (e) {}
})();
`;
