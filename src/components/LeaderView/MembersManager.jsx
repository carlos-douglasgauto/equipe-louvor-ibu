import React, { useState } from 'react';
import { Users, UserPlus, Phone, Check, Trash2, Edit2, ShieldAlert } from 'lucide-react';

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
      phone: newMember.phone.trim() || '(11) 99999-9999',
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
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Banco de Integrantes da Equipe
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {members.length} membros cadastrados • Mantenha os dados e funções atualizados
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition shadow-md shadow-sky-600/20 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAdding ? 'Cancelar' : 'Adicionar Integrante'}</span>
        </button>
      </div>

      {/* Add Member Form */}
      {isAdding && (
        <form onSubmit={handleSaveNewMember} className="glass-card p-5 rounded-2xl border-sky-500/30 animate-fade-in space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Novo Integrante da Equipe</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Ex: João Silva"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">WhatsApp / Telefone</label>
              <input
                type="text"
                value={newMember.phone}
                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Instrumentos / Funções</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map(role => {
                const selected = newMember.roles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => handleToggleRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                      selected
                        ? 'bg-sky-600 border-sky-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition shadow"
            >
              Salvar Integrante
            </button>
          </div>
        </form>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {members.map(member => {
          const scalesCount = memberCounts[member.name] || 0;
          return (
            <div
              key={member.id}
              className={`p-4 rounded-xl border transition-all ${
                member.active 
                  ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs' 
                  : 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {member.phone || 'Sem telefone'}
                  </p>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  scalesCount >= 3 
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}>
                  {scalesCount} {scalesCount === 1 ? 'escala' : 'escalas'}
                </span>
              </div>

              {/* Roles Badges */}
              <div className="flex flex-wrap gap-1.5 my-3">
                {member.roles.map(r => (
                  <span
                    key={r}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-slate-700/60"
                  >
                    {r}
                  </span>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                <button
                  onClick={() => handleToggleActive(member.id)}
                  className={`text-[11px] font-semibold ${member.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                  {member.active ? '● Ativo' : '○ Em recesso'}
                </button>

                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition"
                  title="Excluir integrante"
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
