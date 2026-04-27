export type VisibilityMode = 'circle' | 'flashlight';

export interface GameSettings {
  visibilityMode: VisibilityMode;
}

const STORAGE_KEY = 'fog-of-war-settings';

const DEFAULT_SETTINGS: GameSettings = {
  visibilityMode: 'circle',
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.visibilityMode === 'circle' || parsed.visibilityMode === 'flashlight') {
        return { visibilityMode: parsed.visibilityMode };
      }
    }
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
