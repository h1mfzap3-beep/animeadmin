import { AnimeTrack, ConflictItem, ConflictLogEntry, ConflictStrategy } from '../types';

const CONFLICT_STRATEGY_KEY = 'luna_conflict_strategy_config';
const CONFLICT_LOGS_KEY = 'luna_conflict_logs_history';
const PENDING_CONFLICTS_KEY = 'luna_pending_conflicts_queue';

export function getActiveConflictStrategy(): ConflictStrategy {
  if (typeof window === 'undefined') return 'highest_episode';
  try {
    const saved = localStorage.getItem(CONFLICT_STRATEGY_KEY);
    return (saved as ConflictStrategy) || 'highest_episode';
  } catch (e) {
    return 'highest_episode';
  }
}

export function setActiveConflictStrategy(strategy: ConflictStrategy): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFLICT_STRATEGY_KEY, strategy);
  } catch (e) {}
}

export function getConflictLogs(): ConflictLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CONFLICT_LOGS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function addConflictLog(log: Omit<ConflictLogEntry, 'id' | 'resolvedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getConflictLogs();
    const newEntry: ConflictLogEntry = {
      ...log,
      id: 'log_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      resolvedAt: new Date().toISOString()
    };
    const updated = [newEntry, ...current].slice(0, 50); // Keep last 50 logs
    localStorage.setItem(CONFLICT_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

export function clearConflictLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONFLICT_LOGS_KEY);
  } catch (e) {}
}

export function getPendingConflicts(): ConflictItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PENDING_CONFLICTS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function savePendingConflicts(conflicts: ConflictItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PENDING_CONFLICTS_KEY, JSON.stringify(conflicts));
  } catch (e) {}
}

// Source rank for source priority resolution
const SOURCE_RANKS: Record<string, number> = {
  'MagyarAnime': 100,
  'OniAnime': 100,
  'AnimeDrive': 100,
  'UraharaShop': 100,
  'NarutoKun': 100,
  'MutekiFansub': 100,
  'Indavideo': 90,
  'Videa': 90,
  'AniList': 80,
  'MyAnimeList': 70,
  'Egyéb': 50
};

/**
 * Normalizes title for fuzzy matching across Hungarian & English/Romaji names
 */
export function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Checks if two anime tracks are conflicting and returns diffs if any
 */
export function detectTrackConflict(
  current: AnimeTrack,
  incoming: Partial<AnimeTrack>,
  incomingSource: string
): { isConflict: boolean; diffs: ConflictItem['differences'] } {
  const diffs: ConflictItem['differences'] = [];

  // Episode mismatch
  if (typeof incoming.episode === 'number' && incoming.episode !== current.episode) {
    diffs.push({
      field: 'episode',
      label: 'Megtekintett Rész',
      currentValue: `${current.episode}. Rész`,
      incomingValue: `${incoming.episode}. Rész`
    });
  }

  // Status mismatch
  if (incoming.status && incoming.status !== current.status) {
    diffs.push({
      field: 'status',
      label: 'Státusz',
      currentValue: current.status,
      incomingValue: incoming.status
    });
  }

  // Rating mismatch
  if (typeof incoming.rating === 'number' && current.rating && incoming.rating !== current.rating) {
    diffs.push({
      field: 'rating',
      label: 'Értékelés',
      currentValue: `${current.rating}/10`,
      incomingValue: `${incoming.rating}/10`
    });
  }

  return {
    isConflict: diffs.length > 0,
    diffs
  };
}

/**
 * Smart automatic merge and conflict resolver for bulk import (AniList, MAL, Cloud, Userscript)
 */
