import { CATEGORIES, LEGACY_MUSCLE_DISTRIBUTION, MUSCLE_BY_ID, MUSCLE_IDS } from './muscles';

// Re-exportados para mantener compatibilidad con imports existentes ('constants/exercises').
export { CATEGORIES, CATEGORY_LABELS, MUSCLES, MUSCLE_LABELS } from './muscles';

/*
 * Diccionario de ejercicios con nombres usados en gimnasios de Argentina.
 * Formato: [NOMBRE, CATEGORÍA, distribución { código: % }, alias[]]
 * - La distribución suma 100: es el porcentaje del estímulo que recibe cada músculo.
 * - Los alias resuelven nombres viejos (historial ya guardado) y variantes populares.
 * Códigos de músculo (ver constants/muscles.js):
 *   ps pecho_superior · pm pecho_medio · pi pecho_inferior
 *   ts trapecio_superior · tm trapecio_medio · da dorsal_ancho · rm redondo_mayor · lu lumbares
 *   dan deltoides_anterior · dl deltoides_lateral · dp deltoides_posterior · mr manguito_rotador
 *   bi biceps · br braquial · tl triceps_largo · tla triceps_lateral · ab antebrazos
 *   ra recto_abdominal · ob oblicuos · se serrato
 *   rf recto_femoral · vl vasto_lateral · vm vasto_medial · bf biceps_femoral · st semitendinoso · ad aductores
 *   gm gluteo_mayor · gme gluteo_medio · ge gemelos · so soleo · ti tibial
 */
const CODE_TO_MUSCLE = Object.freeze({
  ps: 'pecho_superior', pm: 'pecho_medio', pi: 'pecho_inferior',
  ts: 'trapecio_superior', tm: 'trapecio_medio', da: 'dorsal_ancho', rm: 'redondo_mayor', lu: 'lumbares',
  dan: 'deltoides_anterior', dl: 'deltoides_lateral', dp: 'deltoides_posterior', mr: 'manguito_rotador',
  bi: 'biceps', br: 'braquial', tl: 'triceps_largo', tla: 'triceps_lateral', ab: 'antebrazos',
  ra: 'recto_abdominal', ob: 'oblicuos', se: 'serrato',
  rf: 'recto_femoral', vl: 'vasto_lateral', vm: 'vasto_medial', bf: 'biceps_femoral', st: 'semitendinoso', ad: 'aductores',
  gm: 'gluteo_mayor', gme: 'gluteo_medio', ge: 'gemelos', so: 'soleo', ti: 'tibial',
});

