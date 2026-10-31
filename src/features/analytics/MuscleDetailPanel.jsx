import { Filter, X } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, ChartTooltip } from '../../components/charts';
import { useAxisProps } from '../../components/useAxisProps';
import { ChartInfo } from '../../components/ChartInfo';
import { IconButton } from '../../components/ui';
import { CATEGORY_LABELS, MUSCLE_BY_ID } from '../../constants/muscles';
import { useTheme } from '../../context/ThemeContext';
import { describeWeek, formatRelativeDays, formatShortDate } from '../../utils/dates';
import { buildExerciseContributions, buildWeeklyMuscleSeries, classifyRecency, round1 } from '../../utils/metrics';
import { WEEKLY_SET_TARGET } from './analyticsConstants';
import { CHART_INFO } from './chartInfo';

const MAX_CONTRIBUTORS = 8;

/**
 * Gráfico generado al tocar un músculo: series efectivas semanales por perfil (respeta todos los filtros)
 * + qué ejercicios lo trabajaron y con qué porcentaje.
 */
export const MuscleDetailPanel = ({ muscleId, logs, users, rangeStart, rangeEnd, weeklyAverage, lastTrained, onClose, onFilterOnly, isFilteredOnly }) => {
  const { chart } = useTheme();
  const { grid, axis } = useAxisProps();
  const muscle = MUSCLE_BY_ID[muscleId];
  const userIds = useMemo(() => users.map((user) => user.userId), [users]);

  const rows = useMemo(
    () => buildWeeklyMuscleSeries(logs, muscleId, userIds, rangeStart, rangeEnd),
    [logs, muscleId, userIds, rangeStart, rangeEnd],
  );
  const contributions = useMemo(() => buildExerciseContributions(logs, muscleId, userIds).slice(0, MAX_CONTRIBUTORS), [logs, muscleId, userIds]);
  const hasData = rows.some((row) => userIds.some((id) => row[id] > 0));
  const recency = classifyRecency(lastTrained?.date);
  const maxValue = Math.max(WEEKLY_SET_TARGET.max + 2, ...rows.flatMap((row) => userIds.map((id) => row[id] ?? 0)));

  if (!muscle) return null;

  return (
    <div className="rounded-xl border divider p-3 md:p-4" aria-live="polite">
      <header className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">{CATEGORY_LABELS[muscle.category]}</p>
          <h4 className="text-base font-black md:text-lg">{muscle.label}</h4>
          <p className="text-sm text-secondary">
            {round1(weeklyAverage)} series efectivas/semana · último estímulo: {formatRelativeDays(recency.days).toLowerCase()}
            {lastTrained?.exercise && ` (${lastTrained.exercise})`}
          </p>
        </div>
        <div className="flex shrink-0">
          <ChartInfo info={CHART_INFO.muscleDetail} />
          {!isFilteredOnly && <IconButton label="Filtrar analíticas solo por este músculo" icon={Filter} onClick={onFilterOnly} />}
          <IconButton label="Cerrar detalle" icon={X} onClick={onClose} />
        </div>
      </header>

      {hasData ? (
        <>
          {users.length > 1 && <ChartLegend items={users.map((user) => ({ key: user.userId, label: user.name, color: user.color }))} />}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barGap={2}>
                <CartesianGrid {...grid} />
                <ReferenceArea y1={WEEKLY_SET_TARGET.min} y2={WEEKLY_SET_TARGET.max} fill={chart.targetBand} ifOverflow="extendDomain" />
                <XAxis {...axis} dataKey="weekKey" tickFormatter={(key) => formatShortDate(rows.find((row) => row.weekKey === key)?.time)} minTickGap={16} />
                <YAxis {...axis} width={36} domain={[0, Math.ceil(maxValue)]} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: chart.grid, opacity: 0.4 }}
                  content={<ChartTooltip labelFormatter={(_, payload) => describeWeek(payload?.[0]?.payload.time, rangeStart, rangeEnd)} valueFormatter={(value) => `${round1(value)} series`} />}
                />
                {users.map((user) => (
                  <Bar key={user.userId} dataKey={user.userId} name={user.name} fill={user.color} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={false} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-xs text-muted">Franja verde = {WEEKLY_SET_TARGET.min}–{WEEKLY_SET_TARGET.max} series semanales (rango orientativo de hipertrofia).</p>
        </>
      ) : (
        <p className="py-8 text-center text-sm text-muted">Sin series para este músculo con los filtros actuales.</p>
      )}

      {contributions.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-2 text-sm font-bold">Ejercicios que lo trabajaron</h5>
          <ul className="space-y-1.5">
            {contributions.map((entry) => (
              <li key={entry.exercise} className="text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-semibold">{entry.exercise}</span>
                  <span className="shrink-0 text-xs text-secondary">
                    {entry.effectiveSets} series ef. · {Math.round(entry.share * 100)}% del ejercicio
                  </span>
                </div>
                {/* Barra = aporte de este ejercicio al total del músculo en el rango. */}
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full surface-2" aria-hidden>
                  <div className="h-full rounded-full" style={{ width: `${Math.round(entry.ratio * 100)}%`, background: chart.stimulus[4] }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
