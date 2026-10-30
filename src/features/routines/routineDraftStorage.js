import { logError } from '../../utils/errors';

/*
 * Borrador de rutina en localStorage (por usuario). Sobrevive a cambiar de pestaña dentro de la app,
 * a minimizar el navegador en el celular (que suele descartar la página) y a recargar.
 * Se guarda también la versión original para saber si hay cambios sin guardar.
 */
const keyFor = (userId) => `colossus:routine-draft:${userId}`;
const MAX_DRAFT_AGE_MS = 30 * 24 * 60 * 60 * 1000; // Borradores de más de 30 días se descartan

export const readRoutineDraft = (userId) => {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.draft?.days || Date.now() - (parsed.savedAt ?? 0) > MAX_DRAFT_AGE_MS) {
      localStorage.removeItem(keyFor(userId));
      return null;
    }
    return parsed;
  } catch (error) {
    logError('routine-draft:read', error);
    return null;
  }
};

export const writeRoutineDraft = (userId, { draft, original }) => {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify({ draft, original, savedAt: Date.now() }));
  } catch (error) {
    // Cuota llena o modo privado: el editor sigue funcionando, solo sin respaldo.
    logError('routine-draft:write', error);
  }
};

export const clearRoutineDraft = (userId) => {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch (error) {
    logError('routine-draft:clear', error);
  }
};

// Comparación por contenido (sin ids de fila ni timestamps) para detectar cambios reales.
export const routineSignature = (routine) =>
  JSON.stringify({
    name: routine?.name ?? '',
    days: Object.fromEntries(
      Object.entries(routine?.days ?? {}).map(([day, items]) => [
        day,
        items.map(({ exercise, sets, reps, weight }) => [exercise, String(sets ?? ''), String(reps ?? ''), String(weight ?? '')]),
      ]),
    ),
  });
