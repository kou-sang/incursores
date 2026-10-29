import { GENDERS } from '../constants/collections';
import { normalizeExerciseName } from '../constants/exercises';
import { ValidationError } from '../utils/errors';

// Unicode: el regex original /^[a-zA-Z]+$/ rechazaba "Ñandú", "José" o "Ana María".
const USERNAME_PATTERN = /^[\p{L}\p{N}_ ]{2,24}$/u;

export const sanitizeUsername = (rawUsername) => {
  const username = String(rawUsername ?? '').replace(/\s+/g, ' ').trim();
  if (!USERNAME_PATTERN.test(username)) {
    throw new ValidationError('El usuario debe tener 2–24 caracteres (letras, números, espacios o _).');
  }
  return username;
};

export const sanitizeGender = (gender) => {
  if (!GENDERS.includes(gender)) throw new ValidationError('Selecciona un sexo válido.');
  return gender;
};

export const sanitizePassword = (password) => {
  if (typeof password !== 'string' || password.length < 6) {
    throw new ValidationError('La contraseña debe tener al menos 6 caracteres.');
  }
  return password;
};

const parseOptionalNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
};

// Valida una entrada de entrenamiento. Bug original: `if (pesoNum)` descartaba 0 kg,
// aceptaba negativos y no registraba reps → los "PR" comparaban pesos con reps distintas.
export const sanitizeLogEntry = ({ exercise, muscle, sets, reps, weight }) => {
  const name = normalizeExerciseName(exercise);
  if (!name || name.length > 60) throw new ValidationError('Nombre de ejercicio inválido.');

  const parsedSets = parseOptionalNumber(sets) ?? 1;
  if (!Number.isInteger(parsedSets) || parsedSets < 1 || parsedSets > 30) {
    throw new ValidationError('Las series deben ser un entero entre 1 y 30.');
  }

  const parsedReps = parseOptionalNumber(reps);
  if (parsedReps !== null && (!Number.isInteger(parsedReps) || parsedReps < 1 || parsedReps > 100)) {
    throw new ValidationError('Las repeticiones deben ser un entero entre 1 y 100.');
  }

  const parsedWeight = parseOptionalNumber(weight);
  if (parsedWeight !== null && (Number.isNaN(parsedWeight) || parsedWeight < 0 || parsedWeight > 1000)) {
    throw new ValidationError('El peso debe estar entre 0 y 1000 kg.');
  }

  return {
    exercise: name,
    muscle: typeof muscle === 'string' && muscle ? muscle : null,
    sets: parsedSets,
    reps: parsedReps,
    weight: parsedWeight === null ? null : Math.round(parsedWeight * 100) / 100,
  };
};

export const sanitizeRoutineItem = (item) => {
  const exercise = normalizeExerciseName(item.exercise);
  if (!exercise) return null; // Filas vacías se descartan silenciosamente
  const sets = Number(item.sets);
  if (!Number.isInteger(sets) || sets < 1 || sets > 20) {
    throw new ValidationError(`"${exercise}": las series deben ser un entero entre 1 y 20.`);
  }
  const reps = String(item.reps ?? '').trim().slice(0, 12);
  return { id: item.id, exercise, sets, reps, muscle: item.muscle || null };
};

// Extrae el primer número de un objetivo de reps ("8-12" → 8) para prellenar formularios.
export const parseTargetReps = (reps) => {
  const match = String(reps ?? '').match(/\d+/);
  return match ? Number(match[0]) : null;
};
