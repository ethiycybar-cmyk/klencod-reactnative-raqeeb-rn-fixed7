import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './tokens';
import { storage } from '../data/storage';

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  setDark: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = storage.getString('theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return systemScheme === 'dark';
  });

  const value = useMemo<ThemeContextValue>(() => {
    const setDark = (next: boolean) => {
      setIsDark(next);
      storage.set('theme', next ? 'dark' : 'light');
    };
    return { theme: isDark ? darkTheme : lightTheme, isDark, setDark };
  }, [isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
