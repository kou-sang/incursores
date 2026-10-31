import { buildExerciseFrames, FRAME_LABELS } from '../../utils/exerciseFrames';

/*
 * Tres fotogramas del movimiento (inicio, mitad y final), dibujados por código (utils/poseFigure.js).
 * El SVG lo genera la propia app a partir de datos fijos (sin entrada del usuario): es seguro inyectarlo.
 * Usa las variables de color del tema → se adapta a modo claro/oscuro y a los colores personalizados.
 */
export const ExerciseFigure = ({ exerciseName }) => {
  const frames = buildExerciseFrames(exerciseName);
  if (!frames) return <p className="text-sm text-muted">Sin ilustración para este ejercicio.</p>;
  return (
    <ol className="grid grid-cols-3 gap-2">
      {frames.map((svg, index) => (
        <li key={FRAME_LABELS[index]} className="overflow-hidden rounded-xl border divider surface-2">
          <div className="aspect-[200/196] w-full [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="border-t divider py-1 text-center text-xs font-bold text-secondary">{index + 1}. {FRAME_LABELS[index]}</p>
        </li>
      ))}
    </ol>
  );
};
