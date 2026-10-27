import React, { useState, useEffect } from 'react';
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
  saveSongToCatalog,
  exportAllData, 
  resetAllData 
} from './utils/storage';
import { GOOGLE_DOCS_URL } from './data/initialData';
import { 
  ShieldCheck, 
  Mic2, 
  Guitar, 
  Users, 
  Calendar, 
  ExternalLink, 
  RotateCcw,
  Sparkles,
  LayoutGrid,
  FileEdit
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
  const [isGoogleDocsModalOpen, setIsGoogleDocsModalOpen] = useState(false);

  const [schedules, setSchedules] = useState(loadSchedules);
  const [members, setMembers] = useState(loadMembers);

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

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSaveGoogleDocs = (newUrl) => {
    setGoogleDocsUrl(newUrl);
    localStorage.setItem('louvorsync_googledocs', newUrl);
  };

  // Persistence effects
  useEffect(() => {
    saveSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

  const handleUpdateSchedule = (updatedSchedule) => {
    setSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
  };

  // Save chords edited by Maestro/Regente in real-time
  const handleSaveChords = (songId, newChordsText, newKey, newNotes) => {
    setSchedules(prev => prev.map(sched => {
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
    }));

    // Also update current modal state so it reflects immediately
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

  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar a escala e integrantes padrão de Novembro 2026? Suas alterações serão redefinidas.')) {
      resetAllData();
      localStorage.removeItem('louvorsync_googledocs');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        googleDocsUrl={googleDocsUrl}
        onOpenGoogleDocsModal={() => setIsGoogleDocsModalOpen(true)}
        onOpenWhatsAppModal={() => handleOpenWhatsApp()}
        onExportData={exportAllData}
        onResetData={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Leader Sub-tabs (when in Leader mode) */}
        {currentRole === 'leader' && (
          <div className="flex flex-wrap items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <button
                onClick={() => setLeaderTab('macro')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  leaderTab === 'macro'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Painel Macro do Mês</span>
              </button>
              <button
                onClick={() => setLeaderTab('schedules')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  leaderTab === 'schedules'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Escalas Detalhadas</span>
              </button>
              <button
                onClick={() => setLeaderTab('members')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  leaderTab === 'members'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Integrantes ({members.length})</span>
              </button>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition"
              title="Restaurar dados iniciais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Padrão</span>
            </button>
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
                onSelectScheduleForDetails={(schedule) => {
                  setCurrentRole('minister');
                }}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {leaderTab === 'members' && (
              <MembersManager
                members={members}
                onUpdateMembers={setMembers}
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

      {/* Footer */}
      <footer className="border-t dark:border-slate-900 border-slate-200 bg-white/70 dark:bg-slate-950/80 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-400">LouvorSync</span>
            <span>•</span>
            <span>Automação da Escala & Central de Repertório da Igreja</span>
          </div>
          
          <div className="flex items-center gap-3">
            <a
              href={googleDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition"
            >
              <span>Abrir Google Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsGoogleDocsModalOpen(true)}
              className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
              title="Atualizar link do Google Docs"
            >
              <FileEdit className="w-3 h-3" />
              <span>Editar Link</span>
            </button>
            <span>•</span>
            <span className="text-slate-400 dark:text-slate-600">Novembro 2026</span>
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

      {isGoogleDocsModalOpen && (
        <GoogleDocsModal
          currentUrl={googleDocsUrl}
          onSave={handleSaveGoogleDocs}
          onClose={() => setIsGoogleDocsModalOpen(false)}
        />
      )}

    </div>
  );
}
