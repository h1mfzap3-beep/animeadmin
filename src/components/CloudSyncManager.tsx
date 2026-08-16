import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  HardDrive, 
  Upload, 
  Download, 
  Radio, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Trash2, 
  RefreshCw, 
  Zap, 
  Sparkles, 
  FileCode2,
  FileCheck,
  ShieldCheck,
  Activity,
  ArrowRight,
  Database,
  ExternalLink,
  Lock,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { AnimeTrack } from '../types';
import { 
  syncToGoogleDrive, 
  syncToDropbox, 
  restoreFromDropbox, 
  parseAndValidateBackup, 
  getSavedDropboxToken, 
  saveDropboxToken,
  broadcastRealtimeProgress,
  downloadBackupFile,
  generateBackupBundle,
  RealtimeWatchEvent
} from '../services/cloudSyncService';
import { 
  signInWithGoogleDrive,
  getDriveAccessToken,
  listGoogleDriveBackups,
  uploadBackupToGoogleDrive,
  downloadBackupContentFromDrive,
  deleteBackupFromGoogleDrive,
  GoogleDriveBackupFile,
  initDriveAuth,
  isDriveConnected
} from '../services/googleDriveService';
import { importAnimeTracks, clearAllAnimeTracks } from '../services/firestoreService';
import { 
  subscribeToAutoBackupStatus, 
  executeAutoBackup, 
  AutoBackupMetadata 
} from '../services/autoBackupService';
import { auth } from '../firebase/config';

interface CloudSyncManagerProps {
  tracks: AnimeTrack[];
  onTracksUpdated?: () => void;
  lastRealtimeEvent?: RealtimeWatchEvent | null;
}

