import { AnimeTrack, WatchStatus } from '../types';

export interface ExternalAnimeMatch {
  id: number;
  malId?: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  coverImage?: string;
  bannerImage?: string;
  episodes?: number;
  status?: string;
  averageScore?: number;
  genres?: string[];
  description?: string;
}

export interface SyncResult {
  success: boolean;
  totalImported: number;
  totalUpdated: number;
  totalConflicts: number;
  message: string;
  tracks: AnimeTrack[];
}

const ANILIST_SETTINGS_KEY = 'luna_anilist_settings';
const MAL_SETTINGS_KEY = 'luna_mal_settings';

// --- ANILIST INTEGRATION (GraphQL API) ---

const ANILIST_GRAPHQL_ENDPOINT = 'https://graphql.anilist.co';

const USER_ANIME_LIST_QUERY = `
query ($userName: String) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      name
      isCustomList
      status
      entries {
        id
        status
        score(format: POINT_10)
        progress
        notes
        updatedAt
        createdAt
        media {
          id
          idMal
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          episodes
          status
          averageScore
          genres
          description
        }
      }
    }
  }
}
`;

const SEARCH_ANIME_QUERY = `
query ($search: String) {
  Page(page: 1, perPage: 6) {
    media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      coverImage {
        large
      }
      bannerImage
      episodes
      status
      averageScore
      genres
      description
    }
  }
}
`;

export function mapAniListStatusToLuna(status: string): WatchStatus {
  switch (status?.toUpperCase()) {
    case 'CURRENT':
      return 'watching';
    case 'COMPLETED':
      return 'completed';
    case 'PAUSED':
      return 'on_hold';
    case 'DROPPED':
      return 'dropped';
    case 'PLANNING':
      return 'plan_to_watch';
    default:
      return 'watching';
  }
}

export function mapLunaStatusToAniList(status: WatchStatus): string {
  switch (status) {
    case 'watching':
      return 'CURRENT';
    case 'completed':
      return 'COMPLETED';
    case 'on_hold':
      return 'PAUSED';
    case 'dropped':
      return 'DROPPED';
    case 'plan_to_watch':
      return 'PLANNING';
    default:
      return 'CURRENT';
  }
}

/**
 * Fetches user anime collection directly from AniList by username
 */
export async function fetchAniListUserCollection(username: string): Promise<AnimeTrack[]> {
  if (!username || !username.trim()) {
    throw new Error('Kérlek add meg az AniList felhasználónevedet!');
  }

  const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: USER_ANIME_LIST_QUERY,
      variables: { userName: username.trim() }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AniList hiba (${response.status}): ${errText}`);
  }

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    throw new Error(`AniList GraphQL hiba: ${json.errors[0].message}`);
  }

  const lists = json.data?.MediaListCollection?.lists || [];
  const tracks: AnimeTrack[] = [];

  for (const list of lists) {
    const entries = list.entries || [];
    for (const entry of entries) {
      const media = entry.media;
      if (!media) continue;

      const title = media.title?.english || media.title?.romaji || media.title?.native || 'Ismeretlen Anime';
      const episode = entry.progress || 1;
      const totalEpisodes = media.episodes || undefined;
      const coverImage = media.coverImage?.large || media.coverImage?.extraLarge || '';
      const rating = typeof entry.score === 'number' && entry.score > 0 ? entry.score : (media.averageScore ? Math.round(media.averageScore / 10) : undefined);
      const status = mapAniListStatusToLuna(entry.status || list.status);

      tracks.push({
        id: `anilist_${media.id}`,
        title,
        episode,
        totalEpisodes,
        source: 'AniList',
        sourceUrl: `https://anilist.co/anime/${media.id}`,
        status,
        coverImage,
        rating,
        notes: entry.notes || '',
        genres: media.genres || [],
        aniListId: media.id,
        malId: media.idMal || undefined,
        japaneseTitle: media.title?.native || media.title?.romaji,
        englishTitle: media.title?.english,
        updatedAt: entry.updatedAt ? new Date(entry.updatedAt * 1000).toISOString() : new Date().toISOString(),
        createdAt: entry.createdAt ? new Date(entry.createdAt * 1000).toISOString() : new Date().toISOString()
      });
    }
  }

  return tracks;
}

/**
 * Searches AniList for anime metadata & covers
 */
export async function searchAniListAnime(searchTerm: string): Promise<ExternalAnimeMatch[]> {
  if (!searchTerm || !searchTerm.trim()) return [];

  try {
    const response = await fetch(ANILIST_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_ANIME_QUERY,
        variables: { search: searchTerm.trim() }
      })
    });

    if (!response.ok) return [];
    const json = await response.json();
    const mediaList = json.data?.Page?.media || [];

    return mediaList.map((m: any) => ({
      id: m.id,
      malId: m.idMal,
      title: {
        romaji: m.title?.romaji || '',
        english: m.title?.english || '',
        native: m.title?.native || ''
      },
      coverImage: m.coverImage?.large,
      bannerImage: m.bannerImage,
      episodes: m.episodes,
      status: m.status,
      averageScore: m.averageScore,
      genres: m.genres,
      description: m.description
    }));
  } catch (e) {
    console.warn('AniList search failed:', e);
    return [];
  }
}

