export type WatchStatus = 'watching' | 'completed' | 'plan_to_watch' | 'on_hold' | 'dropped' | 'planned';

export type AnimeSource = 
  | 'MagyarAnime' 
  | 'OniAnime' 
  | 'AnimeDrive' 
  | 'UraharaShop' 
  | 'NarutoKun' 
  | 'MutekiFansub' 
  | 'AnimeGun' 
  | 'Indavideo' 
  | 'Videa' 
  | 'AniList' 
  | 'MyAnimeList' 
  | 'Egyéb'
  | string;

export interface AnimeTrack {
  id: string;
  title: string;
  episode: number;
  totalEpisodes?: number;
  source: AnimeSource;
  sourceUrl?: string;
  status: WatchStatus;
  coverImage?: string;
  rating?: number; // 1 to 10
  notes?: string;
  genres?: string[];
  syncedFromExtension?: boolean;
  aniListId?: number;
  malId?: number;
  japaneseTitle?: string;
  englishTitle?: string;
  userId?: string;
  userEmail?: string;
  updatedAt: string;
  createdAt: string;
}

export interface CustomMonitoredSite {
  id: string;
  name: string;
  domain: string;
  urlPattern: string;
  titleSelector?: string;
  episodeSelector?: string;
  badgeColor?: string;
  enabled: boolean;
  isBuiltIn?: boolean;
  notes?: string;
  createdAt: string;
}

export type ConflictStrategy = 
  | 'highest_episode'    // Legmagasabb epizódszám nyer (ajánlott)
  | 'newest_timestamp'   // Legújabb módosítási időbélyeg nyer
  | 'source_priority'    // Prioritás: Tampermonkey Live > AniList > MyAnimeList > Kézi
  | 'manual_review';     // Mindig kérdezzen rá / várjon jóváhagyásra

export interface ConflictItem {
  id: string;
  title: string;
  trackId?: string;
  currentTrack: AnimeTrack;
  incomingTrack: Partial<AnimeTrack>;
  incomingSource: string;
  differences: {
    field: string;
    label: string;
    currentValue: any;
    incomingValue: any;
  }[];
  detectedAt: string;
  status: 'pending' | 'resolved';
  resolvedChoice?: 'keep_current' | 'use_incoming' | 'custom';
  appliedStrategy?: string;
}

export interface ConflictLogEntry {
  id: string;
  title: string;
  strategyUsed: ConflictStrategy;
  summary: string;
  resolvedAt: string;
  source: string;
}

export interface AniListSyncSettings {
  username: string;
  accessToken?: string;
  autoSyncOnLoad: boolean;
  lastSyncedAt?: string;
}

export interface MalSyncSettings {
  username: string;
  autoSyncOnLoad: boolean;
  lastSyncedAt?: string;
}

export interface ExtensionManifestInfo {
  version: string;
  name: string;
  description: string;
  githubUrl: string;
  zipDownloadUrl: string;
}

export interface ExtensionFile {
  name: string;
  path: string;
  language: 'json' | 'javascript' | 'html' | 'css';
  description: string;
  content: string;
}

