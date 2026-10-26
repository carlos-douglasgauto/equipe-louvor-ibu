import React, { useState } from 'react';
import { 
  Guitar, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Youtube, 
  FileText, 
  Play, 
  Users, 
  Share2, 
  ExternalLink,
  Sparkles,
  Music2,
  ChevronRight,
  ListMusic
} from 'lucide-react';
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/youtube';

export default function MusicianDashboard({
  schedules,
  members,
  onUpdateSchedule,
  onOpenYouTubePlayer,
  onOpenChordViewer,
  onOpenWhatsApp
}) {
  const [selectedMember, setSelectedMember] = useState('');
  const [activeSundayId, setActiveSundayId] = useState(schedules[0]?.id || '');

  const activeSchedule = schedules.find(s => s.id === activeSundayId) || schedules[0];

  // Helper to find what role a member has on a Sunday
  const getMemberRoleOnSunday = (schedule, memberName) => {
    if (!memberName) return null;
    const l = schedule.lineup;
    if (l.ministration === memberName) return 'Ministração (Líder)';
    if (l.vocals?.includes(memberName)) return 'Vocal';
    if (l.bass === memberName) return 'Baixo';
    if (l.drums === memberName) return 'Bateria';
    if (l.guitar1 === memberName) return 'Guitarra 1';
    if (l.guitar2 === memberName) return 'Guitarra 2';
    if (l.keyboard === memberName) return 'Teclado';
    if (l.acousticGuitar === memberName) return 'Violão';
    return null;
  };

  const handleToggleConfirmPresence = (schedule, memberName) => {
    if (!memberName) return;
    const currentConfirmed = schedule.confirmedMembers || [];
    const isAlreadyConfirmed = currentConfirmed.includes(memberName);

    const updatedConfirmed = isAlreadyConfirmed
      ? currentConfirmed.filter(name => name !== memberName)
      : [...currentConfirmed, memberName];

    onUpdateSchedule({
      ...schedule,
      confirmedMembers: updatedConfirmed
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Member Selector */}
      <div className="glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Guitar className="w-3.5 h-3.5" />
                Área do Músico / Integrante
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Escala, Ensaios & Repertório</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Central de Estudos & Escala
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Veja suas escalas do mês, confirme sua presença, estude as versões das músicas no YouTube e visualize as cifras com transposição de tom.
            </p>
          </div>

          {/* Member Picker */}
          <div className="bg-white dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs shrink-0">
            <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
              Filtrar por Integrante:
            </label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none w-full sm:w-56 font-medium"
            >
              <option value="">Todos os integrantes</option>
              {members.filter(m => m.active).map(m => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sundays Horizontal Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {schedules.map((sched) => {
          const isSelected = sched.id === activeSundayId;
          const [year, month, day] = sched.date.split('-');
          const myRole = getMemberRoleOnSunday(sched, selectedMember);

          return (
            <button
              key={sched.id}
              onClick={() => setActiveSundayId(sched.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left shrink-0 transition-all duration-200 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs'
              }`}
            >
              <div className={`p-2 rounded-lg text-center ${isSelected ? 'bg-white text-emerald-700 font-extrabold shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                <span className="block text-[10px] font-bold uppercase leading-none">Dom</span>
                <span className="block text-sm font-extrabold leading-none mt-1">{day}/{month}</span>
              </div>
              <div>
                <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                  {sched.title}
                </p>
                {selectedMember ? (
                  myRole ? (
                    <span className={`inline-block mt-0.5 text-[11px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-emerald-700/80 text-white'
                        : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/50'
                    }`}>
                      Toca: {myRole}
                    </span>
                  ) : (
                    <span className={`text-[11px] mt-0.5 block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                      Folga
                    </span>
                  )
                ) : (
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {sched.songs?.length || 0} músicas
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sunday Details */}
      {activeSchedule && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Rehearsal, Lineup & Presence */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sunday Overview & Presence Confirmation Card */}
            <div className="glass-card p-5 sm:p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    DOMINGO • {activeSchedule.date.split('-').reverse().join('/')}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {activeSchedule.title}
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-300 font-medium mt-0.5">
                    🎤 Ministração: <strong>{activeSchedule.lineup.ministration || 'A definir'}</strong>
                  </p>
                </div>

                {/* WhatsApp button for this specific day */}
                <button
                  onClick={() => onOpenWhatsApp(activeSchedule)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition self-start sm:self-auto shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>

              {/* Personal Presence Confirmation Banner if member is selected */}
              {selectedMember && (
                <div className={`p-4 rounded-xl mb-5 border transition ${
                  getMemberRoleOnSunday(activeSchedule, selectedMember)
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/40'
                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {getMemberRoleOnSunday(activeSchedule, selectedMember) ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                          <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                            {selectedMember}, você está escalado(a) como: {getMemberRoleOnSunday(activeSchedule, selectedMember)}!
                          </h4>
                        </div>
                        <p className="text-xs text-emerald-700 dark:text-slate-300 mt-1">
                          Confirme que você está ciente para ajudar a liderança na organização.
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleConfirmPresence(activeSchedule, selectedMember)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                          activeSchedule.confirmedMembers?.includes(selectedMember)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {activeSchedule.confirmedMembers?.includes(selectedMember) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Presença Confirmada!</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-4 h-4 text-slate-400" />
                            <span>Confirmar que estou ciente</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ℹ️ {selectedMember}, você está de folga neste domingo. Bom descanso e aproveite para cultuar!
                    </p>
                  )}
                </div>
              )}

              {/* Ensaio da Semana Notice */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-950/60 border border-indigo-100 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>INFORMAÇÕES DO ENSAIO</span>
                </div>
                {activeSchedule.rehearsal?.date ? (
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <p>
                      📅 <strong>Data:</strong> {activeSchedule.rehearsal.date.split('-').reverse().join('/')} às <strong>{activeSchedule.rehearsal.time || '16:00'}</strong>
                    </p>
                    <p>
                      📍 <strong>Local:</strong> {activeSchedule.rehearsal.location || 'Templo Principal'}
                    </p>
                    {activeSchedule.rehearsal.notes && (
                      <p className="text-slate-500 dark:text-slate-400 italic">
                        💬 <strong>Avisos:</strong> {activeSchedule.rehearsal.notes}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    ⚠️ Os ensaios continuam sendo definidos durante a semana pelo ministro e líder.
                  </p>
                )}
              </div>

              {/* Band Lineup Grid */}
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
                Músicos Escalados para Este Domingo:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                
                {/* Ministração */}
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 shadow-xs">
                  <span className="block text-[10px] text-red-600 dark:text-red-400 uppercase font-bold">Ministração</span>
                  <span className="block text-xs font-bold text-red-950 dark:text-slate-100 truncate mt-0.5">
                    {activeSchedule.lineup.ministration || 'A definir'}
                  </span>
                </div>

                {/* Vocais */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Vocal</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {activeSchedule.lineup.vocals?.filter(Boolean).join(', ') || 'Nenhum'}
                  </span>
                </div>

                {/* Violão */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Violão</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {activeSchedule.lineup.acousticGuitar || '-'}
                  </span>
                </div>

                {/* Guitarras */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Guitarra</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {[activeSchedule.lineup.guitar1, activeSchedule.lineup.guitar2].filter(Boolean).join(', ') || '-'}
                  </span>
                </div>

                {/* Teclado */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Teclado</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {activeSchedule.lineup.keyboard || '-'}
                  </span>
                </div>

                {/* Baixo */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Baixo</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {activeSchedule.lineup.bass || '-'}
                  </span>
                </div>

                {/* Bateria */}
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Bateria</span>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                    {activeSchedule.lineup.drums || '-'}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* Right Col: Songs & Rehearsal Playlist */}
          <div className="space-y-4">
            
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Playlist de Ensaio
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Versões escolhidas para ouvir e treinar
                    </p>
                  </div>
                </div>

                {activeSchedule.songs && activeSchedule.songs.length > 0 && (
                  <button
                    onClick={() => onOpenYouTubePlayer(activeSchedule.songs[0], activeSchedule.songs)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition shadow shadow-red-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Tocar Tudo</span>
                  </button>
                )}
              </div>

              {(!activeSchedule.songs || activeSchedule.songs.length === 0) ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <p>O ministro ainda não inseriu as músicas deste domingo.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeSchedule.songs.map((song, idx) => {
                    const videoId = extractYouTubeId(song.youtubeUrl);
                    const thumb = getYouTubeThumbnail(videoId);

                    return (
                      <div 
                        key={song.id || idx}
                        className="p-3 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition"
                      >
                        <div className="flex items-start gap-3">
                          {/* Thumbnail or Icon */}
                          {thumb ? (
                            <div 
                              onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                              className="relative w-16 sm:w-20 aspect-video rounded bg-black shrink-0 cursor-pointer overflow-hidden group shadow border border-slate-200 dark:border-slate-800"
                            >
                              <img src={thumb} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Play className="w-4 h-4 text-red-500 fill-current" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 font-bold text-xs">
                              {idx + 1}
                            </div>
                          )}

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1" title={song.title}>
                              {song.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {song.artist} {song.version ? `• ${song.version}` : ''}
                            </p>

                            {/* Prominent Badges Row - Always clearly visible on Mobile */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="font-mono font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/80 px-2 py-0.5 rounded text-[11px] border border-red-200 dark:border-red-800">
                                Tom: {song.key}
                              </span>

                              {song.originalKey && song.originalKey !== song.key ? (
                                <span className="text-[10px] font-bold text-red-800 dark:text-red-300 bg-red-50/70 dark:bg-red-950/70 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-700 font-mono flex items-center gap-1" title={`Tom original da gravação no YouTube: ${song.originalKey}`}>
                                  <span>Orig: {song.originalKey}</span>
                                  <span>➔</span>
                                  <span className="underline">Min: {song.key}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                  (Tom Original)
                                </span>
                              )}

                              {song.bpm && (
                                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                  {song.bpm} BPM
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Song notes */}
                        {song.notes && (
                          <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-2.5 bg-sky-50 dark:bg-slate-950/70 p-2 rounded-lg border border-sky-200 dark:border-slate-800/80 italic">
                            💡 {song.notes}
                          </p>
                        )}

                        {/* Song buttons: YouTube player and Chords */}
                        <div className="flex items-center justify-end gap-2 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                          {song.youtubeUrl && (
                            <button
                              onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              <span>Ouvir Versão</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenChordViewer(song)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Cifra</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