const CATALOG_ENTRIES = [
  // ───────── PECHO ─────────
  ['PRESS BANCA', 'PECHO', { pm: 40, ps: 15, pi: 10, dan: 15, tla: 12, tl: 5, se: 3 }, ['PRESS PLANO', 'PRESS DE BANCA PLANO', 'PRESS PLANO CON BARRA']],
  ['PRESS BANCA CON MANCUERNAS', 'PECHO', { pm: 42, ps: 15, pi: 10, dan: 15, tla: 10, tl: 5, se: 3 }, ['PRESS PLANO CON MANCUERNAS']],
  ['PRESS INCLINADO', 'PECHO', { ps: 40, pm: 18, dan: 22, tla: 12, tl: 5, se: 3 }, ['PRESS INCLINADO CON BARRA']],
  ['PRESS INCLINADO CON MANCUERNAS', 'PECHO', { ps: 42, pm: 18, dan: 22, tla: 10, tl: 5, se: 3 }, []],
  ['PRESS DECLINADO', 'PECHO', { pi: 40, pm: 30, dan: 8, tla: 15, tl: 7 }, ['PRESS DECLINADO CON BARRA']],
  ['PRESS DECLINADO CON MANCUERNAS', 'PECHO', { pi: 42, pm: 30, dan: 8, tla: 13, tl: 7 }, []],
  ['PRESS DE PECHO EN MAQUINA', 'PECHO', { pm: 45, ps: 15, pi: 10, dan: 15, tla: 15 }, ['PRESS MAQUINA', 'PRESS EN MAQUINA']],
  ['PRESS INCLINADO EN MAQUINA', 'PECHO', { ps: 45, pm: 15, dan: 25, tla: 15 }, []],
  ['PRESS EN MULTIPOWER', 'PECHO', { pm: 40, ps: 15, pi: 10, dan: 17, tla: 13, tl: 5 }, ['PRESS EN SMITH', 'PRESS BANCA EN SMITH']],
  ['PRESS INCLINADO EN MULTIPOWER', 'PECHO', { ps: 42, pm: 18, dan: 22, tla: 13, tl: 5 }, ['PRESS INCLINADO EN SMITH']],
  ['PRESS SVEND', 'PECHO', { pm: 50, ps: 20, dan: 15, tla: 15 }, ['PRESS CON DISCO']],
  ['MARIPOSA', 'PECHO', { pm: 55, ps: 20, pi: 15, dan: 10 }, ['PEC DECK', 'PECK DECK', 'APERTURAS EN MAQUINA']],
  ['APERTURAS CON MANCUERNAS', 'PECHO', { pm: 50, ps: 20, pi: 15, dan: 10, bi: 5 }, ['APERTURAS', 'APERTURAS PLANAS', 'APERTURAS PLANO']],
  ['APERTURAS INCLINADAS', 'PECHO', { ps: 50, pm: 28, dan: 17, bi: 5 }, ['APERTURAS INCLINADAS CON MANCUERNAS']],
  ['CRUCE DE POLEAS', 'PECHO', { pm: 40, pi: 35, ps: 10, dan: 10, se: 5 }, ['CROSSOVER', 'CRUCE DE POLEAS ALTAS', 'CRUCES EN POLEA']],
  ['CRUCE DE POLEAS BAJAS', 'PECHO', { ps: 50, pm: 25, dan: 20, bi: 5 }, ['CROSSOVER BAJO']],
  ['FLEXIONES', 'PECHO', { pm: 38, ps: 12, pi: 10, dan: 15, tla: 12, tl: 5, ra: 5, se: 3 }, ['LAGARTIJAS', 'PECHADAS', 'FLEXIONES DE BRAZOS']],
  ['FLEXIONES DECLINADAS', 'PECHO', { ps: 35, pm: 25, dan: 20, tla: 12, ra: 5, se: 3 }, ['FLEXIONES CON PIES ELEVADOS']],
  ['FLEXIONES DIAMANTE', 'TRICEPS', { tla: 35, tl: 15, pm: 25, pi: 5, dan: 15, ra: 5 }, ['FLEXIONES CERRADAS']],
  ['FONDOS PARA PECHO', 'PECHO', { pi: 40, pm: 20, dan: 15, tla: 18, tl: 7 }, ['FONDOS INCLINADO ADELANTE']],
  ['PULLOVER', 'PECHO', { da: 35, pm: 30, pi: 10, tl: 15, se: 10 }, ['PULLOVER CON MANCUERNA']],

  // ───────── ESPALDA ─────────
  ['PESO MUERTO', 'ESPALDA', { lu: 22, gm: 22, bf: 12, st: 10, vl: 6, vm: 5, rf: 3, ts: 8, tm: 5, ab: 7 }, ['PESO MUERTO CONVENCIONAL']],
  ['RACK PULL', 'ESPALDA', { lu: 25, ts: 20, gm: 20, tm: 10, bf: 8, st: 7, ab: 10 }, ['PESO MUERTO DESDE RACK']],
  ['JALON AL PECHO', 'ESPALDA', { da: 45, rm: 10, tm: 12, bi: 15, br: 5, dp: 8, ab: 5 }, ['JALON ADELANTE', 'POLEA AL PECHO', 'JALON ABIERTO']],
  ['JALON AL PECHO AGARRE CERRADO', 'ESPALDA', { da: 45, rm: 10, tm: 10, bi: 18, br: 7, dp: 5, ab: 5 }, ['JALON CERRADO', 'JALON CON TRIANGULO']],
  ['JALON TRAS NUCA', 'ESPALDA', { da: 40, rm: 12, tm: 15, bi: 13, dp: 10, ab: 5, mr: 5 }, ['POLEA TRAS NUCA']],
  ['JALON CON BRAZOS RECTOS', 'ESPALDA', { da: 60, rm: 15, tl: 15, ra: 5, se: 5 }, ['PULLOVER EN POLEA', 'PULLDOWN BRAZOS RECTOS']],
  ['DOMINADAS', 'ESPALDA', { da: 45, rm: 10, tm: 10, bi: 17, br: 6, ab: 7, ra: 5 }, ['DOMINADAS PRONAS', 'PULL UPS']],
  ['DOMINADAS SUPINAS', 'ESPALDA', { da: 40, rm: 8, tm: 8, bi: 25, br: 7, ab: 7, ra: 5 }, ['CHIN UPS', 'DOMINADAS AGARRE SUPINO']],
  ['DOMINADAS ASISTIDAS', 'ESPALDA', { da: 45, rm: 10, tm: 10, bi: 18, br: 7, dp: 5, ab: 5 }, ['DOMINADAS EN MAQUINA']],
  ['REMO CON BARRA', 'ESPALDA', { da: 30, tm: 22, rm: 8, dp: 12, bi: 12, br: 4, lu: 7, ab: 5 }, ['REMO INCLINADO CON BARRA', 'REMO BARRA']],
  ['REMO PENDLAY', 'ESPALDA', { da: 28, tm: 24, rm: 8, dp: 12, bi: 12, br: 4, lu: 7, ab: 5 }, []],
  ['REMO BAJO', 'ESPALDA', { da: 35, tm: 22, rm: 8, dp: 10, bi: 15, br: 5, ab: 5 }, ['REMO SENTADO EN POLEA', 'REMO EN POLEA BAJA', 'REMO GIRONDA']],
  ['REMO EN T', 'ESPALDA', { da: 32, tm: 22, rm: 8, dp: 12, bi: 12, br: 4, lu: 5, ab: 5 }, ['REMO T', 'REMO EN BARRA T']],
  ['REMO UNILATERAL', 'ESPALDA', { da: 40, tm: 15, rm: 10, dp: 10, bi: 15, br: 5, ab: 5 }, ['REMO CON MANCUERNA', 'SERRUCHO']],
  ['REMO EN MAQUINA', 'ESPALDA', { da: 35, tm: 25, rm: 8, dp: 12, bi: 12, br: 3, ab: 5 }, ['REMO HAMMER']],
  ['REMO INVERTIDO', 'ESPALDA', { da: 30, tm: 25, dp: 15, bi: 15, br: 5, ra: 5, ab: 5 }, ['REMO AUSTRALIANO']],
  ['HIPEREXTENSIONES', 'ESPALDA', { lu: 50, gm: 30, bf: 10, st: 10 }, ['EXTENSIONES LUMBARES', 'BANCO ROMANO', 'LUMBARES']],
  ['BUENOS DIAS', 'ESPALDA', { lu: 35, bf: 22, st: 22, gm: 21 }, ['GOOD MORNING']],
  ['ENCOGIMIENTOS CON BARRA', 'ESPALDA', { ts: 80, tm: 10, ab: 10 }, ['SHRUGS', 'ENCOGIMIENTOS DE HOMBROS', 'ENCOGIMIENTOS']],
  ['ENCOGIMIENTOS CON MANCUERNAS', 'ESPALDA', { ts: 80, tm: 8, ab: 12 }, []],

  // ───────── HOMBROS ─────────
  ['PRESS MILITAR', 'HOMBROS', { dan: 45, dl: 20, tla: 15, tl: 5, ts: 8, ps: 5, ra: 2 }, ['PRESS HOMBRO BARRAS', 'PRESS MILITAR CON BARRA', 'PRESS MILITAR PARADO']],
  ['PRESS DE HOMBROS CON MANCUERNAS', 'HOMBROS', { dan: 45, dl: 22, tla: 15, tl: 5, ts: 8, ps: 5 }, ['PRESS HOMBRO', 'PRESS DE HOMBROS', 'PRESS MILITAR CON MANCUERNAS']],
  ['PRESS ARNOLD', 'HOMBROS', { dan: 45, dl: 25, tla: 15, tl: 5, ts: 5, ps: 5 }, ['ARNOLD PRESS', 'PRESS ARNOLD CON MANCUERNAS']],
  ['PRESS DE HOMBROS EN MAQUINA', 'HOMBROS', { dan: 48, dl: 20, tla: 17, tl: 5, ts: 5, ps: 5 }, ['PRESS HOMBRO EN MAQUINA']],
  ['PRESS TRAS NUCA', 'HOMBROS', { dan: 35, dl: 30, dp: 5, tla: 15, tl: 5, ts: 10 }, ['PRESS MILITAR TRAS NUCA']],
  ['LANDMINE PRESS', 'HOMBROS', { dan: 40, ps: 25, tla: 20, se: 10, ra: 5 }, ['PRESS LANDMINE', 'PRESS CON MINA']],
  ['VUELOS LATERALES', 'HOMBROS', { dl: 70, dan: 10, ts: 15, se: 5 }, ['ELEVACIONES LATERALES', 'LATERALES', 'VUELOS LATERALES CON MANCUERNAS']],
  ['VUELOS LATERALES EN POLEA', 'HOMBROS', { dl: 72, dan: 10, ts: 13, se: 5 }, ['LATERALES EN POLEA']],
  ['VUELOS LATERALES EN MAQUINA', 'HOMBROS', { dl: 75, dan: 10, ts: 15 }, ['LATERALES EN MAQUINA']],
  ['VUELOS ANTERIORES', 'HOMBROS', { dan: 70, ps: 15, dl: 10, se: 5 }, ['ELEVACIONES FRONTALES', 'FRONTALES', 'VUELOS FRONTALES']],
  ['VUELOS POSTERIORES', 'HOMBROS', { dp: 60, mr: 12, tm: 18, rm: 5, dl: 5 }, ['PAJARO', 'PAJARITOS', 'POSTERIORES CON MANCUERNAS']],
  ['PEC DECK INVERTIDO', 'HOMBROS', { dp: 62, tm: 20, mr: 10, dl: 8 }, ['MARIPOSA INVERTIDA', 'POSTERIORES EN MAQUINA', 'MARIPOSA POSTERIOR']],
  ['FACE PULL', 'HOMBROS', { dp: 40, mr: 25, tm: 20, ts: 5, dl: 5, bi: 5 }, ['FACEPULL', 'TIRON A LA CARA']],
  ['REMO MENTON', 'HOMBROS', { dl: 40, ts: 35, dan: 10, bi: 10, ab: 5 }, ['REMO AL MENTON', 'REMO ALTO', 'REMO AL CUELLO']],
  ['ROTACION EXTERNA EN POLEA', 'HOMBROS', { mr: 80, dp: 20 }, ['ROTACIONES EXTERNAS', 'ROTADORES']],
  ['ELEVACIONES EN Y', 'HOMBROS', { tm: 35, dl: 25, dp: 20, ts: 10, mr: 10 }, ['Y RAISE']],

  // ───────── BÍCEPS ─────────
  ['CURL CON BARRA', 'BICEPS', { bi: 65, br: 20, ab: 15 }, ['CURL DE BICEPS CON BARRA', 'CURL BARRA RECTA']],
  ['CURL CON BARRA W', 'BICEPS', { bi: 60, br: 25, ab: 15 }, ['CURL BARRA W', 'CURL CON BARRA Z', 'CURL BARRA Z']],
  ['CURL CON MANCUERNAS', 'BICEPS', { bi: 65, br: 20, ab: 15 }, ['CURL SIMULTANEO']],
  ['CURL ALTERNADO CON MANCUERNAS', 'BICEPS', { bi: 65, br: 20, ab: 15 }, ['ALT CON MANCUERNA', 'CURL ALTERNADO', 'BICEPS ALTERNADO']],
  ['CURL MARTILLO', 'BICEPS', { br: 45, ab: 30, bi: 25 }, ['MARTILLO', 'CURL MARTILLO CON MANCUERNAS']],
  ['CURL MARTILLO CON SOGA', 'BICEPS', { br: 45, ab: 30, bi: 25 }, ['MARTILLO CON SOGA', 'MARTILLO EN POLEA']],
  ['CURL POLEA', 'BICEPS', { bi: 65, br: 20, ab: 15 }, ['CURL EN POLEA BAJA', 'CURL EN POLEA']],
  ['CURL SCOTT', 'BICEPS', { bi: 60, br: 30, ab: 10 }, ['SCOTT', 'BANCO SCOTT', 'CURL PREDICADOR']],
  ['CURL CONCENTRADO', 'BICEPS', { bi: 70, br: 20, ab: 10 }, ['BICEP CONCENTRADO', 'BICEPS CONCENTRADO']],
  ['CURL BAYESIANO', 'BICEPS', { bi: 75, br: 15, ab: 10 }, ['BAYESIANA', 'CURL BAYESIANA']],
  ['CURL BICEPS INCLINADO', 'BICEPS', { bi: 75, br: 15, ab: 10 }, ['CURL INCLINADO']],
  ['CURL ARAÑA', 'BICEPS', { bi: 70, br: 20, ab: 10 }, ['CURL SPIDER', 'SPIDER CURL']],
  ['CURL 21', 'BICEPS', { bi: 65, br: 20, ab: 15 }, ['21S', 'VEINTIUNOS']],
  ['CURL EN MAQUINA', 'BICEPS', { bi: 65, br: 25, ab: 10 }, []],
  ['CURL INVERTIDO', 'ANTEBRAZOS', { ab: 45, br: 40, bi: 15 }, ['CURL PRONO', 'CURL REVERSO']],

  // ───────── TRÍCEPS ─────────
  ['EXTENSION DE TRICEPS EN POLEA', 'TRICEPS', { tla: 65, tl: 30, ab: 5 }, ['EXT POLEA ALTA', 'TRICEPS EN POLEA', 'PUSHDOWN', 'EMPUJES EN POLEA']],
  ['EXTENSION DE TRICEPS CON SOGA', 'TRICEPS', { tla: 60, tl: 35, ab: 5 }, ['TRICEPS CON SOGA', 'SOGA TRICEPS']],
  ['EXTENSION DE TRICEPS AGARRE INVERTIDO', 'TRICEPS', { tla: 65, tl: 25, ab: 10 }, ['TRICEPS INVERTIDO', 'TRICEPS SUPINO EN POLEA']],
  ['PRESS FRANCES', 'TRICEPS', { tl: 50, tla: 45, ab: 5 }, ['ROMPECRANEOS', 'PRESS FRANCES CON BARRA']],
  ['PRESS FRANCES CON MANCUERNAS', 'TRICEPS', { tl: 50, tla: 45, ab: 5 }, []],
  ['EXTENSION DE TRICEPS CON MANCUERNA', 'TRICEPS', { tl: 60, tla: 35, ab: 5 }, ['EXT CON MANCUERNA', 'EXTENSION TRAS NUCA CON MANCUERNA']],
  ['TRICEPS COPA', 'TRICEPS', { tl: 62, tla: 33, ab: 5 }, ['EXT COPA', 'COPA']],
  ['TRICEPS TRAS NUCA EN POLEA', 'TRICEPS', { tl: 65, tla: 30, ab: 5 }, ['TRASNUCA', 'TRICEPS TRASNUCA', 'TRAS NUCA EN POLEA']],
  ['PATADA DE TRICEPS', 'TRICEPS', { tla: 50, tl: 45, dp: 5 }, ['KICKBACK', 'PATADA DE TRICEPS CON MANCUERNA']],
  ['FONDOS EN PARALELAS', 'TRICEPS', { tla: 40, tl: 15, pi: 25, pm: 5, dan: 15 }, ['FONDOS', 'PARALELAS']],
  ['FONDOS EN BANCO', 'TRICEPS', { tla: 50, tl: 20, dan: 20, pi: 10 }, ['FONDOS ENTRE BANCOS', 'FONDOS DE TRICEPS EN BANCO']],
  ['FONDOS EN MAQUINA', 'TRICEPS', { tla: 45, tl: 20, pi: 20, dan: 15 }, ['FONDOS ASISTIDOS']],
  ['PRESS CERRADO', 'TRICEPS', { tla: 35, tl: 15, pm: 25, pi: 5, ps: 5, dan: 15 }, ['PRESS BANCA AGARRE CERRADO', 'PRESS BANCA CERRADO']],

  // ───────── ANTEBRAZOS ─────────
  ['CURL DE MUÑECA', 'ANTEBRAZOS', { ab: 100 }, ['CURL DE MUNECAS', 'FLEXION DE MUNECA']],
  ['CURL DE MUÑECA INVERTIDO', 'ANTEBRAZOS', { ab: 100 }, ['EXTENSION DE MUNECA', 'EXTENSIONES DE MUNECA']],
  ['RODILLO DE MUÑECA', 'ANTEBRAZOS', { ab: 90, dan: 10 }, ['ENROLLADOR', 'WRIST ROLLER']],
  ['COLGADO EN BARRA', 'ANTEBRAZOS', { ab: 65, da: 20, ra: 10, rm: 5 }, ['DEAD HANG', 'COLGARSE EN BARRA']],

  // ───────── CORE ─────────
  ['CRUNCH', 'CORE', { ra: 85, ob: 15 }, ['ABDOMINALES', 'CRUNCH ABDOMINAL', 'ABDOMINALES CORTOS']],
  ['CRUNCH EN POLEA', 'CORE', { ra: 80, ob: 20 }, ['CRUNCH CON SOGA', 'ABDOMINALES EN POLEA']],
  ['CRUNCH EN MAQUINA', 'CORE', { ra: 85, ob: 15 }, ['ABDOMINALES EN MAQUINA']],
  ['CRUNCH INVERSO', 'CORE', { ra: 80, ob: 15, rf: 5 }, ['CRUNCH REVERSO', 'ABDOMINALES INVERSOS']],
  ['SIT UP', 'CORE', { ra: 70, ob: 15, rf: 15 }, ['ABDOMINALES COMPLETOS', 'SIT UPS']],
  ['PLANCHA', 'CORE', { ra: 45, ob: 25, dan: 10, gm: 10, se: 10 }, ['PLANCHA ABDOMINAL', 'PLANK']],
  ['PLANCHA LATERAL', 'CORE', { ob: 60, ra: 15, gme: 20, dan: 5 }, ['SIDE PLANK']],
  ['ELEVACION DE PIERNAS', 'CORE', { ra: 55, ob: 15, rf: 20, ad: 10 }, ['ELEVACIONES DE PIERNAS', 'ELEVACION DE PIERNAS ACOSTADO']],
  ['ELEVACION DE PIERNAS COLGADO', 'CORE', { ra: 50, ob: 20, rf: 15, ab: 10, da: 5 }, ['ELEVACIONES COLGADO', 'ELEVACION DE PIERNAS EN BARRA']],
  ['ELEVACION DE RODILLAS EN PARALELAS', 'CORE', { ra: 55, ob: 20, rf: 20, tla: 5 }, ['CAPITAN', 'SILLA ROMANA', 'ELEVACION DE RODILLAS']],
  ['RUEDA ABDOMINAL', 'CORE', { ra: 55, ob: 15, da: 15, tl: 5, se: 10 }, ['RUEDITA', 'AB WHEEL']],
  ['RUSSIAN TWIST', 'CORE', { ob: 60, ra: 35, rf: 5 }, ['GIROS RUSOS', 'GIRO RUSO']],
  ['BICICLETA', 'CORE', { ra: 45, ob: 45, rf: 10 }, ['ABDOMINALES BICICLETA', 'CRUNCH BICICLETA']],
  ['LEÑADOR EN POLEA', 'CORE', { ob: 65, ra: 15, dan: 10, se: 10 }, ['LENADOR', 'WOODCHOPPER']],
  ['PALLOF PRESS', 'CORE', { ob: 60, ra: 30, se: 10 }, ['PRESS PALLOF', 'ANTIRROTACION']],

  // ───────── PIERNAS ─────────
  ['SENTADILLA', 'PIERNAS', { vl: 22, vm: 20, rf: 12, gm: 25, ad: 10, lu: 6, bf: 3, st: 2 }, ['SENTADILLA CON BARRA', 'SENTADILLA LIBRE', 'SENTADILLA TRASERA']],
  ['SENTADILLA FRONTAL', 'PIERNAS', { vl: 25, vm: 25, rf: 15, gm: 15, ad: 7, lu: 5, ra: 8 }, ['SENTADILLA DE FRENTE']],
  ['SENTADILLA HACK', 'PIERNAS', { vl: 28, vm: 27, rf: 15, gm: 20, ad: 10 }, ['HACK', 'MAQUINA HACK', 'HACK SQUAT']],
  ['SENTADILLA EN MULTIPOWER', 'PIERNAS', { vl: 25, vm: 23, rf: 12, gm: 25, ad: 10, lu: 5 }, ['SENTADILLA EN SMITH']],
  ['SENTADILLA GOBLET', 'PIERNAS', { vl: 22, vm: 22, rf: 12, gm: 22, ad: 12, ra: 5, ab: 5 }, ['SENTADILLA COPA', 'GOBLET']],
  ['SENTADILLA BULGARA', 'PIERNAS', { vl: 20, vm: 20, rf: 10, gm: 30, gme: 8, ad: 7, bf: 5 }, ['BULGARAS', 'ESTOCADA BULGARA']],
  ['SENTADILLA SUMO', 'PIERNAS', { gm: 28, ad: 28, vl: 15, vm: 15, rf: 6, lu: 5, gme: 3 }, ['SENTADILLA SUMO CON MANCUERNA', 'SUMO']],
  ['SISSY SQUAT', 'PIERNAS', { rf: 35, vl: 30, vm: 30, ra: 5 }, ['SENTADILLA SISSY']],
  ['PRENSA 45', 'PIERNAS', { vl: 25, vm: 25, rf: 10, gm: 25, ad: 10, bf: 3, st: 2 }, ['PRENSA 45°', 'PRENSA', 'PRENSA INCLINADA']],
  ['PRENSA HORIZONTAL', 'PIERNAS', { vl: 27, vm: 27, rf: 12, gm: 22, ad: 10, bf: 2 }, ['PRENSA SENTADO']],
  ['SILLON DE CUADRICEPS', 'PIERNAS', { rf: 35, vl: 35, vm: 30 }, ['CUADRICEPS', 'EXTENSIONES DE CUADRICEPS', 'SILLON DE EXTENSIONES', 'EXTENSION DE PIERNAS']],
  ['CAMILLA DE ISQUIOTIBIALES', 'PIERNAS', { bf: 50, st: 40, ge: 10 }, ['ISQUIOTIBIALES', 'CAMILLA', 'CURL FEMORAL ACOSTADO', 'FEMORALES ACOSTADO']],
  ['CURL FEMORAL SENTADO', 'PIERNAS', { bf: 45, st: 50, ge: 5 }, ['SILLON DE ISQUIOTIBIALES', 'FEMORALES SENTADO']],
  ['CURL FEMORAL PARADO', 'PIERNAS', { bf: 55, st: 40, ge: 5 }, ['CURL FEMORAL DE PIE', 'FEMORAL UNILATERAL']],
  ['CURL NORDICO', 'PIERNAS', { bf: 45, st: 45, ge: 10 }, ['NORDIC CURL', 'NORDICOS']],
  ['PESO MUERTO RUMANO', 'PIERNAS', { bf: 25, st: 25, gm: 25, lu: 15, ab: 5, ad: 5 }, ['RDL', 'PESO MUERTO RUMANO CON MANCUERNAS']],
  ['PESO MUERTO PIERNAS RIGIDAS', 'PIERNAS', { bf: 27, st: 27, gm: 20, lu: 18, ab: 5, ad: 3 }, ['STIFF', 'PESO MUERTO STIFF']],
  ['PESO MUERTO SUMO', 'PIERNAS', { gm: 25, ad: 18, vl: 8, vm: 8, rf: 4, bf: 8, st: 7, lu: 12, ts: 5, ab: 5 }, []],
  ['ESTOCADAS', 'PIERNAS', { vl: 20, vm: 20, rf: 12, gm: 28, gme: 8, ad: 7, bf: 5 }, ['ZANCADAS', 'ESTOCADAS CON MANCUERNAS', 'ESTOCADA']],
  ['ESTOCADAS CAMINANDO', 'PIERNAS', { vl: 20, vm: 18, rf: 12, gm: 30, gme: 8, ad: 7, bf: 5 }, ['ESTOCADAS EN MOVIMIENTO', 'ZANCADAS CAMINANDO']],
  ['ESTOCADAS INVERSAS', 'PIERNAS', { vl: 18, vm: 18, rf: 10, gm: 32, gme: 10, ad: 7, bf: 5 }, ['ESTOCADAS HACIA ATRAS']],
  ['SUBIDAS AL CAJON', 'PIERNAS', { vl: 22, vm: 20, rf: 10, gm: 30, gme: 10, bf: 4, st: 4 }, ['STEP UP', 'SUBIDA AL BANCO']],
  ['ADUCTOR', 'PIERNAS', { ad: 100 }, ['SILLON ADUCTOR', 'MAQUINA ADUCTORA', 'ADUCTORES']],

  // ───────── GLÚTEOS ─────────
  ['HIP THRUST', 'GLUTEOS', { gm: 65, gme: 8, bf: 8, st: 6, vl: 5, vm: 4, ad: 4 }, ['EMPUJE DE CADERA', 'HIP THRUST CON BARRA']],
  ['HIP THRUST EN MAQUINA', 'GLUTEOS', { gm: 68, gme: 8, bf: 8, st: 6, vl: 5, vm: 5 }, []],
  ['PUENTE DE GLUTEOS', 'GLUTEOS', { gm: 60, gme: 10, bf: 15, st: 10, lu: 5 }, ['PUENTE DE GLUTEO', 'ELEVACION DE CADERA', 'PUENTE']],
  ['PATADA DE GLUTEO', 'GLUTEOS', { gm: 70, gme: 10, bf: 10, st: 5, lu: 5 }, ['PATADA DE GLUTEO EN POLEA', 'PATADA EN MAQUINA', 'PATADA DE BURRO']],
  ['MULTICADERA', 'GLUTEOS', { gm: 60, gme: 20, ad: 10, bf: 10 }, ['MAQUINA MULTICADERA']],
  ['ABDUCTOR', 'GLUTEOS', { gme: 80, gm: 20 }, ['SILLON ABDUCTOR', 'MAQUINA ABDUCTORA', 'ABDUCCIONES']],
  ['ABDUCCION EN POLEA', 'GLUTEOS', { gme: 80, gm: 20 }, ['ABDUCCION DE CADERA EN POLEA']],
  ['CAMINATA LATERAL CON BANDA', 'GLUTEOS', { gme: 75, gm: 20, vl: 5 }, ['MONSTER WALK', 'CAMINATA CON BANDA']],
  ['PULL THROUGH', 'GLUTEOS', { gm: 55, bf: 20, st: 15, lu: 10 }, ['PULL THROUGH EN POLEA']],
  ['ALMEJA', 'GLUTEOS', { gme: 85, gm: 15 }, ['CLAMSHELL', 'ALMEJAS']],

  // ───────── PANTORRILLAS ─────────
  ['GEMELOS PARADO', 'PANTORRILLAS', { ge: 70, so: 30 }, ['GEMELOS DE PIE', 'PANTORRILLAS PARADO', 'ELEVACION DE TALONES', 'GEMELOS']],
  ['GEMELOS EN PRENSA', 'PANTORRILLAS', { ge: 65, so: 35 }, ['PANTORRILLAS EN PRENSA']],
  ['GEMELOS EN MULTIPOWER', 'PANTORRILLAS', { ge: 70, so: 30 }, ['GEMELOS EN SMITH']],
  ['SOLEO SENTADO', 'PANTORRILLAS', { so: 75, ge: 25 }, ['SOLEO', 'GEMELOS SENTADO']],
  ['ELEVACION DE PUNTAS', 'PANTORRILLAS', { ti: 100 }, ['TIBIAL', 'ELEVACION DE PUNTAS DE PIE']],

  // ───────── FUNCIONAL / CARDIO ─────────
  ['BURPEES', 'FUNCIONAL', { pm: 15, dan: 10, tla: 10, vl: 15, vm: 10, rf: 10, gm: 15, ra: 10, ge: 5 }, ['BURPEE']],
  ['ESCALADORES', 'FUNCIONAL', { ra: 35, ob: 15, rf: 20, dan: 15, se: 5, gm: 10 }, ['MOUNTAIN CLIMBERS']],
  ['SALTO AL CAJON', 'FUNCIONAL', { vl: 20, vm: 15, rf: 10, gm: 25, ge: 20, so: 10 }, ['BOX JUMP', 'SALTOS AL CAJON']],
  ['SOGA', 'FUNCIONAL', { ge: 45, so: 25, ti: 10, ab: 10, dl: 5, ra: 5 }, ['SALTAR LA SOGA', 'SALTO A LA SOGA']],
  ['KETTLEBELL SWING', 'FUNCIONAL', { gm: 35, bf: 15, st: 15, lu: 15, ra: 5, ab: 10, dan: 5 }, ['SWING CON PESA RUSA', 'SWING']],
  ['THRUSTER', 'FUNCIONAL', { vl: 15, vm: 15, rf: 10, gm: 20, dan: 20, dl: 5, tla: 10, ra: 5 }, ['THRUSTERS']],
  ['CARGADA DE POTENCIA', 'FUNCIONAL', { ts: 20, gm: 20, bf: 10, st: 5, vl: 12, vm: 8, lu: 10, dan: 5, ab: 5, ge: 5 }, ['POWER CLEAN', 'CARGADA']],
  ['ARRANQUE', 'FUNCIONAL', { ts: 15, dl: 10, dan: 10, gm: 20, bf: 10, vl: 10, vm: 8, lu: 10, ab: 7 }, ['SNATCH']],
  ['WALL BALL', 'FUNCIONAL', { vl: 18, vm: 15, rf: 10, gm: 20, dan: 20, tla: 10, ra: 7 }, ['LANZAMIENTO A LA PARED', 'WALL BALLS']],
  ['BATTLE ROPES', 'FUNCIONAL', { dan: 25, dl: 20, ra: 15, ob: 10, ab: 15, tla: 5, bi: 5, ts: 5 }, ['SOGAS DE BATALLA', 'CUERDAS DE BATALLA']],
  ['PASEO DEL GRANJERO', 'FUNCIONAL', { ab: 35, ts: 25, ra: 10, ob: 10, gm: 5, lu: 10, ge: 5 }, ['FARMER WALK', 'CAMINATA DEL GRANJERO']],
  ['EMPUJE DE TRINEO', 'FUNCIONAL', { vl: 20, vm: 18, rf: 12, gm: 25, ge: 15, so: 10 }, ['TRINEO', 'SLED PUSH']],
  ['REMO ERGOMETRO', 'FUNCIONAL', { da: 20, tm: 10, bi: 5, vl: 15, vm: 10, rf: 5, gm: 15, bf: 5, st: 5, lu: 5, ra: 5 }, ['REMOERGOMETRO', 'ROWING']],
  ['BICICLETA FIJA', 'FUNCIONAL', { vl: 25, vm: 20, rf: 20, gm: 10, bf: 10, st: 5, ge: 10 }, ['SPINNING', 'BICI FIJA']],
  ['CINTA', 'FUNCIONAL', { vl: 10, vm: 10, rf: 10, gm: 15, bf: 15, st: 10, ge: 20, so: 10 }, ['CORRER', 'TROTE', 'CAMINADORA']],
];

