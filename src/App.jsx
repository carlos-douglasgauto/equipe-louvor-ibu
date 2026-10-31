import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import ScheduleEditor from './components/LeaderView/ScheduleEditor';
import MacroMonthView from './components/LeaderView/MacroMonthView';
import MembersManager from './components/LeaderView/MembersManager';
import MinisterSetlistEditor from './components/MinisterView/MinisterSetlistEditor';
import MusicianDashboard from './components/MusicianView/MusicianDashboard';
import YouTubePlayerModal from './components/YouTubePlayerModal';
import ChordViewerModal from './components/ChordViewerModal';
import WhatsAppShareModal from './components/WhatsAppShareModal';
import GoogleDocsModal from './components/GoogleDocsModal';
import { 
  loadSchedules, 
  saveSchedules, 
  loadMembers, 
  saveMembers, 
  loadSongCatalog,
  saveCatalogList,
  saveSongToCatalog,
  saveMultipleSongsToCatalog,
  fetchCloudState,
  pushCloudState,
  getLocalUpdatedAt,
  setLocalUpdatedAt,
  hasCustomLocalSchedules,
  exportAllData, 
  resetAllData 
} from './utils/storage';
import { GOOGLE_DOCS_URL } from './data/initialData';
import { 
  Users, 
  Calendar, 
  ExternalLink, 
  RotateCcw,
  LayoutGrid,
  FileEdit,
  Cloud,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('leader'); // 'leader' | 'minister' | 'musician'
  const [leaderTab, setLeaderTab] = useState('macro'); // 'macro' | 'schedules' | 'members'
  
  // Theme state: dark or light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('louvorsync_theme') || 'dark';
  });

  // Google Docs URL state
  const [googleDocsUrl, setGoogleDocsUrl] = useState(() => {
    return localStorage.getItem('louvorsync_googledocs') || GOOGLE_DOCS_URL;
  });
  const [googleDocsModalState, setGoogleDocsModalState] = useState({
    open: false,
    defaultScheduleId: ''
  });

  const [schedules, setSchedules] = useState(loadSchedules);
  const [members, setMembers] = useState(loadMembers);
  const [syncStatus, setSyncStatus] = useState('syncing'); // 'syncing' | 'synced' | 'offline'

  const isApplyingRemoteRef = useRef(false);

  // Modals state
  const [youTubeModalState, setYouTubeModalState] = useState({ open: false, song: null, playlist: [] });
  const [chordModalState, setChordModalState] = useState({ open: false, song: null });
  const [whatsAppModalState, setWhatsAppModalState] = useState({ open: false, schedule: null });

  // Sync theme with HTML class and localStorage
  useEffect(() => {
    localStorage.setItem('louvorsync_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Pull latest state from Cloud (or push local changes if this browser has unsynced local work)
  const syncFromCloud = useCallback(async () => {
    setSyncStatus('syncing');
    const cloudData = await fetchCloudState();

    if (!cloudData) {
      setSyncStatus('offline');
      return;
    }

    const localTs = getLocalUpdatedAt();

    // Case 1: Cloud is empty, or this computer has local edits that were never pushed yet
    if (cloudData.emptyCloud) {
      if (hasCustomLocalSchedules()) {
        await pushCloudState({
          schedules: loadSchedules(),
          members: loadMembers(),
          googleDocsUrl: localStorage.getItem('louvorsync_googledocs') || GOOGLE_DOCS_URL,
          catalog: loadSongCatalog()
        });
      }
      setSyncStatus('synced');
      return;
    }

    const remoteTs = Number(cloudData.updatedAt || 0);

    // If local computer has unsynced custom schedules (localTs === 0 and custom schedules exist),
    // and remote has older/default data, push local data up so mobile immediately sees it
    if (localTs === 0 && hasCustomLocalSchedules() && remoteTs === 0) {
      await pushCloudState({
        schedules: loadSchedules(),
        members: loadMembers(),
        googleDocsUrl: localStorage.getItem('louvorsync_googledocs') || GOOGLE_DOCS_URL,
        catalog: loadSongCatalog()
      });
      setSyncStatus('synced');
      return;
    }

    // Apply cloud state if cloud is newer (or if this device is fresh / incognito / mobile)
    if (remoteTs > localTs || localTs === 0) {
      isApplyingRemoteRef.current = true;
      if (Array.isArray(cloudData.schedules) && cloudData.schedules.length > 0) {
        saveSchedules(cloudData.schedules, false);
        setSchedules(cloudData.schedules);
      }
      if (Array.isArray(cloudData.members) && cloudData.members.length > 0) {
        saveMembers(cloudData.members, false);
        setMembers(cloudData.members);
      }
      if (cloudData.googleDocsUrl) {
        localStorage.setItem('louvorsync_googledocs', cloudData.googleDocsUrl);
        setGoogleDocsUrl(cloudData.googleDocsUrl);
      }
      if (Array.isArray(cloudData.catalog) && cloudData.catalog.length > 0) {
        saveCatalogList(cloudData.catalog);
      }
      if (remoteTs > 0) {
        setLocalUpdatedAt(remoteTs);
      }
      setTimeout(() => {
        isApplyingRemoteRef.current = false;
      }, 100);
    } else if (localTs > remoteTs) {
      // Local device has newer changes than cloud -> push them up
      await pushCloudState({
        schedules: loadSchedules(),
        members: loadMembers(),
        googleDocsUrl: localStorage.getItem('louvorsync_googledocs') || GOOGLE_DOCS_URL,
        catalog: loadSongCatalog(),
        updatedAt: localTs
      });
    }

    setSyncStatus('synced');
  }, []);

  // Initial sync on load + periodic sync + focus sync so mobile & desktop stay in sync
  useEffect(() => {
    syncFromCloud();

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncFromCloud();
      }
    }, 15000);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      clearInterval(interval);
    };
  }, [syncFromCloud]);

  // Helper to persist user changes both locally and to the Cloud
  const persistAndPushCloud = useCallback(async (nextSchedules, nextMembers, nextDocsUrl) => {
    const ts = Date.now();
    saveSchedules(nextSchedules, false);
    saveMembers(nextMembers, false);
    setLocalUpdatedAt(ts);
    setSyncStatus('syncing');
    const ok = await pushCloudState({
      schedules: nextSchedules,
      members: nextMembers,
      googleDocsUrl: nextDocsUrl,
      catalog: loadSongCatalog(),
      updatedAt: ts
    });
    setSyncStatus(ok ? 'synced' : 'offline');
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSaveGoogleDocs = (newUrl) => {
    setGoogleDocsUrl(newUrl);
    localStorage.setItem('louvorsync_googledocs', newUrl);
    persistAndPushCloud(schedules, members, newUrl);
  };

  const handleUpdateSchedule = (updatedSchedule) => {
    setSchedules(prev => {
      const next = prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s);
      if (!isApplyingRemoteRef.current) {
        persistAndPushCloud(next, members, googleDocsUrl);
      }
      return next;
    });
  };

  const handleUpdateMembers = (nextMembers) => {
    setMembers(nextMembers);
    if (!isApplyingRemoteRef.current) {
      persistAndPushCloud(schedules, nextMembers, googleDocsUrl);
    }
  };

  // Import mapped songs from Google Docs into a chosen Sunday schedule & catalog
  const handleImportSongsFromGoogleDocs = (targetScheduleId, mappedSongs, mode = 'replace', docUrl = '') => {
    const finalDocUrl = docUrl || googleDocsUrl;
    if (docUrl) {
      setGoogleDocsUrl(docUrl);
      localStorage.setItem('louvorsync_googledocs', docUrl);
    }

    saveMultipleSongsToCatalog(mappedSongs);

    setSchedules(prev => {
      const next = prev.map(sched => {
        if (sched.id !== targetScheduleId) return sched;
        const currentSongs = sched.songs || [];
        const newSongs = mode === 'append'
          ? [...currentSongs, ...mappedSongs]
          : mappedSongs;
        return {
          ...sched,
          songs: newSongs
        };
      });
      persistAndPushCloud(next, members, finalDocUrl);
      return next;
    });
  };

  // Save chords edited by Maestro/Regente in real-time and sync to Cloud
  const handleSaveChords = (songId, newChordsText, newKey, newNotes) => {
    setSchedules(prev => {
      const next = prev.map(sched => {
        const updatedSongs = (sched.songs || []).map(song => {
          if (song.id === songId) {
            const updatedSong = {
              ...song,
              chordsText: newChordsText,
              notes: newNotes !== undefined ? newNotes : song.notes,
              key: newKey || song.key
            };
            saveSongToCatalog(updatedSong);
            return updatedSong;
          }
          return song;
        });
        return { ...sched, songs: updatedSongs };
      });
      persistAndPushCloud(next, members, googleDocsUrl);
      return next;
    });

    if (chordModalState.song && chordModalState.song.id === songId) {
      setChordModalState(prev => ({
        ...prev,
        song: {
          ...prev.song,
          chordsText: newChordsText,
          notes: newNotes !== undefined ? newNotes : prev.song.notes,
          key: newKey || prev.song.key
        }
      }));
    }
  };

  const handleOpenYouTube = (song, playlist = []) => {
    setYouTubeModalState({ open: true, song, playlist });
  };

  const handleOpenChords = (song) => {
    setChordModalState({ open: true, song });
  };

  const handleOpenWhatsApp = (schedule = null) => {
    setWhatsAppModalState({ open: true, schedule: schedule || schedules[0] });
  };

  const handleOpenGoogleDocsModal = (defaultScheduleId = '') => {
    setGoogleDocsModalState({
      open: true,
      defaultScheduleId: typeof defaultScheduleId === 'string' ? defaultScheduleId : ''
    });
  };

  const handleReset = async () => {
    if (confirm('Tem certeza que deseja restaurar a escala e integrantes padrão de Novembro 2026 em todos os dispositivos?')) {
      resetAllData();
      localStorage.removeItem('louvorsync_googledocs');
      const defaultScheds = loadSchedules();
      const defaultMems = loadMembers();
      await pushCloudState({
        schedules: defaultScheds,
        members: defaultMems,
        googleDocsUrl: GOOGLE_DOCS_URL,
        catalog: loadSongCatalog(),
        updatedAt: Date.now()
      });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      
      {/* Top Studio Navigation */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        googleDocsUrl={googleDocsUrl}
        onOpenGoogleDocsModal={() => handleOpenGoogleDocsModal('')}
        onOpenWhatsAppModal={() => handleOpenWhatsApp()}
        onExportData={exportAllData}
        onResetData={handleReset}
        syncStatus={syncStatus}
        onSyncNow={syncFromCloud}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        
        {/* Leader Sub-tabs (when in Leader mode) */}
        {currentRole === 'leader' && (
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5 gap-3">
            <div
              role="tablist"
              aria-label="Seções do Líder"
              className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-900/90 rounded-lg border border-slate-200/90 dark:border-slate-800/90"
            >
              <button
                role="tab"
                aria-selected={leaderTab === 'macro'}
                onClick={() => setLeaderTab('macro')}
                className={`flex items-center gap-2 h-8 px-3 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                  leaderTab === 'macro'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className={`w-3.5 h-3.5 ${leaderTab === 'macro' ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'}`} />
                <span>Painel Macro do Mês</span>
              </button>
              <button
                role="tab"
                aria-selected={leaderTab === 'schedules'}
                onClick={() => setLeaderTab('schedules')}
                className={`flex items-center gap-2 h-8 px-3 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                  leaderTab === 'schedules'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${leaderTab === 'schedules' ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'}`} />
                <span>Escalas Detalhadas</span>
              </button>
              <button
                role="tab"
                aria-selected={leaderTab === 'members'}
                onClick={() => setLeaderTab('members')}
                className={`flex items-center gap-2 h-8 px-3 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                  leaderTab === 'members'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700/70'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${leaderTab === 'members' ? 'text-sky-600 dark:text-sky-400' : 'opacity-75'}`} />
                <span>Integrantes</span>
                <span className="px-1.5 py-0.2 rounded text-[11px] font-medium tabular-nums bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                  {members.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={syncFromCloud}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition active:scale-[0.98]"
                title="Sincronizar dados com todos os aparelhos"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizado na Nuvem'}
                </span>
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition active:scale-[0.98]"
                title="Restaurar dados iniciais"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restaurar Padrão</span>
              </button>
            </div>
          </div>
        )}

        {/* Content based on Role */}
        {currentRole === 'leader' && (
          <>
            {leaderTab === 'macro' && (
              <MacroMonthView
                schedules={schedules}
                members={members}
                onUpdateSchedule={handleUpdateSchedule}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {leaderTab === 'schedules' && (
              <ScheduleEditor
                schedules={schedules}
                members={members}
                onUpdateSchedule={handleUpdateSchedule}
                onSelectScheduleForDetails={() => {
                  setCurrentRole('minister');
                }}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {leaderTab === 'members' && (
              <MembersManager
                members={members}
                onUpdateMembers={handleUpdateMembers}
                schedules={schedules}
              />
            )}
          </>
        )}

        {currentRole === 'minister' && (
          <MinisterSetlistEditor
            schedules={schedules}
            onUpdateSchedule={handleUpdateSchedule}
            onOpenYouTubePlayer={handleOpenYouTube}
            onOpenChordViewer={handleOpenChords}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenGoogleDocsModal={handleOpenGoogleDocsModal}
          />
        )}

        {currentRole === 'musician' && (
          <MusicianDashboard
            schedules={schedules}
            members={members}
            onUpdateSchedule={handleUpdateSchedule}
            onOpenYouTubePlayer={handleOpenYouTube}
            onOpenChordViewer={handleOpenChords}
            onOpenWhatsApp={handleOpenWhatsApp}
          />
        )}

      </main>

      {/* Minimal Studio Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/70 bg-white/60 dark:bg-slate-950/60 py-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="font-semibold text-slate-800 dark:text-slate-200">LouvorSync</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Gestão de Escalas & Repertório</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={syncFromCloud}
              className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium transition"
              title="Clique para atualizar os dados da nuvem agora"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              <span>{syncStatus === 'syncing' ? 'Sincronizando...' : 'Nuvem Ativa'}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href={googleDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
            >
              <span>Google Docs</span>
              <ExternalLink className="w-3 h-3 opacity-75" />
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => handleOpenGoogleDocsModal('')}
              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-medium"
              title="Importar músicas do Google Docs ou atualizar link"
            >
              <FileEdit className="w-3 h-3" />
              <span>Importar Repertório</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="tabular-nums text-slate-400 dark:text-slate-500">Nov 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {youTubeModalState.open && (
        <YouTubePlayerModal
          song={youTubeModalState.song}
          songs={youTubeModalState.playlist}
          onSelectSong={(song) => setYouTubeModalState(prev => ({ ...prev, song }))}
          onClose={() => setYouTubeModalState({ open: false, song: null, playlist: [] })}
        />
      )}

      {chordModalState.open && (
        <ChordViewerModal
          song={chordModalState.song}
          onSaveChords={handleSaveChords}
          onClose={() => setChordModalState({ open: false, song: null })}
        />
      )}

      {whatsAppModalState.open && (
        <WhatsAppShareModal
          schedules={schedules}
          activeSchedule={whatsAppModalState.schedule}
          onClose={() => setWhatsAppModalState({ open: false, schedule: null })}
        />
      )}

      {googleDocsModalState.open && (
        <GoogleDocsModal
          currentUrl={googleDocsUrl}
          schedules={schedules}
          defaultScheduleId={googleDocsModalState.defaultScheduleId}
          onSave={handleSaveGoogleDocs}
          onImportSongsToSchedule={handleImportSongsFromGoogleDocs}
          onClose={() => setGoogleDocsModalState({ open: false, defaultScheduleId: '' })}
        />
      )}

    </div>
  );
}
