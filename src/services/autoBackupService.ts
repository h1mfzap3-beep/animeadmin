import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { AnimeTrack } from '../types';
import { getDriveAccessToken, uploadBackupToGoogleDrive } from './googleDriveService';
import { getSavedDropboxToken, syncToDropbox } from './cloudSyncService';

export interface AutoBackupMetadata {
  lastAutoBackupAt: string | null;
  lastAutoBackupProvider: 'google_drive' | 'dropbox' | 'both' | 'none';
  lastAutoBackupCount: number;
  status: 'idle' | 'running' | 'success' | 'warning' | 'error';
  lastError: string | null;
  nextScheduledBackupAt?: string;
  updatedAt: string;
}

const LOCAL_STORAGE_AUTO_BACKUP_KEY = 'luna_last_auto_backup_meta';
const AUTO_BACKUP_DOC_PATH = 'app_metadata';
const AUTO_BACKUP_DOC_ID = 'auto_backup';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const CHANGE_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
const CHANGE_THRESHOLD_COUNT = 10; // Trigger auto backup after 10 changes

type AutoBackupListener = (meta: AutoBackupMetadata) => void;
const listeners: Set<AutoBackupListener> = new Set();

export function subscribeToAutoBackupStatus(callback: AutoBackupListener): () => void {
  listeners.add(callback);
  // Send current cached status immediately
  callback(getCachedAutoBackupMetadata());
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(meta: AutoBackupMetadata) {
  listeners.forEach((cb) => {
    try {
      cb(meta);
    } catch (e) {
      console.warn('[AutoBackup] Listener notification error:', e);
    }
  });
}

export function getCachedAutoBackupMetadata(): AutoBackupMetadata {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_AUTO_BACKUP_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[AutoBackup] LocalStorage read note:', e);
    }
  }

  return {
    lastAutoBackupAt: null,
    lastAutoBackupProvider: 'none',
    lastAutoBackupCount: 0,
    status: 'idle',
    lastError: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchAutoBackupMetadata(): Promise<AutoBackupMetadata> {
  try {
    const docRef = doc(db, AUTO_BACKUP_DOC_PATH, AUTO_BACKUP_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AutoBackupMetadata;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_AUTO_BACKUP_KEY, JSON.stringify(data));
      }
      notifyListeners(data);
      return data;
    }
  } catch (err: any) {
    console.warn('[AutoBackup] Firestore metadata fetch note (using fallback):', err.message);
  }

  const fallback = getCachedAutoBackupMetadata();
  notifyListeners(fallback);
  return fallback;
}

export async function saveAutoBackupMetadata(meta: Partial<AutoBackupMetadata>): Promise<void> {
  const current = getCachedAutoBackupMetadata();
  const updated: AutoBackupMetadata = {
    ...current,
    ...meta,
    updatedAt: new Date().toISOString(),
  };

  // 1. LocalStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_AUTO_BACKUP_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[AutoBackup] LocalStorage write error:', e);
    }
  }

  notifyListeners(updated);

  // 2. Firestore Document (app_metadata/auto_backup)
  try {
    const docRef = doc(db, AUTO_BACKUP_DOC_PATH, AUTO_BACKUP_DOC_ID);
    await setDoc(docRef, updated, { merge: true });
  } catch (err: any) {
    console.warn('[AutoBackup] Firestore metadata save note:', err.message);
  }
}

/**
 * Runs the automatic mirror backup to connected Google Drive / Dropbox providers.
 * Firestore remains the single source of truth; providers act as read-only mirrors.
 */
