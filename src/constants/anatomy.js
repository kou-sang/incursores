/*
 * Mapa anatómico estilizado (recreación del estilo de la referencia: músculos planos de color
 * separados por contornos oscuros). viewBox 0 0 200 420, eje de simetría x = 100.
 *
 * - Cada forma se define como polígono de la MITAD IZQUIERDA del lienzo y se espeja automáticamente.
 * - Los polígonos se suavizan con Catmull-Rom → curvas Bézier (trazos orgánicos sin dibujar a mano cada control).
 * - La variante femenina se deriva con un "warp" proporcional (hombros/cintura más angostos, cadera más ancha)
 *   + detalles propios (cabello, contorno de busto). Una sola fuente de verdad para ambos sexos.
 * Módulo puro (sin React) → testeable y reutilizable.
 */

export const VIEWBOX = Object.freeze({ width: 200, height: 420 });
const CENTER_X = 100;

// ───────── Siluetas (mitad izquierda) ─────────
const TORSO_SILHOUETTE = [
  [100, 48], [90, 50], [89, 63], [76, 70], [63, 76], [62, 84], [67, 118], [71, 150], [74, 180], [70, 204],
  [67, 230], [69, 262], [75, 300], [78, 318], [75, 346], [80, 378], [83, 392], [77, 402], [80, 409],
  [97, 409], [97, 392], [98, 360], [97, 330], [96, 318], [95, 292], [97, 252], [100, 240],
];

const ARM_SILHOUETTE = [
  [64, 75], [53, 80], [46, 95], [46, 130], [47, 166], [44, 186], [47, 216], [51, 237], [46, 250], [47, 266],
  [53, 273], [60, 267], [62, 240], [64, 212], [66, 182], [66, 166], [68, 136], [70, 116], [68, 92],
];

// ───────── Músculos: vista frontal (mitad izquierda) ─────────
const FRONT_MUSCLES = [
  { id: 'trapecio_superior', part: 'torso', points: [[91, 57], [92, 66], [78, 72], [66, 76], [76, 68]] },
  { id: 'deltoides_anterior', part: 'torso', points: [[67, 78], [76, 79], [77, 92], [72, 108], [65, 112], [61, 98], [62, 86]] },
  { id: 'deltoides_lateral', part: 'arm', points: [[63, 77], [60, 90], [61, 104], [56, 114], [50, 108], [48, 94], [53, 82]] },
  { id: 'pecho_superior', part: 'torso', points: [[79, 79], [98, 81], [98, 95], [86, 97], [78, 96], [77, 88]] },
  { id: 'pecho_medio', part: 'torso', points: [[78, 98], [86, 99], [98, 97], [98, 112], [86, 115], [76, 112], [73, 106]] },
  { id: 'pecho_inferior', part: 'torso', points: [[76, 114], [86, 117], [98, 114], [98, 125], [90, 129], [80, 126]] },
  { id: 'serrato', part: 'torso', points: [[70, 118], [77, 124], [79, 138], [74, 144], [71, 132]] },
  { id: 'oblicuos', part: 'torso', points: [[73, 147], [80, 142], [85, 160], [86, 192], [80, 202], [74, 184], [74, 166]] },
  { id: 'recto_abdominal', part: 'torso', points: [[86, 131], [98, 130], [98, 208], [92, 210], [88, 196], [86, 160]] },
  { id: 'biceps', part: 'arm', points: [[64, 116], [67, 124], [65, 150], [61, 164], [56, 160], [55, 136], [58, 120]] },
  { id: 'braquial', part: 'arm', points: [[50, 112], [55, 118], [54, 140], [55, 160], [51, 166], [48, 148], [48, 126]] },
  { id: 'antebrazos', part: 'arm', points: [[48, 172], [56, 168], [64, 174], [63, 200], [59, 232], [53, 234], [48, 210], [46, 188]] },
  { id: 'gluteo_medio', part: 'leg', points: [[71, 202], [78, 206], [77, 218], [70, 222], [69, 212]] },
  { id: 'vasto_lateral', part: 'leg', points: [[70, 224], [76, 222], [79, 254], [80, 290], [79, 306], [75, 300], [71, 268], [69, 244]] },
  { id: 'recto_femoral', part: 'leg', points: [[79, 214], [86, 220], [89, 250], [88, 284], [84, 300], [81, 292], [80, 252]] },
  { id: 'vasto_medial', part: 'leg', points: [[90, 272], [94, 280], [95, 300], [90, 312], [85, 306], [88, 292]] },
  { id: 'aductores', part: 'leg', points: [[88, 222], [98, 244], [96, 262], [91, 268], [89, 248]] },
  { id: 'tibial', part: 'leg', points: [[80, 324], [87, 324], [88, 350], [87, 378], [84, 386], [80, 360], [78, 340]] },
  { id: 'gemelos', part: 'leg', points: [[90, 324], [96, 326], [97, 344], [94, 364], [90, 352]] },
  { id: 'soleo', part: 'leg', points: [[77, 348], [79, 344], [82, 372], [82, 386], [79, 376]] },
];

