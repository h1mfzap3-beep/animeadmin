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

async function startServer() {
  const app = express();

  // CORS Middleware for Tampermonkey and external sites (MagyarAnime, OniAnime, etc.)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Luna-Client');
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

  // Cross-Origin Tampermonkey Real-time Sync Endpoint
  app.post('/api/sync', async (req: Request, res: Response) => {
    try {
      const body = req.body || {};
      const rawTitle = body.title ?? body.animeTitle;
      const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
      const rawEpisode = body.episode ?? body.episodeNumber;
      const episode = typeof rawEpisode === 'number' ? rawEpisode : parseInt(String(rawEpisode), 10) || 1;
      const totalEpisodes = body.totalEpisodes ? Number(body.totalEpisodes) : null;
      const source = (body.source || 'Egyéb').trim();
      const sourceUrl = (body.sourceUrl || '').trim();
      const rawStatus = body.status || 'watching';
      const status = normalizeWatchStatus(rawStatus);
      const coverImage = body.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80';
      const origin = body.origin || req.headers.origin || 'Tampermonkey Script';

      if (!title || title === 'Anime Sorozat') {
        return res.status(400).json({ error: 'A pontos anime cím szükséges a szinkronizáláshoz.' });
      }
      if (!Number.isInteger(episode) || episode < 1 || episode > 10000) {
        return res.status(400).json({ error: 'Érvénytelen epizódszám.' });
      }

      const cleanTargetTitle = title.toLowerCase().trim();
      const defaultTrackId = generateSafeTrackId(title);
      
      // Look up existing anime strictly by ID or exact title match (never unsafe substrings!)
      const tracksCol = collection(db, 'anime_tracks');
      let matchedDocRef = doc(db, 'anime_tracks', defaultTrackId);
      let matchedDocData: any = null;
      let matchedDocId = defaultTrackId;

      // Use the deterministic document ID first; scan old records only for compatibility.
      const directDocSnap = await getDoc(matchedDocRef);
      if (directDocSnap.exists()) {
        matchedDocData = directDocSnap.data();
      } else {
        const allDocsSnap = await getDocs(tracksCol);
        const normalizeForCompare = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').trim();
        const targetNormalized = normalizeForCompare(title);
        for (const d of allDocsSnap.docs) {
          const data = d.data() as any;
          const itemTitle = (data.title || '').toLowerCase().trim();
          const itemNormalized = normalizeForCompare(data.title || '');
          if (d.id === defaultTrackId || itemTitle === cleanTargetTitle || (targetNormalized.length > 2 && itemNormalized === targetNormalized)) {
            matchedDocRef = doc(db, 'anime_tracks', d.id);
            matchedDocData = data;
            matchedDocId = d.id;
            break;
          }
        }
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
          lastSyncOrigin: origin
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
          lastSyncOrigin: origin
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
