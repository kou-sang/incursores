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

// ───────── Conversión HEX ↔ HSV (selector de color) ─────────

export const hexToHsv = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: max === 0 ? 0 : delta / max, v: max };
};

export const hsvToHex = ({ h, s, v }) => {
  const chroma = v * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - chroma;
  const [r, g, b] =
    h < 60 ? [chroma, x, 0]
      : h < 120 ? [x, chroma, 0]
        : h < 180 ? [0, chroma, x]
          : h < 240 ? [0, x, chroma]
            : h < 300 ? [x, 0, chroma]
              : [chroma, 0, x];
  return rgbToHex([r, g, b].map((channel) => (channel + m) * 255));
};
