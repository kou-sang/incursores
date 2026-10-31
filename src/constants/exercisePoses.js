/*
 * Poses de cada patrón de movimiento (ver utils/poseFigure.js para las convenciones de ángulos).
 * `frames`: [inicio, final] (la "mitad" se interpola) o [inicio, mitad, final] cuando el movimiento no es lineal.
 * `{ type: 'gear' }` es el implemento: se reemplaza por barra, mancuernas, polea, kettlebell, etc. según el nombre del ejercicio.
 * `gear`: implemento por defecto del patrón; `cableTo`: anclaje de la polea (relativo a la cadera) si el ejercicio usa polea.
 */

const G = { type: 'gear' };
const STAND = { t: 0, a1: [0, 0], l1: [0, 0] };
const BENCH_PAD = { type: 'pad', extend: [8, 4] };
const SEATED = { l1: [90, 0] }; // sentado: muslo horizontal, pierna vertical
const SEAT = { type: 'seat', y: 9, x: -4 };

export const POSES = Object.freeze({
  // ───────── Pecho ─────────
  benchPress: {
    gear: 'barbell',
    frames: [
      { t: -90, a1: [172, 180], l1: [62, 4], props: [BENCH_PAD, { ...G, bar: 0 }] },
      { t: -90, a1: [60, 172], l1: [62, 4], props: [BENCH_PAD, G] },
    ],
  },
  inclinePress: {
    gear: 'barbell',
    frames: [
      { t: -58, a1: [178, 178], l1: [80, 8], props: [BENCH_PAD, SEAT, G] },
      { t: -58, a1: [95, 175], l1: [80, 8], props: [BENCH_PAD, SEAT, G] },
    ],
  },
  declinePress: {
    gear: 'barbell',
    frames: [
      { t: -108, a1: [165, 180], l1: [100, 30], props: [{ type: 'pad', extend: [14, 4] }, G] },
      { t: -108, a1: [50, 170], l1: [100, 30], props: [{ type: 'pad', extend: [14, 4] }, G] },
    ],
  },
  machinePress: {
    gear: 'machine',
    frames: [
      { t: -8, a1: [-60, 90], ...SEATED, props: [BENCH_PAD, SEAT] },
      { t: -8, a1: [88, 90], ...SEATED, props: [BENCH_PAD, SEAT] },
    ],
  },
  fly: {
    gear: 'dumbbell',
    frames: [
      { t: -90, a1: [175, 172], l1: [62, 4], props: [BENCH_PAD, G] },
      { t: -90, a1: [100, 125], l1: [62, 4], props: [BENCH_PAD, G] },
    ],
  },
  inclineFly: {
    gear: 'dumbbell',
    frames: [
      { t: -58, a1: [178, 175], l1: [80, 8], props: [BENCH_PAD, SEAT, G] },
      { t: -58, a1: [110, 140], l1: [80, 8], props: [BENCH_PAD, SEAT, G] },
    ],
  },
  cableCross: {
    gear: 'cable',
    cableTo: [-34, -96],
    frames: [
      { t: 14, a1: [135, 150], l1: [18, 0], l2: [-18, -10], props: [G] },
      { t: 14, a1: [55, 62], l1: [18, 0], l2: [-18, -10], props: [G] },
    ],
  },
  lowCableCross: {
    gear: 'cable',
    cableTo: [-30, 4],
    frames: [
      { t: 6, a1: [20, 30], l1: [18, 0], l2: [-18, -10], props: [G] },
      { t: 6, a1: [125, 140], l1: [18, 0], l2: [-18, -10], props: [G] },
    ],
  },
  pecDeck: {
    gear: 'machine',
    frames: [
      { t: -4, a1: [-75, 175], ...SEATED, props: [BENCH_PAD, SEAT] },
      { t: -4, a1: [92, 175], ...SEATED, props: [BENCH_PAD, SEAT] },
    ],
  },
  pushUp: {
    gear: 'none',
    frames: [
      { t: 70, a1: [-2, -2], l1: 'line', solve: { joint: 'wrist', range: [40, 89] } },
      { t: 80, a1: [-55, 14], l1: 'line', solve: { joint: 'wrist', range: [55, 89.5] } },
    ],
  },
  declinePushUp: {
    gear: 'none',
    frames: [
      { t: 104, a1: [0, 0], l1: 'line', ground: 'none', hip: [72, 92], props: [{ type: 'box', pos: [8, 104], w: 30, abs: true }] },
      { t: 112, a1: [-60, 10], l1: 'line', ground: 'none', hip: [72, 100], props: [{ type: 'box', pos: [8, 104], w: 30, abs: true }] },
    ],
  },
  dips: {
    gear: 'none',
    frames: [
      { t: 8, a1: [-12, 4], l1: [8, -70], ground: 'grip', grip: [112, 84], props: [{ type: 'bar' }, { type: 'post', pos: [112, 88], abs: true }] },
      { t: 22, a1: [-82, 6], l1: [16, -62], ground: 'grip', grip: [112, 84], props: [{ type: 'bar' }, { type: 'post', pos: [112, 88], abs: true }] },
    ],
  },
  pullover: {
    gear: 'dumbbell',
    frames: [
      { t: -90, a1: [178, 178], l1: [62, 4], props: [BENCH_PAD, { ...G, both: false }] },
      { t: -90, a1: [-108, -112], l1: [62, 4], props: [BENCH_PAD, { ...G, both: false }] },
    ],
  },

  // ───────── Espalda ─────────
  deadlift: {
    gear: 'barbell',
    frames: [
      { t: 58, a1: [0, 0], l1: [62, -24], solve: { joint: 'wrist', range: [30, 80], offset: 9 }, props: [G] },
      { t: 30, a1: [0, 0], l1: [20, -10], props: [G] },
      { ...STAND, props: [G] },
    ],
  },
  rackPull: {
    gear: 'barbell',
    frames: [
      { t: 45, a1: [0, 0], l1: [24, -12], props: [G, { type: 'seg', from: [12, 32], to: [12, 70], width: 4 }] },
      { ...STAND, props: [G] },
    ],
  },
  romanianDeadlift: {
    gear: 'barbell',
    frames: [
      { ...STAND, props: [G] },
      { t: 78, a1: [2, 2], l1: [14, -6], props: [G] },
    ],
  },
  stiffLeg: {
    gear: 'barbell',
    frames: [
      { ...STAND, props: [G] },
      { t: 92, a1: [0, 0], l1: [6, 0], props: [G] },
    ],
  },
  goodMorning: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [-50, 160], l1: [0, 0], props: [{ ...G, at: 'shoulder', offset: [-2, 4] }] },
      { t: 80, a1: [-50 + 80, 160 + 80], l1: [14, -8], props: [{ ...G, at: 'shoulder', offset: [2, 4] }] },
    ],
  },
  hyperextension: {
    gear: 'none',
    frames: [
      { t: 165, a1: [190, 120], l1: [-80, -84], ground: 'none', hip: [96, 84], props: [{ type: 'seg', from: [-6, 8], to: [10, 8] }, { type: 'post', pos: [2, 9] }, { type: 'seg', from: [-62, 4], to: [-62, 16] }] },
      { t: 95, a1: [180, 110], l1: [-80, -84], ground: 'none', hip: [96, 84], props: [{ type: 'seg', from: [-6, 8], to: [10, 8] }, { type: 'post', pos: [2, 9] }, { type: 'seg', from: [-62, 4], to: [-62, 16] }] },
    ],
  },
  latPulldown: {
    gear: 'cable',
    cableTo: [12, -128],
    frames: [
      { t: -8, a1: [176, 178], ...SEATED, props: [SEAT, G, { type: 'barbell', bar: 14, r: 0 }] },
      { t: -16, a1: [-18, 168], ...SEATED, props: [SEAT, G, { type: 'barbell', bar: 14, r: 0 }] },
    ],
  },
  straightArmPulldown: {
    gear: 'cable',
    cableTo: [44, -118],
    frames: [
      { t: 26, a1: [150, 152], l1: [12, 0], props: [G] },
      { t: 26, a1: [-6, -6], l1: [12, 0], props: [G] },
    ],
  },
  pullUp: {
    gear: 'none',
    frames: [
      { t: -4, a1: [178, 180], l1: [6, -28], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
      { t: -6, a1: [-24, 172], l1: [10, -30], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
    ],
  },
  chinUp: {
    gear: 'none',
    frames: [
      { t: 0, a1: [180, 180], l1: [8, -40], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
      { t: -4, a1: [8, 178], l1: [12, -40], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
    ],
  },
  bentRow: {
    gear: 'barbell',
    frames: [
      { t: 68, a1: [0, 0], l1: [26, -12], props: [G] },
      { t: 66, a1: [-92, 4], l1: [26, -12], props: [G] },
    ],
  },
  seatedRow: {
    gear: 'cable',
    cableTo: [92, 2],
    frames: [
      { t: 24, a1: [92, 92], l1: [86, 62], ground: 'lowest', props: [G] },
      { t: -6, a1: [-55, 88], l1: [86, 70], ground: 'lowest', props: [G] },
    ],
  },
  oneArmRow: {
    gear: 'dumbbell',
    frames: [
      { t: 82, a1: [0, 0], a2: [0, 0], l1: [10, 0], l2: [-4, -96], props: [{ ...G, both: false }, { type: 'seg', from: [-46, 30], to: [36, 30], rel: 'hip' }, { type: 'post', pos: [-30, 33] }, { type: 'post', pos: [26, 33] }] },
      { t: 82, a1: [-96, -6], a2: [0, 0], l1: [10, 0], l2: [-4, -96], props: [{ ...G, both: false }, { type: 'seg', from: [-46, 30], to: [36, 30], rel: 'hip' }, { type: 'post', pos: [-30, 33] }, { type: 'post', pos: [26, 33] }] },
    ],
  },
  machineRow: {
    gear: 'machine',
    frames: [
      { t: 6, a1: [88, 90], ...SEATED, props: [SEAT, { type: 'pad', side: 'front', offset: 9, extend: [-20, -6], legs: false }] },
      { t: 6, a1: [-62, 88], ...SEATED, props: [SEAT, { type: 'pad', side: 'front', offset: 9, extend: [-20, -6], legs: false }] },
    ],
  },
  invertedRow: {
    gear: 'none',
    frames: [
      { t: -76, a1: [180, 180], l1: 'line', ground: 'grip', grip: [62, 76], props: [{ type: 'bar' }, { type: 'post', pos: [62, 79], abs: true }] },
      { t: -56, a1: [-12, 160], l1: 'line', ground: 'grip', grip: [62, 76], props: [{ type: 'bar' }, { type: 'post', pos: [62, 79], abs: true }] },
    ],
  },
  shrug: {
    view: 'front',
    gear: 'dumbbell',
    frames: [
      { view: 'front', arms: [[6, 6], [6, 6]], legs: [[5, 5], [5, 5]], props: [G] },
      { view: 'front', arms: [[6, 6], [6, 6]], legs: [[5, 5], [5, 5]], shrug: 7, props: [G] },
    ],
  },

  // ───────── Hombros ─────────
  overheadPress: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [36, 168], l1: [0, 0], props: [G] },
      { t: -4, a1: [178, 178], l1: [0, 0], props: [G] },
    ],
  },
  seatedPress: {
    gear: 'dumbbell',
    frames: [
      { t: -6, a1: [30, 170], ...SEATED, props: [BENCH_PAD, SEAT, G] },
      { t: -6, a1: [178, 178], ...SEATED, props: [BENCH_PAD, SEAT, G] },
    ],
  },
  landminePress: {
    gear: 'barbell',
    frames: [
      { t: 10, a1: [30, 160], l1: [16, 0], l2: [-14, -8], props: [{ type: 'seg', from: [-40, 64], rel: 'hip', to: [0, 0], width: 3 }, { ...G, r: 9 }] },
      { t: 14, a1: [130, 132], l1: [16, 0], l2: [-14, -8], props: [{ ...G, r: 9 }] },
    ],
  },
  lateralRaise: {
    view: 'front',
    gear: 'dumbbell',
    frames: [
      { view: 'front', arms: [[10, 10], [10, 10]], legs: [[5, 5], [5, 5]], props: [G] },
      { view: 'front', arms: [[88, 92], [88, 92]], legs: [[5, 5], [5, 5]], props: [G] },
    ],
  },
  frontRaise: {
    gear: 'dumbbell',
    frames: [
      { ...STAND, a1: [6, 6], props: [G] },
      { ...STAND, a1: [92, 94], props: [G] },
    ],
  },
  rearDelt: {
    gear: 'dumbbell',
    frames: [
      { t: 76, a1: [4, 6], l1: [20, -10], props: [G] },
      { t: 76, a1: [-74, -64], l1: [20, -10], props: [G] },
    ],
  },
  reversePecDeck: {
    gear: 'machine',
    frames: [
      { t: 14, a1: [90, 92], ...SEATED, props: [SEAT, { type: 'pad', side: 'front', offset: 9, extend: [-20, -6], legs: false }] },
      { t: 14, a1: [-70, -66], ...SEATED, props: [SEAT, { type: 'pad', side: 'front', offset: 9, extend: [-20, -6], legs: false }] },
    ],
  },
  facePull: {
    gear: 'cable',
    cableTo: [80, -52],
    frames: [
      { t: -6, a1: [88, 90], l1: [12, 0], l2: [-10, -6], props: [G] },
      { t: -8, a1: [-96, 150], l1: [12, 0], l2: [-10, -6], props: [G] },
    ],
  },
  uprightRow: {
    gear: 'barbell',
    frames: [
      { ...STAND, a1: [4, 6], props: [G] },
      { ...STAND, a1: [-100, 58], props: [G] },
    ],
  },
  externalRotation: {
    view: 'front',
    gear: 'cable',
    frames: [
      { view: 'front', arms: [[4, 4], [2, -80]], legs: [[5, 5], [5, 5]], props: [{ type: 'cable', anchors: [[-60, -40], [-60, -40]] }] },
      { view: 'front', arms: [[4, 4], [2, 75]], legs: [[5, 5], [5, 5]], props: [{ type: 'cable', anchors: [[-60, -40], [-60, -40]] }] },
    ],
  },
  yRaise: {
    view: 'front',
    gear: 'dumbbell',
    frames: [
      { view: 'front', arms: [[10, 10], [10, 10]], legs: [[5, 5], [5, 5]], props: [G] },
      { view: 'front', arms: [[150, 152], [150, 152]], legs: [[5, 5], [5, 5]], props: [G] },
    ],
  },

  // ───────── Brazos ─────────
  curl: {
    gear: 'barbell',
    frames: [
      { ...STAND, a1: [4, 6], props: [G] },
      { ...STAND, a1: [10, 162], props: [G] },
    ],
  },
  preacherCurl: {
    gear: 'barbell',
    frames: [
      { t: 18, a1: [42, 42], ...SEATED, props: [SEAT, { type: 'seg', from: [8, -38], to: [26, -16], rel: 'hip', width: 6 }, G] },
      { t: 18, a1: [42, 168], ...SEATED, props: [SEAT, { type: 'seg', from: [8, -38], to: [26, -16], rel: 'hip', width: 6 }, G] },
    ],
  },
  concentrationCurl: {
    gear: 'dumbbell',
    frames: [
      { t: 38, a1: [8, 8], l1: [80, -6], props: [SEAT, { ...G, both: false }] },
      { t: 38, a1: [8, 160], l1: [80, -6], props: [SEAT, { ...G, both: false }] },
    ],
  },
  inclineCurl: {
    gear: 'dumbbell',
    frames: [
      { t: -45, a1: [-8, -8], l1: [80, 6], props: [BENCH_PAD, SEAT, G] },
      { t: -45, a1: [-8, 150], l1: [80, 6], props: [BENCH_PAD, SEAT, G] },
    ],
  },
  tricepsPushdown: {
    gear: 'cable',
    cableTo: [36, -110],
    frames: [
      { t: 10, a1: [4, 130], l1: [6, 0], props: [G] },
      { t: 10, a1: [4, 4], l1: [6, 0], props: [G] },
    ],
  },
  overheadExtension: {
    gear: 'dumbbell',
    frames: [
      { ...STAND, a1: [172, -8], props: [{ ...G, both: false }] },
      { ...STAND, a1: [174, 176], props: [{ ...G, both: false }] },
    ],
  },
  skullCrusher: {
    gear: 'barbell',
    frames: [
      { t: -90, a1: [192, 192], l1: [62, 4], props: [BENCH_PAD, G] },
      { t: -90, a1: [196, 278], l1: [62, 4], props: [BENCH_PAD, G] },
    ],
  },
  tricepsKickback: {
    gear: 'dumbbell',
    frames: [
      { t: 76, a1: [-82, 0], l1: [22, -10], props: [G] },
      { t: 76, a1: [-82, -84], l1: [22, -10], props: [G] },
    ],
  },
  benchDips: {
    gear: 'none',
    frames: [
      { t: -2, a1: [-16, -6], l1: [76, 84, 180], ground: 'grip', grip: [74, 98], props: [{ type: 'box', pos: [52, 98], w: 30, abs: true }] },
      { t: -4, a1: [-84, -6], l1: [60, 72, 180], ground: 'grip', grip: [74, 98], props: [{ type: 'box', pos: [52, 98], w: 30, abs: true }] },
    ],
  },
  wristCurl: {
    gear: 'dumbbell',
    frames: [
      { t: 30, a1: [28, 88], l1: [88, -4], props: [SEAT, { ...G, both: false, offset: [3, 4] }] },
      { t: 30, a1: [28, 88], l1: [88, -4], props: [SEAT, { ...G, both: false, offset: [3, -5] }] },
    ],
  },
  deadHang: {
    gear: 'none',
    frames: [
      { t: 0, a1: [180, 180], l1: [2, 0], ground: 'grip', grip: [100, -12], props: [{ type: 'bar' }] },
      { t: -2, a1: [180, 180], l1: [4, -6], ground: 'grip', grip: [100, -12], props: [{ type: 'bar' }] },
    ],
  },
  farmerWalk: {
    gear: 'dumbbell',
    frames: [
      { t: 2, a1: [2, 2], a2: [0, 0], l1: [24, 0], l2: [-20, -20], props: [G] },
      { t: 2, a1: [0, 0], l1: [0, 0], l2: [10, -40], props: [G] },
      { t: 2, a1: [0, 0], a2: [2, 2], l1: [-20, -20], l2: [24, 0], props: [G] },
    ],
  },

  // ───────── Core ─────────
  crunch: {
    gear: 'none',
    frames: [
      { t: -96, a1: [-150, 80], l1: [138, 22], ground: 'lowest' },
      { t: -60, a1: [-120, 100], l1: [138, 22], ground: 'lowest' },
    ],
  },
  sitUp: {
    gear: 'none',
    frames: [
      { t: -96, a1: [-150, 80], l1: [138, 22], ground: 'lowest' },
      { t: -14, a1: [-40, 150], l1: [138, 22], ground: 'lowest' },
    ],
  },
  reverseCrunch: {
    gear: 'none',
    frames: [
      { t: -90, a1: [95, 95], l1: [150, 60], ground: 'lowest' },
      { t: -90, a1: [95, 95], l1: [208, 120], ground: 'lowest' },
    ],
  },
  plank: {
    gear: 'none',
    frames: [
      { t: 70, a1: [0, 90], l1: 'line', solve: { joint: 'elbow', range: [50, 89], offset: 0 } },
      { t: 70, a1: [0, 90], l1: 'line', solve: { joint: 'elbow', range: [50, 89], offset: 0 } },
    ],
  },
  sidePlank: {
    view: 'front',
    gear: 'none',
    frames: [
      { view: 'front', rot: -72, arms: [[-72, -160], [18, 18]], legs: [[0, 0], [2, 2]] },
      { view: 'front', rot: -72, arms: [[-72, -160], [160, 160]], legs: [[0, 0], [2, 2]] },
    ],
  },
  legRaise: {
    gear: 'none',
    frames: [
      { t: -90, a1: [92, 92], l1: [96, 96], ground: 'lowest' },
      { t: -90, a1: [92, 92], l1: [178, 178], ground: 'lowest' },
    ],
  },
  hangingLegRaise: {
    gear: 'none',
    frames: [
      { t: 0, a1: [180, 180], l1: [0, 0], ground: 'grip', grip: [100, -12], props: [{ type: 'bar' }] },
      { t: -14, a1: [180, 180], l1: [96, 96], ground: 'grip', grip: [100, -12], props: [{ type: 'bar' }] },
    ],
  },
  kneeRaise: {
    gear: 'none',
    frames: [
      { t: 0, a1: [-30, 90], l1: [0, 0], ground: 'none', hip: [100, 92], props: [{ type: 'pad', offset: 7, extend: [-6, 4] }] },
      { t: -6, a1: [-30, 90], l1: [104, 0], ground: 'none', hip: [100, 92], props: [{ type: 'pad', offset: 7, extend: [-6, 4] }] },
    ],
  },
  abWheel: {
    gear: 'wheel',
    frames: [
      { t: 32, a1: [4, 4], l1: [6, -90], ground: 'lowest', props: [G] },
      { t: 76, a1: [150, 150], l1: [44, -90], ground: 'lowest', props: [G] },
    ],
  },
  russianTwist: {
    gear: 'plate',
    frames: [
      { t: -38, a1: [64, 104], a2: [44, 84], l1: [112, 50], ground: 'lowest', props: [{ ...G, r: 7 }] },
      { t: -38, a1: [44, 84], a2: [64, 104], l1: [112, 50], ground: 'lowest', props: [{ ...G, r: 7 }] },
    ],
  },
  bicycleCrunch: {
    gear: 'none',
    frames: [
      { t: -70, a1: [-150, 80], l1: [168, 70], l2: [110, 110], ground: 'lowest' },
      { t: -70, a1: [-150, 80], l1: [110, 110], l2: [168, 70], ground: 'lowest' },
    ],
  },
  woodchopper: {
    gear: 'cable',
    cableTo: [-40, -104],
    frames: [
      { t: -4, a1: [150, 156], l1: [14, 0], l2: [-14, -6], props: [G] },
      { t: 24, a1: [40, 44], l1: [24, -6], l2: [-14, -6], props: [G] },
    ],
  },
  pallofPress: {
    gear: 'cable',
    cableTo: [-50, -46],
    frames: [
      { t: 0, a1: [12, 120], l1: [12, -6], l2: [-12, -6], props: [G] },
      { t: 0, a1: [90, 90], l1: [12, -6], l2: [-12, -6], props: [G] },
    ],
  },

  // ───────── Piernas y glúteos ─────────
  squat: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [-40, 165], l1: [0, 0], props: [{ ...G, at: 'shoulder', offset: [-3, 3] }] },
      { t: 42, a1: [0, 205], l1: [86, -26], props: [{ ...G, at: 'shoulder', offset: [-3, 3] }] },
    ],
  },
  frontSquat: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [80, 168], l1: [0, 0], props: [{ ...G, at: 'shoulder', offset: [8, 2] }] },
      { t: 22, a1: [100, 190], l1: [92, -34], props: [{ ...G, at: 'shoulder', offset: [8, 2] }] },
    ],
  },
  gobletSquat: {
    gear: 'kettlebell',
    frames: [
      { t: 0, a1: [26, 160], l1: [0, 0], props: [{ type: 'ball', r: 7, dy: 6 }] },
      { t: 24, a1: [50, 175], l1: [92, -32], props: [{ type: 'ball', r: 7, dy: 6 }] },
    ],
  },
  sumoSquat: {
    view: 'front',
    gear: 'kettlebell',
    frames: [
      { view: 'front', arms: [[4, 4], [4, 4]], legs: [[16, 16], [16, 16]], props: [] },
      { view: 'front', arms: [[4, 4], [4, 4]], legs: [[62, 8], [62, 8]], props: [] },
    ],
  },
  hackSquat: {
    gear: 'machine',
    frames: [
      { t: -18, a1: [8, 172], l1: [10, 0], props: [{ type: 'pad', extend: [20, 4] }] },
      { t: -18, a1: [8, 172], l1: [96, -30], props: [{ type: 'pad', extend: [20, 4] }] },
    ],
  },
  legPress: {
    gear: 'machine',
    frames: [
      { t: -62, a1: [40, 70], l1: [160, 64], ground: 'none', hip: [70, 112], props: [BENCH_PAD, { type: 'seg', from: [-4, -14], to: [14, 12], rel: 'ankle', width: 5 }] },
      { t: -62, a1: [40, 70], l1: [128, 128], ground: 'none', hip: [70, 112], props: [BENCH_PAD, { type: 'seg', from: [-4, -14], to: [14, 12], rel: 'ankle', width: 5 }] },
    ],
  },
  legExtension: {
    gear: 'machine',
    frames: [
      { t: -6, a1: [10, 30], l1: [90, 4], ground: 'seat', props: [BENCH_PAD, SEAT, { type: 'ball', rel: 'ankle', pos: [3, -4], r: 4 }] },
      { t: -6, a1: [10, 30], l1: [90, 88], ground: 'seat', props: [BENCH_PAD, SEAT, { type: 'ball', rel: 'ankle', pos: [3, -4], r: 4 }] },
    ],
  },
  lyingLegCurl: {
    gear: 'machine',
    frames: [
      { t: 90, a1: [30, 90], l1: 'line', ground: 'none', hip: [104, 98], props: [{ type: 'pad', side: 'front', offset: 8, extend: [40, 4] }] },
      { t: 90, a1: [30, 90], l1: ['rel', 0, 100], ground: 'none', hip: [104, 98], props: [{ type: 'pad', side: 'front', offset: 8, extend: [40, 4] }] },
    ],
  },
  seatedLegCurl: {
    gear: 'machine',
    frames: [
      { t: -10, a1: [10, 30], l1: [90, 82], ground: 'seat', props: [BENCH_PAD, SEAT] },
      { t: -10, a1: [10, 30], l1: [90, -12], ground: 'seat', props: [BENCH_PAD, SEAT] },
    ],
  },
  standingLegCurl: {
    gear: 'machine',
    frames: [
      { t: 10, a1: [40, 120], l1: [0, 0], l2: [6, 0] },
      { t: 10, a1: [40, 120], l1: [0, 0], l2: [6, -130] },
    ],
  },
  nordicCurl: {
    gear: 'none',
    frames: [
      { t: 0, a1: [30, 120], l1: [0, -90], ground: 'lowest' },
      { t: 58, a1: [80, 100], l1: [58, -90], ground: 'lowest' },
    ],
  },
  lunge: {
    gear: 'dumbbell',
    frames: [
      { t: 0, a1: [0, 0], l1: [16, 0], l2: [-12, -6], props: [G] },
      { t: 0, a1: [0, 0], l1: [86, 0], l2: [-12, -92], props: [G] },
    ],
  },
  reverseLunge: {
    gear: 'dumbbell',
    frames: [
      { t: 0, a1: [0, 0], l1: [0, 0], l2: [-4, -4], props: [G] },
      { t: 0, a1: [0, 0], l1: [86, 0], l2: [-14, -92], props: [G] },
    ],
  },
  bulgarianSquat: {
    gear: 'dumbbell',
    frames: [
      { t: 4, a1: [0, 0], l1: [24, 0], l2: [-30, -118], props: [G, { type: 'box', rel: 'farToe', pos: [-16, 2], w: 30 }] },
      { t: 8, a1: [0, 0], l1: [86, -4], l2: [-6, -112], props: [G, { type: 'box', rel: 'farToe', pos: [-16, 2], w: 30 }] },
    ],
  },
  stepUp: {
    gear: 'dumbbell',
    frames: [
      { t: 6, a1: [0, 0], l1: [74, -6], l2: [0, 0], props: [G, { type: 'box', pos: [126, 112], w: 52, abs: true }] },
      { t: 0, a1: [0, 0], l1: [0, 0], l2: [-20, -60], lift: 36, dx: 14, props: [G, { type: 'box', pos: [126, 112], w: 52, abs: true }] },
    ],
  },
  hipThrust: {
    gear: 'barbell',
    frames: [
      { t: -40, a1: [70, 110], l1: [62, 4], props: [{ type: 'box', pos: [-60, -30], w: 22, rel: 'hip' }, { ...G, at: 'hip', offset: [0, -6] }] },
      { t: -96, a1: [-30, 60], l1: [86, 0], props: [{ type: 'box', pos: [-58, -2], w: 22, rel: 'hip' }, { ...G, at: 'hip', offset: [0, -6] }] },
    ],
  },
  gluteBridge: {
    gear: 'none',
    frames: [
      { t: -90, a1: [90, 90], l1: [138, 22], ground: 'lowest' },
      { t: -66, a1: [62, 62], l1: [100, 0], ground: 'feet' },
    ],
  },
  gluteKickback: {
    gear: 'none',
    frames: [
      { t: 90, a1: [0, 0], l1: [0, -90], l2: [0, -90], ground: 'lowest' },
      { t: 90, a1: [0, 0], l1: [-112, -96], l2: [0, -90], ground: 'lowest' },
    ],
  },
  pullThrough: {
    gear: 'cable',
    cableTo: [-46, 30],
    frames: [
      { t: 76, a1: [-14, -14], l1: [16, -8], l2: [6, -6], props: [G] },
      { t: 0, a1: [6, 10], l1: [4, 0], l2: [-6, -2], props: [G] },
    ],
  },
  hipAbduction: {
    view: 'front',
    gear: 'cable',
    frames: [
      { view: 'front', arms: [[30, 50], [4, 4]], legs: [[4, 4], [2, 2]] },
      { view: 'front', arms: [[30, 50], [4, 4]], legs: [[4, 4], [38, 38]] },
    ],
  },
  hipAdduction: {
    view: 'front',
    gear: 'cable',
    frames: [
      { view: 'front', arms: [[30, 50], [4, 4]], legs: [[4, 4], [34, 34]] },
      { view: 'front', arms: [[30, 50], [4, 4]], legs: [[4, 4], [-14, -14]] },
    ],
  },
  bandWalk: {
    view: 'front',
    gear: 'none',
    frames: [
      { view: 'front', arms: [[10, 40], [10, 40]], legs: [[12, 4], [12, 4]], props: [{ type: 'band' }] },
      { view: 'front', arms: [[10, 40], [10, 40]], legs: [[12, 4], [30, 22]], props: [{ type: 'band' }] },
    ],
  },
  calfRaise: {
    gear: 'machine',
    frames: [
      { ...STAND, a1: [4, 4], l1: [0, 0, 90] },
      { ...STAND, a1: [4, 4], l1: [0, 0, 32], lift: 0 },
    ],
  },
  seatedCalf: {
    gear: 'machine',
    frames: [
      { t: 0, a1: [30, 90], l1: [90, 0, 104], props: [SEAT] },
      { t: 0, a1: [30, 90], l1: [90, 0, 48], props: [SEAT] },
    ],
  },
  tibialRaise: {
    gear: 'none',
    frames: [
      { t: -6, a1: [0, 0], l1: [8, 8, 90], props: [{ type: 'wall', pos: [-14, 0] }] },
      { t: -6, a1: [0, 0], l1: [8, 8, 140], props: [{ type: 'wall', pos: [-14, 0] }] },
    ],
  },
  sissySquat: {
    gear: 'none',
    frames: [
      { t: 0, a1: [40, 110], l1: [0, 0] },
      { t: -34, a1: [40, 110], l1: [96, -26, 60] },
    ],
  },

  // ───────── Funcional / CrossFit ─────────
  burpee: {
    gear: 'none',
    frames: [
      { ...STAND },
      { t: 76, a1: [-2, -2], l1: 'line', solve: { joint: 'wrist', range: [40, 89] } },
      { t: -4, a1: [176, 178], l1: [4, 4, 40], lift: 16 },
    ],
  },
  burpeeOverBar: {
    gear: 'none',
    frames: [
      { t: 76, a1: [-2, -2], l1: 'line', solve: { joint: 'wrist', range: [40, 89] }, props: [{ type: 'seg', from: [150, 116], to: [176, 116], abs: true }, { type: 'post', pos: [163, 118], abs: true }] },
      { t: 30, a1: [40, 60], l1: [70, -10], l2: [-30, -60], lift: 30, props: [{ type: 'seg', from: [150, 116], to: [176, 116], abs: true }, { type: 'post', pos: [163, 118], abs: true }] },
      { t: 0, a1: [170, 170], l1: [0, 0], dx: 46, props: [{ type: 'seg', from: [100, 116], to: [126, 116], abs: true }, { type: 'post', pos: [113, 118], abs: true }] },
    ],
  },
  mountainClimber: {
    gear: 'none',
    frames: [
      { t: 68, a1: [0, 0], l1: 'line', l2: [118, -10], solve: { joint: 'wrist', range: [40, 89] } },
      { t: 68, a1: [0, 0], l1: [118, -10], l2: 'line', solve: { joint: 'wrist', range: [40, 89] } },
    ],
  },
  boxJump: {
    gear: 'none',
    frames: [
      { t: 34, a1: [-60, -50], l1: [56, -24], dx: -30, props: [{ type: 'box', pos: [118, 104], w: 50, abs: true }] },
      { t: 20, a1: [100, 110], l1: [110, 0], lift: 58, dx: -4, props: [{ type: 'box', pos: [118, 104], w: 50, abs: true }] },
      { t: 26, a1: [70, 90], l1: [60, -30], lift: 44, dx: 38, props: [{ type: 'box', pos: [118, 104], w: 50, abs: true }] },
    ],
  },
  kettlebellSwing: {
    gear: 'kettlebell',
    frames: [
      { t: 66, a1: [-26, -26], l1: [22, -10], props: [{ ...G, at: 'hand' }] },
      { t: -2, a1: [92, 92], l1: [0, 0], props: [{ ...G, at: 'hand' }] },
    ],
  },
  thruster: {
    gear: 'barbell',
    frames: [
      { t: 22, a1: [100, 190], l1: [92, -34], props: [G] },
      { t: 10, a1: [70, 170], l1: [40, -16], props: [G] },
      { t: -2, a1: [178, 178], l1: [0, 0], props: [G] },
    ],
  },
  powerClean: {
    gear: 'barbell',
    frames: [
      { t: 58, a1: [0, 0], l1: [62, -24], solve: { joint: 'wrist', range: [30, 80], offset: 9 }, props: [G] },
      { t: -6, a1: [8, 10], l1: [0, 0, 40], lift: 4, props: [G] },
      { t: 8, a1: [80, 168], l1: [30, -14], props: [G] },
    ],
  },
  snatch: {
    gear: 'barbell',
    frames: [
      { t: 62, a1: [0, 0], l1: [64, -24], solve: { joint: 'wrist', range: [30, 80], offset: 9 }, props: [G] },
      { t: -8, a1: [10, 14], l1: [0, 0, 40], lift: 4, props: [G] },
      { t: 24, a1: [168, 168], l1: [88, -34], props: [G] },
    ],
  },
  wallBall: {
    gear: 'none',
    frames: [
      { t: 22, a1: [50, 175], l1: [90, -32], props: [{ type: 'ball', r: 8, dy: -4 }, { type: 'wall', pos: [44, 0] }] },
      { t: 0, a1: [160, 170], l1: [0, 0, 40], props: [{ type: 'ball', r: 8, dy: -10 }, { type: 'wall', pos: [44, 0] }] },
    ],
  },
  battleRopes: {
    gear: 'none',
    frames: [
      { t: 22, a1: [70, 100], a2: [30, 50], l1: [42, -18], props: [{ type: 'wave', length: 70 }] },
      { t: 22, a1: [30, 50], a2: [70, 100], l1: [42, -18], props: [{ type: 'wave', length: 70, amp: -1 }] },
    ],
  },
  sledPush: {
    gear: 'none',
    frames: [
      { t: 56, a1: [96, 96], l1: [56, -10], l2: [-34, -50], props: [{ type: 'seg', from: [0, 0], to: [0, 50], rel: 'wrist', width: 4 }, { type: 'seg', from: [-6, 50], to: [34, 50], rel: 'wrist', width: 6 }] },
      { t: 56, a1: [96, 96], l1: [-34, -50], l2: [56, -10], props: [{ type: 'seg', from: [0, 0], to: [0, 50], rel: 'wrist', width: 4 }, { type: 'seg', from: [-6, 50], to: [34, 50], rel: 'wrist', width: 6 }] },
    ],
  },
  jumpSquat: {
    gear: 'none',
    frames: [
      { t: 30, a1: [-40, -30], l1: [80, -28] },
      { t: 0, a1: [-20, -10], l1: [0, 0, 30], lift: 22 },
    ],
  },
  jumpLunge: {
    gear: 'none',
    frames: [
      { t: 0, a1: [-30, 10], a2: [40, 90], l1: [86, 0], l2: [-12, -92] },
      { t: 0, a1: [10, 30], l1: [20, -10], l2: [-10, -30], lift: 18 },
      { t: 0, a1: [40, 90], a2: [-30, 10], l1: [-12, -92], l2: [86, 0] },
    ],
  },
  pistolSquat: {
    gear: 'none',
    frames: [
      { t: 0, a1: [90, 90], l1: [0, 0], l2: [40, 40] },
      { t: 40, a1: [90, 90], l1: [94, -34], l2: [90, 92] },
    ],
  },
  highKnees: {
    gear: 'none',
    frames: [
      { t: 2, a1: [-40, 40], a2: [40, 120], l1: [96, 2], l2: [0, 0, 50] },
      { t: 2, a1: [40, 120], a2: [-40, 40], l1: [0, 0, 50], l2: [96, 2] },
    ],
  },
  jumpingJack: {
    view: 'front',
    gear: 'none',
    frames: [
      { view: 'front', arms: [[8, 8], [8, 8]], legs: [[3, 3], [3, 3]] },
      { view: 'front', arms: [[160, 165], [160, 165]], legs: [[20, 20], [20, 20]], lift: 6 },
    ],
  },
  skater: {
    view: 'front',
    gear: 'none',
    frames: [
      { view: 'front', tilt: -12, arms: [[30, 40], [-20, -10]], legs: [[8, -6], [-30, -40]], dx: -30 },
      { view: 'front', tilt: 0, arms: [[40, 60], [40, 60]], legs: [[20, 20], [20, 20]], lift: 14 },
      { view: 'front', tilt: 12, arms: [[-20, -10], [30, 40]], legs: [[-30, -40], [8, -6]], dx: 30 },
    ],
  },
  bearCrawl: {
    gear: 'none',
    frames: [
      { t: 90, a1: [10, 10], a2: [-10, -10], l1: [40, -60], l2: [70, -50], ground: 'lowest' },
      { t: 90, a1: [-10, -10], a2: [10, 10], l1: [70, -50], l2: [40, -60], ground: 'lowest' },
    ],
  },
  shoulderTap: {
    gear: 'none',
    frames: [
      { t: 70, a1: [0, 0], a2: [0, 0], l1: 'line', solve: { joint: 'wrist', range: [40, 89] } },
      { t: 70, a1: [0, 0], a2: [130, 230], l1: 'line', solve: { joint: 'wrist', range: [40, 89] } },
    ],
  },
  trxRow: {
    gear: 'cable',
    cableTo: [64, -132],
    frames: [
      { t: -30, a1: [120, 124], l1: 'line', props: [G] },
      { t: -14, a1: [-30, 160], l1: 'line', props: [G] },
    ],
  },
  turkishGetUp: {
    gear: 'kettlebell',
    frames: [
      { t: -90, a1: [180, 180], a2: [90, 90], l1: [140, 30], l2: [92, 92], ground: 'lowest', props: [{ type: 'ball', r: 6, dy: -6 }] },
      { t: -40, a1: [180, 180], a2: [-70, -70], l1: [140, 30], l2: [92, 92], ground: 'lowest', props: [{ type: 'ball', r: 6, dy: -6 }] },
      { t: 0, a1: [180, 180], a2: [0, 0], l1: [0, 0], l2: [0, 0], props: [{ type: 'ball', r: 6, dy: -6 }] },
    ],
  },
  slamBall: {
    gear: 'none',
    frames: [
      { t: -10, a1: [170, 175], l1: [0, 0, 50], props: [{ type: 'ball', r: 9, dy: -8 }] },
      { t: 60, a1: [30, 30], l1: [50, -20], props: [{ type: 'ball', pos: [34, 52], r: 9 }] },
    ],
  },
  circuit: {
    gear: 'none',
    frames: [
      { t: 30, a1: [-40, -30], l1: [80, -28] },
      { t: 76, a1: [-2, -2], l1: 'line', solve: { joint: 'wrist', range: [40, 89] } },
      { t: -4, a1: [176, 178], l1: [4, 4, 40], lift: 16 },
    ],
  },
  muscleUp: {
    gear: 'none',
    frames: [
      { t: -6, a1: [178, 180], l1: [60, -90], ground: 'grip', grip: [104, 30], props: [{ type: 'bar' }] },
      { t: 20, a1: [-70, 170], l1: [40, -60], ground: 'grip', grip: [104, 30], props: [{ type: 'bar' }] },
      { t: 6, a1: [-40, 10], l1: [10, -20], ground: 'grip', grip: [104, 30], props: [{ type: 'bar' }] },
    ],
  },
  toesToBar: {
    gear: 'none',
    frames: [
      { t: 0, a1: [180, 180], l1: [0, 0], ground: 'grip', grip: [100, -12], props: [{ type: 'bar' }] },
      { t: -40, a1: [176, 176], l1: [160, 166], ground: 'grip', grip: [100, -12], props: [{ type: 'bar' }] },
    ],
  },
  devilPress: {
    gear: 'dumbbell',
    frames: [
      { t: 76, a1: [-2, -2], l1: 'line', solve: { joint: 'wrist', range: [40, 89], offset: 4 }, props: [G] },
      { t: 64, a1: [-10, -10], l1: [26, -12], props: [G] },
      { t: -2, a1: [178, 178], l1: [0, 0], props: [G] },
    ],
  },
  splitJerk: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [80, 168], l1: [0, 0], props: [G] },
      { t: 0, a1: [80, 168], l1: [16, -14], props: [G] },
      { t: 0, a1: [178, 178], l1: [36, -4], l2: [-30, -40], props: [G] },
    ],
  },
  handstandPushUp: {
    gear: 'none',
    frames: [
      { t: 180, a1: [2, 2], l1: 'line', ground: 'lowest', props: [{ type: 'wall', pos: [-12, 0] }] },
      { t: 180, a1: [-58, 26], l1: 'line', ground: 'lowest', props: [{ type: 'wall', pos: [-12, 0] }] },
    ],
  },
  ropeClimb: {
    gear: 'none',
    frames: [
      { t: 0, a1: [176, 180], l1: [70, -20], ground: 'grip', grip: [100, 40], props: [{ type: 'rope', pos: [100, 0], abs: true }] },
      { t: 0, a1: [-10, 170], l1: [10, 0], ground: 'grip', grip: [100, 40], props: [{ type: 'rope', pos: [100, 0], abs: true }] },
    ],
  },
  overheadSquat: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [176, 176], l1: [0, 0], props: [G] },
      { t: 22, a1: [168, 168], l1: [92, -34], props: [G] },
    ],
  },
  pushPress: {
    gear: 'barbell',
    frames: [
      { t: 0, a1: [36, 168], l1: [0, 0], props: [G] },
      { t: 0, a1: [36, 168], l1: [24, -20], props: [G] },
      { t: -4, a1: [178, 178], l1: [0, 0, 40], props: [G] },
    ],
  },
  kippingPullUp: {
    gear: 'none',
    frames: [
      { t: -22, a1: [176, 172], l1: [-30, -50], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
      { t: 12, a1: [190, 186], l1: [40, 30], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
      { t: -6, a1: [-24, 172], l1: [10, -20], ground: 'grip', grip: [104, -12], props: [{ type: 'bar' }] },
    ],
  },

  // ───────── Cardio ─────────
  running: {
    gear: 'none',
    frames: [
      { t: 10, a1: [-44, 40], a2: [40, 130], l1: [40, 6], l2: [-24, -80], lift: 2 },
      { t: 10, a1: [0, 90], a2: [0, 90], l1: [10, -6], l2: [40, -70] },
      { t: 10, a1: [40, 130], a2: [-44, 40], l1: [-24, -80], l2: [40, 6], lift: 2 },
    ],
  },
  sprint: {
    gear: 'none',
    frames: [
      { t: 18, a1: [-60, 30], a2: [60, 150], l1: [70, -10], l2: [-34, -110], lift: 6 },
      { t: 18, a1: [60, 150], a2: [-60, 30], l1: [-34, -110], l2: [70, -10], lift: 6 },
    ],
  },
  walking: {
    gear: 'none',
    frames: [
      { t: 2, a1: [-20, -10], a2: [20, 30], l1: [22, 4], l2: [-18, -24] },
      { t: 2, a1: [0, 6], l1: [0, 0], l2: [14, -36] },
      { t: 2, a1: [20, 30], a2: [-20, -10], l1: [-18, -24], l2: [22, 4] },
    ],
  },
  inclineWalk: {
    gear: 'none',
    frames: [
      { t: 14, a1: [-20, -10], a2: [20, 30], l1: [36, -4], l2: [-18, -30] },
      { t: 14, a1: [20, 30], a2: [-20, -10], l1: [-18, -30], l2: [36, -4] },
    ],
  },
  cycling: {
    gear: 'none',
    frames: [
      { t: 46, a1: [72, 80], l1: [88, -10], l2: [30, 30], props: [{ type: 'bike', seat: [0, 2], handle: [54, -32] }] },
      { t: 46, a1: [72, 80], l1: [60, 20], l2: [70, -30], props: [{ type: 'bike', seat: [0, 2], handle: [54, -32] }] },
      { t: 46, a1: [72, 80], l1: [30, 30], l2: [88, -10], props: [{ type: 'bike', seat: [0, 2], handle: [54, -32] }] },
    ],
  },
  swimming: {
    gear: 'none',
    frames: [
      { t: 92, a1: [96, 94], a2: [-60, -80], l1: ['rel', 6, 12], l2: ['rel', -6, -12], ground: 'none', hip: [72, 112], props: [{ type: 'water' }], noFloor: true },
      { t: 92, a1: [20, 0], a2: [170, 110], l1: ['rel', -6, -12], l2: ['rel', 6, 12], ground: 'none', hip: [72, 112], props: [{ type: 'water' }], noFloor: true },
      { t: 92, a1: [-60, -80], a2: [96, 94], l1: ['rel', 6, 12], l2: ['rel', -6, -12], ground: 'none', hip: [72, 112], props: [{ type: 'water' }], noFloor: true },
    ],
  },
  elliptical: {
    gear: 'none',
    frames: [
      { t: 6, a1: [40, 90], a2: [10, 60], l1: [30, 0], l2: [-10, -30], lift: 8 },
      { t: 6, a1: [10, 60], a2: [40, 90], l1: [-10, -30], l2: [30, 0], lift: 8 },
    ],
  },
  stairClimber: {
    gear: 'none',
    frames: [
      { t: 12, a1: [30, 60], l1: [70, -6], l2: [0, 0] },
      { t: 12, a1: [30, 60], l1: [0, 0], l2: [70, -6] },
    ],
  },
  rowErg: {
    gear: 'cable',
    cableTo: [80, 10],
    frames: [
      { t: 26, a1: [92, 92], l1: [144, 20], ground: 'lowest', dx: 24, props: [G, { type: 'seg', from: [20, 150], to: [182, 150], abs: true, width: 3 }] },
      { t: -22, a1: [-40, 88], l1: [90, 88], ground: 'lowest', dx: -8, props: [G, { type: 'seg', from: [20, 150], to: [182, 150], abs: true, width: 3 }] },
    ],
  },
  jumpRope: {
    gear: 'none',
    frames: [
      { t: 0, a1: [18, 60], l1: [0, 0, 60], props: [{ type: 'arc' }] },
      { t: 0, a1: [18, 60], l1: [6, -6, 40], lift: 10, props: [{ type: 'arc', under: true }] },
    ],
  },

  // ───────── Baile ─────────
  samba: {
    view: 'front',
    gear: 'none',
    frames: [
      { view: 'front', tilt: -8, arms: [[60, 140], [30, 100]], legs: [[6, -6], [14, 30]] },
      { view: 'front', tilt: 0, arms: [[40, 110], [40, 110]], legs: [[8, 8], [8, 8]], lift: 3 },
      { view: 'front', tilt: 8, arms: [[30, 100], [60, 140]], legs: [[14, 30], [6, -6]] },
    ],
  },
  dance: {
    view: 'front',
    gear: 'none',
    frames: [
      { view: 'front', tilt: -6, arms: [[150, 160], [40, 100]], legs: [[14, 6], [4, 30]] },
      { view: 'front', tilt: 6, arms: [[40, 100], [150, 160]], legs: [[4, 30], [14, 6]] },
      { view: 'front', tilt: 0, arms: [[90, 150], [90, 150]], legs: [[18, 4], [18, 4]] },
    ],
  },
  stepAerobic: {
    gear: 'none',
    frames: [
      { t: 2, a1: [40, 120], a2: [-20, 20], l1: [60, -10], l2: [0, 0], props: [{ type: 'box', pos: [104, 132], w: 46, abs: true }] },
      { t: 0, a1: [160, 170], l1: [0, 0], l2: [6, -10], lift: 16, dx: 8, props: [{ type: 'box', pos: [104, 132], w: 46, abs: true }] },
    ],
  },

  // ───────── Combate ─────────
  boxing: {
    gear: 'none',
    frames: [
      { t: 8, a1: [30, 160], a2: [20, 150], l1: [18, -6], l2: [-18, -14] },
      { t: 12, a1: [92, 92], a2: [20, 150], l1: [22, -8], l2: [-20, -16] },
      { t: 16, a1: [30, 160], a2: [94, 94], l1: [22, -8], l2: [-26, -24] },
    ],
  },
  kickboxing: {
    gear: 'none',
    frames: [
      { t: 8, a1: [30, 160], a2: [20, 150], l1: [18, -6], l2: [-18, -14] },
      { t: -10, a1: [30, 160], a2: [-30, 40], l1: [110, -10], l2: [0, 0] },
      { t: -26, a1: [30, 160], a2: [-40, 30], l1: [104, 100], l2: [-4, -4] },
    ],
  },
  martialArts: {
    gear: 'none',
    frames: [
      { t: 18, a1: [60, 110], l1: [34, -14], l2: [-28, -20] },
      { t: 46, a1: [80, 80], l1: [60, -20], l2: [-30, -40] },
      { t: 30, a1: [-40, 60], a2: [120, 150], l1: [40, -20], l2: [-10, -20] },
    ],
  },

  // ───────── Yoga y Pilates ─────────
  yoga: {
    gear: 'none',
    frames: [
      { t: 0, a1: [180, 180], l1: [0, 0] },
      { t: 0, a1: [90, 90], a2: [-90, -90], l1: [86, 0], l2: [-40, -40] },
      { t: 128, a1: [52, 52], l1: [-18, -18, 30], ground: 'lowest' },
    ],
  },
  pilates: {
    gear: 'none',
    frames: [
      { t: -80, a1: [92, 92], l1: [130, 130], ground: 'lowest' },
      { t: -40, a1: [100, 100], l1: [96, 96], ground: 'lowest' },
      { t: -36, a1: [130, 130], l1: [140, 140], ground: 'lowest' },
    ],
  },

  // ───────── Deportes ─────────
  football: {
    gear: 'none',
    frames: [
      { t: 6, a1: [-30, -10], a2: [30, 40], l1: [16, 0], l2: [-20, -20], props: [{ type: 'ball', pos: [40, 50], r: 7 }] },
      { t: -4, a1: [-50, -30], a2: [60, 70], l1: [0, 0], l2: [-50, -120], props: [{ type: 'ball', pos: [26, 50], r: 7 }] },
      { t: -16, a1: [-70, -40], a2: [70, 90], l1: [-6, -6], l2: [80, 80], props: [{ type: 'ball', pos: [80, -10], r: 7 }] },
    ],
  },
  racket: {
    gear: 'none',
    frames: [
      { t: 18, a1: [30, 90], a2: [30, 90], l1: [30, -10], l2: [-20, -20], props: [{ type: 'racket', angle: 150 }] },
      { t: 10, a1: [-80, -60], a2: [60, 90], l1: [20, -10], l2: [-30, -30], props: [{ type: 'racket', angle: -120 }] },
      { t: 10, a1: [130, 210], a2: [40, 60], l1: [30, -4], l2: [-30, -40], props: [{ type: 'racket', angle: 230 }] },
    ],
  },
  basketball: {
    gear: 'none',
    frames: [
      { t: 18, a1: [40, 170], l1: [60, -24], props: [{ type: 'ball', r: 7, dy: -6 }] },
      { t: 0, a1: [150, 176], l1: [4, 4, 40], lift: 18, props: [{ type: 'ball', r: 7, dy: -8 }] },
    ],
  },
  volleyball: {
    gear: 'none',
    frames: [
      { t: 40, a1: [-60, -60], l1: [60, -24] },
      { t: -10, a1: [170, 120], a2: [120, 120], l1: [20, -40], lift: 20, props: [{ type: 'ball', pos: [30, -110], r: 7 }] },
      { t: 14, a1: [110, 110], a2: [30, 40], l1: [30, -40], lift: 16, props: [{ type: 'ball', pos: [60, -70], r: 7 }] },
    ],
  },
  climbing: {
    gear: 'none',
    frames: [
      { t: -10, a1: [170, 176], a2: [140, 160], l1: [80, -10], l2: [20, -10], ground: 'grip', grip: [148, 40], props: [{ type: 'wall', pos: [156, 0], abs: true }] },
      { t: -6, a1: [140, 165], a2: [175, 178], l1: [40, -10], l2: [86, -10], ground: 'grip', grip: [148, 40], props: [{ type: 'wall', pos: [156, 0], abs: true }] },
    ],
  },
});
