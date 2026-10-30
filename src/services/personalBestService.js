import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { canonicalExerciseName } from '../constants/exercises';
import { toJsDate } from '../utils/dates';

// 1 documento por usuario con su mejor marca por ejercicio.
// Ranking de fuerza = N lecturas (N = usuarios) en lugar de leer todo el historial.
export const subscribeToPersonalBests = (onData, onError) =>
  onSnapshot(
    collection(db, COLLECTIONS.PERSONAL_BESTS),
    (snapshot) => {
      const byUser = {};
      snapshot.docs.forEach((bestDoc) => {
        const data = bestDoc.data();
        // Unifica alias (nombres viejos) conservando la mejor marca por ejercicio canónico.
        const bests = {};
        Object.entries(data.bests ?? {}).forEach(([storedName, best]) => {
          if (!best) return;
          const exercise = canonicalExerciseName(storedName);
          const current = bests[exercise];
          if (!current || (best.e1rm ?? 0) > (current.e1rm ?? 0)) {
            bests[exercise] = { ...best, storedName, achievedAt: toJsDate(best.achievedAt) };
          }
        });
        byUser[bestDoc.id] = { userId: bestDoc.id, username: data.username ?? '', bests };
      });
      onData(byUser);
    },
    onError,
  );
