// Textos del botón (i) de cada gráfico de Analíticas. Separados de los .jsx para editarlos sin tocar la lógica.

export const CHART_INFO = Object.freeze({
  kpis: {
    title: 'Indicadores',
    how: [
      'Días entrenados: cantidad de días distintos con al menos un ejercicio registrado dentro del rango (registrar 10 ejercicios el mismo día cuenta como 1 día).',
      'Tonelaje por semana: suma de series × repeticiones × kg de cada registro, dividida por las semanas del rango. Los registros sin peso o sin repeticiones (peso corporal, cardio) no suman.',
      'Récords: registros que superaron tu mejor 1RM estimado de ese ejercicio en el momento de cargarlos.',
      'Racha: semanas seguidas (lunes a domingo) con al menos un entrenamiento. La semana en curso no la corta hasta que termina.',
      'Con "Promedio de la selección", cada indicador se divide por la cantidad de perfiles elegidos.',
    ],
    read: [
      'Los días entrenados miden constancia; el tonelaje mide carga total; los récords miden progreso de fuerza.',
      'Subir tonelaje sin sumar récords suele indicar más volumen con el mismo peso: está bien en fases de volumen, pero a la larga el peso también debería subir.',
    ],
    tip: 'Compara rangos iguales (por ejemplo "Últimos 30 días" hoy contra dentro de un mes) en vez de mirar el número aislado.',
  },
  consistency: {
    title: 'Consistencia',
    how: [
      'Toma los ejercicios que pasan los filtros (perfiles, fechas, categorías y músculos) y los ordena por fecha y hora.',
      'Cada ejercicio registrado suma 1 al total acumulado: la línea empieza en 0 al inicio del rango y termina en el total de ejercicios del período.',
      'Con "Unificar ejercicios del día" activado, cada día es un solo punto (ubicado a la hora del último ejercicio de ese día). Desactivado, cada ejercicio es un punto con su hora y minuto.',
      'La estrella marca los días (o ejercicios) en los que hubo un récord personal de 1RM estimado.',
      'La línea se suaviza entre puntos para leer la tendencia; los valores exactos están en los puntos.',
    ],
    read: [
      'Pendiente pronunciada = entrenamiento frecuente. Tramo plano = días sin entrenar.',
      'Una línea recta y pareja es más valiosa que escalones grandes separados por mesetas largas: la constancia es lo que más se relaciona con el progreso.',
      'Al comparar perfiles, mira la inclinación en las últimas semanas, no solo dónde termina cada línea.',
      'Si las estrellas aparecen en tramos de mucha pendiente, la constancia te está dando resultados.',
    ],
    tip: 'Filtra por una categoría (por ejemplo Piernas) para ver si entrenas ese grupo con la misma regularidad que el resto.',
  },
  muscleMapRecency: {
    title: 'Mapa muscular: Recuperación',
    how: [
      'Para cada músculo busca el último ejercicio que lo trabajó al menos un 15% (según el porcentaje de estímulo del ejercicio en la biblioteca).',
      'Pinta el músculo según los días transcurridos desde entonces: verde = hoy, amarillo ≈ 14 días, rojo = 30 días o más (o nunca).',
      'Siempre usa como mínimo los últimos 30 días de historia, aunque el rango elegido sea más corto, para no marcar como "nunca" algo entrenado hace 10 días.',
    ],
    read: [
      'Verde intenso: entrenado hace muy poco; probablemente todavía se está recuperando.',
      'Amarillo/naranja: buena ventana para volver a entrenarlo.',
      'Rojo: músculo descuidado. Si se repite semana a semana, falta un ejercicio para él en tu rutina.',
    ],
    tip: 'Toca un músculo rojo para ver qué ejercicios lo trabajaron por última vez y busca alternativas en la pestaña Ejercicios.',
  },
  muscleMapStimulus: {
    title: 'Mapa muscular: Estímulo',
    how: [
      'Cada serie se reparte entre los músculos según el porcentaje del ejercicio. Ejemplo: 3 series de press banca (40% pecho medio) suman 1,2 series efectivas al pecho medio.',
      'Se suman todas las series efectivas del rango y se dividen por la cantidad de semanas: el resultado es el promedio semanal.',
      'El color va por escalones: sin estímulo, menos de 3, 3–6, 6–10, 10–20 y más de 20 series efectivas por semana.',
    ],
    read: [
      'La franja de 10–20 series semanales por músculo es el rango orientativo para ganar masa muscular en la mayoría de las personas.',
      'Por debajo de 6 suele alcanzar para mantener, no para crecer.',
      'Muy por encima de 20 puede costar recuperarse, salvo que tengas mucha experiencia.',
    ],
    tip: 'Busca un mapa parejo: si un lado (frente o espalda) está mucho más verde que el otro, equilibra empujes y tirones.',
  },
  muscleSets: {
    title: 'Series efectivas por músculo',
    how: [
      'Es el mismo cálculo del mapa en modo Estímulo, pero en barras: series × porcentaje de participación de cada músculo, promediado por semana.',
      'Solo muestra los músculos que pasan el filtro de músculos individuales.',
      'Con "Promedio de la selección" se divide por la cantidad de perfiles elegidos.',
    ],
    read: [
      'La franja verde marca 10–20 series semanales. Barras dentro de la franja: volumen adecuado para crecer.',
      'Barras cortas en músculos grandes (dorsal, glúteo mayor, cuádriceps) suelen ser la mayor oportunidad de mejora.',
      'Los músculos pequeños (braquial, manguito rotador, tibial) reciben mucho trabajo indirecto; es normal que queden bajos.',
    ],
    tip: 'Toca una barra para abrir el detalle semanal de ese músculo y ver qué ejercicios le aportan.',
  },
  muscleDetail: {
    title: 'Detalle del músculo',
    how: [
      'Series efectivas del músculo semana a semana (lunes a domingo), por perfil, con todos los filtros aplicados.',
      'La primera semana puede quedar incompleta si el rango empieza a mitad de semana, y la última está en curso.',
      'La lista de ejercicios muestra cuántas series efectivas aportó cada uno al músculo y qué porcentaje del total representan.',
    ],
    read: [
      'Barras estables dentro de la franja verde = estímulo sostenido.',
      'Semanas en cero entre semanas altas indican que ese músculo depende de un solo día de la rutina.',
    ],
    tip: 'Si un único ejercicio aporta más del 70%, suma una variante con otro ángulo para trabajar el músculo de forma más completa.',
  },
  strength: {
    title: 'Progresión de fuerza',
    how: [
      'Para cada registro con peso calcula el 1RM estimado (fórmula de Epley): kg × (1 + repeticiones ÷ 30). Por encima de 12 repeticiones se usa 12, porque la fórmula pierde precisión.',
      'Así 80 kg × 5 y 70 kg × 10 se comparan en una misma escala (≈ 93 kg y ≈ 93 kg).',
      'Con "Unificar ejercicios del día" se grafica el mejor valor de cada día; desactivado, cada registro con su hora.',
      'El punto con anillo marca un récord personal en el momento en que se registró.',
      'El eje X es tiempo real: dos semanas sin entrenar ocupan más espacio que dos días.',
    ],
    read: [
      'Una tendencia ascendente sostenida es progreso real de fuerza, aunque haya días peores.',
      'Una meseta de 3–4 semanas sugiere cambiar el estímulo: más series, otro rango de repeticiones o una semana de descarga.',
      'Las caídas puntuales suelen deberse a cansancio o mal descanso, no a pérdida de fuerza.',
    ],
    tip: 'El 1RM estimado es más fiable entre 3 y 8 repeticiones. Para seguir tu fuerza, registra al menos una serie pesada en ese rango.',
  },
  weeklyVolume: {
    title: 'Tonelaje semanal',
    how: [
      'Suma series × repeticiones × kg de todos los ejercicios que pasan los filtros, agrupados por semana (lunes a domingo).',
      'Los registros sin peso o sin repeticiones no suman (peso corporal, cardio, baile).',
      'La primera semana puede estar incompleta si el rango empieza a mitad de semana, y la última está en curso: no las compares con semanas completas.',
    ],
    read: [
      'Un aumento gradual (5–10% por semana) es una progresión sana.',
      'Saltos bruscos aumentan el riesgo de sobrecarga; caídas grandes suelen coincidir con semanas de descanso o viajes.',
      'El tonelaje no distingue intensidad: 100 repeticiones livianas pueden igualar a 20 pesadas. Combínalo con Progresión de fuerza.',
    ],
    tip: 'Planifica una semana de descarga (alrededor de la mitad del tonelaje) cada 4–6 semanas de subida.',
  },
});
