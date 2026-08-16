import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs,
  query, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth, ADMIN_EMAIL } from '../firebase/config';
import { AnimeTrack, WatchStatus } from '../types';

export const ANIME_COLLECTION = 'anime_tracks';

// Helper to remove any undefined keys so Firestore doesn't throw FirebaseError
export function cleanFirestoreObject<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = cleanFirestoreObject(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean as T;
}

// Test Firestore connection as per skill requirement
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase is currently offline or unreachable.");
    }
  }
}

// Subscribe to real-time updates using onSnapshot without fake mock fallbacks
export function subscribeToAnimeTracks(
  onData: (tracks: AnimeTrack[]) => void,
  onError?: (err: any) => void
) {
  const collectionRef = collection(db, ANIME_COLLECTION);
  const q = query(collectionRef);

  return onSnapshot(
    q,
    async (snapshot) => {
      // Return actual real database records (empty array if no records)
      if (snapshot.empty) {
        onData([]);
        return;
      }

      const items: AnimeTrack[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title || 'Névtelen Anime',
          episode: typeof data.episode === 'number' ? data.episode : 1,
          totalEpisodes: data.totalEpisodes || undefined,
          source: data.source || 'MagyarAnime',
          sourceUrl: data.sourceUrl || '',
          status: data.status || 'watching',
          coverImage: data.coverImage || '',
          rating: typeof data.rating === 'number' ? data.rating : 8.5,
          notes: data.notes || '',
          genres: data.genres || [],
          syncedFromExtension: !!data.syncedFromExtension,
          userId: data.userId,
          userEmail: data.userEmail,
          updatedAt: data.updatedAt || new Date().toISOString(),
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      // Sort by updatedAt descending (most recently watched/updated first)
      items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      onData(items);
    },
    (error) => {
      console.error("Firestore onSnapshot error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ANIME_COLLECTION);
    }
  );
}

// Add a new anime track
export async function addAnimeTrack(data: Omit<AnimeTrack, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  
  const payload: AnimeTrack = {
    ...data,
    id,
    userId: auth.currentUser?.uid || 'admin',
    userEmail: auth.currentUser?.email || ADMIN_EMAIL,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, ANIME_COLLECTION, id), cleanFirestoreObject(payload));
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${ANIME_COLLECTION}/${id}`);
    throw error;
  }
}

export function normalizeWatchStatus(status?: string): WatchStatus {
  if (!status) return 'watching';
  const s = status.toLowerCase().trim();
  if (s === 'planned' || s === 'plan_to_watch' || s === 'plantowatch' || s === 'plan') return 'plan_to_watch';
  if (s === 'completed' || s === 'finished') return 'completed';
  if (s === 'on_hold' || s === 'onhold' || s === 'paused') return 'on_hold';
  if (s === 'dropped') return 'dropped';
  return 'watching';
}

// Upsert or update anime track when real-time signal comes from extension or Tampermonkey
export async function syncRealtimeAnimeTrack(data: {
  title: string;
  episode: number;
  totalEpisodes?: number;
  source: string;
  sourceUrl?: string;
  status?: WatchStatus | string;
  coverImage?: string;
}) {
  try {
    const collectionRef = collection(db, ANIME_COLLECTION);
    const snap = await getDocs(collectionRef);
    let existingDocId: string | null = null;
    let existingData: any = null;

    snap.forEach((d) => {
      const item = d.data();
      if (item.title && item.title.toLowerCase().trim() === data.title.toLowerCase().trim()) {
        existingDocId = d.id;
        existingData = item;
      }
    });

    const now = new Date().toISOString();
    const effectiveStatus = normalizeWatchStatus(data.status);

    if (existingDocId) {
      const updatedEp = (typeof data.episode === 'number' && !isNaN(data.episode) && data.episode > 0) 
        ? data.episode 
        : (existingData.episode || 1);
      const updates: Partial<AnimeTrack> = {
        episode: updatedEp,
        source: data.source || existingData.source,
        sourceUrl: data.sourceUrl || existingData.sourceUrl,
        updatedAt: now,
        syncedFromExtension: true,
      };

      if (data.status) {
        updates.status = effectiveStatus;
      }
      if (data.coverImage && !existingData.coverImage) {
        updates.coverImage = data.coverImage;
      }
      if (existingData.totalEpisodes && updatedEp >= existingData.totalEpisodes) {
        updates.status = 'completed';
      }
      await updateDoc(doc(db, ANIME_COLLECTION, existingDocId), cleanFirestoreObject(updates));
      return { id: existingDocId, isNew: false, updatedEpisode: updatedEp, status: updates.status || existingData.status };
    } else {
      const newId = `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const payload: Record<string, any> = {
        id: newId,
        title: data.title,
        episode: data.episode,
        source: data.source,
        sourceUrl: data.sourceUrl || '',
        status: effectiveStatus,
        coverImage: data.coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        rating: 9.0,
        notes: 'Automatikusan szinkronizálva a valós idejű bővítmény / Tampermonkey által.',
        genres: ['Anime'],
        syncedFromExtension: true,
        userId: auth.currentUser?.uid || 'admin',
        userEmail: auth.currentUser?.email || ADMIN_EMAIL,
        createdAt: now,
        updatedAt: now,
      };
      if (data.totalEpisodes) {
        payload.totalEpisodes = data.totalEpisodes;
      }
      await setDoc(doc(db, ANIME_COLLECTION, newId), cleanFirestoreObject(payload));
      return { id: newId, isNew: true, updatedEpisode: data.episode, status: effectiveStatus };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, ANIME_COLLECTION);
    throw error;
  }
}

