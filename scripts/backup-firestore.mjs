import { mkdir, writeFile } from 'node:fs/promises';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Colecciones que la migración reescribe o usa como fuente.
const COLLECTIONS_TO_BACKUP = ['users', 'routines', 'prs'];

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

// Convierte tipos de Firestore a JSON serializable conservando su tipo original para restaurar.
const serialize = (value) => {
  if (value === null || typeof value !== 'object') return value;
  if (typeof value.toDate === 'function') return { __timestamp: value.toDate().toISOString() };
  if (typeof value.path === 'string' && value.firestore) return { __ref: value.path };
  if (Array.isArray(value)) return value.map(serialize);
  return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serialize(nested)]));
};

const main = async () => {
  try {
    const folder = `backups/${new Date().toISOString().replace(/[:.]/g, '-')}`;
    await mkdir(folder, { recursive: true });

    for (const collectionName of COLLECTIONS_TO_BACKUP) {
      const snapshot = await db.collection(collectionName).get();
      const documents = snapshot.docs.map((document) => ({ id: document.id, data: serialize(document.data()) }));
      await writeFile(`${folder}/${collectionName}.json`, JSON.stringify(documents, null, 2), 'utf8');
      console.log(`${collectionName}: ${documents.length} documentos`);
    }
    console.log(`Respaldo completo en ${folder}`);
  } catch (error) {
    console.error('Respaldo abortado:', error);
    process.exitCode = 1;
  }
};

main();