// Intersecciones tendinosas del recto abdominal ("six pack") y línea alba: solo decorativas.
const FRONT_DETAIL_LINES = [
  [[86, 150], [98, 149]], [[86, 170], [98, 169]], [[87, 189], [98, 189]],
];

// ───────── Músculos: vista posterior (mitad izquierda) ─────────
const BACK_MUSCLES = [
  { id: 'trapecio_superior', part: 'torso', points: [[91, 54], [98, 56], [98, 84], [86, 82], [70, 78], [64, 76], [78, 66], [89, 62]] },
  { id: 'trapecio_medio', part: 'torso', points: [[86, 84], [98, 86], [98, 150], [94, 138], [88, 116], [82, 98]] },
  { id: 'deltoides_posterior', part: 'torso', points: [[65, 78], [74, 82], [72, 98], [64, 110], [58, 104], [57, 90]] },
  { id: 'deltoides_lateral', part: 'arm', points: [[56, 81], [56, 96], [57, 106], [51, 112], [48, 98], [50, 86]] },
  { id: 'manguito_rotador', part: 'torso', points: [[76, 84], [82, 100], [84, 112], [76, 110], [70, 104], [72, 94]] },
  { id: 'redondo_mayor', part: 'torso', points: [[68, 108], [76, 112], [82, 116], [78, 122], [70, 120]] },
  { id: 'dorsal_ancho', part: 'torso', points: [[70, 123], [80, 124], [86, 120], [92, 140], [92, 160], [88, 180], [80, 184], [75, 166], [72, 144]] },
  { id: 'lumbares', part: 'torso', points: [[93, 152], [98, 156], [98, 206], [92, 208], [89, 190], [91, 170]] },
  { id: 'oblicuos', part: 'torso', points: [[75, 170], [80, 186], [88, 184], [88, 198], [76, 202], [73, 186]] },
  { id: 'triceps_largo', part: 'arm', points: [[63, 112], [67, 122], [65, 148], [61, 162], [57, 156], [57, 132], [59, 118]] },
  { id: 'triceps_lateral', part: 'arm', points: [[50, 114], [56, 118], [55, 140], [55, 160], [50, 164], [47, 146], [47, 126]] },
  { id: 'antebrazos', part: 'arm', points: [[48, 172], [56, 168], [64, 174], [63, 200], [59, 232], [53, 234], [48, 210], [46, 188]] },
  { id: 'gluteo_medio', part: 'leg', points: [[73, 198], [88, 196], [86, 208], [76, 216], [70, 214]] },
  { id: 'gluteo_mayor', part: 'leg', points: [[71, 218], [80, 212], [90, 210], [98, 214], [98, 248], [88, 254], [76, 250], [70, 236]] },
  { id: 'biceps_femoral', part: 'leg', points: [[71, 256], [81, 258], [84, 284], [83, 306], [79, 314], [74, 296], [70, 272]] },
  { id: 'semitendinoso', part: 'leg', points: [[83, 258], [94, 256], [95, 284], [92, 306], [86, 314], [85, 284]] },
  { id: 'aductores', part: 'leg', points: [[95, 252], [98, 254], [97, 276], [95, 280]] },
  { id: 'gemelos', part: 'leg', points: [[78, 324], [87, 322], [88, 352], [83, 362], [77, 350], [75, 336]] },
  { id: 'gemelos', part: 'leg', points: [[89, 322], [96, 324], [98, 340], [96, 360], [90, 356]] },
  { id: 'soleo', part: 'leg', points: [[79, 364], [87, 362], [95, 362], [94, 384], [84, 388]] },
];

const BACK_DETAIL_LINES = [];

// ───────── Utilidades geométricas ─────────
const round = (value) => Math.round(value * 10) / 10;

// Catmull-Rom cerrado → Bézier cúbica. `tension` 0 = polígono, 1 = muy curvo.
export const smoothClosedPath = (points, tension = 0.85) => {
  const count = points.length;
  if (count < 3) return '';
  const factor = tension / 6;
  let path = `M ${round(points[0][0])} ${round(points[0][1])}`;
  for (let index = 0; index < count; index += 1) {
    const p0 = points[(index - 1 + count) % count];
    const p1 = points[index];
    const p2 = points[(index + 1) % count];
    const p3 = points[(index + 2) % count];
    const c1 = [p1[0] + (p2[0] - p0[0]) * factor, p1[1] + (p2[1] - p0[1]) * factor];
    const c2 = [p2[0] - (p3[0] - p1[0]) * factor, p2[1] - (p3[1] - p1[1]) * factor];
    path += ` C ${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`;
  }
  return `${path} Z`;
};

const mirrorPoint = ([x, y]) => [2 * CENTER_X - x, y];

// Silueta completa: mitad izquierda + mitad derecha espejada (en orden inverso para cerrar el contorno).
const mirrorOutline = (halfPoints) => [...halfPoints, ...halfPoints.slice(0, -1).reverse().slice(0, -1).map(mirrorPoint)];

