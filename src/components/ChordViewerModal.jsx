import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  Minus, 
  Plus, 
  RotateCcw, 
  Type, 
  Play, 
  Pause, 
  FileText,
  Columns,
  Square,
  Edit3,
  Check,
  Sparkles,
  Save
} from 'lucide-react';
import { transposeChordsText, transposeRoot, getSemitonesBetween } from '../utils/transposer';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function ChordViewerModal({ song, onSaveChords, onClose }) {
  if (!song) return null;

  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [columnsCount, setColumnsCount] = useState(2); // 1 or 2 columns (default to 2 columns)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed] = useState(2);
  const contentRef = useRef(null);

  // Maestro / Regente Editing Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(song.chordsText || '');
  const [editedNotes, setEditedNotes] = useState(song.notes || '');
  const [editedKey, setEditedKey] = useState(song.key || 'G');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep state updated if song prop changes
  useEffect(() => {
    if (song) {
      setEditedText(song.chordsText || '');
      setEditedNotes(song.notes || '');
      setEditedKey(song.key || 'G');
      setSemitones(0);
    }
  }, [song?.id, song?.key, song?.chordsText]);

  const currentKey = transposeRoot(song.key || 'C', semitones);
  const textToDisplay = isEditing ? editedText : (song.chordsText || '');
  const transposedContent = transposeChordsText(textToDisplay, semitones);

  // Auto-scroll effect
  useEffect(() => {
    let interval = null;
    if (isAutoScrolling && !isEditing) {
      interval = setInterval(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop += scrollSpeed;
        }
      }, 50);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling, scrollSpeed, isEditing]);

  const handleInsertTag = (tag) => {
    setEditedText(prev => prev + `\n${tag}\n`);
  };

  // Save edits made in Maestro/Técnico editing mode
  const handleSaveEdits = () => {
    if (onSaveChords) {
      onSaveChords(song.id, editedText, editedKey, editedNotes);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditing(false);
    }, 1400);
  };

  // Save the currently transposed key permanently as official key for the team
  const handleSaveTransposedAsOfficial = () => {
    const newChords = transposeChordsText(song.chordsText || '', semitones);
    if (onSaveChords) {
      onSaveChords(song.id, newChords, currentKey, song.notes);
    }
    setSemitones(0);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[94vh] overflow-hidden">
        
        {/* Studio Stand Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                  {song.title}
                </h3>
                <span className="font-mono text-xs font-bold tabular-nums text-sky-700 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/25">
                  Tom: {currentKey}
                </span>
                {song.originalKey && song.originalKey !== song.key && (
                  <span
                    className="text-[10px] font-mono font-medium tabular-nums text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25"
                    title={`Tom original do YouTube era ${song.originalKey}, alterado para ${song.key} pelo ministro`}
                  >
                    Orig: {song.originalKey} → Min: {song.key}
                  </span>
                )}
                {saveSuccess && (
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Salvo p/ Equipe</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {song.artist} {song.version ? `• ${song.version}` : ''}
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={`https://www.bananacifras.com/cifra/m/${encodeURIComponent(song.artist?.toLowerCase().replace(/\s+/g, '-') || 'morada')}/${encodeURIComponent(song.title?.toLowerCase().replace(/\s+/g, '-') || 'emaus')}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Buscar referência no Banana Cifras"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/80 transition"
            >
              <span>Banana Cifras</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>

            <button
              onClick={() => setIsEditing(!isEditing)}
              title="Editar cifra e tom oficial para toda a equipe"
              className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg border transition active:scale-[0.98] ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                  : 'text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border-slate-200/90 dark:border-slate-700'
              }`}
            >
              <Edit3 className={`w-3.5 h-3.5 ${isEditing ? 'text-slate-950' : 'text-amber-500'}`} />
              <span>{isEditing ? 'Modo Leitura' : 'Editar Cifra'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Fechar cifra"
              className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Control Bar: Key Transposition, Columns Segmented Control, Font Size & Auto-Scroll */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-2 bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 text-xs">
          
          {/* Left: Key Transposition */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">Tom:</span>
            <div className="inline-flex items-center h-8 bg-white dark:bg-slate-950 rounded-lg border border-slate-200/90 dark:border-slate-800 p-0.5">
              <button
                onClick={() => setSemitones(s => s - 1)}
                title="Descer 1 semitom"
                className="flex items-center justify-center w-7 h-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 font-mono font-bold tabular-nums text-sky-600 dark:text-sky-400 text-xs min-w-[36px] text-center">
                {currentKey}
              </span>
              <button
                onClick={() => setSemitones(s => s + 1)}
                title="Subir 1 semitom"
                className="flex items-center justify-center w-7 h-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {semitones !== 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSemitones(0)}
                  title="Voltar ao tom definido pelo ministro"
                  className="inline-flex items-center gap-1 h-8 px-2 rounded-md text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Original ({song.key})</span>
                </button>

                <button
                  onClick={handleSaveTransposedAsOfficial}
                  title="Salvar este tom para todos os músicos e ministros"
                  className="inline-flex items-center gap-1 h-8 px-2.5 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition active:scale-[0.98] shadow-2xs"
                >
                  <Save className="w-3 h-3" />
                  <span>Fixar {currentKey} p/ Equipe</span>
                </button>
              </div>
            )}
          </div>

          {/* Center: Concentric Segmented Switcher (1 Coluna vs 2 Colunas) */}
          <div className="inline-flex items-center h-8 bg-slate-200/70 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200/90 dark:border-slate-800">
            <button
              onClick={() => setColumnsCount(1)}
              className={`inline-flex items-center gap-1.5 h-full px-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                columnsCount === 1 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>1 Coluna</span>
            </button>
            <button
              onClick={() => setColumnsCount(2)}
              className={`inline-flex items-center gap-1.5 h-full px-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                columnsCount === 2 
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>2 Colunas</span>
            </button>
          </div>

          {/* Right: Font Size & Auto-Scroll */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center h-8 bg-white dark:bg-slate-950 px-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800">
              <Type className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <button
                onClick={() => setFontSize(f => Math.max(8, f - 1))}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
                title="Diminuir fonte"
              >
                -
              </button>
              <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300 min-w-[32px] text-center">
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize(f => Math.min(24, f + 1))}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs"
                title="Aumentar fonte"
              >
                +
              </button>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-semibold transition active:scale-[0.98] ${
                  isAutoScrolling
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-950 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {isAutoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoScrolling ? 'Pausar' : 'Auto-Rolar'}</span>
              </button>
            )}
          </div>

        </div>

        {/* Maestro Editing Bar with Quick Tags (Visible when isEditing is TRUE) */}
        {isEditing && (
          <div className="p-3 bg-amber-500/[0.08] border-b border-amber-500/25 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Edição Oficial da Equipe:</span>
                </span>

                <div className="inline-flex items-center gap-1.5 h-8 bg-white dark:bg-slate-900 px-2.5 rounded-lg border border-amber-500/30">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tom Oficial:</label>
                  <select
                    value={editedKey}
                    onChange={(e) => {
                      const newK = e.target.value;
                      const semitonesDiff = getSemitonesBetween(editedKey, newK);
                      setEditedKey(newK);
                      if (semitonesDiff !== 0) {
                        setEditedText(prev => transposeChordsText(prev, semitonesDiff));
                      }
                    }}
                    className="bg-transparent font-mono font-bold text-amber-600 dark:text-amber-400 text-xs focus:outline-none cursor-pointer"
                  >
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k} className="bg-white dark:bg-slate-900">Tom: {k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveEdits}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-2xs transition active:scale-[0.98]"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Salvo para Todos!' : 'Salvar Alterações'}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                '[Segurar 2 tempos]',
                '[Solo de Guitarra]',
                '[Pausa / Corte]',
                '[Bateria entra suave]',
                '[Sobe 1 tom no final]',
                '[Voz e Piano]',
                '[Refrão]',
                '[Intro]'
              ].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="px-2 py-1 text-[11px] font-mono font-medium rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sheet Music Reading Area */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
        >
          {isEditing ? (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Cole aqui a cifra ou faça anotações do arranjo..."
                  className="w-full h-full min-h-[340px] p-4 font-mono text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-sky-500 focus:outline-none select-text"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Observações de Arranjo para a Banda:
                </label>
                <input
                  type="text"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Ex: Segura dinâmica na estrofe 2, entra cheio no refrão."
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div 
              className={`font-mono select-text leading-relaxed tracking-wide ${
                columnsCount === 2 ? 'chords-two-columns' : ''
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {transposedContent ? (
                <div className="whitespace-pre-wrap">{transposedContent}</div>
              ) : (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <p className="text-sm font-medium">Nenhuma cifra cadastrada para esta música.</p>
                  <p className="text-xs mt-1">
                    Clique em <strong>"Editar Cifra"</strong> no topo para colar a cifra ou adicionar anotações.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Arrangement Notes Strip */}
        {!isEditing && (song.notes || editedNotes) && (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="font-semibold text-sky-600 dark:text-sky-400 shrink-0">Direção Musical:</span>
            <span className="truncate">{editedNotes || song.notes}</span>
          </div>
        )}

      </div>
    </div>
  );
}
