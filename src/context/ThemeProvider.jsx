import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyCustomColors,
  CHART_TOKENS,
  CUSTOM_COLORS_KEY,
  CUSTOM_KEYS,
  MAX_RECENT_COLORS,
  normalizeHex,
  RECENT_COLORS_KEY,
  readInitialTheme,
  readStoredCustomColors,
  readStoredRecentColors,
  sanitizeCustomColors,
  sanitizeRecentColors,
  THEME_STORAGE_KEY,
  ThemeContext,
} from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);
  const [customColors, setCustomColors] = useState(readStoredCustomColors);
  // Últimos colores personalizados elegidos (más reciente primero): se ofrecen como atajos en el selector.
  const [recentColors, setRecentColors] = useState(readStoredRecentColors);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recentColors));
    } catch {
      // Persistencia opcional.
    }
  }, [recentColors]);

  const rememberColor = useCallback((value) => {
    const hex = normalizeHex(value);
    if (!hex) return;
    setRecentColors((current) => (current[0] === hex ? current : [hex, ...current.filter((item) => item !== hex)].slice(0, MAX_RECENT_COLORS)));
  }, []);

  const replaceRecentColors = useCallback((raw) => {
    const next = sanitizeRecentColors(raw);
    setRecentColors((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Persistencia opcional.
    }
  }, [theme]);

  useEffect(() => {
    const activeColors = customColors[theme] ?? {};
    applyCustomColors(activeColors);
    const themeColor = activeColors.bg ?? (theme === 'dark' ? '#0d0d0d' : '#f6f6f4');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    try {
      localStorage.setItem(CUSTOM_COLORS_KEY, JSON.stringify(customColors));
    } catch {
      // Persistencia opcional.
    }
  }, [customColors, theme]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);

  const setCustomColor = useCallback((mode, key, value) => {
    const hex = normalizeHex(value);
    if (!CUSTOM_KEYS.has(key) || !hex) return false;
    setCustomColors((current) => ({ ...current, [mode]: { ...current[mode], [key]: hex } }));
    return true;
  }, []);

  const resetCustomColors = useCallback((mode) => {
    setCustomColors((current) => (mode ? { ...current, [mode]: {} } : { light: {}, dark: {} }));
  }, []);

  // Sincronización desde Firestore (otro dispositivo). Solo reemplaza si cambió algo.
  const replaceCustomColors = useCallback((raw) => {
    const next = sanitizeCustomColors(raw);
    setCustomColors((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
  }, []);

  const chart = useMemo(() => {
    const base = CHART_TOKENS[theme];
    const custom = customColors[theme] ?? {};
    return {
      ...base,
      surface: custom.surface ?? base.surface,
      tooltipBg: custom['surface-2'] ?? custom.surface ?? base.tooltipBg,
      text: custom['text-2'] ?? base.text,
    };
  }, [theme, customColors]);

  const value = useMemo(
    () => ({
      theme, toggleTheme, chart, customColors, setCustomColor, resetCustomColors, replaceCustomColors,
      recentColors, rememberColor, replaceRecentColors,
    }),
    [theme, toggleTheme, chart, customColors, setCustomColor, resetCustomColors, replaceCustomColors, recentColors, rememberColor, replaceRecentColors],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
