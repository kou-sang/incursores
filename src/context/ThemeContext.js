import { createContext, useContext } from 'react';

// Contexto, tokens y utilidades puras del tema. El proveedor vive en ThemeProvider.jsx (react-refresh).
export const THEME_STORAGE_KEY = 'colossus:theme';
export const CUSTOM_COLORS_KEY = 'colossus:custom-colors';
export const ThemeContext = createContext(null);

// Paleta de gráficos validada (CVD-safe, orden fijo de slots). Se elige por modo, no se invierte.
export const CHART_TOKENS = Object.freeze({
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
    bodyOutline: '#1b1b1a',
    // Ramp secuencial verde (un solo tono, claro → oscuro) para el estímulo muscular. Índice = nivel 1–5.
    stimulus: ['#e5e4df', '#c6e9c0', '#8fd18a', '#4fae4f', '#1f8a2a', '#0b5e17'],
    // Recuperación: verde (entrenado hoy) → amarillo → naranja → rojo (crítico: 30+ días o nunca).
    recencyStops: [[0, '#0ca30c'], [7, '#7cbf1f'], [14, '#fab219'], [21, '#ec835a'], [30, '#d03b3b']],
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
    bodyBase: '#3a3a37',
    bodyOutline: '#050505',
    // En oscuro el ramp va de apagado → brillante (más estímulo = más luminoso sobre fondo oscuro).
    stimulus: ['#3a3a37', '#1f4a24', '#2a6e31', '#3a9a42', '#5cc463', '#9be89f'],
    // Recuperación: verde (entrenado hoy) → amarillo → naranja → rojo (crítico: 30+ días o nunca).
    recencyStops: [[0, '#0ca30c'], [7, '#7cbf1f'], [14, '#fab219'], [21, '#ec835a'], [30, '#d03b3b']],
  },
});

/*
 * Colores personalizables desde Perfil. Cada clave es una variable CSS de theme.css.
 * `defaults` solo sirve para inicializar el color picker (el borde real usa rgba).
 */
export const CUSTOM_COLOR_FIELDS = Object.freeze([
  { key: 'bg', label: 'Fondo de la app', defaults: { light: '#f6f6f4', dark: '#0d0d0d' } },
  { key: 'surface', label: 'Tarjetas', defaults: { light: '#ffffff', dark: '#1a1a19' } },
  { key: 'surface-2', label: 'Campos y superficies secundarias', defaults: { light: '#f1f1ee', dark: '#242422' } },
  { key: 'text', label: 'Texto principal', defaults: { light: '#0b0b0b', dark: '#f0efec' } },
  { key: 'text-2', label: 'Texto secundario', defaults: { light: '#52514e', dark: '#c3c2b7' } },
  { key: 'muted', label: 'Texto atenuado', defaults: { light: '#6b6a65', dark: '#9a9890' } },
  { key: 'accent', label: 'Acento (botones, pestaña activa)', defaults: { light: '#d32f2f', dark: '#ef5350' } },
  { key: 'border', label: 'Bordes', defaults: { light: '#e2e2e0', dark: '#2b2b2a' } },
]);

export const CUSTOM_KEYS = new Set(CUSTOM_COLOR_FIELDS.map(({ key }) => key));
const DERIVED_VARIABLES = ['accent-hover', 'accent-soft', 'on-accent'];
const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

export const normalizeHex = (value) => {
  const raw = String(value ?? '').trim().replace(/^#?/, '#');
  if (/^#[0-9a-f]{3}$/i.test(raw)) return `#${raw.slice(1).split('').map((char) => char + char).join('')}`.toLowerCase();
  return HEX_PATTERN.test(raw) ? raw.toLowerCase() : null;
};

// Luminancia relativa WCAG → permite elegir texto blanco/negro sobre el acento y avisar contraste bajo.
export const relativeLuminance = (hex) => {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (hexA, hexB) => {
  const a = normalizeHex(hexA);
  const b = normalizeHex(hexB);
  if (!a || !b) return null;
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return Math.round(((light + 0.05) / (dark + 0.05)) * 10) / 10;
};

// Sanea lo que venga de localStorage/Firestore: solo claves conocidas y hex válidos.
export const sanitizeCustomColors = (raw) => {
  const result = { light: {}, dark: {} };
  ['light', 'dark'].forEach((mode) => {
    Object.entries(raw?.[mode] ?? {}).forEach(([key, value]) => {
      const hex = normalizeHex(value);
      if (CUSTOM_KEYS.has(key) && hex) result[mode][key] = hex;
    });
  });
  return result;
};

export const readStoredCustomColors = () => {
  try {
    return sanitizeCustomColors(JSON.parse(localStorage.getItem(CUSTOM_COLORS_KEY) ?? 'null'));
  } catch {
    return sanitizeCustomColors(null);
  }
};

// Respeta la preferencia del sistema operativo si el usuario nunca eligió (antes siempre arrancaba en dark).
export const readInitialTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage no disponible: se usa la preferencia del sistema.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Aplica overrides como estilos inline en <html> (ganan sobre :root / :root.dark sin tocar theme.css).
export const applyCustomColors = (colors) => {
  const root = document.documentElement;
  [...CUSTOM_KEYS, ...DERIVED_VARIABLES].forEach((key) => root.style.removeProperty(`--${key}`));
  Object.entries(colors).forEach(([key, hex]) => root.style.setProperty(`--${key}`, hex));
  if (colors.accent) {
    root.style.setProperty('--accent-hover', `color-mix(in srgb, ${colors.accent} 82%, ${relativeLuminance(colors.accent) > 0.4 ? 'black' : 'white'})`);
    root.style.setProperty('--accent-soft', `color-mix(in srgb, ${colors.accent} 14%, transparent)`);
    root.style.setProperty('--on-accent', relativeLuminance(colors.accent) > 0.45 ? '#0b0b0b' : '#ffffff');
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return context;
};