export const CloudSyncManager: React.FC<CloudSyncManagerProps> = ({
  tracks,
  onTracksUpdated,
  lastRealtimeEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'gdrive' | 'dropbox' | 'realtime'>('gdrive');
  
  // Google Drive state
  const [driveConnected, setDriveConnected] = useState<boolean>(false);
  const [isDriveLoading, setIsDriveLoading] = useState<boolean>(false);
  const [driveBackups, setDriveBackups] = useState<GoogleDriveBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [selectedDriveBackup, setSelectedDriveBackup] = useState<GoogleDriveBackupFile | null>(null);

  // Dropbox & General Sync state
  const [dropboxToken, setDropboxToken] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Auto-backup live mirror state
  const [autoBackupMeta, setAutoBackupMeta] = useState<AutoBackupMetadata | null>(null);
  const [isTriggeringAutoBackup, setIsTriggeringAutoBackup] = useState<boolean>(false);
  
  // Restore State
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [importedFileContent, setImportedFileContent] = useState<string>('');
  const [importedTrackCount, setImportedTrackCount] = useState<number | null>(null);

  // Realtime test state
  const [testAnimeTitle, setTestAnimeTitle] = useState('Solo Leveling Season 2');
  const [testEpisode, setTestEpisode] = useState(19);

  // Confirmation Modal state for Workspace mutations (destructions, replaces)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Megerősítés',
    onConfirm: () => {},
  });

  useEffect(() => {
    setDropboxToken(getSavedDropboxToken());

    const unsubscribe = initDriveAuth(
      (_user, token) => {
        if (token) {
          setDriveConnected(true);
          loadDriveBackupsList(token);
        }
      },
      () => {
        setDriveConnected(false);
        setDriveBackups([]);
      }
    );

    if (isDriveConnected()) {
      setDriveConnected(true);
      loadDriveBackupsList();
    }

    // Subscribe to auto-backup mirror metadata
    const unsubAutoBackup = subscribeToAutoBackupStatus((meta) => {
      setAutoBackupMeta(meta);
    });

    return () => {
      unsubscribe();
      unsubAutoBackup();
    };
  }, []);

  const loadDriveBackupsList = async (token?: string) => {
    setIsLoadingBackups(true);
    try {
      const list = await listGoogleDriveBackups(token);
      setDriveBackups(list);
    } catch (err: any) {
      console.warn('[GoogleDrive] Backups list fetch error:', err.message);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleGoogleDriveLogin = async () => {
    setIsDriveLoading(true);
    setSyncStatus(null);
    try {
      const res = await signInWithGoogleDrive();
      if (res?.accessToken) {
        setDriveConnected(true);
        setSyncStatus({ 
          type: 'success', 
          message: `Sikeres Google Drive bejelentkezés (${res.user.displayName || res.user.email})! A felhőtárhely mostantól elérhető.` 
        });
        await loadDriveBackupsList(res.accessToken);
      }
    } catch (err: any) {
      setSyncStatus({ type: 'error', message: `Google Drive csatlakozási hiba: ${err.message}` });
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Google Drive Direct Upload Backup
  const handleUploadToGoogleDrive = async () => {
    if (!driveConnected) {
      await handleGoogleDriveLogin();
      if (!isDriveConnected()) return;
    }

    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await uploadBackupToGoogleDrive(tracks);
      setSyncStatus({ 
        type: 'success', 
        message: `✅ Sikeresen elmentve a Google Drive-ra: "${res.filename}" (${tracks.length} db anime)!` 
      });
      await loadDriveBackupsList();
    } catch (err: any) {
      setSyncStatus({ type: 'error', message: `Google Drive mentési hiba: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Google Drive Restore from specific backup file
  const handleRestoreFromDriveFile = (backupFile: GoogleDriveBackupFile) => {
    setConfirmModal({
      isOpen: true,
      title: `Biztonsági mentés visszaállítása a Google Drive-ról?`,
      description: `A(z) "${backupFile.name}" mentési fájl betöltésre kerül az adatbázisba (${restoreMode === 'replace' ? 'TELJES FELÜLÍRÁS: A meglévő könyvtár helyébe lép!' : 'Összefésülés a meglévő animékkel'}). Biztosan folytatod?`,
      confirmText: restoreMode === 'replace' ? 'Teljes Felülírás és Visszaállítás' : 'Összefésülés és Visszaállítás',
      isDestructive: restoreMode === 'replace',
      onConfirm: async () => {
        setIsSyncing(true);
        setSyncStatus(null);
        try {
          const bundle = await downloadBackupContentFromDrive(backupFile.id);
          await importAnimeTracks(bundle.tracks, restoreMode);
          setSyncStatus({
            type: 'success',
            message: `🎉 Sikeresen visszaállítva ${bundle.tracks.length} db anime a Google Drive-ról (${backupFile.name})!`
          });
          if (onTracksUpdated) onTracksUpdated();
        } catch (err: any) {
          setSyncStatus({ type: 'error', message: `Visszaállítási hiba: ${err.message}` });
        } finally {
          setIsSyncing(false);
        }
      }
    });
  };

  // Google Drive Delete Backup file
  const handleDeleteDriveFile = (backupFile: GoogleDriveBackupFile) => {
    setConfirmModal({
      isOpen: true,
      title: `Google Drive mentési fájl törlése?`,
      description: `Biztosan törölni szeretnéd a(z) "${backupFile.name}" mentést a Google Drive tárhelyedről? Ez a művelet a Google Drive-on nem vonható vissza.`,
      confirmText: 'Fájl Törlése a Drive-ról',
      isDestructive: true,
      onConfirm: async () => {
        setIsSyncing(true);
        try {
          await deleteBackupFromGoogleDrive(backupFile.id);
          setSyncStatus({ type: 'success', message: `A(z) "${backupFile.name}" fájl sikeresen törölve a Google Drive-ról.` });
          await loadDriveBackupsList();
        } catch (err: any) {
          setSyncStatus({ type: 'error', message: `Törlési hiba: ${err.message}` });
        } finally {
          setIsSyncing(false);
        }
      }
    });
  };

  // Manual Local File Download
  const handleLocalDownload = () => {
    const bundle = generateBackupBundle(tracks, 'google_drive');
    downloadBackupFile(bundle);
    setSyncStatus({ type: 'success', message: 'Biztonsági mentés JSON fájl letöltve a számítógépedre!' });
  };

  // Dropbox handlers
  const handleSaveDropboxToken = () => {
    saveDropboxToken(dropboxToken);
    setSyncStatus({ type: 'success', message: 'Dropbox Access Token elmentve a böngésződben!' });
  };

  const handleDropboxSync = async () => {
    if (!dropboxToken.trim()) {
      setSyncStatus({ type: 'error', message: 'Kérlek add meg a Dropbox Access Token-t a folytatáshoz!' });
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncToDropbox(tracks, dropboxToken);
      setSyncStatus({ type: 'success', message: res.message });
    } catch (err: any) {
      setSyncStatus({ type: 'error', message: `Dropbox szinkronizáció sikertelen: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDropboxRestore = async () => {
    if (!dropboxToken.trim()) {
      setSyncStatus({ type: 'error', message: 'Kérlek add meg a Dropbox Access Token-t a letöltéshez!' });
      return;
    }
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const restoredTracks = await restoreFromDropbox(dropboxToken);
      await importAnimeTracks(restoredTracks, restoreMode);
      setSyncStatus({ 
        type: 'success', 
        message: `Sikeresen visszaállítva ${restoredTracks.length} db anime a Dropbox mentésből (${restoreMode === 'replace' ? 'Teljes felülírás' : 'Összefésülés'}).` 
      });
      if (onTracksUpdated) onTracksUpdated();
    } catch (err: any) {
      setSyncStatus({ type: 'error', message: `Dropbox visszaállítási hiba: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriggerAutoBackupNow = async () => {
    setIsTriggeringAutoBackup(true);
    setSyncStatus(null);
    try {
      const res = await executeAutoBackup(tracks, 'manual_trigger');
      if (res.success && res.providersSynced.length > 0) {
        setSyncStatus({
          type: 'success',
          message: `✅ Automata felhőtükrözés sikeres: ${res.providersSynced.map(p => p === 'google_drive' ? 'Google Drive' : 'Dropbox').join(', ')} (${tracks.length} anime tükrözve).`
        });
      } else if (res.errors.length > 0) {
        setSyncStatus({
          type: 'error',
          message: `Felhőtükrözési hiba: ${res.errors.join('; ')}`
        });
      } else {
        setSyncStatus({
          type: 'info',
          message: 'Nincs aktív Google Drive vagy Dropbox kapcsolat. Jelentkezz be vagy adj meg tokent a tükrözéshez!'
        });
      }
    } catch (e: any) {
      setSyncStatus({ type: 'error', message: `Hiba a tükrözés futtatásakor: ${e.message}` });
    } finally {
      setIsTriggeringAutoBackup(false);
    }
  };

  // Local JSON File Upload & Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = parseAndValidateBackup(text);
        setImportedFileContent(text);
        setImportedTrackCount(parsed.length);
        setSyncStatus({ type: 'info', message: `Fájl beolvasva: ${parsed.length} db anime található a mentésben.` });
      } catch (err: any) {
        setSyncStatus({ type: 'error', message: err.message });
      }
    };
    reader.readAsText(file);
  };

  const handleApplyImport = async () => {
    if (!importedFileContent) return;
    setIsSyncing(true);
    try {
      const parsed = parseAndValidateBackup(importedFileContent);
      await importAnimeTracks(parsed, restoreMode);
      setSyncStatus({
        type: 'success',
        message: `Sikeresen importálva ${parsed.length} db anime a Firestore adatbázisba!`
      });
      setImportedFileContent('');
      setImportedTrackCount(null);
      if (onTracksUpdated) onTracksUpdated();
    } catch (err: any) {
      setSyncStatus({ type: 'error', message: `Importálási hiba: ${err.message}` });
    } finally {
      setIsSyncing(false);
    }
  };

  // Clear Database
  const handleClearDatabase = async () => {
    setConfirmModal({
      isOpen: true,
      title: 'Biztosan törlöd az összes animét?',
      description: `Ez a művelet véglegesen kitörli a jelenlegi adatbázisban lévő ${tracks.length} db anime bejegyzést. A művelet nem vonható vissza, hacsak nincs Google Drive vagy helyi biztonsági mentésed!`,
      confirmText: 'Összes Anime Törlése',
      isDestructive: true,
      onConfirm: async () => {
        setIsSyncing(true);
        try {
          await clearAllAnimeTracks();
          setSyncStatus({ type: 'success', message: 'Az összes bejegyzés sikeresen törölve a Firestore adatbázisból.' });
          if (onTracksUpdated) onTracksUpdated();
        } catch (err: any) {
          setSyncStatus({ type: 'error', message: `Törlési hiba: ${err.message}` });
        } finally {
          setIsSyncing(false);
        }
      }
    });
  };

  // Test Realtime Broadcast
  const handleSendTestBroadcast = () => {
    broadcastRealtimeProgress({
      title: testAnimeTitle,
      episode: Number(testEpisode),
      source: 'MagyarAnime',
      sourceUrl: 'https://magyaranime.hu',
      coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'
    });
    setSyncStatus({
      type: 'success',
      message: `🔴 Valós idejű teszt szignál elküldve: "${testAnimeTitle}" - ${testEpisode}. rész!`
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-2">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>GOOGLE DRIVE FELHŐMENTÉS & SZINKRONIZÁCIÓ</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Közvetlen Google Drive & Dropbox Felhőmentő Központ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            A Firestore (<span className="text-cyan-300 font-mono">anime_tracks</span>) a rendszer egyetlen igazságforrása. A Google Drive és Dropbox automatikus háttértükörként működnek.
          </p>
        </div>

        {/* Google Drive Status Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${driveConnected ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50' : 'bg-slate-500'}`}></div>
          <div className="text-xs font-mono">
            <div className="text-slate-400">Google Drive:</div>
            <div className={`font-bold ${driveConnected ? 'text-emerald-300' : 'text-slate-400'}`}>
              {driveConnected ? 'Csatlakoztatva ✓' : 'Nincs csatlakoztatva'}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Backup Mirror Status Widget */}
      <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Automata Felhőtükrözés (Auto-Backup Engine)</h4>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                autoBackupMeta?.status === 'running'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : autoBackupMeta?.lastAutoBackupAt
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {autoBackupMeta?.status === 'running' 
                  ? '⏳ Tükrözés folyamatban...' 
                  : autoBackupMeta?.lastAutoBackupAt 
                  ? '✓ Aktív (24h / 10 módosítás)' 
                  : 'Várakozás csatlakozásra'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {autoBackupMeta?.lastAutoBackupAt ? (
                <>
                  Legutóbbi tükrözés: <span className="text-slate-200 font-mono">{new Date(autoBackupMeta.lastAutoBackupAt).toLocaleString('hu-HU')}</span> ({autoBackupMeta.lastAutoBackupProvider === 'both' ? 'Google Drive & Dropbox' : autoBackupMeta.lastAutoBackupProvider === 'google_drive' ? 'Google Drive' : autoBackupMeta.lastAutoBackupProvider === 'dropbox' ? 'Dropbox' : 'Egyik sem'}, {autoBackupMeta.lastAutoBackupCount} anime)
                </>
              ) : (
                'Csatlakoztasd a Google Drive-ot vagy a Dropboxot, és a rendszer 24 óránként vagy 10 változás után automatikusan tükrözi az adatbázist.'
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleTriggerAutoBackupNow}
          disabled={isTriggeringAutoBackup || (!driveConnected && !dropboxToken)}
          className="px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer bg-white/5 hover:bg-white/10 text-white border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!driveConnected && !dropboxToken ? 'Csatlakoztass Google Drive-ot vagy Dropboxot a tükrözéshez' : 'Azonnali tükrözés a csatlakoztatott tárhelyekre'}
        >
          {isTriggeringAutoBackup ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Tükrözés...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tükrözés Futtatása Most</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('gdrive')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'gdrive'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive Integráció</span>
        </button>

        <button
          onClick={() => setActiveTab('dropbox')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'dropbox'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Dropbox Szinkron</span>
        </button>

        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'realtime'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Valós Idejű Bridge (Live)</span>
        </button>
      </div>

      {/* Status Notification */}
      {syncStatus && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in ${
          syncStatus.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : syncStatus.type === 'error'
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
        }`}>
          <div className="flex items-center gap-2">
            {syncStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{syncStatus.message}</span>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-slate-400 hover:text-white font-mono text-[10px]">✕ Bezárás</button>
        </div>
      )}

      {/* TAB 1: GOOGLE DRIVE (Direct API + Full File Management) */}
      {activeTab === 'gdrive' && (
        <div className="space-y-6">
          
          {/* Google Drive Account Bar */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/30 via-[#090a14] to-cyan-950/30 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 p-2.5 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 87.3 78" className="w-full h-full">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3-12.3-21.3c-1.3.8-2.4 1.9-3.2 3.3l-3.85 6.65c-.8 1.4-1.2 2.9-1.2 4.4 0 1.5.4 3 1.2 4.4l-.0000001 13.5999999z" fill="#0066da"/>
                  <path d="m43.65 25-12.3-21.3c-1.3.8-2.4 1.9-3.2 3.3l-21.55 37.35 12.3 21.3 24.75-40.65z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l3.85-6.65c.8-1.4 1.2-2.9 1.2-4.4 0-1.5-.4-3-1.2-4.4l-3.85-6.65c-.8-1.4-1.9-2.5-3.2-3.3l-24.6 42.6 12.3 21.3 12.25-15.3z" fill="#ea4335"/>
                  <path d="m43.65 25 12.3-21.3c-1.3-.8-2.8-1.2-4.4-1.2h-15.8c-1.6 0-3.1.4-4.4 1.2l12.3 21.3z" fill="#00832d"/>
                  <path d="m59.15 51.7-15.5-26.7-24.75 40.65 12.3 21.35h36.8c1.6 0 3.1-.4 4.4-1.2l-13.25-34.1z" fill="#2684fc"/>
                  <path d="m73.55 25h-29.9l12.3 21.3 24.65-42.6c-1.3-.8-2.8-1.2-4.4-1.2z" fill="#ffba00"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-white text-base">Google Drive Fiók Csatlakoztatása</h3>
                  {driveConnected && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Aktív Kapcsolat
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {driveConnected 
                    ? `Bejelentkezve mint ${auth.currentUser?.displayName || auth.currentUser?.email || 'Google Felhasználó'}. Mentéseid a Drive-on elérhetőek.`
                    : 'Csatlakoztasd a Google Drive-ot, hogy a felhőbe mentsd az animelistádat és az epizódállapotokat.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!driveConnected ? (
                <button
                  onClick={handleGoogleDriveLogin}
                  disabled={isDriveLoading}
                  className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center gap-2.5 shadow-lg transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                  <span>{isDriveLoading ? 'Csatlakozás...' : 'Bejelentkezés Google Fiókkal'}</span>
                </button>
              ) : (
                <button
                  onClick={() => loadDriveBackupsList()}
                  disabled={isLoadingBackups}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                  <span>Frissítés</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: Save Now to Google Drive */}
            <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Biztonsági Mentés a Google Drive-ra</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Közvetlen Feltöltés
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Elmenti a jelenlegi Firestore adatbázisod összes anime bejegyzését ({tracks.length} db) egy szabványos JSON biztonsági mentésként közvetlenül a Google Drive tárhelyedre.
              </p>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Adatbázisban lévő animék:</span>
                  <span className="text-white font-mono font-bold">{tracks.length} db</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cél Google Fiók:</span>
                  <span className="text-cyan-400 font-mono">{auth.currentUser?.email || 'Nincs bejelentkezve'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleUploadToGoogleDrive}
                  disabled={isSyncing}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSyncing ? 'Feltöltés folyamatban...' : '1-Kattintásos Mentés Google Drive-ra'}</span>
                </button>

                <button
                  onClick={handleLocalDownload}
                  className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-colors cursor-pointer"
                  title="Mentés letöltése gépre"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Letöltés</span>
                </button>
              </div>
            </div>

            {/* Box 2: Restore Mode & Local Upload */}
            <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Visszaállítási Beállítások</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  Stratégia
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Válaszd ki, hogyan kezelje a rendszer a felhőből vagy fájlból visszaállított animék adatait a meglévő bejegyzésekkel:
              </p>

              {/* Mode selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div 
                  onClick={() => setRestoreMode('merge')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    restoreMode === 'merge' 
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-white' 
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Összefésülés (Merge)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Megtartja a meglévő animécímeket, és hozzáadja az új mentéseket.</div>
                </div>

                <div 
                  onClick={() => setRestoreMode('replace')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    restoreMode === 'replace' 
                      ? 'bg-amber-950/40 border-amber-500/50 text-white' 
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-300">
                    <Trash2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Teljes Felülírás (Replace)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Törli a meglévő adatbázist és a mentés pontos állapotát tölti be.</div>
                </div>
              </div>

              {/* Local File Upload Picker */}
              <div>
                <label className="flex items-center justify-between p-3 border border-dashed border-white/15 hover:border-cyan-500/50 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-300 font-medium">Helyi .json mentési fájl feltöltése</span>
                  </div>
                  <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 bg-cyan-950/60 rounded">Kiválasztás</span>
                  <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              {importedTrackCount !== null && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                  <span className="text-cyan-300 font-mono">Feldolgozásra kész: {importedTrackCount} db anime</span>
                  <button
                    onClick={handleApplyImport}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Visszatöltés</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Google Drive Stored Backups Browser */}
          <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">Google Drive-on Tárolt Mentéseid</h3>
                  <p className="text-[11px] text-slate-400">Közvetlenül a Google Drive felhődből beolvasott fájlok</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadDriveBackupsList()}
                  disabled={isLoadingBackups || !driveConnected}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5 border border-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                  <span>Lista Frissítése</span>
                </button>
              </div>
            </div>

            {!driveConnected ? (
              <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
                <HardDrive className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">A Drive mentések megtekintéséhez jelentkezz be a Google fiókoddal.</div>
                <button
                  onClick={handleGoogleDriveLogin}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Google Fiók Csatlakoztatása</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : isLoadingBackups ? (
              <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/5 text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Google Drive mentések beolvasása...</span>
              </div>
            ) : driveBackups.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/5 space-y-2">
                <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-medium">Még nincs Luna mentési fájl a Google Drive tárhelyeden.</div>
                <p className="text-[11px] text-slate-500">
                  Kattints a fenti <strong>"1-Kattintásos Mentés Google Drive-ra"</strong> gombra az első felhőmentés létrehozásához!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 rounded-2xl overflow-hidden border border-white/5 bg-white/[0.01]">
                {driveBackups.map((backup) => (
                  <div key={backup.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                        <FileCode2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                          <span>{backup.name}</span>
                          {backup.webViewLink && (
                            <a 
                              href={backup.webViewLink} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-slate-400 hover:text-cyan-300"
                              title="Megnyitás a Google Drive-on"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{backup.modifiedTime ? new Date(backup.modifiedTime).toLocaleString('hu-HU') : 'Ismeretlen dátum'}</span>
                          {backup.size && <span>• {(Number(backup.size) / 1024).toFixed(1)} KB</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestoreFromDriveFile(backup)}
                        disabled={isSyncing}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-300 font-bold text-xs flex items-center gap-1.5 border border-cyan-500/30 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Visszaállítás</span>
                      </button>

                      <button
                        onClick={() => handleDeleteDriveFile(backup)}
                        disabled={isSyncing}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 transition-colors cursor-pointer"
                        title="Törlés a Google Drive-ról"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: DROPBOX */}
      {activeTab === 'dropbox' && (
        <div className="space-y-6">
          
          {/* Step-by-Step Friendly Dropbox Wizard Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#090a14] to-indigo-950/40 border border-blue-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base sm:text-lg">
                  Hogyan működik a Dropbox szinkronizáció 3 egyszerű lépésben?
                </h3>
                <p className="text-xs text-slate-300">
                  A Dropbox mentéssel biztonsági másolatot készíthetsz az anime listádról a saját privát Dropbox felhődbe.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-black font-mono font-bold text-xs flex items-center justify-center">1</span>
                  <span className="text-[10px] font-mono text-blue-300">Dropbox Fiók</span>
                </div>
                <div className="text-xs font-bold text-white">Token kérése a Dropboxtól</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Nyisd meg a hivatalos Dropbox Developer felületet.
                </p>
                <a
                  href="https://www.dropbox.com/developers/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-mono text-[11px] font-bold underline pt-1"
                >
                  <span>Dropbox App Console</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-black font-mono font-bold text-xs flex items-center justify-center">2</span>
                  <span className="text-[10px] font-mono text-blue-300">Token Generálás</span>
                </div>
                <div className="text-xs font-bold text-white">"Generate token" gomb</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  A <strong>Settings</strong> fülön kattints a <strong>"Generate"</strong> gombra a token kimásolásához.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center">3</span>
                  <span className="text-[10px] font-mono text-emerald-300">1-Kattintásos Mentés</span>
                </div>
                <div className="text-xs font-bold text-white">Beillesztés & Mentés</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Illeszd be a tokent, és a Luna létrehozza a mentési fájlt a Dropboxodban.
                </p>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dropbox Configuration */}
            <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-white text-base">Dropbox Hozzáférés Megadása</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                  {dropboxToken ? 'Token Beállítva ✓' : 'Nincs Token'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Illeszd be ide a Dropbox fiókodból kimásolt hozzáférési kódot (Access Token):
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-400 font-mono text-xs">DROPBOX ACCESS TOKEN</label>
                  <a
                    href="https://www.dropbox.com/developers/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 underline font-mono flex items-center gap-1"
                  >
                    <span>Token generálás Dropboxon</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={dropboxToken}
                  onChange={(e) => setDropboxToken(e.target.value)}
                  placeholder="Illeszd be a tokent ide (pl. sl.u.AF9q...)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveDropboxToken}
                  disabled={!dropboxToken.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Token Mentése</span>
                </button>

                {dropboxToken && (
                  <button
                    onClick={() => {
                      setDropboxToken('');
                      saveDropboxToken('');
                      setSyncStatus({ type: 'info', message: 'Dropbox token törölve a helyi tárolóból.' });
                    }}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-300 font-mono text-xs transition-colors cursor-pointer"
                    title="Token törlése"
                  >
                    Törlés
                  </button>
                )}
              </div>
            </div>

            {/* Dropbox Actions */}
            <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <h3 className="font-display font-bold text-white text-base">Mentés és Visszaállítás</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Amint beillesztetted a tokent, az alábbi gombokkal közvetlenül a felhőbe küldheted a meglévő anime adataidat, vagy letöltheted a legfrissebb mentést.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleDropboxSync}
                    disabled={isSyncing || !dropboxToken}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSyncing ? 'Mentés folyamatban...' : 'Mentés Dropboxba'}</span>
                  </button>

                  <button
                    onClick={handleDropboxRestore}
                    disabled={isSyncing || !dropboxToken}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Visszaállítás Dropboxból</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automatikus mentési útvonal a Dropboxodban:</span>
                </div>
                <code className="text-cyan-300 font-mono text-[11px] block">/Apps/LunaAnimeTracker/luna_anime_backup.json</code>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: REAL-TIME BRIDGE */}
      {activeTab === 'realtime' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Live Status & Connection Info */}
          <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-white text-base">Valós Idejű Élő Csatorna (Live Bridge)</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                <span>AKTÍV</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              A Luna Web App és a böngészőben futó Tampermonkey a modern <strong>BroadcastChannel API</strong> és <strong>Firestore Realtime Listener</strong> segítségével <strong>0 ms késleltetéssel</strong> kommunikál egymással.
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">BroadcastChannel:</span>
                <span className="text-cyan-300">luna_anime_realtime_channel</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <span className="text-slate-400">Firestore Realtime:</span>
                <span className="text-emerald-300">onSnapshot szinkron</span>
              </div>
            </div>

            {/* Last event banner */}
            {lastRealtimeEvent ? (
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-1">
                <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>LEGUTÓBBI BEÉRKEZETT VALÓS IDEJŰ SZIGNÁL:</span>
                </div>
                <div className="text-sm font-bold text-white">{lastRealtimeEvent.anime.title}</div>
                <div className="text-xs text-slate-300 font-mono">
                  {lastRealtimeEvent.anime.episode}. rész ({lastRealtimeEvent.anime.source}) • {new Date(lastRealtimeEvent.timestamp).toLocaleTimeString('hu-HU')}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 font-mono">
                Még nem érkezett élő szignál a jelenlegi munkamenetben. Indíts el egy animét a MagyarAnime vagy OniAnime oldalon!
              </div>
            )}
          </div>

          {/* Live Simulator & Tester */}
          <div className="p-6 rounded-3xl bg-[#090a14] border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-white text-base">Valós Idejű Esemény Szimulátor</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                Tesztelő
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Próbáld ki a valós idejű eseményküldést! Ez a gomb pontosan olyan szignált küld, mintha a Tampermonkey script észlelte volna az epizódot a lejátszón.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">SZIMULÁLT ANIME CÍM</label>
                <input
                  type="text"
                  value={testAnimeTitle}
                  onChange={(e) => setTestAnimeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono mb-1">SZIMULÁLT RÉSZ</label>
                <input
                  type="number"
                  value={testEpisode}
                  onChange={(e) => setTestEpisode(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleSendTestBroadcast}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Valós Idejű Szignál Sugárzása (Teszt)</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Danger Zone: Clean real database */}
      <div className="p-6 rounded-3xl bg-rose-950/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-rose-300 text-sm flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Valódi Adatbázis Karbantartás & Törlés</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Ha tiszta lappal szeretnél indulni, kitörölheted a Firestore adatbázisban lévő összes anime bejegyzést.
          </p>
        </div>

        <button
          onClick={handleClearDatabase}
          disabled={tracks.length === 0 || isSyncing}
          className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-300 font-mono text-xs flex items-center justify-center gap-2 border border-rose-500/30 transition-all disabled:opacity-30 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Összes Bejegyzés Törlése ({tracks.length} db)</span>
        </button>
      </div>

      {/* Confirmation Modal (MANDATORY for Workspace Destructive & Mutating Operations) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0d0f1d] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                confirmModal.isDestructive ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'
              }`}>
                {confirmModal.isDestructive ? <AlertCircle className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
              </div>
              <h3 className="font-display font-bold text-white text-lg">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs cursor-pointer transition-colors"
              >
                Mégse
              </button>

              <button
                onClick={async () => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await fn();
                }}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                  confirmModal.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/30'
                }`}
              >
                <span>{confirmModal.confirmText}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
