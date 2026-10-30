import { Bar, BarChart, CartesianGrid, LabelList, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip } from '../../components/charts';
import { useAxisProps } from '../../components/useAxisProps';
import { MUSCLES } from '../../constants/muscles';
import { useTheme } from '../../context/ThemeContext';
import { round1 } from '../../utils/metrics';
import { WEEKLY_SET_TARGET } from './analyticsConstants';


/**
 * Series efectivas por semana para cada músculo individual (promedio en el rango filtrado).
 * Click en una barra = mismo efecto que tocar el músculo en el mapa.
 */
export const MuscleSetsChart = ({ weeklySetsByMuscle, highlightMuscle, enabledMuscles, onSelect }) => {
  const { chart } = useTheme();
  const { grid, axis } = useAxisProps();

  const data = MUSCLES.filter((muscle) => !enabledMuscles || enabledMuscles.has(muscle.id))
    .map((muscle) => ({ id: muscle.id, label: muscle.short, fullLabel: muscle.label, sets: round1(weeklySetsByMuscle[muscle.id] ?? 0) }));
  const maxValue = Math.max(WEEKLY_SET_TARGET.max + 4, ...data.map((row) => row.sets));

  if (data.length === 0) return <p className="py-12 text-center text-sm text-muted">Ningún músculo coincide con los filtros.</p>;

  return (
    <>
      <div className="w-full" style={{ height: data.length * 22 + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, bottom: 4, left: 4 }}>
            <CartesianGrid {...grid} horizontal={false} vertical />
            <ReferenceArea x1={WEEKLY_SET_TARGET.min} x2={WEEKLY_SET_TARGET.max} fill={chart.targetBand} ifOverflow="visible" />
            <XAxis {...axis} type="number" domain={[0, Math.ceil(maxValue)]} allowDecimals={false} />
            <YAxis {...axis} type="category" dataKey="label" width={104} interval={0} />
            <Tooltip cursor={{ fill: chart.grid, opacity: 0.4 }}
              content={<ChartTooltip labelFormatter={(_, payload) => payload?.[0]?.payload.fullLabel} valueFormatter={(value) => `${value} series/sem`} />} />
            <Bar dataKey="sets" name="Series efectivas / semana" radius={[0, 4, 4, 0]} maxBarSize={16} isAnimationActive={false}
              onClick={(entry) => {
                const muscleId = entry?.payload?.id ?? entry?.id; // Recharts expone el dato original en payload
                if (muscleId) onSelect?.(muscleId === highlightMuscle ? null : muscleId);
              }}
              shape={(props) => {
                const isHighlighted = !highlightMuscle || props.payload.id === highlightMuscle;
                return <rect x={props.x} y={props.y} width={Math.max(props.width, 0)} height={props.height} rx={4} fill={chart.series[0]} opacity={isHighlighted ? 1 : 0.35} className="cursor-pointer" />;
              }}>
              <LabelList dataKey="sets" position="right" fill={chart.text} fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">
        Franja verde = rango orientativo de {WEEKLY_SET_TARGET.min}–{WEEKLY_SET_TARGET.max} series semanales. Cada serie se reparte según el % que el ejercicio trabaja cada músculo.
      </p>
    </>
  );
};
