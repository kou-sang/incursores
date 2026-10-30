import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
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

export const sanitizeEmail = (email) => {
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

// ───────── Gestión de cuenta (pestaña Perfil) ─────────

const PASSWORD_PROVIDER = 'password';
const GOOGLE_PROVIDER = 'google.com';

const requireCurrentUser = () => {
  const user = auth.currentUser;
  if (!user) throw new ValidationError('Tu sesión expiró. Vuelve a ingresar.');
  return user;
};

export const hasPasswordProvider = (user = auth.currentUser) =>
  Boolean(user?.providerData.some((provider) => provider.providerId === PASSWORD_PROVIDER));

/**
 * Firebase exige un login reciente para operaciones sensibles (auth/requires-recent-login).
 * Cuentas con contraseña → se pide la actual; cuentas solo-Google → popup de Google.
 */
const reauthenticate = async (currentPassword) => {
  const user = requireCurrentUser();
  if (hasPasswordProvider(user)) {
    if (!currentPassword) throw new ValidationError('Ingresa tu contraseña actual.');
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword));
    return user;
  }
  if (user.providerData.some((provider) => provider.providerId === GOOGLE_PROVIDER)) {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account', login_hint: user.email ?? '' });
    await reauthenticateWithPopup(user, provider);
    return user;
  }
  throw new ValidationError('No se pudo verificar tu identidad.');
};

// Cuentas de Google sin contraseña: se vincula el proveedor email/contraseña (podrán entrar de ambas formas).
export const changePassword = async ({ currentPassword, newPassword }) => {
  sanitizePassword(newPassword);
  const user = await reauthenticate(currentPassword);
  if (hasPasswordProvider(user)) {
    await updatePassword(user, newPassword);
    return 'updated';
  }
  await linkWithCredential(user, EmailAuthProvider.credential(user.email, newPassword));
  return 'linked';
};

// El cambio se aplica recién cuando el usuario confirma desde el NUEVO correo (evita secuestro de cuentas).
export const changeEmail = async ({ currentPassword, newEmail }) => {
  const cleanEmail = sanitizeEmail(newEmail);
  const user = await reauthenticate(currentPassword);
  if (cleanEmail === user.email) throw new ValidationError('Ese ya es tu correo actual.');
  await verifyBeforeUpdateEmail(user, cleanEmail);
  return cleanEmail;
};

export const updateDisplayName = async (username) => {
  const user = requireCurrentUser();
  await updateProfile(user, { displayName: username });
};
