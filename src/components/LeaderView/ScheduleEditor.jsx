import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle2,
  Share2,
  ChevronRight,
  Music
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
  const [isEditingRehearsal, setIsEditingRehearsal] = useState(false);

  const activeSchedule = schedules.find(s => s.id === selectedScheduleId) || schedules[0];

  // Calculate monthly stats per member (to help leader balance schedules)
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Stats & Instructions */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30">
                Painel da Liderança
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Novembro 2026 ({schedules.length} Cultos)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gestão da Escala de Músicos
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Monte a escala de cada fim de semana, distribua os instrumentos e defina as informações de ensaio da semana.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenWhatsApp(activeSchedule)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" />
              <span>Gerar p/ WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Date Tabs (Horizontal Scroll on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {schedules.map((sched) => {
          const isSelected = sched.id === selectedScheduleId;
          const [year, month, day] = sched.date.split('-');
          return (
            <button
              key={sched.id}
              onClick={() => setSelectedScheduleId(sched.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-200 ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs'
              }`}
            >
              <div className={`p-2 rounded-lg text-center ${isSelected ? 'bg-white text-sky-700 font-extrabold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                <span className="block text-[10px] font-bold uppercase leading-none">Dom</span>
                <span className="block text-sm font-extrabold leading-none mt-1">{day}/{month}</span>
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {sched.lineup.ministration ? `Min: ${sched.lineup.ministration}` : 'A definir'}
                </p>
                <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {sched.songs?.length || 0} músicas • {sched.confirmedMembers?.length || 0} cientes
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Schedule Builder */}
      {activeSchedule && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Lineup Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header of Active Sunday */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Domingo, {activeSchedule.date.split('-').reverse().join('/')}
                    </h3>
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
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                    {activeSchedule.confirmedMembers?.length || 0} de {
                      [
                        activeSchedule.lineup.ministration,
                        ...(activeSchedule.lineup.vocals || []),
                        activeSchedule.lineup.bass,
                        activeSchedule.lineup.drums,
                        activeSchedule.lineup.guitar1,
                        activeSchedule.lineup.guitar2,
                        activeSchedule.lineup.keyboard,
                        activeSchedule.lineup.acousticGuitar
                      ].filter(Boolean).length
                    }
                  </span>
                </div>
              </div>

              {/* Lineup Fields Grid */}
              <div className="space-y-4">
                
                {/* Ministração (Worship Leader) */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                      🎤
                    </div>
                    <div>
                      <label className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                        Ministração (Líder do Culto)
                      </label>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Responsável por escolher o repertório e cifras</span>
                    </div>
                  </div>
                  <select
                    value={activeSchedule.lineup.ministration || ''}
                    onChange={(e) => handleLineupChange('ministration', e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-sm focus:border-amber-500 focus:outline-none shadow-xs"
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
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎶</span>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Vocais
                      </label>
                    </div>
                    <button
                      onClick={handleAddVocalSlot}
                      className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Vocal</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(activeSchedule.lineup.vocals || []).map((vocalName, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={vocalName}
                          onChange={(e) => handleVocalChange(idx, e.target.value)}
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:border-sky-500 focus:outline-none font-medium"
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
                          className="p-1.5 text-slate-400 hover:text-red-500 transition"
                          title="Remover vaga de vocal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instrumentos - 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Violão */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      🎸 Violão:
                    </span>
                    <select
                      value={activeSchedule.lineup.acousticGuitar || ''}
                      onChange={(e) => handleLineupChange('acousticGuitar', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none max-w-[170px] font-medium"
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
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      🎹 Teclado:
                    </span>
                    <select
                      value={activeSchedule.lineup.keyboard || ''}
                      onChange={(e) => handleLineupChange('keyboard', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none max-w-[170px] font-medium"
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
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      ⚡ Guitarra 1:
                    </span>
                    <select
                      value={activeSchedule.lineup.guitar1 || ''}
                      onChange={(e) => handleLineupChange('guitar1', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none max-w-[170px] font-medium"
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
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      ⚡ Guitarra 2:
                    </span>
                    <select
                      value={activeSchedule.lineup.guitar2 || ''}
                      onChange={(e) => handleLineupChange('guitar2', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none max-w-[170px] font-medium"
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
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      🎸 Baixo:
                    </span>
                    <select
                      value={activeSchedule.lineup.bass || ''}
                      onChange={(e) => handleLineupChange('bass', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none max-w-[170px] font-medium"
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
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      🥁 Bateria:
                    </span>
                    <select
                      value={activeSchedule.lineup.drums || ''}
                      onChange={(e) => handleLineupChange('drums', e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-sky-500 focus:outline-none max-w-[170px] font-medium"
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

            {/* Ensaio da Semana Settings ("Os ensaios continuam sendo definidos durante a semana") */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Ensaio da Semana
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Informações para o grupo de WhatsApp e painel do músico
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Data do Ensaio</label>
                  <input
                    type="date"
                    value={activeSchedule.rehearsal?.date || ''}
                    onChange={(e) => handleRehearsalChange('date', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Horário</label>
                  <input
                    type="time"
                    value={activeSchedule.rehearsal?.time || '16:00'}
                    onChange={(e) => handleRehearsalChange('time', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Local</label>
                  <input
                    type="text"
                    value={activeSchedule.rehearsal?.location || 'Templo Principal'}
                    onChange={(e) => handleRehearsalChange('location', e.target.value)}
                    placeholder="Ex: Templo Principal"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none font-medium"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Avisos ou Observações</label>
                  <input
                    type="text"
                    value={activeSchedule.rehearsal?.notes || ''}
                    onChange={(e) => handleRehearsalChange('notes', e.target.value)}
                    placeholder="Ex: Chegar 15 minutos antes para afinar instrumentos"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:border-indigo-400 focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Sidebar: Frequency Monitor & Repertoire quick check */}
          <div className="space-y-6">
            
            {/* Monthly Load / Frequency Balance Card */}
            <div className="glass-card p-5 rounded-2xl">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
                <span>Escalas no Mês</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Novembro 2026</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Monitore a carga para evitar sobrecarregar integrantes.
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {Object.entries(memberCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => {
                    const isHigh = count >= 4;
                    return (
                      <div 
                        key={name}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs shadow-xs"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            isHigh ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}>
                            {count} {count === 1 ? 'escala' : 'escalas'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Repertoire Status for this Sunday */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-sky-500" />
                  <span>Repertório da Semana</span>
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
                  {activeSchedule.songs?.length || 0} músicas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                O ministro(a) <strong className="text-amber-700 dark:text-amber-300">{activeSchedule.lineup.ministration || 'definido'}</strong> define as músicas e referências do YouTube.
              </p>

              <div className="space-y-2">
                {(activeSchedule.songs || []).map((song, i) => (
                  <div 
                    key={song.id || i}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="truncate">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{song.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{song.artist}</p>
                    </div>
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-900">
                      {song.key}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => onSelectScheduleForDetails(activeSchedule)}
                  className="w-full mt-3 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Gerenciar Músicas & YouTube</span>
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