// ───────── Variante femenina: warp proporcional por altura ─────────
// Pares [y, escala horizontal respecto del eje]. Interpolación lineal entre claves.
const FEMALE_WIDTH_KEYS = [
  [0, 0.92], [60, 0.9], [80, 0.88], [120, 0.88], [160, 0.85], [185, 0.86], [205, 1.04], [235, 1.08],
  [270, 1.03], [320, 0.97], [420, 0.95],
];
const FEMALE_ARM_SHIFT = 6; // Los brazos se trasladan (no se escalan) para conservar su grosor.

const interpolateScale = (y) => {
  for (let index = 1; index < FEMALE_WIDTH_KEYS.length; index += 1) {
    const [y1, s1] = FEMALE_WIDTH_KEYS[index];
    const [y0, s0] = FEMALE_WIDTH_KEYS[index - 1];
    if (y <= y1) return s0 + ((s1 - s0) * (y - y0)) / (y1 - y0);
  }
  return FEMALE_WIDTH_KEYS[FEMALE_WIDTH_KEYS.length - 1][1];
};

const warpFemale = (part) => ([x, y]) => {
  if (part === 'arm') return [x + FEMALE_ARM_SHIFT, y];
  return [CENTER_X + (x - CENTER_X) * interpolateScale(y), y];
};

const identity = () => (point) => point;

// ───────── Ensamblado ─────────
const buildShapes = (muscles, warp) =>
  muscles.flatMap((muscle, index) => {
    const left = muscle.points.map(warp(muscle.part));
    const right = left.map(mirrorPoint);
    return [
      { key: `${muscle.id}-${index}-l`, id: muscle.id, d: smoothClosedPath(left) },
      { key: `${muscle.id}-${index}-r`, id: muscle.id, d: smoothClosedPath(right) },
    ];
  });

const buildDetailLines = (lines, warp) =>
  lines.flatMap((line) => {
    const left = line.map(warp('torso'));
    const right = left.map(mirrorPoint);
    return [left, right].map((points) => `M ${points.map(([x, y]) => `${round(x)} ${round(y)}`).join(' L ')}`);
  });

const buildSilhouette = (warp) => {
  const torso = mirrorOutline(TORSO_SILHOUETTE.map(warp('torso')));
  const armLeft = ARM_SILHOUETTE.map(warp('arm'));
  return {
    body: smoothClosedPath(torso, 0.6),
    arms: [smoothClosedPath(armLeft, 0.7), smoothClosedPath(armLeft.map(mirrorPoint), 0.7)],
  };
};

// Cabello y busto (solo variante femenina). Trazos estilizados, inspirados en la referencia.
// hairBack se dibuja detrás del rostro (melena), hairFront por encima (flequillo).
const FEMALE_EXTRAS = {
  frente: {
    hairBack: 'M 100 6 C 77 6 67 22 68 43 C 69 55 71 61 77 63 L 123 63 C 129 61 131 55 132 43 C 133 22 123 6 100 6 Z',
    hairFront: 'M 84 29 C 81 9 119 9 116 29 C 110 21 90 21 84 29 Z',
    bust: ['M 76 104 C 74 120 86 128 97 120', 'M 124 104 C 126 120 114 128 103 120'],
  },
  espalda: {
    hairBack: null,
    hairFront: 'M 100 6 C 77 6 67 22 68 43 C 69 54 72 59 80 60 C 90 61 110 61 120 60 C 128 59 131 54 132 43 C 133 22 123 6 100 6 Z',
    bust: [],
  },
};

const HEAD = { cx: 100, cy: 30, rx: 15, ry: 20 };

const buildFigure = (gender, view) => {
  const isFemale = gender === 'femenino';
  const warp = isFemale ? warpFemale : identity;
  const muscles = view === 'espalda' ? BACK_MUSCLES : FRONT_MUSCLES;
  const lines = view === 'espalda' ? BACK_DETAIL_LINES : FRONT_DETAIL_LINES;
  return {
    // Rostro visible solo en la vista frontal; de espaldas la cabeza es nuca (silueta oscura).
    head: { ...(isFemale ? { ...HEAD, rx: 14, ry: 19 } : HEAD), showFace: view !== 'espalda' },
    silhouette: buildSilhouette(warp),
    shapes: buildShapes(muscles, warp),
    detailLines: buildDetailLines(lines, warp),
    extras: isFemale ? FEMALE_EXTRAS[view] : null,
  };
};

// Precalculado una sola vez (las figuras son estáticas).
export const BODY_FIGURES = Object.freeze({
  masculino: { frente: buildFigure('masculino', 'frente'), espalda: buildFigure('masculino', 'espalda') },
  femenino: { frente: buildFigure('femenino', 'frente'), espalda: buildFigure('femenino', 'espalda') },
});

// Músculos presentes en cada vista (para leyendas / navegación por teclado).
export const MUSCLES_BY_VIEW = Object.freeze({
  frente: [...new Set(FRONT_MUSCLES.map(({ id }) => id))],
  espalda: [...new Set(BACK_MUSCLES.map(({ id }) => id))],
});
