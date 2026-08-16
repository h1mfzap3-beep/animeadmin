import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';
import rawConfig from './firebase-applet-config.json';

const PORT = 3000;

// Initialize Firebase on Server
const firebaseConfig = {
  projectId: rawConfig.projectId || "gen-lang-client-0003317395",
  appId: rawConfig.appId || "1:166775776818:web:38c2b701cd499feb44be2b",
  apiKey: rawConfig.apiKey || "AIzaSyBT6F3vhAO_P-wb_PosgULeT-D-zwR0Mjo",
  authDomain: rawConfig.authDomain || "gen-lang-client-0003317395.firebaseapp.com",
  firestoreDatabaseId: (rawConfig as any).firestoreDatabaseId || "ai-studio-lunaanimetracker-5c5a6687-bf5d-4dc5-81e8-b9c87e1f2c97",
  storageBucket: rawConfig.storageBucket || "gen-lang-client-0003317395.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "166775776818"
};

const serverApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(serverApp, firebaseConfig.firestoreDatabaseId);

function generateSafeTrackId(title: string): string {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  return normalized || `anime_${Date.now()}`;
}

function normalizeWatchStatus(status?: string): string {
  if (!status) return 'watching';
  const clean = status.toLowerCase().trim();
  if (clean === 'planned' || clean === 'plan_to_watch' || clean === 'plantowatch') {
    return 'plan_to_watch';
  }
  if (clean === 'completed' || clean === 'finished' || clean === 'befejezve') {
    return 'completed';
  }
  if (clean === 'on_hold' || clean === 'onhold' || clean === 'paused' || clean === 'szünetel') {
    return 'on_hold';
  }
  if (clean === 'dropped' || clean === 'felbehagyva') {
    return 'dropped';
  }
  return 'watching';
}

// --- Luna Sync v6: idempotencia es last-write-wins utkozeskezeles ---

// eventId alapu duplikacio-szures: ugyanaz az esemeny (pl. egy retry miatt
// ketszer elkuldve) csak egyszer szamit bele. A Map a szerver folyamatban el,
// ujrainditasnal kiurul, de a per-dokumentum lastSyncEventId ezt athidalja.
const SYNC_DEDUPE_MAP = new Map<string, number>();
const SYNC_DEDUPE_MAX = 500;
const SYNC_DEDUPE_TTL_MS = 24 * 60 * 60 * 1000;

function isDuplicateEvent(eventId: string | undefined, trackLastEventId?: string): boolean {
  if (!eventId) return false;
  if (trackLastEventId && trackLastEventId === eventId) return true;
  if (SYNC_DEDUPE_MAP.has(eventId)) return true;

  const now = Date.now();
  if (SYNC_DEDUPE_MAP.size >= SYNC_DEDUPE_MAX) {
    for (const [k, t] of SYNC_DEDUPE_MAP.entries()) {
      if (now - t > SYNC_DEDUPE_TTL_MS) SYNC_DEDUPE_MAP.delete(k);
    }
    while (SYNC_DEDUPE_MAP.size >= SYNC_DEDUPE_MAX) {
      let oldestKey: string | null = null;
      let oldestTs = Infinity;
      for (const [k, t] of SYNC_DEDUPE_MAP.entries()) {
        if (t < oldestTs) { oldestTs = t; oldestKey = k; }
      }
      if (!oldestKey) break;
      SYNC_DEDUPE_MAP.delete(oldestKey);
    }
  }
  SYNC_DEDUPE_MAP.set(eventId, now);
  return false;
}

// A bejovo esemeny kliens-idobelyege lenyegesen regebbi, mint ami mar a
// Firestore-ban van (pl. egy regi, ujrakuldott sor-elem futna be kesobb),
// akkor a regi NEM irja felul az ujat. Az 5 mp tolerancia az eszkozok
// ora-eltereset kompenzalja.
function isStaleEvent(incomingTs: number | undefined, existingTs: number | undefined): boolean {
  if (typeof incomingTs !== 'number' || !Number.isFinite(incomingTs)) return false;
  if (typeof existingTs !== 'number' || !Number.isFinite(existingTs)) return false;
  return existingTs - incomingTs > 5000;
}

