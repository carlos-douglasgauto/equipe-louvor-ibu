import React, { useState } from 'react';
import { Users, UserPlus, Phone, Check, Trash2, Edit2, ShieldAlert, X } from 'lucide-react';

const AVAILABLE_ROLES = [
  'Ministração',
  'Vocal',
  'Violão',
  'Guitarra',
  'Teclado',
  'Baixo',
  'Bateria'
];

export default function MembersManager({ members, onUpdateMembers, schedules }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    roles: ['Vocal'],
    active: true
  });

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

  const handleToggleRole = (role) => {
    setNewMember(prev => {
      const exists = prev.roles.includes(role);
      return {
        ...prev,
        roles: exists ? prev.roles.filter(r => r !== role) : [...prev.roles, role]
      };
    });
  };

  const handleSaveNewMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    const created = {
      id: 'm_' + Date.now(),
      name: newMember.name.trim(),
      phone: newMember.phone.trim() || '',
      roles: newMember.roles.length > 0 ? newMember.roles : ['Vocal'],
      active: true
    };

    onUpdateMembers([...members, created]);
    setNewMember({ name: '', phone: '', roles: ['Vocal'], active: true });
    setIsAdding(false);
  };

  const handleDeleteMember = (id) => {
    if (confirm('Tem certeza que deseja remover este integrante?')) {
      onUpdateMembers(members.filter(m => m.id !== id));
    }
  };

  const handleToggleActive = (id) => {
    onUpdateMembers(members.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  return (
    <div className="space-y-5">
      
      {/* Studio Context Header */}
      <div className="glass-card p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Banco de Integrantes do Louvor
              </h2>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {members.length} cadastrados
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gerencie a disponibilidade, telefones de contato e instrumentos de cada membro da equipe.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition active:scale-[0.98] shadow-2xs self-start sm:self-auto shrink-0"
        >
          {isAdding ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{isAdding ? 'Fechar' : 'Adicionar Integrante'}</span>
        </button>
      </div>

      {/* Add Member Form */}
      {isAdding && (
        <form onSubmit={handleSaveNewMember} className="glass-card p-4 sm:p-5 rounded-xl border border-sky-500/40 ring-1 ring-sky-500/20 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Cadastrar Novo Integrante
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Ex: Gabriel Martins"
                className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                WhatsApp / Telefone
              </label>
              <input
                type="text"
                value={newMember.phone}
                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full h-9 bg-white dark:bg-slate-950 border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 text-xs focus:border-sky-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Instrumentos e Funções que Toca:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_ROLES.map(role => {
                const selected = newMember.roles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => handleToggleRole(role)}
                    className={`h-7 px-2.5 rounded-md text-xs font-semibold border transition active:scale-[0.98] ${
                      selected
                        ? 'bg-sky-600 border-sky-500 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="inline-flex items-center justify-center h-8 px-3 rounded-md text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center h-8 px-4 rounded-md text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition active:scale-[0.98] shadow-2xs"
            >
              Salvar Integrante
            </button>
          </div>
        </form>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {members.map(member => {
          const scalesCount = memberCounts[member.name] || 0;
          return (
            <div
              key={member.id}
              className={`p-3.5 rounded-xl border transition-colors flex flex-col justify-between ${
                member.active 
                  ? 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs' 
                  : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {member.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{member.phone || 'Sem telefone cadastrado'}</span>
                    </p>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums font-bold shrink-0 ${
                    scalesCount >= 3 
                      ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/25' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {scalesCount} {scalesCount === 1 ? 'escala' : 'escalas'}
                  </span>
                </div>

                {/* Roles Badges */}
                <div className="flex flex-wrap gap-1 my-2.5">
                  {member.roles.map(r => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 dark:border-slate-800/70 text-xs">
                <button
                  onClick={() => handleToggleActive(member.id)}
                  className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition ${
                    member.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${member.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  <span>{member.active ? 'Ativo' : 'Em recesso'}</span>
                </button>

                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-rose-600 rounded-md transition"
                  title="Remover integrante"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
