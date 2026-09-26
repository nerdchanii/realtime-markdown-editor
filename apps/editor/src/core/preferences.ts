// Per-viewer UI preferences (theme, explorer panel). Storage may be unavailable, so every access
// falls back to the default instead of failing.

export function readPreference(key: string, fallback: string): string {
  try {
    return window.localStorage.getItem(`rme:${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePreference(key: string, value: string): void {
  try {
    window.localStorage.setItem(`rme:${key}`, value);
  } catch {
    // Preferences are a convenience; ignore storage failures.
  }
}
