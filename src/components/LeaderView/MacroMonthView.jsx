import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  Filter, 
  Share2, 
  X, 
  Check,
  ChevronRight
} from 'lucide-react';

const ROLE_LABELS = {
  ministration: 'Ministração (Líder)',
  vocals: 'Vocal',
  acousticGuitar: 'Violão',
  guitar1: 'Guitarra 1',
  guitar2: 'Guitarra 2',
  keyboard: 'Teclado',
  bass: 'Baixo',
  drums: 'Bateria'
};

export default function MacroMonthView({
  schedules,
  members,
  onUpdateSchedule,
  onOpenWhatsApp
}) {
  const [activeSlot, setActiveSlot] = useState(null);
  const [modalPickerOpen, setModalPickerOpen] = useState(false);
  const [filterInstrument, setFilterInstrument] = useState('ALL');

  // Compute monthly count for all members
  const memberCounts = {};
  members.forEach(m => { memberCounts[m.name] = 0; });

  schedules.forEach(sched => {
    const l = sched.lineup;
    const allAssigned = [
      l.ministration,
      ...(l.vocals || []),
      l.bass,
      l.drums,
      l.guitar1,
      l.guitar2,
      l.keyboard,
      l.acousticGuitar
    ].filter(Boolean);

    allAssigned.forEach(name => {
      memberCounts[name] = (memberCounts[name] || 0) + 1;
    });
  });

  const unassignedMembers = members.filter(m => m.active && (memberCounts[m.name] === 0));

  const handleSlotClick = (scheduleId, roleField, vocalIndex = null) => {
    const targetSchedule = schedules.find(s => s.id === scheduleId);
    if (!targetSchedule) return;

    const [, m, d] = targetSchedule.date.split('-');
    let currentName = '';
    if (roleField === 'vocals' && vocalIndex !== null) {
      currentName = (targetSchedule.lineup.vocals || [])[vocalIndex] || '';
    } else {
      currentName = targetSchedule.lineup[roleField] || '';
    }

    setActiveSlot({
      scheduleId,
      roleField,
      vocalIndex,
      currentName,
      dateFormatted: `${d}/${m}`
    });
    setModalPickerOpen(true);
  };

  const handleAssignMusicianToSlot = (musicianName) => {
    if (!activeSlot) return;
    const targetSchedule = schedules.find(s => s.id === activeSlot.scheduleId);
    if (!targetSchedule) return;

    let updatedLineup = { ...targetSchedule.lineup };

    if (activeSlot.roleField === 'vocals') {
      const vocals = [...(updatedLineup.vocals || [])];
      vocals[activeSlot.vocalIndex] = musicianName;
      updatedLineup.vocals = vocals.filter(Boolean);
    } else {
      updatedLineup[activeSlot.roleField] = musicianName;
    }

    onUpdateSchedule({
      ...targetSchedule,
      lineup: updatedLineup
    });

    setModalPickerOpen(false);
    setActiveSlot(null);
  };

  const handleClearSlot = (scheduleId, roleField, vocalIndex = null, e) => {
    if (e) e.stopPropagation();
    const targetSchedule = schedules.find(s => s.id === scheduleId);
    if (!targetSchedule) return;

    let updatedLineup = { ...targetSchedule.lineup };
    if (roleField === 'vocals' && vocalIndex !== null) {
      const vocals = [...(updatedLineup.vocals || [])];
      vocals.splice(vocalIndex, 1);
      updatedLineup.vocals = vocals;
    } else {
      updatedLineup[roleField] = '';
    }

    onUpdateSchedule({
      ...targetSchedule,
      lineup: updatedLineup
    });

    if (activeSlot?.scheduleId === scheduleId && activeSlot?.roleField === roleField) {
      setActiveSlot(null);
      setModalPickerOpen(false);
    }
  };

  const handleAddVocalSlot = (scheduleId, e) => {
    e.stopPropagation();
    const targetSchedule = schedules.find(s => s.id === scheduleId);
    if (!targetSchedule) return;

    const vocals = [...(targetSchedule.lineup.vocals || []), ''];
    onUpdateSchedule({
      ...targetSchedule,
      lineup: { ...targetSchedule.lineup, vocals }
    });

    const [, m, d] = targetSchedule.date.split('-');
    setActiveSlot({
      scheduleId,
      roleField: 'vocals',
      vocalIndex: vocals.length - 1,
      currentName: '',
      dateFormatted: `${d}/${m}`
    });
    setModalPickerOpen(true);
  };

  const filteredMembers = members.filter(m => {
    if (!m.active) return false;
    if (filterInstrument === 'ALL') return true;
    if (filterInstrument === 'VOCAL') return m.roles.includes('Vocal') || m.roles.includes('Ministração');
    if (filterInstrument === 'GUITAR') return m.roles.includes('Violão') || m.roles.includes('Guitarra');
    if (filterInstrument === 'KEYS') return m.roles.includes('Teclado');
    if (filterInstrument === 'BASS') return m.roles.includes('Baixo');
    if (filterInstrument === 'DRUMS') return m.roles.includes('Bateria');
    return true;
  });

  return (
    <div className="space-y-5">
      
      {/* Studio Context Header */}
      <div className="glass-card p-4 sm:p-5 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Painel do Líder
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Visão Geral Mensal • Novembro 2026
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Cronograma Mensal Integrado
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Visualize e edite a escala de todos os domingos em um único painel. Toque em qualquer vaga para alocar integrantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Integrantes:</span>
              <strong className="font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">{members.length}</strong>
            </div>

            <div className={`inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-xs font-semibold tabular-nums ${
              unassignedMembers.length > 0 
                ? 'bg-amber-500/[0.08] border-amber-500/30 text-amber-800 dark:text-amber-300' 
                : 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${unassignedMembers.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span>{unassignedMembers.length > 0 ? `${unassignedMembers.length} sem escala` : '100% Escalados'}</span>
            </div>

            <button
              onClick={() => onOpenWhatsApp(null)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-[0.98] shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Escala Mensal WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Unassigned Warning Strip */}
        {unassignedMembers.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span>
              <strong>Rodízio:</strong> {unassignedMembers.map(m => m.name).join(', ')} ainda não {unassignedMembers.length === 1 ? 'está escalado(a)' : 'estão escalados'} neste mês.
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: 5 Sundays Columns + Quick Musician Pool */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        
        {/* Left: 5 Sundays Grid (3 cols on XL) */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Active Slot Instruction Pill */}
          {activeSlot && (
            <div className="p-3 rounded-lg bg-sky-500/[0.08] border border-sky-500/30 flex items-center justify-between text-xs text-sky-900 dark:text-sky-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>
                  Vaga selecionada: <strong>{ROLE_LABELS[activeSlot.roleField] || activeSlot.roleField}</strong> ({activeSlot.dateFormatted}).
                  {activeSlot.currentName ? ` Atual: ${activeSlot.currentName}` : ' Vaga livre.'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalPickerOpen(true)}
                  className="inline-flex items-center h-7 px-2.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-semibold transition active:scale-[0.98]"
                >
                  Alterar
                </button>
                <button
                  onClick={() => setActiveSlot(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* 5 Sundays Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {schedules.map((schedule) => {
              const [, month, day] = schedule.date.split('-');
              const l = schedule.lineup;

              return (
                <div 
                  key={schedule.id}
                  className="glass-card rounded-xl p-3 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-2.5"
                >
                  {/* Column Header */}
                  <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold tabular-nums text-sky-700 dark:text-sky-300">
                        Dom {day}/{month}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                        {schedule.songs?.length || 0} músicas
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5" title={schedule.title}>
                      {schedule.title}
                    </p>
                  </div>

                  {/* Lineup Slots */}
                  <div className="space-y-1.5 text-xs flex-1">
                    
                    {/* Ministração */}
                    <div
                      onClick={() => handleSlotClick(schedule.id, 'ministration')}
                      className={`p-2 rounded-lg border cursor-pointer transition ${
                        activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'ministration'
                          ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                          : l.ministration
                            ? 'bg-rose-500/[0.05] border-rose-500/25 text-rose-900 dark:text-rose-200'
                            : 'border-dashed border-slate-300 dark:border-slate-700/80 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-600 dark:text-rose-400">
                          Ministração
                        </span>
                        {l.ministration && (
                          <button
                            onClick={(e) => handleClearSlot(schedule.id, 'ministration', null, e)}
                            className="text-slate-400 hover:text-rose-600 p-0.5"
                            title="Limpar vaga"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <span className="font-bold block truncate mt-0.5 text-slate-900 dark:text-slate-100">
                        {l.ministration || '+ Definir ministro'}
                      </span>
                    </div>

                    {/* Vocais */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase px-0.5">
                        <span>Vocais ({l.vocals?.length || 0})</span>
                        <button
                          onClick={(e) => handleAddVocalSlot(schedule.id, e)}
                          className="text-sky-600 dark:text-sky-400 hover:underline font-bold"
                          title="Adicionar vaga de vocal"
                        >
                          + vaga
                        </button>
                      </div>

                      {(l.vocals || []).map((vocalName, vIdx) => (
                        <div
                          key={vIdx}
                          onClick={() => handleSlotClick(schedule.id, 'vocals', vIdx)}
                          className={`p-1.5 rounded-md border cursor-pointer transition flex items-center justify-between ${
                            activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'vocals' && activeSlot?.vocalIndex === vIdx
                              ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                              : vocalName
                                ? 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                                : 'border-dashed border-slate-300 dark:border-slate-700/80 text-slate-400 hover:border-slate-400'
                          }`}
                        >
                          <span className="truncate text-[11px]">
                            {vocalName || `+ Vocal ${vIdx + 1}`}
                          </span>
                          <button
                            onClick={(e) => handleClearSlot(schedule.id, 'vocals', vIdx, e)}
                            className="text-slate-400 hover:text-rose-500 ml-1 text-sm leading-none p-0.5"
                            title="Remover vocal"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Instruments */}
                    <div className="space-y-1 pt-1 border-t border-slate-200/70 dark:border-slate-800/70">
                      
                      {/* Violão */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'acousticGuitar')}
                        className={`p-1.5 rounded-md border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'acousticGuitar'
                            ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">Violão:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[105px] text-slate-800 dark:text-slate-200">
                          {l.acousticGuitar || <span className="text-slate-400 font-normal italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Guitarra 1 */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'guitar1')}
                        className={`p-1.5 rounded-md border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'guitar1'
                            ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">Guitarra 1:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[105px] text-slate-800 dark:text-slate-200">
                          {l.guitar1 || <span className="text-slate-400 font-normal italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Guitarra 2 (if assigned) */}
                      {l.guitar2 && (
                        <div
                          onClick={() => handleSlotClick(schedule.id, 'guitar2')}
                          className="p-1.5 rounded-md border bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-[10px] text-slate-400">Guitarra 2:</span>
                          <span className="font-semibold text-[11px] truncate max-w-[105px] text-slate-800 dark:text-slate-200">{l.guitar2}</span>
                        </div>
                      )}

                      {/* Teclado */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'keyboard')}
                        className={`p-1.5 rounded-md border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'keyboard'
                            ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">Teclado:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[105px] text-slate-800 dark:text-slate-200">
                          {l.keyboard || <span className="text-slate-400 font-normal italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Baixo */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'bass')}
                        className={`p-1.5 rounded-md border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'bass'
                            ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">Baixo:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[105px] text-slate-800 dark:text-slate-200">
                          {l.bass || <span className="text-slate-400 font-normal italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Bateria */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'drums')}
                        className={`p-1.5 rounded-md border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'drums'
                            ? 'border-sky-500 bg-sky-500/[0.1] ring-1 ring-sky-500/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">Bateria:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[105px] text-slate-800 dark:text-slate-200">
                          {l.drums || <span className="text-slate-400 font-normal italic">+ Vazio</span>}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Confirmed Count Footer */}
                  <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                    <span>Confirmados:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {schedule.confirmedMembers?.length || 0}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Quick Musician Pool ("Banco de Músicos") */}
        <div className="glass-card rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-3.5 sticky top-20">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span>Banco de Integrantes</span>
              </h2>
              <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredMembers.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {activeSlot 
                ? '👉 Toque no integrante para escalá-lo na vaga selecionada' 
                : 'Toque em uma vaga no painel para alocar'}
            </p>
          </div>

          {/* Instrument Filter Bar */}
          <div className="flex flex-wrap gap-1 border-b border-slate-200/70 dark:border-slate-800/70 pb-2.5">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'VOCAL', label: 'Voz' },
              { id: 'GUITAR', label: 'Violão/Guitarra' },
              { id: 'KEYS', label: 'Teclado' },
              { id: 'BASS', label: 'Baixo' },
              { id: 'DRUMS', label: 'Bateria' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterInstrument(f.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
                  filterInstrument === f.id
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Members List */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {filteredMembers.map(member => {
              const count = memberCounts[member.name] || 0;
              const isUnassigned = count === 0;

              return (
                <button
                  key={member.id}
                  onClick={() => handleAssignMusicianToSlot(member.name)}
                  className={`w-full p-2.5 rounded-lg border text-left transition flex items-center justify-between group active:scale-[0.99] ${
                    activeSlot
                      ? 'hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 cursor-pointer shadow-2xs'
                      : 'cursor-pointer'
                  } ${
                    isUnassigned
                      ? 'border-amber-400/80 bg-amber-500/[0.05]'
                      : 'border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        {member.name}
                      </span>
                      {isUnassigned && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Sem escala no mês" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block mt-0.5">
                      {member.roles.join(', ')}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono tabular-nums font-bold ${
                      count >= 4 
                        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' 
                        : isUnassigned
                          ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 font-extrabold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {count} {count === 1 ? 'escala' : 'escalas'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Quick Musician Assignment Modal */}
      {modalPickerOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tabular-nums text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Domingo {activeSlot.dateFormatted}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                  Vaga: {ROLE_LABELS[activeSlot.roleField] || activeSlot.roleField}
                </h3>
                {activeSlot.currentName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Atual: <strong className="text-slate-800 dark:text-slate-200">{activeSlot.currentName}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => { setModalPickerOpen(false); setActiveSlot(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="p-2.5 bg-slate-100/70 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-1">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'VOCAL', label: 'Vocais' },
                { id: 'GUITAR', label: 'Violão/Guitarra' },
                { id: 'KEYS', label: 'Teclado' },
                { id: 'BASS', label: 'Baixo' },
                { id: 'DRUMS', label: 'Bateria' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterInstrument(f.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                    filterInstrument === f.id
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Musician List with 1-tap select */}
            <div className="p-3 overflow-y-auto max-h-[55vh] space-y-1.5">
              {filteredMembers.map(member => {
                const count = memberCounts[member.name] || 0;
                const isSelected = activeSlot.currentName === member.name;
                const isUnassigned = count === 0;

                return (
                  <button
                    key={member.id}
                    onClick={() => handleAssignMusicianToSlot(member.name)}
                    className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition active:scale-[0.99] ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/[0.08] ring-1 ring-emerald-500/30'
                        : isUnassigned
                          ? 'border-amber-400/80 bg-amber-500/[0.05] hover:border-amber-500'
                          : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-sky-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {member.name}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500 text-white">
                            Escalado
                          </span>
                        )}
                        {isUnassigned && !isSelected && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                            Sem escala
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {member.roles.join(', ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums font-bold ${
                        count >= 4 
                          ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {count} {count === 1 ? 'escala' : 'escalas'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between">
              {activeSlot.currentName ? (
                <button
                  onClick={() => handleClearSlot(activeSlot.scheduleId, activeSlot.roleField, activeSlot.vocalIndex)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition"
                >
                  Deixar Vaga Vazia
                </button>
              ) : <div />}
              <button
                onClick={() => { setModalPickerOpen(false); setActiveSlot(null); }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
