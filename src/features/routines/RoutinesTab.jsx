import { CalendarDays, Copy, Pencil, Plus, Share2, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { EmptyState, IconButton, LoadingState } from '../../components/ui';
import { CATALOG_EXERCISE_NAMES, canonicalExerciseName } from '../../constants/exercises';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { buildShareUrl, createEmptyRoutine, deleteRoutine, duplicateRoutine } from '../../services/routineService';
import { setActiveRoutine } from '../../services/userService';
import { playClick } from '../../utils/audio';
import { WEEK_DAYS } from '../../utils/dates';
import { logError, toUserMessage } from '../../utils/errors';
import { RoutineEditor } from './RoutineEditor';
import { clearRoutineDraft, readRoutineDraft, writeRoutineDraft } from './routineDraftStorage';

const DAY_INITIALS = { lunes: 'L', martes: 'M', 'miércoles': 'X', jueves: 'J', viernes: 'V', 'sábado': 'S', domingo: 'D' };

export const RoutinesTab = () => {
  const { user, routines, routinesLoading } = useAppData();
  const { notify, confirm } = useFeedback();
  // { original, draft, wasRestored }. Se inicializa desde localStorage: volver a la pestaña
  // (o recargar) reabre el editor con el borrador tal como quedó.
  const [editing, setEditing] = useState(() => {
    const stored = readRoutineDraft(user.id);
    return stored ? { original: stored.original, draft: stored.draft, wasRestored: true } : null;
  });

  // Original vigente en un ref: el respaldo del borrador no necesita re-renderizar la pestaña.
  const originalRef = useRef(editing?.original ?? null);

  const openEditor = (routine) => {
    playClick();
    originalRef.current = routine;
    writeRoutineDraft(user.id, { draft: routine, original: routine });
    setEditing({ original: routine, draft: null, wasRestored: false });
  };

  const handleDraftChange = useCallback(
    (draft) => writeRoutineDraft(user.id, { draft, original: originalRef.current }),
    [user.id],
  );

  const closeEditor = () => {
    originalRef.current = null;
    clearRoutineDraft(user.id);
    setEditing(null);
  };
  const [busyId, setBusyId] = useState(null);

  // Los ejercicios personalizados persisten porque se derivan de las rutinas guardadas
  // (antes vivían en un useState y se perdían al recargar).
  const exerciseOptions = useMemo(() => {
    const custom = routines.flatMap((routine) => Object.values(routine.days).flat().map((item) => canonicalExerciseName(item.exercise)));
    return [...new Set([...CATALOG_EXERCISE_NAMES, ...custom])].filter(Boolean).sort();
  }, [routines]);

  const runAction = async (routineId, context, action, successMessage) => {
    playClick();
    setBusyId(routineId);
    try {
      await action();
      if (successMessage) notify(successMessage, 'success');
    } catch (actionError) {
      logError(context, actionError);
      notify(toUserMessage(actionError), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (routine) => {
    const accepted = await confirm({ title: `¿Eliminar "${routine.name}"?`, message: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', tone: 'danger' });
    if (!accepted) return;
    runAction(routine.id, 'routine:delete', async () => {
      // Primero se desactiva para no dejar activeRoutineId apuntando a un doc inexistente.
      if (user.activeRoutineId === routine.id) await setActiveRoutine(user.id, null);
      await deleteRoutine(routine.id);
    }, 'Rutina eliminada');
  };

  const handleShare = (routine) =>
    runAction(routine.id, 'routine:share', async () => {
      const url = buildShareUrl(routine.id);
      // Web Share API nativa en móvil; portapapeles como respaldo en escritorio.
      if (navigator.share) {
        try {
          await navigator.share({ title: routine.name, text: `Importa mi rutina "${routine.name}"`, url });
          return;
        } catch (shareError) {
          if (shareError?.name === 'AbortError') return;
        }
      }
      await navigator.clipboard.writeText(url);
      notify('Enlace copiado al portapapeles', 'success');
    });

  if (editing) {
    return (
      <RoutineEditor
        original={editing.original}
        initialDraft={editing.draft}
        wasRestored={editing.wasRestored}
        exerciseOptions={exerciseOptions}
        onDraftChange={handleDraftChange}
        onClose={closeEditor}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-ghost w-full border-dashed py-4" onClick={() => openEditor(createEmptyRoutine())}>
        <Plus size={18} aria-hidden /> Crear nueva rutina
      </button>

      {routinesLoading ? (
        <LoadingState label="Cargando tus rutinas…" hint="Traemos tus rutinas guardadas y cuál está activa." />
      ) : routines.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No tienes rutinas" description="Crea una o importa la de un amigo con su enlace." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
          {routines.map((routine) => {
            const isActive = user.activeRoutineId === routine.id;
            const isBusy = busyId === routine.id;
            const totalExercises = WEEK_DAYS.reduce((sum, day) => sum + routine.days[day].length, 0);
            return (
              <li key={routine.id} className={`card relative p-4 md:p-5 ${isActive ? 'ring-2 ring-[var(--accent)]' : ''}`} aria-busy={isBusy}>
                {isActive && <span className="badge badge-accent absolute right-3 top-3">Activa</span>}
                <h3 className="pr-16 text-base font-bold md:text-lg">{routine.name}</h3>
                <p className="text-sm text-secondary">{totalExercises} ejercicios por semana</p>

                {/* Vista de la semana: qué días tienen entrenamiento, de un vistazo. */}
                <div className="mt-3 flex gap-1" aria-label="Días con entrenamiento">
                  {WEEK_DAYS.map((day) => {
                    const hasWork = routine.days[day].length > 0;
                    return (
                      <span key={day} title={`${day}: ${routine.days[day].length} ejercicio(s)`}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${hasWork ? 'bg-[var(--accent-soft)] text-accent' : 'surface-2 text-muted'}`}>
                        {DAY_INITIALS[day]}
                      </span>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1">
                  <IconButton label="Editar" icon={Pencil} disabled={isBusy} onClick={() => openEditor(routine)} />
                  <IconButton label="Duplicar" icon={Copy} disabled={isBusy} onClick={() => runAction(routine.id, 'routine:duplicate', () => duplicateRoutine(routine, user), 'Rutina duplicada')} />
                  <IconButton label="Compartir" icon={Share2} disabled={isBusy} onClick={() => handleShare(routine)} />
                  <IconButton label="Eliminar" icon={Trash2} tone="danger" disabled={isBusy} onClick={() => handleDelete(routine)} />
                  {!isActive && (
                    <button type="button" className="btn btn-outline ml-auto" disabled={isBusy}
                      onClick={() => runAction(routine.id, 'routine:activate', () => setActiveRoutine(user.id, routine.id), 'Rutina activada')}>
                      Activar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
