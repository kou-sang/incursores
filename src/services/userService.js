import { collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { sanitizeGender, sanitizeUsername } from './validation';

// Separación público/privado: el código original escuchaba TODA la colección 'users',
// que incluía emails → cualquier usuario podía ver el correo de todos.

export const subscribeToProfile = (uid, onData, onError) =>
  onSnapshot(
    doc(db, COLLECTIONS.PROFILES, uid),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  );

export const subscribeToAccount = (uid, onData, onError) =>
  onSnapshot(
    doc(db, COLLECTIONS.USERS, uid),
    (snapshot) => onData(snapshot.exists() ? snapshot.data() : null),
    onError,
  );

export const subscribeToProfiles = (onData, onError) =>
  onSnapshot(
    collection(db, COLLECTIONS.PROFILES),
    (snapshot) => onData(snapshot.docs.map((profileDoc) => ({ id: profileDoc.id, ...profileDoc.data() }))),
    onError,
  );

// Idempotente: crea perfil público y cuenta privada solo si no existen.
export const ensureUserDocuments = async ({ uid, email, username, gender }) => {
  const cleanUsername = sanitizeUsername(username);
  const cleanGender = sanitizeGender(gender);
  const profileRef = doc(db, COLLECTIONS.PROFILES, uid);
  const accountRef = doc(db, COLLECTIONS.USERS, uid);

  const [profileSnapshot, accountSnapshot] = await Promise.all([getDoc(profileRef), getDoc(accountRef)]);
  const writes = [];

  if (!profileSnapshot.exists()) {
    writes.push(
      setDoc(profileRef, {
        username: cleanUsername,
        usernameLower: cleanUsername.toLowerCase(),
        gender: cleanGender,
        createdAt: serverTimestamp(),
      }),
    );
  }
  if (!accountSnapshot.exists()) {
    writes.push(setDoc(accountRef, { email: email ?? null, activeRoutineId: null, createdAt: serverTimestamp() }));
  }
  await Promise.all(writes);
};

export const updateProfileData = async (uid, { username, gender }) => {
  const cleanUsername = sanitizeUsername(username);
  await setDoc(
    doc(db, COLLECTIONS.PROFILES, uid),
    { username: cleanUsername, usernameLower: cleanUsername.toLowerCase(), gender: sanitizeGender(gender) },
    { merge: true },
  );
};

export const setActiveRoutine = async (uid, routineId) => {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), { activeRoutineId: routineId ?? null }, { merge: true });
};