function pickClientTimestamp(body: any): number | undefined {
  const candidates = [body.clientTimestamp, body.timestamp];
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
  }
  return undefined;
}

async function startServer() {
  const app = express();

  // CORS Middleware for Tampermonkey and external sites (MagyarAnime, OniAnime, etc.)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json());

  // === API ROUTES ===

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      serverTime: new Date().toISOString(),
      service: 'Luna Anime Tracker Server Sync Gateway'
    });
  });

  // Cross-Origin Tampermonkey Real-time Sync Endpoint (Luna Sync v6:
  // idempotens, last-write-wins utkozeskezelessel)
  app.post('/api/sync', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const title = (body.title || '').trim();
      const episode = typeof body.episode === 'number' ? body.episode : parseInt(body.episode, 10) || 1;
      const totalEpisodes = body.totalEpisodes ? Number(body.totalEpisodes) : null;
      const source = (body.source || 'Egyéb').trim();
      const sourceUrl = (body.sourceUrl || '').trim();
      const rawStatus = body.status || 'watching';
      const status = normalizeWatchStatus(rawStatus);
      const coverImage = body.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
      const origin = body.origin || req.headers.origin || 'Tampermonkey Script';

      // Luna Sync v6 uj mezok
      const eventId = typeof body.eventId === 'string' ? body.eventId.slice(0, 64) : '';
      const deviceId = (typeof body.deviceId === 'string' ? body.deviceId : 'unknown-device').slice(0, 64);
      const clientTimestamp = pickClientTimestamp(body);
      const syncVersion = typeof body.syncVersion === 'number' ? body.syncVersion : 5;

      if (!title) {
        return res.status(400).json({ error: 'Anime title is required for sync' });
      }

      const cleanTargetTitle = title.toLowerCase().trim();
      const defaultTrackId = generateSafeTrackId(title);
      
      // Look up existing anime strictly by ID or exact title match (never unsafe substrings!)
      const tracksCol = collection(db, 'anime_tracks');
      const allDocsSnap = await getDocs(tracksCol);
      
      let matchedDocRef = doc(db, 'anime_tracks', defaultTrackId);
      let matchedDocData: any = null;
      let matchedDocId = defaultTrackId;

      // Helper for clean comparison (ignoring case, punctuation, multiple spaces)
      const normalizeForCompare = (s: string) => s.toLowerCase().replace(/[^a-z0-9áéíóöőúüű]/gi, '').trim();
      const targetNormalized = normalizeForCompare(title);

      for (const d of allDocsSnap.docs) {
        const data = d.data() as any;
        const itemTitle = (data.title || '').toLowerCase().trim();
        const itemNormalized = normalizeForCompare(data.title || '');

        // Match if IDs match OR exact titles match OR normalized alphanumeric strings match exactly
        if (d.id === defaultTrackId || itemTitle === cleanTargetTitle || (targetNormalized.length > 2 && itemNormalized === targetNormalized)) {
          matchedDocRef = doc(db, 'anime_tracks', d.id);
          matchedDocData = data;
          matchedDocId = d.id;
          break;
        }
      }

      // --- Idempotencia: mar feldolgozott esemeny ne duplikaljon ---
      if (isDuplicateEvent(eventId, matchedDocData?.lastSyncEventId)) {
        return res.json({
          success: true,
          action: 'duplicate',
          trackId: matchedDocId,
          title: matchedDocData?.title || title,
          episode: matchedDocData?.episode ?? episode,
          status: matchedDocData?.status || status
        });
      }

      // --- Utkozeskezeles: a regebbi kliens-esemeny nem irja felul az ujabbat ---
      if (matchedDocData && isStaleEvent(clientTimestamp, matchedDocData.lastClientTimestamp)) {
        console.log(`[API /api/sync] Skipped stale event for "${matchedDocData.title || title}" (incoming ts ${clientTimestamp} < stored ${matchedDocData.lastClientTimestamp})`);
        return res.json({
          success: true,
          action: 'skipped_stale',
          trackId: matchedDocId,
          title: matchedDocData.title || title,
          episode: matchedDocData.episode,
          status: matchedDocData.status
        });
      }

      const now = new Date().toISOString();

      if (matchedDocData) {
        const finalStatus = rawStatus ? status : (matchedDocData.status || 'watching');

        const updateData: Record<string, any> = {
          title: matchedDocData.title || title,
          episode,
          source,
          status: finalStatus,
          updatedAt: now,
          syncedFromExtension: true,
          lastWatchedUrl: sourceUrl || matchedDocData.sourceUrl || '',
          lastSyncOrigin: origin,
          lastSyncEventId: eventId,
          lastClientTimestamp: clientTimestamp ?? Date.now(),
          syncDeviceId: deviceId,
          syncVersion
        };

        if (totalEpisodes && !isNaN(totalEpisodes) && totalEpisodes > 0) {
          updateData.totalEpisodes = totalEpisodes;
        }
        if (sourceUrl) updateData.sourceUrl = sourceUrl;
        if (coverImage && (!matchedDocData.coverImage || matchedDocData.coverImage.includes('unsplash.com'))) {
          updateData.coverImage = coverImage;
        }

        await setDoc(matchedDocRef, updateData, { merge: true });
        console.log(`[API /api/sync] Updated "${matchedDocData.title || title}" (ID: ${matchedDocId}) -> Ep ${episode} (${finalStatus}) from ${origin}`);
        return res.json({ 
          success: true, 
          action: 'updated', 
          trackId: matchedDocId, 
          title: matchedDocData.title || title, 
          episode, 
          status: finalStatus 
        });
      } else {
        const newTrack: Record<string, any> = {
          id: defaultTrackId,
          title,
          episode,
          source,
          sourceUrl: sourceUrl || '',
          status,
          coverImage,
          rating: 9.0,
          notes: `Automatikusan szinkronizálva: ${source} (${new Date().toLocaleDateString('hu-HU')})`,
          genres: ['Anime', 'Szinkronizált'],
          syncedFromExtension: true,
          createdAt: now,
          updatedAt: now,
          lastWatchedUrl: sourceUrl || '',
          lastSyncOrigin: origin,
          lastSyncEventId: eventId,
          lastClientTimestamp: clientTimestamp ?? Date.now(),
          syncDeviceId: deviceId,
          syncVersion
        };

        if (totalEpisodes && !isNaN(totalEpisodes) && totalEpisodes > 0) {
          newTrack.totalEpisodes = totalEpisodes;
        }

        await setDoc(matchedDocRef, newTrack);
        console.log(`[API /api/sync] Created new track "${title}" -> Ep ${episode} (${status}) from ${origin}`);
        return res.json({ 
          success: true, 
          action: 'created', 
          trackId: defaultTrackId, 
          title, 
          episode, 
          status 
        });
      }
    } catch (err: any) {
      console.error('[API /api/sync Error]:', err);
      return res.status(500).json({ 
        error: 'Firestore sync failed', 
        message: err.message 
      });
    }
  });

  // Get all tracks from Firestore
  app.get('/api/tracks', async (req: Request, res: Response) => {
    try {
      const tracksCol = collection(db, 'anime_tracks');
      const q = query(tracksCol, limit(100));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json({ success: true, count: list.length, tracks: list });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to list tracks', message: err.message });
    }
  });

  // Vite middleware in dev or static dist serving in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Luna Anime Tracker backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Server Start Error]:', err);
});
