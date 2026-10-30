import {
  collection,
  deleteField,
  doc,
  FieldPath,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS, QUERY_LIMITS } from '../constants/collections';
import { canonicalExerciseName } from '../constants/exercises';
import { toDateKey, toJsDate } from '../utils/dates';
import { ValidationError } from '../utils/errors';
import { estimateOneRepMax } from '../utils/metrics';
import { sanitizeLogEntry } from './validation';

const mapLogDoc = (snapshot) => {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    userId: data.userId,
    username: data.username ?? '',
    exercise: canonicalExerciseName(data.exercise), // Logs viejos con alias ("ALT CON MANCUERNA") se unifican
    storedExercise: data.exercise, // Nombre tal cual está en Firestore (necesario para borrar el PR correcto)
    muscle: data.muscle ?? null,
    sets: data.sets ?? null,
    reps: data.reps ?? null,
    weight: data.weight ?? null,
    e1rm: data.e1rm ?? null,
    isPr: Boolean(data.isPr),
    previousBest: data.previousBest ?? null,
    // hasPendingWrites: true mientras el registro solo existe en la caché local (offline).
    isPending: snapshot.metadata.hasPendingWrites,
    performedAt: toJsDate(data.performedAt) ?? new Date(),
  };
};

/**
 * Suscripción acotada por fecha y usuarios.
 * El original escuchaba la colección completa: cada apertura de la app = 1 lectura por
 * registro histórico de TODOS los usuarios (crecimiento lineal e ilimitado del costo).
 */
export const subscribeToLogs = (
  { since, until = null, userIds, onlyRecords = false, maxResults = QUERY_LIMITS.MAX_LOGS_PER_QUERY },
  onData,
  onError,
) => {
  if (userIds && userIds.length === 0) {
    onData([]);
    return () => {};
  }
  if (userIds && userIds.length > QUERY_LIMITS.MAX_USERS_PER_IN_QUERY) {
    throw new ValidationError(`Máximo ${QUERY_LIMITS.MAX_USERS_PER_IN_QUERY} perfiles por consulta.`);
  }

  const constraints = [];
  if (userIds) constraints.push(where('userId', 'in', userIds));
  if (onlyRecords) constraints.push(where('isPr', '==', true)); // Feed de PRs: lee solo récords, no todo el historial
  if (since) constraints.push(where('performedAt', '>=', Timestamp.fromDate(since)));
  if (until) constraints.push(where('performedAt', '<=', Timestamp.fromDate(until))); // Rango personalizado de analíticas
  constraints.push(orderBy('performedAt', 'desc'), limit(maxResults));

  return onSnapshot(
    query(collection(db, COLLECTIONS.LOGS), ...constraints),
    { includeMetadataChanges: true },
    (snapshot) => onData(snapshot.docs.map(mapLogDoc), { isTruncated: snapshot.size >= maxResults }),
    onError,
  );
};

/**
 * Registra un ejercicio y, si supera el mejor 1RM estimado, actualiza el agregado personalBests.
 * Se usa writeBatch (no transaction) porque las transacciones fallan sin conexión.
 * Devuelve inmediatamente; `committed` resuelve cuando el servidor confirma (puede tardar offline).
 */
export const createWorkoutLog = ({ userId, username, entry, currentBest }) => {
  const clean = sanitizeLogEntry(entry);
  const e1rm = estimateOneRepMax(clean.weight, clean.reps);
  const isPr = e1rm !== null && (!currentBest?.e1rm || e1rm > currentBest.e1rm);
  const performedAt = Timestamp.now();

  const logRef = doc(collection(db, COLLECTIONS.LOGS));
  const batch = writeBatch(db);

  batch.set(logRef, {
    userId,
    username,
    ...clean,
    e1rm,
    isPr,
    previousBest: isPr ? (currentBest ?? null) : null,
    performedAt,
    dateKey: toDateKey(performedAt.toDate()),
  });

  if (isPr) {
    batch.set(
      doc(db, COLLECTIONS.PERSONAL_BESTS, userId),
      {
        username,
        updatedAt: performedAt,
        bests: { [clean.exercise]: { weight: clean.weight, reps: clean.reps, e1rm, achievedAt: performedAt, logId: logRef.id } },
      },
      { merge: true },
    );
  }

  return { logId: logRef.id, isPr, e1rm, committed: batch.commit() };
};

// Deshacer un registro. Solo restaura el PR anterior si este log sigue siendo el récord vigente.
export const deleteWorkoutLog = (log, currentBest) => {
  const batch = writeBatch(db);
  batch.delete(doc(db, COLLECTIONS.LOGS, log.id));
  if (log.isPr && currentBest?.logId === log.id) {
    batch.update(
      doc(db, COLLECTIONS.PERSONAL_BESTS, log.userId),
      new FieldPath('bests', log.storedExercise ?? log.exercise),
      log.previousBest ?? deleteField(),
    );
  }
  return batch.commit();
};
