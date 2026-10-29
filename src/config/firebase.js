import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

// Lee la configuración exclusivamente desde variables de entorno (.env.local).
// No hay fallbacks hardcodeados: un deploy mal configurado debe fallar ruidosamente.
const readFirebaseConfig = () => {
  const env = import.meta.env;
  const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`[firebase] Faltan variables de entorno: ${missingKeys.join(', ')}`);
  }
  return config;
};

export const firebaseApp = initializeApp(readFirebaseConfig());
export const auth = getAuth(firebaseApp);

// Caché persistente en IndexedDB: permite registrar series sin señal (gimnasios en sótanos)
// y sincroniza al recuperar conexión. Multi-tab evita el error de "persistence already enabled".
export const db = initializeFirestore(firebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