// Update an anime track
export async function updateAnimeTrack(id: string, data: Partial<AnimeTrack>) {
  const now = new Date().toISOString();
  const updatePayload = {
    ...data,
    updatedAt: now,
  };

  try {
    await updateDoc(doc(db, ANIME_COLLECTION, id), cleanFirestoreObject(updatePayload));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ANIME_COLLECTION}/${id}`);
    throw error;
  }
}

// Increment episode by 1 with auto status update if finished
export async function incrementEpisode(id: string, currentEp: number, totalEp?: number) {
  const nextEp = currentEp + 1;
  const updates: Partial<AnimeTrack> = {
    episode: nextEp,
    updatedAt: new Date().toISOString()
  };

  if (totalEp && nextEp >= totalEp) {
    updates.status = 'completed';
  }

  try {
    await updateDoc(doc(db, ANIME_COLLECTION, id), cleanFirestoreObject(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ANIME_COLLECTION}/${id}`);
    throw error;
  }
}

// Delete an anime track
export async function deleteAnimeTrack(id: string) {
  try {
    await deleteDoc(doc(db, ANIME_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ANIME_COLLECTION}/${id}`);
    throw error;
  }
}

// Batch import / restore tracks from Google Drive or Dropbox backup
export async function importAnimeTracks(tracks: AnimeTrack[], mode: 'merge' | 'replace' = 'merge') {
  try {
    const batch = writeBatch(db);
    const collectionRef = collection(db, ANIME_COLLECTION);

    if (mode === 'replace') {
      const snap = await getDocs(collectionRef);
      snap.forEach((d) => {
        batch.delete(d.ref);
      });
    }

    const now = new Date().toISOString();
    tracks.forEach((track) => {
      const id = track.id || `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const docRef = doc(db, ANIME_COLLECTION, id);
      batch.set(docRef, cleanFirestoreObject({
        ...track,
        id,
        userId: auth.currentUser?.uid || 'admin',
        userEmail: auth.currentUser?.email || ADMIN_EMAIL,
        updatedAt: track.updatedAt || now,
        createdAt: track.createdAt || now,
      }));
    });

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ANIME_COLLECTION);
    throw error;
  }
}

// Delete all tracks from Firestore
export async function clearAllAnimeTracks() {
  try {
    const batch = writeBatch(db);
    const snap = await getDocs(collection(db, ANIME_COLLECTION));
    snap.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, ANIME_COLLECTION);
    throw error;
  }
}
