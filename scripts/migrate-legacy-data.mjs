/**
 * Migración única del esquema legado → esquema v2.
 *   prs { nombre, ejercicio, peso, fecha }      → workoutLogs { userId, exercise, weight, performedAt, ... }
 *   users { username, gender, email, ... }      → profiles { username, gender } (público) + users (privado)
 *   (calcula)                                   → personalBests { bests: { [exercise]: {...} } }
 *   routines { exercises: { ejercicio, series } } → routines { days: { exercise, sets } }
 *
 * Uso (requiere cuenta de servicio, NUNCA commitear el JSON):
 *   npm i -D firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/migrate-legacy-data.mjs --dry-run
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account.json node scripts/migrate-legacy-data.mjs
 *
 * Costo: 1 lectura + ~1 escritura por documento legado. Idempotente: los IDs de workoutLogs
 * reutilizan el ID del doc en 'prs', así que re-ejecutarlo no duplica registros.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_LIMIT = 400; // Firestore admite 500 operaciones por batch; margen de seguridad

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const normalizeExerciseName = (name) =>
  String(name ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();

const toLocalDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

class BatchWriter {
  constructor() {
    this.batch = db.batch();
    this.count = 0;
    this.total = 0;
  }

  async set(ref, data, options) {
    this.total += 1;
    if (DRY_RUN) return;
    this.batch.set(ref, data, options ?? {});
    this.count += 1;
    if (this.count >= BATCH_LIMIT) await this.flush();
  }

  async flush() {
    if (DRY_RUN || this.count === 0) return;
    await this.batch.commit();
    this.batch = db.batch();
    this.count = 0;
  }
}

const migrateProfiles = async (writer) => {
  const usersSnapshot = await db.collection('users').get();
  const uidByUsername = new Map();
  for (const userDoc of usersSnapshot.docs) {
    const { username, gender, email, activeRoutineId } = userDoc.data();
    if (username) uidByUsername.set(username, userDoc.id);
    await writer.set(db.collection('profiles').doc(userDoc.id), {
      username: username ?? 'Atleta',
      usernameLower: (username ?? 'atleta').toLowerCase(),
      gender: gender === 'femenino' ? 'femenino' : 'masculino',
      createdAt: Timestamp.now(),
    }, { merge: true });
    // Reescritura sin merge: elimina username/gender duplicados del doc privado.
    await writer.set(userDoc.ref, { email: email ?? null, activeRoutineId: activeRoutineId ?? null });
  }
  return uidByUsername;
};

const migrateLogs = async (writer, uidByUsername) => {
  const prsSnapshot = await db.collection('prs').orderBy('fecha').get();
  const bestsByUser = {};
  const orphanNames = new Set();
  let migratedCount = 0;

  for (const prDoc of prsSnapshot.docs) {
    const { nombre, ejercicio, peso, fecha } = prDoc.data();
    const userId = uidByUsername.get(nombre);
    if (!userId) {
      orphanNames.add(nombre);
      continue;
    }
    const exercise = normalizeExerciseName(ejercicio);
    const performedAt = new Date(fecha);
    if (!exercise || Number.isNaN(performedAt.getTime())) continue;

    const weight = typeof peso === 'number' && peso >= 0 ? peso : null;
    // Sin reps en el esquema legado: el 1RM estimado se aproxima con el peso bruto.
    const e1rm = weight;
    const userBests = (bestsByUser[userId] ??= { username: nombre, bests: {} });
    const previousBest = userBests.bests[exercise] ?? null;
    const isPr = e1rm !== null && (!previousBest || e1rm > previousBest.e1rm);
    const performedAtTs = Timestamp.fromDate(performedAt);

    await writer.set(db.collection('workoutLogs').doc(prDoc.id), {
      userId, username: nombre, exercise, muscle: null,
      sets: 1, reps: null, weight, e1rm, isPr,
      previousBest: isPr ? previousBest : null,
      performedAt: performedAtTs,
      dateKey: toLocalDateKey(performedAt),
      legacy: true,
    });
    migratedCount += 1;
    if (isPr) userBests.bests[exercise] = { weight, reps: null, e1rm, achievedAt: performedAtTs, logId: prDoc.id };
  }

  for (const [userId, data] of Object.entries(bestsByUser)) {
    await writer.set(db.collection('personalBests').doc(userId), { ...data, updatedAt: Timestamp.now() });
  }
  return { migrated: migratedCount, orphanNames: [...orphanNames] };
};

const migrateRoutines = async (writer) => {
  const routinesSnapshot = await db.collection('routines').get();
  for (const routineDoc of routinesSnapshot.docs) {
    const data = routineDoc.data();
    if (data.days) continue; // Ya migrada
    const days = Object.fromEntries(
      Object.entries(data.exercises ?? {}).map(([day, items]) => [
        day,
        (items ?? []).filter((item) => item.ejercicio).map((item, index) => ({
          id: `${routineDoc.id}-${day}-${index}`,
          exercise: normalizeExerciseName(item.ejercicio),
          sets: Number.parseInt(item.series, 10) || 3,
          reps: String(item.reps ?? ''),
          muscle: null,
        })),
      ]),
    );
    const { exercises: _legacy, id: _duplicatedId, ...rest } = data;
    await writer.set(routineDoc.ref, { ...rest, days, updatedAt: Timestamp.now() });
  }
};

const main = async () => {
  try {
    const writer = new BatchWriter();
    const uidByUsername = await migrateProfiles(writer);
    const logSummary = await migrateLogs(writer, uidByUsername);
    await migrateRoutines(writer);
    await writer.flush();
    console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Escrituras: ${writer.total}`);
    console.log('Logs migrados:', logSummary.migrated);
    if (logSummary.orphanNames.length) console.warn('Nombres sin usuario (no migrados):', logSummary.orphanNames);
  } catch (error) {
    console.error('Migración abortada:', error);
    process.exitCode = 1;
  }
};

main();
