import * as React from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'downloadmp3-theme';

export const useTheme = () => {
  const [theme, setTheme] = React.useState<ThemeMode>(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored ?? 'system';
  });

  React.useEffect(() => {
    const root = document.documentElement;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

    root.classList.toggle('dark', resolvedTheme === 'dark');
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme };
};
