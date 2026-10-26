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
  Check
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
  // Currently focused slot for quick one-click assignment: { scheduleId, roleField, vocalIndex, currentName, dateFormatted }
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

  // Open the quick picker modal when tapping any slot (especially helpful on mobile!)
  const handleSlotClick = (scheduleId, roleField, vocalIndex = null) => {
    const targetSchedule = schedules.find(s => s.id === scheduleId);
    if (!targetSchedule) return;

    const [y, m, d] = targetSchedule.date.split('-');
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

  // Assign a musician to the slot
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

    const [y, m, d] = targetSchedule.date.split('-');
    setActiveSlot({
      scheduleId,
      roleField: 'vocals',
      vocalIndex: vocals.length - 1,
      currentName: '',
      dateFormatted: `${d}/${m}`
    });
    setModalPickerOpen(true);
  };

  // Filtered members
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
    <div className="space-y-6">
      
      {/* Top Stats Banner */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl border-sky-500/20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30">
                Painel Geral Macro do Mês
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Novembro 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-tight">
              Cronograma Mensal Integrado
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Visualize todos os domingos simultaneamente. Toque em qualquer vaga para abrir a lista de integrantes e escalar rapidamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="block text-[10px] text-slate-500 uppercase font-semibold">Integrantes</span>
              <span className="text-base font-bold text-sky-600 dark:text-sky-400">{members.length}</span>
            </div>
            <div className={`px-3 py-2 rounded-xl border text-center ${
              unassignedMembers.length > 0 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/50 text-amber-700 dark:text-amber-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
            }`}>
              <span className="block text-[10px] uppercase font-semibold">Sem Escala</span>
              <span className="text-base font-bold">{unassignedMembers.length}</span>
            </div>
            <button
              onClick={() => onOpenWhatsApp(null)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
            >
              <Share2 className="w-4 h-4" />
              <span>Escala Mensal WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Missing / Unassigned Alert if any */}
        {unassignedMembers.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Atenção para o rodízio:</strong> {unassignedMembers.map(m => m.name).join(', ')} ainda não {unassignedMembers.length === 1 ? 'foi escalado' : 'foram escalados'} em Novembro.
            </span>
          </div>
        )}
      </div>

      {/* Main Container: 5 Sundays Grid (Left) + Quick Musician Pool (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left: 5 Sundays Macro Board (3 Cols on XL) */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Active slot high-contrast instruction bar */}
          {activeSlot && (
            <div className="p-3.5 rounded-xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 flex items-center justify-between text-xs text-sky-950 dark:text-sky-200 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>
                  Vaga selecionada: <strong>{ROLE_LABELS[activeSlot.roleField] || activeSlot.roleField}</strong> ({activeSlot.dateFormatted}). 
                  {activeSlot.currentName ? ` Atual: ${activeSlot.currentName}` : ' Vaga livre.'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setModalPickerOpen(true)}
                  className="px-2.5 py-1 rounded bg-sky-600 text-white text-[11px] font-bold hover:bg-sky-500 shadow-xs"
                >
                  Trocar Integrante
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

          {/* 5 Sundays Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {schedules.map((schedule) => {
              const [year, month, day] = schedule.date.split('-');
              const l = schedule.lineup;

              return (
                <div 
                  key={schedule.id}
                  className="glass-card rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 transition-all flex flex-col justify-between space-y-3"
                >
                  {/* Column Header */}
                  <div className="border-b dark:border-slate-800 border-slate-200 pb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                        Dom {day}/{month}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {schedule.songs?.length || 0} músicas
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5" title={schedule.title}>
                      {schedule.title}
                    </p>
                  </div>

                  {/* Slot Items */}
                  <div className="space-y-2 text-xs flex-1">
                    
                    {/* Ministração */}
                    <div
                      onClick={() => handleSlotClick(schedule.id, 'ministration')}
                      className={`p-2 rounded-lg border cursor-pointer transition ${
                        activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'ministration'
                          ? 'border-amber-500 bg-amber-100/70 dark:bg-amber-950/60 ring-2 ring-amber-400'
                          : l.ministration
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/40 text-amber-900 dark:text-amber-300'
                            : 'border-dashed border-slate-300 dark:border-slate-800 text-slate-500 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-800 dark:text-amber-300">🎤 Ministração</span>
                        {l.ministration && (
                          <button
                            onClick={(e) => handleClearSlot(schedule.id, 'ministration', null, e)}
                            className="text-slate-400 hover:text-red-500 p-0.5"
                            title="Limpar vaga"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <span className="font-bold block truncate mt-0.5 text-slate-900 dark:text-white">
                        {l.ministration || '+ Definir ministro'}
                      </span>
                    </div>

                    {/* Vocais */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-semibold uppercase px-0.5">
                        <span>🎶 Vocais ({l.vocals?.length || 0})</span>
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
                          className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                            activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'vocals' && activeSlot?.vocalIndex === vIdx
                              ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-400'
                              : vocalName
                                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-medium'
                                : 'border-dashed border-slate-300 dark:border-slate-800 text-slate-400 hover:border-sky-400'
                          }`}
                        >
                          <span className="truncate text-[11px]">
                            {vocalName || `+ Vocal ${vIdx + 1}`}
                          </span>
                          <button
                            onClick={(e) => handleClearSlot(schedule.id, 'vocals', vIdx, e)}
                            className="text-slate-400 hover:text-red-500 ml-1 text-sm leading-none p-0.5"
                            title="Remover vocal"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Instrumentos Essenciais */}
                    <div className="space-y-1 pt-1 border-t dark:border-slate-800/80 border-slate-200">
                      
                      {/* Violão */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'acousticGuitar')}
                        className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'acousticGuitar'
                            ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500">Violão:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[100px] text-slate-900 dark:text-slate-100">
                          {l.acousticGuitar || <span className="text-slate-400 italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Guitarras */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'guitar1')}
                        className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'guitar1'
                            ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500">Guitarra 1:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[100px] text-slate-900 dark:text-slate-100">
                          {l.guitar1 || <span className="text-slate-400 italic">+ Vazio</span>}
                        </span>
                      </div>

                      {l.guitar2 && (
                        <div
                          onClick={() => handleSlotClick(schedule.id, 'guitar2')}
                          className="p-1.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-[10px] text-slate-500">Guitarra 2:</span>
                          <span className="font-semibold text-[11px] truncate max-w-[100px] text-slate-900 dark:text-slate-100">{l.guitar2}</span>
                        </div>
                      )}

                      {/* Teclado */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'keyboard')}
                        className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'keyboard'
                            ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500">Teclado:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[100px] text-slate-900 dark:text-slate-100">
                          {l.keyboard || <span className="text-slate-400 italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Baixo */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'bass')}
                        className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'bass'
                            ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500">Baixo:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[100px] text-slate-900 dark:text-slate-100">
                          {l.bass || <span className="text-slate-400 italic">+ Vazio</span>}
                        </span>
                      </div>

                      {/* Bateria */}
                      <div
                        onClick={() => handleSlotClick(schedule.id, 'drums')}
                        className={`p-1.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                          activeSlot?.scheduleId === schedule.id && activeSlot?.roleField === 'drums'
                            ? 'border-sky-500 bg-sky-100 dark:bg-sky-950/60 ring-2 ring-sky-400'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="text-[10px] text-slate-500">Bateria:</span>
                        <span className="font-semibold text-[11px] truncate max-w-[100px] text-slate-900 dark:text-slate-100">
                          {l.drums || <span className="text-slate-400 italic">+ Vazio</span>}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Confirmed Count Badge */}
                  <div className="pt-2 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
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

        {/* Right: Quick Musician Pool ("Banco Rápido de Músicos") */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4 sticky top-24">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-500" />
                <span>Banco de Músicos</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {filteredMembers.length} membros
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {activeSlot 
                ? '👉 Toque no músico para escalá-lo na vaga selecionada!' 
                : 'Toque em uma vaga no calendário à esquerda para escalar.'}
            </p>
          </div>

          {/* Instrument Filter Buttons */}
          <div className="flex flex-wrap gap-1 border-b dark:border-slate-800 border-slate-200 pb-3">
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
                className={`px-2 py-1 rounded text-[10px] font-semibold transition ${
                  filterInstrument === f.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Members Clickable List */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {filteredMembers.map(member => {
              const count = memberCounts[member.name] || 0;
              const isUnassigned = count === 0;

              return (
                <button
                  key={member.id}
                  onClick={() => handleAssignMusicianToSlot(member.name)}
                  className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between group ${
                    activeSlot
                      ? 'hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 cursor-pointer shadow-xs'
                      : 'cursor-pointer'
                  } ${
                    isUnassigned
                      ? 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate group-hover:text-sky-600">
                        {member.name}
                      </span>
                      {isUnassigned && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Sem escala no mês" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                      {member.roles.join(', ')}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      count >= 4 
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400' 
                        : isUnassigned
                          ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-extrabold'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

      {/* Interactive Musician Selection Modal (Touch-friendly & ideal for mobile!) */}
      {modalPickerOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Escalar para Domingo {activeSlot.dateFormatted}
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Vaga: {ROLE_LABELS[activeSlot.roleField] || activeSlot.roleField}
                </h3>
                {activeSlot.currentName && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atual escalado(a): <strong className="text-slate-800 dark:text-slate-200">{activeSlot.currentName}</strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => { setModalPickerOpen(false); setActiveSlot(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="p-3 bg-slate-100 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1">
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    filterInstrument === f.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Musician List with 1-tap select */}
            <div className="p-3 overflow-y-auto max-h-[60vh] space-y-2">
              {filteredMembers.map(member => {
                const count = memberCounts[member.name] || 0;
                const isSelected = activeSlot.currentName === member.name;
                const isUnassigned = count === 0;

                return (
                  <button
                    key={member.id}
                    onClick={() => handleAssignMusicianToSlot(member.name)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-400'
                        : isUnassigned
                          ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/20 hover:border-amber-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-sky-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {member.name}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                            Escalado
                          </span>
                        )}
                        {isUnassigned && !isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                            Sem escala
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {member.roles.join(', ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                        count >= 4 
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400' 
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
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              {activeSlot.currentName && (
                <button
                  onClick={() => handleClearSlot(activeSlot.scheduleId, activeSlot.roleField, activeSlot.vocalIndex)}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                >
                  Deixar Vaga Vazia
                </button>
              )}
              <button
                onClick={() => { setModalPickerOpen(false); setActiveSlot(null); }}
                className="ml-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900"
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
