import { detectGear, EXERCISE_GUIDES } from '../constants/exerciseGuides';
import { POSES } from '../constants/exercisePoses';
import { interpolatePose, renderPoseSvg } from './poseFigure';

// Anclaje de polea por defecto (baja, al frente) para ejercicios que en la ficha usan polea y el patrón no define uno.
const DEFAULT_CABLE_ANCHOR = [56, 28];

const gearProp = (gear, pattern) => {
  switch (gear) {
    case 'barbell': return { type: 'barbell' };
    case 'dumbbell': return { type: 'dumbbell' };
    case 'kettlebell': return { type: 'kettlebell' };
    case 'plate': return { type: 'plate' };
    case 'wheel': return { type: 'wheel' };
    case 'cable': return { type: 'cable', to: pattern.cableTo ?? DEFAULT_CABLE_ANCHOR };
    default: return null; // 'machine' | 'none': sin implemento en la mano
  }
};

// Reemplaza el marcador { type: 'gear' } por el implemento real, conservando sus opciones (posición, desplazamiento…).
const resolveFrame = (frame, gear, pattern) => {
  const base = gearProp(gear, pattern);
  const props = (frame.props ?? [])
    .map((prop) => {
      if (prop.type !== 'gear') return prop;
      if (!base) return null;
      const { type: _placeholder, ...options } = prop;
      return { ...base, ...options, type: base.type };
    })
    .filter(Boolean);
  return { ...frame, props };
};

export const FRAME_LABELS = Object.freeze(['Inicio', 'Mitad', 'Final']);

/**
 * Tres fotogramas (inicio, mitad, final) en SVG para un ejercicio del catálogo. null si no tiene ficha.
 * Memoizado: el resultado depende solo del nombre (y el tema se aplica por variables CSS).
 */
const cache = new Map();
export const buildExerciseFrames = (name) => {
  if (cache.has(name)) return cache.get(name);
  let result = null;
  try {
    const guide = EXERCISE_GUIDES[name];
    const pattern = guide ? POSES[guide.pose] : null;
    if (pattern) {
      const gear = guide.gear ?? detectGear(name, pattern.gear);
      const [first, second, third] = pattern.frames;
      const frames = third ? [first, second, third] : [first, interpolatePose(first, second), second];
      result = frames.map((frame, index) => renderPoseSvg(resolveFrame(frame, gear, pattern), { title: `${name}: ${FRAME_LABELS[index].toLowerCase()}` }));
    }
  } catch {
    result = null; // Un dibujo roto nunca debe romper la ficha.
  }
  cache.set(name, result);
  return result;
};
