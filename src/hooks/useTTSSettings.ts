import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "devpath-tts-settings";

interface TTSSettings {
  enabled: boolean;
  rate: number;
  voiceName: string;
}

const DEFAULT_SETTINGS: TTSSettings = {
  enabled: false,
  rate: 1,
  voiceName: "",
};

// Simple external store so all components share the same state
let listeners: Array<() => void> = [];
let cachedSettings: TTSSettings | null = null;

function getSettings(): TTSSettings {
  if (cachedSettings) return cachedSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cachedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      return cachedSettings;
    }
  } catch {
    // ignore
  }
  cachedSettings = DEFAULT_SETTINGS;
  return cachedSettings;
}

function saveSettings(settings: TTSSettings) {
  cachedSettings = settings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): TTSSettings {
  return getSettings();
}

/**
 * Shared TTS settings persisted in localStorage.
 * Used by both Profile (to configure) and LessonViewer (to read).
 */
export function useTTSSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot);

  const setEnabled = useCallback((enabled: boolean) => {
    saveSettings({ ...getSettings(), enabled });
  }, []);

  const setRate = useCallback((rate: number) => {
    saveSettings({ ...getSettings(), rate });
  }, []);

  const setVoiceName = useCallback((voiceName: string) => {
    saveSettings({ ...getSettings(), voiceName });
  }, []);

  const availableVoices = useMemo(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
  }, []);

  return {
    ...settings,
    setEnabled,
    setRate,
    setVoiceName,
    availableVoices,
  };
}
