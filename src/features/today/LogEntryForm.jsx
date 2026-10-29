import { X } from 'lucide-react';
import { useId, useState } from 'react';

// Formulario compacto de registro: peso + reps + series. Prellenado con la última sesión
// para fomentar sobrecarga progresiva (el original solo pedía kg opcional, sin reps).
export const LogEntryForm = ({ defaults, onSubmit, onCancel, showExerciseField = false, exerciseOptions = [] }) => {
  const formId = useId();
  const [values, setValues] = useState({
    exercise: defaults.exercise ?? '',
    weight: defaults.weight ?? '',
    reps: defaults.reps ?? '',
    sets: defaults.sets ?? 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field) => (event) => setValues((previous) => ({ ...previous, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Guard contra doble envío (antes generaba registros duplicados)
    setIsSubmitting(true);
    try {
      await onSubmit({ ...values, muscle: defaults.muscle });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { key: 'weight', label: 'Peso (kg)', inputMode: 'decimal', step: '0.5', placeholder: 'Opcional' },
    { key: 'reps', label: 'Reps', inputMode: 'numeric', step: '1', placeholder: '—' },
    { key: 'sets', label: 'Series', inputMode: 'numeric', step: '1', placeholder: '1' },
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      {showExerciseField && (
        <div>
          <label htmlFor={`${formId}-exercise`} className="mb-1 block text-xs font-bold text-secondary">Ejercicio</label>
          <input id={`${formId}-exercise`} className="input uppercase" list={`${formId}-options`} required value={values.exercise} onChange={update('exercise')} />
          <datalist id={`${formId}-options`}>
            {exerciseOptions.map((option) => <option key={option} value={option} />)}
          </datalist>
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
        <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>Guardar</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} aria-label="Cancelar">
          <X size={18} aria-hidden />
        </button>
      </div>
    </form>
  );
};
