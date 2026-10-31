import React, { useState, useRef, useEffect } from 'react';
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
  Sparkles,
  Wand2,
  BookOpen,
  Loader2,
  ClipboardPaste,
  Check,
  Calendar,
  Users,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  fetchYouTubeMetadata, 
  buildBananaCifrasUrl, 
  buildCifraClubUrl 
} from '../../utils/youtube';
import { getSemitonesBetween, transposeChordsText } from '../../utils/transposer';
import { loadSongCatalog, saveSongToCatalog, findSongInCatalog } from '../../utils/storage';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function MinisterSetlistEditor({
  schedules,
  onUpdateSchedule,
  onOpenYouTubePlayer,
  onOpenChordViewer,
  onOpenWhatsApp,
  onOpenGoogleDocsModal
}) {
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.id || '');
  const [isEditingSong, setIsEditingSong] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [catalog, setCatalog] = useState(() => loadSongCatalog());
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isFetchingAuto, setIsFetchingAuto] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState(null);
  const formRef = useRef(null);

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  useEffect(() => {
    setCatalog(loadSongCatalog());
  }, [schedules]);

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  useEffect(() => {
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
    setAutoFillMessage(null);
    setCatalogSearch('');
    setIsEditingSong(true);
    scrollToForm();
  };

  const handleEditSong = (song) => {
    setCurrentSong({ ...song });
    setAutoFillMessage(null);
    setCatalogSearch('');
    setIsEditingSong(true);
    scrollToForm();
  };

  /**
   * Applies a song from the Smart Church Catalog into the current form
   */
  const handleSelectFromCatalog = (catSong) => {
    if (!catSong) return;
    setCurrentSong(prev => ({
      ...prev,
      title: catSong.title,
      artist: catSong.artist || prev.artist,
      version: catSong.version || prev.version,
      originalKey: catSong.originalKey || catSong.key || 'G',
      key: catSong.key || catSong.originalKey || 'G',
      bpm: catSong.bpm || 70,
      youtubeUrl: prev.youtubeUrl || catSong.youtubeUrl || '',
      cifraUrl: catSong.cifraUrl || buildBananaCifrasUrl(catSong.artist, catSong.title),
      notes: catSong.notes || prev.notes || '',
      chordsText: catSong.chordsText || prev.chordsText || ''
    }));
    setCatalogSearch('');
    setAutoFillMessage({
      type: 'success',
      text: `Música "${catSong.title}" carregada com Tom (${catSong.originalKey || catSong.key}), ${catSong.bpm || 70} BPM e Cifra!`
    });
  };

  /**
   * Extracts Title & Artist from YouTube oEmbed and checks Church Catalog / Google Docs songs
   */
  const handleAutoExtractFromYouTube = async (urlToProcess) => {
    const targetUrl = (urlToProcess ?? currentSong?.youtubeUrl ?? '').trim();
    const videoId = extractYouTubeId(targetUrl);
    if (!videoId) {
      setAutoFillMessage({
        type: 'warning',
        text: 'Cole um link válido do YouTube para identificar o nome da música e artista.'
      });
      return;
    }

    setIsFetchingAuto(true);
    setAutoFillMessage({
      type: 'info',
      text: 'Identificando título e artista pelo link do YouTube...'
    });

    try {
      const ytMeta = await fetchYouTubeMetadata(targetUrl);
      const extractedTitle = ytMeta?.title || currentSong?.title || '';
      const extractedArtist = ytMeta?.artist || currentSong?.artist || '';
      const extractedVersion = ytMeta?.version || currentSong?.version || '';

      const catalogMatch = findSongInCatalog({
        youtubeUrl: targetUrl,
        title: extractedTitle,
        artist: extractedArtist
      });

      const autoBananaUrl = buildBananaCifrasUrl(
        catalogMatch?.artist || extractedArtist,
        catalogMatch?.title || extractedTitle
      );

      if (catalogMatch) {
        const origKey = ytMeta?.detectedKey || catalogMatch.originalKey || catalogMatch.key || 'G';
        const bpmVal = ytMeta?.detectedBpm || catalogMatch.bpm || 70;
        setCurrentSong(prev => ({
          ...prev,
          youtubeUrl: targetUrl,
          title: catalogMatch.title || extractedTitle || prev.title,
          artist: catalogMatch.artist || extractedArtist || prev.artist,
          version: extractedVersion || catalogMatch.version || prev.version,
          originalKey: origKey,
          key: origKey,
          bpm: bpmVal,
          cifraUrl: catalogMatch.cifraUrl || autoBananaUrl || prev.cifraUrl,
          notes: prev.notes || catalogMatch.notes || '',
          chordsText: catalogMatch.chordsText || prev.chordsText || ''
        }));
        setAutoFillMessage({
          type: 'success',
          text: `✨ Extraído do YouTube + Catálogo: "${catalogMatch.title}" (${catalogMatch.artist}) • Tom: ${origKey} • Cifra preenchida!`
        });
      } else {
        const finalKey = ytMeta?.detectedKey || currentSong?.originalKey || 'G';
        const finalBpm = ytMeta?.detectedBpm || currentSong?.bpm || 70;
        setCurrentSong(prev => ({
          ...prev,
          youtubeUrl: targetUrl,
          title: extractedTitle || prev.title,
          artist: extractedArtist || prev.artist,
          version: extractedVersion || prev.version,
          originalKey: finalKey,
          key: finalKey,
          bpm: finalBpm,
          cifraUrl: autoBananaUrl || prev.cifraUrl
        }));
        setAutoFillMessage({
          type: 'success',
          text: `✨ Título "${extractedTitle}" e cantor "${extractedArtist}" identificados do YouTube!`
        });
      }
    } catch (_) {
      setAutoFillMessage({
        type: 'warning',
        text: 'Link do YouTube vinculado! Confira os campos de título e tom abaixo.'
      });
    } finally {
      setIsFetchingAuto(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        const tomMatch = text.match(/Tom:\s*([A-G][#b]?m?)\b/i);
        const detectedKey = tomMatch ? tomMatch[1].replace(/m$/i, '') : null;
        setCurrentSong(prev => ({
          ...prev,
          originalKey: detectedKey || prev.originalKey,
          key: detectedKey || prev.key,
          chordsText: text
        }));
        setAutoFillMessage({
          type: 'success',
          text: `📋 Cifra colada com sucesso${detectedKey ? ` (Tom detectado: ${detectedKey})` : ''}!`
        });
      }
    } catch (_) {
      alert('Para colar no celular, toque e segure dentro da caixa de Cifra e escolha "Colar".');
    }
  };

  const handleSaveSong = (e) => {
    e.preventDefault();
    if (!currentSong.title.trim()) return;

    const songToSave = {
      ...currentSong,
      cifraUrl: currentSong.cifraUrl || buildBananaCifrasUrl(currentSong.artist, currentSong.title)
    };

    saveSongToCatalog(songToSave);
    setCatalog(loadSongCatalog());

    let updatedSongs = [...(activeSchedule.songs || [])];
    const index = updatedSongs.findIndex(s => s.id === songToSave.id);

    if (index !== -1) {
      updatedSongs[index] = songToSave;
    } else {
      updatedSongs.push(songToSave);
    }

    onUpdateSchedule({
      ...activeSchedule,
      songs: updatedSongs
    });

    setIsEditingSong(false);
    setCurrentSong(null);
    setAutoFillMessage(null);
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

  const filteredCatalog = catalog.filter(item => {
    const q = (catalogSearch || currentSong?.title || '').toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.artist && item.artist.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      
      {/* Horizontal Sunday Selector Strip */}
      <div 
        role="tablist"
        aria-label="Domingos para coordenação de repertório"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
      >
        {schedules.map((sched) => {
          const isSelected = sched.id === selectedScheduleId;
          const [, month, day] = sched.date.split('-');
          const songsCount = sched.songs?.length || 0;
          const ministerName = sched.lineup.ministration || 'A definir';

          return (
            <button
              key={sched.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setSelectedScheduleId(sched.id);
                setIsEditingSong(false);
              }}
              className={`group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-rose-500/80 dark:border-rose-400/70 ring-1 ring-rose-500/20 dark:ring-rose-400/20 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Date Block */}
              <div
                className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 tabular-nums border transition-colors ${
                  isSelected
                    ? 'bg-rose-500/10 dark:bg-rose-400/10 border-rose-500/30 dark:border-rose-400/30 text-rose-700 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-75 leading-none">
                  Dom
                </span>
                <span className="text-xs font-extrabold leading-none mt-1">
                  {day}/{month}
                </span>
              </div>

              {/* Sunday Details */}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${
                  isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'
                }`}>
                  {ministerName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                  {songsCount} {songsCount === 1 ? 'música' : 'músicas'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sunday Management */}
      {activeSchedule && (
        <div className="space-y-5">
          
          {/* Minister's Team summary card */}
          <div className="glass-card p-4 sm:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>DOMINGO • {activeSchedule.date.split('-').reverse().join('/')}</span>
                <span>•</span>
                <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">{activeSchedule.title}</span>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Ministração: <span className="text-rose-600 dark:text-rose-400">{activeSchedule.lineup.ministration || 'A definir'}</span>
              </h2>

              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                <span><strong className="text-slate-900 dark:text-slate-200">Vocal:</strong> {activeSchedule.lineup.vocals?.filter(Boolean).join(', ') || '—'}</span>
                <span>•</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Violão:</strong> {activeSchedule.lineup.acousticGuitar || '—'}</span>
                <span>•</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Guitarra:</strong> {[activeSchedule.lineup.guitar1, activeSchedule.lineup.guitar2].filter(Boolean).join(', ') || '—'}</span>
                <span>•</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Teclado:</strong> {activeSchedule.lineup.keyboard || '—'}</span>
                <span>•</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Baixo:</strong> {activeSchedule.lineup.bass || '—'}</span>
                <span>•</span>
                <span><strong className="text-slate-900 dark:text-slate-200">Bateria:</strong> {activeSchedule.lineup.drums || '—'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
              {onOpenGoogleDocsModal && (
                <button
                  type="button"
                  onClick={() => onOpenGoogleDocsModal(activeSchedule.id)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 transition active:scale-[0.98] shadow-2xs"
                  title="Importar repertório e cifras do Google Docs"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Importar do Google Docs</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenWhatsApp(activeSchedule)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 transition active:scale-[0.98] shadow-2xs"
                title="Compartilhar escala e repertório deste domingo no WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Enviar WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleOpenNewSong}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition active:scale-[0.98] shadow-2xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Adicionar Música</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Song Studio Form */}
          {isEditingSong && currentSong && (
            <form 
              ref={formRef} 
              onSubmit={handleSaveSong} 
              className="glass-card p-4 sm:p-5 rounded-xl border border-sky-500/40 ring-1 ring-sky-500/20 scroll-mt-24 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {currentSong.title ? `Editar: ${currentSong.title}` : 'Nova Música para o Repertório'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingSong(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* FAST FILL STRIP: YouTube Link OR Church Catalog */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 p-3.5 rounded-lg bg-slate-100/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
                
                {/* Option A: YouTube link with auto-extractor */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-rose-500" />
                      1. Link do YouTube (Identifica Título & Cantor)
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={currentSong.youtubeUrl}
                      onChange={e => {
                        const val = e.target.value;
                        setCurrentSong(prev => ({ ...prev, youtubeUrl: val }));
                        if (extractYouTubeId(val)) {
                          handleAutoExtractFromYouTube(val);
                        }
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 h-9 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isFetchingAuto}
                      onClick={() => handleAutoExtractFromYouTube(currentSong.youtubeUrl)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition active:scale-[0.98] shrink-0 disabled:opacity-50"
                      title="Extrair título e artista do vídeo do YouTube"
                    >
                      {isFetchingAuto ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      <span>Extrair</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Se já constar no catálogo ou Docs, o Tom e Cifra são preenchidos automaticamente.
                  </p>
                </div>

                {/* Option B: Church Catalog Picker */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>2. Ou escolha do Catálogo / Docs</span>
                    </label>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {catalog.length} músicas
                    </span>
                  </div>
                  <select
                    value=""
                    onChange={e => {
                      const found = catalog.find(c => c.id === e.target.value || c.title === e.target.value);
                      if (found) handleSelectFromCatalog(found);
                    }}
                    className="w-full h-9 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 text-xs font-medium focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" className="text-slate-400">Selecionar música cadastrada na igreja...</option>
                    {catalog.map((cat) => (
                      <option key={cat.id || cat.title} value={cat.title}>
                        {cat.title} — {cat.artist} (Tom: {cat.originalKey || cat.key})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Preenche tom de gravação, BPM e cifra com apenas um clique.
                  </p>
                </div>
              </div>

              {/* Status Banner when Auto-Fill runs */}
              {autoFillMessage && (
                <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                  autoFillMessage.type === 'success'
                    ? 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                    : autoFillMessage.type === 'warning'
                    ? 'bg-amber-500/[0.08] border-amber-500/30 text-amber-800 dark:text-amber-300'
                    : 'bg-sky-500/[0.08] border-sky-500/30 text-sky-800 dark:text-sky-300'
                }`}>
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{autoFillMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoFillMessage(null)}
                    className="text-[11px] underline opacity-75 hover:opacity-100 shrink-0"
                  >
                    Dispensar
                  </button>
                </div>
              )}

              {/* SONG METADATA FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="relative space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Título da Música *
                  </label>
                  <input
                    type="text"
                    required
                    value={currentSong.title}
                    onChange={e => setCurrentSong({ ...currentSong, title: e.target.value })}
                    placeholder="Ex: Em Teus Braços"
                    className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none"
                  />
                  {currentSong.title && currentSong.title.length >= 2 && !currentSong.chordsText && filteredCatalog.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400">Sugestão:</span>
                      {filteredCatalog.slice(0, 2).map(sug => (
                        <button
                          key={sug.id || sug.title}
                          type="button"
                          onClick={() => handleSelectFromCatalog(sug)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 transition font-semibold"
                        >
                          ⚡ {sug.title} ({sug.originalKey || sug.key})
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cantor / Banda Original
                  </label>
                  <input
                    type="text"
                    value={currentSong.artist}
                    onChange={e => setCurrentSong({ ...currentSong, artist: e.target.value })}
                    placeholder="Ex: Laura Souguellis / Morada"
                    className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>

                {/* Tom Original (YouTube) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tom Original (Gravação)
                  </label>
                  <select
                    value={currentSong.originalKey || currentSong.key || 'G'}
                    onChange={e => setCurrentSong({ ...currentSong, originalKey: e.target.value })}
                    className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 text-xs font-mono font-bold focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k}>Tom: {k}</option>
                    ))}
                  </select>
                </div>

                {/* Tom da Ministração (Cantado no Culto) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                      Tom Cantado no Culto
                    </label>
                    {currentSong.originalKey && currentSong.key && currentSong.originalKey !== currentSong.key ? (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 rounded">
                        Alterado
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">
                        Original
                      </span>
                    )}
                  </div>
                  <select
                    value={currentSong.key}
                    onChange={e => setCurrentSong({ ...currentSong, key: e.target.value })}
                    className="w-full h-9 bg-sky-500/[0.06] dark:bg-sky-500/[0.1] border border-sky-400/80 dark:border-sky-500/60 text-sky-900 dark:text-sky-200 rounded-lg px-2.5 text-xs font-mono font-bold focus:border-sky-500 focus:outline-none cursor-pointer"
                  >
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        Tom: {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transposition notice & auto-transpose button */}
              {currentSong.originalKey && currentSong.key && currentSong.originalKey !== currentSong.key && (
                <div className="p-3 rounded-lg bg-amber-500/[0.08] border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>
                      Tom alterado de <strong>{currentSong.originalKey}</strong> para <strong>{currentSong.key}</strong>.
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
                      className="inline-flex items-center justify-center h-8 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition active:scale-[0.98] text-xs shrink-0"
                    >
                      Transpor Cifra ({currentSong.originalKey} → {currentSong.key})
                    </button>
                  )}
                </div>
              )}

              {/* Version, BPM, Reference Links & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Descrição da Versão (Opcional)
                    </label>
                    <input
                      type="text"
                      value={currentSong.version}
                      onChange={e => setCurrentSong({ ...currentSong, version: e.target.value })}
                      placeholder="Ex: Ao Vivo no Dunamis Movement"
                      className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Orientações e Dinâmica de Arranjo
                    </label>
                    <textarea
                      rows={2}
                      value={currentSong.notes}
                      onChange={e => setCurrentSong({ ...currentSong, notes: e.target.value })}
                      placeholder="Ex: Entrada suave só teclado e voz. Refrão 2 com dinâmica cheia."
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg p-2.5 text-xs focus:border-sky-500 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Link da Cifra Externa (Opcional)
                    </label>
                    <input
                      type="url"
                      value={currentSong.cifraUrl || buildBananaCifrasUrl(currentSong.artist, currentSong.title)}
                      onChange={e => setCurrentSong({ ...currentSong, cifraUrl: e.target.value })}
                      placeholder="https://www.bananacifras.com/cifra/..."
                      className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">BPM:</label>
                      <input
                        type="number"
                        value={currentSong.bpm || 70}
                        onChange={e => setCurrentSong({ ...currentSong, bpm: Number(e.target.value) })}
                        className="w-20 h-8 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md px-2 text-xs font-mono font-bold text-center"
                      />
                    </div>

                    {(currentSong.title || currentSong.cifraUrl) && (
                      <div className="flex items-center gap-1.5">
                        <a
                          href={currentSong.cifraUrl || buildBananaCifrasUrl(currentSong.artist, currentSong.title) || 'https://www.bananacifras.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition"
                        >
                          <span>Banana Cifras</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                        <a
                          href={buildCifraClubUrl(currentSong.artist, currentSong.title) || 'https://www.cifraclub.com.br'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
                        >
                          <span>Cifra Club</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chords Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Letra e Cifra da Música (Mapeada do Docs ou Colada Abaixo)
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 transition"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Colar da Área de Transferência</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={currentSong.chordsText}
                  onChange={e => setCurrentSong({ ...currentSong, chordsText: e.target.value })}
                  placeholder={`Tom: ${currentSong.key || 'G'}\n[Intro] G  C9  G  C9\n\nG\nTe amo, Deus\n      C9          G\nTua graça nunca falha...`}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-200 font-mono text-xs rounded-lg p-3 focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsEditingSong(false)}
                  className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition active:scale-[0.98] shadow-2xs"
                >
                  Salvar Música no Repertório
                </button>
              </div>
            </form>
          )}

          {/* Song List / Playlist of the Week */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Ordem do Repertório
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[11px] font-semibold tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeSchedule.songs?.length || 0}
                </span>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                Ajuste a ordem usando as setas
              </span>
            </div>

            {(!activeSchedule.songs || activeSchedule.songs.length === 0) ? (
              <div className="glass-card p-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Music className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma música adicionada ainda</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Importe do Google Docs da semana ou adicione pelo link do YouTube.
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {onOpenGoogleDocsModal && (
                    <button
                      type="button"
                      onClick={() => onOpenGoogleDocsModal(activeSchedule.id)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition active:scale-[0.98]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Importar do Docs</span>
                    </button>
                  )}
                  <button
                    onClick={handleOpenNewSong}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition active:scale-[0.98]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Manual</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeSchedule.songs.map((song, idx) => {
                  const videoId = extractYouTubeId(song.youtubeUrl);
                  const thumb = getYouTubeThumbnail(videoId);
                  const orderNum = String(idx + 1).padStart(2, '0');

                  return (
                    <div 
                      key={song.id || idx}
                      className="glass-card p-3 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      {/* Left: Reorder Buttons, Index & Info */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        
                        {/* Reorder Buttons */}
                        <div className="flex flex-col items-center justify-center shrink-0">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMoveSong(idx, -1)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition"
                            title="Subir ordem"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-mono font-bold tabular-nums text-slate-500 dark:text-slate-400">
                            {orderNum}
                          </span>
                          <button
                            disabled={idx === activeSchedule.songs.length - 1}
                            onClick={() => handleMoveSong(idx, 1)}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition"
                            title="Descer ordem"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Thumbnail or Icon */}
                        {thumb ? (
                          <button
                            type="button"
                            onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                            title={`Ouvir ${song.title}`}
                            className="relative w-18 sm:w-20 aspect-video rounded-md bg-slate-900 shrink-0 overflow-hidden group border border-slate-200/80 dark:border-slate-800"
                          >
                            <img 
                              src={thumb} 
                              alt={song.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-white fill-current" />
                            </div>
                          </button>
                        ) : (
                          <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Music className="w-4 h-4" />
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate" title={song.title}>
                            {song.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {song.artist} {song.version ? `• ${song.version}` : ''}
                          </p>

                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5 tabular-nums">
                            <span className="font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded text-[11px] border border-sky-500/25">
                              Tom: {song.key}
                            </span>
                            {song.originalKey && song.originalKey !== song.key ? (
                              <span
                                className="text-[10px] font-mono font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25"
                                title={`Tom original: ${song.originalKey}`}
                              >
                                Orig: {song.originalKey} → {song.key}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                (Tom Original)
                              </span>
                            )}
                            {song.bpm && (
                              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-700/70">
                                {song.bpm} BPM
                              </span>
                            )}
                          </div>

                          {song.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-1 bg-slate-100/70 dark:bg-slate-950/50 px-2 py-1 rounded border border-slate-200/70 dark:border-slate-800/70">
                              <span className="font-semibold text-sky-600 dark:text-sky-400">Arranjo: </span>
                              {song.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                        <button
                          onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                          title="Assistir/Ouvir versão no YouTube"
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 transition active:scale-[0.98]"
                        >
                          <Play className="w-3 h-3 text-rose-500 fill-current" />
                          <span>Vídeo</span>
                        </button>

                        <button
                          onClick={() => onOpenChordViewer(song)}
                          title="Visualizar cifra com transposição"
                          className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition active:scale-[0.98] shadow-2xs"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Cifra</span>
                        </button>

                        <button
                          onClick={() => handleEditSong(song)}
                          title="Editar música"
                          className="flex items-center justify-center w-8 h-8 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteSong(song.id)}
                          title="Excluir música"
                          className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
