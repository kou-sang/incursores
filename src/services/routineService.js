import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { WEEK_DAYS } from '../utils/dates';
import { logError, ValidationError } from '../utils/errors';
import { sanitizeRoutineItem } from './validation';

const createItemId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

// Series/reps/kg vacíos = opcionales: al guardar se aplican los valores por defecto (3 × 10, sin kg).
export const createEmptyRoutineItem = () => ({ id: createItemId(), exercise: '', sets: '', reps: '', weight: '', muscle: null });

export const createEmptyRoutine = () => ({
  id: null,
  name: '',
  days: Object.fromEntries(WEEK_DAYS.map((day) => [day, []])),
});

// Soporta el esquema legado { exercises: { lunes: [{ ejercicio, series, reps }] } }
// y el nuevo { days: { lunes: [{ id, exercise, sets, reps, muscle }] } }.
export const normalizeRoutine = (id, data) => {
  const rawDays = data.days ?? data.exercises ?? {};
  const days = Object.fromEntries(
    WEEK_DAYS.map((day) => [
      day,
      (rawDays[day] ?? []).map((item) => ({
        id: item.id ?? createItemId(),
        exercise: item.exercise ?? item.ejercicio ?? '',
        sets: Number(item.sets ?? item.series) || 3,
        reps: String(item.reps ?? ''),
        weight: item.weight ?? '', // kg objetivo opcional (rutinas viejas no lo tienen)
        muscle: item.muscle ?? null,
      })),
    ]),
  );
  return {
    id,
    name: data.name ?? 'Sin nombre',
    authorId: data.authorId,
    authorName: data.authorName ?? '',
    createdAt: data.createdAt ?? null,
    // Personas distintas que importaron esta rutina (lo mantienen las reglas: +1 por persona).
    copyCount: Number.isFinite(data.copyCount) ? data.copyCount : 0,
    copiedFrom: data.copiedFrom ?? null,
    days,
  };
};

// Solo rutinas propias: el original descargaba las rutinas de TODOS los usuarios.
export const subscribeToOwnRoutines = (uid, onData, onError) =>
  onSnapshot(
    query(collection(db, COLLECTIONS.ROUTINES), where('authorId', '==', uid)),
    (snapshot) =>
      onData(
        snapshot.docs
          .map((routineDoc) => normalizeRoutine(routineDoc.id, routineDoc.data()))
          .sort((a, b) => a.name.localeCompare(b.name, 'es')),
      ),
    onError,
  );

const buildRoutinePayload = (routine, owner) => {
  const name = String(routine.name ?? '').trim();
  if (!name || name.length > 60) throw new ValidationError('El nombre de la rutina es obligatorio (máx. 60).');

  const days = Object.fromEntries(
    WEEK_DAYS.map((day) => [day, (routine.days[day] ?? []).map(sanitizeRoutineItem).filter(Boolean)]),
  );
  if (Object.values(days).every((items) => items.length === 0)) {
    throw new ValidationError('Agrega al menos un ejercicio.');
  }

  // El 'id' no se persiste dentro del documento (el original lo duplicaba en el payload).
  return { name, days, authorId: owner.id, authorName: owner.username, updatedAt: serverTimestamp() };
};

export const saveRoutine = async (routine, owner) => {
  const payload = buildRoutinePayload(routine, owner);
  if (routine.id) {
    const routineRef = doc(db, COLLECTIONS.ROUTINES, routine.id);
    try {
      // updateDoc (no setDoc): conserva `copyCount`, que otras personas incrementan y el autor no puede modificar.
      // `exercises: deleteField()` elimina el campo del esquema legado.
      await updateDoc(routineRef, { ...payload, exercises: deleteField() });
    } catch (updateError) {
      if (updateError?.code !== 'not-found') throw updateError;
      // La rutina fue eliminada mientras se editaba: se vuelve a crear con el mismo id.
      await setDoc(routineRef, { ...payload, createdAt: routine.createdAt ?? serverTimestamp() });
    }
    return routine.id;
  }
  const created = await addDoc(collection(db, COLLECTIONS.ROUTINES), {
    ...payload,
    ...(routine.copiedFrom ? { copiedFrom: routine.copiedFrom } : {}),
    createdAt: serverTimestamp(),
  });
  return created.id;
};

export const duplicateRoutine = async (routine, owner, suffix = '(Copia)') => {
  // Duplicar una rutina propia no cuenta como "copia" en la estadística (solo importar la de otra persona).
  const copy = { ...routine, id: null, createdAt: null, copiedFrom: null, name: `${routine.name} ${suffix}`.slice(0, 60) };
  return saveRoutine(copy, owner);
};

/**
 * Suma 1 a `copyCount` de la rutina original, una sola vez por persona.
 * El doc routines/{id}/copies/{uid} actúa de "marca": las reglas solo permiten el +1 si esa marca se crea
 * en el mismo lote, así nadie puede inflar la cifra repitiendo la acción. Devuelve true si sumó.
 */
export const registerRoutineCopy = async (routineId, uid) => {
  const copyRef = doc(db, COLLECTIONS.ROUTINES, routineId, 'copies', uid);
  if ((await getDoc(copyRef)).exists()) return false;
  const batch = writeBatch(db);
  batch.set(copyRef, { createdAt: serverTimestamp() });
  batch.update(doc(db, COLLECTIONS.ROUTINES, routineId), { copyCount: increment(1) });
  await batch.commit();
  return true;
};

/**
 * Importa la rutina de otra persona (enlace o chat de grupo) y registra la copia.
 * La estadística es secundaria: si falla (reglas sin desplegar, sin conexión) la importación igual se concluye.
 */
export const importSharedRoutine = async (source, owner) => {
  const copy = { ...source, id: null, createdAt: null, copiedFrom: source.id, name: `${source.name} (Importada)`.slice(0, 60) };
  const newId = await saveRoutine(copy, owner);
  let counted = false;
  if (source.authorId && source.authorId !== owner.id) {
    try {
      counted = await registerRoutineCopy(source.id, owner.id);
    } catch (countError) {
      logError('routine:count-copy', countError);
    }
  }
  return { id: newId, counted };
};

/**
 * Agrega un ejercicio al final de un día de una rutina existente (usado desde la pestaña Ejercicios).
 * Series y repeticiones vacías toman los valores por defecto (3 × 10).
 */
export const addExerciseToRoutine = async (routine, { day, exercise, sets, reps }, owner) => {
  if (!WEEK_DAYS.includes(day)) throw new ValidationError('Elige un día válido.');
  const newItem = { ...createEmptyRoutineItem(), exercise, sets, reps };
  const days = { ...routine.days, [day]: [...(routine.days[day] ?? []), newItem] };
  return saveRoutine({ ...routine, days }, owner);
};

export const fetchRoutine = async (routineId) => {
  const snapshot = await getDoc(doc(db, COLLECTIONS.ROUTINES, routineId));
  if (!snapshot.exists()) throw new ValidationError('La rutina compartida ya no existe.');
  return normalizeRoutine(snapshot.id, snapshot.data());
};

export const deleteRoutine = (routineId) => deleteDoc(doc(db, COLLECTIONS.ROUTINES, routineId));

export const buildShareUrl = (routineId) => {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('shareRoutine', routineId);
  return url.toString();
};
