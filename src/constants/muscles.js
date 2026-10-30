// Músculos individuales (unidad mínima de análisis) agrupados por categoría.
// La categoría es la misma taxonomía que clasifica a los ejercicios → los filtros son coherentes.

export const CATEGORIES = Object.freeze([
  { id: 'PECHO', label: 'Pecho' },
  { id: 'ESPALDA', label: 'Espalda' },
  { id: 'HOMBROS', label: 'Hombros' },
  { id: 'BICEPS', label: 'Bíceps' },
  { id: 'TRICEPS', label: 'Tríceps' },
  { id: 'ANTEBRAZOS', label: 'Antebrazos' },
  { id: 'CORE', label: 'Core' },
  { id: 'PIERNAS', label: 'Piernas' },
  { id: 'GLUTEOS', label: 'Glúteos' },
  { id: 'PANTORRILLAS', label: 'Pantorrillas' },
  { id: 'FUNCIONAL', label: 'Funcional' },
  { id: 'CARDIO', label: 'Cardio' },
  { id: 'CROSSFIT', label: 'CrossFit' },
  { id: 'BAILE', label: 'Baile' },
  { id: 'COMBATE', label: 'Boxeo y combate' },
  { id: 'MOVILIDAD', label: 'Yoga y Pilates' },
  { id: 'DEPORTES', label: 'Deportes' },
  { id: 'OTROS', label: 'Otros' },
]);

export const CATEGORY_LABELS = Object.freeze(Object.fromEntries(CATEGORIES.map(({ id, label }) => [id, label])));

export const MUSCLES = Object.freeze([
  { id: 'pecho_superior', label: 'Pectoral superior (clavicular)', short: 'Pecho sup.', category: 'PECHO' },
  { id: 'pecho_medio', label: 'Pectoral medio (esternal)', short: 'Pecho medio', category: 'PECHO' },
  { id: 'pecho_inferior', label: 'Pectoral inferior (costal)', short: 'Pecho inf.', category: 'PECHO' },
  { id: 'trapecio_superior', label: 'Trapecio superior', short: 'Trapecio sup.', category: 'ESPALDA' },
  { id: 'trapecio_medio', label: 'Trapecio medio/inferior y romboides', short: 'Trapecio medio', category: 'ESPALDA' },
  { id: 'dorsal_ancho', label: 'Dorsal ancho', short: 'Dorsal', category: 'ESPALDA' },
  { id: 'redondo_mayor', label: 'Redondo mayor', short: 'Redondo', category: 'ESPALDA' },
  { id: 'lumbares', label: 'Erectores espinales (lumbares)', short: 'Lumbares', category: 'ESPALDA' },
  { id: 'deltoides_anterior', label: 'Deltoides anterior', short: 'Delt. anterior', category: 'HOMBROS' },
  { id: 'deltoides_lateral', label: 'Deltoides lateral', short: 'Delt. lateral', category: 'HOMBROS' },
  { id: 'deltoides_posterior', label: 'Deltoides posterior', short: 'Delt. posterior', category: 'HOMBROS' },
  { id: 'manguito_rotador', label: 'Manguito rotador (infraespinoso)', short: 'Manguito', category: 'HOMBROS' },
  { id: 'biceps', label: 'Bíceps braquial', short: 'Bíceps', category: 'BICEPS' },
  { id: 'braquial', label: 'Braquial', short: 'Braquial', category: 'BICEPS' },
  { id: 'triceps_largo', label: 'Tríceps (cabeza larga)', short: 'Tríceps largo', category: 'TRICEPS' },
  { id: 'triceps_lateral', label: 'Tríceps (cabezas lateral y medial)', short: 'Tríceps lat.', category: 'TRICEPS' },
  { id: 'antebrazos', label: 'Antebrazos (flexores, extensores, braquiorradial)', short: 'Antebrazos', category: 'ANTEBRAZOS' },
  { id: 'recto_abdominal', label: 'Recto abdominal', short: 'Abdominales', category: 'CORE' },
  { id: 'oblicuos', label: 'Oblicuos', short: 'Oblicuos', category: 'CORE' },
  { id: 'serrato', label: 'Serrato anterior', short: 'Serrato', category: 'CORE' },
  { id: 'recto_femoral', label: 'Recto femoral (cuádriceps)', short: 'Recto femoral', category: 'PIERNAS' },
  { id: 'vasto_lateral', label: 'Vasto lateral (cuádriceps)', short: 'Vasto lateral', category: 'PIERNAS' },
  { id: 'vasto_medial', label: 'Vasto medial (cuádriceps)', short: 'Vasto medial', category: 'PIERNAS' },
  { id: 'biceps_femoral', label: 'Bíceps femoral (isquiotibial externo)', short: 'Bíceps femoral', category: 'PIERNAS' },
  { id: 'semitendinoso', label: 'Semitendinoso/semimembranoso', short: 'Semitendinoso', category: 'PIERNAS' },
  { id: 'aductores', label: 'Aductores', short: 'Aductores', category: 'PIERNAS' },
  { id: 'gluteo_mayor', label: 'Glúteo mayor', short: 'Glúteo mayor', category: 'GLUTEOS' },
  { id: 'gluteo_medio', label: 'Glúteo medio (abductores)', short: 'Glúteo medio', category: 'GLUTEOS' },
  { id: 'gemelos', label: 'Gemelos (gastrocnemio)', short: 'Gemelos', category: 'PANTORRILLAS' },
  { id: 'soleo', label: 'Sóleo', short: 'Sóleo', category: 'PANTORRILLAS' },
  { id: 'tibial', label: 'Tibial anterior', short: 'Tibial', category: 'PANTORRILLAS' },
]);

export const MUSCLE_IDS = Object.freeze(MUSCLES.map(({ id }) => id));
export const MUSCLE_BY_ID = Object.freeze(Object.fromEntries(MUSCLES.map((muscle) => [muscle.id, muscle])));
export const MUSCLE_LABELS = Object.freeze(Object.fromEntries(MUSCLES.map(({ id, label }) => [id, label])));

// Ids macro del modelo anterior (logs/rutinas viejos guardaban `muscle: 'pecho'`).
// Se reparten entre los músculos individuales para no perder historial en las analíticas.
export const LEGACY_MUSCLE_DISTRIBUTION = Object.freeze({
  pecho: { pecho_medio: 45, pecho_superior: 25, pecho_inferior: 20, deltoides_anterior: 10 },
  hombros: { deltoides_anterior: 35, deltoides_lateral: 40, deltoides_posterior: 25 },
  espalda: { dorsal_ancho: 45, trapecio_medio: 25, redondo_mayor: 10, deltoides_posterior: 10, biceps: 10 },
  biceps: { biceps: 70, braquial: 20, antebrazos: 10 },
  triceps: { triceps_lateral: 55, triceps_largo: 45 },
  abdominales: { recto_abdominal: 75, oblicuos: 25 },
  cuadriceps: { recto_femoral: 30, vasto_lateral: 35, vasto_medial: 35 },
  isquiotibiales: { biceps_femoral: 50, semitendinoso: 50 },
  gluteos: { gluteo_mayor: 80, gluteo_medio: 20 },
  aductores: { aductores: 100 },
  gemelos: { gemelos: 60, soleo: 40 },
});

export const musclesOfCategory = (categoryId) => MUSCLES.filter((muscle) => muscle.category === categoryId);
