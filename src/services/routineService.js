import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { WEEK_DAYS } from '../utils/dates';
import { ValidationError } from '../utils/errors';
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
    // setDoc sin merge reemplaza el doc → elimina el campo legado 'exercises'.
    await setDoc(doc(db, COLLECTIONS.ROUTINES, routine.id), {
      ...payload,
      createdAt: routine.createdAt ?? serverTimestamp(),
    });
    return routine.id;
  }
  const created = await addDoc(collection(db, COLLECTIONS.ROUTINES), { ...payload, createdAt: serverTimestamp() });
  return created.id;
};

export const duplicateRoutine = async (routine, owner, suffix = '(Copia)') => {
  const copy = { ...routine, id: null, createdAt: null, name: `${routine.name} ${suffix}`.slice(0, 60) };
  return saveRoutine(copy, owner);
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
