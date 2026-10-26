import React, { useState, useRef } from 'react';
import { 
  Music, 
  Youtube, 
  Plus, 
  Trash2, 
  Edit3, 
  Play, 
  FileText, 
  Share2, 
  MoveUp, 
  MoveDown, 
  ExternalLink,
  Mic2,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/youtube';
import { getSemitonesBetween, transposeChordsText } from '../../utils/transposer';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function MinisterSetlistEditor({
  schedules,
  onUpdateSchedule,
  onOpenYouTubePlayer,
  onOpenChordViewer,
  onOpenWhatsApp
}) {
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.id || '');
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const formRef = useRef(null);

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  const scrollToForm = () => {
    // Immediate scroll to top plus smooth formRef alignment
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  React.useEffect(() => {
    if (isEditingSong && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditingSong, currentSong?.id]);

  const handleOpenNewSong = () => {
    setCurrentSong({
      id: 'song_' + Date.now(),
      title: '',
      artist: '',
      version: '',
      key: 'G',
      originalKey: 'G',
      bpm: 70,
      youtubeUrl: '',
      cifraUrl: '',
      notes: '',
      chordsText: ''
    });
    setIsEditingSong(true);
    scrollToForm();
  };

  const handleEditSong = (song) => {
    setCurrentSong({ ...song });
    setIsEditingSong(true);
    scrollToForm();
  };

  const handleSaveSong = (e) => {
    e.preventDefault();
    if (!currentSong.title.trim()) return;

    let updatedSongs = [...(activeSchedule.songs || [])];
    const index = updatedSongs.findIndex(s => s.id === currentSong.id);

    if (index !== -1) {
      updatedSongs[index] = currentSong;
    } else {
      updatedSongs.push(currentSong);
    }

    onUpdateSchedule({
      ...activeSchedule,
      songs: updatedSongs
    });

    setIsEditingSong(false);
    setCurrentSong(null);
  };

  const handleDeleteSong = (id) => {
    if (confirm('Deseja remover esta música do repertório?')) {
      const updatedSongs = (activeSchedule.songs || []).filter(s => s.id !== id);
      onUpdateSchedule({
        ...activeSchedule,
        songs: updatedSongs
      });
    }
  };

  const handleMoveSong = (index, direction) => {
    const updatedSongs = [...(activeSchedule.songs || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= updatedSongs.length) return;

    const temp = updatedSongs[index];
    updatedSongs[index] = updatedSongs[targetIdx];
    updatedSongs[targetIdx] = temp;

    onUpdateSchedule({
      ...activeSchedule,
      songs: updatedSongs
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden border-red-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <Mic2 className="w-3.5 h-3.5" />
                Painel do Ministro(a) da Semana
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Coordenação de Músicas & Versões</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Repertório do Louvor & Vídeos de Referência
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Escolha as músicas do seu culto, defina o tom, adicione o link do vídeo do YouTube da versão exata que você deseja e compartilhe as cifras com a equipe para ensaiarem.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenWhatsApp(activeSchedule)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Enviar Repertório no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Select Culto / Sunday to Coordinate */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {schedules.map((sched) => {
          const isSelected = sched.id === selectedScheduleId;
          const [year, month, day] = sched.date.split('-');
          return (
            <button
              key={sched.id}
              onClick={() => {
                setSelectedScheduleId(sched.id);
                setIsEditingSong(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-200 ${
                isSelected
                  ? 'bg-red-50 dark:bg-red-950/70 border-red-500 shadow-md shadow-red-500/15'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg text-center ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                <span className="block text-[10px] font-bold uppercase leading-none">Dom</span>
                <span className="block text-sm font-extrabold leading-none mt-1">{day}/{month}</span>
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-red-700 dark:text-red-300 font-extrabold' : 'text-slate-800 dark:text-slate-200'}`}>
                  Ministro: {sched.lineup.ministration || 'A definir'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {sched.songs?.length || 0} músicas no repertório
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Culto Details & Team on Duty */}
      {activeSchedule && (
        <div className="space-y-6">
          
          {/* Minister's Team summary card */}
          <div className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                <span>CULTUANDO EM {activeSchedule.date.split('-').reverse().join('/')}</span>
                <span>•</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{activeSchedule.title}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Sua Equipe de Apoio Neste Domingo:
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                <span><strong className="text-slate-900 dark:text-slate-200">Vocais:</strong> {activeSchedule.lineup.vocals?.filter(Boolean).join(', ') || 'Nenhum'}</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Violão:</strong> {activeSchedule.lineup.acousticGuitar || '-'}</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Guitarras:</strong> {[activeSchedule.lineup.guitar1, activeSchedule.lineup.guitar2].filter(Boolean).join(', ') || '-'}</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Teclado:</strong> {activeSchedule.lineup.keyboard || '-'}</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Baixo:</strong> {activeSchedule.lineup.bass || '-'}</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Bateria:</strong> {activeSchedule.lineup.drums || '-'}</span>
              </p>
            </div>

            <button
              onClick={handleOpenNewSong}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow-lg shadow-red-600/25 shrink-0 self-start md:self-center"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar Música ao Repertório</span>
            </button>
          </div>

          {/* Add / Edit Song Form */}
          {isEditingSong && currentSong && (
            <form 
              ref={formRef} 
              onSubmit={handleSaveSong} 
              className="glass-card p-5 sm:p-6 rounded-2xl border-red-500/50 ring-2 ring-red-400/30 scroll-mt-24 animate-fade-in space-y-4"
            >
              <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <span>{currentSong.title ? `Editar: ${currentSong.title}` : 'Nova Música do Culto'}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditingSong(false)}
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-semibold"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título da Música *</label>
                  <input
                    type="text"
                    required
                    value={currentSong.title}
                    onChange={e => setCurrentSong({ ...currentSong, title: e.target.value })}
                    placeholder="Ex: Bondade de Deus"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cantor / Banda Original</label>
                  <input
                    type="text"
                    value={currentSong.artist}
                    onChange={e => setCurrentSong({ ...currentSong, artist: e.target.value })}
                    placeholder="Ex: Isaías Saad / Bethel"
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Tom Original (YouTube) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tom Original (YouTube / Gravação)
                  </label>
                  <select
                    value={currentSong.originalKey || currentSong.key || 'G'}
                    onChange={e => setCurrentSong({ ...currentSong, originalKey: e.target.value })}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:border-red-500 focus:outline-none"
                  >
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k}>Tom Original: {k}</option>
                    ))}
                  </select>
                </div>

                {/* Tom da Ministração (Tom que vai cantar) */}
                <div>
                  <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1 flex items-center justify-between">
                    <span>Tom da Ministração (Culto)</span>
                    {currentSong.originalKey && currentSong.key && currentSong.originalKey !== currentSong.key ? (
                      <span className="text-[10px] text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/80 px-1 rounded">Modificado</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-normal">Original</span>
                    )}
                  </label>
                  <select
                    value={currentSong.key}
                    onChange={e => setCurrentSong({ ...currentSong, key: e.target.value })}
                    className="w-full bg-red-50 dark:bg-red-950/40 border border-red-400 dark:border-red-600 text-red-900 dark:text-red-300 rounded-lg px-3 py-2 text-sm font-mono font-extrabold focus:border-red-500 focus:outline-none"
                  >
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k}>Tom Cantado: {k}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transposition notice & auto-transpose button */}
              {currentSong.originalKey && currentSong.key && currentSong.originalKey !== currentSong.key && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>
                      Você alterou o tom do culto de <strong>{currentSong.originalKey}</strong> para <strong>{currentSong.key}</strong> (confortável para sua voz).
                    </span>
                  </div>
                  {currentSong.chordsText && (
                    <button
                      type="button"
                      onClick={() => {
                        const semitones = getSemitonesBetween(currentSong.originalKey, currentSong.key);
                        const newChords = transposeChordsText(currentSong.chordsText, semitones);
                        setCurrentSong({ ...currentSong, chordsText: newChords });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-xs text-xs shrink-0 self-start sm:self-center"
                    >
                      Transpor Cifra Automática de {currentSong.originalKey} para {currentSong.key}
                    </button>
                  )}
                </div>
              )}

              {/* YouTube Reference & Version */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4" />
                    <span>Link do YouTube (Vídeo de Referência)</span>
                  </label>
                  <input
                    type="url"
                    value={currentSong.youtubeUrl}
                    onChange={e => setCurrentSong({ ...currentSong, youtubeUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cole o link da versão exata que você quer que a banda estude.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Descrição da Versão / Cantor Específico
                  </label>
                  <input
                    type="text"
                    value={currentSong.version}
                    onChange={e => setCurrentSong({ ...currentSong, version: e.target.value })}
                    placeholder="Ex: Versão Ao Vivo Gabriela Rocha (Acústico)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:border-red-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ajuda os músicos a saberem se é versão rápida, acústica ou ao vivo.
                  </p>
                </div>
              </div>

              {/* Arrangements and Chords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Orientações e Dinâmica de Arranjo
                  </label>
                  <textarea
                    rows={3}
                    value={currentSong.notes}
                    onChange={e => setCurrentSong({ ...currentSong, notes: e.target.value })}
                    placeholder="Ex: Começa suave só teclado e voz. Na ponte sobe a dinâmica com a bateria cheia. No final faz refrão a capella."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Link da Cifra (Cifra Club ou Banana Cifras)</span>
                    <span className="text-[10px] text-slate-500 font-normal">Opcional</span>
                  </label>
                  <input
                    type="url"
                    value={currentSong.cifraUrl}
                    onChange={e => setCurrentSong({ ...currentSong, cifraUrl: e.target.value })}
                    placeholder="https://www.bananacifras.com/..."
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-xs focus:border-red-500 focus:outline-none mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-slate-600 dark:text-slate-400">BPM:</label>
                    <input
                      type="number"
                      value={currentSong.bpm || 70}
                      onChange={e => setCurrentSong({ ...currentSong, bpm: Number(e.target.value) })}
                      className="w-20 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2 py-1 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Chords / Letra Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Letra com Cifras (para visualização no app)</span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-400">Suporta transposição automática no app!</span>
                </label>
                <textarea
                  rows={6}
                  value={currentSong.chordsText}
                  onChange={e => setCurrentSong({ ...currentSong, chordsText: e.target.value })}
                  placeholder={`Tom: ${currentSong.key || 'G'}\n[Intro] G  C9  G  C9\n\nG\nTe amo, Deus\n      C9          G\nTua graça nunca falha...`}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-mono text-xs rounded-lg p-3 focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditingSong(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow shadow-red-600/20"
                >
                  Salvar Música no Repertório
                </button>
              </div>
            </form>
          )}

          {/* Song List / Playlist of the Week */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span>Ordem do Repertório ({activeSchedule.songs?.length || 0} Músicas)</span>
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Use as setas para ajustar a ordem de ministração
              </span>
            </div>

            {(!activeSchedule.songs || activeSchedule.songs.length === 0) ? (
              <div className="glass-card p-12 text-center rounded-2xl border-dashed border-slate-300 dark:border-slate-800">
                <Music className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma música adicionada ainda</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Como ministro desta semana, clique no botão acima para adicionar as músicas que você vai conduzir neste domingo.
                </p>
                <button
                  onClick={handleOpenNewSong}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                >
                  + Adicionar Primeira Música
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSchedule.songs.map((song, idx) => {
                  const videoId = extractYouTubeId(song.youtubeUrl);
                  const thumb = getYouTubeThumbnail(videoId);

                  return (
                    <div 
                      key={song.id || idx}
                      className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      {/* Left: Index, Thumbnail & Song Info */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        {/* Order Index and Reorder Arrows */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveSong(idx, -1)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                            title="Subir ordem"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <button
                            disabled={idx === activeSchedule.songs.length - 1}
                            onClick={() => handleMoveSong(idx, 1)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20"
                            title="Descer ordem"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* YouTube Thumbnail preview (if available) */}
                        {thumb ? (
                          <div 
                            onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                            className="relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer group shadow border border-slate-300 dark:border-slate-800"
                          >
                            <img 
                              src={thumb} 
                              alt={song.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                              <Play className="w-5 h-5 text-red-500 fill-current" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 shrink-0">
                            <Music className="w-5 h-5" />
                          </div>
                        )}

                        {/* Title, Artist, Version & Notes with crisp contrast for both light & dark mode */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-base line-clamp-1" title={song.title}>
                            {song.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                            {song.artist} {song.version ? `• ${song.version}` : ''}
                          </p>

                          {/* Dedicated Badges Row */}
                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                            <span className="font-mono font-extrabold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded text-xs border border-red-300 dark:border-red-800/60">
                              Tom: {song.key}
                            </span>
                            {song.originalKey && song.originalKey !== song.key ? (
                              <span className="text-[10px] text-red-800 dark:text-red-300 bg-red-50/70 dark:bg-red-950/40 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800 font-mono font-semibold" title={`Tom original da gravação no YouTube: ${song.originalKey}`}>
                                Original: {song.originalKey} ➔ Min: {song.key}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                (Tom Original)
                              </span>
                            )}
                            {song.bpm && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                {song.bpm} BPM
                              </span>
                            )}
                          </div>

                          {song.notes && (
                            <p className="text-[11px] text-sky-700 dark:text-sky-300 mt-1.5 line-clamp-1 italic bg-sky-50 dark:bg-slate-950/60 p-1.5 rounded-lg border border-sky-100 dark:border-slate-800">
                              💡 "{song.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions with high contrast */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {/* Play Reference Video */}
                        <button
                          onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                          title="Assistir/Ouvir versão de referência no YouTube"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/50 hover:bg-red-200 dark:hover:bg-red-900/60 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Vídeo</span>
                        </button>

                        {/* View Chords */}
                        <button
                          onClick={() => onOpenChordViewer(song)}
                          title="Visualizar cifra com transposição"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800/50 hover:bg-sky-200 dark:hover:bg-sky-900/60 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Cifra</span>
                        </button>

                        {/* Edit Song */}
                        <button
                          onClick={() => handleEditSong(song)}
                          title="Editar música"
                          className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Song */}
                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          title="Excluir música"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
