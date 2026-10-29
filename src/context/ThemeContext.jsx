import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'colossus:theme';
const ThemeContext = createContext(null);

// Paleta de gráficos validada (CVD-safe, orden fijo de slots). Se elige por modo, no se invierte.
const CHART_TOKENS = Object.freeze({
  light: {
    series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    grid: '#e1e0d9',
    axis: '#898781',
    text: '#52514e',
    surface: '#ffffff',
    tooltipBg: '#ffffff',
    targetBand: 'rgba(12, 163, 12, 0.10)',
    status: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
    bodyBase: '#e5e4df',
  },
  dark: {
    series: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
    grid: '#2c2c2a',
    axis: '#898781',
    text: '#c3c2b7',
    surface: '#1a1a19',
    tooltipBg: '#242422',
    targetBand: 'rgba(12, 163, 12, 0.14)',
    status: { good: '#0ca30c', warning: '#fab219', serious: '#ec835a', critical: '#d03b3b' },
    bodyBase: '#2c2c2a',
  },
});

// Respeta la preferencia del sistema operativo si el usuario nunca eligió (antes siempre arrancaba en dark).
const readInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage no disponible: se usa la preferencia del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0d0d0d' : '#f6f6f4');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Persistencia opcional.
    }
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme((current) => (current === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({ theme, toggleTheme, chart: CHART_TOKENS[theme] }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return context;
};
