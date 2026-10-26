import React from 'react';
import { 
  Music, 
  Calendar, 
  Users, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Mic2, 
  Guitar, 
  Download, 
  RotateCcw, 
  Sun, 
  Moon,
  FileEdit,
  FileText
} from 'lucide-react';

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  theme, 
  onToggleTheme, 
  googleDocsUrl,
  onOpenGoogleDocsModal,
  onOpenWhatsAppModal, 
  onExportData, 
  onResetData 
}) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b dark:border-slate-800 border-slate-200 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-400 p-[2px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full dark:bg-slate-950 bg-white rounded-[10px] flex items-center justify-center">
                <Music className="w-5 h-5 sm:w-6 sm:h-6 text-sky-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 dark:from-sky-400 dark:via-indigo-300 dark:to-amber-300 bg-clip-text text-transparent">
                  LouvorSync
                </span>
                <span className="hidden xs:inline-block px-2 py-0.5 text-[10px] font-semibold dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 bg-sky-50 text-sky-700 border border-sky-200 rounded-full uppercase tracking-wider">
                  Novembro 2026
                </span>
              </div>
              <p className="text-[11px] dark:text-slate-400 text-slate-500 hidden sm:block">
                Escala de Músicos & Central de Repertório
              </p>
            </div>
          </div>

          {/* Role Switcher (Desktop & Tablet) */}
          <div className="hidden md:flex items-center dark:bg-slate-900/90 bg-slate-100 p-1.5 rounded-xl border dark:border-slate-800 border-slate-200 shadow-inner">
            <button
              onClick={() => setCurrentRole('leader')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentRole === 'leader'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/25'
                  : 'dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900 dark:hover:bg-slate-800/60 hover:bg-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Líder da Equipe
            </button>
            <button
              onClick={() => setCurrentRole('minister')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentRole === 'minister'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25'
                  : 'dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900 dark:hover:bg-slate-800/60 hover:bg-white'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              Ministro(a)
            </button>
            <button
              onClick={() => setCurrentRole('musician')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentRole === 'musician'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900 dark:hover:bg-slate-800/60 hover:bg-white'
              }`}
            >
              <Guitar className="w-4 h-4" />
              Músico / Integrante
            </button>
          </div>

          {/* Top Actions: Light/Dark Theme, Google Docs with Edit, WhatsApp, Backup */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              className="p-2 rounded-lg dark:text-amber-400 text-slate-600 dark:hover:bg-slate-800 hover:bg-slate-200 border dark:border-slate-800 border-slate-200 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Google Docs Combined Button with Edit */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-lg border dark:border-slate-700 border-slate-300 p-0.5 shadow-xs">
              <a
                href={googleDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir arquivo de cifras no Google Docs"
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold dark:text-slate-200 text-slate-700 hover:text-sky-600 dark:hover:text-sky-400 transition"
              >
                <FileText className="w-3.5 h-3.5 text-sky-500" />
                <span className="hidden lg:inline">Docs</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                onClick={onOpenGoogleDocsModal}
                title="Atualizar link do Google Docs da semana"
                className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-700 rounded transition border-l border-slate-200 dark:border-slate-700 ml-0.5"
              >
                <FileEdit className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onOpenWhatsAppModal}
              title="Gerar texto para WhatsApp"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-300 dark:bg-emerald-950/60 bg-emerald-50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border dark:border-emerald-800/60 border-emerald-300 transition shadow-sm"
            >
              <Share2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={onExportData}
              title="Exportar backup dos dados"
              className="p-2 rounded-lg dark:text-slate-400 text-slate-600 dark:hover:text-slate-200 hover:text-slate-900 dark:hover:bg-slate-800/80 hover:bg-slate-200 border dark:border-slate-800 border-slate-200 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Role Switcher Bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t dark:border-slate-800/80 border-slate-200">
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button
              onClick={() => setCurrentRole('leader')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium ${
                currentRole === 'leader'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'dark:bg-slate-900/80 bg-slate-100 dark:text-slate-400 text-slate-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Líder
            </button>
            <button
              onClick={() => setCurrentRole('minister')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium ${
                currentRole === 'minister'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'dark:bg-slate-900/80 bg-slate-100 dark:text-slate-400 text-slate-600'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              Ministro
            </button>
            <button
              onClick={() => setCurrentRole('musician')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium ${
                currentRole === 'musician'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'dark:bg-slate-900/80 bg-slate-100 dark:text-slate-400 text-slate-600'
              }`}
            >
              <Guitar className="w-3.5 h-3.5" />
              Músico
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
