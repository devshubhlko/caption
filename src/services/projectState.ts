import React from 'react';

/**
 * Shared Project Media State Store
 * Guarantees that large file data (cropped images, audio files, object URLs) are preserved
 * 100% reliably between Editor and Studio screens without data loss.
 */

export interface ProjectState {
  projectType: 'canvas' | 'image';
  aspectRatio: '9:16' | '16:9';
  canvasBgColor: string;
  imageUri: string | null;
  audioUri: string | null;
  audioName: string | null;
}

let activeProjectState: ProjectState = {
  projectType: 'canvas',
  aspectRatio: '9:16',
  canvasBgColor: '#0f172a',
  imageUri: null,
  audioUri: null,
  audioName: null,
};

const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {}
  });
}

export function setProjectImageUri(uri: string | null) {
  activeProjectState.imageUri = uri;
  notifyListeners();
}

export function getProjectImageUri(): string | null {
  return activeProjectState.imageUri;
}

export function updateProjectState(updates: Partial<ProjectState>) {
  activeProjectState = {
    ...activeProjectState,
    ...updates,
  };
  notifyListeners();
}

export function getProjectState(): ProjectState {
  return { ...activeProjectState };
}

export function subscribeProjectState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Global App Theme State (Dark / Light Mode) with LocalStorage Persistence
const THEME_STORAGE_KEY = 'app_theme_mode';

function getInitialTheme(): boolean {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light') return false;
      if (savedTheme === 'dark') return true;
    } catch {}
  }
  return true; // Default to dark mode
}

let globalIsDarkMode = getInitialTheme();
const themeListeners: Set<() => void> = new Set();

function applyThemeToDom(isDark: boolean) {
  if (typeof document !== 'undefined') {
    const themeStr = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeStr);
    if (document.body) {
      document.body.setAttribute('data-theme', themeStr);
    }
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0b0f19' : '#f8fafc');
    }
  }
}

// Apply immediately on boot
applyThemeToDom(globalIsDarkMode);

// Listen to multi-tab storage updates
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === THEME_STORAGE_KEY && e.newValue) {
      const newIsDark = e.newValue === 'dark';
      if (newIsDark !== globalIsDarkMode) {
        globalIsDarkMode = newIsDark;
        applyThemeToDom(newIsDark);
        themeListeners.forEach((fn) => fn());
      }
    }
  });
}

export function getIsDarkMode(): boolean {
  return globalIsDarkMode;
}

export function setIsDarkMode(isDark: boolean) {
  globalIsDarkMode = isDark;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {}
  }
  applyThemeToDom(isDark);
  themeListeners.forEach((fn) => fn());
}

export function toggleTheme(): boolean {
  const nextTheme = !globalIsDarkMode;
  setIsDarkMode(nextTheme);
  return nextTheme;
}

export function subscribeTheme(listener: () => void) {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

export function useAppTheme() {
  const [isDark, setIsDark] = React.useState<boolean>(globalIsDarkMode);

  React.useEffect(() => {
    const unsub = subscribeTheme(() => {
      setIsDark(globalIsDarkMode);
    });
    return unsub;
  }, []);

  const theme = {
    isDark,
    bg: isDark ? '#0b0f19' : '#f8fafc',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    innerBg: isDark ? '#0f172a' : '#f1f5f9',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#334155' : '#e2e8f0',
    primary: '#6366f1',
    primaryLight: '#818cf8',
    cardActiveBorder: '#6366f1',
    cardActiveBg: isDark ? '#1e1e38' : '#eef2ff',
  };

  return { isDark, theme, toggleTheme, setIsDarkMode };
}
