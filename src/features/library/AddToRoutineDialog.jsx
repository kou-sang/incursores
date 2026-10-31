import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RepsInput } from '../../components/RepsInput';
import { FieldLabel, IconButton, InlineSpinner } from '../../components/ui';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { addExerciseToRoutine } from '../../services/routineService';
import { ROUTINE_DEFAULTS } from '../../services/validation';
import { playClick } from '../../utils/audio';
import { getDayKey, WEEK_DAYS } from '../../utils/dates';
import { logError, toUserMessage, ValidationError } from '../../utils/errors';
import { readRoutineDraft } from '../routines/routineDraftStorage';

/*
 * Diálogo "Añadir a rutina": elige rutina, día, series y repeticiones (ambas opcionales: 3 × 10 por defecto).
 * No pide kilos: el peso se registra al entrenar.
 */
export const AddToRoutineDialog = ({ exerciseName, onClose }) => {
  const { user, routines } = useAppData();
  const { notify } = useFeedback();
  const [form, setForm] = useState(() => ({
    routineId: routines.find((routine) => routine.id === user.activeRoutineId)?.id ?? routines[0]?.id ?? '',
    day: getDayKey(),
    sets: '',
    reps: '',
  }));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const routine = routines.find((item) => item.id === form.routineId);
    if (!routine) return;
    playClick();
    setIsSaving(true);
    try {
      // Si esa misma rutina está abierta en el editor, guardar desde aquí y luego desde el editor pisaría este cambio.
      if (readRoutineDraft(user.id)?.draft?.id === routine.id) {
        throw new ValidationError('Esa rutina está abierta en el editor de Rutinas. Guárdala o descártala primero.');
      }
      await addExerciseToRoutine(routine, { day: form.day, exercise: exerciseName, sets: form.sets, reps: form.reps }, user);
      notify(`${exerciseName} añadido a "${routine.name}" (${form.day})`, 'success');
      onClose();
    } catch (saveError) {
      logError('library:add-to-routine', saveError);
      notify(toUserMessage(saveError), 'error');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="add-to-routine-title" className="dialog-panel card w-full max-w-sm p-5" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 id="add-to-routine-title" className="text-lg font-bold">Añadir a rutina</h2>
            <p className="truncate text-sm text-secondary">{exerciseName}</p>
          </div>
          <IconButton label="Cerrar" icon={X} onClick={onClose} />
        </div>

        {routines.length === 0 ? (
          <p className="rounded-xl surface-2 p-3 text-sm text-secondary">Todavía no tienes rutinas. Crea una en la pestaña Rutinas y vuelve aquí.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <FieldLabel htmlFor="add-routine">Rutina</FieldLabel>
              <select id="add-routine" className="input" value={form.routineId} onChange={(event) => setForm({ ...form, routineId: event.target.value })}>
                {routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="add-day">Día</FieldLabel>
              <select id="add-day" className="input capitalize" value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })}>
                {WEEK_DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="add-sets">Series (opcional)</FieldLabel>
                <input id="add-sets" className="input" type="number" inputMode="numeric" min="1" max="20" placeholder={String(ROUTINE_DEFAULTS.sets)}
                  value={form.sets} onChange={(event) => setForm({ ...form, sets: event.target.value })} />
              </div>
              <div>
                <FieldLabel htmlFor="add-reps">Repeticiones (opcional)</FieldLabel>
                <RepsInput id="add-reps" maxLength={12} placeholder={ROUTINE_DEFAULTS.reps} value={form.reps} onChange={(reps) => setForm({ ...form, reps })} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary flex-1" disabled={isSaving || !form.routineId}>
                {isSaving ? <><InlineSpinner /> Añadiendo…</> : <><Plus size={16} aria-hidden /> Añadir</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
