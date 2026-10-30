// Paso de repeticiones para los minibotones +/-. Acepta "10" y rangos "8-12"; otros textos ("AMRAP") no se tocan.
export const REPS_MIN = 1;
export const REPS_MAX = 100;

const clampReps = (value) => Math.min(REPS_MAX, Math.max(REPS_MIN, value));

export const stepReps = (rawValue, delta) => {
  const text = String(rawValue ?? '').trim();
  if (text === '') return String(REPS_MIN); // Igual que un input numérico nativo: vacío + 1 = mínimo
  if (/^\d+$/.test(text)) return String(clampReps(Number(text) + delta));
  const range = text.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) return `${clampReps(Number(range[1]) + delta)}-${clampReps(Number(range[2]) + delta)}`;
  return text;
};
