import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartLegend, ChartTooltip } from '../../components/charts';
import { useAxisProps } from '../../components/useAxisProps';
import { useTheme } from '../../context/ThemeContext';
import { describeWeek, formatShortDate } from '../../utils/dates';

const formatTonnage = (value) => (value >= 1000 ? `${Math.round(value / 100) / 10} t` : `${Math.round(value)} kg`);

// Tonelaje semanal (series × reps × kg). Reemplaza al "Volumen" original, que en realidad
// contaba cuántos ejercicios se registraron por día.
export const WeeklyVolumeChart = ({ rows, users, rangeStart, rangeEnd }) => {
  const { chart } = useTheme();
  const { grid, axis } = useAxisProps();
  const hasData = rows.some((row) => users.some((user) => row[user.userId] > 0));

  if (!hasData) {
    return <p className="py-12 text-center text-sm text-muted">Registra peso y reps para calcular el tonelaje.</p>;
  }

  return (
    <>
      {users.length > 1 && <ChartLegend items={users.map((user) => ({ key: user.userId, label: user.name, color: user.color }))} />}
      <div className="h-56 w-full md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }} barGap={2}>
            <CartesianGrid {...grid} />
            <XAxis {...axis} dataKey="weekKey" tickFormatter={(key) => formatShortDate(rows.find((row) => row.weekKey === key)?.time)} minTickGap={16} />
            <YAxis {...axis} width={48} tickFormatter={formatTonnage} />
            <Tooltip
              cursor={{ fill: chart.grid, opacity: 0.4 }}
              content={<ChartTooltip labelFormatter={(_, payload) => describeWeek(payload?.[0]?.payload.time, rangeStart, rangeEnd)} valueFormatter={formatTonnage} />}
            />
            {users.map((user) => (
              <Bar key={user.userId} dataKey={user.userId} name={user.name} fill={user.color} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};
