export interface FileTreeState {
  treeData: import('@/types/file_explorer/file-structure').FolderNode;
  expanded: Record<string, boolean>;
}

const STORAGE_KEY = 'fileTreeState';

export function saveFileTreeState(state: FileTreeState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save file tree state', err);
  }
}

export function loadFileTreeState(): FileTreeState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FileTreeState;
  } catch (err) {
    console.error('Failed to load file tree state', err);
    return null;
  }
}

export function clearFileTreeState() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
