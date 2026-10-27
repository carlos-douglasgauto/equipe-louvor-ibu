import { INITIAL_MEMBERS, INITIAL_SCHEDULES } from '../data/initialData';
import { INITIAL_SONG_CATALOG } from '../data/songCatalog';
import { extractYouTubeId, slugifyText } from './youtube';

const STORAGE_KEY_SCHEDULES = 'louvorsync_schedules_v1';
const STORAGE_KEY_MEMBERS = 'louvorsync_members_v1';
const STORAGE_KEY_CATALOG = 'louvorsync_song_catalog_v1';

export function loadSchedules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading schedules from localStorage', e);
  }
  return INITIAL_SCHEDULES;
}

export function saveSchedules(schedules) {
  try {
    localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
  } catch (e) {
    console.error('Error saving schedules to localStorage', e);
  }
}

export function loadMembers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading members from localStorage', e);
  }
  return INITIAL_MEMBERS;
}

export function saveMembers(members) {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Error saving members to localStorage', e);
  }
}

/**
 * Loads the intelligent church song catalog (merges INITIAL_SONG_CATALOG + saved songs in localStorage + songs in schedules)
 */
export function loadSongCatalog() {
  const catalogMap = new Map();

  // 1. Seed with INITIAL_SONG_CATALOG
  INITIAL_SONG_CATALOG.forEach((song) => {
    const key = slugifyText(song.title);
    if (key) catalogMap.set(key, { ...song });
  });

  // 2. Merge songs from current schedules
  const schedules = loadSchedules();
  schedules.forEach((sched) => {
    (sched.songs || []).forEach((song) => {
      const key = slugifyText(song.title);
      if (!key) return;
      const existing = catalogMap.get(key);
      if (!existing || (song.chordsText && song.chordsText.length > (existing.chordsText?.length || 0))) {
        catalogMap.set(key, {
          ...existing,
          ...song,
          originalKey: song.originalKey || song.key || existing?.originalKey || 'G'
        });
      }
    });
  });

  // 3. Merge user-saved custom catalog from localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATALOG);
    if (raw) {
      const savedList = JSON.parse(raw);
      if (Array.isArray(savedList)) {
        savedList.forEach((song) => {
          const key = slugifyText(song.title);
          if (key) {
            catalogMap.set(key, {
              ...(catalogMap.get(key) || {}),
              ...song
            });
          }
        });
      }
    }
  } catch (e) {
    console.error('Error loading song catalog from localStorage', e);
  }

  return Array.from(catalogMap.values()).sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
}

/**
 * Saves or updates a song in the persistent church catalog
 */
export function saveSongToCatalog(song) {
  if (!song || !song.title?.trim()) return;
  try {
    const currentCatalog = loadSongCatalog();
    const targetSlug = slugifyText(song.title);
    const updated = currentCatalog.filter((item) => slugifyText(item.title) !== targetSlug);
    updated.push({
      id: song.id || 'cat_' + Date.now(),
      title: song.title.trim(),
      artist: song.artist?.trim() || '',
      version: song.version?.trim() || '',
      originalKey: song.originalKey || song.key || 'G',
      key: song.key || song.originalKey || 'G',
      bpm: song.bpm || 70,
      youtubeUrl: song.youtubeUrl || '',
      cifraUrl: song.cifraUrl || '',
      notes: song.notes || '',
      chordsText: song.chordsText || ''
    });
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving song to catalog', e);
  }
}

/**
 * Finds a matching song in the intelligent catalog by YouTube video ID or Title/Artist
 */
export function findSongInCatalog({ youtubeUrl = '', title = '', artist = '' }) {
  const catalog = loadSongCatalog();
  const videoId = extractYouTubeId(youtubeUrl);

  // 1. Exact YouTube video ID match
  if (videoId) {
    const byVideo = catalog.find((item) => extractYouTubeId(item.youtubeUrl) === videoId);
    if (byVideo) return byVideo;
  }

  // 2. Title slug match
  const titleSlug = slugifyText(title);
  if (!titleSlug) return null;

  const exactByTitle = catalog.find((item) => slugifyText(item.title) === titleSlug);
  if (exactByTitle) return exactByTitle;

  // 3. Partial / Contained title match (e.g. "Emaús (Ao Vivo)" matches "Emaús")
  const partialMatch = catalog.find((item) => {
    const itemSlug = slugifyText(item.title);
    return itemSlug && (titleSlug.includes(itemSlug) || itemSlug.includes(titleSlug));
  });

  return partialMatch || null;
}

export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    schedules: loadSchedules(),
    members: loadMembers(),
    catalog: loadSongCatalog()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `louvorsync_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEY_SCHEDULES);
  localStorage.removeItem(STORAGE_KEY_MEMBERS);
  localStorage.removeItem(STORAGE_KEY_CATALOG);
}