// Normaliza nombres para que "press  banca" y "PRESS BANCA" sean el mismo ejercicio.
export const normalizeExerciseName = (rawName) => {
  if (typeof rawName !== 'string') return '';
  return rawName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
};

const CATEGORY_IDS = new Set(CATEGORIES.map(({ id }) => id));

// Convierte códigos → ids y porcentajes → fracciones; valida la integridad del diccionario al cargar.
const buildCatalog = () => {
  const catalog = {};
  const aliases = {};
  const problems = [];

  CATALOG_ENTRIES.forEach(([rawName, category, codes, aliasList]) => {
    const name = normalizeExerciseName(rawName);
    if (catalog[name] || aliases[name]) problems.push(`Duplicado: ${name}`);
    if (!CATEGORY_IDS.has(category)) problems.push(`Categoría inválida en ${name}: ${category}`);

    const distribution = {};
    let total = 0;
    Object.entries(codes).forEach(([code, percent]) => {
      const muscleId = CODE_TO_MUSCLE[code];
      if (!muscleId) problems.push(`Código desconocido en ${name}: ${code}`);
      else distribution[muscleId] = percent;
      total += percent;
    });
    if (total !== 100) problems.push(`${name}: la distribución suma ${total}`);

    const primaryMuscle = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'otros';
    catalog[name] = { name, category, distribution, primaryMuscle, aliases: aliasList.map(normalizeExerciseName) };

    aliasList.forEach((alias) => {
      const key = normalizeExerciseName(alias);
      if (key !== name) aliases[key] = name;
    });
  });

  Object.keys(aliases).forEach((alias) => {
    if (catalog[alias]) problems.push(`Alias que pisa un ejercicio: ${alias}`);
  });
  if (problems.length > 0 && import.meta.env?.DEV) console.warn('[exercises] Diccionario inconsistente:', problems);

  return { catalog, aliases, problems };
};

