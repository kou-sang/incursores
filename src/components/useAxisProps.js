import { useTheme } from '../context/ThemeContext';

// Props comunes de ejes: grilla y ejes recesivos. Separado de charts.jsx (react-refresh: .jsx solo exporta componentes).
export const useAxisProps = () => {
  const { chart } = useTheme();
  return {
    grid: { stroke: chart.grid, strokeDasharray: '0', vertical: false },
    axis: { stroke: chart.axis, tick: { fill: chart.text, fontSize: 12 }, axisLine: false, tickLine: false },
  };
};
