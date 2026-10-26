import React, { useState } from 'react';
import { X, FileText, ExternalLink, Check, Link2, RotateCcw } from 'lucide-react';
import { GOOGLE_DOCS_URL } from '../data/initialData';

export default function GoogleDocsModal({ currentUrl, onSave, onClose }) {
  const [url, setUrl] = useState(currentUrl || GOOGLE_DOCS_URL);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSave(url.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    setUrl(GOOGLE_DOCS_URL);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Link do Google Docs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Arquivo com as cifras ou roteiro da semana
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL do Documento (Google Docs):
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/document/d/..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs sm:text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Insira o link com permissão de visualização compartilhada no Google Docs.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                <span>Testar Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-slate-400">•</span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar link original</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow transition"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              <span>{saved ? 'Link Atualizado!' : 'Salvar Novo Link'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