const { catalog: CATALOG, aliases: ALIASES, problems: CATALOG_PROBLEMS } = buildCatalog();

export const EXERCISE_CATALOG = Object.freeze(CATALOG);
export const EXERCISE_ALIASES = Object.freeze(ALIASES);
export const CATALOG_INTEGRITY_PROBLEMS = Object.freeze(CATALOG_PROBLEMS);
export const CATALOG_EXERCISE_NAMES = Object.freeze(Object.keys(EXERCISE_CATALOG).sort((a, b) => a.localeCompare(b, 'es')));

// Nombre canónico: resuelve alias ("ALT CON MANCUERNA" → "CURL ALTERNADO CON MANCUERNAS").
export const canonicalExerciseName = (rawName) => {
  const normalized = normalizeExerciseName(rawName);
  return ALIASES[normalized] ?? normalized;
};

export const getExerciseMeta = (exerciseName) => EXERCISE_CATALOG[canonicalExerciseName(exerciseName)] ?? null;

// ───────── Inferencia automática para ejercicios fuera del diccionario ─────────

// Palabras que no identifican al ejercicio (equipamiento, posición, conectores).
const GENERIC_TOKENS = new Set([
  'DE', 'DEL', 'CON', 'EN', 'AL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'A', 'PARA', 'POR', 'SIN',
  'MANCUERNA', 'MANCUERNAS', 'BARRA', 'POLEA', 'MAQUINA', 'SENTADO', 'PARADO', 'PIE', 'UNILATERAL',
  'AGARRE', 'CERRADO', 'ABIERTO', 'SMITH', 'MULTIPOWER', 'DISCO', 'BANDA', 'CABLE', 'SOGA', 'KETTLEBELL',
]);

