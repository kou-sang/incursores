import { X } from 'lucide-react';
import { useId, useState } from 'react';
import { ExercisePicker } from '../../components/ExercisePicker';
import { InlineSpinner } from '../../components/ui';

/*
 * Registro de un ejercicio: kg, reps y series son OPCIONALES.
 * Llegan prellenados (rutina → última sesión) y, si el usuario los borra, se usa el valor sugerido
 * que se muestra como placeholder. El original pedía kg y no reps → los PR no eran comparables.
 */
export const LogEntryForm = ({ defaults, onSubmit, onCancel, showExerciseField = false, exerciseOptions = [] }) => {
  const formId = useId();
  const [values, setValues] = useState({
    exercise: defaults.exercise ?? '',
    weight: defaults.weight ?? '',
    reps: defaults.reps ?? '',
    sets: defaults.sets ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (event) => setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Guard contra doble envío (antes generaba registros duplicados)
    setIsSubmitting(true);
    try {
      // Vacío = valor sugerido de la rutina (series) o "sin dato" (kg/reps): nada es obligatorio.
      await onSubmit({
        ...values,
        sets: values.sets === '' ? defaults.fallbackSets ?? '' : values.sets,
        muscle: defaults.muscle,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { key: 'weight', label: 'Peso (kg)', inputMode: 'decimal', step: '0.5', placeholder: 'Opcional' },
    { key: 'reps', label: 'Reps', inputMode: 'numeric', step: '1', placeholder: 'Opcional' },
    { key: 'sets', label: 'Series', inputMode: 'numeric', step: '1', placeholder: String(defaults.fallbackSets ?? 1) },
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      {showExerciseField && (
        <div>
          <label htmlFor={`${formId}-exercise`} className="mb-1 block text-xs font-bold text-secondary">Ejercicio</label>
          <ExercisePicker id={`${formId}-exercise`} required value={values.exercise} extraNames={exerciseOptions}
            onChange={(exercise) => setValues((previous) => ({ ...previous, exercise }))} />
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={`${formId}-${field.key}`} className="mb-1 block text-xs font-bold text-secondary">{field.label}</label>
            <input
              id={`${formId}-${field.key}`}
              type="number"
              min="0"
              className="input"
              inputMode={field.inputMode}
              step={field.step}
              placeholder={field.placeholder}
              value={values[field.key]}
              onChange={update(field.key)}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
          {isSubmitting ? <><InlineSpinner /> Guardando…</> : 'Guardar'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} aria-label="Cancelar">
          <X size={18} aria-hidden />
        </button>
      </div>
    </form>
  );
};
