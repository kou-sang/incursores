/*
 * Contenido editorial por ejercicio (pantalla "Ejercicios"). AÚN NO SE USA: define el esquema
 * para cuando se cargue el material. La clave es el nombre canónico del diccionario.
 *
 * {
 *   'FACE PULL': {
 *     images: [{ src: '/media/face-pull-1.webp', alt: 'Posición inicial' }],
 *     videoUrl: 'https://…',                 // embebible (YouTube/Vimeo) o archivo propio
 *     steps: ['Polea a la altura de la cara', '…'],
 *     tips: ['Llevar los codos altos', '…'],
 *     mistakes: ['Tirar con la espalda baja', '…'],
 *     level: 'principiante' | 'intermedio' | 'avanzado',
 *     equipment: ['polea', 'soga'],
 *   },
 * }
 *
 * Opciones de hosting sin costo para más adelante: imágenes livianas (.webp) en /public (las sirve Vercel)
 * y videos embebidos de YouTube (Firebase Storage ya requiere el plan Blaze desde 2026).
 */
export const EXERCISE_CONTENT = Object.freeze({});

export const getExerciseContent = (exerciseName) => EXERCISE_CONTENT[exerciseName] ?? null;