// Si nada se parece, palabras clave → reparto macro (mismo que usa el historial legado).
const KEYWORD_RULES = [
  [/BICEP|CURL/, 'biceps'],
  [/TRICEP|FRANCES|PUSHDOWN|FONDO/, 'triceps'],
  [/PECHO|PECTORAL|BANCA|APERTURA|CRUCE/, 'pecho'],
  [/HOMBRO|DELTOID|MILITAR|VUELO|LATERAL|ARNOLD/, 'hombros'],
  [/ESPALDA|DORSAL|REMO|JALON|DOMINAD|PULL/, 'espalda'],
  [/GLUTEO|CADERA|HIP|PATADA/, 'gluteos'],
  [/FEMORAL|ISQUIO/, 'isquiotibiales'],
  [/CUADRICEP|SENTADILLA|PRENSA|ESTOCADA|ZANCADA|PIERNA/, 'cuadriceps'],
  [/ADUCTOR/, 'aductores'],
  [/GEMELO|PANTORRILLA|SOLEO|TALON/, 'gemelos'],
  [/ABDOMINAL|ABS|CRUNCH|PLANCHA|OBLICUO|CORE/, 'abdominales'],
];

const meaningfulTokens = (name) => normalizeExerciseName(name).split(' ').filter((token) => token.length > 1 && !GENERIC_TOKENS.has(token));

