/**
 * Light, dark, or whatever the system says. The choice lives outside the vault
 * (it is needed on the lock screen) and is applied before the first paint, so
 * a dark page never flashes white on its way in.
 */
export const THEME_KEY = 'ph.theme';
export type ThemePreference = 'system' | 'light' | 'dark';

let preference: ThemePreference = 'system';
const media = matchMedia('(prefers-color-scheme: dark)');

function apply(): void {
  const dark = preference === 'dark' || (preference === 'system' && media.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

function read(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export async function startTheme(): Promise<void> {
  try {
    preference = read((await chrome.storage.local.get(THEME_KEY))[THEME_KEY]);
  } catch {
    preference = 'system';
  }
  apply();
  media.addEventListener('change', apply);
  chrome.storage.onChanged?.addListener((changes, area) => {
    if (area === 'local' && THEME_KEY in changes) {
      preference = read(changes[THEME_KEY]!.newValue);
      apply();
    }
  });
}

export function currentTheme(): ThemePreference {
  return preference;
}

export async function setTheme(next: ThemePreference): Promise<void> {
  preference = next;
  apply();
  if (next === 'system') await chrome.storage.local.remove(THEME_KEY);
  else await chrome.storage.local.set({ [THEME_KEY]: next });
}
