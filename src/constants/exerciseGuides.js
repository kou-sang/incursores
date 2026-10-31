/*
 * Ficha técnica de cada ejercicio de la biblioteca: técnica paso a paso, consejos, errores comunes y la animación.
 * - GUIDE_FAMILIES: contenido compartido por ejercicios que se ejecutan igual (p. ej. todas las variantes de press de banca).
 * - EXERCISE_GUIDES: cada ejercicio del catálogo → { pose, family, gear?, extra? }.
 *   `extra` es un consejo propio de esa variante (se muestra primero). `gear` fuerza el implemento del dibujo.
 * Los músculos NO se repiten aquí: salen del diccionario (constants/exercises.js), así la ficha y las analíticas coinciden.
 */

export const GUIDE_FAMILIES = Object.freeze({
  press: {
    steps: [
      'Acuéstate en el banco con los ojos debajo de la barra y los pies firmes en el piso.',
      'Junta los omóplatos y llévalos hacia abajo: el pecho queda alto y los hombros protegidos.',
      'Toma la barra un poco más ancha que los hombros, con las muñecas rectas sobre los codos.',
      'Baja controlado hasta rozar la parte baja del pecho, con los codos a unos 45° del torso.',
      'Empuja hacia arriba y levemente hacia la cara hasta estirar los brazos sin trabar los codos.',
    ],
    tips: [
      'Inhala al bajar y exhala al pasar la parte más difícil de la subida.',
      'Mantén los glúteos apoyados en el banco durante toda la serie.',
      'Usa un compañero o los seguros cuando trabajes cerca del fallo.',
    ],
    mistakes: [
      'Abrir los codos a 90°: carga de más el hombro.',
      'Rebotar la barra en el pecho para subir más peso.',
      'Despegar la cadera del banco o perder la tensión de la espalda.',
    ],
  },
  chestMachine: {
    steps: [
      'Ajusta el asiento para que las manijas queden a la altura de la mitad del pecho.',
      'Apoya bien la espalda y junta los omóplatos contra el respaldo.',
      'Empuja las manijas hacia adelante hasta estirar casi por completo los brazos.',
      'Vuelve despacio hasta sentir el estiramiento del pecho, sin que el peso toque el tope.',
    ],
    tips: [
      'Es ideal para llegar cerca del fallo con seguridad, al final de la rutina de pecho.',
      'Haz una pausa breve con los brazos extendidos y aprieta el pecho.',
      'Si una manija va adelantada, revisa que el asiento esté centrado.',
    ],
    mistakes: [
      'Asiento demasiado bajo o alto: el esfuerzo pasa a los hombros.',
      'Despegar la espalda del respaldo para empujar más.',
      'Hacer recorridos cortos con mucho peso.',
    ],
  },
  svend: {
    steps: [
      'De pie, sostén uno o dos discos entre las palmas a la altura del pecho.',
      'Aprieta los discos con fuerza, como si quisieras juntarlos.',
      'Empuja los discos hacia adelante hasta estirar los brazos sin dejar de apretar.',
      'Vuelve al pecho despacio, manteniendo la presión todo el tiempo.',
    ],
    tips: [
      'La clave es la presión entre las palmas, no el peso del disco.',
      'Funciona muy bien como último ejercicio de pecho o en series de 12 a 20.',
      'Mantén el abdomen firme y los hombros abajo.',
    ],
    mistakes: [
      'Dejar de apretar los discos al estirar los brazos.',
      'Subir los hombros hacia las orejas.',
      'Arquear la zona lumbar para compensar.',
    ],
  },
  pecDeck: {
    steps: [
      'Siéntate con la espalda apoyada y regula el asiento para que los codos queden a la altura del pecho.',
      'Toma las manijas o apoya los antebrazos en los rodillos con los codos levemente flexionados.',
      'Junta los brazos al frente en un arco amplio, como si abrazaras un árbol.',
      'Vuelve despacio hasta sentir el estiramiento del pecho, sin pasar la línea de los hombros.',
    ],
    tips: [
      'Piensa en llevar los codos hacia adelante, no las manos.',
      'Aprieta un segundo cuando los brazos se juntan.',
      'Usa un peso que te permita controlar la vuelta.',
    ],
    mistakes: [
      'Abrir demasiado atrás: estresa la parte frontal del hombro.',
      'Doblar y estirar los codos durante el movimiento (se convierte en un press).',
      'Despegar la espalda del respaldo.',
    ],
  },
  fly: {
    steps: [
      'Acuéstate en el banco con una mancuerna en cada mano sobre el pecho y las palmas enfrentadas.',
      'Flexiona apenas los codos y mantén ese ángulo fijo durante toda la serie.',
      'Abre los brazos en arco hasta que los codos queden a la altura del banco.',
      'Vuelve a juntar las mancuernas sobre el pecho con el mismo arco.',
    ],
    tips: [
      'Usa menos peso que en el press: el brazo largo multiplica la carga sobre el hombro.',
      'Siente el estiramiento abajo, pero sin rebotar.',
      'No hace falta chocar las mancuernas arriba; la tensión baja cerca del final.',
    ],
    mistakes: [
      'Bajar demasiado y forzar el hombro.',
      'Estirar o doblar los codos durante el recorrido.',
      'Usar tanto peso que el movimiento se vuelve un press.',
    ],
  },
  cableCross: {
    steps: [
      'Ubica las poleas a la altura indicada y toma una manija en cada mano.',
      'Da un paso al frente con un pie adelantado y el torso levemente inclinado.',
      'Con los codos un poco flexionados, junta las manos frente al cuerpo en un arco.',
      'Aprieta el pecho un segundo y vuelve despacio hasta sentir el estiramiento.',
    ],
    tips: [
      'Poleas altas trabajan más la parte inferior del pecho; poleas bajas, la superior.',
      'Las poleas mantienen la tensión en todo el recorrido: aprovecha la parte final.',
      'Puedes cruzar levemente las manos al final para sumar contracción.',
    ],
    mistakes: [
      'Tirar con los brazos rectos y los hombros adelantados.',
      'Balancear el torso para mover el peso.',
      'Dejar que el peso te arrastre hacia atrás en la vuelta.',
    ],
  },
  pushUp: {
    steps: [
      'Apoya las manos un poco más anchas que los hombros, debajo de ellos.',
      'Estira las piernas y forma una línea recta desde la cabeza hasta los talones.',
      'Baja el pecho hasta casi tocar el piso, con los codos a unos 45° del cuerpo.',
      'Empuja el piso hasta estirar los brazos manteniendo el cuerpo rígido.',
    ],
    tips: [
      'Aprieta glúteos y abdomen: evita que la cadera se hunda.',
      'Si cuestan, apoya las manos en un banco; si son fáciles, eleva los pies o agrega pausa abajo.',
      'Mira al piso unos centímetros por delante de las manos.',
    ],
    mistakes: [
      'Cadera hundida o demasiado alta.',
      'Hacer medio recorrido.',
      'Codos muy abiertos hacia los costados.',
    ],
  },
  dips: {
    steps: [
      'Sujétate en las paralelas con los brazos estirados y los hombros lejos de las orejas.',
      'Flexiona los codos y baja el cuerpo de forma controlada.',
      'Desciende hasta que los hombros queden a la altura de los codos o un poco más abajo.',
      'Empuja hasta estirar los brazos sin trabar los codos.',
    ],
    tips: [
      'Torso inclinado hacia adelante = más pecho; torso vertical = más tríceps.',
      'Si no puedes hacer 5 repeticiones, usa la máquina asistida o una banda elástica.',
      'Agrega peso con un cinturón cuando pasen las 12 repeticiones.',
    ],
    mistakes: [
      'Bajar demasiado con los hombros caídos hacia adelante.',
      'Balancear las piernas para subir.',
      'Encoger los hombros durante el esfuerzo.',
    ],
  },
  pullover: {
    steps: [
      'Acuéstate en el banco y sostén una mancuerna con ambas manos sobre el pecho.',
      'Con los codos levemente flexionados, lleva la mancuerna por detrás de la cabeza en arco.',
      'Baja hasta sentir el estiramiento en dorsales y pecho, sin arquear la espalda.',
      'Vuelve por el mismo arco hasta tener la mancuerna sobre el pecho.',
    ],
    tips: [
      'Mantén las costillas abajo: el movimiento sale del hombro, no de la zona lumbar.',
      'Exhala al volver a la posición inicial.',
      'Funciona bien con repeticiones medias (10–15) y peso moderado.',
    ],
    mistakes: [
      'Doblar demasiado los codos (pasa a ser un press de tríceps).',
      'Arquear la zona lumbar para bajar más.',
      'Usar demasiado peso y perder el control.',
    ],
  },
  deadlift: {
    steps: [
      'Párate con la barra sobre la mitad del pie y los pies al ancho de la cadera.',
      'Bisagra de cadera: toma la barra con los brazos por fuera de las piernas y las tibias tocándola.',
      'Saca el pecho, aprieta la espalda y lleva los hombros apenas por delante de la barra.',
      'Empuja el piso con las piernas y extiende la cadera, con la barra pegada al cuerpo.',
      'Termina de pie, con los glúteos apretados, y baja repitiendo el camino al revés.',
    ],
    tips: [
      'Respira hondo y bloquea el abdomen antes de cada repetición.',
      'Piensa en "empujar el piso", no en "tirar de la barra".',
      'Usa straps o agarre mixto solo cuando el agarre limite la serie.',
    ],
    mistakes: [
      'Redondear la espalda baja.',
      'Despegar la barra del cuerpo.',
      'Hiperextender la espalda al final en lugar de terminar con la cadera.',
    ],
  },
  pulldown: {
    steps: [
      'Ajusta el rodillo para que los muslos queden bien sujetos.',
      'Toma la barra con los brazos estirados y el pecho alto.',
      'Lleva los codos hacia abajo y atrás hasta que la barra llegue a la parte alta del pecho.',
      'Sube controlado hasta estirar los brazos y sentir el estiramiento del dorsal.',
    ],
    tips: [
      'Imagina que tus manos son ganchos: tira con los codos.',
      'Inclínate apenas hacia atrás (10–15°), sin balancearte.',
      'Agarre cerrado o neutro trabaja con más recorrido; agarre ancho, más el dorsal superior.',
    ],
    mistakes: [
      'Tirar con impulso del torso.',
      'Bajar la barra detrás de la nuca con el cuello adelantado.',
      'Dejar que la barra suba de golpe.',
    ],
  },
  straightArm: {
    steps: [
      'Párate frente a la polea alta con la barra o soga a la altura de la cabeza.',
      'Inclina el torso unos 20–30° con los brazos casi estirados.',
      'Lleva la barra hacia los muslos en arco, sin doblar los codos.',
      'Vuelve despacio hasta que los brazos queden por encima de la cabeza.',
    ],
    tips: [
      'Es un gran ejercicio para aprender a sentir el dorsal antes de remos o dominadas.',
      'Mantén los hombros abajo durante todo el recorrido.',
      'Haz una pausa con la barra en los muslos.',
    ],
    mistakes: [
      'Doblar los codos y convertirlo en un empuje de tríceps.',
      'Balancear el torso.',
      'Elevar los hombros hacia las orejas.',
    ],
  },
  pullUp: {
    steps: [
      'Cuélgate de la barra con los brazos estirados y el agarre algo más ancho que los hombros.',
      'Lleva los hombros hacia abajo y atrás antes de empezar a tirar.',
      'Tira con los codos hacia las costillas hasta pasar el mentón por encima de la barra.',
      'Baja controlado hasta estirar los brazos por completo.',
    ],
    tips: [
      'Cruza las piernas y aprieta glúteos para evitar el balanceo.',
      'Si aún no puedes hacerlas, practica negativas lentas (5 segundos de bajada).',
      'Agarre supino (palmas hacia ti) suma bíceps; prono, más espalda.',
    ],
    mistakes: [
      'Hacer medias repeticiones sin estirar los brazos.',
      'Patear o balancearse para subir.',
      'Adelantar el cuello para "llegar" a la barra.',
    ],
  },
  bentRow: {
    steps: [
      'Toma la barra con agarre prono y párate con los pies al ancho de la cadera.',
      'Inclina el torso hacia adelante desde la cadera (40–70°) con la espalda recta y las rodillas flexionadas.',
      'Tira de la barra hacia el ombligo llevando los codos hacia atrás.',
      'Aprieta los omóplatos un segundo y baja con control hasta estirar los brazos.',
    ],
    tips: [
      'Cuanto más horizontal el torso, más trabaja la espalda media.',
      'Mantén la cabeza alineada con la columna: mira el piso delante de los pies.',
      'Bloquea el abdomen para proteger la zona lumbar.',
    ],
    mistakes: [
      'Levantar el torso en cada repetición para mover más peso.',
      'Redondear la espalda.',
      'Tirar solo con los brazos sin juntar los omóplatos.',
    ],
  },
  seatedRow: {
    steps: [
      'Siéntate con los pies en los apoyos y las rodillas levemente flexionadas.',
      'Toma la manija con los brazos estirados y la espalda recta.',
      'Tira hacia el abdomen llevando los codos pegados al cuerpo y el pecho hacia adelante.',
      'Aprieta la espalda y vuelve hasta estirar los brazos, dejando que los omóplatos se separen.',
    ],
    tips: [
      'Inclínate apenas hacia adelante al estirar y vuelve a vertical al tirar: más recorrido.',
      'El triángulo trabaja la espalda media; la barra ancha, más los deltoides posteriores.',
      'Exhala al tirar.',
    ],
    mistakes: [
      'Balancear el torso hacia atrás para mover el peso.',
      'Encoger los hombros.',
      'Redondear la espalda al estirar.',
    ],
  },
  oneArmRow: {
    steps: [
      'Apoya una mano y la rodilla del mismo lado en un banco; el otro pie firme en el piso.',
      'Con la espalda paralela al piso, sostén la mancuerna con el brazo estirado.',
      'Tira de la mancuerna hacia la cadera llevando el codo hacia atrás y arriba.',
      'Baja despacio hasta estirar el brazo y sentir el estiramiento del dorsal.',
    ],
    tips: [
      'Piensa en llevar el codo al bolsillo trasero.',
      'Evita girar el torso: los hombros deben quedar paralelos al piso.',
      'Trabajar un lado por vez ayuda a corregir desequilibrios.',
    ],
    mistakes: [
      'Rotar el torso para levantar más.',
      'Tirar hacia el hombro en lugar de hacia la cadera.',
      'Redondear la espalda.',
    ],
  },
  machineRow: {
    steps: [
      'Ajusta el asiento para que las manijas queden a la altura del pecho bajo.',
      'Apoya el pecho en el respaldo y toma las manijas con los brazos estirados.',
      'Tira llevando los codos hacia atrás hasta juntar los omóplatos.',
      'Vuelve despacio hasta estirar los brazos.',
    ],
    tips: [
      'El apoyo del pecho elimina el balanceo: aprovecha para sentir la espalda.',
      'Prueba agarre neutro para más dorsal y prono para más espalda alta.',
      'Pausa de un segundo en la contracción.',
    ],
    mistakes: [
      'Despegar el pecho del respaldo.',
      'Encoger los hombros.',
      'Recorridos cortos.',
    ],
  },
  invertedRow: {
    steps: [
      'Ubica una barra a la altura de la cadera (rack o máquina Smith) y acuéstate debajo.',
      'Toma la barra con los brazos estirados y el cuerpo recto, apoyado en los talones.',
      'Tira del pecho hacia la barra juntando los omóplatos.',
      'Baja despacio hasta estirar los brazos sin perder la línea del cuerpo.',
    ],
    tips: [
      'Más vertical el cuerpo = más fácil; más horizontal = más difícil.',
      'Es la mejor progresión hacia las dominadas.',
      'Aprieta glúteos y abdomen para que la cadera no se caiga.',
    ],
    mistakes: [
      'Dejar caer la cadera.',
      'Adelantar el mentón en lugar de llevar el pecho.',
      'Hacer medio recorrido.',
    ],
  },
  hyperextension: {
    steps: [
      'Ajusta el banco para que el borde del apoyo quede justo debajo de la cadera.',
      'Cruza los brazos sobre el pecho y deja caer el torso con la espalda recta.',
      'Sube contrayendo glúteos y lumbares hasta alinear el torso con las piernas.',
      'Baja despacio controlando el movimiento.',
    ],
    tips: [
      'Para más glúteo, redondea apenas la espalda alta y aprieta los glúteos al subir.',
      'Agrega un disco contra el pecho cuando superes 15 repeticiones.',
      'Muévete lento: no es un ejercicio de impulso.',
    ],
    mistakes: [
      'Subir por encima de la línea del cuerpo (hiperextensión lumbar).',
      'Balancearse.',
      'Apoyo demasiado alto que impide flexionar la cadera.',
    ],
  },
  hinge: {
    steps: [
      'Párate con los pies al ancho de la cadera y el peso frente a los muslos.',
      'Desbloquea apenas las rodillas y mantén la espalda neutra.',
      'Lleva la cadera hacia atrás y baja el peso pegado a las piernas hasta sentir estirar los isquiotibiales.',
      'Vuelve a subir empujando la cadera hacia adelante y apretando los glúteos.',
    ],
    tips: [
      'El movimiento es de cadera: las rodillas casi no cambian de ángulo.',
      'Baja solo hasta donde puedas mantener la espalda recta (suele ser debajo de las rodillas).',
      'Mantén el peso sobre la mitad del pie, no en la punta.',
    ],
    mistakes: [
      'Redondear la espalda para bajar más.',
      'Flexionar las rodillas y convertirlo en sentadilla.',
      'Alejar el peso de las piernas.',
    ],
  },
  shrug: {
    steps: [
      'Párate con el peso a los costados (mancuernas) o delante de los muslos (barra).',
      'Con los brazos estirados, eleva los hombros hacia las orejas.',
      'Mantén un segundo arriba apretando el trapecio.',
      'Baja despacio hasta estirar por completo.',
    ],
    tips: [
      'Sube recto: no hace falta girar los hombros.',
      'Usa straps si el agarre falla antes que el trapecio.',
      'Mantén el mentón neutro, sin adelantar la cabeza.',
    ],
    mistakes: [
      'Hacer rotaciones de hombro (no suman y pueden molestar).',
      'Doblar los codos para ayudarse.',
      'Recorridos cortos con demasiado peso.',
    ],
  },
  ohp: {
    steps: [
      'Toma el peso a la altura de los hombros con las muñecas rectas sobre los codos.',
      'Aprieta glúteos y abdomen para que el cuerpo quede firme.',
      'Empuja el peso hacia arriba en línea recta, pasando la cabeza apenas hacia atrás.',
      'Termina con los brazos estirados sobre la cabeza y baja controlado a los hombros.',
    ],
    tips: [
      'Cuando el peso pasa la frente, lleva la cabeza "a través de la ventana" de los brazos.',
      'Sentado se aísla más el hombro; de pie trabaja más el core.',
      'Exhala al pasar la parte más difícil.',
    ],
    mistakes: [
      'Arquear la zona lumbar para empujar.',
      'Bajar solo hasta la frente (medio recorrido).',
      'Codos muy abiertos hacia los costados.',
    ],
  },
  landmine: {
    steps: [
      'Apoya un extremo de la barra en un rincón o soporte y carga el otro.',
      'Párate de frente, con un pie adelantado, y sostén el extremo cargado a la altura del hombro.',
      'Empuja la barra hacia arriba y adelante hasta estirar el brazo.',
      'Baja controlado hasta el hombro.',
    ],
    tips: [
      'El arco natural de la barra es amigable para hombros sensibles.',
      'Puedes hacerlo con una o dos manos, de pie o de rodillas.',
      'Inclina apenas el torso hacia la barra para seguir su trayectoria.',
    ],
    mistakes: [
      'Arquear la espalda para empujar.',
      'Girar el torso.',
      'Bloquear el codo de golpe al final.',
    ],
  },
  lateral: {
    steps: [
      'Párate con las mancuernas a los costados y los codos apenas flexionados.',
      'Inclina levemente el torso hacia adelante.',
      'Eleva los brazos hacia los costados hasta la altura de los hombros, guiando con los codos.',
      'Baja despacio hasta los costados sin dejar caer el peso.',
    ],
    tips: [
      'Imagina que empujas las paredes con las manos, no que levantas el peso.',
      'Usa poco peso y muchas repeticiones (12–20): es un músculo chico.',
      'La polea y la máquina mantienen la tensión también abajo.',
    ],
    mistakes: [
      'Encoger los hombros y usar el trapecio.',
      'Balancear el cuerpo para subir.',
      'Subir por encima de los hombros con las palmas hacia arriba.',
    ],
  },
  frontRaise: {
    steps: [
      'Párate con el peso delante de los muslos y los brazos casi estirados.',
      'Eleva los brazos al frente hasta la altura de los ojos.',
      'Mantén un instante arriba.',
      'Baja despacio a la posición inicial.',
    ],
    tips: [
      'El deltoides anterior ya trabaja mucho en los press: úsalo con moderación.',
      'Puedes alternar brazos para controlar mejor la técnica.',
      'Mantén el abdomen firme para no inclinarte hacia atrás.',
    ],
    mistakes: [
      'Balancear el torso.',
      'Subir por encima de la cabeza.',
      'Usar demasiado peso.',
    ],
  },
  rearDelt: {
    steps: [
      'Inclina el torso hacia adelante con la espalda recta (o siéntate en la máquina con el pecho apoyado).',
      'Deja los brazos colgando con los codos apenas flexionados.',
      'Abre los brazos hacia los costados y atrás hasta la altura de los hombros.',
      'Baja despacio sin perder la posición del torso.',
    ],
    tips: [
      'Piensa en llevar las manos lejos, hacia las paredes laterales.',
      'Evita juntar los omóplatos al final: así el trabajo queda en el deltoides posterior.',
      'Repeticiones altas (12–20) con peso liviano.',
    ],
    mistakes: [
      'Usar impulso del torso.',
      'Juntar los omóplatos y convertirlo en un remo.',
      'Encoger los hombros.',
    ],
  },
  facePull: {
    steps: [
      'Ubica la polea a la altura de la cara con la soga.',
      'Toma la soga con las palmas hacia abajo y da un paso atrás.',
      'Tira hacia la cara separando las manos y llevando los codos altos y hacia atrás.',
      'Termina con las manos a los lados de la cabeza y vuelve despacio.',
    ],
    tips: [
      'Al final gira los antebrazos hacia arriba ("doble bíceps"): suma manguito rotador.',
      'Excelente para la salud del hombro: inclúyelo en días de empuje.',
      'Peso moderado, control total.',
    ],
    mistakes: [
      'Tirar hacia el cuello o el pecho.',
      'Inclinar el cuerpo hacia atrás para mover el peso.',
      'Codos bajos.',
    ],
  },
  uprightRow: {
    steps: [
      'Toma la barra con un agarre al ancho de los hombros, delante de los muslos.',
      'Eleva la barra pegada al cuerpo llevando los codos hacia arriba y afuera.',
      'Sube hasta que los codos lleguen a la altura de los hombros.',
      'Baja controlado.',
    ],
    tips: [
      'Un agarre más ancho reduce la molestia en el hombro.',
      'Con polea o mancuernas el movimiento es más libre.',
      'Los codos siempre por encima de las manos.',
    ],
    mistakes: [
      'Agarre muy cerrado que pellizca el hombro.',
      'Subir los codos por encima de los hombros.',
      'Balancear el torso.',
    ],
  },
  extRot: {
    steps: [
      'Párate de costado a la polea, a la altura del codo.',
      'Toma la manija con la mano más lejana y pega el codo al costado, flexionado a 90°.',
      'Gira el antebrazo hacia afuera sin despegar el codo del cuerpo.',
      'Vuelve despacio hasta que la mano quede frente al abdomen.',
    ],
    tips: [
      'Una toalla enrollada entre el codo y el cuerpo ayuda a mantener la posición.',
      'Peso muy liviano: el manguito rotador es pequeño.',
      'Úsalo como calentamiento antes de empujes pesados.',
    ],
    mistakes: [
      'Despegar el codo del cuerpo.',
      'Girar el torso en lugar del brazo.',
      'Usar demasiado peso.',
    ],
  },
  yRaise: {
    steps: [
      'Acuéstate boca abajo en un banco inclinado o inclínate hacia adelante con la espalda recta.',
      'Con los pulgares hacia arriba, eleva los brazos formando una letra Y.',
      'Sube hasta alinear los brazos con el torso.',
      'Baja despacio.',
    ],
    tips: [
      'Trabaja el trapecio inferior, clave para una buena postura.',
      'Con discos livianos o sin peso es suficiente al principio.',
      'Mantén los hombros lejos de las orejas.',
    ],
    mistakes: [
      'Encoger los hombros.',
      'Arquear la zona lumbar.',
      'Usar peso de más.',
    ],
  },
  curl: {
    steps: [
      'Párate con los brazos estirados y el peso en las manos, palmas hacia adelante.',
      'Pega los codos a los costados del torso.',
      'Flexiona los codos y sube el peso hasta la altura de los hombros.',
      'Aprieta un segundo y baja despacio hasta estirar los brazos por completo.',
    ],
    tips: [
      'Los codos quedan quietos: si se mueven hacia adelante, el hombro está ayudando.',
      'Baja en 2–3 segundos: la fase negativa también construye músculo.',
      'Gira la palma hacia arriba al subir (supinación) para más bíceps.',
    ],
    mistakes: [
      'Balancear el torso para subir el peso.',
      'No estirar los brazos abajo.',
      'Adelantar los codos al final.',
    ],
  },
  preacher: {
    steps: [
      'Ajusta el banco Scott para que la axila quede apoyada en el borde del pad.',
      'Apoya la parte de atrás de los brazos en el pad y toma el peso.',
      'Flexiona los codos y sube el peso sin despegar los brazos.',
      'Baja despacio hasta casi estirar los brazos.',
    ],
    tips: [
      'El apoyo elimina el impulso: usa menos peso que en el curl de pie.',
      'Es muy efectivo en la parte baja del movimiento: controla la bajada.',
      'Pausa breve arriba.',
    ],
    mistakes: [
      'Estirar de golpe los codos abajo (estresa el tendón).',
      'Levantar los codos del pad.',
      'Inclinarse hacia atrás para subir.',
    ],
  },
  concentration: {
    steps: [
      'Siéntate en un banco con las piernas abiertas.',
      'Apoya la parte de atrás del brazo en la cara interna del muslo.',
      'Sube la mancuerna hacia el hombro sin mover el brazo.',
      'Baja despacio hasta estirar.',
    ],
    tips: [
      'Mira el músculo trabajar: ayuda a la conexión mente-músculo.',
      'Gira el meñique hacia arriba al final para máxima contracción.',
      'Ideal como último ejercicio de bíceps.',
    ],
    mistakes: [
      'Usar el hombro para subir.',
      'Apoyar el codo y no el brazo (pierde estabilidad).',
      'Recorridos cortos.',
    ],
  },
  inclineCurl: {
    steps: [
      'Regula un banco a 45–60° y acuéstate con los brazos colgando detrás del torso.',
      'Con las palmas hacia adelante, flexiona los codos sin moverlos.',
      'Sube hasta sentir la contracción máxima.',
      'Baja despacio hasta estirar los brazos por completo.',
    ],
    tips: [
      'El brazo queda por detrás del cuerpo: estira mucho el bíceps, excelente para crecer.',
      'Usa menos peso que en el curl de pie.',
      'Mantén la cabeza apoyada.',
    ],
    mistakes: [
      'Adelantar los hombros y los codos.',
      'Despegar la espalda del banco.',
      'No estirar los brazos abajo.',
    ],
  },
  pushdown: {
    steps: [
      'Párate frente a la polea alta y toma la barra o soga.',
      'Pega los codos al costado del torso, con el pecho alto.',
      'Empuja hacia abajo hasta estirar los brazos por completo.',
      'Sube despacio hasta que los antebrazos queden algo por encima de paralelo al piso.',
    ],
    tips: [
      'Con soga, separa las manos al final para contraer más.',
      'Los codos no se mueven: son una bisagra.',
      'Inclinarte apenas hacia adelante da más estabilidad.',
    ],
    mistakes: [
      'Despegar los codos del cuerpo.',
      'Usar el peso del cuerpo para empujar.',
      'Subir demasiado y dejar que los codos se adelanten.',
    ],
  },
  skullCrusher: {
    steps: [
      'Acuéstate en el banco con el peso sobre el pecho y los brazos estirados.',
      'Inclina apenas los brazos hacia la cabeza.',
      'Flexiona solo los codos y baja el peso hacia la frente o detrás de la cabeza.',
      'Estira los brazos volviendo a la posición inicial.',
    ],
    tips: [
      'Bajar detrás de la cabeza estira más la cabeza larga del tríceps.',
      'La barra W es más cómoda para las muñecas.',
      'Controla la bajada: el peso pasa cerca de la cara.',
    ],
    mistakes: [
      'Abrir los codos hacia los costados.',
      'Mover los hombros (pasa a ser un pullover).',
      'Bajar rápido sin control.',
    ],
  },
  overheadExt: {
    steps: [
      'Sostén el peso con ambas manos por encima de la cabeza, brazos estirados.',
      'Mantén los codos apuntando al frente, cerca de la cabeza.',
      'Flexiona los codos y baja el peso detrás de la cabeza.',
      'Estira los brazos volviendo arriba.',
    ],
    tips: [
      'Es el ejercicio que más estira la cabeza larga del tríceps.',
      'Sentado con respaldo protege mejor la zona lumbar.',
      'Aprieta el abdomen para no arquear la espalda.',
    ],
    mistakes: [
      'Abrir mucho los codos.',
      'Arquear la espalda.',
      'Bajar poco por miedo a la posición.',
    ],
  },
  kickback: {
    steps: [
      'Inclina el torso hasta casi paralelo al piso, apoyándote en un banco si quieres.',
      'Lleva el codo atrás, pegado al cuerpo, con el brazo paralelo al piso.',
      'Estira el codo llevando la mancuerna hacia atrás.',
      'Vuelve despacio hasta 90°.',
    ],
    tips: [
      'El brazo debe quedar inmóvil: solo se mueve el antebrazo.',
      'Peso liviano y pausa con el brazo estirado.',
      'Con polea mantiene la tensión durante todo el recorrido.',
    ],
    mistakes: [
      'Bajar el codo durante el movimiento.',
      'Balancear la mancuerna.',
      'Usar demasiado peso.',
    ],
  },
  benchDips: {
    steps: [
      'Siéntate en el borde de un banco y apoya las manos a los lados de la cadera.',
      'Adelanta la cadera fuera del banco con las piernas estiradas o flexionadas.',
      'Flexiona los codos y baja la cadera hasta que los brazos formen 90°.',
      'Empuja hasta estirar los brazos.',
    ],
    tips: [
      'Con las rodillas flexionadas es más fácil; con los pies elevados, más difícil.',
      'Mantén la espalda cerca del banco.',
      'Los codos apuntan hacia atrás, no hacia los costados.',
    ],
    mistakes: [
      'Bajar demasiado (estresa la parte frontal del hombro).',
      'Alejar la espalda del banco.',
      'Encoger los hombros.',
    ],
  },
  closeGrip: {
    steps: [
      'Acuéstate en el banco y toma la barra con las manos al ancho de los hombros.',
      'Junta los omóplatos y saca el pecho.',
      'Baja la barra hacia la parte baja del pecho con los codos pegados al cuerpo.',
      'Empuja hasta estirar los brazos.',
    ],
    tips: [
      'Agarre al ancho de hombros es suficiente; más cerrado solo molesta las muñecas.',
      'Es uno de los mejores ejercicios para sumar fuerza en el tríceps.',
      'Mantén las muñecas rectas.',
    ],
    mistakes: [
      'Agarre demasiado cerrado.',
      'Abrir los codos.',
      'Rebotar la barra en el pecho.',
    ],
  },
  wrist: {
    steps: [
      'Siéntate y apoya los antebrazos sobre los muslos, con las muñecas fuera de las rodillas.',
      'Sostén el peso y deja que las muñecas bajen.',
      'Flexiona (o extiende, en la variante invertida) las muñecas subiendo el peso.',
      'Baja despacio.',
    ],
    tips: [
      'Recorrido completo y peso liviano: las muñecas son articulaciones delicadas.',
      'Series largas (15–25) dan buen resultado.',
      'Un agarre fuerte mejora el peso muerto, los remos y las dominadas.',
    ],
    mistakes: [
      'Mover los antebrazos.',
      'Usar demasiado peso.',
      'Recorridos cortos.',
    ],
  },
  deadHang: {
    steps: [
      'Toma la barra con agarre prono al ancho de los hombros.',
      'Cuélgate con los brazos estirados y los pies despegados del piso.',
      'Mantén los hombros activos (levemente hacia abajo), sin colgar "flojo".',
      'Aguanta el tiempo objetivo y bájate con control.',
    ],
    tips: [
      'Mide tu progreso en segundos: 60 s es una gran marca.',
      'Descomprime la columna: útil al final del entrenamiento.',
      'Usa tiza si las manos transpiran.',
    ],
    mistakes: [
      'Balancearse.',
      'Encoger los hombros hacia las orejas.',
      'Soltarse de golpe.',
    ],
  },
  crunch: {
    steps: [
      'Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados.',
      'Lleva las manos a las sienes o crúzalas sobre el pecho.',
      'Despega los hombros del piso enrollando la columna hacia las rodillas.',
      'Baja despacio sin apoyar del todo la cabeza.',
    ],
    tips: [
      'Exhala al subir y aprieta el abdomen como si fueras a recibir un golpe.',
      'El recorrido es corto: no hace falta sentarse.',
      'En polea o máquina puedes sumar peso y progresar como en cualquier músculo.',
    ],
    mistakes: [
      'Tirar del cuello con las manos.',
      'Subir con impulso.',
      'Despegar la zona lumbar del piso.',
    ],
  },
  reverseCrunch: {
    steps: [
      'Acuéstate boca arriba con los brazos al costado y las piernas flexionadas en el aire.',
      'Lleva las rodillas hacia el pecho despegando la cadera del piso.',
      'Enrolla la pelvis hacia arriba usando el abdomen.',
      'Baja despacio sin apoyar los pies.',
    ],
    tips: [
      'El objetivo es enrollar la pelvis, no solo mover las piernas.',
      'Movimiento lento y controlado.',
      'Exhala al subir.',
    ],
    mistakes: [
      'Usar impulso de las piernas.',
      'Arquear la zona lumbar al bajar.',
      'Empujar con los brazos.',
    ],
  },
  plank: {
    steps: [
      'Apoya los antebrazos en el piso con los codos debajo de los hombros.',
      'Estira las piernas y apóyate en la punta de los pies.',
      'Forma una línea recta desde la cabeza hasta los talones.',
      'Aprieta abdomen y glúteos y mantén la posición el tiempo indicado.',
    ],
    tips: [
      'Mejor 20 segundos perfectos que 2 minutos con la cadera hundida.',
      'Respira normal: no contengas el aire.',
      'Progresa levantando un brazo o una pierna.',
    ],
    mistakes: [
      'Cadera hundida (carga la zona lumbar).',
      'Cadera muy alta.',
      'Mirar al frente y tensar el cuello.',
    ],
  },
  sidePlank: {
    steps: [
      'Acuéstate de costado con el codo debajo del hombro.',
      'Apila los pies o apoya uno delante del otro.',
      'Eleva la cadera hasta formar una línea recta del hombro a los pies.',
      'Mantén la posición y cambia de lado.',
    ],
    tips: [
      'Apoyar las rodillas es una versión más fácil.',
      'Puedes subir y bajar la cadera para hacerlo dinámico.',
      'Mantén el hombro de arriba hacia atrás, sin girar.',
    ],
    mistakes: [
      'Dejar caer la cadera.',
      'Girar el torso hacia el piso.',
      'Codo lejos del hombro.',
    ],
  },
  legRaise: {
    steps: [
      'Ubícate (acostado, colgado o en las paralelas) con las piernas abajo.',
      'Aprieta el abdomen y lleva la pelvis levemente hacia atrás.',
      'Eleva las piernas (o rodillas) hasta la altura de la cadera o más arriba.',
      'Baja despacio sin balancearte.',
    ],
    tips: [
      'Rodillas flexionadas = más fácil; piernas estiradas = más difícil.',
      'Al final, despega un poco la pelvis hacia arriba para más abdomen.',
      'Controla la bajada: ahí está gran parte del trabajo.',
    ],
    mistakes: [
      'Balancearse para subir.',
      'Arquear la zona lumbar.',
      'Bajar de golpe.',
    ],
  },
  abWheel: {
    steps: [
      'Arrodíllate y apoya la rueda en el piso debajo de los hombros.',
      'Aprieta el abdomen y los glúteos.',
      'Rueda hacia adelante estirando el cuerpo sin hundir la cadera.',
      'Vuelve tirando con el abdomen hasta la posición inicial.',
    ],
    tips: [
      'Empieza con recorridos cortos y aumenta de a poco.',
      'Rodar hacia una pared limita el recorrido mientras aprendes.',
      'Exhala al volver.',
    ],
    mistakes: [
      'Hundir la zona lumbar.',
      'Sacar la cadera hacia atrás al volver.',
      'Ir más lejos de lo que puedes controlar.',
    ],
  },
  russianTwist: {
    steps: [
      'Siéntate con las rodillas flexionadas e inclina el torso hacia atrás unos 45°.',
      'Sostén el peso frente al pecho; despega los pies para más dificultad.',
      'Gira el torso hacia un lado llevando el peso al costado de la cadera.',
      'Gira al otro lado de forma controlada.',
    ],
    tips: [
      'Gira el pecho, no solo los brazos.',
      'Mantén la espalda recta, sin encorvarte.',
      'Exhala en cada giro.',
    ],
    mistakes: [
      'Mover solo los brazos.',
      'Redondear la espalda.',
      'Ir muy rápido.',
    ],
  },
  bicycleCrunch: {
    steps: [
      'Acuéstate con las manos en las sienes y las piernas elevadas.',
      'Lleva un codo hacia la rodilla contraria mientras estiras la otra pierna.',
      'Alterna de lado en un movimiento de pedaleo.',
      'Mantén los hombros despegados del piso.',
    ],
    tips: [
      'Lento y con giro real del torso, no solo del codo.',
      'Cuanto más baja la pierna estirada, más difícil.',
      'Respira en cada cambio de lado.',
    ],
    mistakes: [
      'Tirar del cuello.',
      'Ir rápido sin control.',
      'Arquear la zona lumbar.',
    ],
  },
  woodchopper: {
    steps: [
      'Párate de costado a la polea y toma la manija con ambas manos.',
      'Con los brazos casi estirados, tira en diagonal cruzando el cuerpo.',
      'Gira el torso y pivotea el pie de atrás acompañando el movimiento.',
      'Vuelve despacio a la posición inicial.',
    ],
    tips: [
      'La fuerza sale del giro del torso, no de los brazos.',
      'Se puede hacer de arriba hacia abajo o de abajo hacia arriba.',
      'Haz las mismas repeticiones de cada lado.',
    ],
    mistakes: [
      'Doblar los brazos y tirar con ellos.',
      'Girar con la zona lumbar en lugar de la cadera y el torso.',
      'Ir muy rápido.',
    ],
  },
  pallof: {
    steps: [
      'Párate de costado a la polea, a la altura del pecho, y toma la manija con ambas manos.',
      'Lleva las manos al pecho con los pies al ancho de la cadera.',
      'Estira los brazos al frente sin dejar que la polea te gire.',
      'Mantén un segundo y vuelve al pecho.',
    ],
    tips: [
      'Es un ejercicio de anti-rotación: lo importante es no moverse.',
      'Aprieta glúteos y abdomen.',
      'Haz ambos lados.',
    ],
    mistakes: [
      'Dejar que el torso gire hacia la polea.',
      'Encoger los hombros.',
      'Inclinarse hacia el lado contrario.',
    ],
  },
  squat: {
    steps: [
      'Párate con los pies al ancho de los hombros y las puntas levemente hacia afuera.',
      'Respira hondo y aprieta el abdomen.',
      'Baja llevando la cadera hacia atrás y abajo, con las rodillas siguiendo la dirección de los pies.',
      'Desciende hasta que los muslos queden al menos paralelos al piso.',
      'Empuja el piso con todo el pie y sube hasta estirar las piernas.',
    ],
    tips: [
      'Mantén el peso repartido en todo el pie, sin levantar los talones.',
      'Las rodillas pueden pasar la punta de los pies: es normal en una sentadilla profunda.',
      'Mira al frente o levemente abajo para mantener la espalda neutra.',
    ],
    mistakes: [
      'Rodillas que se van hacia adentro.',
      'Redondear la espalda baja al final de la bajada.',
      'Levantar los talones o hacer medio recorrido.',
    ],
  },
  hackSquat: {
    steps: [
      'Apoya la espalda en el respaldo y los hombros debajo de los apoyos.',
      'Coloca los pies en la plataforma al ancho de los hombros.',
      'Libera los seguros y baja flexionando las rodillas hasta 90° o más.',
      'Empuja con todo el pie hasta casi estirar las piernas.',
    ],
    tips: [
      'Pies más abajo en la plataforma = más cuádriceps; más arriba = más glúteo.',
      'La máquina permite llegar cerca del fallo con seguridad.',
      'Controla la bajada en 2–3 segundos.',
    ],
    mistakes: [
      'Despegar la espalda del respaldo.',
      'Trabar las rodillas arriba.',
      'Recorridos cortos con mucho peso.',
    ],
  },
  legPress: {
    steps: [
      'Siéntate con la espalda y la cadera bien apoyadas.',
      'Coloca los pies en la plataforma al ancho de los hombros.',
      'Quita los seguros y baja la plataforma flexionando las rodillas hacia el pecho.',
      'Empuja con todo el pie hasta casi estirar las piernas.',
    ],
    tips: [
      'Baja solo hasta donde la cadera no se despega del asiento.',
      'Pies altos trabajan más glúteos e isquiotibiales; pies bajos, más cuádriceps.',
      'Nunca trabes las rodillas arriba.',
    ],
    mistakes: [
      'Despegar la cadera y redondear la zona lumbar.',
      'Bloquear las rodillas.',
      'Cargar demasiado peso con medio recorrido.',
    ],
  },
  legExtension: {
    steps: [
      'Ajusta el respaldo para que las rodillas queden alineadas con el eje de la máquina.',
      'Coloca el rodillo sobre los tobillos y toma las manijas.',
      'Estira las piernas hasta casi bloquear las rodillas.',
      'Aprieta un segundo y baja despacio.',
    ],
    tips: [
      'Es el único ejercicio que aísla el recto femoral con la cadera flexionada.',
      'Repeticiones medias o altas (10–20).',
      'Inclinarte un poco hacia atrás aumenta el estiramiento.',
    ],
    mistakes: [
      'Patear el peso con impulso.',
      'Despegar la cadera del asiento.',
      'Eje de la máquina desalineado con la rodilla.',
    ],
  },
  legCurl: {
    steps: [
      'Ajusta la máquina para que la rodilla quede alineada con su eje y el rodillo sobre los tobillos.',
      'Sujétate de las manijas y mantén la cadera apoyada.',
      'Flexiona las rodillas llevando los talones hacia los glúteos.',
      'Baja despacio hasta casi estirar las piernas.',
    ],
    tips: [
      'Sentado se estiran más los isquiotibiales: suele dar mejores resultados.',
      'Puntas de los pies hacia ti (flexión dorsal) suman fuerza.',
      'Controla la bajada.',
    ],
    mistakes: [
      'Levantar la cadera (acostado) o deslizarse (sentado).',
      'Usar impulso.',
      'Recorrido corto abajo.',
    ],
  },
  nordic: {
    steps: [
      'Arrodíllate con los tobillos sujetos por un compañero o un soporte.',
      'Mantén el cuerpo recto de las rodillas a la cabeza.',
      'Déjate caer hacia adelante lo más lento posible frenando con los isquiotibiales.',
      'Apoya las manos al llegar abajo y empuja para volver.',
    ],
    tips: [
      'Concéntrate en la bajada: es el estímulo principal.',
      'Ayúdate con una banda elástica mientras ganas fuerza.',
      'Muy eficaz para prevenir lesiones de isquiotibiales en deportistas.',
    ],
    mistakes: [
      'Doblar la cadera para frenar.',
      'Caer de golpe.',
      'Hacer demasiadas repeticiones al empezar (genera mucho dolor muscular).',
    ],
  },
  lunge: {
    steps: [
      'Párate erguido con el peso a los costados.',
      'Da un paso (adelante, atrás o caminando, según la variante).',
      'Baja hasta que ambas rodillas formen unos 90° y la de atrás casi toque el piso.',
      'Empuja con el pie de adelante para volver o avanzar.',
    ],
    tips: [
      'Paso largo = más glúteo; paso corto = más cuádriceps.',
      'Mantén el torso erguido y el abdomen firme.',
      'La rodilla de adelante sigue la línea del pie.',
    ],
    mistakes: [
      'Rodilla que se va hacia adentro.',
      'Apoyar la rodilla de atrás de golpe.',
      'Paso tan corto que el talón se despega.',
    ],
  },
  stepUp: {
    steps: [
      'Párate frente a un cajón o banco firme.',
      'Apoya un pie entero en el cajón.',
      'Empuja con esa pierna hasta quedar de pie arriba, sin impulsarte con la de abajo.',
      'Baja despacio con la misma pierna y repite.',
    ],
    tips: [
      'Cajón más alto = más glúteo.',
      'Haz todas las repeticiones de un lado y luego cambia.',
      'Inclinarte un poco hacia adelante ayuda a cargar el glúteo.',
    ],
    mistakes: [
      'Impulsarse con la pierna de abajo.',
      'Rodilla hacia adentro.',
      'Cajón inestable.',
    ],
  },
  hipThrust: {
    steps: [
      'Apoya la parte alta de la espalda en un banco y coloca la barra sobre la cadera (con protector).',
      'Pies apoyados al ancho de la cadera, rodillas flexionadas.',
      'Empuja la cadera hacia arriba hasta que el torso quede paralelo al piso.',
      'Aprieta los glúteos un segundo y baja controlado.',
    ],
    tips: [
      'Arriba, las tibias deben quedar verticales: ajusta la posición de los pies.',
      'Mete el mentón y mira hacia adelante: evita arquear la zona lumbar.',
      'Es uno de los mejores ejercicios para glúteo mayor.',
    ],
    mistakes: [
      'Arquear la espalda en lugar de extender la cadera.',
      'Pies demasiado lejos (trabajan más los isquiotibiales).',
      'Subir sin apretar los glúteos.',
    ],
  },
  gluteBridge: {
    steps: [
      'Acuéstate boca arriba con las rodillas flexionadas y los pies cerca de los glúteos.',
      'Apoya los brazos al costado del cuerpo.',
      'Empuja con los talones y eleva la cadera hasta alinear rodillas, cadera y hombros.',
      'Aprieta los glúteos y baja despacio.',
    ],
    tips: [
      'Hazlo a una pierna para aumentar la dificultad.',
      'Una banda en las rodillas activa también el glúteo medio.',
      'Pausa de 2 segundos arriba.',
    ],
    mistakes: [
      'Arquear la zona lumbar.',
      'Empujar con las puntas de los pies.',
      'Bajar de golpe.',
    ],
  },
  gluteKickback: {
    steps: [
      'Ponte en cuatro apoyos (o de pie frente a la polea con la tobillera).',
      'Mantén la espalda recta y el abdomen firme.',
      'Lleva una pierna hacia atrás y arriba empujando con el talón.',
      'Aprieta el glúteo arriba y vuelve despacio.',
    ],
    tips: [
      'El movimiento sale de la cadera, no de la zona lumbar.',
      'Sube solo hasta que la cadera no se gire.',
      'Repeticiones medias o altas.',
    ],
    mistakes: [
      'Arquear la espalda para subir más.',
      'Girar la cadera.',
      'Balancear la pierna.',
    ],
  },
  abductor: {
    steps: [
      'Ubícate en la máquina, la polea (tobillera) o con la banda, según la variante.',
      'Mantén el torso erguido y estable.',
      'Separa la pierna (o las piernas) hacia afuera contra la resistencia.',
      'Vuelve despacio sin dejar que el peso golpee.',
    ],
    tips: [
      'Inclinar el torso hacia adelante en la máquina carga más el glúteo.',
      'Pausa breve en la apertura máxima.',
      'Un glúteo medio fuerte estabiliza la rodilla al correr y en sentadillas.',
    ],
    mistakes: [
      'Usar impulso.',
      'Inclinar el torso hacia el costado para compensar.',
      'Recorridos cortos.',
    ],
  },
  adductor: {
    steps: [
      'Siéntate en la máquina con las piernas abiertas y los apoyos por dentro de las rodillas.',
      'Mantén la espalda apoyada.',
      'Junta las piernas contra la resistencia.',
      'Vuelve despacio a la apertura inicial.',
    ],
    tips: [
      'Abre solo hasta donde lo permita tu flexibilidad.',
      'Los aductores también trabajan mucho en sentadillas profundas y sumo.',
      'Controla la vuelta.',
    ],
    mistakes: [
      'Apertura excesiva al empezar.',
      'Juntar de golpe.',
      'Despegar la espalda.',
    ],
  },
  pullThrough: {
    steps: [
      'Párate de espaldas a la polea baja con la soga entre las piernas.',
      'Da unos pasos adelante e inclina el torso llevando la cadera hacia atrás.',
      'Extiende la cadera apretando los glúteos hasta quedar erguido.',
      'Vuelve a llevar la cadera hacia atrás de forma controlada.',
    ],
    tips: [
      'Es una forma segura de aprender la bisagra de cadera.',
      'Los brazos solo sostienen la soga, no tiran.',
      'Pausa arriba con los glúteos apretados.',
    ],
    mistakes: [
      'Tirar con los brazos.',
      'Flexionar mucho las rodillas.',
      'Redondear la espalda.',
    ],
  },
  calf: {
    steps: [
      'Apoya la punta de los pies en un escalón o plataforma con los talones en el aire.',
      'Baja los talones hasta sentir el estiramiento máximo.',
      'Sube en punta de pie lo más alto posible.',
      'Mantén un segundo arriba y baja despacio.',
    ],
    tips: [
      'Pausa de 1–2 segundos abajo: elimina el rebote del tendón.',
      'De pie trabaja más el gemelo; sentado, el sóleo.',
      'Las pantorrillas responden bien a repeticiones altas (12–20).',
    ],
    mistakes: [
      'Rebotar abajo.',
      'Recorridos cortos.',
      'Doblar las rodillas para ayudarse (de pie).',
    ],
  },
  tibial: {
    steps: [
      'Párate con la espalda apoyada en una pared y los talones a unos 30 cm.',
      'Mantén las piernas rectas.',
      'Eleva las puntas de los pies hacia las tibias.',
      'Baja despacio sin apoyar del todo.',
    ],
    tips: [
      'Fortalecer el tibial ayuda a prevenir molestias en las tibias al correr.',
      'Series de 15 a 25 repeticiones.',
      'Más lejos de la pared = más difícil.',
    ],
    mistakes: [
      'Doblar las rodillas.',
      'Ir rápido.',
      'Recorridos cortos.',
    ],
  },
  sissy: {
    steps: [
      'Párate sujetándote de un soporte con una mano.',
      'Ponte en punta de pie y lleva las rodillas hacia adelante.',
      'Inclina el torso hacia atrás manteniendo la línea rodilla-cadera-hombros.',
      'Baja lo que puedas controlar y vuelve empujando con los cuádriceps.',
    ],
    tips: [
      'Empieza con recorridos cortos: es muy exigente para la rodilla.',
      'Un soporte para los tobillos lo hace más estable.',
      'Excelente para el recto femoral.',
    ],
    mistakes: [
      'Doblar la cadera.',
      'Bajar más de lo que puedes controlar.',
      'Ir rápido.',
    ],
  },
  burpee: {
    steps: [
      'Desde de pie, agáchate y apoya las manos en el piso.',
      'Salta con los pies hacia atrás hasta quedar en plancha (con flexión si quieres).',
      'Vuelve a llevar los pies cerca de las manos.',
      'Salta hacia arriba con los brazos extendidos.',
    ],
    tips: [
      'Mantén un ritmo que puedas sostener: mejor constante que rápido y desarmado.',
      'Aterriza suave, con las rodillas flexionadas.',
      'Si cuesta, da los pasos hacia atrás en lugar de saltar.',
    ],
    mistakes: [
      'Cadera hundida en la plancha.',
      'Aterrizar con las piernas rígidas.',
      'Perder la técnica por ir rápido.',
    ],
  },
  mountainClimber: {
    steps: [
      'Ponte en plancha alta con las manos debajo de los hombros.',
      'Lleva una rodilla hacia el pecho.',
      'Cambia de pierna rápidamente, como si corrieras en el lugar.',
      'Mantén la cadera baja y estable.',
    ],
    tips: [
      'Más rápido = más cardio; más lento = más core.',
      'Mantén los hombros sobre las manos.',
      'Respira de forma rítmica.',
    ],
    mistakes: [
      'Subir mucho la cadera.',
      'Hombros por detrás de las manos.',
      'Rebotar sin control.',
    ],
  },
  boxJump: {
    steps: [
      'Párate frente al cajón a un paso de distancia.',
      'Flexiona cadera y rodillas llevando los brazos atrás.',
      'Salta impulsando los brazos y aterriza suave con los dos pies en el cajón.',
      'Párate arriba y baja caminando (no saltando).',
    ],
    tips: [
      'Elige una altura en la que aterrices en la misma posición en que saltaste.',
      'Bajar caminando protege los tendones de Aquiles.',
      'Pocas repeticiones de calidad (3–6) para potencia.',
    ],
    mistakes: [
      'Cajón demasiado alto que obliga a aterrizar en cuclillas.',
      'Aterrizar con las rodillas hacia adentro.',
      'Bajar saltando de espaldas.',
    ],
  },
  kbSwing: {
    steps: [
      'Párate con los pies algo más anchos que la cadera y la kettlebell delante.',
      'Bisagra de cadera: toma la pesa y llévala hacia atrás entre las piernas.',
      'Extiende la cadera con fuerza: la pesa sube por el impulso hasta la altura del pecho.',
      'Deja que baje y vuelve a llevar la cadera atrás para la siguiente.',
    ],
    tips: [
      'Es un movimiento de cadera, no de hombros: los brazos solo guían.',
      'Aprieta glúteos y abdomen arriba, como una plancha de pie.',
      'Exhala con fuerza en cada extensión.',
    ],
    mistakes: [
      'Hacer una sentadilla en lugar de una bisagra.',
      'Levantar la pesa con los brazos.',
      'Redondear la espalda abajo.',
    ],
  },
  olympic: {
    steps: [
      'Párate con la barra sobre la mitad del pie y tómala con la espalda firme.',
      'Despega la barra del piso con las piernas, manteniéndola pegada al cuerpo.',
      'Al pasar las rodillas, extiende la cadera de forma explosiva (como un salto).',
      'Mete el cuerpo debajo de la barra y recíbela en la posición de la variante.',
      'Ponte de pie con la barra controlada.',
    ],
    tips: [
      'La técnica manda: aprende con una barra liviana o un palo antes de cargar.',
      'La barra viaja cerca del cuerpo en todo momento.',
      'Pocas repeticiones (1–5) y descansos largos.',
    ],
    mistakes: [
      'Tirar con los brazos antes de extender la cadera.',
      'Alejar la barra del cuerpo.',
      'Recibir la barra con la espalda redondeada.',
    ],
  },
  thruster: {
    steps: [
      'Coloca la barra (o mancuernas) en los hombros con los codos hacia adelante.',
      'Haz una sentadilla frontal profunda.',
      'Sube de forma explosiva y usa ese impulso para empujar la barra sobre la cabeza.',
      'Baja la barra a los hombros mientras empiezas la siguiente sentadilla.',
    ],
    tips: [
      'El empuje de las piernas hace la mayor parte del trabajo de los brazos.',
      'Respira arriba, con los brazos estirados.',
      'Mantén los codos altos en la sentadilla.',
    ],
    mistakes: [
      'Codos caídos que hacen rodar la barra.',
      'Empujar con los brazos antes de terminar la sentadilla.',
      'Talones despegados.',
    ],
  },
  wallBall: {
    steps: [
      'Párate a medio metro de la pared con el balón medicinal frente al pecho.',
      'Haz una sentadilla profunda.',
      'Sube de forma explosiva y lanza el balón hacia el objetivo de la pared.',
      'Recíbelo y baja directo a la siguiente sentadilla.',
    ],
    tips: [
      'Mantén el balón a la altura del mentón al recibir.',
      'Usa las piernas: el lanzamiento sale del impulso.',
      'Altura habitual: 3 m (hombres) y 2,7 m (mujeres).',
    ],
    mistakes: [
      'Sentadilla parcial.',
      'Lanzar solo con los brazos.',
      'Pararse demasiado lejos de la pared.',
    ],
  },
  battleRopes: {
    steps: [
      'Toma un extremo de la soga en cada mano y aléjate hasta que quede casi tensa.',
      'Ponte en media sentadilla con el torso firme.',
      'Mueve los brazos arriba y abajo de forma alternada o simultánea creando ondas.',
      'Mantén el ritmo durante el tiempo indicado.',
    ],
    tips: [
      'Las ondas deben llegar hasta el anclaje.',
      'Intervalos cortos (20–40 s) con descansos.',
      'Respira de forma rítmica.',
    ],
    mistakes: [
      'Estar erguido con las piernas rectas.',
      'Mover solo los antebrazos.',
      'Ondas pequeñas que no llegan al final.',
    ],
  },
  farmerWalk: {
    steps: [
      'Toma una mancuerna o kettlebell pesada en cada mano.',
      'Párate erguido con los hombros atrás y el abdomen firme.',
      'Camina con pasos cortos y controlados.',
      'Recorre la distancia o el tiempo indicado y apoya el peso con la espalda recta.',
    ],
    tips: [
      'Excelente para el agarre, el trapecio y el core.',
      'Mira al frente, no al piso.',
      'Usa pesos iguales en ambas manos (o uno solo para más core).',
    ],
    mistakes: [
      'Inclinarse hacia un lado.',
      'Encorvar la espalda.',
      'Pasos largos que hacen balancear el peso.',
    ],
  },
  sledPush: {
    steps: [
      'Toma las manijas del trineo con los brazos extendidos.',
      'Inclina el cuerpo hacia adelante unos 45°.',
      'Empuja dando pasos cortos y potentes con la punta de los pies.',
      'Mantén la espalda recta durante todo el recorrido.',
    ],
    tips: [
      'Muy poco impacto en las articulaciones: ideal para acondicionamiento.',
      'Tramos cortos (10–20 m) a máxima intensidad.',
      'Empuja con las piernas, los brazos solo transmiten la fuerza.',
    ],
    mistakes: [
      'Redondear la espalda.',
      'Pasos largos y lentos.',
      'Brazos flexionados que pierden fuerza.',
    ],
  },
  circuit: {
    steps: [
      'Elige 4 a 8 ejercicios que combinen piernas, empuje, tirón y core.',
      'Haz cada ejercicio el tiempo o las repeticiones indicadas.',
      'Pasa al siguiente con el menor descanso posible.',
      'Descansa al terminar la vuelta y repite 3 a 5 veces.',
    ],
    tips: [
      'Formatos útiles: HIIT (40 s de trabajo / 20 s de pausa) o Tabata (20/10 durante 4 min).',
      'Alterna grupos musculares para que uno descanse mientras trabaja otro.',
      'Registra las vueltas o repeticiones para medir tu progreso.',
    ],
    mistakes: [
      'Perder la técnica por ir rápido.',
      'Elegir ejercicios que cargan siempre el mismo músculo.',
      'No calentar antes.',
    ],
  },
  jump: {
    steps: [
      'Párate con los pies al ancho de la cadera.',
      'Baja a una sentadilla (o estocada) llevando los brazos atrás.',
      'Salta lo más alto posible impulsando los brazos.',
      'Aterriza suave con las rodillas flexionadas y encadena la siguiente.',
    ],
    tips: [
      'Calidad antes que cantidad: cada salto debe ser explosivo.',
      'Aterriza en silencio: señal de buen control.',
      'Descansa lo suficiente entre series para mantener la potencia.',
    ],
    mistakes: [
      'Aterrizar con las piernas rígidas.',
      'Rodillas hacia adentro al caer.',
      'Saltos cada vez más bajos por fatiga.',
    ],
  },
  pistol: {
    steps: [
      'Párate en una pierna con la otra estirada al frente.',
      'Lleva los brazos adelante para equilibrarte.',
      'Baja lo más profundo posible sobre la pierna de apoyo.',
      'Sube empujando con todo el pie sin apoyar la otra pierna.',
    ],
    tips: [
      'Progresa bajando hasta un banco y subiendo desde ahí.',
      'Sostener un peso liviano al frente ayuda al equilibrio.',
      'Exige movilidad de tobillo: trabájala aparte.',
    ],
    mistakes: [
      'Rodilla hacia adentro.',
      'Talón despegado.',
      'Caer de golpe abajo.',
    ],
  },
  highKnees: {
    steps: [
      'Párate erguido con los brazos a los costados.',
      'Eleva una rodilla hasta la altura de la cadera.',
      'Alterna las piernas rápidamente, como trotando en el lugar.',
      'Acompaña con los brazos en oposición a las piernas.',
    ],
    tips: [
      'Apoya en la punta de los pies, con pisadas rápidas y livianas.',
      'Mantén el torso erguido.',
      'Útil como calentamiento o en intervalos.',
    ],
    mistakes: [
      'Inclinarse hacia atrás.',
      'Rodillas bajas.',
      'Apoyar todo el pie con fuerza.',
    ],
  },
  jumpingJack: {
    steps: [
      'Párate con los pies juntos y los brazos a los costados.',
      'Salta separando los pies y elevando los brazos por encima de la cabeza.',
      'Salta de nuevo volviendo a la posición inicial.',
      'Mantén un ritmo constante.',
    ],
    tips: [
      'Gran ejercicio para entrar en calor.',
      'Aterriza en la punta de los pies con las rodillas suaves.',
      'Sin saltar: da pasos laterales para una versión de bajo impacto.',
    ],
    mistakes: [
      'Aterrizar con las piernas rígidas.',
      'Brazos a mitad de camino.',
      'Encorvar la espalda.',
    ],
  },
  skater: {
    steps: [
      'Párate sobre una pierna con la rodilla levemente flexionada.',
      'Salta hacia el costado aterrizando sobre la otra pierna.',
      'Cruza la pierna libre por detrás y acompaña con los brazos.',
      'Salta de vuelta al otro lado.',
    ],
    tips: [
      'Aterriza suave y aguanta un instante antes del siguiente salto.',
      'Cuanto más lejos el salto, más intenso.',
      'Trabaja glúteo medio y estabilidad de rodilla.',
    ],
    mistakes: [
      'Rodilla hacia adentro al aterrizar.',
      'Aterrizar sin control.',
      'Saltos cortos sin intención.',
    ],
  },
  bearCrawl: {
    steps: [
      'Ponte en cuatro apoyos con las rodillas apenas despegadas del piso.',
      'Mantén la espalda plana y el abdomen firme.',
      'Avanza moviendo a la vez la mano y el pie contrarios.',
      'Da pasos cortos manteniendo las rodillas bajas.',
    ],
    tips: [
      'Imagina un vaso de agua sobre la espalda que no debe caerse.',
      'Lento es más difícil que rápido.',
      'Puedes avanzar, retroceder o moverte de costado.',
    ],
    mistakes: [
      'Cadera muy alta.',
      'Pasos largos que hacen girar el torso.',
      'Rodillas que tocan el piso.',
    ],
  },
  shoulderTap: {
    steps: [
      'Ponte en plancha alta con los pies algo separados.',
      'Lleva una mano al hombro contrario.',
      'Vuelve a apoyarla y repite con la otra mano.',
      'Mantén la cadera quieta todo el tiempo.',
    ],
    tips: [
      'Pies más separados = más fácil.',
      'Aprieta glúteos y abdomen para que la cadera no gire.',
      'Lento y controlado.',
    ],
    mistakes: [
      'Balancear la cadera.',
      'Cadera hundida.',
      'Ir rápido.',
    ],
  },
  trxRow: {
    steps: [
      'Toma las manijas del TRX y camina hacia el anclaje hasta inclinarte hacia atrás.',
      'Con el cuerpo recto, estira los brazos.',
      'Tira del pecho hacia las manos juntando los omóplatos.',
      'Baja despacio hasta estirar los brazos.',
    ],
    tips: [
      'Cuanto más inclinado el cuerpo, más difícil.',
      'Mantén glúteos y abdomen firmes.',
      'Gira las palmas para trabajar distintos ángulos.',
    ],
    mistakes: [
      'Cadera caída.',
      'Encoger los hombros.',
      'Medio recorrido.',
    ],
  },
  turkishGetUp: {
    steps: [
      'Acuéstate con la pesa en una mano, brazo estirado hacia el techo y la rodilla de ese lado flexionada.',
      'Gira hasta apoyarte en el codo contrario y luego en la mano.',
      'Eleva la cadera, lleva la pierna estirada por debajo y apoya la rodilla.',
      'Ponte de pie desde la rodilla sin dejar de mirar la pesa; luego deshaz los pasos.',
    ],
    tips: [
      'Aprende primero sin peso o con un zapato sobre el puño.',
      'El brazo con la pesa siempre vertical y bloqueado.',
      'Lento y paso por paso.',
    ],
    mistakes: [
      'Doblar el codo del brazo con la pesa.',
      'Apurar las transiciones.',
      'Usar demasiado peso al aprender.',
    ],
  },
  slamBall: {
    steps: [
      'Párate con el balón sobre la cabeza y los brazos estirados.',
      'Lánzalo con fuerza contra el piso flexionando cadera y rodillas.',
      'Recógelo con la espalda recta (como un peso muerto).',
      'Vuelve a llevarlo sobre la cabeza y repite.',
    ],
    tips: [
      'Usa un balón slam (sin rebote) para no recibir el golpe de vuelta.',
      'Exhala con fuerza en cada lanzamiento.',
      'Intervalos cortos y explosivos.',
    ],
    mistakes: [
      'Recoger el balón con la espalda redondeada.',
      'Lanzar solo con los brazos.',
      'Usar un balón que rebota hacia la cara.',
    ],
  },
  running: {
    steps: [
      'Entra en calor caminando o trotando suave 5–10 minutos.',
      'Corre con el torso erguido y una leve inclinación hacia adelante.',
      'Apoya el pie debajo de la cadera, no muy adelante.',
      'Mueve los brazos relajados hacia adelante y atrás, con los codos a unos 90°.',
    ],
    tips: [
      'La mayor parte del entrenamiento debería ser a un ritmo en el que puedas conversar.',
      'Aumenta el volumen semanal de a poco (no más de 10% por semana).',
      'Registra los minutos como repeticiones y las series como bloques o intervalos.',
    ],
    mistakes: [
      'Zancadas largas apoyando el talón muy adelante.',
      'Hombros tensos y brazos cruzando el cuerpo.',
      'Subir el volumen demasiado rápido.',
    ],
  },
  walking: {
    steps: [
      'Camina erguido con la mirada al frente.',
      'Apoya el talón y rueda hacia la punta del pie.',
      'Mueve los brazos acompañando el paso.',
      'Mantén un ritmo que acelere la respiración sin ahogarte.',
    ],
    tips: [
      'En cinta, una inclinación del 8–12% aumenta mucho el gasto sin impacto.',
      'No te sujetes de las barandas: le quita trabajo a las piernas.',
      'Sumar pasos diarios ayuda a la recuperación y la composición corporal.',
    ],
    mistakes: [
      'Sujetarse de la cinta.',
      'Encorvarse hacia adelante en la pendiente.',
      'Pasos demasiado largos.',
    ],
  },
  cycling: {
    steps: [
      'Ajusta el asiento: con el pedal abajo, la rodilla queda apenas flexionada.',
      'Apoya las manos sin cargar todo el peso en ellas.',
      'Pedalea con un ritmo constante (80–100 vueltas por minuto).',
      'Usa la resistencia o los cambios para regular la intensidad.',
    ],
    tips: [
      'Bajo impacto: ideal para sumar cardio sin cargar las rodillas.',
      'Alterna bloques suaves y fuertes para trabajar distintas intensidades.',
      'Registra los minutos como repeticiones.',
    ],
    mistakes: [
      'Asiento muy bajo (sobrecarga la rodilla).',
      'Balancear la cadera en el asiento.',
      'Pedalear siempre al mismo ritmo cómodo.',
    ],
  },
  swimming: {
    steps: [
      'Entra en calor con largos suaves.',
      'Mantén el cuerpo horizontal y la cabeza alineada con la columna.',
      'Alterna las brazadas estirando bien hacia adelante y empujando el agua hasta la cadera.',
      'Patea desde la cadera con las piernas casi estiradas y respira girando la cabeza.',
    ],
    tips: [
      'Trabaja todo el cuerpo con impacto nulo.',
      'Respirar cada 3 brazadas equilibra ambos lados.',
      'Registra los minutos o los largos como repeticiones.',
    ],
    mistakes: [
      'Levantar la cabeza para respirar (hunde la cadera).',
      'Patear desde las rodillas.',
      'Brazadas cortas.',
    ],
  },
  elliptical: {
    steps: [
      'Sube a la máquina y toma las manijas móviles.',
      'Mantén el torso erguido.',
      'Empuja y tira con brazos y piernas de forma coordinada.',
      'Regula la resistencia para mantener la intensidad deseada.',
    ],
    tips: [
      'Bajo impacto y trabajo de cuerpo completo.',
      'Pedalear hacia atrás cambia el énfasis hacia glúteos e isquiotibiales.',
      'No te apoyes con todo el peso en las manijas.',
    ],
    mistakes: [
      'Encorvarse.',
      'Resistencia tan baja que no hay esfuerzo.',
      'Mover solo las piernas.',
    ],
  },
  stairClimber: {
    steps: [
      'Sube a la máquina y elige un ritmo moderado.',
      'Apoya todo el pie en cada escalón.',
      'Mantén el torso erguido.',
      'Sujétate apenas de las barandas para equilibrarte.',
    ],
    tips: [
      'Trabaja muy bien los glúteos.',
      'Subir de a dos escalones aumenta el trabajo del glúteo.',
      'Registra los minutos como repeticiones.',
    ],
    mistakes: [
      'Colgarse de las barandas.',
      'Apoyar solo la punta del pie.',
      'Inclinarse mucho hacia adelante.',
    ],
  },
  rowErg: {
    steps: [
      'Sujeta los pies y toma la manija con los brazos estirados.',
      'Empuja primero con las piernas.',
      'Cuando las piernas se estiran, inclina el torso apenas hacia atrás y tira de la manija hacia el abdomen.',
      'Vuelve en orden inverso: brazos, torso y por último piernas.',
    ],
    tips: [
      'La potencia sale aproximadamente 60% de piernas, 20% de torso y 20% de brazos.',
      'La vuelta debe durar el doble que el tirón.',
      'Registra los minutos o metros como repeticiones.',
    ],
    mistakes: [
      'Tirar con los brazos antes de empujar con las piernas.',
      'Redondear la espalda.',
      'Doblar las rodillas antes de que la manija pase las rodillas en la vuelta.',
    ],
  },
  jumpRope: {
    steps: [
      'Ajusta la soga: pisándola al medio, las manijas llegan a las axilas.',
      'Mantén los codos cerca del cuerpo y gira la soga con las muñecas.',
      'Salta apenas lo suficiente para que pase la soga, sobre la punta de los pies.',
      'Mantén un ritmo constante.',
    ],
    tips: [
      'Saltos bajos y rápidos: menos impacto y más resistencia.',
      'Mira al frente.',
      'Registra los minutos o las vueltas como repeticiones.',
    ],
    mistakes: [
      'Girar la soga con los hombros.',
      'Saltar muy alto.',
      'Aterrizar sobre los talones.',
    ],
  },
  muscleUp: {
    steps: [
      'Cuélgate de la barra con agarre prono algo más cerrado que en las dominadas.',
      'Haz un balanceo controlado y tira de forma explosiva hacia la cadera.',
      'Cuando el pecho pasa la barra, lleva los codos hacia arriba y el torso por encima.',
      'Termina empujando hasta estirar los brazos sobre la barra.',
    ],
    tips: [
      'Requisitos: unas 10 dominadas y 15 fondos estrictos.',
      'Practica la transición con una banda elástica.',
      'Un agarre "falso" (muñeca por encima de la barra) facilita la transición.',
    ],
    mistakes: [
      'Tirar hacia el mentón en lugar de hacia la cadera.',
      'Subir un brazo antes que el otro.',
      'Intentarlo sin la fuerza base necesaria.',
    ],
  },
  hspu: {
    steps: [
      'Apoya las manos a unos 20 cm de la pared y sube las piernas hasta quedar de cabeza.',
      'Con los brazos estirados y el cuerpo firme, apoya los talones en la pared.',
      'Flexiona los codos y baja la cabeza hasta casi tocar el piso.',
      'Empuja hasta estirar los brazos.',
    ],
    tips: [
      'Progresa con flexiones en pica (cadera alta) antes de la vertical completa.',
      'Usa una colchoneta debajo de la cabeza.',
      'Las manos forman un triángulo con la cabeza.',
    ],
    mistakes: [
      'Arquear demasiado la espalda.',
      'Codos muy abiertos.',
      'Golpear la cabeza contra el piso.',
    ],
  },
  ropeClimb: {
    steps: [
      'Toma la soga con ambas manos por encima de la cabeza.',
      'Sube las rodillas y traba la soga entre los pies.',
      'Ponte de pie sobre la soga y sube las manos.',
      'Repite hasta la altura objetivo y baja controlado mano a mano.',
    ],
    tips: [
      'Usa las piernas: los brazos solos se cansan rápido.',
      'Practica el trabado de pies cerca del piso.',
      'Nunca te deslices hacia abajo: quema las manos.',
    ],
    mistakes: [
      'Subir solo con los brazos.',
      'Bajar deslizándose.',
      'Subir más alto de lo que puedes bajar.',
    ],
  },
  dance: {
    steps: [
      'Entra en calor con movimientos suaves de cadera, hombros y tobillos.',
      'Sigue el ritmo con pasos básicos antes de sumar brazos.',
      'Mantén el abdomen activo y las rodillas suaves.',
      'Aumenta la intensidad ampliando los movimientos y la velocidad.',
    ],
    tips: [
      'Es cardio de verdad: una clase de 45–60 minutos puede igualar a correr suave.',
      'Registra los minutos como repeticiones.',
      'Usa calzado con buena amortiguación y suela que gire.',
    ],
    mistakes: [
      'Bloquear las rodillas en los saltos.',
      'No hidratarse.',
      'Copiar movimientos que molestan una articulación en lugar de adaptarlos.',
    ],
  },
  combat: {
    steps: [
      'Párate en guardia: pies separados, uno adelante, rodillas flexionadas y manos a la altura de la cara.',
      'Lanza los golpes girando la cadera y el pie de atrás.',
      'Vuelve a la guardia después de cada golpe.',
      'Trabaja por rounds (por ejemplo 3 minutos de trabajo y 1 de pausa).',
    ],
    tips: [
      'Usa vendas y guantes para proteger las muñecas.',
      'La potencia sale del piso y de la rotación de cadera, no del brazo.',
      'Registra los rounds como series y los minutos como repeticiones.',
    ],
    mistakes: [
      'Bajar las manos al lanzar.',
      'Golpear solo con el brazo.',
      'Contener la respiración.',
    ],
  },
  yoga: {
    steps: [
      'Empieza con respiraciones lentas por la nariz.',
      'Pasa de una postura a otra coordinando cada movimiento con la respiración.',
      'Mantén cada postura varias respiraciones sin forzar el rango.',
      'Termina con unos minutos de relajación acostado.',
    ],
    tips: [
      'Mejora movilidad, equilibrio y recuperación: buen complemento de las pesas.',
      'Usa bloques o una correa si no llegas a una postura.',
      'Registra los minutos como repeticiones.',
    ],
    mistakes: [
      'Forzar la postura con dolor.',
      'Contener la respiración.',
      'Compararse con otros.',
    ],
  },
  pilates: {
    steps: [
      'Acuéstate y activa el "centro": abdomen hacia adentro y suelo pélvico firme.',
      'Ejecuta cada ejercicio de forma lenta y precisa.',
      'Coordina la respiración: exhala en el esfuerzo.',
      'Mantén la zona lumbar controlada en todo momento.',
    ],
    tips: [
      'Excelente para el core profundo y la postura.',
      'En reformer, la resistencia de los resortes permite progresar.',
      'Registra los minutos como repeticiones.',
    ],
    mistakes: [
      'Ir rápido.',
      'Despegar la zona lumbar cuando no corresponde.',
      'Tensar el cuello.',
    ],
  },
  sport: {
    steps: [
      'Entra en calor 10 minutos: trote suave, movilidad y cambios de dirección.',
      'Practica los gestos técnicos del deporte de menor a mayor intensidad.',
      'Juega o entrena por bloques con pausas para hidratarte.',
      'Termina con unos minutos de vuelta a la calma y estiramientos suaves.',
    ],
    tips: [
      'Registra los minutos de juego como repeticiones.',
      'El trabajo de fuerza en el gimnasio reduce el riesgo de lesiones en el deporte.',
      'Usa el calzado adecuado para la superficie.',
    ],
    mistakes: [
      'Empezar a máxima intensidad sin calentar.',
      'No hidratarse.',
      'Jugar con dolor.',
    ],
  },
  climbing: {
    steps: [
      'Entra en calor dedos, hombros y caderas con vías fáciles.',
      'Mantén la cadera cerca de la pared.',
      'Empuja con las piernas y usa los brazos estirados para descansar.',
      'Planifica el camino antes de empezar.',
    ],
    tips: [
      'Las piernas deben hacer la mayor parte del trabajo.',
      'Descansa entre intentos: los dedos se recuperan lento.',
      'Registra los minutos o las vías como repeticiones.',
    ],
    mistakes: [
      'Trepar con los brazos doblados todo el tiempo.',
      'No mirar los pies.',
      'Entrenar con los dedos doloridos.',
    ],
  },
});