// Índice de búsqueda: nombre canónico + alias, tokenizados una sola vez.
const SIMILARITY_INDEX = Object.values(CATALOG).flatMap((entry) =>
  [entry.name, ...entry.aliases].map((label) => ({ entry, tokens: new Set(meaningfulTokens(label)) })),
);

const MIN_SIMILARITY = 0.5;
const inferenceCache = new Map();

/**
 * Estima músculos y categoría de un ejercicio que no está en el diccionario.
 * 1) Ejercicio más parecido por palabras significativas (Dice ≥ 0.5) → copia su reparto.
 * 2) Palabra clave → reparto macro. 3) Sin datos → null.
 * Memoizado: se llama en cada cálculo de analíticas.
 */
export const inferExerciseMeta = (rawName) => {
  const name = canonicalExerciseName(rawName);
  if (!name) return null;
  if (inferenceCache.has(name)) return inferenceCache.get(name);

  let result = null;
  try {
    const queryTokens = meaningfulTokens(name);
    let best = null;
    if (queryTokens.length > 0) {
      SIMILARITY_INDEX.forEach(({ entry, tokens }) => {
        if (tokens.size === 0) return;
        const shared = queryTokens.filter((token) => tokens.has(token)).length;
        const score = (2 * shared) / (queryTokens.length + tokens.size); // Coeficiente de Dice
        if (shared > 0 && (!best || score > best.score)) best = { entry, score };
      });
    }
    if (best && best.score >= MIN_SIMILARITY) {
      result = { distribution: best.entry.distribution, category: best.entry.category, source: 'similar', matchedName: best.entry.name };
    } else {
      const rule = KEYWORD_RULES.find(([pattern]) => pattern.test(name));
      if (rule) {
        const distribution = LEGACY_MUSCLE_DISTRIBUTION[rule[1]];
        const topMuscle = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0][0];
        result = { distribution, category: MUSCLE_BY_ID[topMuscle]?.category ?? 'OTROS', source: 'keyword', matchedName: null };
      }
    }
  } catch {
    result = null; // La inferencia es auxiliar: nunca debe romper un cálculo.
  }
  inferenceCache.set(name, result);
  return result;
};

