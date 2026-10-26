import React from 'react';
import { X, Youtube, ExternalLink, Music2, SkipForward, SkipBack } from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../utils/youtube';

export default function YouTubePlayerModal({ song, songs = [], onSelectSong, onClose }) {
  if (!song) return null;

  const videoId = extractYouTubeId(song.youtubeUrl);
  const currentIndex = songs.findIndex(s => s.id === song.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < songs.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Youtube className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-100 text-base sm:text-lg truncate">
                {song.title} <span className="text-slate-400 font-normal">({song.artist})</span>
              </h3>
              <p className="text-xs text-amber-400 font-medium truncate">
                Tom: <span className="font-bold">{song.key}</span> {song.version ? `• ${song.version}` : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {song.youtubeUrl && (
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir no YouTube diretamente"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {videoId ? (
            <iframe
              className="w-full h-full"
              src={getYouTubeEmbedUrl(videoId)}
              title={song.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <Music2 className="w-12 h-12 mb-3 stroke-[1.5]" />
              <p className="font-medium text-slate-400">Nenhum link do YouTube informado para esta música</p>
              <p className="text-xs text-slate-600 mt-1">O ministro da semana pode adicionar a URL de referência na aba do repertório.</p>
            </div>
          )}
        </div>

        {/* Notes & Playlist Navigation */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-300">
            {song.notes ? (
              <p><span className="text-sky-400 font-semibold">Orientações do Ministro:</span> {song.notes}</p>
            ) : (
              <p className="text-slate-500 italic">Sem observações de arranjo.</p>
            )}
          </div>

          {/* Playlist Prev / Next buttons */}
          {songs.length > 1 && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                disabled={!hasPrev}
                onClick={() => onSelectSong(songs[currentIndex - 1])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
              >
                <SkipBack className="w-3.5 h-3.5" />
                Anterior
              </button>
              <span className="text-xs text-slate-500 px-1 font-mono">
                {currentIndex + 1} de {songs.length}
              </span>
              <button
                disabled={!hasNext}
                onClick={() => onSelectSong(songs[currentIndex + 1])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition"
              >
                Próxima
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