// [pose, familia, opciones] — `gear` fuerza el implemento del dibujo; `extra` agrega un consejo propio.
const entry = (pose, family, options = {}) => Object.freeze({ pose, family, ...options });

export const EXERCISE_GUIDES = Object.freeze({
  // Pecho
  'PRESS BANCA': entry('benchPress', 'press'),
  'PRESS BANCA CON MANCUERNAS': entry('benchPress', 'press', { extra: 'Las mancuernas permiten bajar más y que cada brazo trabaje por separado: junta las mancuernas arriba sin chocarlas.' }),
  'PRESS INCLINADO': entry('inclinePress', 'press', { extra: 'Banco a 30–45°: más inclinación pasa el trabajo al hombro. Baja la barra a la parte alta del pecho.' }),
  'PRESS INCLINADO CON MANCUERNAS': entry('inclinePress', 'press', { extra: 'Banco a 30–45°. Baja las mancuernas a los costados de la parte alta del pecho.' }),
  'PRESS DECLINADO': entry('declinePress', 'press', { extra: 'Traba bien las piernas en el apoyo y baja la barra a la parte baja del pecho. Necesitas un compañero para sacar y dejar la barra.' }),
  'PRESS DECLINADO CON MANCUERNAS': entry('declinePress', 'press', { extra: 'Sube las mancuernas apoyadas en los muslos antes de recostarte y bájalas igual al terminar.' }),
  'PRESS DE PECHO EN MAQUINA': entry('machinePress', 'chestMachine'),
  'PRESS INCLINADO EN MAQUINA': entry('machinePress', 'chestMachine', { extra: 'Las manijas deben quedar a la altura de la parte alta del pecho.' }),
  'PRESS EN MULTIPOWER': entry('benchPress', 'press', { gear: 'barbell', extra: 'La barra guiada es más estable: ubica el banco para que baje a la parte baja del pecho y usa los seguros.' }),
  'PRESS INCLINADO EN MULTIPOWER': entry('inclinePress', 'press', { gear: 'barbell', extra: 'Ubica el banco inclinado de modo que la barra baje a la parte alta del pecho.' }),
  'PRESS SVEND': entry('pallofPress', 'svend', { gear: 'plate' }),
  MARIPOSA: entry('pecDeck', 'pecDeck'),
  'APERTURAS CON MANCUERNAS': entry('fly', 'fly'),
  'APERTURAS INCLINADAS': entry('inclineFly', 'fly', { extra: 'Banco a 30°: enfoca la parte alta del pecho.' }),
  'CRUCE DE POLEAS': entry('cableCross', 'cableCross'),
  'CRUCE DE POLEAS BAJAS': entry('lowCableCross', 'cableCross', { extra: 'Desde abajo hacia arriba, como si levantaras una bandeja: trabaja el pecho superior.' }),
  FLEXIONES: entry('pushUp', 'pushUp'),
  'FLEXIONES DECLINADAS': entry('declinePushUp', 'pushUp', { extra: 'Con los pies elevados la carga sube y el énfasis pasa al pecho superior y al hombro.' }),
  'FLEXIONES DIAMANTE': entry('pushUp', 'pushUp', { extra: 'Manos juntas formando un rombo con pulgares e índices, debajo del pecho: carga mucho más el tríceps. Codos pegados al cuerpo.' }),
  'FONDOS PARA PECHO': entry('dips', 'dips', { extra: 'Inclina el torso hacia adelante y abre un poco los codos para cargar el pecho.' }),
  PULLOVER: entry('pullover', 'pullover'),

  // Espalda
  'PESO MUERTO': entry('deadlift', 'deadlift'),
  'RACK PULL': entry('rackPull', 'deadlift', { extra: 'La barra arranca desde los seguros a la altura de las rodillas: trabaja la parte final del peso muerto y permite cargar más.' }),
  'JALON AL PECHO': entry('latPulldown', 'pulldown'),
  'JALON AL PECHO AGARRE CERRADO': entry('latPulldown', 'pulldown', { extra: 'Con el triángulo o un agarre cerrado el codo baja pegado al cuerpo y el dorsal trabaja con más recorrido.' }),
  'JALON TRAS NUCA': entry('latPulldown', 'pulldown', { extra: 'Solo si tienes buena movilidad de hombro. La versión al pecho trabaja lo mismo con menos riesgo.' }),
  'JALON CON BRAZOS RECTOS': entry('straightArmPulldown', 'straightArm'),
  DOMINADAS: entry('pullUp', 'pullUp'),
  'DOMINADAS SUPINAS': entry('chinUp', 'pullUp', { extra: 'Palmas hacia ti al ancho de los hombros: suman bíceps y suelen salir más fácil.' }),
  'DOMINADAS ASISTIDAS': entry('pullUp', 'pullUp', { extra: 'Usa la menor asistencia posible y redúcela de a poco cada semana.' }),
  'REMO CON BARRA': entry('bentRow', 'bentRow'),
  'REMO PENDLAY': entry('bentRow', 'bentRow', { extra: 'Torso paralelo al piso y la barra vuelve al piso en cada repetición: tirón explosivo desde cero.' }),
  'REMO BAJO': entry('seatedRow', 'seatedRow'),
  'REMO EN T': entry('bentRow', 'bentRow', { extra: 'Con el agarre neutro de la barra en T, tira hacia el pecho bajo con los codos cerca del cuerpo.' }),
  'REMO UNILATERAL': entry('oneArmRow', 'oneArmRow'),
  'REMO EN MAQUINA': entry('machineRow', 'machineRow'),
  'REMO INVERTIDO': entry('invertedRow', 'invertedRow'),
  HIPEREXTENSIONES: entry('hyperextension', 'hyperextension'),
  'BUENOS DIAS': entry('goodMorning', 'hinge', { extra: 'La barra va sobre la espalda alta, como en la sentadilla. Empieza muy liviano: el brazo de palanca es largo.' }),
  'ENCOGIMIENTOS CON BARRA': entry('shrug', 'shrug', { gear: 'barbell' }),
  'ENCOGIMIENTOS CON MANCUERNAS': entry('shrug', 'shrug'),

  // Hombros
  'PRESS MILITAR': entry('overheadPress', 'ohp'),
  'PRESS DE HOMBROS CON MANCUERNAS': entry('seatedPress', 'ohp'),
  'PRESS ARNOLD': entry('seatedPress', 'ohp', { extra: 'Empieza con las palmas hacia ti y gíralas hacia adelante mientras subes: suma recorrido al deltoides anterior.' }),
  'PRESS DE HOMBROS EN MAQUINA': entry('seatedPress', 'ohp', { gear: 'machine' }),
  'PRESS TRAS NUCA': entry('seatedPress', 'ohp', { gear: 'barbell', extra: 'Solo con buena movilidad de hombro y sin molestias; baja hasta la altura de las orejas, no más.' }),
  'LANDMINE PRESS': entry('landminePress', 'landmine'),
  'VUELOS LATERALES': entry('lateralRaise', 'lateral'),
  'VUELOS LATERALES EN POLEA': entry('lateralRaise', 'lateral', { gear: 'none', extra: 'Párate de costado a la polea baja y toma la manija con la mano más lejana: la tensión empieza desde abajo.' }),
  'VUELOS LATERALES EN MAQUINA': entry('lateralRaise', 'lateral', { gear: 'none' }),
  'VUELOS ANTERIORES': entry('frontRaise', 'frontRaise'),
  'VUELOS POSTERIORES': entry('rearDelt', 'rearDelt'),
  'PEC DECK INVERTIDO': entry('reversePecDeck', 'rearDelt'),
  'FACE PULL': entry('facePull', 'facePull'),
  'REMO MENTON': entry('uprightRow', 'uprightRow'),
  'ROTACION EXTERNA EN POLEA': entry('externalRotation', 'extRot'),
  'ELEVACIONES EN Y': entry('yRaise', 'yRaise'),

  // Bíceps
  'CURL CON BARRA': entry('curl', 'curl'),
  'CURL CON BARRA W': entry('curl', 'curl', { extra: 'La barra W deja las muñecas en un ángulo más cómodo y suma trabajo del braquial.' }),
  'CURL CON MANCUERNAS': entry('curl', 'curl', { gear: 'dumbbell' }),
  'CURL ALTERNADO CON MANCUERNAS': entry('curl', 'curl', { gear: 'dumbbell', extra: 'Sube un brazo por vez: permite concentrarte en cada lado y girar bien la palma.' }),
  'CURL MARTILLO': entry('curl', 'curl', { gear: 'dumbbell', extra: 'Palmas enfrentadas todo el recorrido: trabaja más el braquial y el braquiorradial (grosor del brazo).' }),
  'CURL MARTILLO CON SOGA': entry('curl', 'curl', { gear: 'cable', extra: 'Con la soga en la polea baja y palmas enfrentadas: tensión constante en braquial y antebrazo.' }),
  'CURL POLEA': entry('curl', 'curl', { gear: 'cable', extra: 'La polea mantiene la tensión también abajo, donde la mancuerna "descansa".' }),
  'CURL SCOTT': entry('preacherCurl', 'preacher'),
  'CURL CONCENTRADO': entry('concentrationCurl', 'concentration'),
  'CURL BAYESIANO': entry('curl', 'curl', { gear: 'cable', extra: 'De espaldas a la polea baja, con el brazo por detrás del cuerpo: estira mucho el bíceps al empezar.' }),
  'CURL BICEPS INCLINADO': entry('inclineCurl', 'inclineCurl'),
  'CURL ARAÑA': entry('preacherCurl', 'preacher', { gear: 'dumbbell', extra: 'Boca abajo sobre un banco inclinado, con los brazos colgando verticales: máxima contracción arriba.' }),
  'CURL 21': entry('curl', 'curl', { extra: '7 repeticiones de abajo a la mitad, 7 de la mitad hacia arriba y 7 completas, sin descanso. Usa menos peso.' }),
  'CURL EN MAQUINA': entry('preacherCurl', 'preacher', { gear: 'machine' }),
  'CURL INVERTIDO': entry('curl', 'curl', { extra: 'Palmas hacia abajo (agarre prono): trabaja sobre todo antebrazos y braquial. Usa bastante menos peso.' }),

  // Tríceps
  'EXTENSION DE TRICEPS EN POLEA': entry('tricepsPushdown', 'pushdown'),
  'EXTENSION DE TRICEPS CON SOGA': entry('tricepsPushdown', 'pushdown', { extra: 'Abre las manos hacia afuera al final del recorrido.' }),
  'EXTENSION DE TRICEPS AGARRE INVERTIDO': entry('tricepsPushdown', 'pushdown', { extra: 'Palmas hacia arriba: más trabajo de la cabeza medial y menos peso que con agarre prono.' }),
  'PRESS FRANCES': entry('skullCrusher', 'skullCrusher'),
  'PRESS FRANCES CON MANCUERNAS': entry('skullCrusher', 'skullCrusher', { gear: 'dumbbell' }),
  'EXTENSION DE TRICEPS CON MANCUERNA': entry('overheadExtension', 'overheadExt'),
  'TRICEPS COPA': entry('overheadExtension', 'overheadExt', { extra: 'Sostén una mancuerna con ambas manos por el disco superior, formando una copa.' }),
  'TRICEPS TRAS NUCA EN POLEA': entry('overheadExtension', 'overheadExt', { gear: 'none', extra: 'De espaldas a la polea, con la soga detrás de la cabeza e inclinado hacia adelante: tensión constante.' }),
  'PATADA DE TRICEPS': entry('tricepsKickback', 'kickback'),
  'FONDOS EN PARALELAS': entry('dips', 'dips', { extra: 'Torso vertical y codos hacia atrás para cargar el tríceps.' }),
  'FONDOS EN BANCO': entry('benchDips', 'benchDips'),
  'FONDOS EN MAQUINA': entry('dips', 'dips', { extra: 'La máquina permite ajustar la carga: ideal para aprender o terminar la rutina cerca del fallo.' }),
  'PRESS CERRADO': entry('benchPress', 'closeGrip'),

  // Antebrazos
  'CURL DE MUÑECA': entry('wristCurl', 'wrist'),
  'CURL DE MUÑECA INVERTIDO': entry('wristCurl', 'wrist', { extra: 'Palmas hacia abajo: trabaja los extensores del antebrazo. Usa la mitad de peso que en el curl de muñeca.' }),
  'RODILLO DE MUÑECA': entry('frontRaise', 'wrist', { gear: 'none', extra: 'Con los brazos al frente, enrolla la cuerda girando las muñecas hasta subir el peso y desenróllala despacio.' }),
  'COLGADO EN BARRA': entry('deadHang', 'deadHang'),

  // Core
  CRUNCH: entry('crunch', 'crunch'),
  'CRUNCH EN POLEA': entry('crunch', 'crunch', { extra: 'De rodillas frente a la polea alta, con la soga junto a la cabeza: enrolla el torso hacia las rodillas sin mover la cadera.' }),
  'CRUNCH EN MAQUINA': entry('crunch', 'crunch', { extra: 'Ajusta el peso para hacer entre 10 y 20 repeticiones enrollando la columna, no doblando la cadera.' }),
  'CRUNCH INVERSO': entry('reverseCrunch', 'reverseCrunch'),
  'SIT UP': entry('sitUp', 'crunch', { extra: 'Sube hasta sentarte por completo; trabaja también los flexores de cadera. Fija los pies si hace falta.' }),
  PLANCHA: entry('plank', 'plank'),
  'PLANCHA LATERAL': entry('sidePlank', 'sidePlank'),
  'ELEVACION DE PIERNAS': entry('legRaise', 'legRaise', { extra: 'Acostado, con las manos debajo de los glúteos y la zona lumbar pegada al piso.' }),
  'ELEVACION DE PIERNAS COLGADO': entry('hangingLegRaise', 'legRaise', { extra: 'Colgado de la barra, evita el balanceo: haz una pausa abajo antes de cada repetición.' }),
  'ELEVACION DE RODILLAS EN PARALELAS': entry('kneeRaise', 'legRaise', { extra: 'Con los antebrazos apoyados y la espalda contra el respaldo de la silla romana.' }),
  'RUEDA ABDOMINAL': entry('abWheel', 'abWheel'),
  'RUSSIAN TWIST': entry('russianTwist', 'russianTwist'),
  'CRUNCH BICICLETA': entry('bicycleCrunch', 'bicycleCrunch'),
  'LEÑADOR EN POLEA': entry('woodchopper', 'woodchopper'),
  'PALLOF PRESS': entry('pallofPress', 'pallof'),

  // Piernas
  SENTADILLA: entry('squat', 'squat', { extra: 'La barra va apoyada en el trapecio, no en el cuello; aprieta la barra y lleva los codos hacia abajo.' }),
  'SENTADILLA FRONTAL': entry('frontSquat', 'squat', { extra: 'Barra sobre la parte delantera de los hombros y codos altos: el torso queda más vertical y trabaja más el cuádriceps.' }),
  'SENTADILLA HACK': entry('hackSquat', 'hackSquat'),
  'SENTADILLA EN MULTIPOWER': entry('squat', 'squat', { extra: 'Adelanta un poco los pies respecto de la barra guiada para mantener el torso erguido.' }),
  'SENTADILLA GOBLET': entry('gobletSquat', 'squat', { extra: 'Sostén la pesa pegada al pecho: el contrapeso ayuda a bajar profundo con la espalda recta. Ideal para aprender.' }),
  'SENTADILLA BULGARA': entry('bulgarianSquat', 'lunge', { extra: 'Empeine de atrás apoyado en un banco. Casi todo el peso va en la pierna de adelante.' }),
  'SENTADILLA SUMO': entry('sumoSquat', 'squat', { gear: 'kettlebell', extra: 'Pies bien abiertos y puntas hacia afuera: más aductores y glúteos. Sostén la pesa colgando entre las piernas.' }),
  'SISSY SQUAT': entry('sissySquat', 'sissy'),
  'PRENSA 45': entry('legPress', 'legPress'),
  'PRENSA HORIZONTAL': entry('legPress', 'legPress', { extra: 'Sentado, empujando hacia adelante: misma técnica, con menos carga sobre la espalda.' }),
  'SILLON DE CUADRICEPS': entry('legExtension', 'legExtension'),
  'CAMILLA DE ISQUIOTIBIALES': entry('lyingLegCurl', 'legCurl'),
  'CURL FEMORAL SENTADO': entry('seatedLegCurl', 'legCurl'),
  'CURL FEMORAL PARADO': entry('standingLegCurl', 'legCurl', { extra: 'De pie, una pierna por vez: apoya bien la cadera contra el respaldo.' }),
  'CURL NORDICO': entry('nordicCurl', 'nordic'),
  'PESO MUERTO RUMANO': entry('romanianDeadlift', 'hinge'),
  'PESO MUERTO PIERNAS RIGIDAS': entry('stiffLeg', 'hinge', { extra: 'Rodillas casi estiradas: más estiramiento de isquiotibiales. Baja solo mientras la espalda siga recta.' }),
  'PESO MUERTO SUMO': entry('deadlift', 'deadlift', { extra: 'Pies muy abiertos con las puntas hacia afuera y manos por dentro de las piernas: torso más vertical y más trabajo de aductores.' }),
  ESTOCADAS: entry('lunge', 'lunge'),
  'ESTOCADAS CAMINANDO': entry('lunge', 'lunge', { extra: 'Avanza con cada estocada: el equilibrio exige más trabajo de glúteo medio.' }),
  'ESTOCADAS INVERSAS': entry('reverseLunge', 'lunge', { extra: 'Paso hacia atrás: menos carga sobre la rodilla de adelante y más glúteo.' }),
  'SUBIDAS AL CAJON': entry('stepUp', 'stepUp'),
  ADUCTOR: entry('hipAdduction', 'adductor', { gear: 'none' }),

  // Glúteos
  'HIP THRUST': entry('hipThrust', 'hipThrust'),
  'HIP THRUST EN MAQUINA': entry('hipThrust', 'hipThrust', { gear: 'none', extra: 'La máquina reemplaza la barra: ajusta el cinturón sobre la cadera y el respaldo bajo los omóplatos.' }),
  'PUENTE DE GLUTEOS': entry('gluteBridge', 'gluteBridge'),
  'PATADA DE GLUTEO': entry('gluteKickback', 'gluteKickback'),
  MULTICADERA: entry('hipAbduction', 'abductor', { gear: 'none', extra: 'Ajusta el rodillo a la altura de la rodilla; según la posición trabaja abducción, aducción, extensión o flexión de cadera.' }),
  ABDUCTOR: entry('hipAbduction', 'abductor', { gear: 'none', extra: 'Sentado en la máquina, abre las piernas contra los apoyos externos.' }),
  'ABDUCCION EN POLEA': entry('hipAbduction', 'abductor', { gear: 'none', extra: 'Tobillera en la polea baja, de costado: separa la pierna más lejana.' }),
  'CAMINATA LATERAL CON BANDA': entry('bandWalk', 'abductor', { extra: 'Banda en las rodillas o tobillos, media sentadilla y pasos laterales cortos sin juntar los pies.' }),
  'PULL THROUGH': entry('pullThrough', 'pullThrough'),
  ALMEJA: entry('hipAbduction', 'abductor', { gear: 'none', extra: 'Acostado de costado con las rodillas flexionadas: abre la rodilla de arriba manteniendo los pies juntos. Una banda lo hace más difícil.' }),

  // Pantorrillas
  'GEMELOS PARADO': entry('calfRaise', 'calf'),
  'GEMELOS EN PRENSA': entry('calfRaise', 'calf', { extra: 'En la prensa, con las piernas casi estiradas y solo la punta de los pies en la plataforma.' }),
  'GEMELOS EN MULTIPOWER': entry('calfRaise', 'calf', { extra: 'Con la barra guiada sobre la espalda y un disco o escalón debajo de las puntas.' }),
  'SOLEO SENTADO': entry('seatedCalf', 'calf'),
  'ELEVACION DE PUNTAS': entry('tibialRaise', 'tibial'),

  // Funcional
  BURPEES: entry('burpee', 'burpee'),
  ESCALADORES: entry('mountainClimber', 'mountainClimber'),
  'SALTO AL CAJON': entry('boxJump', 'boxJump'),
  'KETTLEBELL SWING': entry('kettlebellSwing', 'kbSwing'),
  THRUSTER: entry('thruster', 'thruster'),
  'CARGADA DE POTENCIA': entry('powerClean', 'olympic', { extra: 'Recibe la barra sobre los hombros con los codos altos, en media sentadilla.' }),
  ARRANQUE: entry('snatch', 'olympic', { extra: 'Agarre muy ancho; la barra se recibe con los brazos estirados sobre la cabeza en una sentadilla.' }),
  'WALL BALL': entry('wallBall', 'wallBall'),
  'BATTLE ROPES': entry('battleRopes', 'battleRopes'),
  'PASEO DEL GRANJERO': entry('farmerWalk', 'farmerWalk'),
  'EMPUJE DE TRINEO': entry('sledPush', 'sledPush'),
  'CIRCUITO FUNCIONAL': entry('circuit', 'circuit'),
  'SENTADILLA SIN PESO': entry('gobletSquat', 'squat', { gear: 'none', extra: 'Brazos al frente para equilibrarte. Ideal para calentar o en circuitos de muchas repeticiones.' }),
  'SENTADILLA CON SALTO': entry('jumpSquat', 'jump'),
  'ESTOCADAS CON SALTO': entry('jumpLunge', 'jump', { extra: 'Cambia de pierna en el aire y aterriza directo en la siguiente estocada.' }),
  'SENTADILLA A UNA PIERNA': entry('pistolSquat', 'pistol'),
  SKIPPING: entry('highKnees', 'highKnees'),
  'JUMPING JACKS': entry('jumpingJack', 'jumpingJack'),
  PATINADOR: entry('skater', 'skater'),
  'CAMINATA DEL OSO': entry('bearCrawl', 'bearCrawl'),
  'PLANCHA CON TOQUE DE HOMBRO': entry('shoulderTap', 'shoulderTap'),
  'REMO EN TRX': entry('trxRow', 'trxRow'),
  'GET UP TURCO': entry('turkishGetUp', 'turkishGetUp'),
  'SLAM BALL': entry('slamBall', 'slamBall'),

  // Cardio
  RUNNING: entry('running', 'running'),
  SPRINTS: entry('sprint', 'running', { extra: 'Esfuerzos de 10–30 segundos casi al máximo con descansos completos. Entra en calor muy bien antes.' }),
  CINTA: entry('running', 'running', { extra: 'Una inclinación de 1% compensa la falta de viento y se parece más a correr al aire libre.' }),
  CAMINATA: entry('walking', 'walking'),
  'CAMINATA EN PENDIENTE': entry('inclineWalk', 'walking', { extra: 'Pendiente de 8–15% a paso firme: gran gasto calórico con muy poco impacto.' }),
  CICLISMO: entry('cycling', 'cycling', { extra: 'Usa casco y luces; en subidas, baja un cambio antes de que el pedaleo se vuelva pesado.' }),
  'BICICLETA FIJA': entry('cycling', 'cycling'),
  NATACION: entry('swimming', 'swimming'),
  ELIPTICO: entry('elliptical', 'elliptical'),
  ESCALADORA: entry('stairClimber', 'stairClimber'),
  'REMO ERGOMETRO': entry('rowErg', 'rowErg'),
  SOGA: entry('jumpRope', 'jumpRope'),

  // CrossFit
  'MUSCLE UP': entry('muscleUp', 'muscleUp'),
  'TOES TO BAR': entry('toesToBar', 'legRaise', { extra: 'Lleva los pies hasta tocar la barra. El kipping (balanceo controlado) permite encadenar repeticiones.' }),
  'DOBLE SALTO DE SOGA': entry('jumpRope', 'jumpRope', { extra: 'La soga pasa dos veces por salto: salta un poco más alto y acelera el giro de muñecas.' }),
  'BURPEE SOBRE LA BARRA': entry('burpeeOverBar', 'burpee', { extra: 'Al subir, salta por encima de la barra con los dos pies y empieza el siguiente burpee del otro lado.' }),
  'DEVIL PRESS': entry('devilPress', 'olympic', { extra: 'Burpee con las manos sobre dos mancuernas; al subir, llévalas sobre la cabeza en un solo movimiento de cadera.' }),
  ENVION: entry('splitJerk', 'olympic', { extra: 'Dos tiempos: cargada a los hombros y luego envión, flexionando las rodillas y metiéndote debajo de la barra en tijera.' }),
  'FLEXIONES EN VERTICAL': entry('handstandPushUp', 'hspu'),
  'FONDOS EN ANILLAS': entry('dips', 'dips', { extra: 'Las anillas son inestables: gira las palmas hacia afuera arriba y mantén las anillas pegadas al cuerpo.' }),
  'TREPADA DE SOGA': entry('ropeClimb', 'ropeClimb'),
  'PECHO A LA BARRA': entry('pullUp', 'pullUp', { extra: 'Tira hasta que el pecho toque la barra: más recorrido y más espalda media.' }),
  'DOMINADAS KIPPING': entry('kippingPullUp', 'pullUp', { extra: 'Usa el balanceo controlado (arco y hueco) para encadenar repeticiones. Domina antes las dominadas estrictas.' }),
  'SENTADILLA OVERHEAD': entry('overheadSquat', 'squat', { extra: 'Barra sobre la cabeza con agarre ancho y brazos bloqueados: exige mucha movilidad de hombros y tobillos.' }),
  'PUSH PRESS': entry('pushPress', 'ohp', { extra: 'Flexiona apenas las rodillas y usa ese impulso para empujar la barra: permite mover más peso que el press estricto.' }),
  'ASSAULT BIKE': entry('cycling', 'cycling', { extra: 'Empuja y tira de las manijas mientras pedaleas: la resistencia aumenta cuanto más fuerte vas.' }),

  // Baile
  SAMBA: entry('samba', 'dance', { extra: 'El paso básico alterna rebotes rápidos de rodillas y cadera: mantén el peso en la punta de los pies.' }),
  ZUMBA: entry('dance', 'dance'),
  SALSA: entry('dance', 'dance', { extra: 'El paso básico marca 1-2-3 y pausa en el 4; el movimiento de cadera sale de flexionar las rodillas.' }),
  CUMBIA: entry('dance', 'dance'),
  REGGAETON: entry('dance', 'dance'),
  AEROBICO: entry('stepAerobic', 'dance', { extra: 'En step, apoya todo el pie sobre la plataforma y baja siempre con control.' }),

  // Combate
  BOXEO: entry('boxing', 'combat'),
  KICKBOXING: entry('kickboxing', 'combat', { extra: 'En las patadas, gira el pie de apoyo y golpea con la tibia o el empeine.' }),
  'ARTES MARCIALES': entry('martialArts', 'combat', { extra: 'En disciplinas de agarre, prioriza la técnica y aprende a caer antes de entrenar proyecciones.' }),

  // Yoga y Pilates
  YOGA: entry('yoga', 'yoga'),
  PILATES: entry('pilates', 'pilates'),

  // Deportes
  FUTBOL: entry('football', 'sport', { extra: 'Fortalece isquiotibiales y aductores: son las lesiones más comunes del fútbol.' }),
  PADEL: entry('racket', 'sport', { extra: 'Trabaja rotación de tronco y hombros; el codo sufre si la pala es muy pesada.' }),
  TENIS: entry('racket', 'sport', { extra: 'El golpe sale de las piernas y el giro del tronco, no solo del brazo.' }),
  BASQUET: entry('basketball', 'sport', { extra: 'Aterriza de los saltos con las rodillas flexionadas: protege ligamentos y tobillos.' }),
  VOLEY: entry('volleyball', 'sport', { extra: 'Los saltos repetidos cargan rodillas y tobillos: suma trabajo de pantorrillas y cuádriceps.' }),
  ESCALADA: entry('climbing', 'climbing'),
});

// Implemento del dibujo según el nombre (si la ficha no lo fuerza).
export const detectGear = (name, poseDefault) => {
  if (/MANCUERNA/.test(name)) return 'dumbbell';
  if (/POLEA|SOGA/.test(name) && !/SALTO DE SOGA|TREPADA/.test(name)) return 'cable';
  if (/KETTLEBELL|PESA RUSA/.test(name)) return 'kettlebell';
  if (/MAQUINA/.test(name)) return 'machine';
  if (/BARRA|MULTIPOWER/.test(name)) return 'barbell';
  return poseDefault;
};

export const getExerciseGuide = (name) => {
  const guide = EXERCISE_GUIDES[name];
  if (!guide) return null;
  const family = GUIDE_FAMILIES[guide.family];
  return {
    ...guide,
    steps: family.steps,
    tips: guide.extra ? [guide.extra, ...family.tips] : family.tips,
    mistakes: family.mistakes,
  };
};
