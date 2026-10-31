// Todas las fechas de negocio se calculan en hora LOCAL.
// Bug original: toISOString() usa UTC → en UTC-3 a partir de las 21:00 "hoy" ya era mañana,
// y new Date('YYYY-MM-DD') se interpreta como UTC → el gráfico mostraba el día anterior.

const MS_PER_DAY = 86_400_000;

// Indexado por Date#getDay() (0 = domingo) para evitar el mapeo manual propenso a errores.
const DAY_KEYS_BY_INDEX = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export const WEEK_DAYS = Object.freeze(['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']);

const pad = (value) => String(value).padStart(2, '0');

// Acepta Timestamp de Firestore, Date, ISO string o epoch. Devuelve null si es inválido.
export const toJsDate = (value) => {
  try {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

export const toDateKey = (value = new Date()) => {
  const date = toJsDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Parseo local de 'YYYY-MM-DD' (evita el corrimiento UTC de new Date(string)).
export const parseDateKey = (dateKey) => {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const getDayKey = (value = new Date()) => DAY_KEYS_BY_INDEX[toJsDate(value)?.getDay() ?? 0];

export const startOfDay = (value = new Date()) => {
  const date = new Date(toJsDate(value) ?? Date.now());
  date.setHours(0, 0, 0, 0);
  return date;
};

export const endOfDay = (value = new Date()) => {
  const date = startOfDay(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const addDays = (value, amount) => {
  const date = new Date(toJsDate(value) ?? Date.now());
  date.setDate(date.getDate() + amount);
  return date;
};

// Diferencia en días calendario (no en bloques de 24h), robusta ante cambios de horario.
export const diffInCalendarDays = (later, earlier) => {
  const a = startOfDay(later);
  const b = startOfDay(earlier);
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
};

// Semana ISO: comienza el lunes.
export const startOfWeek = (value = new Date()) => {
  const date = startOfDay(value);
  const offset = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - offset);
  return date;
};

export const toWeekKey = (value) => toDateKey(startOfWeek(value));

const shortDateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short' });
const longDateFormatter = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

export const formatShortDate = (value) => {
  const date = toJsDate(value);
  return date ? shortDateFormatter.format(date) : '—';
};

export const formatLongDate = (value) => {
  const date = toJsDate(value);
  return date ? longDateFormatter.format(date) : '—';
};

const timeFormatter = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit', hour12: false });
const dayTimeFormatter = new Intl.DateTimeFormat('es', { weekday: 'short', day: 'numeric', month: 'short' });

// "18:45"
export const formatTime = (value) => {
  const date = toJsDate(value);
  return date ? timeFormatter.format(date) : '—';
};

// "vie 30 oct, 18:45"
export const formatDayTime = (value) => {
  const date = toJsDate(value);
  return date ? `${dayTimeFormatter.format(date).replace(',', '')}, ${timeFormatter.format(date)}` : '—';
};

export const formatRelativeDays = (days) => {
  if (days === null || days === undefined) return 'Nunca';
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  return `Hace ${days} días`;
};

// Etiqueta de una semana (lunes) en gráficos semanales: avisa si quedó cortada por el rango o si está en curso.
export const describeWeek = (weekStartMs, rangeStart, rangeEnd, now = new Date()) => {
  const weekStart = new Date(weekStartMs);
  const weekEnd = addDays(weekStart, 7);
  const base = `Semana del ${formatShortDate(weekStart)}`;
  if (rangeStart && weekStart < startOfDay(rangeStart)) return `${base} (incompleta: el rango empieza el ${formatShortDate(rangeStart)})`;
  if (now < weekEnd && (!rangeEnd || rangeEnd >= now)) return `${base} (en curso)`;
  if (rangeEnd && rangeEnd < addDays(weekEnd, -1)) return `${base} (incompleta: el rango termina el ${formatShortDate(rangeEnd)})`;
  return base;
};
