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
  Link2,
  Save
} from 'lucide-react';
import { transposeChordsText, transposeRoot, getSemitonesBetween } from '../utils/transposer';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function ChordViewerModal({ song, onSaveChords, onClose }) {
  if (!song) return null;

  const [semitones, setSemitones] = useState(0);
  const [fontSize, setFontSize] = useState(14);
  const [columnsCount, setColumnsCount] = useState(2); // 1 or 2 columns (default to 2 columns as requested!)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[94vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">
                  {song.title}
                </h3>
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-300 dark:border-sky-800">
                  Tom: {currentKey}
                </span>
                {song.originalKey && song.originalKey !== song.key && (
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800" title={`Tom original do YouTube era ${song.originalKey}, alterado para ${song.key} pelo ministro`}>
                    Orig: {song.originalKey} ➔ Min: {song.key}
                  </span>
                )}
                {saveSuccess && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 animate-pulse flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Atualizado para Todos!</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {song.artist} {song.version ? `• ${song.version}` : ''}
              </p>
            </div>
          </div>

          {/* Quick links & close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Banana Cifras Link */}
            <a
              href={`https://www.bananacifras.com/cifra/m/${encodeURIComponent(song.artist?.toLowerCase().replace(/\s+/g, '-') || 'morada')}/${encodeURIComponent(song.title?.toLowerCase().replace(/\s+/g, '-') || 'emaus')}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Buscar no Banana Cifras"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/40 rounded-lg hover:bg-amber-100 transition"
            >
              <span>Banana Cifras</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Maestro / Edit Toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              title="Editar cifra e tom oficial para toda a equipe"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isEditing
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="text-[11px] sm:text-xs">
                {isEditing ? 'Visualizar' : 'Editar Cifra'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Key Transposition, Columns Toggle (1 vs 2 Colunas), Font Size, Auto-scroll */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 sm:px-6 py-2 bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-xs">
          
          {/* Key Transposition */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Tom:</span>
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5">
              <button
                onClick={() => setSemitones(s => s - 1)}
                title="Descer 1 semitom"
                className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 py-0.5 font-mono font-bold text-sky-500 dark:text-sky-400 text-sm">
                {currentKey}
              </span>
              <button
                onClick={() => setSemitones(s => s + 1)}
                title="Subir 1 semitom"
                className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {semitones !== 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSemitones(0)}
                  title="Voltar ao tom definido pelo ministro"
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-amber-500 px-1 py-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Padrão ({song.key})</span>
                </button>

                {/* Save transposed key as official for everyone */}
                <button
                  onClick={handleSaveTransposedAsOfficial}
                  title="Salvar este tom para todos os músicos e ministros"
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition shadow-xs"
                >
                  <Save className="w-3 h-3" />
                  <span>Salvar {currentKey} Oficial p/ Todos</span>
                </button>
              </div>
            )}
          </div>

          {/* Center: Columns Toggle (1 Coluna vs 2 Colunas) */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 p-0.5 shadow-sm">
            <button
              onClick={() => setColumnsCount(1)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                columnsCount === 1 
                  ? 'bg-sky-500 text-white' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>1 Coluna</span>
            </button>
            <button
              onClick={() => setColumnsCount(2)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition ${
                columnsCount === 2 
                  ? 'bg-sky-500 text-white' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3 h-3" />
              <span>2 Colunas (Mobile/Stand)</span>
            </button>
          </div>

          {/* Right Toolbar: Font Size & Auto-Scroll */}
          <div className="flex items-center gap-2.5">
            {/* Font Size */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
              <Type className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => setFontSize(f => Math.max(8, f - 1))}
                className="px-1 text-slate-600 dark:text-slate-300 hover:font-bold text-xs"
                title="Diminuir fonte"
              >
                -
              </button>
              <span className="text-[11px] font-mono text-slate-500 min-w-[28px] text-center">{fontSize}px</span>
              <button
                onClick={() => setFontSize(f => Math.min(24, f + 1))}
                className="px-1 text-slate-600 dark:text-slate-300 hover:font-bold text-xs"
                title="Aumentar fonte"
              >
                +
              </button>
            </div>

            {/* Auto Scroll */}
            {!isEditing && (
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                  className={`flex items-center gap-1 font-medium transition ${
                    isAutoScrolling ? 'text-amber-500 font-bold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isAutoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isAutoScrolling ? 'Pausa' : 'Rolar'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Maestro Editing Bar with Quick Tags (Visible when isEditing is TRUE) */}
        {isEditing && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Editar Cifra & Tom Oficial (Maestro / Ministro):</span>
                </span>

                {/* Official Key Selector in Editor */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Tom Oficial:</label>
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
                    className="bg-transparent font-mono font-extrabold text-amber-600 dark:text-amber-400 text-xs focus:outline-none cursor-pointer"
                  >
                    {MUSICAL_KEYS.map(k => (
                      <option key={k} value={k}>Tom: {k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveEdits}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow transition"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saveSuccess ? 'Cifra e Tom Salvos p/ Todos!' : 'Salvar Cifra e Tom p/ Equipe'}</span>
              </button>
            </div>

            {/* Quick Insertion Tags */}
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
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 transition shadow-xs"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
        >
          {isEditing ? (
            <div className="h-full flex flex-col space-y-3">
              <div className="flex-1">
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Cole aqui a cifra ou faça anotações do maestro..."
                  className="w-full h-full min-h-[350px] p-4 font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-amber-400 focus:outline-none select-text"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Observações de Arranjo para a Banda:
                </label>
                <input
                  type="text"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Ex: Segura dinâmica na estrofe 2, entra cheio no refrão."
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
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
                <div className="text-center py-12 text-slate-400">
                  <p>Nenhuma cifra cadastrada para esta música.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Clique em <strong>"Editar Cifra (Maestro)"</strong> para colar do Banana Cifras ou digitar as notas.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Notes Info */}
        {!isEditing && (song.notes || editedNotes) && (
          <div className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="font-semibold text-amber-500">Observações do Maestro/Ministro:</span>
            <span>{editedNotes || song.notes}</span>
          </div>
        )}

      </div>
    </div>
  );
}
