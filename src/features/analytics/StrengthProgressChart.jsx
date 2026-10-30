import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, ChartTooltip, TimeAxisTick } from '../../components/charts';
import { useAxisProps } from '../../components/useAxisProps';
import { useTheme } from '../../context/ThemeContext';
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { buildTimeTicks, shouldShowTime } from '../../utils/chartTime';
import { formatDayTime, formatShortDate } from '../../utils/dates';

// Eje X temporal real (numérico): el original usaba categorías por fecha,
// así que 1 día y 3 semanas de hueco ocupaban el mismo ancho → tendencia engañosa.
const RecordAwareDot = ({ cx, cy, payload, stroke, surface }) => {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  if (payload.isPr) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill={stroke} stroke={surface} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={2.5} fill={surface} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill={stroke} stroke={surface} strokeWidth={2} />;
};

export const StrengthProgressChart = ({ seriesList, unifyDays = true }) => {
  const { chart } = useTheme();
  const { grid, axis } = useAxisProps();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const hasData = seriesList.some((series) => series.points.length > 0);

  if (!hasData) {
    return <p className="py-12 text-center text-sm text-muted">Sin registros con peso para este ejercicio en el rango.</p>;
  }

  const times = seriesList.flatMap((series) => series.points.map((point) => point.time));
  const start = Math.min(...times);
  const end = Math.max(...times);
  const showTime = shouldShowTime(unifyDays, start, end);

  return (
    <>
      {seriesList.length > 1 && <ChartLegend items={seriesList.map((series) => ({ key: series.userId, label: series.name, color: series.color }))} />}
      <div className="h-64 w-full md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart margin={{ top: 12, right: 28, bottom: 4, left: 0 }}>
            <CartesianGrid {...grid} />
            <XAxis {...axis} dataKey="time" type="number" scale="time" domain={[start, end]} ticks={buildTimeTicks(start, end, isDesktop ? 6 : 4)}
              height={showTime ? 44 : 30} tick={<TimeAxisTick showTime={showTime} />} interval={0} />
            <YAxis {...axis} width={44} domain={['auto', 'auto']} unit=" kg" />
            <Tooltip
              content={
                <ChartTooltip
                  labelFormatter={(label) => (unifyDays ? formatShortDate(label) : formatDayTime(label))}
                  valueFormatter={(value, entry) => {
                    const { weight, reps, isPr } = entry.payload;
                    const detail = weight ? ` (${weight}×${reps ?? '?'})` : '';
                    return `${value} kg${detail}${isPr ? ' · PR' : ''}`;
                  }}
                />
              }
            />
            {seriesList.map((series) => (
              <Line
                key={series.userId}
                data={series.points}
                dataKey="e1rm"
                name={series.name}
                stroke={series.color}
                strokeWidth={2}
                isAnimationActive={false}
                dot={(props) => <RecordAwareDot key={`${series.userId}-${props.index}`} {...props} stroke={series.color} surface={chart.surface} />}
                activeDot={{ r: 6, stroke: chart.surface, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">Punto con anillo = récord personal. Valor = {unifyDays ? 'mejor 1RM estimado del día' : '1RM estimado de cada registro'} (Epley).</p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-semibold text-secondary">Ver datos en tabla</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead className="text-muted"><tr><th className="py-1">{unifyDays ? 'Fecha' : 'Fecha y hora'}</th><th>Perfil</th><th>Serie</th><th className="text-right">1RM est.</th></tr></thead>
          <tbody>
            {seriesList.flatMap((series) => series.points.map((point) => (
              <tr key={`${series.userId}-${point.time}`} className="border-t divider">
                <td className="py-1">{unifyDays ? formatShortDate(point.time) : formatDayTime(point.time)}</td>
                <td>{series.name}</td>
                <td>{point.weight} kg × {point.reps ?? '?'}</td>
                <td className="text-right font-bold">{point.e1rm} kg{point.isPr ? ' 🏆' : ''}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </details>
    </>
  );
};