export const getExerciseCategory = (item) => {
  const meta = getExerciseMeta(item?.exercise);
  if (meta) return meta.category;
  const muscle = MUSCLE_BY_ID[item?.muscle];
  if (muscle) return muscle.category;
  return inferExerciseMeta(item?.exercise)?.category ?? 'OTROS';
};

/**
 * Distribución { muscleId: fracción 0–1 } para un log o ítem de rutina.
 * Prioridad: catálogo → músculo guardado (datos viejos) → macro legado → inferencia automática → vacío.
 */
export const resolveMuscleDistribution = (item) => {
  const meta = getExerciseMeta(item?.exercise);
  const source = meta?.distribution
    ?? (MUSCLE_IDS.includes(item?.muscle) ? { [item.muscle]: 100 } : null)
    ?? LEGACY_MUSCLE_DISTRIBUTION[item?.muscle]
    ?? inferExerciseMeta(item?.exercise)?.distribution
    ?? null;
  if (!source) return {};
  return Object.fromEntries(Object.entries(source).map(([muscleId, percent]) => [muscleId, percent / 100]));
};

// Músculo con mayor participación (compatibilidad con código que esperaba un único músculo).
export const resolveMuscle = (item) => {
  const entries = Object.entries(resolveMuscleDistribution(item));
  if (entries.length === 0) return 'otros';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
};

