import { ChevronDown, ChevronUp } from 'lucide-react';
import { stepReps } from '../utils/reps';

/*
 * Campo de repeticiones con minibotones +/- (solo escritorio, igual que las flechas nativas del campo Series).
 * Es de texto (no type="number") porque las repeticiones admiten rangos como "8-12".
 * En el celular los botones no se muestran: se usa el teclado numérico.
 */
export const RepsInput = ({ value, onChange, className = '', ...inputProps }) => {
  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    onChange(stepReps(value, event.key === 'ArrowUp' ? 1 : -1));
  };

  return (
    <div className="relative">
      <input
        {...inputProps}
        className={`input ${className} lg:pr-7`}
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="absolute inset-y-1 right-1 hidden w-5 flex-col lg:flex">
        <button type="button" tabIndex={-1} className="reps-step" aria-label="Sumar una repetición" onClick={() => onChange(stepReps(value, 1))}>
          <ChevronUp size={12} aria-hidden />
        </button>
        <button type="button" tabIndex={-1} className="reps-step" aria-label="Restar una repetición" onClick={() => onChange(stepReps(value, -1))}>
          <ChevronDown size={12} aria-hidden />
        </button>
      </div>
    </div>
  );
};
