import { INITIAL_MEMBERS, INITIAL_SCHEDULES, GOOGLE_DOCS_URL } from '../data/initialData';
import { INITIAL_SONG_CATALOG } from '../data/songCatalog';
import { extractYouTubeId, slugifyText } from './youtube';

const STORAGE_KEY_SCHEDULES = 'louvorsync_schedules_v1';
const STORAGE_KEY_MEMBERS = 'louvorsync_members_v1';
const STORAGE_KEY_CATALOG = 'louvorsync_song_catalog_v1';
const STORAGE_KEY_GDOCS = 'louvorsync_googledocs';
const STORAGE_KEY_UPDATED_AT = 'louvorsync_updated_at_v1';

export function getLocalUpdatedAt() {
  try {
    const val = localStorage.getItem(STORAGE_KEY_UPDATED_AT);
    return val ? Number(val) : 0;
  } catch (_) {
    return 0;
  }
}

export function setLocalUpdatedAt(ts = Date.now()) {
  try {
    localStorage.setItem(STORAGE_KEY_UPDATED_AT, String(ts));
  } catch (_) {}
}

export function hasCustomLocalSchedules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (!raw) return false;
    return raw !== JSON.stringify(INITIAL_SCHEDULES);
  } catch (_) {
    return false;
  }
}

export function loadSchedules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHEDULES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading schedules from localStorage', e);
  }
  return INITIAL_SCHEDULES;
}

export function saveSchedules(schedules, markUpdated = false) {
  try {
    localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedules));
    if (markUpdated) setLocalUpdatedAt(Date.now());
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

export function saveMembers(members, markUpdated = false) {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    if (markUpdated) setLocalUpdatedAt(Date.now());
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

export function saveCatalogList(catalogList) {
  if (!Array.isArray(catalogList)) return;
  try {
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(catalogList));
  } catch (e) {
    console.error('Error saving catalog list', e);
  }
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
 * Saves multiple songs to the persistent church catalog
 */
export function saveMultipleSongsToCatalog(songs = []) {
  songs.forEach(s => saveSongToCatalog(s));
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

  // 3. Partial / Contained title match
  const partialMatch = catalog.find((item) => {
    const itemSlug = slugifyText(item.title);
    return itemSlug && (titleSlug.includes(itemSlug) || itemSlug.includes(titleSlug));
  });

  return partialMatch || null;
}

/**
 * Cloud synchronization: Fetches shared state from /api/state
 */
export async function fetchCloudState() {
  try {
    const res = await fetch(`/api/state?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.ok && data.hasCloudState && data.state) {
      return data.state;
    }
    return { emptyCloud: true };
  } catch (e) {
    console.warn('Cloud sync fetch warning:', e);
    return null;
  }
}

/**
 * Cloud synchronization: Pushes current state to /api/state so mobile, incognito, and all musicians see it
 */
export async function pushCloudState({ schedules, members, googleDocsUrl, catalog, updatedAt }) {
  const ts = updatedAt || Date.now();
  setLocalUpdatedAt(ts);
  try {
    const payload = {
      schedules: schedules || loadSchedules(),
      members: members || loadMembers(),
      googleDocsUrl: googleDocsUrl || localStorage.getItem(STORAGE_KEY_GDOCS) || GOOGLE_DOCS_URL,
      catalog: catalog || loadSongCatalog(),
      updatedAt: ts
    };
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data && data.ok);
  } catch (e) {
    console.warn('Cloud sync push warning:', e);
    return false;
  }
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
  localStorage.removeItem(STORAGE_KEY_UPDATED_AT);
}
