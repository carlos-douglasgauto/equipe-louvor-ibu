import React, { useState } from 'react';
import { X, Copy, Check, Share2, Calendar, Send } from 'lucide-react';
import { formatScaleForWhatsApp, formatMonthSummaryForWhatsApp } from '../utils/whatsappFormatter';

export default function WhatsAppShareModal({ schedules, activeSchedule, onClose }) {
  const [mode, setMode] = useState('single'); // 'single' or 'month'
  const [copied, setCopied] = useState(false);

  const textToShare = mode === 'single' && activeSchedule
    ? formatScaleForWhatsApp(activeSchedule)
    : formatMonthSummaryForWhatsApp(schedules, 'Novembro 2026');

  const handleCopy = () => {
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(textToShare);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                Compartilhar no WhatsApp
              </h3>
              <p className="text-xs text-slate-400">
                Texto formatado pronto para o grupo da equipe de louvor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-5 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'single'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Domingo Selecionado ({activeSchedule?.date.split('-').slice(1).reverse().join('/')})
          </button>
          <button
            onClick={() => setMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'month'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Escala Mensal Completa (5 Domingos)
          </button>
        </div>

        {/* Live Preview Textarea */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Pré-visualização da Mensagem:
          </label>
          <pre className="w-full h-80 p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-y-auto whitespace-pre-wrap select-all leading-relaxed">
            {textToShare}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-md ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para a área de transferência!' : 'Copiar Texto'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/30"
          >
            <Send className="w-4 h-4" />
            <span>Abrir no WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
