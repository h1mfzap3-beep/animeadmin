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
