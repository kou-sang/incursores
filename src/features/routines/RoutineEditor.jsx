import { ArrowLeft, History, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ExercisePicker } from '../../components/ExercisePicker';
import { RepsInput } from '../../components/RepsInput';
import { IconButton, InlineSpinner } from '../../components/ui';
import { getExerciseMeta, inferExerciseMeta, MUSCLE_LABELS, resolveMuscle } from '../../constants/exercises';
import { useAppData } from '../../context/AppDataContext';
import { useFeedback } from '../../context/FeedbackContext';
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery';
import { createEmptyRoutineItem, saveRoutine } from '../../services/routineService';
import { ROUTINE_DEFAULTS } from '../../services/validation';
import { playClick } from '../../utils/audio';
import { WEEK_DAYS } from '../../utils/dates';
import { logError, toUserMessage } from '../../utils/errors';
import { routineSignature } from './routineDraftStorage';

const DRAFT_SAVE_DELAY_MS = 300;

// Copia profunda: el original mutaba objetos compartidos con el estado de Firestore
// (newEx[idx].ejercicio = ...), así que "Cancelar" dejaba cambios fantasma en la lista.
const cloneRoutine = (routine) => ({
  ...routine,
  days: Object.fromEntries(WEEK_DAYS.map((day) => [day, (routine.days[day] ?? []).map((item) => ({ ...item }))])),
});

// Feedback del músculo estimado para ejercicios fuera del diccionario (ya no se elige a mano).
const InferredMuscleHint = ({ exercise }) => {
  if (!exercise.trim() || getExerciseMeta(exercise)) return null;
  const inferred = inferExerciseMeta(exercise);
  const primary = resolveMuscle({ exercise });
  return (
    <p className="text-[11px] leading-tight text-muted">
      {inferred
        ? `Personalizado · músculos estimados${inferred.matchedName ? ` como ${inferred.matchedName}` : ''} (${MUSCLE_LABELS[primary] ?? primary})`
        : 'Personalizado · sin músculo reconocible (cuenta como "Otros")'}
    </p>
  );
};

// Campos de un ejercicio. Series y reps son opcionales (placeholders = valores por defecto). El peso se registra al entrenar.
const RoutineItemFields = ({ item, extraNames, layout, onChange, onRemove }) => {
  const isDesktop = layout === 'desktop';
  const compact = isDesktop ? 'min-h-[38px] px-2 py-1.5 text-sm' : '';
  return (
    <div className={`flex flex-col gap-1.5 ${isDesktop ? '' : 'mb-3'}`}>
      <div className="flex items-center gap-1.5">
        <div className="min-w-0 flex-1">
          <ExercisePicker value={item.exercise} extraNames={extraNames} inputClassName={compact}
            onChange={(exercise) => onChange({ exercise })} />
        </div>
        <IconButton label={`Quitar ${item.exercise || 'ejercicio'}`} icon={Trash2} tone="danger" size={isDesktop ? 16 : 18} onClick={onRemove} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <input aria-label="Series (opcional)" title="Series (opcional, por defecto 3)" className={`input ${compact}`} type="number" inputMode="numeric" min="1" max="20"
          placeholder={isDesktop ? String(ROUTINE_DEFAULTS.sets) : `${ROUTINE_DEFAULTS.sets} series`} value={item.sets} onChange={(event) => onChange({ sets: event.target.value })} />
        <RepsInput aria-label="Repeticiones (opcional)" title="Repeticiones (opcional, por defecto 10)" className={compact} maxLength={12}
          placeholder={isDesktop ? ROUTINE_DEFAULTS.reps : `${ROUTINE_DEFAULTS.reps} reps`} value={item.reps} onChange={(reps) => onChange({ reps })} />
      </div>
      <InferredMuscleHint exercise={item.exercise} />
    </div>
  );
};

// Móvil (sin cambios de estructura): un bloque por día, ejercicios apilados.
const DayListLayout = ({ draft, extraNames, updateItem, addItem, removeItem }) => (
  <div className="space-y-3">
    {WEEK_DAYS.map((day) => (
      <fieldset key={day} className="rounded-xl border divider surface-2 p-3 md:p-4">
        <legend className="sr-only">{day}</legend>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-bold capitalize">{day}</h3>
          <span className="text-xs text-muted">{draft.days[day].length || 'Descanso'}{draft.days[day].length ? ' ejercicio(s)' : ''}</span>
        </div>
        {draft.days[day].map((item) => (
          <RoutineItemFields key={item.id} item={item} extraNames={extraNames} layout="mobile"
            onChange={(patch) => updateItem(day, item.id, patch)} onRemove={() => removeItem(day, item.id)} />
        ))}
        <button type="button" className="btn btn-outline text-sm" onClick={() => addItem(day)}>
          <Plus size={16} aria-hidden /> Ejercicio
        </button>
      </fieldset>
    ))}
  </div>
);

/*
 * Escritorio: matriz días (columnas) × ejercicios (filas). Fila N = N-ésimo ejercicio de cada día,
 * así se compara la semana de un vistazo. Scroll horizontal si la ventana es angosta.
 */
