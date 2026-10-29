import { resolveMuscle } from '../constants/exercises';
import { addDays, diffInCalendarDays, startOfWeek, toDateKey, toWeekKey } from './dates';

// Funciones puras: sin React ni Firestore → testeables de forma aislada.

export const round1 = (value) => Math.round(value * 10) / 10;

// 1RM estimado (Epley). Permite comparar 80kg×5 contra 70kg×10 en una sola escala.
// Más allá de 12 reps la fórmula pierde precisión, por eso se recorta.
const MAX_RELIABLE_REPS = 12;

export const estimateOneRepMax = (weight, reps) => {
  if (!Number.isFinite(weight) || weight <= 0) return null;
  if (!Number.isFinite(reps) || reps <= 1) return round1(weight);
  const cappedReps = Math.min(reps, MAX_RELIABLE_REPS);
  return round1(weight * (1 + cappedReps / 30));
};

// Tonelaje = series × reps × peso. Null si falta algún dato (no se inventan valores).
export const computeTonnage = ({ sets, reps, weight }) => {
  if (![sets, reps, weight].every((value) => Number.isFinite(value) && value > 0)) return null;
  return sets * reps * weight;
};

export const filterByUser = (logs, userId) => logs.filter((log) => log.userId === userId);

// Mejor 1RM estimado por día para un usuario + ejercicio (serie temporal de progresión).
export const buildStrengthSeries = (logs, userId, exercise) => {
  const bestByDay = new Map();
  logs.forEach((log) => {
    if (log.userId !== userId || log.exercise !== exercise || !log.e1rm) return;
    const dayKey = toDateKey(log.performedAt);
    const current = bestByDay.get(dayKey);
    if (!current || log.e1rm > current.e1rm) {
      bestByDay.set(dayKey, {
        time: log.performedAt.getTime(),
        e1rm: log.e1rm,
        weight: log.weight,
        reps: log.reps,
        isPr: Boolean(log.isPr),
      });
    }
  });
  return [...bestByDay.values()].sort((a, b) => a.time - b.time);
};

// Tonelaje semanal por usuario. Devuelve filas { weekKey, [userId]: kg } listas para Recharts.
export const buildWeeklyTonnage = (logs, userIds, since, now = new Date()) => {
  const rows = new Map();
  for (let cursor = startOfWeek(since); cursor <= now; cursor = addDays(cursor, 7)) {
    const weekKey = toDateKey(cursor);
    rows.set(weekKey, { weekKey, time: cursor.getTime(), ...Object.fromEntries(userIds.map((id) => [id, 0])) });
  }
  logs.forEach((log) => {
    if (!userIds.includes(log.userId)) return;
    const row = rows.get(toWeekKey(log.performedAt));
    const tonnage = computeTonnage(log);
    if (row && tonnage) row[log.userId] += tonnage;
  });
  return [...rows.values()];
};

// Series efectivas por músculo en los últimos N días (guía de hipertrofia: ~10–20 series/semana).
export const buildSetsByMuscle = (logs, userId, days = 7, now = new Date()) => {
  const since = addDays(now, -(days - 1));
  const totals = {};
  logs.forEach((log) => {
    if (log.userId !== userId || log.performedAt < since) return;
    const muscle = resolveMuscle(log);
    totals[muscle] = (totals[muscle] ?? 0) + (Number.isFinite(log.sets) ? log.sets : 0);
  });
  return totals;
};

export const buildMuscleLastTrained = (logs, userId) => {
  const lastByMuscle = {};
  logs.forEach((log) => {
    if (log.userId !== userId) return;
    const muscle = resolveMuscle(log);
    const previous = lastByMuscle[muscle];
    if (!previous || log.performedAt > previous.date) {
      lastByMuscle[muscle] = { date: log.performedAt, exercise: log.exercise };
    }
  });
  return lastByMuscle;
};

// Días distintos entrenados (no cantidad de registros: evita premiar registrar de más).
export const countTrainingDays = (logs, userId, since) => {
  const days = new Set();
  logs.forEach((log) => {
    if (log.userId === userId && log.performedAt >= since) days.add(toDateKey(log.performedAt));
  });
  return days.size;
};

// Racha de semanas consecutivas con al menos un entrenamiento (la semana actual no rompe la racha).
export const computeWeekStreak = (logs, userId, now = new Date()) => {
  const trainedWeeks = new Set(filterByUser(logs, userId).map((log) => toWeekKey(log.performedAt)));
  let cursor = startOfWeek(now);
  if (!trainedWeeks.has(toDateKey(cursor))) cursor = addDays(cursor, -7);
  let streak = 0;
  while (trainedWeeks.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
};

export const countPlannedDays = (routine) =>
  routine ? Object.values(routine.days).filter((items) => items.length > 0).length : 0;

// Estado de recuperación/abandono por músculo. Bins discretos: un degradado continuo
// de hue no se distingue a simple vista ni con daltonismo.
export const RECENCY_STATUS = Object.freeze([
  { key: 'good', maxDays: 7, label: '≤ 7 días' },
  { key: 'warning', maxDays: 14, label: '8–14 días' },
  { key: 'serious', maxDays: 27, label: '15–27 días' },
  { key: 'critical', maxDays: Infinity, label: '28+ días / nunca' },
]);

export const classifyRecency = (lastDate, now = new Date()) => {
  if (!lastDate) return { ...RECENCY_STATUS[3], days: null };
  const days = diffInCalendarDays(now, lastDate);
  const status = RECENCY_STATUS.find(({ maxDays }) => days <= maxDays);
  return { ...status, days };
};