export async function executeAutoBackup(
  tracks: AnimeTrack[],
  reason: 'scheduled_24h' | 'change_threshold' | 'manual_trigger' = 'scheduled_24h'
): Promise<{ success: boolean; providersSynced: string[]; errors: string[] }> {
  if (!tracks || tracks.length === 0) {
    return { success: true, providersSynced: [], errors: [] };
  }

  const driveToken = getDriveAccessToken();
  const dropboxToken = getSavedDropboxToken();

  if (!driveToken && !dropboxToken) {
    // No backup provider is connected yet
    return { success: true, providersSynced: [], errors: [] };
  }

  await saveAutoBackupMetadata({ status: 'running', lastError: null });

  const providersSynced: string[] = [];
  const errors: string[] = [];

  // 1. Google Drive Auto-Mirror
  if (driveToken) {
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `Luna_Anime_AutoBackup_GDrive_${dateStr}.json`;
      await uploadBackupToGoogleDrive(tracks, filename, driveToken);
      providersSynced.push('google_drive');
    } catch (err: any) {
      console.warn('[AutoBackup] Google Drive auto-mirror error:', err.message);
      errors.push(`Google Drive: ${err.message}`);
    }
  }

  // 2. Dropbox Auto-Mirror
  if (dropboxToken) {
    try {
      await syncToDropbox(tracks, dropboxToken);
      providersSynced.push('dropbox');
    } catch (err: any) {
      console.warn('[AutoBackup] Dropbox auto-mirror error:', err.message);
      errors.push(`Dropbox: ${err.message}`);
    }
  }

  const nowIso = new Date().toISOString();
  let providerType: AutoBackupMetadata['lastAutoBackupProvider'] = 'none';
  if (providersSynced.includes('google_drive') && providersSynced.includes('dropbox')) {
    providerType = 'both';
  } else if (providersSynced.includes('google_drive')) {
    providerType = 'google_drive';
  } else if (providersSynced.includes('dropbox')) {
    providerType = 'dropbox';
  }

  if (providersSynced.length > 0) {
    await saveAutoBackupMetadata({
      lastAutoBackupAt: nowIso,
      lastAutoBackupProvider: providerType,
      lastAutoBackupCount: tracks.length,
      status: errors.length > 0 ? 'warning' : 'success',
      lastError: errors.length > 0 ? errors.join('; ') : null,
      nextScheduledBackupAt: new Date(Date.now() + TWENTY_FOUR_HOURS_MS).toISOString(),
    });
    console.log(`[AutoBackup] Completed (${reason}): ${providersSynced.join(', ')} (${tracks.length} tracks)`);
    return { success: true, providersSynced, errors };
  } else if (errors.length > 0) {
    await saveAutoBackupMetadata({
      status: 'error',
      lastError: errors.join('; '),
    });
    return { success: false, providersSynced: [], errors };
  }

  await saveAutoBackupMetadata({ status: 'idle' });
  return { success: true, providersSynced: [], errors: [] };
}

/**
 * Initializes background auto-backup engine.
 * - Checks every 15 minutes if 24h periodic backup is due for connected providers.
 * - Tracks change count on live Firestore tracks state and fires debounced backup on threshold.
 */
export function initAutoBackupEngine(getLiveTracks: () => AnimeTrack[]): () => void {
  let lastTrackStateHash = '';
  let accumulatedChanges = 0;
  let debounceTimer: any = null;

  // Initial fetch of metadata
  fetchAutoBackupMetadata().catch(() => {});

  const checkScheduledInterval = async () => {
    try {
      const meta = getCachedAutoBackupMetadata();
      const lastBackupTime = meta.lastAutoBackupAt ? new Date(meta.lastAutoBackupAt).getTime() : 0;
      const now = Date.now();

      const driveToken = getDriveAccessToken();
      const dropboxToken = getSavedDropboxToken();

      if ((driveToken || dropboxToken) && (now - lastBackupTime >= TWENTY_FOUR_HOURS_MS)) {
        const liveTracks = getLiveTracks();
        if (liveTracks && liveTracks.length > 0) {
          await executeAutoBackup(liveTracks, 'scheduled_24h');
        }
      }
    } catch (e) {
      console.warn('[AutoBackup] Scheduled check error:', e);
    }
  };

  // Run scheduled check every 15 minutes
  const intervalId = setInterval(checkScheduledInterval, 15 * 60 * 1000);

  // Initial check after 5 seconds of booting
  const initialTimeout = setTimeout(checkScheduledInterval, 5000);

  /**
   * Called when live Firestore tracks change
   */
  const handleTracksChange = (newTracks: AnimeTrack[]) => {
    if (!newTracks) return;

    // Fast signature of tracks array (length + latest updatedAt)
    const currentHash = `${newTracks.length}_${newTracks[0]?.updatedAt || ''}_${newTracks[newTracks.length - 1]?.updatedAt || ''}`;
    
    if (lastTrackStateHash && lastTrackStateHash !== currentHash) {
      accumulatedChanges++;

      if (accumulatedChanges >= CHANGE_THRESHOLD_COUNT) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          accumulatedChanges = 0;
          const liveTracks = getLiveTracks();
          if (liveTracks && liveTracks.length > 0) {
            await executeAutoBackup(liveTracks, 'change_threshold');
          }
        }, CHANGE_DEBOUNCE_MS);
      }
    }

    lastTrackStateHash = currentHash;
  };

  return {
    notifyTracksChanged: handleTracksChange,
    cleanup: () => {
      clearInterval(intervalId);
      clearTimeout(initialTimeout);
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  }.cleanup;
}
