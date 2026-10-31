import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ExternalLink, 
  Check, 
  Link2, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  Music, 
  Download, 
  AlertCircle,
  ClipboardPaste
} from 'lucide-react';
import { GOOGLE_DOCS_URL } from '../data/initialData';
import { parseGoogleDocTextToSongs } from '../utils/googleDocsParser';

const MUSICAL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function GoogleDocsModal({ 
  currentUrl, 
  schedules = [], 
  defaultScheduleId = '',
  onSave, 
  onImportSongsToSchedule,
  onClose 
}) {
  const [url, setUrl] = useState(currentUrl || GOOGLE_DOCS_URL);
  const [selectedScheduleId, setSelectedScheduleId] = useState(
    defaultScheduleId || schedules[0]?.id || ''
  );
  const [importMode, setImportMode] = useState('replace'); // 'replace' | 'append'
  const [saved, setSaved] = useState(false);

  // Mapping state
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [mappedSongs, setMappedSongs] = useState([]);
  const [mapError, setMapError] = useState('');
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [manualText, setManualText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSubmitUrlOnly = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSave(url.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1200);
  };

  const handleReset = () => {
    setUrl(GOOGLE_DOCS_URL);
    setMapError('');
  };

  const handleMapFromGoogleDocs = async () => {
    if (!url.trim()) return;
    setIsLoadingDoc(true);
    setMapError('');
    setMappedSongs([]);

    try {
      // Save link first so it's updated
      onSave(url.trim());

      const res = await fetch(`/api/google-docs?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMapError(
          data?.error ||
          'Não foi possível ler o arquivo automaticamente. Verifique se está público ou cole o conteúdo manualmente abaixo.'
        );
        setShowManualPaste(true);
        setIsLoadingDoc(false);
        return;
      }

      if (!data.songs || data.songs.length === 0) {
        setMapError('O documento foi lido, mas não identificamos blocos de cifras separados. Você pode colar o texto manualmente abaixo.');
        setShowManualPaste(true);
      } else {
        setMappedSongs(data.songs);
      }
    } catch (err) {
      setMapError('Falha ao conectar com o Google Docs. Use a opção de colar o conteúdo do documento abaixo.');
      setShowManualPaste(true);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const handleMapFromManualText = () => {
    if (!manualText.trim()) return;
    const songs = parseGoogleDocTextToSongs(manualText);
    if (songs.length === 0) {
      setMapError('Não foi possível identificar músicas no texto colado.');
    } else {
      setMapError('');
      setMappedSongs(songs);
    }
  };

  const handleChangeMappedKey = (idx, newKey) => {
    setMappedSongs(prev =>
      prev.map((s, i) => (i === idx ? { ...s, key: newKey } : s))
    );
  };

  const handleRemoveMappedSong = (idx) => {
    setMappedSongs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmImport = () => {
    if (mappedSongs.length === 0 || !selectedScheduleId) return;
    if (onImportSongsToSchedule) {
      onImportSongsToSchedule(selectedScheduleId, mappedSongs, importMode, url.trim());
    }
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Google Docs da Semana & Importador de Cifras
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atualize o link do Docs e mapeie automaticamente as músicas, tons e cifras para a escala
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto">
          
          {/* Step 1: Google Docs URL */}
          <form onSubmit={handleSubmitUrlOnly} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Link do Arquivo Google Docs (Roteiro / Cifras):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs sm:text-sm focus:border-sky-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition shrink-0 flex items-center justify-center gap-1.5"
              >
                {saved ? <Check className="w-4 h-4 text-emerald-500" /> : null}
                <span>{saved ? 'Link Salvo!' : 'Apenas Salvar Link'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <span>Abrir Documento no Google Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-slate-400">•</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar link padrão</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowManualPaste(!showManualPaste)}
                className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 underline"
              >
                {showManualPaste ? 'Ocultar colagem manual' : 'Ou colar texto do Docs manualmente'}
              </button>
            </div>
          </form>

          {/* Step 2: Map & Extract Songs from Google Docs */}
          <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>2. Mapear Músicas, Tons e Cifras do Documento</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Lê todas as músicas e cifras contidas no Google Docs, detecta os tons e preenche a lista do culto escolhido.
                </p>
              </div>

              <button
                type="button"
                disabled={isLoadingDoc}
                onClick={handleMapFromGoogleDocs}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white shadow-md shadow-sky-600/20 transition shrink-0"
              >
                {isLoadingDoc ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mapeando Docs...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Ler e Mapear Músicas do Docs</span>
                  </>
                )}
              </button>
            </div>

            {/* Optional Manual Paste Fallback */}
            {showManualPaste && (
              <div className="pt-2 border-t border-sky-200 dark:border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Colar conteúdo do Google Docs manualmente (caso o documento seja privado):
                </label>
                <textarea
                  rows={4}
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder="Copie todo o texto do seu Google Docs (Ctrl+A, Ctrl+C) e cole aqui..."
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleMapFromManualText}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Mapear Texto Colado</span>
                </button>
              </div>
            )}

            {/* Error Alert */}
            {mapError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{mapError}</span>
              </div>
            )}

            {/* Mapped Songs Preview & Target Schedule Selector */}
            {mappedSongs.length > 0 && (
              <div className="space-y-4 pt-3 border-t border-sky-200 dark:border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    <span>{mappedSongs.length} músicas mapeadas com sucesso do Google Docs!</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Confira ou ajuste os tons abaixo:</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {mappedSongs.map((song, idx) => (
                    <div
                      key={song.id || idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {song.title}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-7 truncate">
                          Cantor/Ministério: <strong>{song.artist}</strong> • Cifra completa ({song.chordsText.split('\n').length} linhas)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Tom:</label>
                        <select
                          value={song.key}
                          onChange={(e) => handleChangeMappedKey(idx, e.target.value)}
                          className="bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                        >
                          {MUSICAL_KEYS.map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveMappedSong(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 text-xs"
                          title="Remover desta importação"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Target Sunday & Mode */}
                {schedules.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Aplicar no Domingo / Culto:
                      </label>
                      <select
                        value={selectedScheduleId}
                        onChange={(e) => setSelectedScheduleId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                      >
                        {schedules.map(sched => {
                          const [y, m, d] = sched.date.split('-');
                          return (
                            <option key={sched.id} value={sched.id}>
                              Dom {d}/{m} — Min: {sched.lineup.ministration || 'A definir'} ({sched.songs?.length || 0} músicas)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Modo de Importação:
                      </label>
                      <select
                        value={importMode}
                        onChange={(e) => setImportMode(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                      >
                        <option value="replace">Substituir lista atual deste Domingo</option>
                        <option value="append">Acrescentar às músicas já existentes</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  {importSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Músicas e Cifras Importadas e Sincronizadas!</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-4 h-4" />
                      <span>Importar {mappedSongs.length} Músicas + Cifras para o Repertório</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
}
