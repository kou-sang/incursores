const MS_PER_DAY = 86_400_000;

// Marcas del eje X temporal, repartidas parejo entre inicio y fin (incluye ambos extremos).
export const buildTimeTicks = (start, end, count = 5) => {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start || count < 2) return Number.isFinite(start) ? [start] : [];
  return Array.from({ length: count }, (_, index) => Math.round(start + ((end - start) * index) / (count - 1)));
};

// Con rangos menores a 2 días las marcas repetirían la misma fecha: ahí siempre se muestra la hora.
export const shouldShowTime = (unifyDays, start, end) => !unifyDays || end - start < 2 * MS_PER_DAY;
