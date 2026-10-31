import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Play, 
  Users, 
  Share2, 
  MapPin,
  Music
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
    if (!memberName || !schedule?.lineup) return null;
    const l = schedule.lineup;
    if (l.ministration === memberName) return 'Ministração';
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

  const activeMyRole = getMemberRoleOnSunday(activeSchedule, selectedMember);
  const isSelectedMemberConfirmed = Boolean(
    selectedMember && activeSchedule?.confirmedMembers?.includes(selectedMember)
  );

  // Helper to render names with confirmed dot and current member highlight
  const renderLineupNames = (names) => {
    if (!names || names.length === 0) return '—';
    return names.map((name, i) => {
      const isMe = selectedMember && name === selectedMember;
      const isConfirmed = activeSchedule?.confirmedMembers?.includes(name);
      return (
        <span key={name} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-slate-400 font-normal">, </span>}
          <span className={isMe ? 'font-bold text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/40 underline-offset-2' : ''}>
            {name}
          </span>
          {isConfirmed && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" title="Presença confirmada" />
          )}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      
      {/* Horizontal Sunday Selector Strip */}
      <div
        role="tablist"
        aria-label="Domingos do mês"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5"
      >
        {schedules.map((sched) => {
          const isSelected = sched.id === activeSundayId;
          const [, month, day] = sched.date.split('-');
          const myRole = getMemberRoleOnSunday(sched, selectedMember);
          const isConfirmedHere = Boolean(selectedMember && sched.confirmedMembers?.includes(selectedMember));
          const songsCount = sched.songs?.length || 0;
          const ministerName = sched.lineup?.ministration || 'A definir';

          return (
            <button
              key={sched.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveSundayId(sched.id)}
              className={`group relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-emerald-500/80 dark:border-emerald-400/70 ring-1 ring-emerald-500/20 dark:ring-emerald-400/20 shadow-xs'
                  : 'bg-white/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Date Block */}
              <div
                className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 tabular-nums border transition-colors ${
                  isSelected
                    ? 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-500/30 dark:border-emerald-400/30 text-emerald-700 dark:text-emerald-300'
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

              {/* Sunday Meta */}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${
                  isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'
                }`}>
                  {ministerName}
                </p>

                {selectedMember ? (
                  myRole ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isConfirmedHere ? 'bg-emerald-500' : 'bg-amber-400'
                      }`} />
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                        {myRole}
                      </span>
                    </div>
                  ) : (
                    <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Folga
                    </span>
                  )
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
                    {songsCount} {songsCount === 1 ? 'música' : 'músicas'}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Sunday Workspace */}
      {activeSchedule && (
        <div className="space-y-4">
          
          {/* Active Sunday Overview Card */}
          <div className="glass-card p-4 sm:p-5 rounded-xl space-y-3.5">
            
            {/* Top Row: Sunday Details & Action Cluster */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 flex-wrap">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>DOMINGO • {activeSchedule.date.split('-').reverse().join('/')}</span>
                  <span>•</span>
                  <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">{activeSchedule.title}</span>
                  {selectedMember && (
                    activeMyRole ? (
                      <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelectedMemberConfirmed ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
                        Você: {activeMyRole} {isSelectedMemberConfirmed ? '(Confirmado)' : '(Pendente)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-sans text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                        Você está de folga
                      </span>
                    )
                  )}
                </div>

                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Ministração: <span className="text-emerald-700 dark:text-emerald-400">{activeSchedule.lineup?.ministration || 'A definir'}</span>
                </h2>

                {/* Inline Lineup with presence indicator dots */}
                <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                  <span><strong className="text-slate-900 dark:text-slate-200">Vocal:</strong> {renderLineupNames(activeSchedule.lineup?.vocals?.filter(Boolean))}</span>
                  <span>•</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Violão:</strong> {renderLineupNames(activeSchedule.lineup?.acousticGuitar ? [activeSchedule.lineup.acousticGuitar] : [])}</span>
                  <span>•</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Guitarra:</strong> {renderLineupNames([activeSchedule.lineup?.guitar1, activeSchedule.lineup?.guitar2].filter(Boolean))}</span>
                  <span>•</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Teclado:</strong> {renderLineupNames(activeSchedule.lineup?.keyboard ? [activeSchedule.lineup.keyboard] : [])}</span>
                  <span>•</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Baixo:</strong> {renderLineupNames(activeSchedule.lineup?.bass ? [activeSchedule.lineup.bass] : [])}</span>
                  <span>•</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Bateria:</strong> {renderLineupNames(activeSchedule.lineup?.drums ? [activeSchedule.lineup.drums] : [])}</span>
                </div>
              </div>

              {/* Right Action Cluster */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                {/* Member Filter Select */}
                <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-200/90 dark:border-slate-800">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <label htmlFor="musician-filter" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    Integrante:
                  </label>
                  <select
                    id="musician-filter"
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="bg-transparent text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
                  >
                    <option value="" className="bg-white dark:bg-slate-900">Todos os integrantes</option>
                    {members.filter(m => m.active).map(m => (
                      <option key={m.id} value={m.name} className="bg-white dark:bg-slate-900">
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personal Presence Toggle Button (if member is scheduled) */}
                {selectedMember && activeMyRole && (
                  <button
                    type="button"
                    onClick={() => handleToggleConfirmPresence(activeSchedule, selectedMember)}
                    className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold transition active:scale-[0.98] shadow-2xs ${
                      isSelectedMemberConfirmed
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700'
                    }`}
                    title={isSelectedMemberConfirmed ? 'Clique para desmarcar presença' : 'Confirmar presença na escala'}
                  >
                    {isSelectedMemberConfirmed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Presença Confirmada</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Confirmar Presença</span>
                      </>
                    )}
                  </button>
                )}

                {/* WhatsApp Share Button */}
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(activeSchedule)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 transition active:scale-[0.98] shadow-2xs"
                  title="Compartilhar escala no WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Compartilhar Escala</span>
                </button>
              </div>
            </div>

            {/* Rehearsal Info Strip */}
            {activeSchedule.rehearsal?.date && (
              <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/70">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  Ensaio:
                </span>
                <span className="tabular-nums font-medium text-slate-800 dark:text-slate-200">
                  {activeSchedule.rehearsal.date.split('-').reverse().join('/')} às {activeSchedule.rehearsal.time || '16:00'}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {activeSchedule.rehearsal.location || 'Templo Principal'}
                </span>
                {activeSchedule.rehearsal.notes && (
                  <>
                    <span>•</span>
                    <span className="italic text-slate-600 dark:text-slate-400">"{activeSchedule.rehearsal.notes}"</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Full-Width Setlist Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Repertório do Culto
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[11px] font-semibold tabular-nums bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {activeSchedule.songs?.length || 0}
                </span>
              </div>

              {activeSchedule.songs && activeSchedule.songs.length > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenYouTubePlayer(activeSchedule.songs[0], activeSchedule.songs)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition active:scale-[0.98] shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Ouvir Tudo</span>
                </button>
              )}
            </div>

            {(!activeSchedule.songs || activeSchedule.songs.length === 0) ? (
              <div className="glass-card p-10 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <Music className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nenhuma música no repertório ainda
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  O repertório deste culto ainda está sendo definido pelo ministro(a).
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeSchedule.songs.map((song, idx) => {
                  const videoId = extractYouTubeId(song.youtubeUrl);
                  const thumb = getYouTubeThumbnail(videoId);
                  const orderNum = String(idx + 1).padStart(2, '0');

                  return (
                    <div 
                      key={song.id || idx}
                      className="glass-card p-3 sm:p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      {/* Left: Index / Thumbnail / Metadata */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        
                        {/* Track Index */}
                        <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 font-mono font-bold text-xs tabular-nums border border-slate-200/60 dark:border-slate-700/60">
                          {orderNum}
                        </div>

                        {/* Video Thumbnail (if present) */}
                        {thumb && (
                          <button
                            type="button"
                            onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                            title={`Ouvir ${song.title}`}
                            className="relative w-18 sm:w-20 aspect-video rounded-md bg-slate-900 shrink-0 overflow-hidden group border border-slate-200/80 dark:border-slate-800"
                          >
                            <img 
                              src={thumb} 
                              alt={song.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                              <Play className="w-3.5 h-3.5 text-white fill-current" />
                            </div>
                          </button>
                        )}

                        {/* Title, Artist, Key Badges & Notes */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate" title={song.title}>
                            {song.title}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {song.artist} {song.version ? `• ${song.version}` : ''}
                          </p>

                          <div className="flex items-center gap-1.5 flex-wrap mt-1.5 tabular-nums">
                            <span className="font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded text-[11px] border border-sky-500/25">
                              Tom: {song.key}
                            </span>
                            {song.originalKey && song.originalKey !== song.key ? (
                              <span
                                className="text-[10px] font-mono font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25"
                                title={`Tom original: ${song.originalKey}`}
                              >
                                Orig: {song.originalKey} → {song.key}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                (Tom Original)
                              </span>
                            )}
                            {song.bpm && (
                              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-slate-700/70">
                                {song.bpm} BPM
                              </span>
                            )}
                          </div>

                          {song.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 bg-slate-100/70 dark:bg-slate-950/50 px-2 py-1 rounded border border-slate-200/70 dark:border-slate-800/70">
                              <span className="font-semibold text-sky-600 dark:text-sky-400">Arranjo: </span>
                              {song.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        {song.youtubeUrl && (
                          <button
                            type="button"
                            onClick={() => onOpenYouTubePlayer(song, activeSchedule.songs)}
                            title="Assistir/Ouvir versão no YouTube"
                            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 transition active:scale-[0.98]"
                          >
                            <Play className="w-3 h-3 text-rose-500 fill-current" />
                            <span>Vídeo</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenChordViewer(song)}
                          title="Visualizar cifra com transposição"
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition active:scale-[0.98] shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Abrir Cifra</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