export function resolveAndMergeTracks(
  existingTracks: AnimeTrack[],
  incomingTracks: (AnimeTrack | Partial<AnimeTrack>)[],
  strategy: ConflictStrategy = getActiveConflictStrategy()
): {
  mergedTracks: AnimeTrack[];
  autoResolvedCount: number;
  newTracksCount: number;
  pendingConflicts: ConflictItem[];
} {
  const mergedMap = new Map<string, AnimeTrack>();
  const normalizedIndex = new Map<string, string>(); // normalizedTitle -> trackId

  // Index existing tracks
  for (const track of existingTracks) {
    mergedMap.set(track.id, { ...track });
    const norm = normalizeTitle(track.title);
    if (norm) normalizedIndex.set(norm, track.id);
  }

  let autoResolvedCount = 0;
  let newTracksCount = 0;
  const newPendingConflicts: ConflictItem[] = [];

  for (const rawIncoming of incomingTracks) {
    if (!rawIncoming.title) continue;

    const norm = normalizeTitle(rawIncoming.title);
    let matchedId = rawIncoming.id && mergedMap.has(rawIncoming.id) ? rawIncoming.id : undefined;

    if (!matchedId && norm && normalizedIndex.has(norm)) {
      matchedId = normalizedIndex.get(norm);
    }

    // Match by AniList ID or MAL ID if present
    if (!matchedId) {
      for (const [id, t] of mergedMap.entries()) {
        if (rawIncoming.aniListId && t.aniListId === rawIncoming.aniListId) {
          matchedId = id;
          break;
        }
        if (rawIncoming.malId && t.malId === rawIncoming.malId) {
          matchedId = id;
          break;
        }
      }
    }

    if (matchedId && mergedMap.has(matchedId)) {
      const existing = mergedMap.get(matchedId)!;
      const { isConflict, diffs } = detectTrackConflict(existing, rawIncoming, rawIncoming.source || 'Külső Forrás');

      if (!isConflict) {
        // Just enrich with extra metadata if missing
        mergedMap.set(matchedId, {
          ...existing,
          coverImage: existing.coverImage || rawIncoming.coverImage,
          totalEpisodes: existing.totalEpisodes || rawIncoming.totalEpisodes,
          genres: existing.genres?.length ? existing.genres : rawIncoming.genres,
          aniListId: existing.aniListId || rawIncoming.aniListId,
          malId: existing.malId || rawIncoming.malId,
          japaneseTitle: existing.japaneseTitle || rawIncoming.japaneseTitle,
          englishTitle: existing.englishTitle || rawIncoming.englishTitle,
        });
        continue;
      }

      // Conflict detected! Apply Strategy
      if (strategy === 'manual_review') {
        // Queue for manual resolution
        newPendingConflicts.push({
          id: 'conflict_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
          title: existing.title,
          trackId: existing.id,
          currentTrack: existing,
          incomingTrack: rawIncoming,
          incomingSource: rawIncoming.source || 'Külső Forrás',
          differences: diffs,
          detectedAt: new Date().toISOString(),
          status: 'pending'
        });
      } else {
        // Auto-resolve based on active strategy
        const resolved = applyAutoConflictStrategy(existing, rawIncoming, strategy);
        mergedMap.set(matchedId, resolved.winnerTrack);
        autoResolvedCount++;

        addConflictLog({
          title: existing.title,
          strategyUsed: strategy,
          summary: resolved.summary,
          source: rawIncoming.source || 'Külső Forrás'
        });
      }
    } else {
      // New unique track!
      const newId = rawIncoming.id || 'track_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const newTrack: AnimeTrack = {
        id: newId,
        title: rawIncoming.title,
        episode: typeof rawIncoming.episode === 'number' ? rawIncoming.episode : 1,
        totalEpisodes: rawIncoming.totalEpisodes,
        source: rawIncoming.source || 'Egyéb',
        sourceUrl: rawIncoming.sourceUrl || '',
        status: rawIncoming.status || 'watching',
        coverImage: rawIncoming.coverImage || '',
        rating: rawIncoming.rating,
        notes: rawIncoming.notes || '',
        genres: rawIncoming.genres || [],
        aniListId: rawIncoming.aniListId,
        malId: rawIncoming.malId,
        japaneseTitle: rawIncoming.japaneseTitle,
        englishTitle: rawIncoming.englishTitle,
        updatedAt: rawIncoming.updatedAt || new Date().toISOString(),
        createdAt: rawIncoming.createdAt || new Date().toISOString()
      };

      mergedMap.set(newId, newTrack);
      if (norm) normalizedIndex.set(norm, newId);
      newTracksCount++;
    }
  }

  const mergedTracks = Array.from(mergedMap.values());
  return {
    mergedTracks,
    autoResolvedCount,
    newTracksCount,
    pendingConflicts: newPendingConflicts
  };
}

/**
 * Resolves conflict between two tracks using automated logic
 */
export function applyAutoConflictStrategy(
  existing: AnimeTrack,
  incoming: Partial<AnimeTrack>,
  strategy: ConflictStrategy
): { winnerTrack: AnimeTrack; summary: string } {
  let winner: AnimeTrack = { ...existing };
  let summary = '';

  switch (strategy) {
    case 'highest_episode': {
      const incomingEp = incoming.episode || 1;
      if (incomingEp >= existing.episode) {
        winner.episode = incomingEp;
        if (incoming.source) winner.source = incoming.source;
        if (incoming.sourceUrl) winner.sourceUrl = incoming.sourceUrl;
        if (incoming.status === 'completed') winner.status = 'completed';
        summary = `Legmagasabb rész érvényesítve: ${existing.episode} -> ${incomingEp}. rész (${incoming.source || 'Bejövő'})`;
      } else {
        summary = `Meglévő magasabb rész megtartva: ${existing.episode}. rész (${incomingEp}. résszel szemben)`;
      }
      break;
    }

    case 'newest_timestamp': {
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const incomingTime = new Date(incoming.updatedAt || incoming.createdAt || 0).getTime();

      if (incomingTime >= existingTime) {
        winner = {
          ...existing,
          ...incoming,
          id: existing.id,
          updatedAt: incoming.updatedAt || new Date().toISOString()
        } as AnimeTrack;
        summary = `Legfrissebb időbélyegű bejegyzés alkalmazva (${new Date(incomingTime).toLocaleDateString('hu-HU')})`;
      } else {
        summary = `Meglévő frissebb időbélyegű bejegyzés megtartva`;
      }
      break;
    }

    case 'source_priority': {
      const existingRank = SOURCE_RANKS[existing.source] || 50;
      const incomingRank = SOURCE_RANKS[incoming.source || ''] || 50;

      if (incomingRank >= existingRank) {
        winner = {
          ...existing,
          ...incoming,
          id: existing.id
        } as AnimeTrack;
        summary = `Prioritásos forrás (${incoming.source}) felülírta a régit (${existing.source})`;
      } else {
        summary = `Meglévő magasabb prioritású forrás (${existing.source}) megtartva`;
      }
      break;
    }

    default:
      winner.episode = Math.max(existing.episode, incoming.episode || 1);
      summary = `Automatikus összefésülés`;
  }

  // Always retain non-empty covers / genres
  if (!winner.coverImage && incoming.coverImage) winner.coverImage = incoming.coverImage;
  if (!winner.totalEpisodes && incoming.totalEpisodes) winner.totalEpisodes = incoming.totalEpisodes;
  if ((!winner.genres || winner.genres.length === 0) && incoming.genres) winner.genres = incoming.genres;
  if (!winner.aniListId && incoming.aniListId) winner.aniListId = incoming.aniListId;
  if (!winner.malId && incoming.malId) winner.malId = incoming.malId;

  return { winnerTrack: winner, summary };
}
