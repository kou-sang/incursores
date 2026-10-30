const FIREBASE_ERROR_MESSAGES = Object.freeze({
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Este correo ya está registrado.',
  'auth/invalid-email': 'El formato del correo es inválido.',
  'auth/weak-password': 'La contraseña es muy débil (mínimo 6 caracteres).',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google.',
  'auth/unauthorized-domain': 'Dominio no autorizado en la consola de Firebase.',
  'auth/requires-recent-login': 'Por seguridad, vuelve a ingresar e inténtalo de nuevo.',
  'auth/provider-already-linked': 'Tu cuenta ya tiene contraseña.',
  'auth/credential-already-in-use': 'Ese correo ya está asociado a otra cuenta.',
  'auth/user-mismatch': 'La cuenta de Google elegida no coincide con tu sesión.',
  'auth/operation-not-allowed': 'Operación deshabilitada en la consola de Firebase.',
  'auth/missing-password': 'Ingresa tu contraseña actual.',
  'permission-denied': 'No tienes permisos para esta acción.',
  unavailable: 'Servicio no disponible. Se reintentará al recuperar conexión.',
  'failed-precondition': 'Falta un índice en Firestore. Revisa la consola.',
  'resource-exhausted': 'Cuota de Firestore agotada. Intenta más tarde.',
});

// Nunca se expone error.message crudo al usuario (filtra detalles internos).
export const toUserMessage = (error, fallback = 'Ocurrió un error inesperado.') => {
  const code = error?.code;
  if (code && FIREBASE_ERROR_MESSAGES[code]) return FIREBASE_ERROR_MESSAGES[code];
  if (error?.isValidationError) return error.message;
  return fallback;
};

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.isValidationError = true;
  }
}

export const logError = (context, error) => {
  // Punto único para enchufar Sentry/LogRocket en el futuro.
  console.error(`[${context}]`, error);
};
