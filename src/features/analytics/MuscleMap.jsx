import { BODY_FIGURES, VIEWBOX } from '../../constants/anatomy';
import { MUSCLE_BY_ID } from '../../constants/muscles';
import { useTheme } from '../../context/ThemeContext';
import { formatRelativeDays } from '../../utils/dates';
import { interpolateColorStops } from '../../utils/colors';
import { classifyRecency, classifyStimulus, round1, STIMULUS_BINS } from '../../utils/metrics';
import { CRITICAL_RECENCY_DAYS } from './analyticsConstants';

// Días sin estímulo → color del degradado. "Nunca" se trata como crítico.
const recencyDays = (recency) => (recency.days === null ? CRITICAL_RECENCY_DAYS : recency.days);

const describeMuscle = (muscleId, { mode, weeklySets, recency }) => {
  const label = MUSCLE_BY_ID[muscleId]?.label ?? muscleId;
  if (mode === 'recency') return `${label}: último estímulo ${formatRelativeDays(recency.days).toLowerCase()}`;
  return `${label}: ${round1(weeklySets ?? 0)} series efectivas por semana`;
};

/*
 * Figura SVG: silueta oscura + músculos coloreados (estilo de la referencia).
 * Solo la mitad izquierda de cada par es enfocable con teclado (evita tabular dos veces el mismo músculo).
 */
const BodyFigure = ({ figure, title, colorFor, selectedMuscle, enabledMuscles, describe, onSelect }) => {
  const { chart } = useTheme();
  const outline = chart.bodyOutline;
  return (
    <figure className="flex w-1/2 max-w-[230px] flex-col items-center">
      <svg viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} className="w-full overflow-visible" role="group" aria-label={title}>
        {figure.extras?.hairBack && <path d={figure.extras.hairBack} fill={outline} />}
        <ellipse cx={figure.head.cx} cy={figure.head.cy} rx={figure.head.rx} ry={figure.head.ry}
          fill={figure.head.showFace ? chart.bodyBase : outline} stroke={outline} strokeWidth={2.5} />
        <path d={figure.silhouette.body} fill={outline} />
        {figure.silhouette.arms.map((d) => <path key={d} d={d} fill={outline} />)}

        {figure.shapes.map((shape) => {
          const isSelected = selectedMuscle === shape.id;
          const isEnabled = !enabledMuscles || enabledMuscles.has(shape.id);
          const isPrimary = shape.key.endsWith('-l');
          const toggle = () => onSelect(isSelected ? null : shape.id);
          return (
            <path
              key={shape.key}
              d={shape.d}
              className="muscle-path"
              fill={colorFor(shape.id)}
              fillOpacity={!isEnabled ? 0.25 : selectedMuscle && !isSelected ? 0.8 : 1}
              stroke={isSelected ? 'var(--accent)' : outline}
              strokeWidth={isSelected ? 2.6 : 1.3}
              strokeLinejoin="round"
              role="button"
              tabIndex={isPrimary ? 0 : -1}
              aria-hidden={isPrimary ? undefined : true}
              aria-pressed={isSelected}
              aria-label={describe(shape.id)}
              onClick={toggle}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggle();
                }
              }}
            >
              <title>{describe(shape.id)}</title>
            </path>
          );
        })}

        {figure.detailLines.map((d) => <path key={d} d={d} stroke={outline} strokeWidth={1.3} fill="none" pointerEvents="none" />)}
        {figure.extras?.hairFront && <path d={figure.extras.hairFront} fill={outline} pointerEvents="none" />}
        {figure.extras?.bust.map((d) => <path key={d} d={d} stroke={outline} strokeWidth={1.4} fill="none" pointerEvents="none" />)}
      </svg>
      <figcaption className="mt-1 text-xs font-semibold text-muted">{title}</figcaption>
    </figure>
  );
};

const StimulusLegend = () => {
  const { chart } = useTheme();
  return (
    <div className="flex flex-col items-center gap-1">
      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs font-semibold text-secondary">
        {STIMULUS_BINS.map((bin) => (
          <li key={bin.level} className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm border divider" style={{ background: chart.stimulus[bin.level] }} aria-hidden />
            {bin.label}
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">Series efectivas por semana (series × % de participación del músculo)</p>
    </div>
  );
};

// Barra de degradado con marcas en días: la misma escala que pinta los músculos.
const RecencyLegend = () => {
  const { chart } = useTheme();
  const gradient = chart.recencyStops
    .map(([days, color]) => `${color} ${(days / CRITICAL_RECENCY_DAYS) * 100}%`)
    .join(', ');
  return (
    <div className="mx-auto w-full max-w-xs" aria-label="Escala: verde = entrenado hoy, rojo = 30 días o más sin entrenar">
      <div className="h-2.5 rounded-full" style={{ background: `linear-gradient(90deg, ${gradient})` }} />
      <div className="mt-1 flex justify-between text-[11px] font-semibold text-secondary">
        {chart.recencyStops.map(([days]) => (
          <span key={days}>{days === 0 ? 'Hoy' : days >= CRITICAL_RECENCY_DAYS ? `${days}+ d / nunca` : `${days} d`}</span>
        ))}
      </div>
      <p className="mt-0.5 text-center text-xs text-muted">Días desde el último entrenamiento (cuenta si el ejercicio lo trabaja ≥ 15%)</p>
    </div>
  );
};

/**
 * Mapa corporal interactivo. Modo "Estímulo": verde más intenso = más series efectivas/semana
 * (el % de cada ejercicio por músculo suma proporcionalmente). Modo "Recuperación": días desde el último estímulo.
 */
export const MuscleMap = ({ gender, mode, weeklySetsByMuscle, lastTrainedByMuscle, selectedMuscle, enabledMuscles, onSelect }) => {
  const { chart } = useTheme();
  const figures = BODY_FIGURES[gender] ?? BODY_FIGURES.masculino;

  const recencyFor = (muscleId) => classifyRecency(lastTrainedByMuscle[muscleId]?.date);
  const colorFor = (muscleId) =>
    mode === 'recency'
      ? interpolateColorStops(chart.recencyStops, recencyDays(recencyFor(muscleId)))
      : chart.stimulus[classifyStimulus(weeklySetsByMuscle[muscleId]).level];
  const describe = (muscleId) =>
    describeMuscle(muscleId, { mode, weeklySets: weeklySetsByMuscle[muscleId], recency: recencyFor(muscleId) });

  const figureProps = { colorFor, selectedMuscle, enabledMuscles, describe, onSelect };

  return (
    <div>
      <div className="mb-3">{mode === 'recency' ? <RecencyLegend /> : <StimulusLegend />}</div>
      <div className="flex justify-center gap-2 md:gap-6">
        <BodyFigure figure={figures.frente} title="Frente" {...figureProps} />
        <BodyFigure figure={figures.espalda} title="Espalda" {...figureProps} />
      </div>
      {!selectedMuscle && <p className="mt-2 text-center text-xs text-muted">Toca un músculo para generar su gráfico detallado.</p>}
    </div>
  );
};
