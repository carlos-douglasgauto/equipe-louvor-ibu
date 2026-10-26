import { INITIAL_MEMBERS, INITIAL_SCHEDULES } from '../data/initialData';

const STORAGE_KEY_SCHEDULES = 'louvorsync_schedules_v1';
const STORAGE_KEY_MEMBERS = 'louvorsync_members_v1';

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

export function exportAllData() {
  const data = {
    exportDate: new Date().toISOString(),
    schedules: loadSchedules(),
    members: loadMembers()
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
}
