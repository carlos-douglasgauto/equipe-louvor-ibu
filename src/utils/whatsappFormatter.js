// Formatter for church WhatsApp group messages
export function formatScaleForWhatsApp(schedule) {
  if (!schedule) return '';

  const dateParts = schedule.date.split('-');
  const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  
  let msg = `🕊️ *ESCALA DE LOUVOR - ${formattedDate}*\n`;
  msg += `📍 *${schedule.title}*\n\n`;

  // Lineup
  msg += `👥 *EQUIPE ESCALADA:*\n`;
  if (schedule.lineup.ministration) {
    msg += `🎤 *Ministração:* ${schedule.lineup.ministration}\n`;
  }
  if (schedule.lineup.vocals && schedule.lineup.vocals.length > 0) {
    msg += `🎶 *Vocal:* ${schedule.lineup.vocals.filter(Boolean).join(', ')}\n`;
  }
  if (schedule.lineup.acousticGuitar) {
    msg += `🎸 *Violão:* ${schedule.lineup.acousticGuitar}\n`;
  }
  if (schedule.lineup.guitar1 || schedule.lineup.guitar2) {
    const guitars = [schedule.lineup.guitar1, schedule.lineup.guitar2].filter(Boolean).join(', ');
    msg += `⚡ *Guitarra:* ${guitars}\n`;
  }
  if (schedule.lineup.keyboard) {
    msg += `🎹 *Teclado:* ${schedule.lineup.keyboard}\n`;
  }
  if (schedule.lineup.bass) {
    msg += `🎸 *Baixo:* ${schedule.lineup.bass}\n`;
  }
  if (schedule.lineup.drums) {
    msg += `🥁 *Bateria:* ${schedule.lineup.drums}\n`;
  }

  // Rehearsal details
  if (schedule.rehearsal && schedule.rehearsal.date) {
    const rDateParts = schedule.rehearsal.date.split('-');
    const formattedRDate = `${rDateParts[2]}/${rDateParts[1]}`;
    msg += `\n⏰ *ENSAIO:* ${formattedRDate} às ${schedule.rehearsal.time || '16:00'}`;
    if (schedule.rehearsal.notes) {
      msg += ` (${schedule.rehearsal.notes})`;
    }
    msg += `\n`;
  } else {
    msg += `\n⚠️ _Os ensaios continuam sendo definidos durante a semana._\n`;
  }

  // Songs & YouTube references
  if (schedule.songs && schedule.songs.length > 0) {
    msg += `\n🎵 *REPERTÓRIO / PLAYLIST:*\n`;
    schedule.songs.forEach((song, idx) => {
      msg += `   • Tom: *${song.key}*`;
      if (song.originalKey && song.originalKey !== song.key) {
        msg += ` _(Original da Gravação: ${song.originalKey} ➔ Ministração: ${song.key})_`;
      }
      if (song.bpm) msg += ` | BPM: ${song.bpm}`;
      msg += `\n`;
      if (song.version) {
        msg += `   • Versão: ${song.version}\n`;
      }
      if (song.youtubeUrl) {
        msg += `   • Vídeo de Referência: ${song.youtubeUrl}\n`;
      }
      if (song.cifraUrl) {
        msg += `   • Cifra: ${song.cifraUrl}\n`;
      }
      if (song.notes) {
        msg += `   • Obs: _${song.notes}_\n`;
      }
    });
  }

  msg += `\n🙌 _Deus abençoe a todos! Por favor confirmem presença no app._`;

  return msg;
}

export function formatMonthSummaryForWhatsApp(schedules, monthName = 'Novembro 2026') {
  let msg = `📅 *ESCALA GERAL DE MÚSICOS - ${monthName.toUpperCase()}*\n`;
  msg += `_Igreja - Equipe de Louvor_\n\n`;

  schedules.forEach(s => {
    const p = s.date.split('-');
    const day = `${p[2]}/${p[1]}`;
    msg += `*Domingo dia ${day}*\n`;
    if (s.lineup.ministration) msg += `Ministração - ${s.lineup.ministration}\n`;
    if (s.lineup.vocals && s.lineup.vocals.length) {
      s.lineup.vocals.filter(Boolean).forEach(v => {
        msg += `Vocal - ${v}\n`;
      });
    }
    if (s.lineup.bass) msg += `Baixo – ${s.lineup.bass}\n`;
    if (s.lineup.drums) msg += `Bateria - ${s.lineup.drums}\n`;
    if (s.lineup.guitar1) msg += `Guitarra - ${s.lineup.guitar1}\n`;
    if (s.lineup.guitar2) msg += `Guitarra - ${s.lineup.guitar2}\n`;
    if (s.lineup.keyboard) msg += `Teclado - ${s.lineup.keyboard}\n`;
    if (s.lineup.acousticGuitar) msg += `Violão - ${s.lineup.acousticGuitar}\n`;
    msg += `\n`;
  });

  msg += `_Os ensaios continuam sendo definidos durante a semana._\n`;
  return msg;
}
