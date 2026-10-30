import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, ChartTooltip, TimeAxisTick } from '../../components/charts';
import { useAxisProps } from '../../components/useAxisProps';
import { useTheme } from '../../context/ThemeContext';
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { buildTimeTicks, shouldShowTime } from '../../utils/chartTime';
import { formatDayTime } from '../../utils/dates';

// Pasados estos puntos por línea, los círculos comunes saturan el gráfico: solo quedan las estrellas de PR.
const MAX_PLAIN_DOTS = 40;

const starPath = (cx, cy, outer, inner) =>
  `${Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${index === 0 ? 'M' : 'L'}${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`;
  }).join('')}Z`;

// Estrella = hubo mejora de PR; círculo = entrenamiento sin récord; los extremos de la línea (inicio/fin del rango) no llevan marca.
const ConsistencyDot = ({ cx, cy, payload, stroke, surface, showPlainDots }) => {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || payload.isEdge) return null;
  if (payload.hasPr) return <path d={starPath(cx, cy, 10, 4.5)} fill={stroke} stroke={surface} strokeWidth={1.5} />;
  return showPlainDots ? <circle cx={cx} cy={cy} r={3.5} fill={stroke} stroke={surface} strokeWidth={1.5} /> : null;
};

/**
 * Consistencia por perfil: ejercicios acumulados en el período (según los filtros activos).
 * `seriesList`: [{ userId, name, color, points, total, trainingDays, prCount }]; `domain`: [inicioMs, finMs].
 */
export const ConsistencyChart = ({ seriesList, domain, unifyDays }) => {
  const { chart } = useTheme();
  const { grid, axis } = useAxisProps();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [start, end] = domain;
  const showTime = shouldShowTime(unifyDays, start, end);
  const ticks = buildTimeTicks(start, end, isDesktop ? 6 : 4);

  if (!seriesList.some((series) => series.total > 0)) {
    return <p className="py-12 text-center text-sm text-muted">Sin ejercicios registrados en el período con estos filtros.</p>;
  }

  return (
    <>
      <ChartLegend
        items={seriesList.map((series) => ({
          key: series.userId,
          label: `${series.name}: ${series.total} ejercicios, ${series.trainingDays} ${series.trainingDays === 1 ? 'día' : 'días'}, ${series.prCount} PR`,
          color: series.color,
        }))}
      />
      <div className="h-64 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 12, right: 28, bottom: 4, left: 0 }}>
            <CartesianGrid {...grid} />
            <XAxis
              {...axis}
              dataKey="time"
              type="number"
              scale="time"
              domain={[start, end]}
              ticks={ticks}
              height={showTime ? 44 : 30}
              tick={<TimeAxisTick showTime={showTime} />}
              interval={0}
            />
            <YAxis {...axis} width={40} allowDecimals={false} domain={[0, 'auto']} />
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(label) => formatDayTime(label)}
                  valueFormatter={(value, entry) => {
                    const { count, hasPr, prExercises, exercise } = entry.payload;
                    const added = count ? ` (+${count}${exercise ? ` ${exercise}` : ''})` : '';
                    const record = hasPr ? ` · PR en ${[...new Set(prExercises)].join(', ')}` : '';
                    return `${value} acumulados${added}${record}`;
                  }}
                />
              }
            />
            {seriesList.map((series) => {
              // La línea arranca en 0 al inicio del rango y se extiende hasta el final: un tramo plano = tiempo sin entrenar.
              const data = [{ time: start, total: 0, isEdge: true }, ...series.points, { time: end, total: series.total, isEdge: true }];
              return (
                <Line
                  key={series.userId}
                  data={data}
                  dataKey="total"
                  name={series.name}
                  type="monotone"
                  stroke={series.color}
                  strokeWidth={2.5}
                  isAnimationActive={false}
                  dot={(props) => (
                    <ConsistencyDot key={`${series.userId}-${props.index}`} {...props} stroke={series.color} surface={chart.surface} showPlainDots={series.points.length <= MAX_PLAIN_DOTS} />
                  )}
                  activeDot={{ r: 6, stroke: chart.surface, strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">
        La línea sube con cada ejercicio hecho: más pendiente, más constancia; un tramo plano son días sin entrenar. La estrella marca {unifyDays ? 'los días' : 'los ejercicios'} con mejora de PR.
      </p>
    </>
  );
};
