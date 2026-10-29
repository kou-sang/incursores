import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
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
        const bests = Object.fromEntries(
          Object.entries(data.bests ?? {}).map(([exercise, best]) => [
            exercise,
            { ...best, achievedAt: toJsDate(best.achievedAt) },
          ]),
        );
        byUser[bestDoc.id] = { userId: bestDoc.id, username: data.username ?? '', bests };
      });
      onData(byUser);
    },
    onError,
  );
