import { Bar, BarChart, CartesianGrid, LabelList, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartTooltip, useAxisProps } from '../../components/charts';
import { MUSCLES } from '../../constants/exercises';
import { useTheme } from '../../context/ThemeContext';

// Rango orientativo de series semanales por músculo para hipertrofia.
export const WEEKLY_SET_TARGET = Object.freeze({ min: 10, max: 20 });

export const MuscleSetsChart = ({ setsByMuscle, highlightMuscle }) => {
  const { chart } = useTheme();
  const { grid, axis } = useAxisProps();

  const data = MUSCLES.filter((muscle) => muscle.id !== 'otros' || setsByMuscle.otros)
    .map((muscle) => ({ id: muscle.id, label: muscle.label, sets: setsByMuscle[muscle.id] ?? 0 }));
  const maxValue = Math.max(WEEKLY_SET_TARGET.max + 4, ...data.map((row) => row.sets));

  return (
    <>
      <div className="w-full" style={{ height: data.length * 30 + 40 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, bottom: 4, left: 4 }}>
            <CartesianGrid {...grid} horizontal={false} vertical />
            <ReferenceArea x1={WEEKLY_SET_TARGET.min} x2={WEEKLY_SET_TARGET.max} fill={chart.targetBand} ifOverflow="visible" />
            <XAxis {...axis} type="number" domain={[0, maxValue]} allowDecimals={false} />
            <YAxis {...axis} type="category" dataKey="label" width={96} interval={0} />
            <Tooltip cursor={{ fill: chart.grid, opacity: 0.4 }} content={<ChartTooltip valueFormatter={(value) => `${value} series`} />} />
            <Bar dataKey="sets" name="Series (7 días)" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false}
              shape={(props) => {
                const isHighlighted = !highlightMuscle || props.payload.id === highlightMuscle;
                return <rect x={props.x} y={props.y} width={Math.max(props.width, 0)} height={props.height} rx={4} fill={chart.series[0]} opacity={isHighlighted ? 1 : 0.35} />;
              }}>
              <LabelList dataKey="sets" position="right" fill={chart.text} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted">
        Franja verde = rango orientativo de {WEEKLY_SET_TARGET.min}–{WEEKLY_SET_TARGET.max} series semanales por músculo.
      </p>
    </>
  );
};
