import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthLoginScreen } from './components/AuthLoginScreen';
import { DashboardSidebar, DashboardTab } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { DashboardLibrary } from './components/DashboardLibrary';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { DashboardIntegrations } from './components/DashboardIntegrations';
import { MonitoredSitesManager } from './components/MonitoredSitesManager';
import { MalAnilistSyncManager } from './components/MalAnilistSyncManager';
import { ConflictResolutionCenter } from './components/ConflictResolutionCenter';
import { CloudSyncManager } from './components/CloudSyncManager';
import { ExtensionCodeViewer } from './components/ExtensionCodeViewer';
import { VirtualScriptPanel } from './components/VirtualScriptPanel';
import { AnimeFormModal } from './components/AnimeFormModal';
import { AnimeTrack } from './types';
import { subscribeToAnimeTracks, testFirestoreConnection, syncRealtimeAnimeTrack } from './services/firestoreService';
import { initRealtimeBridgeListener, RealtimeWatchEvent } from './services/cloudSyncService';
import { Radio, Sparkles, Activity, X, Tv } from 'lucide-react';

function DashboardApp() {
  const { user, isAdmin, isAuthReady } = useAuth();
  const [tracks, setTracks] = useState<AnimeTrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Realtime Live Stream Alerts
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState<RealtimeWatchEvent | null>(null);
  const [liveToast, setLiveToast] = useState<{ title: string; episode: number; source: string } | null>(null);

  // Modals & Sidebar
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTrack, setEditingTrack] = useState<AnimeTrack | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    // Only subscribe to tracks when admin is logged in
    if (isAdmin) {
      testFirestoreConnection();
      const unsubscribe = subscribeToAnimeTracks(
        (data) => {
          setTracks(data);
          setIsLoadingTracks(false);
        },
        (err) => {
          console.warn("Firestore subscription note:", err);
          setIsLoadingTracks(false);
        }
      );
      return () => unsubscribe();
    }
  }, [isAdmin]);

  // Real-time listener for Tampermonkey and Chrome Extension Live Events
  useEffect(() => {
    if (isAdmin) {
      const cleanupListener = initRealtimeBridgeListener(async (event) => {
        setLastRealtimeEvent(event);
        setLiveToast({
          title: event.anime.title,
          episode: event.anime.episode,
          source: event.anime.source
        });

        // Automatically sync to real Firestore database
        try {
          await syncRealtimeAnimeTrack({
            title: event.anime.title,
            episode: event.anime.episode,
            totalEpisodes: event.anime.totalEpisodes,
            source: event.anime.source,
            sourceUrl: event.anime.sourceUrl,
            status: event.anime.status,
            coverImage: event.anime.coverImage,
          });
        } catch (e) {
          console.warn("Real-time auto-sync to Firestore note:", e);
        }

        // Auto-dismiss live toast after 6 seconds
        setTimeout(() => {
          setLiveToast((prev) => (prev?.title === event.anime.title ? null : prev));
        }, 6000);
      });

      return () => cleanupListener();
    }
  }, [isAdmin]);

  // Auth Loading State
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#06060c] text-white flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-xl shadow-cyan-500/20 mb-4 animate-pulse">
          🌙
        </div>
        <div className="flex items-center gap-2 font-mono text-xs text-cyan-300">
          <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>Luna Anime Dashboard inicializálása...</span>
        </div>
      </div>
    );
  }

  // If not logged in or not authorized, enforce Google Auth Lock Screen
  if (!user || !isAdmin) {
    return <AuthLoginScreen />;
  }

  const handleOpenAddModal = () => {
    setEditingTrack(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (track: AnimeTrack) => {
    setEditingTrack(track);
    setIsFormModalOpen(true);
  };

  const watchingCount = tracks.filter((t) => t.status === 'watching').length;

  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Vezérlőpult & Áttekintés', subtitle: 'Folytatás, legújabb epizódok és kulcsfontosságú mutatók' };
      case 'library':
        return { title: 'Anime Könyvtár & Adatbázis', subtitle: 'Összes követett sorozat, szűrés és manuális szerkesztés' };
      case 'virtualpanel':
        return { title: 'Virtuális Szkript Panel & Szimulátor', subtitle: 'Interaktív anime lejátszó szimuláció, lebegő HUD tesztelő és DOM kivonó labor' };
      case 'sites':
        return { title: 'Figyelt Anime Portálok & Egyéni Szabályok', subtitle: 'OniAnime, MagyarAnime, AnimeDrive, UraharaShop, Naruto-Kun, MutekiFansub és egyéni weboldalak' };
      case 'malsync':
        return { title: 'AniList & MyAnimeList Szinkronizáció', subtitle: 'Kétirányú GraphQL / Jikan REST API szinkron és hivatalos MAL XML import' };
      case 'conflicts':
        return { title: 'Automatikus Konfliktuskezelés', subtitle: 'Intelligens eltérés-feloldási stratégiák, jóváhagyási sor és részletes eseménynapló' };
      case 'quickadd':
        return { title: 'Új Anime Rögzítése', subtitle: 'Manuális hozzáadás a Google Cloud Firestore adatbázisba' };
      case 'cloudsync':
        return { title: 'Google Drive & Dropbox Felhőmentés', subtitle: 'Biztonsági mentés, visszaállítás és valós idejű kommunikációs bridge' };
      case 'analytics':
        return { title: 'Statisztikák & Elemzések', subtitle: 'Megtekintési idő, műfaji arányok és forrásmegoszlás' };
      case 'integrations':
        return { title: 'Tampermonkey & Bővítmény Központ', subtitle: '1-kattintásos userscript és Chrome V3 bővítmény szinkronizáció' };
      case 'code':
        return { title: 'Forráskód Betekintő', subtitle: 'Luna Userscript, Manifest V3 és háttérszkript fájlok' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <div className="min-h-screen bg-[#06060c] text-slate-100 flex flex-col md:flex-row font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'quickadd') {
              handleOpenAddModal();
            } else {
              setCurrentTab(tab);
            }
          }}
          totalTracks={tracks.length}
          watchingCount={watchingCount}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <div className="relative z-10 w-72 h-full">
            <DashboardSidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setIsMobileSidebarOpen(false);
                if (tab === 'quickadd') {
                  handleOpenAddModal();
                } else {
                  setCurrentTab(tab);
                }
              }}
              totalTracks={tracks.length}
              watchingCount={watchingCount}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        <DashboardHeader
          title={title}
          subtitle={subtitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={handleOpenAddModal}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Real-time Floating Live Watching Notification */}
        {liveToast && (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-purple-950/80 to-black border border-cyan-400 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
                <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ÉLŐBEN NÉZVE
                  </span>
                  <span className="text-xs text-cyan-400 font-mono">
                    {liveToast.source}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">
                  {liveToast.title} — <span className="text-cyan-300 font-mono">{liveToast.episode}. rész</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Valós időben észlelve a bővítmény által & automatikusan szinkronizálva a Firestore-ban.
                </div>
              </div>
            </div>

            <button
              onClick={() => setLiveToast(null)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <DashboardOverview
              tracks={tracks}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'library' && (
            <DashboardLibrary
              tracks={tracks}
              searchQuery={searchQuery}
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
            />
          )}

          {currentTab === 'virtualpanel' && (
            <VirtualScriptPanel />
          )}

          {currentTab === 'sites' && (
            <MonitoredSitesManager />
          )}

          {currentTab === 'malsync' && (
            <MalAnilistSyncManager
              currentTracks={tracks}
              onTracksUpdated={setTracks}
            />
          )}

          {currentTab === 'conflicts' && (
            <ConflictResolutionCenter
              tracks={tracks}
              onTrackUpdated={() => {}}
            />
          )}

          {currentTab === 'cloudsync' && (
            <CloudSyncManager
              tracks={tracks}
              lastRealtimeEvent={lastRealtimeEvent}
            />
          )}

          {currentTab === 'analytics' && (
            <DashboardAnalytics tracks={tracks} />
          )}

          {currentTab === 'integrations' && (
            <DashboardIntegrations onNavigateTab={setCurrentTab} />
          )}

          {currentTab === 'code' && (
            <ExtensionCodeViewer />
          )}
        </main>

      </div>

      {/* Add / Edit Anime Form Modal */}
      <AnimeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTrack(null);
        }}
        initialTrack={editingTrack}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardApp />
    </AuthProvider>
  );
}
