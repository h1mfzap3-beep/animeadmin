import { GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { AnimeTrack } from '../types';

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

export interface GoogleDriveBackupFile {
  id: string;
  name: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export interface DriveBackupBundle {
  appName: string;
  appVersion: string;
  exportDate: string;
  totalTracks: number;
  provider: 'google_drive';
  tracks: AnimeTrack[];
}

// In-memory cache for Google Access Token (NEVER stored in localStorage as per workspace rules)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Provider configured with Google Drive scope
export const driveGoogleProvider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach((scope) => {
  driveGoogleProvider.addScope(scope);
});
driveGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Auth state listener to automatically clear token on logout
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google with Drive scope
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveGoogleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Nem sikerült megszerezni a Google Drive hozzáférési tokent.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[GoogleDriveService] Bejelentkezési hiba:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setDriveAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const isDriveConnected = (): boolean => {
  return Boolean(cachedAccessToken);
};

// List backup files from Google Drive
export const listGoogleDriveBackups = async (token?: string): Promise<GoogleDriveBackupFile[]> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Nincs aktív Google Drive munkamenet. Kérlek jelentkezz be a Google fiókoddal!');
  }

  const query = encodeURIComponent("name contains 'Luna_Anime' and trashed = false");
  const fields = encodeURIComponent('files(id, name, size, createdTime, modifiedTime, webViewLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime+desc&pageSize=25`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('A Google Drive munkamenet lejárt. Kérlek jelentkezz be újra a Google gombbal.');
    }
    throw new Error(`Google Drive API lekérési hiba (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
};

// Upload whole database / anime tracks as a JSON backup to Google Drive
export const uploadBackupToGoogleDrive = async (
  tracks: AnimeTrack[],
  customFilename?: string,
  token?: string
): Promise<{ fileId: string; filename: string; webViewLink?: string }> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Nincs aktív Google Drive kapcsolat. Kérlek csatlakoztasd a Google fiókodat!');
  }

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = customFilename || `Luna_Anime_Backup_${dateStr}.json`;

  const bundle: DriveBackupBundle = {
    appName: 'Luna Anime Tracker',
    appVersion: '2.5.0',
    exportDate: now.toISOString(),
    totalTracks: tracks.length,
    provider: 'google_drive',
    tracks,
  };

  const metadata = {
    name: filename,
    mimeType: 'application/json',
    description: `Luna Anime Tracker biztonsági mentés (${tracks.length} anime cím)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(bundle, null, 2) +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${activeToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      cachedAccessToken = null;
      throw new Error('A Google Drive munkamenet lejárt. Kérlek lépj be újra a Google fiókoddal.');
    }
    throw new Error(`Google Drive feltöltési hiba (${response.status}): ${errorText}`);
  }

  const resData = await response.json();
  return {
    fileId: resData.id,
    filename,
    webViewLink: resData.webViewLink,
  };
};

// Download backup JSON file content from Google Drive
export const downloadBackupContentFromDrive = async (
  fileId: string,
  token?: string
): Promise<DriveBackupBundle> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Nincs aktív Google Drive kapcsolat.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Nem sikerült letölteni a mentési fájlt a Google Drive-ról (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.tracks)) {
    throw new Error('A letöltött fájl formátuma nem érvényes Luna Anime Tracker mentési csomag.');
  }

  return data as DriveBackupBundle;
};

// Delete backup file from Google Drive with explicit confirmation requirement
export const deleteBackupFromGoogleDrive = async (fileId: string, token?: string): Promise<boolean> => {
  const activeToken = token || cachedAccessToken;
  if (!activeToken) {
    throw new Error('Nincs aktív Google Drive kapcsolat.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${activeToken}`,
    },
  });

  if (!response.ok && response.status !== 204 && response.status !== 404) {
    const errorText = await response.text();
    throw new Error(`Nem sikerült törölni a fájlt a Google Drive-ról (${response.status}): ${errorText}`);
  }

  return true;
};
