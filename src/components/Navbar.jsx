import React from 'react';
import { 
  Music, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Mic2, 
  Guitar, 
  Download, 
  Sun, 
  Moon,
  FileEdit,
  FileText,
  RefreshCw
} from 'lucide-react';

const ROLES = [
  {
    id: 'leader',
    label: 'Líder da Equipe',
    shortLabel: 'Líder',
    icon: ShieldCheck,
    dotColor: 'bg-sky-500',
    iconActiveColor: 'text-sky-600 dark:text-sky-400'
  },
  {
    id: 'minister',
    label: 'Ministro(a)',
    shortLabel: 'Ministro',
    icon: Mic2,
    dotColor: 'bg-rose-500',
    iconActiveColor: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'musician',
    label: 'Músico / Integrante',
    shortLabel: 'Músico',
    icon: Guitar,
    dotColor: 'bg-emerald-500',
    iconActiveColor: 'text-emerald-600 dark:text-emerald-400'
  }
];

export default function Navbar({ 
  currentRole, 
  setCurrentRole, 
  theme, 
  onToggleTheme, 
  googleDocsUrl,
  onOpenGoogleDocsModal,
  onOpenWhatsAppModal, 
  onExportData,
  syncStatus = 'synced',
  onSyncNow
}) {
  const syncDotClass =
    syncStatus === 'syncing'
      ? 'bg-amber-400 animate-pulse'
      : syncStatus === 'offline'
        ? 'bg-slate-400'
        : 'bg-emerald-500';

  const syncLabel =
    syncStatus === 'syncing'
      ? 'Sincronizando'
      : syncStatus === 'offline'
        ? 'Modo Local'
        : 'Sincronizado';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          
          {/* Brand & Context */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800/90 border border-slate-800 dark:border-slate-700/80 flex items-center justify-center shrink-0 shadow-xs">
              <Music className="w-4 h-4 text-sky-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                  LouvorSync
                </span>
                <span className="hidden xs:inline-flex items-center px-2 py-0.5 text-[11px] font-medium tabular-nums bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/70 rounded-md">
                  Nov 2026
                </span>
                {onSyncNow && (
                  <button
                    onClick={onSyncNow}
                    title="Clique para sincronizar agora com a nuvem"
                    className="hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${syncDotClass}`} />
                    <span>{syncLabel}</span>
                    <RefreshCw className={`w-2.5 h-2.5 opacity-70 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                Escalas, Setlists & Cifras do Ministério
              </p>
            </div>
          </div>

          {/* Segmented Role Switcher (Desktop & Tablet) — Concentric radius: outer rounded-lg (8px) + p-1 (4px) -> inner rounded-md (6px) */}
          <nav
            aria-label="Modo de visualização"
            className="hidden md:flex items-center bg-slate-200/60 dark:bg-slate-900/90 p-1 rounded-lg border border-slate-200/90 dark:border-slate-800/90"
          >
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = currentRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setCurrentRole(role.id)}
                  className={`flex items-center gap-2 h-8 px-3 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700/70'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-opacity ${role.dotColor} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                  <Icon className={`w-3.5 h-3.5 ${isActive ? role.iconActiveColor : 'opacity-75'}`} />
                  <span>{role.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Utility Cluster — Uniform 36px (h-9) height */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Split Control: Google Docs View + Import/Edit */}
            <div className="flex items-center h-9 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
              <a
                href={googleDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir arquivo de cifras no Google Docs"
                className="flex items-center gap-1.5 h-full px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span className="hidden lg:inline">Docs</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <button
                onClick={onOpenGoogleDocsModal}
                title="Importar músicas ou atualizar link do Google Docs"
                className="flex items-center justify-center h-full px-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-l border-slate-200/80 dark:border-slate-800 transition active:scale-[0.97]"
              >
                <FileEdit className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WhatsApp Quick Export */}
            <button
              onClick={onOpenWhatsAppModal}
              title="Gerar escala formatada para WhatsApp"
              className="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 transition active:scale-[0.98] shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Backup JSON */}
            <button
              onClick={onExportData}
              title="Exportar backup dos dados (JSON)"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 transition active:scale-[0.97]"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Mudar para Tema Claro (Planejamento)' : 'Mudar para Tema Escuro (Palco)'}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:text-slate-900 dark:hover:text-amber-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/90 dark:border-slate-800 transition active:scale-[0.97]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>

        {/* Mobile Segmented Role Switcher */}
        <div className="md:hidden pb-2.5 pt-1">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = currentRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setCurrentRole(role.id)}
                  className={`flex items-center justify-center gap-1.5 h-8 px-2 rounded-md text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700/70'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${role.dotColor} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                  <Icon className={`w-3.5 h-3.5 ${isActive ? role.iconActiveColor : 'opacity-75'}`} />
                  <span>{role.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
}
