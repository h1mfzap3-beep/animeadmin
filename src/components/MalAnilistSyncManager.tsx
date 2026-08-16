import React, { useState, useEffect } from 'react';
import { AnimeTrack } from '../types';
import { 
  fetchAniListUserCollection, 
  fetchMalUserCollection, 
  parseMalXmlExport,
  getSavedAniListSettings, 
  saveAniListSettings, 
  getSavedMalSettings, 
  saveMalSettings,
  searchAniListAnime,
  ExternalAnimeMatch 
} from '../services/malAnilistService';
import { resolveAndMergeTracks, getActiveConflictStrategy } from '../services/conflictService';
import { importAnimeTracks } from '../services/firestoreService';
import { 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Upload, 
  Search, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Tv,
  ArrowRight
} from 'lucide-react';

interface MalAnilistSyncManagerProps {
  currentTracks: AnimeTrack[];
  onTracksUpdated?: (tracks: AnimeTrack[]) => void;
}

export const MalAnilistSyncManager: React.FC<MalAnilistSyncManagerProps> = ({
  currentTracks,
  onTracksUpdated
}) => {
  // AniList State
  const [aniListUsername, setAniListUsername] = useState('');
  const [aniListToken, setAniListToken] = useState('');
  const [isAniListLoading, setIsAniListLoading] = useState(false);
  const [aniListStatusMsg, setAniListStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // MAL State
  const [malUsername, setMalUsername] = useState('');
  const [isMalLoading, setIsMalLoading] = useState(false);
  const [malStatusMsg, setMalStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AniList Search & Matcher State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExternalAnimeMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync Summary Modal / Box
  const [lastSyncResult, setLastSyncResult] = useState<{
    source: string;
    newTracks: number;
    autoResolved: number;
    pendingConflicts: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const savedAniList = getSavedAniListSettings();
    if (savedAniList.username) {
      setAniListUsername(savedAniList.username);
      setAniListToken(savedAniList.token || '');
    }

    const savedMal = getSavedMalSettings();
    if (savedMal.username) {
      setMalUsername(savedMal.username);
    }
  }, []);

  // Handler for AniList Fetch
  const handleSyncAniList = async () => {
    if (!aniListUsername.trim()) {
      setAniListStatusMsg({ type: 'error', text: 'Kérlek add meg az AniList felhasználónevedet!' });
      return;
    }

    setIsAniListLoading(true);
    setAniListStatusMsg(null);
    setLastSyncResult(null);

    try {
      saveAniListSettings({ username: aniListUsername.trim(), token: aniListToken.trim(), autoSync: true });
      const incomingTracks = await fetchAniListUserCollection(aniListUsername.trim());

      if (incomingTracks.length === 0) {
        setAniListStatusMsg({ type: 'error', text: 'Nem található anime a megadott AniList fiókon.' });
        setIsAniListLoading(false);
        return;
      }

      // Merge and resolve conflicts automatically
      const strategy = getActiveConflictStrategy();
      const { mergedTracks, autoResolvedCount, newTracksCount, pendingConflicts } = resolveAndMergeTracks(
        currentTracks,
        incomingTracks,
        strategy
      );

      // Save merged to database
      await importAnimeTracks(mergedTracks, 'replace');
      if (onTracksUpdated) onTracksUpdated(mergedTracks);

      setLastSyncResult({
        source: 'AniList',
        newTracks: newTracksCount,
        autoResolved: autoResolvedCount,
        pendingConflicts: pendingConflicts.length,
        total: mergedTracks.length
      });

      setAniListStatusMsg({
        type: 'success',
        text: `Sikeres AniList szinkronizáció! ${incomingTracks.length} cím feldolgozva (${newTracksCount} új, ${autoResolvedCount} automatikusan összefésült).`
      });
    } catch (err: any) {
      setAniListStatusMsg({ type: 'error', text: err.message || 'AniList szinkronizációs hiba történt.' });
    } finally {
      setIsAniListLoading(false);
    }
  };

  // Handler for MyAnimeList Fetch
  const handleSyncMal = async () => {
    if (!malUsername.trim()) {
      setMalStatusMsg({ type: 'error', text: 'Kérlek add meg a MyAnimeList felhasználónevedet!' });
      return;
    }

    setIsMalLoading(true);
    setMalStatusMsg(null);
    setLastSyncResult(null);

    try {
      saveMalSettings({ username: malUsername.trim(), autoSync: true });
      const incomingTracks = await fetchMalUserCollection(malUsername.trim());

      if (incomingTracks.length === 0) {
        setMalStatusMsg({ type: 'error', text: 'Nem található anime a megadott MyAnimeList fiókon.' });
        setIsMalLoading(false);
        return;
      }

      const strategy = getActiveConflictStrategy();
      const { mergedTracks, autoResolvedCount, newTracksCount, pendingConflicts } = resolveAndMergeTracks(
        currentTracks,
        incomingTracks,
        strategy
      );

      await importAnimeTracks(mergedTracks, 'replace');
      if (onTracksUpdated) onTracksUpdated(mergedTracks);

      setLastSyncResult({
        source: 'MyAnimeList',
        newTracks: newTracksCount,
        autoResolved: autoResolvedCount,
        pendingConflicts: pendingConflicts.length,
        total: mergedTracks.length
      });

      setMalStatusMsg({
        type: 'success',
        text: `Sikeres MyAnimeList szinkronizáció! ${incomingTracks.length} cím feldolgozva (${newTracksCount} új, ${autoResolvedCount} összefésülve).`
      });
    } catch (err: any) {
      setMalStatusMsg({ type: 'error', text: err.message || 'MyAnimeList hiba történt.' });
    } finally {
      setIsMalLoading(false);
    }
  };

  // Handler for MyAnimeList XML File Upload
  const handleMalXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const incomingTracks = parseMalXmlExport(text);

        if (incomingTracks.length === 0) {
          setMalStatusMsg({ type: 'error', text: 'Nem sikerült érvényes animét találni az XML fájlban.' });
          return;
        }

        const strategy = getActiveConflictStrategy();
        const { mergedTracks, autoResolvedCount, newTracksCount, pendingConflicts } = resolveAndMergeTracks(
          currentTracks,
          incomingTracks,
          strategy
        );

        await importAnimeTracks(mergedTracks, 'replace');
        if (onTracksUpdated) onTracksUpdated(mergedTracks);

        setLastSyncResult({
          source: 'MyAnimeList XML Fájl',
          newTracks: newTracksCount,
          autoResolved: autoResolvedCount,
          pendingConflicts: pendingConflicts.length,
          total: mergedTracks.length
        });

        setMalStatusMsg({
          type: 'success',
          text: `Sikeres XML import! ${incomingTracks.length} cím betöltve a fájlból.`
        });
      } catch (err: any) {
        setMalStatusMsg({ type: 'error', text: `XML feldolgozási hiba: ${err.message}` });
      }
    };
    reader.readAsText(file);
  };

  // AniList Anime Search
  const handleSearchAniList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchAniListAnime(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.warn('Search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Kétirányú Szinkronizáció & Metaadatok
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Automatikus Konfliktuskezelővel
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">
              AniList & MyAnimeList Szinkronizáció
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Importáld és tartsd szinkronban az anime listádat AniList-tel és MyAnimeList-tel. A rendszer automatikusan feloldja az epizód eltéréseket a legmagasabb megtekintett szám alapján!
            </p>
          </div>
        </div>
      </div>

      {/* Sync Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: ANILIST */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-xl shadow-blue-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center font-black text-blue-400 text-lg">
                AL
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  AniList Integráció
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
                    GraphQL API
                  </span>
                </h3>
                <span className="text-xs text-slate-400">Közvetlen profil lekérés & borítóképek</span>
              </div>
            </div>
            <a
              href="https://anilist.co"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              AniList.co <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AniList Felhasználónév *
              </label>
              <input
                type="text"
                value={aniListUsername}
                onChange={(e) => setAniListUsername(e.target.value)}
                placeholder="Pl. LunaWatcher99"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AniList Access Token (Opcionális - privát profilhoz)
              </label>
              <input
                type="password"
                value={aniListToken}
                onChange={(e) => setAniListToken(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleSyncAniList}
            disabled={isAniListLoading || !aniListUsername.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isAniListLoading ? 'animate-spin' : ''}`} />
            {isAniListLoading ? 'AniList Lista Letöltése & Összefésülés...' : 'AniList Lista Szinkronizálása'}
          </button>

          {aniListStatusMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                aniListStatusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border border-red-500/40 text-red-300'
              }`}
            >
              {aniListStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{aniListStatusMsg.text}</span>
            </div>
          )}
        </div>

        {/* CARD 2: MYANIMELIST */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-xl shadow-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-purple-400 text-lg">
                MAL
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  MyAnimeList Integráció
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                    Jikan API v4
                  </span>
                </h3>
                <span className="text-xs text-slate-400">Online lekérés vagy hivatalos XML import</span>
              </div>
            </div>
            <a
              href="https://myanimelist.net"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              MyAnimeList.net <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                MyAnimeList Felhasználónév *
              </label>
              <input
                type="text"
                value={malUsername}
                onChange={(e) => setMalUsername(e.target.value)}
                placeholder="Pl. LunaUser123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vagy Tölts fel egy MyAnimeList XML Mentést
              </label>
              <label className="w-full border-2 border-dashed border-slate-700 hover:border-purple-500/60 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-purple-300 cursor-pointer transition-all bg-slate-950/60">
                <Upload className="w-4 h-4" />
                <span>MAL export XML fájl kiválasztása...</span>
                <input
                  type="file"
                  accept=".xml,text/xml"
                  onChange={handleMalXmlUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handleSyncMal}
            disabled={isMalLoading || !malUsername.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isMalLoading ? 'animate-spin' : ''}`} />
            {isMalLoading ? 'MyAnimeList Lista Lekérése (Jikan API)...' : 'MyAnimeList Lista Szinkronizálása'}
          </button>

          {malStatusMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                malStatusMsg.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border border-red-500/40 text-red-300'
              }`}
            >
              {malStatusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{malStatusMsg.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* SYNC REPORT SUMMARY */}
      {lastSyncResult && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Szinkronizációs & Konfliktuskezelési Összegzés ({lastSyncResult.source})
            </h4>
            <span className="text-xs text-slate-400">
              Összes anime az adatbázisban: <strong>{lastSyncResult.total} db</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Újonnan hozzáadott:</span>
              <span className="text-emerald-400 font-bold text-base">+{lastSyncResult.newTracks} cím</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Automatikusan feloldott eltérés:</span>
              <span className="text-cyan-400 font-bold text-base">{lastSyncResult.autoResolved} db</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Döntésre váró konfliktus:</span>
              <span className="text-amber-400 font-bold text-base">{lastSyncResult.pendingConflicts} db</span>
            </div>
          </div>
        </div>
      )}

      {/* ANILIST ANIME EXPLORER & METADATA MATCHER */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            AniList Adatbázis Kereső & Borítókép Párosító
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Keress rá bármilyen animére az AniList globális adatbázisában hivatalos borítóképekért és adatokért.
          </p>
        </div>

        <form onSubmit={handleSearchAniList} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pl. Frieren, Solo Leveling, Bleach, Jujutsu Kaisen..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {isSearching ? 'Keresés...' : 'Keresés'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {searchResults.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-3 hover:border-cyan-500/40 transition-all"
              >
                {m.coverImage ? (
                  <img
                    src={m.coverImage}
                    alt={m.title.romaji}
                    referrerPolicy="no-referrer"
                    className="w-14 h-20 object-cover rounded-lg shrink-0 border border-slate-800"
                  />
                ) : (
                  <div className="w-14 h-20 bg-slate-800 rounded-lg shrink-0 flex items-center justify-center text-slate-500">
                    <Tv className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white truncate" title={m.title.english || m.title.romaji}>
                    {m.title.english || m.title.romaji}
                  </h4>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {m.title.native || m.title.romaji}
                  </span>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-cyan-400">
                    <span>{m.episodes ? `${m.episodes} rész` : 'Folyamatban'}</span>
                    {m.averageScore && (
                      <span className="text-amber-400">★ {Math.round(m.averageScore / 10)}/10</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