// --- MYANIMELIST INTEGRATION (Jikan API & XML Import) ---

/**
 * Fetches user anime list from MyAnimeList via public Jikan v4 REST API
 */
export async function fetchMalUserCollection(username: string): Promise<AnimeTrack[]> {
  if (!username || !username.trim()) {
    throw new Error('Kérlek add meg a MyAnimeList felhasználónevedet!');
  }

  const endpoint = `https://api.jikan.moe/v4/users/${encodeURIComponent(username.trim())}/animelist/all`;
  
  const response = await fetch(endpoint);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`A megadott MyAnimeList felhasználó ("${username}") nem található vagy a listája privát.`);
    }
    const errText = await response.text();
    throw new Error(`MyAnimeList (Jikan) hiba (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const data = json.data || [];
  const tracks: AnimeTrack[] = [];

  for (const item of data) {
    const entry = item.entry;
    if (!entry) continue;

    let status: WatchStatus = 'watching';
    const rawStatus = item.status?.toLowerCase() || '';
    if (rawStatus.includes('completed') || rawStatus === '2') status = 'completed';
    else if (rawStatus.includes('on_hold') || rawStatus === '3') status = 'on_hold';
    else if (rawStatus.includes('dropped') || rawStatus === '4') status = 'dropped';
    else if (rawStatus.includes('plan') || rawStatus === '6') status = 'plan_to_watch';
    else status = 'watching';

    const title = entry.title || 'Ismeretlen Anime';
    const episode = item.episodes_watched || 1;
    const totalEpisodes = entry.images?.jpg?.image_url ? undefined : undefined;
    const coverImage = entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url || '';
    const rating = item.score > 0 ? item.score : undefined;

    tracks.push({
      id: `mal_${entry.mal_id}`,
      title,
      episode,
      totalEpisodes,
      source: 'MyAnimeList',
      sourceUrl: entry.url || `https://myanimelist.net/anime/${entry.mal_id}`,
      status,
      coverImage,
      rating,
      malId: entry.mal_id,
      notes: item.comments || '',
      updatedAt: item.updated_at || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  }

  return tracks;
}

/**
 * Parses official MyAnimeList XML export file
 */
export function parseMalXmlExport(xmlString: string): AnimeTrack[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  const animeNodes = xmlDoc.getElementsByTagName('anime');

  const tracks: AnimeTrack[] = [];

  for (let i = 0; i < animeNodes.length; i++) {
    const node = animeNodes[i];
    const malId = parseInt(node.getElementsByTagName('series_animedb_id')[0]?.textContent || '0', 10);
    const title = node.getElementsByTagName('series_title')[0]?.textContent || 'Ismeretlen Anime';
    const watchedEpisodes = parseInt(node.getElementsByTagName('my_watched_episodes')[0]?.textContent || '1', 10);
    const totalEpisodes = parseInt(node.getElementsByTagName('series_episodes')[0]?.textContent || '0', 10);
    const score = parseInt(node.getElementsByTagName('my_score')[0]?.textContent || '0', 10);
    const statusText = node.getElementsByTagName('my_status')[0]?.textContent || 'Watching';
    const comments = node.getElementsByTagName('my_comments')[0]?.textContent || '';

    let status: WatchStatus = 'watching';
    if (statusText === 'Completed' || statusText === '2') status = 'completed';
    else if (statusText === 'On-Hold' || statusText === '3') status = 'on_hold';
    else if (statusText === 'Dropped' || statusText === '4') status = 'dropped';
    else if (statusText === 'Plan to Watch' || statusText === '6') status = 'plan_to_watch';

    tracks.push({
      id: `mal_${malId || Date.now() + i}`,
      title,
      episode: watchedEpisodes > 0 ? watchedEpisodes : 1,
      totalEpisodes: totalEpisodes > 0 ? totalEpisodes : undefined,
      source: 'MyAnimeList',
      sourceUrl: malId ? `https://myanimelist.net/anime/${malId}` : undefined,
      status,
      rating: score > 0 ? score : undefined,
      notes: comments,
      malId: malId || undefined,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  }

  return tracks;
}

// --- LOCAL STORAGE CREDENTIAL HELPERS ---

export function getSavedAniListSettings(): { username: string; token: string; autoSync: boolean } {
  if (typeof window === 'undefined') return { username: '', token: '', autoSync: false };
  try {
    const saved = localStorage.getItem(ANILIST_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : { username: '', token: '', autoSync: false };
  } catch (e) {
    return { username: '', token: '', autoSync: false };
  }
}

export function saveAniListSettings(settings: { username: string; token: string; autoSync: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANILIST_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export function getSavedMalSettings(): { username: string; autoSync: boolean } {
  if (typeof window === 'undefined') return { username: '', autoSync: false };
  try {
    const saved = localStorage.getItem(MAL_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : { username: '', autoSync: false };
  } catch (e) {
    return { username: '', autoSync: false };
  }
}

export function saveMalSettings(settings: { username: string; autoSync: boolean }): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MAL_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
}
