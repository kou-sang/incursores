import { useEffect, useRef } from 'react';
import { useFeedback } from '../../context/FeedbackContext';
import { duplicateRoutine, fetchRoutine } from '../../services/routineService';
import { logError, toUserMessage } from '../../utils/errors';

const SHARE_PARAM = 'shareRoutine';

const clearShareParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_PARAM);
  window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
};

/**
 * Importa una rutina compartida por enlace, pidiendo confirmación.
 * Antes se importaba automáticamente (cualquier link podía escribir en tu cuenta) y
 * el efecto se re-ejecutaba con cada cambio de currentUser (doble import en StrictMode).
 */
export const useRoutineImport = (user, onImported) => {
  const { confirm, notify } = useFeedback();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!user || handledRef.current) return;
    const sharedId = new URLSearchParams(window.location.search).get(SHARE_PARAM);
    if (!sharedId) return;
    handledRef.current = true;

    const runImport = async () => {
      try {
        const routine = await fetchRoutine(sharedId);
        if (routine.authorId === user.id) {
          notify('Esta rutina ya es tuya', 'info');
          return;
        }
        const accepted = await confirm({
          title: 'Importar rutina',
          message: `¿Agregar "${routine.name}" de ${routine.authorName || 'otro usuario'} a tus rutinas?`,
          confirmLabel: 'Importar',
        });
        if (!accepted) return;
        await duplicateRoutine(routine, user, '(Importada)');
        notify(`"${routine.name}" importada`, 'success');
        onImported?.();
      } catch (importError) {
        logError('routine:import', importError);
        notify(toUserMessage(importError, 'No se pudo importar la rutina.'), 'error');
      } finally {
        clearShareParam();
      }
    };
    runImport();
  }, [user, confirm, notify, onImported]);
};
