import { useTheme } from '../context/ThemeContext';

// Piezas comunes de gráficos: tooltip y leyenda con tokens de texto (nunca color de serie en el texto).

export const ChartTooltip = ({ active, payload, label, labelFormatter, valueFormatter }) => {
  const { chart } = useTheme();
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-xs shadow-lg"
      style={{ background: chart.tooltipBg, borderColor: 'var(--border)', color: 'var(--text)' }}
    >
      <p className="mb-1 font-bold">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} aria-hidden />
          <span className="text-secondary">{entry.name}</span>
          <span className="ml-auto pl-3 font-bold">{valueFormatter ? valueFormatter(entry.value, entry) : entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export const ChartLegend = ({ items }) => (
  <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-secondary">
    {items.map((item) => (
      <li key={item.key} className="flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} aria-hidden />
        {item.label}
      </li>
    ))}
  </ul>
);
