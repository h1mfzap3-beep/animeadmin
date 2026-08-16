import { AnimeTrack } from '../types';

export interface BackupBundle {
  appName: string;
  appVersion: string;
  exportDate: string;
  totalTracks: number;
  provider: 'google_drive' | 'dropbox' | 'manual_export';
  tracks: AnimeTrack[];
}

export interface RealtimeWatchEvent {
  type: 'LUNA_ANIME_PROGRESS' | 'LUNA_ANIME_PING' | 'LUNA_TEST_BROADCAST';
  anime: {
    title: string;
    episode: number;
    totalEpisodes?: number;
    source: string;
    sourceUrl?: string;
    status?: string;
    coverImage?: string;
  };
  timestamp: number;
  origin: string;
}

const BROADCAST_CHANNEL_NAME = 'luna_anime_realtime_channel';
const STORAGE_SYNC_KEY = 'luna_realtime_anime_sync';
const DROPBOX_TOKEN_KEY = 'luna_dropbox_access_token';
const GDRIVE_AUTO_SYNC_KEY = 'luna_gdrive_auto_sync_enabled';

// --- REAL-TIME COMMUNICATION ENGINE ---

let realtimeBroadcastChannel: BroadcastChannel | null = null;

export function getRealtimeChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    if (!realtimeBroadcastChannel) {
      realtimeBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    }
    return realtimeBroadcastChannel;
  }
  return null;
}

// Broadcasts real-time anime progress to all listening tabs & web app
export function broadcastRealtimeProgress(eventData: RealtimeWatchEvent['anime']) {
  const event: RealtimeWatchEvent = {
    type: 'LUNA_ANIME_PROGRESS',
    anime: eventData,
    timestamp: Date.now(),
    origin: typeof window !== 'undefined' ? window.location.origin : 'unknown'
  };

  // 1. BroadcastChannel API
  try {
    const channel = getRealtimeChannel();
    if (channel) {
      channel.postMessage(event);
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 2. Cross-tab Storage Event Trigger
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(event));
    } catch (e) {
      console.warn('LocalStorage broadcast error:', e);
    }
  }

  // 3. Window PostMessage
  if (typeof window !== 'undefined') {
    window.postMessage(event, '*');
  }
}

// Listen to real-time events from extension or userscript
export function initRealtimeBridgeListener(
  onEventReceived: (event: RealtimeWatchEvent) => void
): () => void {
  // BroadcastChannel listener
  const channel = getRealtimeChannel();
  const handleChannelMessage = (msgEvent: MessageEvent) => {
    if (msgEvent.data && (msgEvent.data.type === 'LUNA_ANIME_PROGRESS' || msgEvent.data.type === 'LUNA_TEST_BROADCAST')) {
      onEventReceived(msgEvent.data as RealtimeWatchEvent);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleChannelMessage);
  }

  // Storage listener for cross-tab sync
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_SYNC_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed && (parsed.type === 'LUNA_ANIME_PROGRESS' || parsed.type === 'LUNA_TEST_BROADCAST')) {
          onEventReceived(parsed);
        }
      } catch (err) {
        console.warn('Storage event parse error:', err);
      }
    }
  };

  // Window message listener
  const handleWindowMessage = (e: MessageEvent) => {
    if (e.data && (e.data.type === 'LUNA_ANIME_PROGRESS' || e.data.type === 'LUNA_TEST_BROADCAST')) {
      onEventReceived(e.data as RealtimeWatchEvent);
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  window.addEventListener('message', handleWindowMessage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleChannelMessage);
    }
    window.removeEventListener('storage', handleStorageEvent);
    window.removeEventListener('message', handleWindowMessage);
  };
}

// --- CLOUD SYNC & BACKUP: GOOGLE DRIVE & DROPBOX ---

export function generateBackupBundle(tracks: AnimeTrack[], provider: 'google_drive' | 'dropbox' | 'manual_export'): BackupBundle {
  return {
    appName: 'Luna Anime Tracker',
    appVersion: '2.5.0',
    exportDate: new Date().toISOString(),
    totalTracks: tracks.length,
    provider,
    tracks,
  };
}