// Búsqueda para el selector de ejercicios: coincide por nombre o alias, sin tildes; prioriza "empieza con".
export const searchExercises = (query, extraNames = []) => {
  const normalizedQuery = normalizeExerciseName(query);
  const customEntries = extraNames
    .map(canonicalExerciseName)
    .filter((name) => name && !CATALOG[name])
    .map((name) => ({ name, category: inferExerciseMeta(name)?.category ?? 'OTROS', aliases: [], isCustom: true }));
  const pool = [...Object.values(CATALOG), ...new Map(customEntries.map((entry) => [entry.name, entry])).values()];
  if (!normalizedQuery) return pool.map((entry) => ({ entry, matchedAlias: null, rank: 2 })).sort((a, b) => a.entry.name.localeCompare(b.entry.name, 'es'));

  const queryTokens = normalizedQuery.split(' ');
  const results = [];
  pool.forEach((entry) => {
    const labels = [entry.name, ...entry.aliases];
    const matched = labels.find((label) => queryTokens.every((token) => label.includes(token)));
    if (!matched) return;
    const rank = matched.startsWith(normalizedQuery) ? 0 : 1;
    results.push({ entry, matchedAlias: matched === entry.name ? null : matched, rank });
  });
  return results.sort((a, b) => a.rank - b.rank || a.entry.name.localeCompare(b.entry.name, 'es'));
};
