import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Users, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  ChevronRight, 
  Music,
  Mic2
} from 'lucide-react';

export default function ScheduleEditor({ 
  schedules, 
  members, 
  onUpdateSchedule, 
  onAddSchedule, 
  onDeleteSchedule,
  onSelectScheduleForDetails,
  onOpenWhatsApp
}) {
  const [selectedScheduleId, setSelectedScheduleId] = useState(schedules[0]?.id || '');

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  // Calculate monthly stats per member
  const memberCounts = {};
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

  const handleLineupChange = (field, value) => {
    if (!activeSchedule) return;
    const updatedLineup = { ...activeSchedule.lineup, [field]: value };
    onUpdateSchedule({
      ...activeSchedule,
      lineup: updatedLineup
    });
  };

  const handleVocalChange = (index, value) => {
    if (!activeSchedule) return;
    const currentVocals = [...(activeSchedule.lineup.vocals || [])];
    currentVocals[index] = value;
    handleLineupChange('vocals', currentVocals.filter(Boolean));
  };

  const handleAddVocalSlot = () => {
    if (!activeSchedule) return;
    const currentVocals = [...(activeSchedule.lineup.vocals || []), ''];
    handleLineupChange('vocals', currentVocals);
  };

  const handleRemoveVocalSlot = (idx) => {
    if (!activeSchedule) return;
    const currentVocals = (activeSchedule.lineup.vocals || []).filter((_, i) => i !== idx);
    handleLineupChange('vocals', currentVocals);
  };

  const handleRehearsalChange = (field, value) => {
    if (!activeSchedule) return;
    onUpdateSchedule({
      ...activeSchedule,
      rehearsal: {
        ...(activeSchedule.rehearsal || {}),
        [field]: value
      }
    });
  };

  const assignedCount = [
    activeSchedule?.lineup.ministration,
    ...(activeSchedule?.lineup.vocals || []),
    activeSchedule?.lineup.bass,
    activeSchedule?.lineup.drums,
    activeSchedule?.lineup.guitar1,
    activeSchedule?.lineup.guitar2,
    activeSchedule?.lineup.keyboard,
    activeSchedule?.lineup.acousticGuitar
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      
      {/* Studio Header Card */}
      <div className="glass-card p-4 sm:p-5 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                Edição Detalhada da Escala
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Novembro 2026 • {schedules.length} Cultos
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Gestão de Escalas & Ensaios
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Defina o ministro, distribua os instrumentos por domingo e cadastre o dia/local do ensaio.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onOpenWhatsApp(activeSchedule)}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-[0.98] shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Escala p/ WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Sunday Selector Strip */}
      <div 
        role="tablist"
        aria-label="Domingos para edição detalhada"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
      >
        {schedules.map((sched) => {
          const isSelected = sched.id === selectedScheduleId;
          const [, month, day] = sched.date.split('-');
          const ministerName = sched.lineup.ministration ? `Min: ${sched.lineup.ministration}` : 'A definir';

          return (
            <button
              key={sched.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedScheduleId(sched.id)}
              className={`group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-sky-500/80 dark:border-sky-400/70 ring-1 ring-sky-500/20 dark:ring-sky-400/20 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Date Block */}
              <div
                className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 tabular-nums border transition-colors ${
                  isSelected
                    ? 'bg-sky-500/10 dark:bg-sky-400/10 border-sky-500/30 dark:border-sky-400/30 text-sky-700 dark:text-sky-300'
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
                  {sched.songs?.length || 0} músicas • {sched.confirmedMembers?.length || 0} cientes
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Schedule Builder */}
      {activeSchedule && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          
          {/* Main Lineup Column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* Header of Active Sunday */}
            <div className="glass-card p-4 sm:p-5 rounded-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Domingo, {activeSchedule.date.split('-').reverse().join('/')}
                    </h2>
                    <input
                      type="text"
                      value={activeSchedule.title}
                      onChange={(e) => onUpdateSchedule({ ...activeSchedule, title: e.target.value })}
                      placeholder="Título do culto (ex: Culto de Celebração)"
                      className="bg-transparent text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 focus:outline-none focus:border-b border-sky-500/50 mt-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Presenças confirmadas:
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>{activeSchedule.confirmedMembers?.length || 0} de {assignedCount}</span>
                  </span>
                </div>
              </div>

              {/* Lineup Fields Grid */}
              <div className="space-y-3.5">
                
                {/* Ministração (Worship Leader) */}
                <div className="p-3 rounded-lg bg-rose-500/[0.04] dark:bg-rose-500/[0.06] border border-rose-500/20 dark:border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      <Mic2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                        Ministração (Líder do Culto)
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Responsável pelo repertório, tons e cifras
                      </span>
                    </div>
                  </div>
                  <select
                    value={activeSchedule.lineup.ministration || ''}
                    onChange={(e) => handleLineupChange('ministration', e.target.value)}
                    className="h-9 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 text-xs font-semibold focus:border-rose-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">Selecione o ministro...</option>
                    {members.filter(m => m.active).map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({memberCounts[m.name] || 0}x no mês)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vocais */}
                <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Vocais
                    </label>
                    <button
                      onClick={handleAddVocalSlot}
                      className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Vocal</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(activeSchedule.lineup.vocals || []).map((vocalName, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <select
                          value={vocalName}
                          onChange={(e) => handleVocalChange(idx, e.target.value)}
                          className="flex-1 h-8 bg-white dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-md px-2.5 text-xs font-medium focus:border-sky-500 focus:outline-none cursor-pointer"
                        >
                          <option value="">Selecione vocal {idx + 1}...</option>
                          {members.filter(m => m.active).map(m => (
                            <option key={m.id} value={m.name}>
                              {m.name} ({memberCounts[m.name] || 0}x)
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveVocalSlot(idx)}
                          className="flex items-center justify-center w-8 h-8 text-slate-400 hover:text-rose-600 rounded-md transition"
                          title="Remover vaga de vocal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instruments Grid (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* Violão */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Violão:
                    </span>
                    <select
                      value={activeSchedule.lineup.acousticGuitar || ''}
                      onChange={(e) => handleLineupChange('acousticGuitar', e.target.value)}
                      className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 text-xs focus:border-sky-500 focus:outline-none max-w-[160px] font-medium"
                    >
                      <option value="">Selecione...</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({memberCounts[m.name] || 0}x)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Teclado */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Teclado:
                    </span>
                    <select
                      value={activeSchedule.lineup.keyboard || ''}
                      onChange={(e) => handleLineupChange('keyboard', e.target.value)}
                      className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 text-xs focus:border-sky-500 focus:outline-none max-w-[160px] font-medium"
                    >
                      <option value="">Selecione...</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({memberCounts[m.name] || 0}x)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Guitarra 1 */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Guitarra 1:
                    </span>
                    <select
                      value={activeSchedule.lineup.guitar1 || ''}
                      onChange={(e) => handleLineupChange('guitar1', e.target.value)}
                      className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 text-xs focus:border-sky-500 focus:outline-none max-w-[160px] font-medium"
                    >
                      <option value="">Selecione...</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({memberCounts[m.name] || 0}x)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Guitarra 2 */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Guitarra 2:
                    </span>
                    <select
                      value={activeSchedule.lineup.guitar2 || ''}
                      onChange={(e) => handleLineupChange('guitar2', e.target.value)}
                      className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 text-xs focus:border-sky-500 focus:outline-none max-w-[160px] font-medium"
                    >
                      <option value="">(Nenhum / Opcional)</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({memberCounts[m.name] || 0}x)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Baixo */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Baixo:
                    </span>
                    <select
                      value={activeSchedule.lineup.bass || ''}
                      onChange={(e) => handleLineupChange('bass', e.target.value)}
                      className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 text-xs focus:border-sky-500 focus:outline-none max-w-[160px] font-medium"
                    >
                      <option value="">Selecione...</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({memberCounts[m.name] || 0}x)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bateria */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Bateria:
                    </span>
                    <select
                      value={activeSchedule.lineup.drums || ''}
                      onChange={(e) => handleLineupChange('drums', e.target.value)}
                      className="h-8 bg-slate-50 dark:bg-slate-950 border border-slate-300/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2 text-xs focus:border-sky-500 focus:outline-none max-w-[160px] font-medium"
                    >
                      <option value="">Selecione...</option>
                      {members.filter(m => m.active).map(m => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({memberCounts[m.name] || 0}x)
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

              </div>
            </div>

            {/* Ensaio da Semana Settings */}
            <div className="glass-card p-4 sm:p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Ensaio da Semana
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sincronizado automaticamente no painel dos músicos e na mensagem do WhatsApp
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Data do Ensaio</label>
                  <input
                    type="date"
                    value={activeSchedule.rehearsal?.date || ''}
                    onChange={(e) => handleRehearsalChange('date', e.target.value)}
                    className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 text-xs focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Horário</label>
                  <input
                    type="time"
                    value={activeSchedule.rehearsal?.time || '16:00'}
                    onChange={(e) => handleRehearsalChange('time', e.target.value)}
                    className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 text-xs focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Local</label>
                  <input
                    type="text"
                    value={activeSchedule.rehearsal?.location || 'Templo Principal'}
                    onChange={(e) => handleRehearsalChange('location', e.target.value)}
                    placeholder="Ex: Templo Principal"
                    className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Avisos ou Observações</label>
                  <input
                    type="text"
                    value={activeSchedule.rehearsal?.notes || ''}
                    onChange={(e) => handleRehearsalChange('notes', e.target.value)}
                    placeholder="Ex: Chegar 15 minutos antes para afinar instrumentos"
                    className="w-full h-9 bg-slate-50 dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar: Frequency Monitor & Repertoire quick check */}
          <div className="space-y-5">
            
            {/* Monthly Load Monitor Card */}
            <div className="glass-card p-4 sm:p-5 rounded-xl space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Frequência no Mês
                  </h3>
                  <span className="text-[11px] font-mono tabular-nums text-slate-400">
                    Nov 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Evite sobrecarregar integrantes com mais de 3 escalas.
                </p>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {Object.entries(memberCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => {
                    const isHigh = count >= 4;
                    return (
                      <div 
                        key={name}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs shadow-2xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums font-bold ${
                          isHigh 
                            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          {count} {count === 1 ? 'escala' : 'escalas'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Repertoire Status Card */}
            <div className="glass-card p-4 sm:p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Repertório do Culto
                  </h3>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[11px] font-semibold tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeSchedule.songs?.length || 0}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ministro: <strong className="text-slate-800 dark:text-slate-200">{activeSchedule.lineup.ministration || 'A definir'}</strong>
              </p>

              <div className="space-y-1.5">
                {(activeSchedule.songs || []).map((song, i) => (
                  <div 
                    key={song.id || i}
                    className="p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{song.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <span className="font-mono font-bold text-[11px] tabular-nums text-sky-700 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      {song.key}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => onSelectScheduleForDetails(activeSchedule)}
                  className="w-full mt-2 h-9 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <span>Gerenciar no Painel do Ministro</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
