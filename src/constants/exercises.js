// Catálogo base. 'muscle' es la unidad de análisis; 'category' agrupa para filtros.
const CATALOG_ENTRIES = [
  ['PRESS BANCA', 'PECHO', 'pecho'],
  ['PRESS INCLINADO', 'PECHO', 'pecho'],
  ['MARIPOSA', 'PECHO', 'pecho'],
  ['PRESS MAQUINA', 'PECHO', 'pecho'],
  ['FLEXIONES', 'PECHO', 'pecho'],
  ['PULLOVER', 'PECHO', 'pecho'],
  ['PRESS HOMBRO', 'HOMBRO', 'hombros'],
  ['PRESS HOMBRO BARRAS', 'HOMBRO', 'hombros'],
  ['VUELOS LATERALES', 'HOMBRO', 'hombros'],
  ['VUELOS ANTERIORES', 'HOMBRO', 'hombros'],
  ['VUELOS POSTERIORES', 'HOMBRO', 'hombros'],
  ['REMO MENTON', 'HOMBRO', 'hombros'],
  ['FACE PULL', 'HOMBRO', 'hombros'],
  ['PESO MUERTO', 'ESPALDA', 'espalda'],
  ['JALON AL PECHO', 'ESPALDA', 'espalda'],
  ['REMO CON BARRA', 'ESPALDA', 'espalda'],
  ['REMO BAJO', 'ESPALDA', 'espalda'],
  ['REMO T', 'ESPALDA', 'espalda'],
  ['REMO UNILATERAL', 'ESPALDA', 'espalda'],
  ['DOMINADAS', 'ESPALDA', 'espalda'],
  ['CURL CON BARRA', 'BICEPS', 'biceps'],
  ['CURL POLEA', 'BICEPS', 'biceps'],
  ['SCOTT', 'BICEPS', 'biceps'],
  ['BICEP CONCENTRADO', 'BICEPS', 'biceps'],
  ['ALT CON MANCUERNA', 'BICEPS', 'biceps'],
  ['BAYESIANA', 'BICEPS', 'biceps'],
  ['CURL BICEPS INCLINADO', 'BICEPS', 'biceps'],
  ['EXT POLEA ALTA', 'TRICEPS', 'triceps'],
  ['FONDOS', 'TRICEPS', 'triceps'],
  ['PRESS FRANCES', 'TRICEPS', 'triceps'],
  ['EXT CON MANCUERNA', 'TRICEPS', 'triceps'],
  ['EXT COPA', 'TRICEPS', 'triceps'],
  ['TRASNUCA', 'TRICEPS', 'triceps'],
  ['SENTADILLA', 'PIERNAS', 'cuadriceps'],
  ['HACK', 'PIERNAS', 'cuadriceps'],
  ['CUADRICEPS', 'PIERNAS', 'cuadriceps'],
  ['PRENSA 45°', 'PIERNAS', 'cuadriceps'],
  ['ESTOCADAS', 'PIERNAS', 'cuadriceps'],
  ['ISQUIOTIBIALES', 'PIERNAS', 'isquiotibiales'],
  ['PATADA DE GLUTEO', 'PIERNAS', 'gluteos'],
  ['HIP THRUST', 'PIERNAS', 'gluteos'],
  ['MULTICADERA', 'PIERNAS', 'gluteos'],
  ['SOLEO', 'PIERNAS', 'gemelos'],
  ['ABDUCTOR', 'PIERNAS', 'aductores'],
  ['ADUCTOR', 'PIERNAS', 'aductores'],
  // Antes 'abdominales' existía en el mapa corporal pero ningún ejercicio lo alimentaba (siempre rojo).
  ['CRUNCH', 'CORE', 'abdominales'],
  ['PLANCHA', 'CORE', 'abdominales'],
  ['ELEVACION DE PIERNAS', 'CORE', 'abdominales'],
  ['RUEDA ABDOMINAL', 'CORE', 'abdominales'],
];

export const MUSCLES = Object.freeze([
  { id: 'pecho', label: 'Pecho' },
  { id: 'hombros', label: 'Hombros' },
  { id: 'espalda', label: 'Espalda' },
  { id: 'biceps', label: 'Bíceps' },
  { id: 'triceps', label: 'Tríceps' },
  { id: 'abdominales', label: 'Abdominales' },
  { id: 'cuadriceps', label: 'Cuádriceps' },
  { id: 'isquiotibiales', label: 'Isquiotibiales' },
  { id: 'gluteos', label: 'Glúteos' },
  { id: 'aductores', label: 'Aductores' },
  { id: 'gemelos', label: 'Gemelos' },
  { id: 'otros', label: 'Otros' },
]);

export const MUSCLE_LABELS = Object.freeze(
  Object.fromEntries(MUSCLES.map(({ id, label }) => [id, label])),
);

// Normaliza nombres para que "press  banca" y "PRESS BANCA" sean el mismo ejercicio.
export const normalizeExerciseName = (rawName) => {
  if (typeof rawName !== 'string') return '';
  return rawName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
};

export const EXERCISE_CATALOG = Object.freeze(
  Object.fromEntries(
    CATALOG_ENTRIES.map(([name, category, muscle]) => [normalizeExerciseName(name), { category, muscle }]),
  ),
);

export const CATALOG_EXERCISE_NAMES = Object.freeze(Object.keys(EXERCISE_CATALOG).sort());

export const getExerciseMeta = (exerciseName) =>
  EXERCISE_CATALOG[normalizeExerciseName(exerciseName)] ?? { category: 'OTROS', muscle: 'otros' };

// Un log o ítem de rutina puede traer su propio músculo (ejercicios personalizados).
export const resolveMuscle = (item) => item?.muscle || getExerciseMeta(item?.exercise).muscle;
