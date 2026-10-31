import { useState } from 'react';
import { MUSCLE_LABELS } from '../../constants/exercises';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { MuscleMap } from '../analytics/MuscleMap';

// % del estímulo → nivel del ramp verde (los mismos colores del mapa de Analíticas).
const SHARE_LEVELS = Object.freeze([
  { level: 5, min: 30, label: 'Principal (30%+)' },
  { level: 4, min: 20, label: '20–30%' },
  { level: 3, min: 10, label: '10–20%' },
  { level: 2, min: 5, label: '5–10%' },
  { level: 1, min: 0.01, label: 'Menos de 5%' },
]);
const levelOf = (percent) => SHARE_LEVELS.find(({ min }) => (percent ?? 0) >= min)?.level ?? 0;

/**
 * Diagrama corporal de un ejercicio: cada músculo se pinta según el % del estímulo que recibe.
 * Tocar un músculo muestra su nombre y porcentaje.
 */
export const ExerciseMuscleMap = ({ distribution }) => {
  const { user } = useAppData();
  const { chart } = useTheme();
  const [selected, setSelected] = useState(null);

  const legend = (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-semibold text-secondary">
      {SHARE_LEVELS.map((bin) => (
        <li key={bin.level} className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm border divider" style={{ background: chart.stimulus[bin.level] }} aria-hidden />
          {bin.label}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <MuscleMap
        gender={user.gender}
        mode="stimulus"
        selectedMuscle={selected}
        onSelect={setSelected}
        colorFor={(muscleId) => chart.stimulus[levelOf(distribution[muscleId])]}
        describe={(muscleId) => `${MUSCLE_LABELS[muscleId] ?? muscleId}: ${distribution[muscleId] ?? 0}% del estímulo`}
        legend={legend}
        hint="Toca un músculo para ver su porcentaje."
      />
      {selected && (
        <p role="status" className="mt-2 text-center text-sm">
          <strong>{MUSCLE_LABELS[selected]}</strong>: {distribution[selected] ? `${distribution[selected]}% del estímulo` : 'no participa en este ejercicio'}
        </p>
      )}
    </div>
  );
};
