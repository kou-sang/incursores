// Constantes compartidas de Analíticas (fuera de los .jsx para no romper el fast refresh).

// Rango orientativo de series semanales por músculo para hipertrofia.
export const WEEKLY_SET_TARGET = Object.freeze({ min: 10, max: 20 });

// "Recuperación" primero y por defecto: degradado verde (reciente) → rojo (un mes sin entrenar).
export const MAP_MODES = Object.freeze([
  { value: 'recency', label: 'Recuperación' },
  { value: 'stimulus', label: 'Estímulo' },
]);

// Días a partir de los cuales el músculo se pinta rojo pleno (estado crítico).
export const CRITICAL_RECENCY_DAYS = 30;
