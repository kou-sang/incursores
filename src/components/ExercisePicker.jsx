import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORY_LABELS, normalizeExerciseName, searchExercises } from '../constants/exercises';

const MAX_LIST_HEIGHT = 288; // px: ~8 filas visibles, el resto con scroll
const MIN_LIST_WIDTH = 260;

/*
 * Combobox accesible: escribir filtra (nombre o alias, sin tildes), la lista hace scroll,
 * flechas/Enter/Escape navegan. La lista se dibuja en un portal con position: fixed para que
 * no la recorten contenedores con overflow (ej. la tabla semanal con scroll horizontal).
 */
export const ExercisePicker = ({ id, value, onChange, extraNames = [], placeholder = 'Buscar ejercicio', ariaLabel = 'Ejercicio', inputClassName = '', required = false }) => {
  const generatedId = useId();
  const inputId = id ?? `${generatedId}-input`;
  const listId = `${generatedId}-list`;
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // Al abrir se muestra la lista completa (con scroll); filtra recién cuando el usuario escribe.
  const [isFiltering, setIsFiltering] = useState(false);
  const [position, setPosition] = useState(null);

  const results = useMemo(
    () => (isOpen ? searchExercises(isFiltering ? value : '', extraNames) : []),
    [isOpen, isFiltering, value, extraNames],
  );
  const normalizedValue = normalizeExerciseName(value);
  const hasExactMatch = results.some(({ entry }) => entry.name === normalizedValue);

  // Posición relativa al viewport; se recalcula con scroll (captura: cualquier contenedor) y resize.
  useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpwards = spaceBelow < 200 && rect.top > spaceBelow;
      setPosition({
        left: Math.min(rect.left, window.innerWidth - Math.max(rect.width, MIN_LIST_WIDTH) - 8),
        width: Math.max(rect.width, MIN_LIST_WIDTH),
        top: openUpwards ? undefined : rect.bottom + 4,
        bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
        maxHeight: Math.min(MAX_LIST_HEIGHT, (openUpwards ? rect.top : spaceBelow) - 16),
      });
    };
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Mantiene visible la opción activa al navegar con flechas.
  // Mantiene visible la opción activa. Se calcula sobre el scroll de la lista (no scrollIntoView,
  // que dentro de un contenedor position: fixed puede no desplazar o mover la página entera).
  useLayoutEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector(`[data-index="${activeIndex}"]`);
    if (!list || !option) return;
    const optionTop = option.offsetTop;
    const optionBottom = optionTop + option.offsetHeight;
    if (optionTop < list.scrollTop) list.scrollTop = optionTop;
    else if (optionBottom > list.scrollTop + list.clientHeight) list.scrollTop = optionBottom - list.clientHeight;
  }, [activeIndex, position]);

  const open = () => {
    if (isOpen) return;
    setIsFiltering(false);
    // Arranca posicionada en el ejercicio actual (si está en la lista) para no perder el contexto.
    const currentIndex = searchExercises('', extraNames).findIndex(({ entry }) => entry.name === normalizeExerciseName(value));
    setActiveIndex(Math.max(currentIndex, 0));
    setIsOpen(true);
  };

  const select = (name) => {
    onChange(name);
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) open();
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && isOpen && results[activeIndex]) {
      event.preventDefault();
      select(results[activeIndex].entry.name);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      setIsOpen(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        id={inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={isOpen && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        autoComplete="off"
        spellCheck={false}
        required={required}
        className={`input uppercase ${inputClassName}`}
        placeholder={placeholder}
        title={value}
        value={value}
        onChange={(event) => {
          onChange(event.target.value.toUpperCase());
          setIsFiltering(true);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={open}
        onClick={open}
        onBlur={() => setIsOpen(false)}
        onKeyDown={handleKeyDown}
      />
      {isOpen && position && createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Ejercicios"
          className="card fixed z-[80] overflow-y-auto overscroll-contain py-1 text-sm shadow-xl"
          style={{ left: position.left, top: position.top, bottom: position.bottom, width: position.width, maxHeight: position.maxHeight }}
          // mousedown (no click): evita que el blur del input cierre la lista antes de seleccionar.
          onMouseDown={(event) => event.preventDefault()}
        >
          {results.map(({ entry, matchedAlias }, index) => (
            <li
              key={entry.name}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={index === activeIndex}
              className={`cursor-pointer px-3 py-2 ${index === activeIndex ? 'surface-2' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(entry.name)}
            >
              <span className="block truncate font-semibold">{entry.name}</span>
              <span className="block truncate text-xs text-muted">
                {CATEGORY_LABELS[entry.category] ?? 'Otros'}
                {matchedAlias && ` · también "${matchedAlias}"`}
                {entry.isCustom && ' · personalizado'}
              </span>
            </li>
          ))}
          {normalizedValue && !hasExactMatch && (
            <li className="border-t divider px-3 py-2 text-xs text-muted" role="presentation">
              Se usará "{normalizedValue}" como ejercicio personalizado; los músculos se estiman automáticamente.
            </li>
          )}
          {results.length === 0 && !normalizedValue && <li className="px-3 py-2 text-muted" role="presentation">Sin ejercicios.</li>}
        </ul>,
        document.body,
      )}
    </>
  );
};
