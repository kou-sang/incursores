// Nombres de colecciones centralizados para evitar strings mágicos dispersos.
export const COLLECTIONS = Object.freeze({
  USERS: 'users', // Privado: email, activeRoutineId (solo lectura del dueño)
  PROFILES: 'profiles', // Público: username, gender (visible para amigos)
  ROUTINES: 'routines',
  LOGS: 'workoutLogs', // Reemplaza a la colección legada 'prs'
  PERSONAL_BESTS: 'personalBests', // Agregado 1 doc/usuario: evita leer todo el historial para rankings
  GROUPS: 'groups', // Grupos de amigos: delimitan quién aparece en Analíticas
  GROUP_INVITES: 'groupInvites', // Índice código de invitación → groupId
});

export const GROUP_LIMITS = Object.freeze({
  MAX_MEMBERS: 30, // = límite del operador 'in' → una sola consulta de logs por grupo
  CODE_LENGTH: 8,
  NAME_MAX: 40,
  DESCRIPTION_MAX: 160,
});

export const GENDERS = Object.freeze(['masculino', 'femenino']);

// Límites de lectura: cada documento de un onSnapshot inicial se factura como 1 lectura.
export const QUERY_LIMITS = Object.freeze({
  TODAY_LOOKBACK_DAYS: 60,
  RANKING_LOOKBACK_DAYS: 30,
  MAX_LOGS_PER_QUERY: 3000,
  MAX_USERS_PER_IN_QUERY: 30, // Límite duro de Firestore para el operador 'in'
});
