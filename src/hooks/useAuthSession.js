import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { auth } from '../config/firebase';
import { isProfileCreationPending, onProfileCreationPendingChange } from '../services/authService';
import { ensureUserDocuments, subscribeToAccount, subscribeToProfile, syncAccountEmail } from '../services/userService';
import { logError } from '../utils/errors';

export const SESSION_STATUS = Object.freeze({
  LOADING: 'loading',
  SIGNED_OUT: 'signed-out',
  NEEDS_PROFILE: 'needs-profile',
  READY: 'ready',
  ERROR: 'error',
});

/**
 * Sesión reactiva: perfil y cuenta se escuchan en tiempo real (antes era un getDoc único,
 * así que activeRoutineId quedaba desincronizado entre dispositivos).
 * `undefined` = cargando, `null` = no existe.
 */
export const useAuthSession = () => {
  const [authUser, setAuthUser] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [error, setError] = useState(null);
  const [creationPending, setCreationPending] = useState(isProfileCreationPending());

  useEffect(() => onProfileCreationPendingChange(setCreationPending), []);

  useEffect(
    () =>
      onAuthStateChanged(
        auth,
        (user) => {
          setAuthUser(user);
          setProfile(undefined);
          setAccount(undefined);
          setError(null);
        },
        (authError) => {
          logError('auth:listener', authError);
          setError(authError);
        },
      ),
    [],
  );

  useEffect(() => {
    if (!authUser) return undefined;
    const handleError = (subscriptionError) => {
      logError('session:subscription', subscriptionError);
      setError(subscriptionError);
    };
    const unsubscribeProfile = subscribeToProfile(authUser.uid, setProfile, handleError);
    const unsubscribeAccount = subscribeToAccount(authUser.uid, setAccount, handleError);
    return () => {
      unsubscribeProfile();
      unsubscribeAccount();
    };
  }, [authUser]);

  // Migración perezosa: usuarios legados tienen username/gender en 'users' pero no en 'profiles'.
  useEffect(() => {
    if (!authUser || profile !== null || !account?.username) return;
    ensureUserDocuments({
      uid: authUser.uid,
      email: authUser.email,
      username: account.username,
      gender: account.gender ?? 'masculino',
    }).catch((migrationError) => {
      logError('session:legacy-migration', migrationError);
      setAccount((previous) => (previous ? { ...previous, username: null } : previous));
    });
  }, [authUser, profile, account]);

  // Tras verifyBeforeUpdateEmail el correo cambia en Auth; se refleja en el doc privado (1 escritura, solo si difiere).
  useEffect(() => {
    if (!authUser?.email || !account || account.email === authUser.email) return;
    syncAccountEmail(authUser.uid, authUser.email).catch((syncError) => logError('session:email-sync', syncError));
  }, [authUser, account]);

  return useMemo(() => {
    if (authUser === undefined) return { status: SESSION_STATUS.LOADING, user: null, loadingLabel: 'Verificando tu sesión…' };
    if (authUser === null) return { status: SESSION_STATUS.SIGNED_OUT, user: null };
    if (error) return { status: SESSION_STATUS.ERROR, user: null, error };
    if (profile === undefined || account === undefined) {
      return { status: SESSION_STATUS.LOADING, user: null, loadingLabel: 'Cargando tu perfil…' };
    }
    if (profile === null) {
      const isWaiting = creationPending || Boolean(account?.username);
      return {
        status: isWaiting ? SESSION_STATUS.LOADING : SESSION_STATUS.NEEDS_PROFILE,
        user: null,
        authUser,
        loadingLabel: creationPending ? 'Creando tu perfil…' : 'Migrando tu perfil al nuevo formato…',
      };
    }
    return {
      status: SESSION_STATUS.READY,
      user: {
        id: authUser.uid,
        email: authUser.email,
        username: profile.username,
        gender: profile.gender,
        activeRoutineId: account?.activeRoutineId ?? null,
        preferences: account?.preferences ?? {},
        // Proveedores vinculados: define si cambiar contraseña/correo pide la contraseña actual o Google.
        providerIds: authUser.providerData.map((provider) => provider.providerId),
      },
    };
  }, [authUser, profile, account, error, creationPending]);
};