const WeekGridLayout = ({ draft, extraNames, updateItem, addItem, removeItem }) => {
  const rowCount = Math.max(1, ...WEEK_DAYS.map((day) => draft.days[day].length));
  return (
    <div className="overflow-x-auto rounded-xl border divider">
      <table className="w-full min-w-[1180px] table-fixed border-collapse text-left">
        <caption className="sr-only">Ejercicios por día de la semana</caption>
        <colgroup>
          <col className="w-12" />
          {WEEK_DAYS.map((day) => <col key={day} />)}
        </colgroup>
        <thead className="surface-2">
          <tr>
            <th scope="col" className="p-2 text-xs font-bold text-muted">#</th>
            {WEEK_DAYS.map((day) => (
              <th key={day} scope="col" className="border-l divider p-2 align-top">
                <span className="block font-bold capitalize">{day}</span>
                <span className="text-xs font-semibold text-muted">
                  {draft.days[day].length ? `${draft.days[day].length} ejercicio(s)` : 'Descanso'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-t divider">
              <th scope="row" className="p-2 text-center align-top text-xs font-bold text-muted">{rowIndex + 1}</th>
              {WEEK_DAYS.map((day) => {
                const item = draft.days[day][rowIndex];
                return (
                  <td key={day} className="border-l divider p-2 align-top">
                    {item ? (
                      <RoutineItemFields item={item} extraNames={extraNames} layout="desktop"
                        onChange={(patch) => updateItem(day, item.id, patch)} onRemove={() => removeItem(day, item.id)} />
                    ) : (
                      <span className="sr-only">Sin ejercicio</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="border-t divider surface-2">
            <th scope="row" className="p-2"><span className="sr-only">Agregar</span></th>
            {WEEK_DAYS.map((day) => (
              <td key={day} className="border-l divider p-2">
                <button type="button" className="btn btn-outline w-full min-h-[38px] text-xs capitalize" onClick={() => addItem(day)}>
                  <Plus size={14} aria-hidden /> {day}
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

/**
 * `original` = rutina tal como está en Firestore (o vacía si es nueva).
 * `initialDraft` = borrador recuperado de localStorage (si existe). Cada cambio se informa por
 * `onDraftChange` para persistirlo; `onClose(saved)` cierra el editor.
 */
export const RoutineEditor = ({ original, initialDraft, wasRestored, exerciseOptions, onDraftChange, onClose }) => {
  const { user } = useAppData();
  const { notify, confirm } = useFeedback();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [draft, setDraft] = useState(() => cloneRoutine(initialDraft ?? original));
  const [isSaving, setIsSaving] = useState(false);
  const originalSignature = useMemo(() => routineSignature(original), [original]);
  const isDirty = routineSignature(draft) !== originalSignature;

  // Persistencia con debounce: escribir en cada tecla es innecesario.
  const onDraftChangeRef = useRef(onDraftChange);
  useEffect(() => {
    onDraftChangeRef.current = onDraftChange;
  }, [onDraftChange]);
  useEffect(() => {
    const timer = setTimeout(() => onDraftChangeRef.current?.(draft), DRAFT_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft]);

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

  const handleBack = async () => {
    playClick();
    if (isDirty) {
      const accepted = await confirm({
        title: 'Descartar cambios',
        message: 'Tienes cambios sin guardar en esta rutina. ¿Descartarlos?',
        confirmLabel: 'Descartar',
        tone: 'danger',
      });
      if (!accepted) return;
    }
    onClose(false);
  };

  const handleSave = async () => {
    playClick();
    setIsSaving(true);
    try {
      await saveRoutine(draft, user);
      notify('Rutina guardada', 'success');
      onClose(true);
    } catch (saveError) {
      logError('routine:save', saveError);
      notify(toUserMessage(saveError), 'error');
      setIsSaving(false); // El borrador se conserva (antes el spinner global desmontaba el editor)
    }
  };

  const layoutProps = { draft, extraNames: exerciseOptions, updateItem, addItem, removeItem };

  return (
    // En escritorio el editor "rompe" el ancho máximo del layout para que entren 7 columnas cómodas.
    <div className={`card p-4 md:p-6 ${isDesktop ? 'relative left-1/2 w-[min(1440px,calc(100vw-3rem))] -translate-x-1/2' : ''}`}>
      <div className="mb-4 flex items-center gap-2">
        <IconButton label={isDirty ? 'Volver (pide confirmar si hay cambios)' : 'Volver'} icon={ArrowLeft} onClick={handleBack} />
        <h2 className="text-lg font-bold md:text-xl">{draft.id ? 'Editar rutina' : 'Nueva rutina'}</h2>
        {isDirty && <span className="badge badge-accent ml-auto">Sin guardar</span>}
      </div>

      {wasRestored && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl surface-2 p-3 text-sm text-secondary">
          <History size={16} aria-hidden /> Recuperamos el borrador que estabas editando.
        </p>
      )}

      <label htmlFor="routine-name" className="mb-1 block text-xs font-bold text-secondary">Nombre</label>
      <input
        id="routine-name"
        className="input mb-2 font-bold lg:max-w-md"
        maxLength={60}
        placeholder="Ej: Push / Pull / Legs"
        value={draft.name}
        onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
      />
      <p className="mb-5 text-xs text-muted">
        Series y repeticiones son opcionales (por defecto {ROUTINE_DEFAULTS.sets} × {ROUTINE_DEFAULTS.reps}). Los músculos se asignan solos.
      </p>

      {isDesktop ? <WeekGridLayout {...layoutProps} /> : <DayListLayout {...layoutProps} />}

      <div className="sticky bottom-20 mt-5 lg:bottom-4 lg:flex lg:justify-end">
        <button type="button" className="btn btn-primary w-full shadow-lg lg:w-auto lg:min-w-64" disabled={isSaving} onClick={handleSave}>
          {isSaving ? <><InlineSpinner /> Guardando rutina…</> : 'Guardar rutina'}
        </button>
      </div>
    </div>
  );
};
