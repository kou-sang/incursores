// Utilidades de color puras (sin React).

const hexToRgb = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
const rgbToHex = (rgb) => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

/**
 * Interpola un color dentro de una escala de paradas [[valor, '#hex'], ...] ordenadas por valor.
 * Valores fuera de rango se recortan a los extremos. Varias paradas intermedias evitan el
 * "marrón barroso" que produce mezclar verde y rojo directamente en sRGB.
 */
export const interpolateColorStops = (stops, value) => {
  try {
    if (!Number.isFinite(value) || value <= stops[0][0]) return stops[0][1];
    const last = stops[stops.length - 1];
    if (value >= last[0]) return last[1];
    const upperIndex = stops.findIndex(([stopValue]) => stopValue >= value);
    const [lowValue, lowColor] = stops[upperIndex - 1];
    const [highValue, highColor] = stops[upperIndex];
    const ratio = (value - lowValue) / (highValue - lowValue);
    const low = hexToRgb(lowColor);
    const high = hexToRgb(highColor);
    return rgbToHex(low.map((channel, index) => channel + (high[index] - channel) * ratio));
  } catch {
    return stops[stops.length - 1][1];
  }
};
