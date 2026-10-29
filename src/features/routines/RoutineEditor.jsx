import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { IconButton } from '../../components/ui';
import { EXERCISE_CATALOG, MUSCLES, normalizeExerciseName } from '../../constants/exercises';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { createEmptyRoutineItem, saveRoutine } from '../../services/routineService';
import { playClick } from '../../utils/audio';
import { WEEK_DAYS } from '../../utils/dates';
import { logError, toUserMessage } from '../../utils/errors';

// Copia profunda: el original mutaba objetos compartidos con el estado de Firestore
// (newEx[idx].ejercicio = ...), así que "Cancelar" dejaba cambios fantasma en la lista.
const cloneRoutine = (routine) => ({
  ...routine,
  days: Object.fromEntries(WEEK_DAYS.map((day) => [day, (routine.days[day] ?? []).map((item) => ({ ...item }))])),
});

export const RoutineEditor = ({ initialRoutine, exerciseOptions, onClose }) => {
  const { user } = useAppData();
  const { notify } = useFeedback();
  const listId = useId();
  const [draft, setDraft] = useState(() => cloneRoutine(initialRoutine));
  const [isSaving, setIsSaving] = useState(false);

  const updateDay = (day, updater) =>
    setDraft((previous) => ({ ...previous, days: { ...previous.days, [day]: updater(previous.days[day]) } }));

  const updateItem = (day, itemId, patch) =>
    updateDay(day, (items) => items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));

  const addItem = (day) => {
    playClick();
    updateDay(day, (items) => [...items, createEmptyRoutineItem()]);
  };

  const removeItem = (day, itemId) => {
    playClick();
    updateDay(day, (items) => items.filter((item) => item.id !== itemId));
  };

  const handleSave = async () => {
    playClick();
    setIsSaving(true);
    try {
      await saveRoutine(draft, user);
      notify('Rutina guardada', 'success');
      onClose();
    } catch (saveError) {
      logError('routine:save', saveError);
      notify(toUserMessage(saveError), 'error');
      setIsSaving(false); // El borrador se conserva (antes el spinner global desmontaba el editor)
    }
  };

  return (
    <div className="card p-4 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <IconButton label="Volver sin guardar" icon={ArrowLeft} onClick={onClose} />
        <h2 className="text-lg font-bold md:text-xl">{draft.id ? 'Editar rutina' : 'Nueva rutina'}</h2>
      </div>

      <label htmlFor="routine-name" className="mb-1 block text-xs font-bold text-secondary">Nombre</label>
      <input
        id="routine-name"
        className="input mb-5 font-bold"
        maxLength={60}
        placeholder="Ej: Push / Pull / Legs"
        value={draft.name}
        onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
      />

      <div className="space-y-3">
        {WEEK_DAYS.map((day) => (
          <fieldset key={day} className="rounded-xl border divider surface-2 p-3 md:p-4">
            <legend className="sr-only">{day}</legend>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-bold capitalize">{day}</h3>
              <span className="text-xs text-muted">{draft.days[day].length || 'Descanso'}{draft.days[day].length ? ' ejercicio(s)' : ''}</span>
            </div>

            {draft.days[day].map((item) => {
              const isKnown = Boolean(EXERCISE_CATALOG[normalizeExerciseName(item.exercise)]);
              return (
                <div key={item.id} className="mb-3 grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_5rem_6rem_auto]">
                  <input
                    aria-label="Ejercicio"
                    className="input col-span-2 uppercase sm:col-span-1"
                    list={listId}
                    placeholder="Ejercicio"
                    value={item.exercise}
                    onChange={(event) => updateItem(day, item.id, { exercise: event.target.value.toUpperCase() })}
                  />
                  <div className="col-span-2 grid grid-cols-[1fr_1fr_auto] gap-2 sm:contents">
                    <input aria-label="Series" className="input" type="number" inputMode="numeric" min="1" max="20" placeholder="Series"
                      value={item.sets} onChange={(event) => updateItem(day, item.id, { sets: event.target.value })} />
                    <input aria-label="Repeticiones" className="input" maxLength={12} placeholder="Reps (8-12)"
                      value={item.reps} onChange={(event) => updateItem(day, item.id, { reps: event.target.value })} />
                    <IconButton label={`Quitar ${item.exercise || 'ejercicio'}`} icon={Trash2} tone="danger" onClick={() => removeItem(day, item.id)} />
                  </div>
                  {/* Ejercicio personalizado: se pide el músculo para que cuente en las analíticas (antes caía en "otros"). */}
                  {item.exercise.trim() && !isKnown && (
                    <select aria-label="Músculo principal" className="input col-span-2 sm:col-span-4" value={item.muscle ?? ''}
                      onChange={(event) => updateItem(day, item.id, { muscle: event.target.value || null })}>
                      <option value="">Músculo principal (ejercicio personalizado)…</option>
                      {MUSCLES.map((muscle) => <option key={muscle.id} value={muscle.id}>{muscle.label}</option>)}
                    </select>
                  )}
                </div>
              );
            })}

            <button type="button" className="btn btn-outline text-sm" onClick={() => addItem(day)}>
              <Plus size={16} aria-hidden /> Ejercicio
            </button>
          </fieldset>
        ))}
      </div>

      <div className="sticky bottom-20 mt-5 md:bottom-4">
        <button type="button" className="btn btn-primary w-full shadow-lg" disabled={isSaving} onClick={handleSave}>
          {isSaving ? 'Guardando…' : 'Guardar rutina'}
        </button>
      </div>
      <datalist id={listId}>{exerciseOptions.map((name) => <option key={name} value={name} />)}</datalist>
    </div>
  );
};
