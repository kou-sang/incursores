import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { ensureUserDocuments } from './userService';
import { sanitizeGender, sanitizePassword, sanitizeUsername } from './validation';
import { ValidationError } from '../utils/errors';

// Bandera reactiva para que el listener de sesión no muestre "completar perfil" durante los
// milisegundos entre createUser y la escritura del perfil (race condition original).
let profileCreationPending = false;
const pendingListeners = new Set();

const setProfileCreationPending = (value) => {
  profileCreationPending = value;
  pendingListeners.forEach((listener) => listener(value));
};

export const isProfileCreationPending = () => profileCreationPending;

export const onProfileCreationPendingChange = (listener) => {
  pendingListeners.add(listener);
  return () => pendingListeners.delete(listener);
};

const sanitizeEmail = (email) => {
  const value = String(email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new ValidationError('Correo inválido.');
  return value;
};

export const registerWithEmail = async ({ email, password, username, gender }) => {
  const cleanEmail = sanitizeEmail(email);
  const cleanUsername = sanitizeUsername(username);
  const cleanGender = sanitizeGender(gender);
  sanitizePassword(password);

  setProfileCreationPending(true);
  try {
    const { user } = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await Promise.all([
      updateProfile(user, { displayName: cleanUsername }),
      ensureUserDocuments({ uid: user.uid, email: cleanEmail, username: cleanUsername, gender: cleanGender }),
    ]);
  } finally {
    // Si la escritura del perfil falla, el usuario cae en ProfileSetup en vez de quedar en un spinner eterno.
    setProfileCreationPending(false);
  }
};

export const loginWithEmail = async ({ email, password }) => {
  await signInWithEmailAndPassword(auth, sanitizeEmail(email), password);
};

// Usuarios de Google nuevos completan username/sexo en ProfileSetup en lugar de
// recibir 'masculino' por defecto (sesgo del código original).
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
};

export const requestPasswordReset = async (email) => {
  await sendPasswordResetEmail(auth, sanitizeEmail(email));
};

export const logout = () => signOut(auth);