// Export backup to JSON file download (Can be uploaded directly to Google Drive or local storage)
export function downloadBackupFile(bundle: BackupBundle, filename?: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const name = filename || `Luna_Anime_Backup_${dateStr}.json`;
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Save or sync to Google Drive via Direct API or export stream
export async function syncToGoogleDrive(tracks: AnimeTrack[], googleAccessToken?: string): Promise<{ success: boolean; message: string; fileId?: string }> {
  const bundle = generateBackupBundle(tracks, 'google_drive');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Luna_Anime_GoogleDrive_Backup_${dateStr}.json`;

  if (googleAccessToken) {
    try {
      const metadata = {
        name: filename,
        mimeType: 'application/json',
        description: 'Luna Anime Tracker Cloud Backup'
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Google Drive API hiba (${response.status}): ${await response.text()}`);
      }

      const result = await response.json();
      return {
        success: true,
        message: `Sikeres Google Drive szinkronizáció! Fájl mentve: ${filename}`,
        fileId: result.id
      };
    } catch (err: any) {
      console.warn('Google Drive direct upload failed, falling back to local download:', err);
      downloadBackupFile(bundle, filename);
      return {
        success: true,
        message: `A Google Drive mentési fájl (${filename}) letöltve a gépedre. (API: ${err.message})`
      };
    }
  } else {
    // If no direct OAuth token is set, generate and download the drive backup file
    downloadBackupFile(bundle, filename);
    return {
      success: true,
      message: `Google Drive mentési csomag (${filename}) sikeresen legenerálva és letöltve!`
    };
  }
}

// Sync to Dropbox using Dropbox API v2
export async function syncToDropbox(tracks: AnimeTrack[], dropboxToken: string): Promise<{ success: boolean; message: string; path?: string }> {
  if (!dropboxToken || !dropboxToken.trim()) {
    throw new Error('Kérlek add meg a Dropbox Access Token-t a szinkronizációhoz!');
  }

  const bundle = generateBackupBundle(tracks, 'dropbox');
  const path = '/LunaAnimeTracker/luna_anime_backup.json';

  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dropboxToken.trim()}`,
        'Dropbox-API-Arg': JSON.stringify({
          path,
          mode: 'overwrite',
          autorename: false,
          mute: false,
          strict_conflict: false
        }),
        'Content-Type': 'application/octet-stream'
      },
      body: new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Dropbox API Hiba (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `Sikeres Dropbox szinkronizáció! Fájl helye: ${data.path_display || path}`,
      path: data.path_display || path
    };
  } catch (error: any) {
    throw new Error(`Dropbox szinkronizáció sikertelen: ${error.message}`);
  }
}

// Restore / Download from Dropbox
export async function restoreFromDropbox(dropboxToken: string): Promise<AnimeTrack[]> {
  if (!dropboxToken || !dropboxToken.trim()) {
    throw new Error('Kérlek add meg a Dropbox Access Token-t a visszaállításhoz!');
  }

  const path = '/LunaAnimeTracker/luna_anime_backup.json';

  try {
    const response = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dropboxToken.trim()}`,
        'Dropbox-API-Arg': JSON.stringify({ path })
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Dropbox Letöltési Hiba (${response.status}): ${errText}`);
    }

    const json = await response.json();
    if (json.tracks && Array.isArray(json.tracks)) {
      return json.tracks;
    } else if (Array.isArray(json)) {
      return json;
    } else {
      throw new Error('A Dropbox biztonsági mentés érvénytelen formátumú.');
    }
  } catch (error: any) {
    throw new Error(`Dropbox visszaállítás sikertelen: ${error.message}`);
  }
}

// Helper to validate and parse imported JSON string
export function parseAndValidateBackup(jsonString: string): AnimeTrack[] {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && Array.isArray(parsed.tracks)) {
      return parsed.tracks;
    }
    if (Array.isArray(parsed)) {
      return parsed;
    }
    throw new Error('Érvénytelen mentés fájl szerkezet.');
  } catch (e: any) {
    throw new Error(`Nem sikerült a JSON fájl feldolgozása: ${e.message}`);
  }
}

// Storage helpers
export function getSavedDropboxToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(DROPBOX_TOKEN_KEY) || '';
  }
  return '';
}

export function saveDropboxToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DROPBOX_TOKEN_KEY, token);
  }
}
