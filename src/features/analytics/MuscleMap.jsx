import { AlertCircle, AlertTriangle, CheckCircle2, CircleDashed } from 'lucide-react';
import { ANATOMY_PATHS, BODY_BASE } from '../../constants/anatomy';
import { MUSCLE_LABELS } from '../../constants/exercises';
import { useTheme } from '../../context/ThemeContext';
import { formatRelativeDays } from '../../utils/dates';
import { classifyRecency, RECENCY_STATUS } from '../../utils/metrics';

const STATUS_ICONS = { good: CheckCircle2, warning: AlertCircle, serious: AlertTriangle, critical: CircleDashed };

const BodyView = ({ paths, title, statusByMuscle, selectedMuscle, onSelect }) => {
  const { chart } = useTheme();
  return (
    <figure className="flex w-1/2 max-w-[170px] flex-col items-center">
      <svg viewBox="0 0 200 300" className="w-full overflow-visible" role="group" aria-label={title}>
        <ellipse {...BODY_BASE.head} fill={chart.bodyBase} />
        <path d={BODY_BASE.neck} fill={chart.bodyBase} />
        {paths.map((path) => {
          const status = statusByMuscle[path.id];
          const isSelected = selectedMuscle === path.id;
          return (
            <path
              key={path.id}
              d={path.d}
              className="muscle-path"
              fill={chart.status[status.key]}
              fillOpacity={selectedMuscle && !isSelected ? 0.45 : 1}
              stroke={isSelected ? 'var(--text)' : chart.surface}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeLinejoin="round"
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${path.label}: ${formatRelativeDays(status.days)}`}
              onClick={() => onSelect(isSelected ? null : path.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(isSelected ? null : path.id);
                }
              }}
            />
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs font-semibold text-muted">{title}</figcaption>
    </figure>
  );
};

// Mapa de recuperación/abandono. Interacción por tap/teclado (el original dependía de hover → inútil en móvil).
export const MuscleMap = ({ gender, lastTrainedByMuscle, setsByMuscle, selectedMuscle, onSelect }) => {
  const anatomy = ANATOMY_PATHS[gender] ?? ANATOMY_PATHS.masculino;
  const statusByMuscle = Object.fromEntries(
    Object.keys(MUSCLE_LABELS).map((muscle) => [muscle, classifyRecency(lastTrainedByMuscle[muscle]?.date)]),
  );
  const selectedStatus = selectedMuscle ? statusByMuscle[selectedMuscle] : null;

  return (
    <div>
      <ul className="mb-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-semibold text-secondary">
        {RECENCY_STATUS.map((status) => {
          const Icon = STATUS_ICONS[status.key];
          return (
            <li key={status.key} className="flex items-center gap-1">
              <Icon size={14} style={{ color: `var(--${status.key})` }} aria-hidden /> {status.label}
            </li>
          );
        })}
      </ul>

      <div className="flex justify-around gap-2">
        <BodyView paths={anatomy.frente} title="Frente" statusByMuscle={statusByMuscle} selectedMuscle={selectedMuscle} onSelect={onSelect} />
        <BodyView paths={anatomy.espalda} title="Espalda" statusByMuscle={statusByMuscle} selectedMuscle={selectedMuscle} onSelect={onSelect} />
      </div>

      <div className="mt-3 min-h-[64px] rounded-xl surface-2 p-3 text-sm" aria-live="polite">
        {selectedMuscle ? (
          <>
            <p className="font-bold">{MUSCLE_LABELS[selectedMuscle]}</p>
            <p className="text-secondary">
              Último estímulo: {formatRelativeDays(selectedStatus.days)}
              {lastTrainedByMuscle[selectedMuscle] && ` (${lastTrainedByMuscle[selectedMuscle].exercise})`}
              {' · '}{setsByMuscle[selectedMuscle] ?? 0} series en 7 días
            </p>
          </>
        ) : (
          <p className="text-muted">Toca un músculo para ver su detalle.</p>
        )}
      </div>
    </div>
  );
};
